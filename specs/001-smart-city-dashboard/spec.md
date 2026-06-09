# Feature Specification: Smart City Operations & Asset Management Dashboard

**Feature Branch**: `001-smart-city-dashboard`

**Created**: 2026-06-08

**Status**: Draft

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Operational Overview at a Glance (Priority: P1)

A city operations manager opens the dashboard and immediately sees the health and status
of all managed assets (roads, utilities, parks, public facilities) through summary cards,
trend charts, and a live data table. They apply global filters (by district, asset type,
date range, or status) to focus on a specific area or category without navigating away
from the main view.

**Why this priority**: This is the core value proposition of the product. Without a
functional overview screen, the application delivers no value. Every other feature depends
on this data being accessible and readable.

**Independent Test**: A tester can open the dashboard, see populated summary cards and a
data table, apply a district filter, and observe all widgets update to reflect filtered
data — without needing the map or any other module.

**Acceptance Scenarios**:

1. **Given** the dashboard loads, **When** the page renders, **Then** at least four
   summary cards are visible (e.g., Total Assets, Active Incidents, Maintenance Pending,
   Coverage Area) with real data values — no placeholders.
2. **Given** summary cards are displayed, **When** a user selects a district from the
   global filter, **Then** all summary cards, the data table, and chart widgets update
   to show data scoped to that district only within 2 seconds.
3. **Given** the data table is visible, **When** the dataset exceeds 20 records,
   **Then** pagination controls appear and navigating between pages works without
   a full page reload.
4. **Given** a user is viewing filtered data, **When** they click "Export", **Then**
   a `.csv` file downloads containing exactly the records currently visible in the
   filtered data table.

---

### User Story 2 — Interactive Map Exploration (Priority: P2)

A field supervisor opens the Map View to visually explore asset locations and service
coverage. They toggle between a heatmap layer (showing incident density) and a choropleth
layer (showing asset coverage per district). They click on individual POI markers to see
detailed asset information in a popup. They can switch between raster (satellite imagery)
and vector tile basemaps.

**Why this priority**: The Web GIS component is the feature that most differentiates this
dashboard from a generic data table product. It communicates spatial relationships that
tabular data cannot.

**Independent Test**: A tester can open the Map View, see assets plotted as POI markers
on a basemap, toggle the heatmap layer on/off, click a marker to see its detail popup,
and switch basemaps — all without the dashboard table or search features.

**Acceptance Scenarios**:

1. **Given** the Map View is open, **When** the map loads, **Then** the default basemap
   renders without blank tiles and at least one POI layer is visible with markers.
2. **Given** the map is loaded, **When** a user toggles the "Incident Heatmap" layer,
   **Then** a density heatmap overlay appears or disappears within 1 second.
3. **Given** the map is loaded, **When** a user toggles the "District Coverage"
   choropleth, **Then** district polygons render with graduated color fills proportional
   to the coverage metric.
4. **Given** POI markers are visible, **When** a user clicks a marker, **Then** a popup
   appears within 500ms showing asset name, type, status, district, and a "View Details"
   link opening the Data Detail modal.
5. **Given** the map is showing a raster basemap, **When** a user selects "Vector Tiles"
   from the basemap switcher, **Then** the map transitions to a vector tile basemap
   without re-loading the POI layers.

---

### User Story 3 — Spatial Query & Distance Tools (Priority: P3)

A planning analyst uses the spatial tools panel to draw a point on the map and calculate
the service area reachable within a given radius (Buffer). They then select two layers and
run an Intersection query to identify assets within a flood zone polygon. They use the
Distance tool to measure the straight-line distance between two selected assets.

**Why this priority**: Spatial query functionality is the advanced analytical layer. It
adds unique value for planning workflows but is not required for basic operations
monitoring. It builds on the functional map (US2) being complete.

**Independent Test**: A tester can open the spatial tools panel, place a point, enter a
radius in kilometres, and see a buffer polygon rendered on the map with a list of assets
inside that buffer returned in the results panel — independent of the dashboard table or
search.

**Acceptance Scenarios**:

1. **Given** the spatial tools panel is open, **When** a user places a point and sets a
   radius of 2 km then clicks "Calculate Buffer", **Then** a buffer polygon is drawn on
   the map and a results list shows all assets whose locations fall within that polygon.
2. **Given** two layers are selected in the Intersect tool, **When** the user runs the
   query, **Then** only assets geometrically intersecting both selected layer boundaries
   are returned in the results panel, and highlighted on the map.
3. **Given** the Distance tool is active, **When** a user clicks two asset markers on
   the map, **Then** the straight-line distance between them is calculated and displayed
   in both kilometres and miles in the tools panel.
