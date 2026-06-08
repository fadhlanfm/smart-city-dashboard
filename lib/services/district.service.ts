import { prisma } from '../db/prisma';
import { getCache, setCache } from './cache.service';
import { District } from '@prisma/client';
import { GeoJSONFeatureCollection } from '../types';

export type DistrictSummary = Pick<District, 'id' | 'name' | 'code' | 'totalAssets' | 'activeIncidents' | 'coverageScore' | 'updatedAt' | 'createdAt'>;

export async function getAllDistricts(): Promise<DistrictSummary[]> {
  const cacheKey = 'districts:all';
  const cached = await getCache<DistrictSummary[]>(cacheKey);
  if (cached) return cached;

  const districts = await prisma.district.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      totalAssets: true,
      activeIncidents: true,
      coverageScore: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  });

  await setCache(cacheKey, districts, 300);
  return districts;
}

export async function getDistrictGeoJSON(): Promise<GeoJSONFeatureCollection> {
  const cacheKey = 'districts:geojson';
  const cached = await getCache<GeoJSONFeatureCollection>(cacheKey);
  if (cached) return cached;

  const districts = await prisma.$queryRaw<({ id: string, name: string, code: string, totalAssets: number, activeIncidents: number, coverageScore: number, geometry: any })[]>`
    SELECT id, name, code, "totalAssets", "activeIncidents", "coverageScore", ST_AsGeoJSON(geometry)::json as geometry
    FROM "District"
  `;

  const featureCollection: GeoJSONFeatureCollection = {
    type: 'FeatureCollection',
    features: districts.map(d => ({
      type: 'Feature',
      geometry: d.geometry,
      properties: {
        id: d.id,
        name: d.name,
        code: d.code,
        totalAssets: d.totalAssets,
        activeIncidents: d.activeIncidents,
        coverageScore: d.coverageScore,
      },
    })),
  };

  await setCache(cacheKey, featureCollection, 300);
  return featureCollection;
}
