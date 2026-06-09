# Data Model: Smart City Operations & Asset Management Dashboard

**Feature**: `001-smart-city-dashboard`
**Date**: 2026-06-08

---

## Storage Layer Mapping

| Entity | Primary Store | Rationale |
|---|---|---|
| Asset | PostgreSQL + PostGIS | Structured relational + spatial geometry |
| District | PostgreSQL + PostGIS | Polygon geometry + aggregate metrics |
| Incident / Event | MongoDB | Flexible schema, time-series inserts |
| AssetDocument | MongoDB | Variable metadata, photo URL arrays |
| SearchIndexRecord | Elasticsearch | Full-text + geo search index |
| CacheEntry | Redis | Short-lived key-value TTL cache |
| Vercel Mock CRUD | Local Storage | Simulates database persistence for assets on read-only serverless deployments |

---

## PostgreSQL / PostGIS Schema (Prisma)

### `Asset`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` (CUID) | PK | Auto-generated |
| `name` | `String` | NOT NULL, indexed | Human-readable label |
| `type` | `AssetType` (enum) | NOT NULL | `ROAD`, `UTILITY`, `PARK`, `FACILITY`, `POI` |
| `status` | `AssetStatus` (enum) | NOT NULL, default `ACTIVE` | `ACTIVE`, `MAINTENANCE`, `DECOMMISSIONED` |
| `districtId` | `String` | FK → District.id | Many-to-one |
| `geometry` | `Unsupported("geometry")` | NOT NULL | PostGIS `GEOMETRY(Point, 4326)` or `GEOMETRY(Polygon, 4326)` |
| `address` | `String?` | Nullable | Human-readable address |
| `tags` | `String[]` | Default `[]` | Searchable keywords |
| `attributes` | `Json` | Default `{}` | Flexible key-value pairs |
| `createdAt` | `DateTime` | Default `now()` | |
| `updatedAt` | `DateTime` | Auto-update | |

**Relationships**:
- `district` → `District` (many-to-one)
- `incidents` → `Incident[]` (one-to-many, stored in MongoDB — referenced by `assetId` string)

**Indexes**: `districtId`, `status`, `type`, `(status, type)` composite.

**PostGIS index**: `CREATE INDEX ON "Asset" USING GIST (geometry);`

---

### `District`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `String` (CUID) | PK | |
| `name` | `String` | NOT NULL, unique | e.g., "Central District" |
| `code` | `String` | NOT NULL, unique | Short code e.g., "CDT" |
| `geometry` | `Unsupported("geometry")` | NOT NULL | `GEOMETRY(Polygon, 4326)` |
| `totalAssets` | `Int` | Default `0` | Denormalized counter (updated on asset change) |
| `activeIncidents` | `Int` | Default `0` | Denormalized counter |
| `coverageScore` | `Float?` | Nullable | 0.0–1.0 coverage metric for choropleth |
| `createdAt` | `DateTime` | Default `now()` | |
| `updatedAt` | `DateTime` | Auto-update | |

**Relationships**:
- `assets` → `Asset[]` (one-to-many)

**PostGIS index**: `CREATE INDEX ON "District" USING GIST (geometry);`

---

### Prisma Enums

```prisma
enum AssetType {
  ROAD
  UTILITY
  PARK
  FACILITY
  POI
}

enum AssetStatus {
  ACTIVE
  MAINTENANCE
  DECOMMISSIONED
}
```

---

## MongoDB / Mongoose Schemas

### `AssetDocument` (collection: `assetDocuments`)