4. **Given** a buffer or intersect query returns results, **When** the user clicks
   "Export Results", **Then** a `.geojson` file downloads containing the result features
   with all associated attribute data.

---

### User Story 4 — Global Search (Priority: P2)

A user types an asset name, address, or POI keyword into the global search bar. Results
appear within 500ms as they type (debounced). Selecting a result navigates the map to
that location and highlights the asset, and optionally opens its Data Detail modal.

**Why this priority**: Search is the primary navigation mechanism for operators who know
what they are looking for. It shortens the time-to-information dramatically compared to
filtering tables or visually hunting the map.

**Independent Test**: A tester can type a partial asset name into the search bar and see
a dropdown of matching results within 500ms. Clicking a result pans the map to the asset
location and opens its detail modal — with no other dashboard interaction required.

**Acceptance Scenarios**:

1. **Given** a user types 3 or more characters in the search bar, **When** 500ms elapses
   since the last keystroke, **Then** a results dropdown appears with up to 10 matching
   assets or addresses, ranked by relevance.
2. **Given** search results are visible, **When** a user clicks a result, **Then** the
   Map View pans and zooms to that asset's location and the asset marker is highlighted.
3. **Given** a search returns zero results, **When** the dropdown renders, **Then** a
   "No results found" message is shown — no blank dropdown or silent failure.

---

### User Story 5 — Asset Data Detail & Documentation (Priority: P3)

A maintenance officer clicks on an asset (from the table, map, or search result) to open
a Data Detail modal. The modal shows all structured attribute data for the asset, embedded
photos, and linked documentation. The officer can see the asset's full maintenance history
sourced from dynamic records.

**Why this priority**: Detailed asset records with documentation give the dashboard
operational depth. Field officers need to see photos and notes, not just structured fields.
This is additive to the core view and does not block other stories.

**Independent Test**: A tester can open the detail modal for any asset and see structured
metadata fields, at least one embedded photo (if available), and a documentation section —
without requiring the spatial tools or search features to be complete.

**Acceptance Scenarios**:

1. **Given** a user triggers the detail modal for an asset, **When** the modal opens,
   **Then** all structured attribute fields (name, type, status, district, coordinates,
   last-updated) are displayed within 1 second.
2. **Given** the modal is open for an asset with associated photos, **When** the Photos
   tab is selected, **Then** thumbnails load and clicking one shows a full-size preview.
3. **Given** the modal is open, **When** a user clicks "Export as GeoJSON", **Then** a
   single-feature `.geojson` file for that asset downloads immediately.

---

### User Story 6 — CI/CD Pipeline & Code Quality Gate (Priority: P1)

Every code push to any branch triggers automated checks: Jest unit tests run, SonarQube
analysis executes, and the build is validated. A pull request to `develop` or `main`
CANNOT be merged unless all checks pass. The pipeline deploys to a staging environment
on merge to `develop`.

**Why this priority**: Production-readiness is a day-one requirement per the project
constitution. The CI/CD pipeline is the enforcement mechanism for all other quality
principles. Without it, every other quality principle becomes aspirational.

**Independent Test**: A tester can push a branch with a deliberately failing unit test and
observe that the GitHub Actions workflow marks the PR as "failed" and blocks merging —
independent of any application feature.

**Acceptance Scenarios**:

1. **Given** a developer pushes a commit to any branch, **When** the push completes,
   **Then** a GitHub Actions workflow starts within 60 seconds running lint, type-check,
   and unit tests.
2. **Given** any unit test in the test suite fails, **When** the CI workflow runs,
   **Then** the workflow exits with a failure status and the PR merge button is blocked.
3. **Given** all CI checks pass on a PR targeting `develop`, **When** the PR is merged,
   **Then** an automated deployment to the staging environment is triggered within
   2 minutes of merge completion.
4. **Given** a `.env.example` file exists in the repository, **When** the application
   starts in any environment, **Then** all required environment variables are validated
   at startup and any missing variable causes an immediate, descriptive startup failure
   — not a runtime crash.

---

### User Story 7 — Asset CRUD Operations (Priority: P1)

An authorized operator uses the dashboard to create a new asset, edit an existing asset's details (such as updating its status to "Maintenance", changing its district, or fixing its coordinates), and permanently delete assets that are no longer valid. The system ensures robust data integrity and cache invalidation so that changes are immediately reflected in the table and map without manual refresh.

**Why this priority**: While viewing data is essential, keeping the spatial data accurate and up-to-date is a core operational requirement for city management.

