import { getIncidentGeoJSON } from '@/lib/services/incident.service';
import { Incident } from '@/lib/db/mongoose';

jest.mock('@/lib/db/mongoose', () => ({
  connectMongoDB: jest.fn().mockResolvedValue(true),
  Incident: {
    find: jest.fn(),
  },
}));

jest.mock('@/lib/services/cache.service', () => ({
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(null),
}));

describe('Incident Service - GeoJSON', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a GeoJSON FeatureCollection', async () => {
    const mockFind = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          _id: 'i1',
        type: 'ACCIDENT',
        severity: 'HIGH',
        status: 'OPEN',
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
        },
        },
      ])
    });
    (Incident.find as jest.Mock).mockImplementation(mockFind);

    const result = await getIncidentGeoJSON({});
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry.type).toBe('Point');
    expect(result.features[0].properties.severity).toBe('HIGH');
  });

  it('should return empty FeatureCollection if no incidents found', async () => {
    const mockFind = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([])
    });
    (Incident.find as jest.Mock).mockImplementation(mockFind);

    const result = await getIncidentGeoJSON({});
    expect(result.features).toHaveLength(0);
  });

  it('should return cached result if available', async () => {
    const { getCache } = require('@/lib/services/cache.service');
    const cachedData = { type: 'FeatureCollection', features: [{ id: 'cached' }] };
    (getCache as jest.Mock).mockResolvedValueOnce(cachedData);

    const result = await getIncidentGeoJSON({});
    expect((result.features[0] as any).id).toBe('cached');
    expect(Incident.find).not.toHaveBeenCalled();
  });
});
