import { getIncidentGeoJSON } from '@/lib/services/incident.service';

jest.mock('@/lib/mock-data', () => ({
  mockIncidents: [
    {
      id: 'mock-incident-1',
      type: 'ACCIDENT',
      severity: 'HIGH',
      status: 'OPEN',
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128],
      },
      description: 'Test accident',
      createdAt: '2026-06-09T00:00:00Z'
    }
  ]
}));

describe('Incident Service - GeoJSON', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a GeoJSON FeatureCollection', async () => {
    const result = await getIncidentGeoJSON({});
    expect(result.type).toBe('FeatureCollection');
    expect(result.features).toHaveLength(1);
    expect(result.features[0].geometry.type).toBe('Point');
    expect(result.features[0].properties.severity).toBe('HIGH');
  });
});