**Independent Test**: A tester can open the Asset Directory table, click "Add Asset" to create a new POI on the map, edit its name and coordinates, and subsequently delete it, observing the UI update smoothly with proper colored toast notifications and dialog confirmations.

**Acceptance Scenarios**:

1. **Given** a user is on the dashboard, **When** they click "Add Asset", fill in the form (including map point selection), and click "Create", **Then** the asset is safely saved (using a client-side Local Storage hydration layer to simulate persistence on Vercel's serverless environment), the modal closes, and the new asset appears immediately in the data table.
2. **Given** an asset exists, **When** a user clicks "Edit", changes the status to "Maintenance", and clicks "Save", **Then** the mock service reconstructs the asset, updates the Local Storage state, and the table reflects the new status instantly without formatting errors (e.g. comma parsing).
3. **Given** a user clicks "Delete" on an asset, **When** the Shadcn AlertDialog appears and they confirm, **Then** the asset ID is recorded in the deleted assets Local Storage array, preventing it from rendering in the UI or Map View, simulating a successful deletion.

---

### Edge Cases

- What happens when a spatial query returns zero results (empty geometry intersection)?
  → The results panel shows "No features found within the selected area" — no crash or
  blank panel.
- What happens when the database is unreachable at startup?
  → The health endpoint returns a degraded status per service, and the UI shows a
  non-blocking connectivity warning banner rather than a blank page.
- What happens when a map tile source is unavailable?
  → The map falls back to a locally cached tile set or shows a "Tile service unavailable"
  overlay without crashing the application.
- What happens when an export query is too large (>10,000 records)?
  → The system enforces a maximum export size of 10,000 records and notifies the user
  to apply filters before exporting.
- What happens when a user applies conflicting filters (e.g., district A + a POI that
  belongs to district B)?
  → Zero results are returned and a clear "No records match the selected filters" message
  is displayed.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a dashboard home page with a minimum of four
  summary metric cards reflecting live, filtered data.
- **FR-002**: The system MUST provide global data filters (district, asset type, status,
  date range) that simultaneously update all dashboard widgets (cards, charts, table).
- **FR-003**: The data table MUST support server-side pagination (configurable page sizes:
  10, 25, 50 records per page) and column-based sorting.
- **FR-004**: The system MUST render at least two chart types (bar/column and line/area)
  from the same filtered dataset displayed in the table.
- **FR-005**: Users MUST be able to export the currently filtered table dataset as a
  `.csv` file without navigating away from the dashboard.
- **FR-006**: Users MUST be able to export individual asset records or query results as
  `.geojson` files.
- **FR-007**: The system MUST provide an interactive map with support for raster basemap
  (satellite) and vector tile basemap switching.
- **FR-008**: The map MUST support a heatmap layer for incident/event density
  visualization.
- **FR-009**: The map MUST support a choropleth layer rendering district-level aggregate
  metrics as graduated color fills.
- **FR-010**: The map MUST render custom POI markers for each asset, with clickable
  popups showing a summary and a "View Details" link.
- **FR-011**: The system MUST provide a Buffer spatial tool: given a point and radius
  (in km), it MUST calculate and display the buffer polygon and return all assets within
  that area.
- **FR-012**: The system MUST provide an Intersect spatial tool: given two selected
  feature layers, return and highlight features geometrically intersecting both.
- **FR-013**: The system MUST provide a Distance tool returning straight-line distance
  between two user-selected map points in both km and miles.
- **FR-014**: All spatial data MUST be stored and exchanged in GeoJSON format; raw
  geometry storage in the database MUST use WKT-compatible representation via the
  PostGIS spatial type.
- **FR-015**: The system MUST provide a global search bar returning ranked results for
  assets, POIs, and addresses within 500ms of the debounce threshold (300ms debounce).
- **FR-016**: The Data Detail modal MUST display all structured attribute fields, embedded
  media (photos), linked documentation, and a per-asset GeoJSON export action.
- **FR-017**: All mutating operations (create, update, delete when implemented) MUST be
  protected by CSRF tokens and server-side input validation using a schema validator.
- **FR-018**: All API responses for heavy spatial queries and search results MUST be
  cached to deliver sub-second responses on repeated identical requests.
- **FR-019**: The system MUST expose a `/api/health` endpoint reporting connectivity
  status for each dependent service (PostgreSQL, MongoDB, Redis, Elasticsearch).
- **FR-020**: The CI/CD pipeline MUST enforce automated lint, type-check, unit-test, and
  SonarQube quality gates on every push and pull request.
- **FR-021**: The application MUST validate all required environment variables at startup
  and fail fast with a descriptive error if any are missing.

> **Constitution Alignment — Mandatory for every feature**:
> - **Security**: Input validation on all API endpoints (Zod schemas); CSRF protection on
>   all mutating routes; no secrets in repository; NextAuth.js for authentication.
> - **GIS**: All spatial data in EPSG:4326; MapLibre GL JS for rendering; PostGIS for
>   server-side spatial operations; Turf.js for client-side spatial calculations.
> - **Testing**: Jest unit tests for all service functions and API handlers; React Testing
>   Library for component tests; Playwright E2E tests covering primary user journeys
>   (US1, US2, US4).
> - **Accessibility**: All interactive components (modals, filters, tables, map controls)
>   MUST meet WCAG 2.1 AA via Shadcn/Radix semantics and keyboard navigation.

### Key Entities

- **Asset**: The primary managed entity. Represents a physical infrastructure item
  (road segment, utility node, park facility, public building). Has a point or polygon
  geometry, type, status, district affiliation, and maintenance history.
- **District**: A named administrative or planning polygon. Used for choropleth rendering
  and filter scoping. Contains aggregate metric fields.
- **Incident / Event**: A time-bounded occurrence attached to an Asset or location (e.g.,
  outage, maintenance request). Used for heatmap density and trend charting.
- **POI (Point of Interest)**: A searchable named location with a point geometry, address,
  and category. May overlap with Asset or be an independent reference point.
- **Document / Photo**: A binary or URL reference to documentation or imagery associated
  with an Asset. Stored as dynamic records supporting flexible metadata.
- **Search Index Record**: A denormalized, flattened representation of Asset and POI data
  optimised for full-text and geo-distance search queries.
- **Cache Entry**: A short-lived, keyed snapshot of a computationally expensive API
  response (spatial query result, aggregated metrics, search results).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A city operations manager can load the dashboard home page and see all
  summary cards populated with live data within 3 seconds on a standard broadband
  connection.
- **SC-002**: Applying any global filter combination updates all dashboard widgets
  (cards, charts, table) within 2 seconds of the filter selection.
- **SC-003**: The map loads and renders the default basemap with at least one POI layer
  within 4 seconds of the Map View being opened.
- **SC-004**: The global search bar returns a ranked results dropdown for a 3-character
  query within 500ms of the debounce threshold firing.
- **SC-005**: A Buffer spatial query for a 5 km radius returns results and renders the
  polygon on the map within 3 seconds.
- **SC-006**: The Data Detail modal opens and displays all asset attribute fields within
  1 second of the user triggering it.
- **SC-007**: Exporting up to 10,000 filtered records as `.csv` completes and triggers
  a browser download within 10 seconds.
- **SC-008**: Repeated identical API requests (within the cache TTL window) are served
  without hitting the database, resulting in response times under 150ms.
- **SC-009**: A GitHub Actions CI run (lint + type-check + unit tests) completes within
  5 minutes for a standard feature branch push.
- **SC-010**: A pull request with any failing unit test CANNOT be merged to `develop`
  or `main` — the merge button is blocked by the required CI status check.
- **SC-011**: Jest unit test coverage for all new and modified modules is at or above
  80% line coverage as reported by the CI pipeline.
- **SC-012**: SonarQube quality gate reports "Passed" with zero critical or blocker
  issues before any feature branch is merged.
- **SC-013**: `npm audit` reports zero high or critical vulnerabilities in the
  production dependency tree at the time of each release.
- **SC-014**: The application `/api/health` endpoint returns a response within 500ms
  indicating the status of all four dependent services.

---

## Assumptions

- Users are authenticated employees of the city operations authority. Public-facing
  anonymous access is out of scope for this version.
- The primary user device is a modern desktop browser (Chrome, Firefox, Edge — latest
  two major versions). Mobile-responsive layout is required but a dedicated mobile app
  is out of scope.
- All four backend services (PostgreSQL/PostGIS, MongoDB, Redis, Elasticsearch) are
  assumed to be provisioned and reachable via environment variable connection strings
  before the application starts.
- Asset data already exists in the PostgreSQL/PostGIS database (seeded during
  development setup). Data ingestion pipelines are out of scope for this specification.
- The spatial reference system for all data is WGS84 / EPSG:4326. Coordinate
  reprojection is out of scope for this version.
- The SonarQube instance is hosted externally (SonarCloud or a self-hosted server) and
  is assumed to be provisioned with a project key and token before CI integration.
- Real-time live data updates (WebSocket/Server-Sent Events) are out of scope. Data
  refreshes on page load or filter interaction only.
- Authentication provider is an OAuth2-compatible provider (e.g., Google Workspace or
  GitHub); the specific provider is configurable via environment variables.
