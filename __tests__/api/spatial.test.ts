import { POST as BufferPOST } from '@/app/api/spatial/buffer/route';
import { POST as IntersectPOST } from '@/app/api/spatial/intersect/route';
import * as spatialService from '@/lib/services/spatial.service';

jest.mock('@/lib/services/spatial.service');

describe('Spatial API Routes', () => {
  it('POST /api/spatial/buffer should return 400 for invalid input', async () => {
    const req = new Request('http://localhost:3000/api/spatial/buffer', {
      method: 'POST',
      body: JSON.stringify({ radiusMeters: 50000 }) // missing assetId, radius too large
    });
    const res = await BufferPOST(req as any as any);
    expect(res.status).toBe(400);
  });

  it('POST /api/spatial/buffer should return buffer data', async () => {
    (spatialService.analyzeBuffer as jest.Mock).mockResolvedValue({ bufferGeoJSON: {}, affectedAssets: [] });
    const req = new Request('http://localhost:3000/api/spatial/buffer', {
      method: 'POST',
      body: JSON.stringify({ assetId: '123e4567-e89b-12d3-a456-426614174000', radiusMeters: 100 })
    });
    const res = await BufferPOST(req as any as any);
    expect(res.status).toBe(200);
  });

  it('POST /api/spatial/intersect should return 400 for invalid input', async () => {
    const req = new Request('http://localhost:3000/api/spatial/intersect', {
      method: 'POST',
      body: JSON.stringify({ lon: 200, lat: 90 }) // invalid lon
    });
    const res = await IntersectPOST(req as any as any);
    expect(res.status).toBe(400);
  });

  it('POST /api/spatial/intersect should return intersect data', async () => {
    (spatialService.checkIntersection as jest.Mock).mockResolvedValue({ pointGeoJSON: {}, districts: [] });
    const req = new Request('http://localhost:3000/api/spatial/intersect', {
      method: 'POST',
      body: JSON.stringify({ lon: -74.0, lat: 40.7 })
    });
    const res = await IntersectPOST(req as any as any);
    expect(res.status).toBe(200);
  });
});
