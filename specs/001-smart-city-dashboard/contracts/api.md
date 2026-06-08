# API Contracts: Smart City Dashboard

**Feature**: `001-smart-city-dashboard`
**Date**: 2026-06-08
**Base URL**: `/api`
**Auth**: All endpoints (except `/health`) require a valid session cookie (NextAuth.js JWT).
**Validation**: All request bodies/params validated server-side via Zod.
**Caching**: Redis cache-aside; cache-hit responses include `X-Cache: HIT` header.

---

## Health

### `GET /api/health`
Returns connectivity status for all dependent services.

**Auth**: None required.

**Response 200**:
```json
{
  "status": "ok" | "degraded",
  "services": {
    "postgres": { "status": "up" | "down", "latencyMs": 12 },
    "mongodb":  { "status": "up" | "down", "latencyMs": 8 },
    "redis":    { "status": "up" | "down", "latencyMs": 2 },
    "elasticsearch": { "status": "up" | "down", "latencyMs": 15 }
  },
  "timestamp": "2026-06-08T06:00:00.000Z"
}
```

---

## Assets

### `GET /api/assets`
Returns a paginated, filtered list of assets.

**Query Parameters**:
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer ≥1 | 1 | Page number |
| `pageSize` | 10 \| 25 \| 50 | 25 | Records per page |
| `districtId` | string? | — | Filter by district |
| `type` | AssetType? | — | Filter by asset type |
| `status` | AssetStatus? | — | Filter by status |
| `dateFrom` | ISO date? | — | Filter by updatedAt ≥ |
| `dateTo` | ISO date? | — | Filter by updatedAt ≤ |
| `sort` | string? | `updatedAt` | Column to sort by |
| `order` | `asc` \| `desc` | `desc` | Sort direction |

**Response 200**:
```json
{
  "data": [
    {
      "id": "clx...",
      "name": "Main St Utility Node",
      "type": "UTILITY",
      "status": "ACTIVE",
      "districtId": "clx...",
      "district": { "id": "clx...", "name": "Central District", "code": "CDT" },
      "address": "123 Main St",
      "tags": ["electrical", "underground"],
      "updatedAt": "2026-06-07T10:00:00.000Z",
      "geometry": { "type": "Point", "coordinates": [36.8219, -1.2921] }
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 342,
    "totalPages": 14
  }
}
```

**Response 400**: Zod validation error — invalid filter params.
**Response 401**: Unauthenticated.

---

### `GET /api/assets/geojson`
Returns all assets as a GeoJSON FeatureCollection for MapLibre POI layer.

**Query Parameters**: Same filter params as `GET /api/assets` (no pagination).

