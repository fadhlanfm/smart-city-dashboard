import { searchAssets } from '@/lib/services/search.service';
import { esClient } from '@/lib/db/elasticsearch';

jest.mock('@/lib/db/elasticsearch', () => ({
  esClient: {
    search: jest.fn(),
  },
}));

jest.mock('@/lib/services/cache.service', () => ({
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(null),
}));

describe('Search Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should construct multimatch query and return mapped results', async () => {
    (esClient.search as jest.Mock).mockResolvedValueOnce({
      hits: {
        hits: [
          {
            _id: '1',
            _score: 1.5,
            _source: {
              name: 'Central Park',
              type: 'PARK',
              district: 'Downtown',
              districtId: 'd1',
              status: 'ACTIVE',
              location: { lat: 0, lon: 0 },
            },
          },
        ],
      },
    });

    const result = await searchAssets({ q: 'park', size: 10 });
    
    expect(esClient.search).toHaveBeenCalledWith(expect.objectContaining({
      index: 'smart_city_assets',
      body: expect.objectContaining({
        query: expect.objectContaining({
          bool: expect.objectContaining({
            must: expect.any(Object),
          }),
        }),
      }),
    }));

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Central Park');
  });

  it('should handle ES error and return empty array', async () => {
    console.error = jest.fn(); // Suppress expected error log
    (esClient.search as jest.Mock).mockRejectedValueOnce(new Error('ES connection failed'));
    
    const result = await searchAssets({ q: 'park' });
    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('Elasticsearch search failed:', expect.any(Error));
  });

  it('should return empty array if no hits', async () => {
    (esClient.search as jest.Mock).mockResolvedValue({ hits: { hits: [] } });
    const result = await searchAssets({ q: 'park' });
    expect(result).toEqual([]);
  });

  it('should return cached result if available', async () => {
    const { getCache } = require('@/lib/services/cache.service');
    const cachedData = [{ id: 'cached' }];
    (getCache as jest.Mock).mockResolvedValueOnce(cachedData);

    const result = await searchAssets({ q: 'park' });
    expect(result[0].id).toBe('cached');
    expect(esClient.search).not.toHaveBeenCalled();
  });
});
