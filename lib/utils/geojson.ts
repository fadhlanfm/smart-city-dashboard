import { Asset, District } from '@prisma/client';
import { Feature, FeatureCollection, Point, Polygon } from 'geojson';
import { ExtendedAsset, GeoJSONGeometry } from '../types';

export function featureFromAsset(asset: ExtendedAsset): Feature<Point> {
  let geometry: Point = { type: 'Point', coordinates: [0, 0] };
  if (asset.geometry && typeof asset.geometry === 'string') {
    try {
      geometry = JSON.parse(asset.geometry);
    } catch (e) {
      // fallback
    }
  } else if (asset.geometry && typeof asset.geometry === 'object') {
    geometry = asset.geometry as unknown as Point;
  }

  return {
    type: 'Feature',
    geometry,
    properties: {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      status: asset.status,
      district: asset.district?.name || asset.districtId,
      address: asset.address,
      tags: asset.tags,
    },
  };
}

export function featureCollectionFromAssets(assets: ExtendedAsset[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: assets.map(featureFromAsset),
  };
}

export function wktToGeoJSON(wkt: string) {
  // Simplistic fallback if ST_AsGeoJSON was not used. 
  // In our app, we expect the DB query to return GeoJSON strings directly via ST_AsGeoJSON.
  return wkt;
}

export function geoJSONToWKT(geojson: GeoJSONGeometry): string {
  if (geojson.type === 'Point') {
    return `POINT(${geojson.coordinates[0]} ${geojson.coordinates[1]})`;
  }
  if (geojson.type === 'Polygon') {
    const coords = (geojson.coordinates[0] as number[][])
      .map((c: number[]) => `${c[0]} ${c[1]}`)
      .join(', ');
    return `POLYGON((${coords}))`;
  }
  throw new Error(`Unsupported GeoJSON type: ${geojson.type}`);
}