```
{
  _id: ObjectId,
  assetId: String,           // references PostgreSQL Asset.id
  schemaVersion: Number,     // application-level migration version (default: 1)
  __v: Number,               // Mongoose internal version key
  photos: [
    {
      url: String,           // CDN or object storage URL
      caption: String?,
      takenAt: Date?
    }
  ],
  documents: [
    {
      url: String,
      title: String,
      fileType: String,      // "pdf", "docx", etc.
      uploadedAt: Date
    }
  ],
  notes: [String],
  metadata: Mixed,           // flexible per-asset-type fields
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `{ assetId: 1 }` (unique), `{ updatedAt: -1 }`

**Validation rules**:
- `assetId` required, must be non-empty string.
- `photos[].url` required if photo entry exists.
- `documents[].url` and `documents[].title` required if document entry exists.

---

### `Incident` (collection: `incidents`)

```
{
  _id: ObjectId,
  assetId: String,            // references PostgreSQL Asset.id
  schemaVersion: Number,      // default: 1
  __v: Number,
  type: String,               // "OUTAGE", "MAINTENANCE_REQUEST", "DAMAGE", "INSPECTION"
  severity: String,           // "LOW", "MEDIUM", "HIGH", "CRITICAL"
  description: String,
  location: {
    type: "Point",
    coordinates: [Number, Number]  // [lng, lat] GeoJSON format
  },
  resolved: Boolean,          // default: false
  resolvedAt: Date?,
  reportedBy: String?,        // user identifier
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ assetId: 1, createdAt: -1 }` — asset incident history queries
- `{ resolved: 1, createdAt: -1 }` — active incidents list
- `{ location: "2dsphere" }` — geo-proximity queries
- `{ type: 1, severity: 1 }` — filtering

---

## Elasticsearch Index Schema

### Index: `smart_city_assets`

```json
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "analyzer": {
        "asset_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id":         { "type": "keyword" },
      "name":       { "type": "text", "analyzer": "asset_analyzer", "fields": { "keyword": { "type": "keyword" } } },
      "type":       { "type": "keyword" },
      "status":     { "type": "keyword" },
      "districtId": { "type": "keyword" },
      "district":   { "type": "keyword" },
      "address":    { "type": "text", "analyzer": "asset_analyzer" },
      "tags":       { "type": "keyword" },
      "location":   { "type": "geo_point" },
      "updatedAt":  { "type": "date" }
    }
  }
}
```

**Sync**: Upsert on asset create/update (synchronous within API handler, using
`client.index({ index, id, document })`).

---

## Redis Key Schema

| Key Pattern | TTL | Content |
|---|---|---|
| `assets:filter:{hash}` | 30s | JSON: filtered asset list (paginated) |
| `assets:geojson:{hash}` | 60s | GeoJSON FeatureCollection for map layer |
| `assets:summary:{hash}` | 60s | JSON: summary card aggregates |
| `districts:geojson` | 300s | GeoJSON FeatureCollection for choropleth |
| `incidents:geojson:{hash}` | 60s | GeoJSON for heatmap layer |
| `spatial:buffer:{hash}` | 120s | JSON: buffer result (polygon + asset list) |
| `spatial:intersect:{hash}` | 120s | JSON: intersect result features |
| `search:{hash}` | 15s | JSON: Elasticsearch search results |
| `health:status` | 10s | JSON: per-service health status |

**Hash generation**: `sha256(JSON.stringify(sortedParams))` — deterministic, collision-resistant.

---

## GeoJSON / WKT Standards

- **API output**: All geometry returned as GeoJSON (`ST_AsGeoJSON(geometry)::json`).
- **API input (spatial tools)**: Client sends GeoJSON geometry; server converts to WKT
  via `ST_GeomFromGeoJSON()` for PostGIS operations.
- **Database storage**: PostGIS native `geometry` type (WKT-compatible via `ST_AsText()`).
- **CRS**: EPSG:4326 (WGS84) universally; no reprojection in this version.
- **Feature export**: Single asset → GeoJSON Feature; result sets → GeoJSON
  FeatureCollection.

---

## State Transitions

### Asset Status

```
ACTIVE → MAINTENANCE  (maintenance request incident created)
MAINTENANCE → ACTIVE  (resolved incident)
ACTIVE → DECOMMISSIONED  (administrative action)
MAINTENANCE → DECOMMISSIONED  (administrative action)
```

### Incident

```
open (resolved: false) → resolved (resolved: true, resolvedAt: Date)
```

---

## Validation Rules Summary

| Rule | Scope | Enforcement |
|---|---|---|
| Asset `name` non-empty, ≤200 chars | Client + Server | Zod schema |
| Asset `type` one of enum values | Server | Zod + Prisma |
| Asset `geometry` valid GeoJSON Point/Polygon | Server | Zod + PostGIS |
| Incident `severity` one of LOW/MEDIUM/HIGH/CRITICAL | Server | Zod + Mongoose |
| Buffer `radius` 0.1–50 km | Client + Server | Zod schema |
| Search `query` 1–200 chars | Client + Server | Zod schema |
| Filter `dateFrom` ≤ `dateTo` | Client + Server | Zod `.refine()` |
| Export record count ≤ 10,000 | Server | Service layer guard |
| Page size one of 10/25/50 | Server | Zod enum |
