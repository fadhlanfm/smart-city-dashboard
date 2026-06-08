import { Incident, connectMongoDB } from '../db/mongoose';
import { getCache, setCache } from './cache.service';
import { makeCacheKey } from '../utils/cache-key';
import { FilterParamsDTO } from '../validators/filter.schema';
import { GeoJSONFeatureCollection, IncidentDocument, GeoJSONGeometry } from '../types';
import { FilterQuery } from 'mongoose';

export async function getIncidentGeoJSON(filters: Record<string, string> = {}): Promise<GeoJSONFeatureCollection> {
  const cacheKey = makeCacheKey('incidents:geojson', filters as Record<string, unknown>);
  const cached = await getCache<GeoJSONFeatureCollection>(cacheKey);
  if (cached) return cached;

  await connectMongoDB();

  const query: FilterQuery<typeof Incident> = {};
  if (filters.status) query.status = filters.status;
  if (filters.severity) query.severity = filters.severity;
  if (filters.type) query.type = filters.type;

  const incidents = await Incident.find(query).lean();

  const featureCollection: GeoJSONFeatureCollection = {
    type: 'FeatureCollection',
    features: incidents.map((inc: Record<string, unknown>) => ({
      type: 'Feature',
      geometry: inc.location as GeoJSONGeometry,
      properties: {
        id: (inc._id as { toString: () => string }).toString(),
        type: inc.type,
        severity: inc.severity,
        status: inc.status,
        description: inc.description,
        createdAt: inc.createdAt,
      },
    })),
  };

  await setCache(cacheKey, featureCollection, 60);
  return featureCollection;
}
