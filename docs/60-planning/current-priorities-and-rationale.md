# Current Priorities And Rationale

**Status:** Active tracking  
**Created:** 2026-05-09  
**Updated:** 2026-05-19

This document tracks the current implementation sequence. Historical dashboard
and kit exploration remains useful context, but the current public surface is now
narrower.

## Current State

The repository has:

- safe TypeScript primitives in `@repo/core`
- exact EUR money, IDs, commitment schemas, lifecycle helpers, and capital
  reconciliation helpers in `@repo/domain`
- shadcn-compatible light/dark tokens and Tailwind v4 mapping
- generic UI primitives and chart infrastructure in `@repo/ui`
- accepted `@repo/kit` surfaces:
  - `DealCommitmentsTable`
  - `DealCommitmentInspector`
  - `DealDocumentsEvidence`
  - `DealOperationalOverview`
  - `DealProgressPanel`
- an app-owned Northstar operational service/DTO spine in
  `apps/web/server/deals`
- server-side App Router route loaders that call the app service directly
- a narrow fixture-backed tRPC adapter seam in `apps/web/server/trpc` and
  `apps/web/app/api/trpc/[trpc]/route.ts`
- DTO-backed overview, commitments, and documents routes under
  `/deals/northstar-energy`

Deleted kit surfaces from earlier passes are historical and are not current
public API.

## Priority 1 — T5F-B0 Route Data Boundary Clarification

Status: current pass.

Goal:

- document that React Server Components and route loaders call app services
  directly
- document that tRPC is a transport/API adapter for client-facing queries and
  future mutations over those same services
- mark the current tRPC deal read as fixture-backed demo/internal access, not
  production-private-data safe
- add `server-only` guardrails to route loaders and server deal entrypoints
- avoid investor `/about`, fake auth, backend/database work, mutations,
  uploads, reminders, approvals, and persistence

Why this is first:

- the bundle/RSC pass needs a settled data-loading boundary first
- the operator vertical should not gain internal tRPC server-caller indirection
  only for architectural symmetry
- production-private deal data must not be implied by the current public
  fixture-backed tRPC read

## Priority 2 — Bundle/RSC Boundary Hardening

Status: next after the route data boundary is validated.

Goal:

- reduce route client bundles without changing operator behavior
- keep read-only route data on the server side
- preserve the direct service-call route boundary
- avoid starting backend, auth, mutations, persistence, or investor `/about`

## Priority 3 — Investor `/about` Lens Planning

Status: deferred until the operator vertical is review-ready.

Goal:

- plan the investor-facing `/about` lens as a separate product surface
- decide which existing deal data can be safely reused without importing kit
  fixtures into `apps/web`
- keep the operator route grammar separate from investor-facing deal content

## Priority 4 — Backend/Repository/Prisma Planning

Status: deferred.

Goal:

- replace the read-only fixture spine with repository-backed data only after
  route contracts settle
- preserve the current server-route boundary from
  `getDealOperationsData(dealId)` to app services, route adapters, and accepted
  kit components
- keep tRPC as an adapter over app services, not a forced route-loader
  indirection
- keep mutations/actions out of scope until persistence and authorization are
  designed together

## Priority 5 — Investor Commitment Flow

Status: deferred.

Why it waits:

- the commitment form should reuse the readiness, document, investor, and
  capital semantics clarified by the Northstar route work
- it is a larger flow involving progressive disclosure, validation, and i18n
- building it before route wiring risks repeating stale semantics

## Deferred Findings To Preserve

- document completeness, ownership, expiry, and audit references need explicit
  route treatment
- activity should eventually become operational task/history context
- capital concentration risk should be visible when large investors dominate
  the close
- last-updated and data freshness cues matter for trust
- broader public-readiness documentation remains useful after T5D-B settles the
  actual app vertical
