import { featureFromAsset, featureCollectionFromAssets, wktToGeoJSON, geoJSONToWKT } from '@/lib/utils/geojson';

describe('GeoJSON Utils', () => {
  it('converts asset to feature with string geometry', () => {
    const asset = { id: '1', geometry: '{"type":"Point","coordinates":[1,1]}' } as any;
    const f = featureFromAsset(asset);
    expect(f.geometry.type).toBe('Point');
  });

  it('converts asset to feature with object geometry', () => {
    const asset = { id: '1', geometry: { type: 'Point', coordinates: [1,1] } } as any;
    const f = featureFromAsset(asset);
    expect(f.geometry.type).toBe('Point');
  });

  it('handles invalid string geometry', () => {
    const asset = { id: '1', geometry: 'invalid' } as any;
    const f = featureFromAsset(asset);
    expect(f.geometry.coordinates).toEqual([0, 0]);
  });

  it('converts collection', () => {
    const asset = { id: '1', geometry: { type: 'Point', coordinates: [1,1] } } as any;
    const coll = featureCollectionFromAssets([asset]);
    expect(coll.features).toHaveLength(1);
  });

  it('wkt fallback', () => {
    expect(wktToGeoJSON('wkt')).toBe('wkt');
  });

  it('converts geoJSON to WKT', () => {
    expect(geoJSONToWKT({ type: 'Point', coordinates: [1, 2] })).toBe('POINT(1 2)');
    expect(geoJSONToWKT({ type: 'Polygon', coordinates: [[[1, 2], [3, 4]]] })).toBe('POLYGON((1 2, 3 4))');
    expect(() => geoJSONToWKT({ type: 'LineString', coordinates: [] } as any)).toThrow();
  });
});
