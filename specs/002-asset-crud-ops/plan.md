# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

## Technical Context

**Language/Version**: TypeScript 5, Node 20
**Primary Dependencies**: Next.js 14 App Router, Prisma, React Hook Form, Zod
**Storage**: PostgreSQL (Prisma), Local Storage (Vercel Fallback)
**Testing**: Jest, React Testing Library
**Target Platform**: Web Browser (Vercel Deployment)
**Project Type**: Fullstack Web Dashboard
**Constraints**: Vercel read-only filesystem, Mock DB usage

## Constitution Check

- [x] **I. TypeScript-First**: All new modules use strict TypeScript; no `any` without justification comment.
- [x] **II. App Router Architecture**: Data fetching goes through service layers; no direct DB calls in Client Components.
- [x] **III. UI Standards**: New UI uses Shadcn UI primitives; no custom CSS except MapLibre canvas.
- [x] **IV. TDD**: Failing tests written before implementation tasks begin; coverage target ≥90% achieved.
- [x] **V. Security**: Zod validation on both client and server; CSRF middleware applied to all mutations; no secrets committed.
- [x] **VI. Data Ecosystem**: Implemented Mock DB fallback for Serverless environment.
- [x] **VII. Code Quality**: ESLint/Prettier configured.
- [x] **VIII. DevOps**: Conventional Commits enforced.

## Project Structure

```text
app/
├── api/assets/
components/
├── assets/
│   ├── AssetFormModal.tsx
│   ├── AssetDetailModal.tsx
lib/
├── services/
│   ├── asset.service.ts
__tests__/
├── components/
├── services/
```

**Structure Decision**: Extending the existing Next.js App Router structure with dedicated Service layers and UI Modals for CRUD operations, backed by comprehensive Jest tests.

