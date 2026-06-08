import { GET } from '@/app/api/search/route';
import * as searchService from '@/lib/services/search.service';

jest.mock('@/lib/services/search.service');

describe('GET /api/search', () => {
  it('should return 400 when query parameter q is missing', async () => {
    const req = new Request('http://localhost:3000/api/search');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
  });

  it('should return results on valid query', async () => {
    (searchService.searchAssets as jest.Mock).mockResolvedValue([]);
    const req = new Request('http://localhost:3000/api/search?q=test');
    const res = await GET(req as any);
    expect(res.status).toBe(200);
  });
});
