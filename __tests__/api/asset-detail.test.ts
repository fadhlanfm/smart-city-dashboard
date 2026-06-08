import { GET } from '@/app/api/assets/[id]/route';
import * as assetService from '@/lib/services/asset.service';

jest.mock('@/lib/services/asset.service');

describe('GET /api/assets/[id]', () => {
  it('should return 404 for invalid UUID', async () => {
    const req = new Request('http://localhost:3000/api/assets/invalid-id');
    const res = await GET(req as any, { params: Promise.resolve({ id: 'invalid-id' }) });
    expect(res.status).toBe(404);
  });

  it('should return 404 if asset not found', async () => {
    (assetService.getAssetDetail as jest.Mock).mockResolvedValue(null);
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const req = new Request(`http://localhost:3000/api/assets/${validUuid}`);
    const res = await GET(req as any, { params: Promise.resolve({ id: validUuid }) });
    expect(res.status).toBe(404);
  });

  it('should return asset details', async () => {
    (assetService.getAssetDetail as jest.Mock).mockResolvedValue({ id: 'valid', name: 'Park' });
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const req = new Request(`http://localhost:3000/api/assets/${validUuid}`);
    const res = await GET(req as any, { params: Promise.resolve({ id: validUuid }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.name).toBe('Park');
  });
});
