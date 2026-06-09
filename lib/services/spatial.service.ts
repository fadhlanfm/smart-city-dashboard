import { prisma } from '../db/prisma';
import { GeoJSONGeometry } from '../types';

function generateCircle(lon: number, lat: number, radiusMeters: number) {
  const points = [];
  const R = 6378137;
  for (let i = 0; i <= 32; i++) {
    const angle = (i * 360 / 32) * (Math.PI / 180);
    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);
    const plat = lat + (dy / R) * (180 / Math.PI);
    const plon = lon + (dx / R) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
    points.push([plon, plat]);
  }
  return { type: 'Polygon', coordinates: [points] };
}

export async function analyzeBuffer(assetId: string, radiusMeters: number) {
  const { mockAssets } = await import('@/lib/mock-data');
  const target = mockAssets.find(a => a.id === assetId);
  
  if (!target) return null;
  const [lon, lat] = target.location.coordinates;
  const bufferGeoJSON = generateCircle(lon, lat, radiusMeters);

  // Find other mock assets within rough bounding box
  const affectedAssets = mockAssets.filter(a => {
    if (a.id === assetId) return false;
    const [alon, alat] = a.location.coordinates;
    const distSq = Math.pow((alon - lon) * 111320, 2) + Math.pow((alat - lat) * 110574, 2);
    return distSq <= Math.pow(radiusMeters, 2);
  }).map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    distance: Math.round(Math.sqrt(Math.pow((a.location.coordinates[0] - lon) * 111320, 2) + Math.pow((a.location.coordinates[1] - lat) * 110574, 2)))
  }));

  return {
    bufferGeoJSON: {
      type: 'Feature',
      geometry: bufferGeoJSON,
      properties: { radius: radiusMeters }
    },
    affectedAssets
  };
}

export async function checkIntersection(lon: number, lat: number) {
  const { mockDistricts } = await import('@/lib/mock-data');
  
  // Return a random district for mock intersection
  const district = mockDistricts[Math.floor(Math.random() * mockDistricts.length)];

  return {
    pointGeoJSON: {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {}
    },
    districts: [{ id: district.id, name: district.name, code: district.code || 'BDG' }]
  };
}
