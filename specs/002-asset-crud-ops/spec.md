# Feature Specification: Asset CRUD Operations

**Feature Branch**: `002-asset-crud-ops`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "tolong tambahkan fitur add, edit, dan delete ya"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create New Asset (Priority: P1)

As an administrator, I want to add a new infrastructure asset to the system so that it can be monitored and managed on the dashboard.

**Why this priority**: Without the ability to create assets, the system cannot grow or track new infrastructure.

**Independent Test**: Can be fully tested by submitting a new asset form with valid coordinates and verifying it appears on the Map, in PostgreSQL, MongoDB, and Elasticsearch.

**Acceptance Scenarios**:

1. **Given** an admin is on the dashboard, **When** they click "Add Asset", fill out the form (Name, Type, District, Location on Map), and submit, **Then** the asset is created across all databases and the map reflects the new POI.
2. **Given** an admin submits the form with missing required fields, **When** they click submit, **Then** validation errors are displayed.

---

### User Story 2 - Edit Existing Asset (Priority: P1)

As an administrator, I want to modify the details or location of an existing asset to correct mistakes or update its operational status.

**Why this priority**: Asset conditions and details change over time. Keeping data accurate is critical for operations.

**Independent Test**: Can be fully tested by opening an existing asset, changing its name and status, and verifying the changes persist across all databases.

**Acceptance Scenarios**:

1. **Given** an existing asset, **When** an admin clicks "Edit" and updates the status from ACTIVE to INACTIVE, **Then** the status is updated in Postgres and Elasticsearch, and the cache is invalidated.

---

### User Story 3 - Delete Asset (Priority: P2)

As an administrator, I want to remove an asset from the system if it has been permanently decommissioned or entered by mistake.

**Why this priority**: Helps maintain a clean database, though less frequent than creations or edits.

**Independent Test**: Can be fully tested by deleting an asset and confirming it no longer appears in search results, the map, or the database.

**Acceptance Scenarios**:

1. **Given** an existing asset, **When** an admin clicks "Delete" and confirms the prompt, **Then** the asset is removed/archived according to the retention policy.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a user interface (Form/Modal) to input asset details (Name, Type, District, Status) and pick coordinates from an interactive map.
- **FR-002**: System MUST synchronize creation across PostgreSQL (core), MongoDB (document initialization), and Elasticsearch (search index).
- **FR-003**: System MUST invalidate relevant Redis caches when an asset is created, updated, or deleted to ensure data freshness.
- **FR-004**: System MUST handle asset deletion via hard-delete (permanently removing records from PostgreSQL, MongoDB, and Elasticsearch).
- **FR-005**: System MUST allow any authenticated/registered user to perform CRUD operations on POI assets. Operations on Districts and Incidents are out of scope.

> **Constitution Alignment — Mandatory for every feature**:
> - **Security**: Validate all inputs using Zod. Prevent SQL injection and XSS.
> - **GIS**: Coordinates must be saved in EPSG:4326 to PostGIS.
> - **Testing**: Require unit tests for the new API routes and React components.
> - **Accessibility**: Forms must be fully keyboard accessible with screen-reader friendly validation errors.

### Key Entities

- **Asset**: Core entity (ID, Name, Type, Status, DistrictId, Geometry). Stored in Postgres, replicated to Elasticsearch.
- **AssetDocument**: Associated NoSQL entity in MongoDB containing photos, manuals, and unstructured notes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Form submissions save data across all 3 primary databases (Postgres, Mongo, ES) in under 2 seconds.
- **SC-002**: Dashboard map and table reflect the new/updated/deleted asset immediately upon page refresh or cache invalidation.
- **SC-003**: 100% of spatial coordinates entered via the form are correctly rendered on the MapLibre component without projection errors.
- **SC-004**: Jest unit test coverage ≥80% for all new form components and CRUD API routes.
- **SC-005**: SonarQube quality gate shows "Passed" with zero critical/blocker issues.

## Assumptions

- We are assuming an eventual consistency or simple sequential write pattern for the multi-database inserts (e.g., write to Postgres first, then Mongo, then ES).
- We assume standard web application rollback procedures if one of the database inserts fails during creation.