**Response 200**:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [36.8219, -1.2921] },
      "properties": {
        "id": "clx...",
        "name": "Main St Utility Node",
        "type": "UTILITY",
        "status": "ACTIVE",
        "district": "Central District"
      }
    }
  ]
}
```

---

### `GET /api/assets/[id]`
Returns full detail for a single asset, including AssetDocument from MongoDB.

**Response 200**:
```json
{
  "id": "clx...",
  "name": "Main St Utility Node",
  "type": "UTILITY",
  "status": "ACTIVE",
  "district": { "id": "clx...", "name": "Central District", "code": "CDT" },
  "address": "123 Main St",
  "tags": ["electrical"],
  "attributes": { "voltage": "11kV", "installYear": 2018 },
  "geometry": { "type": "Point", "coordinates": [36.8219, -1.2921] },
  "updatedAt": "2026-06-07T10:00:00.000Z",
  "document": {
    "photos": [{ "url": "https://...", "caption": "Front view" }],
    "documents": [{ "url": "https://...", "title": "Installation Report", "fileType": "pdf" }],
    "notes": ["Inspected 2026-01-15"]
  }
}
```

**Response 404**: Asset not found.

---

### `GET /api/assets/summary`
Returns aggregated summary card metrics for the filtered dataset.

**Query Parameters**: Same filter params (no pagination).

**Response 200**:
```json
{
  "totalAssets": 342,
  "activeAssets": 289,
  "maintenanceAssets": 41,
  "activeIncidents": 23,
  "coverageAreaKm2": 156.4,
  "byType": { "ROAD": 120, "UTILITY": 89, "PARK": 67, "FACILITY": 54, "POI": 12 },
  "byStatus": { "ACTIVE": 289, "MAINTENANCE": 41, "DECOMMISSIONED": 12 }
}
```

---

## Districts

### `GET /api/districts`
Returns all districts with aggregate metrics.

**Response 200**:
```json
{
  "data": [
    {
      "id": "clx...",
      "name": "Central District",
      "code": "CDT",
      "totalAssets": 89,
      "activeIncidents": 5,
      "coverageScore": 0.82
    }
  ]
}
```

---

### `GET /api/districts/geojson`
Returns districts as GeoJSON FeatureCollection for choropleth layer.

**Response 200**: GeoJSON FeatureCollection; each Feature's `properties` includes
`id`, `name`, `code`, `coverageScore`, `totalAssets`, `activeIncidents`.

---

## Incidents

### `GET /api/incidents/geojson`
Returns incident points as GeoJSON for heatmap layer.

**Query Parameters**: `districtId?`, `type?`, `severity?`, `dateFrom?`, `dateTo?`, `resolved?` (boolean)

**Response 200**: GeoJSON FeatureCollection; each Feature has `Point` geometry with
`properties`: `id`, `type`, `severity`, `assetId`, `createdAt`.

---

## Search

### `GET /api/search`
Full-text search across assets and POIs via Elasticsearch.

**Query Parameters**:
| Param | Type | Description |
|---|---|---|
| `q` | string (1-200 chars) | Search query (required) |
| `districtId` | string? | Filter by district |
| `type` | AssetType? | Filter by type |
| `size` | integer 1-20 | Max results (default 10) |

**Response 200**:
```json
{
  "results": [
    {
      "id": "clx...",
      "name": "Main St Utility Node",
      "type": "UTILITY",
      "district": "Central District",
      "address": "123 Main St",
      "location": { "lat": -1.2921, "lon": 36.8219 },
      "score": 0.98
    }
  ],
  "total": 4,
  "query": "main st utility"
}
```

**Response 400**: `q` param missing or invalid.

---

## Spatial Operations

### `POST /api/spatial/buffer`
Calculate a buffer polygon and return assets within it.

**Request Body**:
```json
{
  "center": { "type": "Point", "coordinates": [36.8219, -1.2921] },
  "radiusKm": 2.5,
  "filters": { "type": "UTILITY", "status": "ACTIVE" }
}
```

**Validation**: `radiusKm` must be 0.1–50; `center` must be valid GeoJSON Point.

**Response 200**:
```json
{
  "buffer": {
    "type": "Feature",
    "geometry": { "type": "Polygon", "coordinates": [[...]] },
    "properties": { "radiusKm": 2.5, "center": [36.8219, -1.2921] }
  },
  "assets": {
    "type": "FeatureCollection",
    "features": [...]
  },
  "count": 14
}
```

---

### `POST /api/spatial/intersect`
Returns features from layer A that geometrically intersect layer B's boundary.

**Request Body**:
```json
{
  "layerAFilter": { "type": "UTILITY" },
  "layerBGeometry": { "type": "Polygon", "coordinates": [[...]] }
}
```

**Response 200**:
```json
{
  "features": {
    "type": "FeatureCollection",
    "features": [...]
  },
  "count": 7
}
```

---

### `POST /api/spatial/distance`
Calculate straight-line distance between two points.

**Request Body**:
```json
{
  "pointA": { "type": "Point", "coordinates": [36.8219, -1.2921] },
  "pointB": { "type": "Point", "coordinates": [36.8500, -1.3000] }
}
```

**Response 200**:
```json
{
  "distanceKm": 3.847,
  "distanceMiles": 2.390,
  "pointA": [36.8219, -1.2921],
  "pointB": [36.8500, -1.3000]
}
```

---

## Export

### `GET /api/export/csv`
Exports the filtered asset list as a `.csv` file.

**Query Parameters**: Same filter params as `GET /api/assets`. Maximum 10,000 records.

**Response 200**:
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="assets-export-{timestamp}.csv"`
- Body: CSV with header row; columns: id, name, type, status, district, address, tags, lat, lng, updatedAt.

**Response 400**: Record count exceeds 10,000 — returns JSON error with message instructing user to apply filters.

---

### `GET /api/export/geojson`
Exports filtered assets as a GeoJSON FeatureCollection file.

**Query Parameters**: Same filter params. Maximum 10,000 records.

**Response 200**:
- `Content-Type: application/geo+json`
- `Content-Disposition: attachment; filename="assets-export-{timestamp}.geojson"`
- Body: GeoJSON FeatureCollection.

---

### `GET /api/export/geojson/[id]`
Exports a single asset as a GeoJSON Feature file.

**Response 200**:
- `Content-Type: application/geo+json`
- `Content-Disposition: attachment; filename="asset-{id}.geojson"`
- Body: Single GeoJSON Feature with all properties.

---

## Error Response Format (all endpoints)

```json
{
  "error": {
    "code": "VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "INTERNAL_ERROR" | "EXPORT_LIMIT_EXCEEDED",
    "message": "Human-readable description",
    "details": {}
  }
}
```

**HTTP status codes**:
- `400` — Validation error (Zod)
- `401` — Unauthenticated
- `403` — Forbidden (valid session, insufficient permissions)
- `404` — Resource not found
- `413` — Export limit exceeded (>10,000 records)
- `500` — Internal server error (logged via Pino, not exposed to client)
