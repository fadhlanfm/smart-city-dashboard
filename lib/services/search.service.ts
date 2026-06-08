import { esClient } from '../db/elasticsearch';
import { getCache, setCache } from './cache.service';
import { makeCacheKey } from '../utils/cache-key';
import { SearchParamsDTO } from '../validators/search.schema';
import { SearchResult } from '@/types';
import { SearchHit } from '../types';

export async function searchAssets(params: SearchParamsDTO): Promise<SearchResult[]> {
  const cacheKey = makeCacheKey('search:assets', params as Record<string, unknown>);
  const cached = await getCache<SearchResult[]>(cacheKey);
  if (cached) return cached;

  const must: Record<string, unknown>[] = [
    {
      multi_match: {
        query: params.q,
        fields: ['name^3', 'address', 'tags', 'district'],
        fuzziness: 'AUTO',
      },
    },
  ];

  const filter: Record<string, unknown>[] = [];
  if (params.districtId) filter.push({ term: { 'districtId.keyword': params.districtId } });
  if (params.type) filter.push({ term: { 'type.keyword': params.type } });
  if (params.status) filter.push({ term: { 'status.keyword': params.status } });

  try {
    const response = await esClient.search({
      index: 'smart_city_assets',
      size: params.size,
      body: {
        query: {
          bool: {
            must,
            filter,
          },
        },
      },
    });

    const hits = response.hits.hits;
    const results: SearchResult[] = hits.map(hit => {
      const source = hit._source as SearchHit['_source'];
      return {
        id: hit._id || '',
        name: source.name,
        type: source.type,
        status: source.status,
        district: source.district,
        districtId: source.districtId,
        score: hit._score || 0,
        geometry: source.location ? {
          type: 'Point',
          coordinates: [source.location.lon, source.location.lat]
        } : null,
      };
    });

    await setCache(cacheKey, results, 15);
    return results;
  } catch (error) {
    console.error('Elasticsearch search failed:', error);
    return []; // Return empty array on failure as fallback
  }
}
