import { analyzeBuffer, checkIntersection } from '@/lib/services/spatial.service';

jest.mock('@/lib/mock-data', () => ({
  mockAssets: [
    {
      id: 'a1',
      name: 'Central Park',
      location: { coordinates: [107.6, -6.9] },
      type: 'PARK'
    },
    {
      id: 'a2',
      name: 'Other Park',
      location: { coordinates: [107.6001, -6.9001] }, // Very close to a1
      type: 'PARK'
    }
  ],
  mockDistricts: [
    { id: 'd1', name: 'Downtown', code: 'DT' }
  ]
}));

describe('Spatial Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('analyzeBuffer should return buffer polygon and affected assets', async () => {
    const res = await analyzeBuffer('a1', 1000); // 1km radius
    expect(res?.bufferGeoJSON.type).toBe('Feature');
    expect(res?.affectedAssets).toHaveLength(1);
    expect(res?.affectedAssets[0].id).toBe('a2');
  });

  it('analyzeBuffer should return null if asset not found', async () => {
    const res = await analyzeBuffer('unknown', 100);
    expect(res).toBeNull();
  });

  it('checkIntersection should return point and districts', async () => {
    const res = await checkIntersection(107.6, -6.9);
    expect(res.districts).toHaveLength(1);
    expect(res.districts[0].name).toBe('Downtown');
  });
});
