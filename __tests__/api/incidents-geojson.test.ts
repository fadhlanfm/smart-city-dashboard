import { GET } from '@/app/api/incidents/geojson/route';
import * as incidentService from '@/lib/services/incident.service';

jest.mock('@/lib/services/incident.service');

describe('GET /api/incidents/geojson', () => {
  it('should return a FeatureCollection', async () => {
    (incidentService.getIncidentGeoJSON as jest.Mock).mockResolvedValue({
      type: 'FeatureCollection',
      features: [],
    });

    const req = new Request('http://localhost:3000/api/incidents/geojson?status=OPEN');
    const res = await GET(req as any);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe('FeatureCollection');
  });
});
