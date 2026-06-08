import { GET } from '@/app/api/assets/geojson/route';
import * as assetService from '@/lib/services/asset.service';

jest.mock('@/lib/services/asset.service');

describe('GET /api/assets/geojson', () => {
  it('should return a FeatureCollection', async () => {
    (assetService.getAssetGeoJSON as jest.Mock).mockResolvedValue({
      type: 'FeatureCollection',
      features: [],
    });

    const req = new Request('http://localhost:3000/api/assets/geojson?type=PARK');
    const res = await GET(req as any);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe('FeatureCollection');
  });
});
