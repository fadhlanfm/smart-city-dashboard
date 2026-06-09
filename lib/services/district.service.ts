import { prisma } from '../db/prisma';
import { getCache, setCache } from './cache.service';
import { District } from '@prisma/client';
import { GeoJSONFeatureCollection } from '../types';

export type DistrictSummary = Pick<District, 'id' | 'name' | 'code' | 'totalAssets' | 'activeIncidents' | 'coverageScore' | 'updatedAt' | 'createdAt'>;

export async function getAllDistricts(): Promise<DistrictSummary[]> {
  const { mockDistricts } = await import('@/lib/mock-data');
  return mockDistricts as unknown as DistrictSummary[];
}

export async function getDistrictGeoJSON(): Promise<GeoJSONFeatureCollection> {
  const { mockDistricts } = await import('@/lib/mock-data');

  const featureCollection: GeoJSONFeatureCollection = {
    type: 'FeatureCollection',
    features: mockDistricts.map(d => ({
      type: 'Feature',
      geometry: (d as any).geometry,
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

  return featureCollection;
}
