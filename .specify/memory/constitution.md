<!--
SYNC IMPACT REPORT
==================
Version Change: [TEMPLATE] → 1.0.0 (initial ratification)
Added Sections:
  - I. TypeScript-First (Strict Mode)
  - II. Fullstack Architecture (Next.js App Router)
  - III. UI Component Standards (Shadcn UI)
  - IV. Test-Driven Development (TDD — NON-NEGOTIABLE)
  - V. Security & Compliance (OWASP Top 10)
  - VI. Data Ecosystem & Web GIS
  - VII. Code Quality & Observability
  - VIII. Version Control & DevOps
  - Technology Stack (Section 2)
  - Development Workflow (Section 3)
  - Governance

Removed Sections: None (initial creation from template)

Templates Updated:
  - .specify/templates/plan-template.md ✅ (Constitution Check gates updated)
  - .specify/templates/spec-template.md ✅ (security, testing, and GIS sections noted)
  - .specify/templates/tasks-template.md ✅ (TDD, OWASP, observability task types noted)

Deferred TODOs: None
-->

# Smart City Operations & Asset Management Dashboard Constitution

## Core Principles

### I. TypeScript-First (Strict Mode)

All source code — frontend, backend (API routes, server actions), shared utilities, and
configuration — MUST be written in strict TypeScript. The compiler flag `"strict": true`
MUST be enabled in every `tsconfig.json` in the repository. `any` types are PROHIBITED
unless accompanied by a block comment justifying the exception and a corresponding
`// eslint-disable-next-line @typescript-eslint/no-explicit-any` suppression. Implicit
`any` is never acceptable. Type inference is encouraged; explicit type annotations MUST
be used on all public function signatures, API contracts, and module boundaries.

**Rationale**: Strict typing is the primary defense against runtime type errors in a
system that integrates multiple heterogeneous data services (PostGIS, MongoDB, Redis,
Elasticsearch). Type safety at compile time reduces production incidents and enables
fearless refactoring.

### II. Fullstack Architecture (Next.js App Router)

The application MUST use the Next.js App Router (Next.js 14+) as the primary fullstack
framework. Server Components are the default; Client Components (`"use client"`) MUST
only be used when browser-specific APIs or client-side interactivity are strictly
required. API endpoints MUST be implemented as Next.js Route Handlers (`app/api/`)
or Server Actions. Direct database queries from Client Components are PROHIBITED.
All data fetching MUST go through typed service layers to ensure testability and
separation of concerns.

**Rationale**: The App Router's server-first model naturally co-locates data access
with rendering, reduces client-side bundle size, and provides a clear architectural
seam between public and sensitive logic.

### III. UI Component Standards (Shadcn UI + Tailwind CSS)

All UI components MUST be implemented using Shadcn UI primitives built on Radix UI.
Custom CSS is PROHIBITED unless it is physically impossible to achieve the required
visual effect using Tailwind CSS utility classes. When customization of a Shadcn
component is required, the component MUST be copied into the project's
`components/ui/` directory and modified there — never overriding third-party files.
All designs MUST be responsive (mobile-first) and MUST meet WCAG 2.1 AA accessibility
standards. MapLibre GL JS canvas elements are an explicit exception to the no-custom-CSS
rule.

**Rationale**: Shadcn's copy-into-project model gives full ownership over component
primitives while Radix provides accessibility semantics. Constraint to Tailwind prevents
CSS sprawl in a large, multi-developer codebase.

### IV. Spec-Driven and Test-Driven Development (SDD & TDD — NON-NEGOTIABLE)

Development MUST follow a strict Spec-Driven and Test-Driven pipeline. Agents and Developers MUST NOT write implementation code before specs and tests are written. The sequence is strictly enforced:

1. **Spec-Driven**: Write or update `spec.md`, `plan.md`, and `tasks.md` first. The expected behavior must be explicitly documented.
2. **Test-Driven**: Write a failing test that captures the requirement exactly as specified in the spec.
3. **Implement**: Implement the minimum code to make the test pass (Red → Green).
4. **Refactor**: Refactor while keeping all tests green.

The testing stack MUST use **Jest** for unit and integration tests. React component
tests MUST use **React Testing Library**. All new code MUST maintain ≥80% line
coverage as measured by Jest's built-in coverage reporter. SonarQube analysis MUST
pass with zero critical/blocker issues before any feature branch is merged to `main`.
End-to-end tests MUST use Playwright.

**Rationale**: TDD enforces deliberate design, documents intent in executable form,
and prevents regression in a system with complex interdependencies across GIS,
time-series, and search subsystems.

