import { analyzeBuffer, checkIntersection } from '@/lib/services/spatial.service';
import { prisma } from '@/lib/db/prisma';

jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

describe('Spatial Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('analyzeBuffer should return buffer polygon and affected assets', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([
      {
        buffer_polygon: { type: 'Polygon', coordinates: [] },
        affected_assets: [{ id: 'a2', name: 'Other Park', distance: 50 }]
      }
    ]);

    const res = await analyzeBuffer('a1', 100);
    expect(res?.bufferGeoJSON.type).toBe('Feature');
    expect(res?.affectedAssets).toHaveLength(1);
  });

  it('checkIntersection should return point and districts', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([
      { id: 'd1', name: 'Downtown', code: 'DT', geometry: {} }
    ]);

    const res = await checkIntersection(-74.0, 40.7);
    expect(res.districts).toHaveLength(1);
    expect(res.districts[0].name).toBe('Downtown');
  });
});
