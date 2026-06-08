import { GET } from '@/app/api/assets/route';
import * as assetService from '@/lib/services/asset.service';

jest.mock('@/lib/services/asset.service');

describe('GET /api/assets', () => {
  it('should return 400 on invalid params', async () => {
    const req = new Request('http://localhost:3000/api/assets?pageSize=invalid');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
  });

  it('should return paginated response on valid params', async () => {
    (assetService.getFilteredAssets as jest.Mock).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 }
    });
    const req = new Request('http://localhost:3000/api/assets?page=1&pageSize=10');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.meta).toBeDefined();
  });
});
