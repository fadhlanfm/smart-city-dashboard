import { esClient } from '../db/elasticsearch';
import { getCache, setCache } from './cache.service';
import { makeCacheKey } from '../utils/cache-key';
import { SearchParamsDTO } from '../validators/search.schema';
import { SearchResult } from '@/types';
import { SearchHit } from '../types';

export async function searchAssets(params: SearchParamsDTO): Promise<SearchResult[]> {
  const { mockAssets } = await import('@/lib/mock-data');
  const query = params.q.toLowerCase();

  const results = mockAssets
    .filter(a => a.name.toLowerCase().includes(query) || a.districtName.toLowerCase().includes(query))
    .slice(0, params.size || 10)
    .map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      status: a.status,
      district: a.districtName,
      districtId: a.districtId,
      score: 1,
      geometry: a.location,
    }));

  return results;
}
