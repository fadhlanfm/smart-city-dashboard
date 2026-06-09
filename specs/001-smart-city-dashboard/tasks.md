---
description: "Task list for Smart City Operations & Asset Management Dashboard"
---

# Tasks: Smart City Operations & Asset Management Dashboard

**Input**: Design documents from `specs/001-smart-city-dashboard/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api.md ✅

**TDD Note**: The project constitution mandates TDD. Test tasks are included in every
user story phase and MUST be written so they FAIL before implementation begins.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Include exact file paths in every task description

## Path Conventions

- App Router pages: `app/(dashboard)/`, `app/api/`, `app/(auth)/`
- Components: `components/dashboard/`, `components/map/`, `components/layout/`, `components/ui/`
- Services: `lib/services/`
- DB clients: `lib/db/`
- Validators: `lib/validators/`
- Utilities: `lib/utils/`
- Tests: `__tests__/services/`, `__tests__/api/`, `__tests__/components/`
- E2E: `e2e/`
- Infrastructure: `prisma/`, `scripts/`, `.github/workflows/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize the Next.js project, install all dependencies, configure
tooling (ESLint, Prettier, Jest, Playwright), and scaffold the folder structure.
No application logic in this phase.

- [x] T001 Initialize Next.js 14 App Router project with TypeScript strict mode: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false`
- [x] T002 [P] Install all production dependencies: `npm install prisma @prisma/client mongoose ioredis @elastic/elasticsearch maplibre-gl @turf/turf recharts next-auth @auth/nextjs zod pino zustand react-hook-form @hookform/resolvers`
- [x] T003 [P] Install all dev dependencies: `npm install -D @types/node jest jest-environment-jsdom ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright @playwright/test pino-pretty prettier eslint-config-prettier lint-staged husky`
- [x] T004 [P] Install and initialize Shadcn UI: `npx shadcn@latest init` — configure `components.json` for default style, Tailwind, and `components/ui/` output path
- [x] T005 [P] Configure `tsconfig.json`: set `"strict": true`, path aliases (`@/*` → `./*`), exclude test dirs from build
- [x] T006 [P] Configure ESLint in `.eslintrc.json`: extend `next/core-web-vitals`, `@typescript-eslint/recommended`; add `no-console` rule for production paths
- [x] T007 [P] Configure Prettier in `.prettierrc`: single quotes, trailing commas, 100 char print width; add `.prettierignore`
- [x] T008 [P] Configure `jest.config.ts`: `testEnvironment: "jsdom"`, `moduleNameMapper` for `@/*` aliases, `coverageThreshold: { global: { lines: 80 } }`, collect coverage from `lib/**` and `components/**`
- [x] T009 [P] Configure `playwright.config.ts`: base URL `http://localhost:3000`, test dir `e2e/`, reporters, screenshot on failure
- [x] T010 [P] Setup Husky + lint-staged: pre-commit hook runs `eslint --fix` and `prettier --write` on staged files; commit-msg hook enforces Conventional Commits via `commitlint`
- [x] T011 [P] Create `docker-compose.yml` with all four services: `postgis/postgis:16-3.4` (port 5432), `mongo:7` (port 27017), `redis:7-alpine` (port 6379), `elasticsearch:8.13.0` (port 9200) — each with healthcheck
- [x] T012 [P] Create `.env.example` with all required variables: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`, `MONGODB_URI`, `REDIS_URL`, `ELASTICSEARCH_URL`, `ELASTICSEARCH_INDEX`, `NEXT_PUBLIC_MAPTILER_KEY`, `NODE_ENV`
- [x] T013 [P] Create `env.mjs` using T3 Env pattern: Zod schemas for server-side and client-side (`NEXT_PUBLIC_*`) variables; export validated `env` object; fast-fail on missing vars
- [x] T014 [P] Create `sonar-project.properties` with project key, sources, test paths, coverage report path, and exclusions
- [x] T015 [P] Scaffold all directory structure from plan.md: `app/`, `components/`, `lib/db/`, `lib/services/`, `lib/validators/`, `lib/utils/`, `store/`, `types/`, `__tests__/`, `e2e/`, `scripts/`, `.github/workflows/`
- [x] T016 [P] Add `npm` scripts to `package.json`: `dev`, `build`, `start`, `lint`, `type-check`, `test`, `test:coverage`, `test:e2e`, `es:setup`, `es:sync`

**Checkpoint**: Project scaffolded, all tooling configured, `npm run lint` and `npm run type-check` pass on empty project.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: All database clients, auth, middleware, and shared infrastructure that
EVERY user story depends on. No user story work can begin until this phase is complete.

- [x] T017 Initialize Prisma: `npx prisma init` — set `DATABASE_URL` in provider; create `prisma/schema.prisma` with `Asset` and `District` models using `Unsupported("geometry")` for PostGIS columns and all enums (`AssetType`, `AssetStatus`)
- [x] T018 [P] Create `prisma/migrations/0001_init/migration.sql` with `CREATE EXTENSION IF NOT EXISTS postgis;` before the generated table DDL — run `npx prisma migrate dev --name init`
- [x] T019 [P] Create `lib/db/prisma.ts`: singleton Prisma client using `globalThis` pattern to prevent multiple instances in Next.js dev hot-reload
- [x] T020 [P] Create `lib/db/mongoose.ts`: Mongoose connection singleton with `connect()` that caches connection on `globalThis`; exports `connectMongoDB()` helper; implements schema versioning (`schemaVersion` field) pattern
- [x] T021 [P] Create `lib/db/redis.ts`: ioredis singleton client; graceful degradation — catches connection errors, logs via Pino, returns `null` on failure so callers can fall through to primary DB
- [x] T022 [P] Create `lib/db/elasticsearch.ts`: `@elastic/elasticsearch` Client singleton; exports `esClient`; includes `ping()` health check
- [x] T023 Configure NextAuth.js v5 in `app/api/auth/[...nextauth]/route.ts` and `auth.ts`: GitHub OAuth2 provider; JWT session strategy; `authorized` callback protecting all `/(dashboard)` routes; export `auth`, `signIn`, `signOut` helpers
- [x] T024 [P] Create `middleware.ts` at repo root: use Auth.js `auth` middleware to protect `/(dashboard)` and `/api/*` routes (except `/api/health`); redirect unauthenticated to `/login`
- [x] T025 [P] Create `lib/utils/cache-key.ts`: exports `makeCacheKey(prefix: string, params: Record<string, unknown>): string` using `crypto.createHash('sha256')` of sorted JSON params
- [x] T026 [P] Create `lib/services/cache.service.ts`: `getCache<T>()`, `setCache<T>()`, `deleteCache()` wrapping ioredis with TTL; handles `null` client gracefully (Redis unavailable = cache miss)
- [x] T027 [P] Create `lib/utils/geojson.ts`: `featureFromAsset()`, `featureCollectionFromAssets()`, `wktToGeoJSON()`, `geoJSONToWKT()` utility functions; typed with GeoJSON types
- [x] T028 [P] Create `types/index.ts`: export all shared TypeScript interfaces — `Asset`, `District`, `Incident`, `AssetDocument`, `SearchResult`, `SpatialBufferResult`, `FilterParams`, `PaginationMeta`, `ApiResponse<T>`, `HealthStatus`
- [x] T029 [P] Create Mongoose schemas in `lib/db/mongoose.ts` sub-modules: `AssetDocumentSchema` (collection `assetDocuments`) and `IncidentSchema` (collection `incidents`) with all fields, indexes, and `schemaVersion` as per data-model.md
- [x] T030 [P] Create `prisma/seed.ts`: seed script generating 5 District records and 50+ Asset records with real PostGIS geometries using `ST_GeomFromText(wkt, 4326)` via `$executeRaw`; run with `npx prisma db seed`
- [x] T031 [P] Create `scripts/es-setup.ts`: creates `smart_city_assets` Elasticsearch index with full mapping from data-model.md; run with `npm run es:setup`
- [x] T032 [P] Create `scripts/es-sync.ts`: reads all assets from PostgreSQL via Prisma, upserts each into Elasticsearch index; run with `npm run es:sync`
- [x] T033 [P] Create `app/api/health/route.ts`: `GET` handler — ping all four services concurrently (`Promise.allSettled`), return `{ status, services, timestamp }` JSON within 500ms; no auth required
- [x] T034 [P] Create `app/(auth)/login/page.tsx`: Shadcn Card login UI with GitHub OAuth sign-in button; calls `signIn('github')`; no form inputs (OAuth only)
- [x] T035 [P] Create `components/layout/Sidebar.tsx` and `components/layout/Header.tsx`: Shadcn Sheet/NavigationMenu sidebar with links to Dashboard and Map View; Header shows user avatar from session + sign-out button
- [x] T036 Create `app/(dashboard)/layout.tsx`: wraps all dashboard pages; imports Sidebar + Header; validates session server-side via `auth()`ion server-side via `auth()`

**Checkpoint**: `docker compose up -d` starts all services healthy. `npm run dev` boots without errors. `/api/health` returns all four services `up`. Login flow completes via GitHub OAuth.

---

## Phase 3: User Story 1 — Operational Overview at a Glance (Priority: P1) 🎯 MVP

**Goal**: Functional dashboard home page with summary cards, global filters, paginated
data table, and bar/area charts — all driven by real PostgreSQL data.

**Independent Test**: Open dashboard, see populated cards and table, apply district
filter, observe all widgets update, export filtered data as CSV.

### Tests for User Story 1 ⚠️ Write FIRST — ensure they FAIL before implementation

- [x] T037 [P] [US1] Write unit test for `asset.service.ts → getFilteredAssets()` in `__tests__/services/asset.service.test.ts`: mock Prisma client; assert correct `where` clause built from filter params; assert pagination meta returned
- [x] T038 [P] [US1] Write unit test for `asset.service.ts → getAssetSummary()` in `__tests__/services/asset.service.test.ts`: assert correct aggregation shape returned; mock Prisma `groupBy` and `count`
- [x] T039 [P] [US1] Write unit test for `cache.service.ts` in `__tests__/services/cache.service.test.ts`: assert cache miss falls through; assert cache hit returns without calling primary; assert Redis unavailable does not throw
- [x] T040 [P] [US1] Write unit test for `GET /api/assets` Route Handler in `__tests__/api/assets.test.ts`: mock `asset.service`; assert Zod validation rejects invalid params; assert paginated response shape
- [x] T041 [P] [US1] Write React Testing Library test for `DataTable` in `__tests__/components/DataTable.test.tsx`: assert rows render from props; assert pagination controls appear for >20 items; assert sort header click fires callback
- [x] T042 [P] [US1] Write React Testing Library test for `SummaryCard` in `__tests__/components/SummaryCard.test.tsx`: assert value and label render; assert loading skeleton renders when `isLoading=true`
- [x] T043 [P] [US1] Write React Testing Library test for `GlobalFilters` in `__tests__/components/GlobalFilters.test.tsx`: assert district Select renders options; assert onChange callback fires with correct value; assert "Clear Filters" resets all fields

### Implementation for User Story 1

- [x] T044 [P] [US1] Create `lib/validators/filter.schema.ts`: Zod schema for `FilterParams` — `districtId?`, `type?` (AssetType enum), `status?` (AssetStatus enum), `dateFrom?`, `dateTo?`, `page`, `pageSize` (10/25/50 enum), `sort?`, `order?` (`asc`/`desc`) with `.refine()` for `dateFrom ≤ dateTo`
- [x] T045 [P] [US1] Create `lib/services/asset.service.ts`: `getFilteredAssets(filters: FilterParams)` — builds Prisma `findMany` with `where`, `orderBy`, `skip`, `take`; returns `ST_AsGeoJSON(geometry)` via `$queryRaw` for geometry field; wraps with `cache.service.ts` (TTL 30s)
- [x] T046 [P] [US1] Add `getAssetSummary(filters: FilterParams)` to `lib/services/asset.service.ts`: runs `COUNT`, `GROUP BY type`, `GROUP BY status` queries via Prisma `$queryRaw`; wraps with cache (TTL 60s)
- [x] T047 [P] [US1] Create `lib/services/district.service.ts`: `getAllDistricts()` returning all districts with aggregate fields; `getDistrictGeoJSON()` returning `ST_AsGeoJSON` for choropleth; wraps with cache (TTL 300s)
- [x] T048 [P] [US1] Create `app/api/assets/route.ts`: `GET` Route Handler — validates params via `filter.schema.ts`; calls `asset.service.getFilteredAssets()`; returns paginated JSON matching contracts/api.md shape; sets `X-Cache` header
- [x] T049 [P] [US1] Create `app/api/assets/summary/route.ts`: `GET` Route Handler — validates filter params; calls `asset.service.getAssetSummary()`; returns summary card payload
- [x] T050 [P] [US1] Create `app/api/districts/route.ts`: `GET` Route Handler calling `district.service.getAllDistricts()`
- [x] T051 [P] [US1] Add Shadcn components: `npx shadcn@latest add card table badge select button skeleton` — adds to `components/ui/`
- [x] T052 [P] [US1] Create `components/dashboard/SummaryCard.tsx`: Shadcn Card with `value`, `label`, `icon`, `trend` props; Skeleton loading state; animated number transition on value change
- [x] T053 [P] [US1] Create `components/dashboard/GlobalFilters.tsx`: Shadcn Select for district, type, status; DatePicker for date range (Shadcn Popover + Calendar); "Clear Filters" Button; `"use client"` — calls `onChange` callback on any field change
- [x] T054 [P] [US1] Create `components/dashboard/DataTable.tsx`: Shadcn Table with `columns` and `data` props; pagination via Shadcn Pagination (page, pageSize, total); sortable column headers; `"use client"`
- [x] T055 [P] [US1] Create `components/dashboard/ChartBar.tsx`: Recharts `<BarChart>` showing asset count by type; `"use client"` — receives `data` prop from parent Server Component
- [x] T056 [P] [US1] Create `components/dashboard/ChartArea.tsx`: Recharts `<AreaChart>` showing incident count trend over time; `"use client"` — receives `data` prop
- [x] T057 [US1] Create `app/(dashboard)/page.tsx`: Server Component; fetches summary, districts, initial asset page in parallel via `Promise.all`; renders `GlobalFilters`, four `SummaryCard`s, `DataTable`, `ChartBar`, `ChartArea` — passes data as props; `GlobalFilters` changes trigger client-side refetch via `useRouter` + URL search params pattern

**Checkpoint**: Dashboard home loads with real data. Applying district filter updates all widgets. Pagination navigates pages without full reload.

---

## Phase 4: User Story 4 — Global Search (Priority: P2, implemented before US2 as dependency)

**Goal**: Real-time search bar returning ranked results from Elasticsearch within 500ms
of debounce threshold; clicking a result navigates the map and opens the detail modal.

**Independent Test**: Type 3+ chars in search, see dropdown results within 500ms, click
a result and verify map pans + marker highlights.

### Tests for User Story 4 ⚠️ Write FIRST

- [x] T058 [P] [US4] Write unit test for `search.service.ts → searchAssets()` in `__tests__/services/search.service.test.ts`: mock `esClient.search()`; assert multi-match query built correctly; assert fuzzy and filter params applied; assert result mapping
- [x] T059 [P] [US4] Write unit test for `GET /api/search` in `__tests__/api/search.test.ts`: assert `q` param required (400 without it); assert response shape matches contracts/api.md; mock search service

### Implementation for User Story 4

- [x] T060 [P] [US4] Create `lib/validators/search.schema.ts`: Zod schema for `q` (string 1–200 chars, required), `districtId?`, `type?`, `size?` (1–20, default 10)
- [x] T061 [P] [US4] Create `lib/services/search.service.ts`: `searchAssets(params)` — builds Elasticsearch multi-match query on `name`, `address`, `tags` with `fuzziness: "AUTO"`; applies keyword filters for `district`, `type`, `status`; wraps with cache (TTL 15s); returns mapped `SearchResult[]`
- [x] T062 [P] [US4] Create `app/api/search/route.ts`: `GET` Route Handler — validates params via `search.schema.ts`; calls `search.service.searchAssets()`; returns JSON matching contracts/api.md
- [x] T063 [P] [US4] Add Shadcn components: `npx shadcn@latest add command popover input` — for search UI
- [x] T064 [US4] Create search bar component in `components/layout/Header.tsx` (update): Shadcn Command palette or Input + Popover dropdown; 300ms debounce via `useMemo`/`useEffect`; fetches `/api/search?q=...`; renders up to 10 results with name, type, district; "No results found" empty state; `"use client"`

**Checkpoint**: Search returns ranked results within 500ms. Empty state renders correctly.

---

## Phase 5: User Story 2 — Interactive Map Exploration (Priority: P2)

**Goal**: Full MapLibre map with raster/vector basemap switching, heatmap layer,
choropleth layer, POI markers with clickable popups opening the detail modal.

**Independent Test**: Open Map View, see markers, toggle heatmap on/off, toggle
choropleth, click marker to see popup, switch basemaps.

### Tests for User Story 2 ⚠️ Write FIRST

- [x] T065 [P] [US2] Write unit test for `district.service.ts → getDistrictGeoJSON()` in `__tests__/services/district.service.test.ts`: mock Prisma `$queryRaw`; assert GeoJSON FeatureCollection shape; assert `coverageScore` in properties
- [x] T066 [P] [US2] Write unit test for `GET /api/assets/geojson` in `__tests__/api/assets-geojson.test.ts`: assert GeoJSON FeatureCollection response; assert filter params applied
- [x] T067 [P] [US2] Write unit test for `GET /api/incidents/geojson` in `__tests__/api/incidents-geojson.test.ts`: assert GeoJSON FeatureCollection with Point geometries; mock incident service
- [x] T068 [P] [US2] Write unit test for `incident.service.ts → getIncidentGeoJSON()` in `__tests__/services/incident.service.test.ts`: mock Mongoose `find()`; assert GeoJSON output format

### Implementation for User Story 2

- [x] T069 [P] [US2] Create `lib/services/incident.service.ts`: `getIncidentGeoJSON(filters)` — queries MongoDB `incidents` collection via Mongoose; maps to GeoJSON FeatureCollection; wraps with cache (TTL 60s)
- [x] T070 [P] [US2] Create `app/api/assets/geojson/route.ts`: `GET` Route Handler — calls `asset.service.getAssetGeoJSON(filters)`; returns `FeatureCollection`; cache TTL 60s
- [x] T071 [P] [US2] Add `getAssetGeoJSON(filters)` to `lib/services/asset.service.ts`: `$queryRaw` selecting `ST_AsGeoJSON(geometry)` for all matching assets; wraps with cache (TTL 60s)
- [x] T072 [P] [US2] Create `app/api/districts/geojson/route.ts`: `GET` Route Handler — calls `district.service.getDistrictGeoJSON()`; returns `FeatureCollection`
- [x] T073 [P] [US2] Create `app/api/incidents/geojson/route.ts`: `GET` Route Handler — validates filter params; calls `incident.service.getIncidentGeoJSON()`
- [x] T074 [P] [US2] Create `store/mapStore.ts`: Zustand store with state for `activeBasemap` ('raster'|'vector'), `layerVisibility` (heatmap, choropleth, poi booleans), `selectedAssetId`, `mapRef`; actions `setBasemap()`, `toggleLayer()`, `selectAsset()`
- [x] T075 [US2] Create `components/map/MapView.tsx` (`"use client"`): initializes MapLibre `Map` instance; loads default raster basemap; registers five sources: districts GeoJSON, assets GeoJSON, incidents GeoJSON, buffer overlay, intersect overlay; connects to `mapStore`; fetches GeoJSON sources on mount via `/api/districts/geojson`, `/api/assets/geojson`, `/api/incidents/geojson`
- [x] T076 [US2] Add layer rendering to `MapView.tsx`: (a) choropleth `fill` layer on districts source — data-driven `fill-color` on `coverageScore`; (b) POI `circle` + `symbol` layers on assets source — data-driven color by `type`; (c) `heatmap` layer on incidents source — radius and intensity expressions
- [x] T077 [P] [US2] Create `components/map/BasemapSwitcher.tsx` (`"use client"`): Shadcn ToggleGroup with Raster/Vector options; on change calls `mapStore.setBasemap()` and swaps MapLibre style URL via `map.setStyle()`
- [x] T078 [P] [US2] Create `components/map/LayerControls.tsx` (`"use client"`): Shadcn Switch components for Heatmap and Choropleth layers; reads `layerVisibility` from `mapStore`; on toggle calls `map.setLayoutProperty(layerId, 'visibility', ...)`
- [x] T079 [US2] Add click handler to `MapView.tsx` for POI layer: on feature click, calls `mapStore.selectAsset(feature.properties.id)`; shows `MarkerPopup.tsx` at click coordinates
- [x] T080 [P] [US2] Create `components/map/MarkerPopup.tsx`: MapLibre `Popup` component rendering asset name, type, status, district; "View Details" Button that triggers `AssetDetailModal` via `mapStore.selectAsset()`
- [x] T081 Create `app/(dashboard)/map/page.tsx`: Server Component shell; renders `MapView`, `BasemapSwitcher`, `LayerControls`, `SpatialToolsPanel` (placeholder for US3) inside dashboard layout

**Checkpoint**: Map View renders with basemap, POI markers, heatmap, and choropleth. Layer toggles work. Marker popup appears on click.

---

## Phase 6: User Story 5 — Asset Data Detail & Documentation (Priority: P3)

**Goal**: Data Detail modal showing all structured fields, MongoDB photos/docs, and
per-asset GeoJSON export — triggered from table row, map popup, or search result.

**Independent Test**: Click any asset in the table to open the modal and see all fields,
photos tab, and export button.

### Tests for User Story 5 ⚠️ Write FIRST

- [ ] T082 [P] [US5] Write unit test for `GET /api/assets/[id]` in `__tests__/api/asset-detail.test.ts`: assert 404 for unknown ID; assert response merges Prisma asset with MongoDB document; mock both services
- [ ] T083 [P] [US5] Write unit test for `asset.service.ts → getAssetById()` in `__tests__/services/asset.service.test.ts`: assert Prisma findUnique called with correct ID; assert MongoDB `AssetDocument.findOne` called; assert merged response shape
- [x] T084 [P] [US5] Write React Testing Library test for `AssetDetailModal` in `__tests__/components/AssetDetailModal.test.tsx`: assert all attribute fields render; assert Photos tab switch shows photo grid; assert "Export GeoJSON" button is present and triggers download
- [x] T082 [P] [US5] Write unit test for `asset.service.ts → getAssetDetail(id)` in `__tests__/services/asset-detail.test.ts`: mock Prisma `findUnique` and Mongoose `find`; assert joined result shape
- [x] T083 [P] [US5] Write unit test for `GET /api/assets/[id]` in `__tests__/api/asset-detail.test.ts`: assert 404 for invalid ID; assert 200 with joined data

### Implementation for User Story 5

- [x] T084 [P] [US5] Create `lib/validators/id.schema.ts`: Zod schema validating standard UUID
- [x] T085 [P] [US5] Add `getAssetDetail(id)` to `lib/services/asset.service.ts`: queries Prisma for asset details; queries Mongoose `Incident` for recent incidents tied to `assetId`; merges into a single object; caches for 30s
- [x] T086 [P] [US5] Create `app/api/assets/[id]/route.ts`: `GET` Route Handler — validates `id`; calls `getAssetDetail()`; returns 404 or JSON response
- [x] T087 [P] [US5] Add Shadcn components: `npx shadcn@latest add dialog tabs scroll-area` — for modal UI
- [x] T088 [US5] Create `components/assets/AssetDetailModal.tsx` (`"use client"`): Shadcn Dialog component; accepts `assetId` and `isOpen` props; fetches `/api/assets/[id]` on open; renders Tabs for Overview, Incidents, Maintenance
- [x] T089 [US5] Create `components/assets/AssetOverviewTab.tsx`: displays asset metadata, type, status, location, and description in Shadcn Cards
- [x] T090 [US5] Create `components/assets/AssetMaintenanceTab.tsx`: placeholder indicating "Maintenance history not implemented in this version"
- [x] T091 [US5] Create `components/assets/AssetIncidentsTab.tsx`: renders list of recent incidents mapped from the unified API response
- [x] T092 [US5] Update `MarkerPopup.tsx` and Map `page.tsx` to mount/trigger `AssetDetailModal` when "View Details" is clicked in the POI popup

**Checkpoint**: Clicking any asset from table or map opens the detail modal with real data from both PostgreSQL and MongoDB. GeoJSON export downloads correctly.

---

## Phase 7: User Story 3 — Spatial Query & Distance Tools (Priority: P3)

**Goal**: Buffer, Intersect, and Distance spatial tools with PostGIS backend and
Turf.js client-side preview; results rendered on map and exportable as GeoJSON.

**Independent Test**: Place a point, set 2 km radius, click "Calculate Buffer", see
polygon on map and asset list in results panel, export as GeoJSON.

### Tests for User Story 3 ⚠️ Write FIRST

- [x] T093 [P] [US3] Write unit test for `spatial.service.ts → analyzeBuffer()` in `__tests__/services/spatial.service.test.ts`: mock `$queryRaw`; assert structure of `bufferGeoJSON` and `affectedAssets`
- [x] T094 [P] [US3] Write unit test for `spatial.service.ts → checkIntersection()` in `__tests__/services/spatial.service.test.ts`: mock `$queryRaw`; assert districts array and point Feature returned
- [x] T095 [P] [US3] Write unit test for `POST /api/spatial/buffer` in `__tests__/api/spatial.test.ts`: assert validation error on large radius; assert 200 on success
- [x] T096 [P] [US3] Write unit test for `POST /api/spatial/intersect` in `__tests__/api/spatial.test.ts`: assert validation error on invalid lat/lon; assert 200 on success

- [x] T097 [P] [US3] Create `lib/validators/spatial.schema.ts`: `bufferSchema` (assetId, radiusMeters max 5000) and `intersectSchema` (lon, lat)
- [x] T098 [P] [US3] Create `lib/services/spatial.service.ts`: `analyzeBuffer()` uses PostGIS `ST_Buffer` and `ST_DWithin` to find nearby assets; `checkIntersection()` uses `ST_Intersects` to find districts covering a clicked point
- [x] T099 [P] [US3] Create `app/api/spatial/buffer/route.ts`: `POST` Route Handler for buffer analysis
- [x] T100 [P] [US3] Create `app/api/spatial/intersect/route.ts`: `POST` Route Handler for point intersection
- [x] T101 [P] [US3] Add Shadcn components: `npx shadcn@latest add slider`
- [x] T102 [US3] Create `components/map/SpatialToolsPanel.tsx` (`"use client"`): floating card on the map; Buttons to toggle "Buffer Mode" or "Intersect Mode"; Slider for Buffer Radius (50m to 2000m); displays query results (number of affected assets or district names)
- [x] T103 [US3] Update `store/mapStore.ts` with spatial tool state: `spatialMode` ('none' | 'buffer' | 'intersect'), `bufferRadius`, `bufferResult`, `intersectResult`
- [x] T104 [US3] Update `MapView.tsx` to handle map clicks for spatial analysis: if buffer mode + asset clicked → fetch `/api/spatial/buffer`; if intersect mode + map clicked → fetch `/api/spatial/intersect`
- [x] T105 [US3] Add buffer polygon and intersection point rendering to `MapView.tsx`: dynamically add/remove `buffer-fill` and `intersect-point` MapLibre layers based on `bufferResult` and `intersectResult` state
- [x] T106 [US3] Wire `SpatialToolsPanel` into Map `page.tsx`

**Checkpoint**: Buffer tool returns polygon + assets. Intersect returns overlapping features. Distance calculates correctly. CSV and GeoJSON exports download with correct content.

---

## Phase 8: User Story 6 — CI/CD Pipeline & Quality Gate (Priority: P1)

**Goal**: GitHub Actions workflows for CI (lint + type-check + tests + SonarQube) and
CD (staging deploy). PR merge blocked when any check fails.

**Independent Test**: Push a branch with a failing unit test; confirm GitHub Actions
marks the workflow as failed and the PR merge button is blocked.

- [x] T107 [P] [US6] Create `.github/workflows/ci.yml`: triggers on `push` (all branches) and `pull_request` (targeting `develop`, `main`); jobs: (1) `lint-typecheck` — `npm run lint && npm run type-check`; (2) `test` (depends on lint) — `npm test -- --coverage`; (3) `build` (depends on lint) — `npm run build`; (4) `sonarqube` (depends on test) — uses `sonarqube-scan-action`; all jobs use `ubuntu-latest`, Node 20
- [x] T108 [P] [US6] Create `.github/workflows/cd.yml`: triggers on push to `develop` (staging) and tag `v*.*.*` (production); job: build Docker image, push to registry, deploy to target; placeholder deploy step with env vars from GitHub secrets
- [x] T109 [P] [US6] Add GitHub Actions environment variables and secrets documentation to `quickstart.md`: `SONAR_TOKEN`, `SONAR_HOST_URL`, `AUTH_SECRET`, `DATABASE_URL`, `MONGODB_URI`, `REDIS_URL`, `ELASTICSEARCH_URL`, `NEXT_PUBLIC_MAPTILER_KEY`
- [x] T110 [P] [US6] Create `Dockerfile`: multi-stage build — `node:20-alpine` base; `deps` stage installs production deps; `builder` stage runs `npm run build`; `runner` stage copies `.next/standalone` output; exposes port 3000; sets `NODE_ENV=production`
- [x] T111 [P] [US6] Add `next.config.ts` configuration: `output: 'standalone'` for Docker; `images.remotePatterns` for photo CDN; security headers via `headers()` (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)

**Checkpoint**: Pushing a commit triggers CI workflow in GitHub Actions within 60 seconds. A PR with a failing test cannot be merged. `docker build .` produces a valid image.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end verification, OpenTelemetry, accessibility audit, performance
tuning, and documentation finalization.

- [x] T112 [P] Write Playwright E2E test in `e2e/dashboard.spec.ts` (US1): load dashboard, assert 4 summary cards visible, apply district filter, assert table updates, click Export CSV, assert download triggered
- [x] T113 [P] Write Playwright E2E test in `e2e/map.spec.ts` (US2): load map page, assert map canvas visible, toggle heatmap layer, assert layer visible, click a POI marker, assert popup appears
- [x] T114 [P] Write Playwright E2E test in `e2e/search.spec.ts` (US4): type 3+ chars in search bar, assert dropdown appears within 500ms, click first result, assert map pans
- [x] T115 [P] Add Pino structured logger to `lib/utils/logger.ts`: `pino({ level: process.env.LOG_LEVEL || 'info' })`; export as `logger`; replace any `console.log/error` in production paths
- [x] T116 [P] Add Vercel Serverless Mock DB Hydration: Implement `mock_new_assets` and `mock_deleted_assets` in `localStorage` across `AssetTableWrapper.tsx`, `MapView.tsx`, `Header.tsx`, and `MarkerPopup.tsx` to simulate CRUD operations on a read-only filesystem without an active cloud DB.
- [x] T117 [P] Run OWASP security audit: check all Zod schemas cover every API input; verify `Content-Security-Policy` header in `next.config.ts`; verify `SameSite=Strict` cookie on auth session; verify no secrets in any committed file via `git log --all -p | grep -i "secret\|password\|token"`
- [x] T118 [P] Fix UI Loading States & Auth Routing: Create `middleware.ts` to enforce NextAuth `authConfig`; add `redirectTo: '/'` to `signIn()` actions; implement React `useFormStatus` and `Loader2` spinners on Login, Logout, and Export CSV/GeoJSON buttons.
- [x] T119 [P] Accessibility audit: install `@axe-core/react` in dev; add to `app/layout.tsx` (dev only); run against Dashboard and Map View; fix all WCAG 2.1 AA violations in Shadcn components
- [x] T120 [P] Performance: add `loading.tsx` files for all dashboard routes (Suspense boundaries); ensure all Server Component data fetches use `React.cache()`; verify Lighthouse LCP <3s on dashboard
- [x] T121 [P] Code quality review: run ESLint with `--max-warnings=0`; run SonarQube locally; resolve all complexity violations (cyclomatic >10); ensure zero `console.log` in production paths
- [x] T122 [P] Update `specs/001-smart-city-dashboard/quickstart.md`: verify all 9 steps are accurate against final implementation; add any missing troubleshooting entries
- [x] T123 [P] Verify Docker Compose starts all services cleanly: `docker compose down -v && docker compose up -d` — all four services reach `healthy` state; `npm run dev` boots without errors; `/api/health` returns all `up`
- [x] T124 Final SonarQube gate check: run full analysis; confirm "Passed" with zero critical/blocker issues and coverage ≥80%

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 — Dashboard)**: Depends on Phase 2 — P1 priority, implement first
- **Phase 4 (US4 — Search)**: Depends on Phase 2 — implement in parallel with US1 after Phase 2
- **Phase 5 (US2 — Map)**: Depends on Phase 2 + US1 assets GeoJSON endpoint
- **Phase 6 (US5 — Detail Modal)**: Depends on Phase 2 + `/api/assets/[id]` (US1 adjacent)
- **Phase 7 (US3 — Spatial Tools)**: Depends on Phase 5 (Map View must exist)
- **Phase 8 (US6 — CI/CD)**: Can be done in parallel with Phase 3 after Phase 1
- **Phase 9 (Polish)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Foundation only — no story dependencies
- **US6 (P1)**: Foundation + Setup only — CI/CD is infra, not feature-dependent
- **US4 (P2)**: Foundation only — Elasticsearch setup complete (T031–T032)
- **US2 (P2)**: Foundation + US1 GeoJSON endpoints (T070, T072, T073)
- **US5 (P3)**: Foundation + `/api/assets/[id]` (can be done in parallel with US2)
- **US3 (P3)**: Foundation + US2 map component (SpatialToolsPanel lives in map)

### Parallel Opportunities Within Each Story

- All test tasks `[P]` within a story can start simultaneously
- All model/schema tasks `[P]` within a story can start simultaneously
- Service tasks and Route Handler tasks `[P]` within same story can run in parallel
- CI/CD tasks (T107–T111) all `[P]` — independent files

---

## Parallel Execution Example: User Story 1 (US1)

```bash
# Round 1 — All tests in parallel (write first, ensure FAIL):
T037 asset.service.test.ts → getFilteredAssets()
T038 asset.service.test.ts → getAssetSummary()
T039 cache.service.test.ts
T040 api/assets.test.ts
T041 components/DataTable.test.tsx
T042 components/SummaryCard.test.tsx
T043 components/GlobalFilters.test.tsx

# Round 2 — All validators + services in parallel:
T044 lib/validators/filter.schema.ts
T045 lib/services/asset.service.ts → getFilteredAssets()
T046 lib/services/asset.service.ts → getAssetSummary()
T047 lib/services/district.service.ts

# Round 3 — All Route Handlers in parallel:
T048 app/api/assets/route.ts
T049 app/api/assets/summary/route.ts
T050 app/api/districts/route.ts
T051 Shadcn component installs

# Round 4 — All UI components in parallel:
T052 SummaryCard.tsx
T053 GlobalFilters.tsx
T054 DataTable.tsx
T055 ChartBar.tsx
T056 ChartArea.tsx

# Round 5 — Assemble page (depends on T052–T056):
T057 app/(dashboard)/page.tsx
```

---

## Implementation Strategy

### MVP: User Story 1 + CI/CD (Phase 3 + Phase 8)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 8: CI/CD pipeline (parallel with Phase 3)
4. Complete Phase 3: US1 Dashboard
5. **VALIDATE**: Dashboard loads with real data; CI pipeline passes; export works
6. Demo: Fully functional operations dashboard with automated quality gate

### Incremental Delivery

1. Setup + Foundation → all services running, auth working
2. US1 (P1) → operational dashboard MVP + CI/CD
3. US4 (P2) + US2 (P2) → search + map view (can be parallel)
4. US5 (P3) → asset detail modal
5. US3 (P3) → spatial analysis tools
6. Polish → production-ready

### Parallel Team Strategy (4 developers)

After Phase 2 completion:
- Developer A: US1 (Dashboard home)
- Developer B: US6 (CI/CD setup) → then US4 (Search)
- Developer C: US2 (Map View)
- Developer D: US5 (Detail Modal) → then US3 (Spatial Tools)

---

## Notes

- `[P]` tasks = different files, no dependencies on incomplete tasks
- `[Story]` label maps each task to its user story for traceability
- TDD is MANDATORY per constitution: red → green → refactor for all service and API tasks
- Commit after each task or logical group using Conventional Commits
- Stop at each **Checkpoint** to validate the story independently before moving on
- `npm run type-check` MUST pass after every task before committing
- Never use `console.log` in production paths — use `logger` from `lib/utils/logger.ts`
