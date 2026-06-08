import { getAssetDetail } from '@/lib/services/asset.service';
import { prisma } from '@/lib/db/prisma';
import { Incident, AssetDocument } from '@/lib/db/mongoose';

jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    asset: {
      findUnique: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

jest.mock('@/lib/db/mongoose', () => ({
  connectMongoDB: jest.fn().mockResolvedValue(true),
  Incident: {
    find: jest.fn(),
  },
  AssetDocument: {
    findOne: jest.fn(),
  }
}));

jest.mock('@/lib/services/cache.service', () => ({
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(null),
}));

describe('Asset Service - getAssetDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return asset details combined with incidents', async () => {
    (prisma.asset.findUnique as jest.Mock).mockResolvedValue({
      id: 'a1',
      name: 'Main Park',
      type: 'PARK',
      districtId: 'd1',
      district: { name: 'Downtown' },
    });

    (Incident.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { _id: 'i1', type: 'VANDALISM', severity: 'LOW' }
          ])
        })
      })
    });

    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ geometry: '{"type":"Point","coordinates":[0,0]}' }]);
    (AssetDocument.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        photos: [],
        documents: [],
        notes: []
      })
    });

    const result = await getAssetDetail('a1');
    expect(result).toBeDefined();
    expect(result?.id).toBe('a1');
    expect(result?.district.name).toBe('Downtown');
    expect(result?.recentIncidents).toHaveLength(1);
    expect(result?.recentIncidents[0].type).toBe('VANDALISM');
  });

  it('should return null if asset not found', async () => {
    (prisma.asset.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await getAssetDetail('invalid');
    expect(result).toBeNull();
  });
});
