# Current Priorities And Rationale

**Status:** Active tracking  
**Created:** 2026-05-09  
**Updated:** 2026-05-18

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
- an app-owned Northstar operational data spine in `apps/web/server/deals`
- a narrow tRPC seam in `apps/web/server/trpc` and
  `apps/web/app/api/trpc/[trpc]/route.ts`
- DTO-backed overview, commitments, and documents routes under
  `/deals/northstar-energy`

Deleted kit surfaces from earlier passes are historical and are not current
public API.

## Priority 1 — T5F-A Route-Complete Operator Vertical Review

Status: current pass.

Goal:

- audit the complete operator flow from Overview to Commitments, the commitment
  inspector Sheet, and Documents
- keep route IA, docs, tests, adapters, copy, and product grammar consistent
- preserve the accepted kit surfaces and app-owned DTO adapter boundary
- avoid investor `/about`, persona toggle, backend/database work, mutations,
  uploads, reminders, approvals, and persistence
- run the required web, kit, storybook, lint, diff, and screenshot validation

Why this is first:

- the operator vertical is route-complete for overview, commitments, and
  documents
- `/deals/[dealId]/about` remains reserved for the future investor lens
- the read-only Northstar route needs review-ready evidence before the next
  strategic expansion

## Priority 2 — Investor `/about` Lens Planning

Status: deferred until the operator vertical is review-ready.

Goal:

- plan the investor-facing `/about` lens as a separate product surface
- decide which existing deal data can be safely reused without importing kit
  fixtures into `apps/web`
- keep the operator route grammar separate from investor-facing deal content

## Priority 3 — Backend/Repository/Prisma Planning

Status: deferred.

Goal:

- replace the read-only fixture spine with repository-backed data only after
  route contracts settle
- preserve the current adapter boundary from `getDealOperationsData(dealId)` to
  app-owned surface adapters to accepted kit components
- keep mutations/actions out of scope until persistence and authorization are
  designed together

## Priority 4 — Investor Commitment Flow

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
