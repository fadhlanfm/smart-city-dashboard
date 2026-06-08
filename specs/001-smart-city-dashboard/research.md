# Research: Smart City Operations & Asset Management Dashboard

**Feature**: `001-smart-city-dashboard`
**Branch**: `001-smart-city-dashboard`
**Date**: 2026-06-08

---

## 1. Next.js 14+ App Router — Architecture Patterns

**Decision**: Server Components as default; Client Components only for MapLibre canvas,
interactive filters, and chart widgets.

**Rationale**: The App Router's server-first model co-locates data fetching with rendering,
eliminates unnecessary client-side waterfalls, and naturally enforces the constitution's
rule of no direct DB calls from Client Components. Route Handlers (`app/api/`) replace
the Pages Router's `pages/api/` and are used for all REST endpoints.

**Key patterns adopted**:
- `app/(dashboard)/page.tsx` — Server Component rendering summary cards and initial
  table data via direct service layer calls (no fetch overhead).
- `app/(dashboard)/map/page.tsx` — thin Server Component shell; MapLibre canvas is a
  `"use client"` child component.
- `app/api/[resource]/route.ts` — Route Handlers for all client-triggered fetches
  (filtered queries, search, spatial operations, exports).
- Server Actions for any future write operations (CSRF handled by Next.js natively for
  Server Actions).

**Alternatives considered**:
- Pages Router: Rejected — no Server Components, larger client bundle, worse streaming.
- GraphQL: Rejected — adds complexity without benefit for a read-heavy dashboard with
  well-defined endpoints.

---

## 2. PostgreSQL + PostGIS — Spatial Data Patterns

**Decision**: Use PostGIS geometry types (`GEOMETRY(Point, 4326)`,
`GEOMETRY(Polygon, 4326)`) for all spatial columns. Expose via Prisma's
`Unsupported("geometry")` type for raw SQL queries through `$queryRaw`.

**Rationale**: Prisma does not natively support PostGIS geometry types in its schema DSL.
The established pattern is to declare spatial columns as `Unsupported("geometry")` in
`schema.prisma` and use `$queryRaw` / `$executeRaw` for spatial operations (ST_Within,
ST_Buffer, ST_Intersects, ST_Distance). All results are returned as GeoJSON via
`ST_AsGeoJSON()`. WKT import uses `ST_GeomFromText()`.

**Key spatial operations needed**:
- `ST_Buffer(geom, radius_metres)` — service area calculation (Buffer tool).
- `ST_Intersects(geom_a, geom_b)` — intersection query (Intersect tool).
- `ST_Distance(geom_a, geom_b)` — distance measurement in metres, converted to km/miles.
- `ST_Within(asset_geom, buffer_geom)` — assets inside buffer zone.
- `ST_AsGeoJSON(geom)` — serialize geometry for API responses.
- `ST_GeomFromText(wkt, 4326)` — ingest WKT geometry.

**Prisma migration note**: PostGIS extension must be enabled before first migration:
`CREATE EXTENSION IF NOT EXISTS postgis;` — added as a raw SQL migration step.

**Alternatives considered**:
- Drizzle ORM: Rejected — constitution mandates Prisma.
- Raw `pg` driver: Rejected — loses Prisma's type safety for non-spatial columns.

---

## 3. MongoDB + Mongoose — Document Store Patterns

**Decision**: MongoDB stores Asset documents (photos URLs, documentation blobs, flexible
metadata), and Incident/Event records (flexible schema, time-series-like inserts).

**Rationale**: Asset documentation has variable structure (different asset types have
different metadata fields). MongoDB's flexible document model handles this without
schema migrations. Mongoose provides schema-level validation and versioning (`__v` field)
as mandated by the constitution.

**Schema versioning**: Use Mongoose's built-in `versionKey: true` (default `__v`) plus
a manual `schemaVersion` field for application-level migration awareness.

**Key collections**:
- `assetDocuments` — photos (URL array), PDFs (URL), notes (string array), asset ID
  reference, flexible `metadata` object.
- `incidents` — asset ID reference, type, severity, timestamp, description, resolved flag.

**Alternatives considered**:
- Storing documents in PostgreSQL JSONB: Rejected — constitution mandates MongoDB for
  this concern; also less flexible for file URL arrays.

---

## 4. Redis (ioredis) — Caching Strategy

**Decision**: Cache-aside pattern. API Route Handlers check Redis before querying
PostgreSQL or Elasticsearch. Cache keys are deterministic hashes of query parameters.

