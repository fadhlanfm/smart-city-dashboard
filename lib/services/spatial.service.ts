import { prisma } from '../db/prisma';
import { GeoJSONGeometry } from '../types';

export async function analyzeBuffer(assetId: string, radiusMeters: number) {
  // PostGIS ST_DWithin uses meters if geography type, but our geometry is Geometry(Point, 4326)
  // We cast to geography to do distance queries in meters.
  // Also we want to generate a buffer polygon in GeoJSON format to render on the map.
    const result = await prisma.$queryRaw<{ buffer_polygon: GeoJSONGeometry, affected_assets: { id: string, name: string, type: string, distance: number }[] }[]>`
      WITH target AS (
        SELECT geometry FROM "Asset" WHERE id = ${assetId}
      ),
      affected AS (
        SELECT id, name, type, ST_Distance(geometry::geography, (SELECT geometry FROM target)::geography) as distance
        FROM "Asset"
        WHERE ST_DWithin(geometry::geography, (SELECT geometry FROM target)::geography, ${radiusMeters})
        AND id != ${assetId}
      )
      SELECT 
        ST_AsGeoJSON(ST_Buffer((SELECT geometry FROM target)::geography, ${radiusMeters})::geometry)::json as buffer_polygon,
        (SELECT json_agg(row_to_json(affected.*)) FROM affected) as affected_assets
    `;

  if (!result || result.length === 0 || !result[0].buffer_polygon) {
    return null;
  }

  return {
    bufferGeoJSON: {
      type: 'Feature',
      geometry: result[0].buffer_polygon,
      properties: { radius: radiusMeters }
    },
    affectedAssets: result[0].affected_assets || []
  };
}

export async function checkIntersection(lon: number, lat: number) {
  // Find which district this point falls into
  const districts = await prisma.$queryRaw<{ id: string, name: string, code: string, geometry: GeoJSONGeometry }[]>`
    SELECT id, name, code, ST_AsGeoJSON(geometry)::json as geometry
    FROM "District"
    WHERE ST_Intersects(geometry, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
  `;

  return {
    pointGeoJSON: {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {}
    },
    districts: districts.map(d => ({ id: d.id, name: d.name, code: d.code }))
  };
}