### V. Security & Compliance (OWASP Top 10)

All code MUST comply with the OWASP Top 10 Web Application Security Risks. Specific
mandatory controls:

- **XSS Prevention**: All dynamic output rendered in JSX MUST be sanitized. Use of
  `dangerouslySetInnerHTML` is PROHIBITED without a documented security review.
- **CSRF Protection**: All mutating Server Actions and API Route Handlers MUST validate
  origin and include CSRF tokens via the project's CSRF middleware.
- **Input Validation**: MUST be applied on both client (Zod schemas via React Hook Form)
  and server (Zod schemas in Route Handlers / Server Actions). Server-side validation
  is non-negotiable even when client validation exists.
- **Authentication**: MUST use NextAuth.js (Auth.js v5) with JWT sessions. Passwords
  are PROHIBITED from being stored; OAuth providers and/or WebAuthn are the required
  mechanisms. Session tokens MUST be rotated on privilege escalation.
- **Secrets Management**: Secrets MUST only appear in environment variables. `.env`
  files containing real secrets MUST be in `.gitignore`. Commit history MUST never
  contain secrets.
- **Dependency Security**: `npm audit` MUST be run and pass (no high/critical) as a CI
  gate before any merge.

**Rationale**: This system processes sensitive civic infrastructure data. A breach
could affect public safety systems. Security is a first-class, non-negotiable concern.

### VI. Data Ecosystem & Web GIS

The following technology choices are FIXED and MUST NOT be substituted:

| Concern | Mandatory Technology |
|---|---|
| Relational / Spatial DB | PostgreSQL + PostGIS via **Prisma ORM** |
| Document DB | MongoDB via **Mongoose** |
| Caching | Redis via **ioredis** |
| Search | Elasticsearch via **@elastic/elasticsearch** |
| Map Rendering | **MapLibre GL JS** |
| Spatial Analysis | **Turf.js** |

**Mocking infrastructure is STRICTLY PROHIBITED in production code.** Development
seeds and test fixtures are the only acceptable form of synthetic data. All service
connections MUST be implemented as real, health-checked connections. Each service MUST
expose a `/api/health` endpoint contribution that reports its connectivity status.
Database schemas MUST be versioned via Prisma migrations (PostgreSQL) and Mongoose
schema versioning (MongoDB). GIS data MUST use WGS84 (EPSG:4326) as the canonical CRS;
projections MUST be documented at the layer level.

**Rationale**: Smart city operations depend on real-time, authoritative data. Synthetic
data in production code creates a false sense of operational correctness and masks
integration failures until they become critical incidents.

### VII. Code Quality & Observability

All code MUST adhere to the following non-negotiable quality gates:

- **Linting**: ESLint with `eslint-config-next` and `@typescript-eslint/recommended`
  MUST pass with zero errors. Warnings are treated as errors in CI.
- **Formatting**: Prettier with the project's `.prettierrc` MUST format all staged
  files via `lint-staged` in a pre-commit hook.
- **Complexity**: Cyclomatic complexity MUST not exceed 10 per function. Functions
  exceeding this MUST be refactored and the refactoring documented in the PR.
- **Logging**: All server-side errors MUST be logged via the project's structured
  logger (Pino). `console.log` in production code paths is PROHIBITED.
- **Metrics & Tracing**: Key API operations MUST emit OpenTelemetry spans. The
  SonarQube quality gate MUST show "Passed" before any PR is merged.

**Rationale**: Observability is how operators understand a running smart city system.
Code quality gates prevent the accumulation of technical debt that would degrade the
system's maintainability over its multi-year operational lifespan.

### VIII. Version Control & DevOps

Commits MUST follow the **Conventional Commits** specification:
`<type>(<scope>): <short description>`. Permitted types: `feat`, `fix`, `refactor`,
`test`, `docs`, `chore`, `perf`, `ci`, `build`. Commits MUST be atomic — one logical
change per commit. Force-pushing to `main` or `develop` is PROHIBITED.

The repository MUST include:
- A **Dockerfile** and `docker-compose.yml` for local development with all services.
- **GitHub Actions** workflows for: CI (lint + test + build + SonarQube), and CD
  (deploy to staging on `develop` merge, deploy to production on `main` tag).
- Environment variable schemas MUST be validated at startup using Zod
  (`env.mjs` pattern). Missing required environment variables MUST cause a fast-fail
  at server startup.
- Feature flags MUST be used for any incomplete feature reaching `develop`.

**Rationale**: Production-readiness from day one means the path from local development
to deployed production is automated, auditable, and reproducible. CI/CD gates enforce
quality standards that would otherwise degrade under delivery pressure.

