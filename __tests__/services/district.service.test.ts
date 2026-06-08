import { getDistrictGeoJSON, getAllDistricts } from '@/lib/services/district.service';
import { prisma } from '@/lib/db/prisma';

jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    district: {
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

jest.mock('@/lib/services/cache.service', () => ({
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(null),
}));

describe('District Service - GeoJSON', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a GeoJSON FeatureCollection', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([
      {
        id: '1',
        name: 'Downtown',
        code: 'DT',
        totalAssets: 100,
        activeIncidents: 5,
        coverageScore: 85.5,
        geometry: { type: 'Polygon', coordinates: [] },
      },
    ]);

    const result = await getDistrictGeoJSON();
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(1);
    expect(result.features[0].type).toBe('Feature');
    expect(result.features[0].properties.coverageScore).toBe(85.5);
  });
});

describe('District Service - getAllDistricts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all districts', async () => {
    (prisma.district.findMany as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Downtown', code: 'DT' }
    ]);

    const result = await getAllDistricts();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Downtown');
  });
});
