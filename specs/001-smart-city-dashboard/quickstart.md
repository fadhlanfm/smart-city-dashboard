# Quickstart: Smart City Operations & Asset Management Dashboard

**Feature**: `001-smart-city-dashboard`
**Date**: 2026-06-08

This guide validates the development environment end-to-end. Follow these steps in order
to confirm all services are connected and the application boots successfully.

---

## Prerequisites

| Tool | Minimum Version | Check Command |
|---|---|---|
| Node.js | 20.x LTS | `node --version` |
| npm | 10.x | `npm --version` |
| Docker | 24.x | `docker --version` |
| Docker Compose | 2.x | `docker compose version` |
| Git | 2.40+ | `git --version` |

---

## Step 1: Clone & Install

```bash
git clone <repo-url> smart-city-dashboard
cd smart-city-dashboard
npm install
```

---

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory and populate it with the required keys (see `.env.example`).
Also, for GitHub Actions CI/CD to pass, ensure the following secrets/variables are added to the repository:
- `SONAR_TOKEN`
- `SONAR_HOST_URL`
- `AUTH_SECRET`
- `DATABASE_URL`
- `MONGODB_URI`
- `REDIS_URL`
- `ELASTICSEARCH_URL`
- `NEXT_PUBLIC_MAPTILER_KEY`

Open `.env.local` and fill in the required values:

```env
# Authentication (GitHub OAuth App — create at github.com/settings/developers)
AUTH_SECRET="<random-32-char-string>"
AUTH_GITHUB_ID="<github-oauth-client-id>"
AUTH_GITHUB_SECRET="<github-oauth-client-secret>"
NEXTAUTH_URL="http://localhost:3000"

# PostgreSQL + PostGIS
DATABASE_URL="postgresql://smart_city:password@localhost:5432/smart_city_db"

# MongoDB
MONGODB_URI="mongodb://localhost:27017/smart_city"

# Redis
REDIS_URL="redis://localhost:6379"

# Elasticsearch
ELASTICSEARCH_URL="http://localhost:9200"
ELASTICSEARCH_INDEX="smart_city_assets"

# MapLibre (vector tile basemap — get free key from maptiler.com)
NEXT_PUBLIC_MAPTILER_KEY="<your-maptiler-key>"

# Environment
NODE_ENV="development"
```

> **Note**: The application will **fail fast at startup** if any required variable is
> missing. Check the console output for a descriptive error listing the missing key(s).

---

## Step 3: Start Infrastructure Services

```bash
docker compose up -d
```

This starts PostgreSQL + PostGIS, MongoDB, Redis, and Elasticsearch. Verify all four
are healthy:

```bash
docker compose ps
```

All services should show `Up (healthy)`.

---

## Step 4: Initialize Database

```bash
# Run Prisma migrations (creates tables + PostGIS extension)
npx prisma migrate dev --name init

# Seed development data (assets, districts)
npx prisma db seed
```

---

## Step 5: Initialize Elasticsearch Index

```bash
npm run es:setup
```

This script creates the `smart_city_assets` index with the correct mapping and
syncs all Asset records from PostgreSQL into the search index.

---

## Step 6: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should be
redirected to the login page.

---

## Step 7: Validate All Services

```bash
curl http://localhost:3000/api/health
```

Expected response (all services `up`):
```json
{
  "status": "ok",
  "services": {
    "postgres": { "status": "up" },
    "mongodb": { "status": "up" },
    "redis": { "status": "up" },
    "elasticsearch": { "status": "up" }
  }
}
```

---

## Step 8: Run Tests

```bash
# Unit tests
npm test

# Unit tests with coverage report
npm run test:coverage

# E2E tests (requires dev server running on port 3000)
npm run test:e2e
```

All tests should pass. Coverage report should show ≥80% line coverage.

---

## Step 9: Validate the Constitution Check

Run SonarQube analysis locally (requires `sonar-scanner` CLI):

```bash
sonar-scanner \
  -Dsonar.projectKey=smart-city-dashboard \
  -Dsonar.sources=. \
  -Dsonar.host.url=<your-sonarqube-url> \
  -Dsonar.token=<your-sonarqube-token>
```

The quality gate MUST report **Passed**.

---

## Available npm Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler check (no emit) |
| `npm test` | Run Jest unit tests |
| `npm run test:coverage` | Jest with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run es:setup` | Create/reset Elasticsearch index |
| `npm run es:sync` | Sync PostgreSQL assets to Elasticsearch |
| `npx prisma migrate dev` | Apply pending Prisma migrations |
| `npx prisma db seed` | Seed development data |
| `npx prisma studio` | Open Prisma Studio UI |

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `Error: Missing env var DATABASE_URL` | `.env.local` not configured | Copy `.env.example` and fill values |
| `ECONNREFUSED localhost:5432` | PostgreSQL not running | `docker compose up -d postgres` |
| `ECONNREFUSED localhost:9200` | Elasticsearch not running | `docker compose up -d elasticsearch` |
| Map shows blank tiles | Missing `NEXT_PUBLIC_MAPTILER_KEY` | Add MapTiler key to `.env.local` |
| Login redirect loop | `AUTH_SECRET` or OAuth config wrong | Check GitHub OAuth app callback URL |
| Prisma migration fails | PostGIS extension not enabled | Migration includes `CREATE EXTENSION IF NOT EXISTS postgis` — check user has SUPERUSER |

---

## docker-compose.yml Overview

```yaml
services:
  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_USER: smart_city
      POSTGRES_PASSWORD: password
      POSTGRES_DB: smart_city_db
    ports: ["5432:5432"]
    healthcheck: pg_isready -U smart_city

  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    healthcheck: mongosh --eval "db.adminCommand('ping')"

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    healthcheck: redis-cli ping

  elasticsearch:
    image: elasticsearch:8.13.0
    environment:
      discovery.type: single-node
      xpack.security.enabled: "false"
    ports: ["9200:9200"]
    healthcheck: curl -f http://localhost:9200/_cluster/health
```
