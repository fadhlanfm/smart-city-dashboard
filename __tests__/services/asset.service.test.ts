import { getFilteredAssets, getAssetSummary, createAsset, updateAsset, getAssetGeoJSON, deleteAsset } from '@/lib/services/asset.service';
import { prisma } from '@/lib/db/prisma';

jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    asset: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  },
}));

jest.mock('@/lib/db/mongoose', () => ({
  connectMongoDB: jest.fn().mockResolvedValue(true),
  Incident: {
    deleteMany: jest.fn(),
  },
  AssetDocument: {
    create: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

jest.mock('@/lib/db/elasticsearch', () => ({
  esClient: {
    index: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/lib/services/cache.service', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
}));

jest.mock('@/lib/db/redis', () => ({
  redis: {
    keys: jest.fn().mockResolvedValue([]),
    del: jest.fn(),
  }
}));

describe('Asset Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFilteredAssets', () => {
    it('should build correct where clause from filter params and return paginated meta', async () => {
      // Setup mock return
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ id: '1', name: 'Test', geometry: {} }]);
      (prisma.asset.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.asset.findMany as jest.Mock).mockResolvedValueOnce([{ id: '1', name: 'Test' }]);

      const result = await getFilteredAssets({ districtId: 'd1', page: 1, pageSize: 10, sort: 'name', order: 'asc' });
      
      expect(prisma.asset.count).toHaveBeenCalledWith({
        where: expect.objectContaining({ districtId: 'd1' })
      });
      expect(result.data).toBeDefined();
      expect(result.meta?.total).toBe(1);
    });

    it('should return cached result if cache hit', async () => {
      const { getCache } = require('@/lib/services/cache.service');
      (getCache as jest.Mock).mockResolvedValueOnce({ data: [{ id: 'cached' }], meta: { total: 1 } });
      
      const result = await getFilteredAssets({ districtId: 'd2', page: 1, pageSize: 10, sort: 'name', order: 'asc' });
      expect(result.data[0].id).toBe('cached');
      // Should not call DB
      expect(prisma.asset.count).not.toHaveBeenCalledWith(expect.objectContaining({ where: { districtId: 'd2' } }));
    });

    it('should return empty result if no assets found', async () => {
      (prisma.asset.count as jest.Mock).mockResolvedValueOnce(0);
      (prisma.asset.findMany as jest.Mock).mockResolvedValueOnce([]);

      const result = await getFilteredAssets({ page: 1, pageSize: 10 } as any);
      expect(result.data).toHaveLength(0);
    });

    it('should handle date filters', async () => {
      (prisma.asset.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.asset.findMany as jest.Mock).mockResolvedValueOnce([{ id: '1' }]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      await getFilteredAssets({ dateFrom: '2023-01-01', dateTo: '2023-12-31', page: 1, pageSize: 10 } as any);
      expect(prisma.asset.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          updatedAt: expect.objectContaining({ gte: expect.any(Date), lte: expect.any(Date) })
        })
      });
    });
  });

  describe('getAssetSummary', () => {
    it('should return correct aggregation shape', async () => {
      (prisma.asset.count as jest.Mock).mockResolvedValue(10);
      (prisma.asset.groupBy as jest.Mock).mockResolvedValue([{ type: 'ROAD', _count: 5 }]);

      const result = await getAssetSummary({} as any);
      expect(result.byType).toBeDefined();
    });

    it('should return cached result if cache hit', async () => {
      const { getCache } = require('@/lib/services/cache.service');
      (getCache as jest.Mock).mockResolvedValueOnce({ cached: true });
      
      const result = await getAssetSummary({ page: 1, pageSize: 10, sort: 'name', order: 'asc' });
      expect((result as any).cached).toBe(true);
      expect(prisma.asset.count).not.toHaveBeenCalled();
    });
  });

  describe('getAssetGeoJSON', () => {
    it('should return empty FeatureCollection if no assets', async () => {
      (prisma.asset.findMany as jest.Mock).mockResolvedValueOnce([]);
      const result = await getAssetGeoJSON({} as any);
      expect(result.features).toHaveLength(0);
    });

    it('should return FeatureCollection with assets', async () => {
      (prisma.asset.findMany as jest.Mock).mockResolvedValueOnce([{ id: '1', name: 'A' }]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ id: '1', geometry: {} }]);
      
      const result = await getAssetGeoJSON({} as any);
      expect(result.features).toHaveLength(1);
      expect(result.features[0].properties.name).toBe('A');
    });

    it('should return cached result if cache hit', async () => {
      const { getCache } = require('@/lib/services/cache.service');
      (getCache as jest.Mock).mockResolvedValueOnce({ type: 'FeatureCollection', features: [{ id: 'cached' }] });
      
      const result = await getAssetGeoJSON({ page: 1, pageSize: 10, sort: 'name', order: 'asc' });
      expect(result.features[0].id).toBe('cached');
    });
  });

  describe('createAsset', () => {
    it('should insert raw query and cast enum types properly', async () => {
      (prisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({ id: '1', district: { name: 'D1' } });
      await createAsset({
        id: '1', name: 'A1', type: 'ROAD', status: 'ACTIVE', districtId: 'd1', lon: 0, lat: 0, tags: ['test']
      });
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });

  describe('updateAsset', () => {
    it('should update raw query with enum casts if lon and lat are provided', async () => {
      (prisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({ id: '1', district: { name: 'D1' } });
      await updateAsset('1', {
        name: 'A2', type: 'ROAD', status: 'ACTIVE', districtId: 'd1', lon: 0, lat: 0, tags: ['test']
      });
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });

    it('should update without raw query if lon/lat omitted', async () => {
      (prisma.asset.findUnique as jest.Mock).mockResolvedValueOnce({ id: '1', district: { name: 'D1' } });
      await updateAsset('1', { name: 'A2' } as any);
      expect(prisma.asset.update).toHaveBeenCalled();
    });

    it('should return null if asset not found after update', async () => {
      (prisma.asset.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const result = await updateAsset('999', { name: 'A2' } as any);
      expect(result).toBeNull();
    });
  });

  describe('deleteAsset', () => {
    it('should delete asset and clean up related docs', async () => {
      const { esClient } = require('@/lib/db/elasticsearch');
      const { Incident, AssetDocument } = require('@/lib/db/mongoose');

      await deleteAsset('1');
      expect(prisma.asset.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(Incident.deleteMany).toHaveBeenCalled();
      expect(AssetDocument.deleteOne).toHaveBeenCalled();
      expect(esClient.delete).toHaveBeenCalled();
    });

    it('should handle ES delete error gracefully', async () => {
      const { esClient } = require('@/lib/db/elasticsearch');
      console.error = jest.fn();
      
      // Setup mock to throw non-404 error
      (esClient.delete as jest.Mock).mockRejectedValueOnce({ meta: { statusCode: 500 } });
      
      await deleteAsset('1');
      expect(console.error).toHaveBeenCalledWith('ES Delete error', expect.any(Object));
    });
  });
});