**TTL strategy**:
- Summary card aggregates: 60 seconds (near-real-time feel, low DB load).
- Filtered data table results: 30 seconds.
- Spatial query results (Buffer/Intersect): 120 seconds (expensive, infrequently unique).
- Search results: 15 seconds (freshness matters for search UX).
- District GeoJSON (choropleth source): 300 seconds (rarely changes).

**Key naming convention**: `{resource}:{hash_of_params}` e.g.,
`assets:filter:abc123`, `spatial:buffer:def456`, `search:poi:ghi789`.

**Graceful degradation**: If Redis is unavailable, the Route Handler falls back to the
primary data source. A Redis connectivity error MUST be logged but MUST NOT crash the
request.

**Alternatives considered**:
- In-memory LRU cache (Node.js): Rejected — not shared across serverless instances,
  no TTL management, constitution mandates ioredis.

---

## 5. Elasticsearch — Search Index Design

**Decision**: Single index `smart_city_assets` with a flattened document structure
combining Asset (from PostgreSQL) and POI fields. Geo-point field for proximity search.

**Index mapping** (key fields):
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": { "type": "text", "analyzer": "standard" },
      "type": { "type": "keyword" },
      "status": { "type": "keyword" },
      "district": { "type": "keyword" },
      "address": { "type": "text" },
      "tags": { "type": "keyword" },
      "location": { "type": "geo_point" },
      "updatedAt": { "type": "date" }
    }
  }
}
```

**Sync strategy**: On Asset create/update events, the corresponding Elasticsearch
document is upserted synchronously within the same API handler (acceptable for a
read-heavy dashboard; async queue is a future enhancement).

**Query pattern**: Multi-match on `name`, `address`, `tags` with `fuzziness: AUTO`;
filtered by `status`, `district`, `type` if global filters are active.

**Alternatives considered**:
- PostgreSQL full-text search (`tsvector`): Rejected — constitution mandates Elasticsearch;
  also inferior fuzzy matching and geo-search capabilities.

---

## 6. MapLibre GL JS — Layer Architecture

**Decision**: Separate GeoJSON sources for each layer type. Layers registered in a
central `mapStore` (Zustand) to enable controlled toggling.

**Layer stack** (bottom to top):
1. Basemap (raster or vector tile) — switched via style URL swap.
2. District choropleth — `fill` layer from `/api/districts/geojson` GeoJSON source.
3. Asset POI markers — `circle` + `symbol` layers from `/api/assets/geojson` source.
4. Heatmap layer — `heatmap` layer from `/api/incidents/geojson` source.
5. Spatial tool overlays — buffer polygon, intersect highlights (transient, in-memory).

**Tile sources**:
- Raster basemap: OpenStreetMap raster tile URL (free, no API key needed for portfolio).
- Vector basemap: MapTiler or Protomaps free tier vector tile URL (configurable via env var).

**Custom POI markers**: `circle` layer with data-driven styling (`match` expression on
`asset_type`) for color coding; `symbol` layer for labels.

**Alternatives considered**:
- Leaflet: Rejected — constitution mandates MapLibre GL JS.
- Mapbox GL JS: Rejected — MapLibre is the open-source fork, no proprietary API key.

---

## 7. Recharts — Chart Component Design

**Decision**: Use Recharts (React-native chart library) for all chart widgets.
Two required chart types: `<BarChart>` (asset count by type/status) and `<AreaChart>`
(incident trend over time). Both consume the same filtered dataset from the global
filter context.

**Rationale**: Recharts is the most widely adopted React-compatible charting library,
built on D3, with TypeScript support and SSR-safe rendering (renders `null` on server,
hydrates on client). Chart.js was listed as an alternative in the spec — Recharts is
preferred for its React-native API and smaller bundle footprint.

**Alternatives considered**:
- Chart.js + react-chartjs-2: Viable alternative; Recharts chosen for cleaner React
  component API and better TypeScript types.
- D3 directly: Rejected — excessive complexity for standard bar/area charts.

---

## 8. Authentication — NextAuth.js v5 (Auth.js)

**Decision**: NextAuth.js v5 with GitHub OAuth2 as the default provider
(configurable via environment variables). JWT sessions. No password storage.

**Rationale**: GitHub OAuth2 is universally available to developers, requires no paid
plan, and is ideal for a portfolio project. The provider is swappable via env vars
(Google, Azure AD, etc.). Auth.js v5 is the current major version with native App
Router support.

**Session strategy**: JWT (stateless). Session validated in Next.js Middleware for all
protected routes. API Route Handlers validate session via `auth()` helper.

**Protected routes**: All routes under `/(dashboard)` and `/api/` (except `/api/health`)
require a valid session. Unauthorized requests redirect to `/login`.

---

## 9. CI/CD — GitHub Actions Pipeline Design

**Decision**: Two workflow files:
- `ci.yml` — triggered on push to any branch and PR to `develop`/`main`. Steps:
  lint → type-check → unit tests (Jest) → build → SonarQube scan.
- `cd.yml` — triggered on push to `develop` (staging) and tag push `v*.*.*` (production).

**SonarQube integration**: SonarCloud (free for public repos). Project key and token
stored as GitHub Actions secrets. `sonar-project.properties` in repo root.

**Required GitHub branch protection rules** (documented, not automated):
- `develop` and `main`: require status checks (CI workflow) to pass before merge.
- At least 1 reviewer approval required.
- No force pushes.

**Environment strategy**:
- `.env.local` — local development (gitignored).
- `.env.example` — committed, all variables with placeholder values.
- GitHub Actions secrets — production/staging values injected at runtime.
- `env.mjs` (T3 Env pattern) — Zod-validated environment schema, fails fast at startup.

---

## 10. Project Structure Decision

**Selected structure**: Next.js monorepo (single project — web application type).

```
smart-city-dashboard/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login)
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── page.tsx              # Home: summary cards + table + charts
│   │   ├── map/page.tsx          # Map View
│   │   └── layout.tsx            # Dashboard shell (sidebar, header)
│   ├── api/                      # Route Handlers
│   │   ├── assets/route.ts       # Asset CRUD + GeoJSON export
│   │   ├── assets/[id]/route.ts  # Single asset detail
│   │   ├── districts/route.ts    # District GeoJSON (choropleth)
│   │   ├── incidents/route.ts    # Incidents (heatmap source)
│   │   ├── search/route.ts       # Elasticsearch search
│   │   ├── spatial/
│   │   │   ├── buffer/route.ts   # PostGIS ST_Buffer
│   │   │   ├── intersect/route.ts # PostGIS ST_Intersects
│   │   │   └── distance/route.ts # PostGIS ST_Distance
│   │   ├── export/route.ts       # CSV + GeoJSON export
│   │   └── health/route.ts       # Service health checks
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                       # Shadcn UI components (copied in)
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── SummaryCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── GlobalFilters.tsx
│   │   ├── ChartBar.tsx
│   │   ├── ChartArea.tsx
│   │   └── AssetDetailModal.tsx
│   ├── map/                      # MapLibre components
│   │   ├── MapView.tsx           # "use client" map container
│   │   ├── LayerControls.tsx
│   │   ├── SpatialToolsPanel.tsx
│   │   ├── BasemapSwitcher.tsx
│   │   └── MarkerPopup.tsx
│   └── layout/                   # Shell components (Sidebar, Header)
├── lib/
│   ├── db/
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── mongoose.ts           # Mongoose connection singleton
│   │   ├── redis.ts              # ioredis client singleton
│   │   └── elasticsearch.ts      # Elasticsearch client singleton
│   ├── services/
│   │   ├── asset.service.ts      # Asset business logic
│   │   ├── district.service.ts   # District aggregation
│   │   ├── incident.service.ts   # Incident queries (MongoDB)
│   │   ├── search.service.ts     # Elasticsearch search logic
│   │   ├── cache.service.ts      # Redis cache helpers
│   │   └── spatial.service.ts    # PostGIS spatial operations
│   ├── validators/
│   │   └── *.schema.ts           # Zod schemas (shared client+server)
│   └── utils/
│       ├── geojson.ts            # GeoJSON ↔ WKT conversion helpers
│       ├── export.ts             # CSV + GeoJSON export utilities
│       └── cache-key.ts          # Deterministic cache key generation
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── store/
│   └── mapStore.ts               # Zustand: map state + layer toggles
├── types/
│   └── index.ts                  # Shared TypeScript types & interfaces
├── __tests__/                    # Jest tests
│   ├── services/
│   ├── api/
│   └── components/
├── e2e/                          # Playwright E2E tests
├── .github/workflows/
│   ├── ci.yml
│   └── cd.yml
├── env.mjs                       # T3 Env Zod validation
├── .env.example
├── sonar-project.properties
├── jest.config.ts
├── playwright.config.ts
├── tailwind.config.ts
├── next.config.ts
└── docker-compose.yml
```