## Technology Stack

### Core Stack (FIXED — substitution requires a major constitution amendment)

| Layer | Technology | Version Constraint |
|---|---|---|
| Framework | Next.js (App Router) | ≥14.x |
| Language | TypeScript (strict) | ≥5.x |
| Styling | Tailwind CSS | ≥3.x |
| UI Primitives | Shadcn UI + Radix UI | latest stable |
| Auth | NextAuth.js / Auth.js | v5.x |
| ORM (SQL) | Prisma | ≥5.x |
| ODM (NoSQL) | Mongoose | ≥8.x |
| Cache Client | ioredis | ≥5.x |
| Search Client | @elastic/elasticsearch | ≥8.x |
| Map Rendering | MapLibre GL JS | ≥4.x |
| Spatial Analysis | Turf.js | ≥6.x |
| Unit/Integration Testing | Jest + React Testing Library | ≥29.x |
| E2E Testing | Playwright | ≥1.x |
| Logging | Pino | ≥8.x |
| Validation | Zod | ≥3.x |

### Database Infrastructure (REQUIRED — no mocking in production)

- **PostgreSQL** (≥15) with **PostGIS** (≥3.3) extension — primary operational store
- **MongoDB** (≥7) — document store for flexible asset metadata
- **Redis** (≥7) — caching and pub/sub
- **Elasticsearch** (≥8) — full-text and geo-spatial search

### Environment Variable Management

All environment variables MUST be declared in `.env.example` with non-sensitive
defaults. Production values MUST be injected via the CI/CD secrets store. The
`env.mjs` module MUST validate all variables at boot time using Zod.

## Development Workflow

### Branch Strategy

- `main` — production releases only; tagged with semantic version
- `develop` — integration branch; all feature branches merge here first
- `feature/<###-short-name>` — one branch per feature/spec; branched from `develop`
- `fix/<###-short-description>` — hotfix branches; may target `main` directly for
  critical security patches

### Pull Request Requirements

Every PR targeting `develop` or `main` MUST:
1. Reference the feature spec (`specs/<###-feature>/spec.md`)
2. Pass all CI checks: lint → type-check → unit tests → integration tests → build
3. Maintain or improve SonarQube quality gate (no regressions in coverage or issues)
4. Include evidence of manual testing (screenshots/recordings for UI changes)
5. Have at least one peer code review approval
6. Have all conversations resolved before merge

### Definition of Done

A feature is DONE when:
- [ ] All tasks in `specs/<###-feature>/tasks.md` are marked complete
- [ ] Unit test coverage ≥80% for new/modified code
- [ ] SonarQube gate: Passed
- [ ] `npm audit` passes with no high/critical vulnerabilities
- [ ] Feature branch merged to `develop` via PR (squash merge)
- [ ] Staging deployment verified by the feature author
- [ ] `specs/<###-feature>/quickstart.md` updated or created

### Commit Workflow

```
git add <specific files>           # Never: git add .
git commit -m "feat(assets): add PostGIS proximity search endpoint"
git push origin feature/001-asset-proximity-search
```

## Governance

This constitution is the supreme governing document for the Smart City Operations &
Asset Management Dashboard project. It supersedes all other conventions, preferences,
or practices documented elsewhere. No principle may be violated without explicit
constitution amendment.

**Amendment Procedure**:
1. Author proposes amendment via PR against this file with a clear rationale.
2. Amendment MUST include an updated version number (see versioning policy below).
3. At least two senior team members MUST approve the PR.
4. A migration plan MUST be provided if the amendment affects existing code.
5. All dependent templates (plan, spec, tasks) MUST be updated in the same PR.

**Versioning Policy**:
- MAJOR: Backward-incompatible governance/principle removals or redefinitions
  (e.g., changing the mandatory ORM from Prisma to another library).
- MINOR: New principle or section added, or materially expanded guidance
  (e.g., adding a new mandatory service to the data ecosystem).
- PATCH: Clarifications, wording improvements, typo fixes, non-semantic refinements.

**Compliance Review**: The constitution MUST be reviewed at the start of every new
feature specification to ensure the design remains in compliance. The `plan-template.md`
Constitution Check section operationalizes this gate. Any detected violation MUST be
resolved — either by bringing the code into compliance or by formally amending this
constitution — before the feature branch may be merged.

**Runtime Guidance**: See `AGENTS.md` at the project root for agent-specific
development guidance and tooling conventions.

**Version**: 1.0.0 | **Ratified**: 2026-06-08 | **Last Amended**: 2026-06-08
