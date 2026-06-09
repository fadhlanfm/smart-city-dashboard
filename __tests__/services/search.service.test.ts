import { searchAssets } from '@/lib/services/search.service';

jest.mock('@/lib/mock-data', () => ({
  mockAssets: [
    {
      id: 'a1',
      name: 'Central Park',
      type: 'PARK',
      status: 'ACTIVE',
      districtName: 'Downtown',
      districtId: 'd1',
      location: { type: 'Point', coordinates: [107.6, -6.9] }
    },
    {
      id: 'a2',
      name: 'Main Street',
      type: 'ROAD',
      status: 'ACTIVE',
      districtName: 'Uptown',
      districtId: 'd2',
      location: { type: 'Point', coordinates: [107.61, -6.91] }
    }
  ]
}));

describe('Search Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return matched assets by name', async () => {
    const result = await searchAssets({ q: 'park', size: 10 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a1');
  });

  it('should return matched assets by district name', async () => {
    const result = await searchAssets({ q: 'uptown', size: 10 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a2');
  });

  it('should return empty array if no matches', async () => {
    const result = await searchAssets({ q: 'nowhere', size: 10 });
    expect(result).toHaveLength(0);
  });
});
