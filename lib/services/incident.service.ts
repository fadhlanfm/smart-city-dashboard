import { Incident, connectMongoDB } from '../db/mongoose';
import { getCache, setCache } from './cache.service';
import { makeCacheKey } from '../utils/cache-key';
import { FilterParamsDTO } from '../validators/filter.schema';
import { GeoJSONFeatureCollection, IncidentDocument, GeoJSONGeometry } from '../types';
import { FilterQuery } from 'mongoose';

export async function getIncidentGeoJSON(filters: Record<string, string> = {}): Promise<GeoJSONFeatureCollection> {
  const { mockIncidents } = await import('@/lib/mock-data');

  const featureCollection: GeoJSONFeatureCollection = {
    type: 'FeatureCollection',
    features: mockIncidents.map((inc: any) => ({
      type: 'Feature',
      geometry: inc.location as GeoJSONGeometry,
      properties: {
        id: inc.id,
        type: inc.type,
        severity: inc.severity,
        status: inc.status,
        description: inc.description,
        createdAt: inc.createdAt,
      },
    })),
  };

  return featureCollection;
}
