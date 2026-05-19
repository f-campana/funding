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
- runtime validation at the app data boundary for route slugs, JSON-safe EUR
  money DTOs, ISO date-time strings, DTO graph references, and Northstar capital
  invariants
- DTO-backed overview, commitments, and documents routes under
  `/deals/northstar-energy`
- a lightweight Web Vitals and route-interaction telemetry boundary in
  `apps/web/observability`, with no production vendor SDK or credentials

Northstar capital semantics are explicit for the current operator vertical:
gross committed equals net investable amount plus entry fees plus SPV fees.
Matched funds remain a payment-matching stage and must not be presented as
finance-accepted, reconciled, or deployable capital unless an explicit modeled
state proves that status.

Deleted kit surfaces from earlier passes are historical and are not current
public API.

## Priority 1 — T5F-D Runtime Validation And DTO Boundary Hardening

Status: complete.

Goal:

- validate route params before service loading
- validate `DealOperationalCenterDTO` output before returning service `Ok`
- map service validation errors through the tRPC output union
- keep TypeScript as the internal app/adapter/component contract and use Zod
  only at route/service/API trust boundaries
- preserve the direct route-loader service boundary
- avoid investor `/about`, fake auth, backend/database work, mutations,
  uploads, reminders, approvals, and persistence

Why this is first:

- backend/repository planning needs explicit DTO validation before fixture data
  is replaced
- investor `/about` planning needs confidence that current operator DTO
  semantics do not expose fake finance-accepted/deployable capital
- production-private deal data must still not be implied by the current
  fixture-backed tRPC read

## Priority 2 — T5F-E Observability/Web Vitals Baseline

Status: current pass.

Goal:

- capture the current route-complete operator vertical baseline before more
  product or backend work
- add typed frontend telemetry events for Web Vitals and safe route-level
  interactions
- mount a Next.js `useReportWebVitals` reporter once at the app root
- keep default production transport no-op and local console telemetry gated by
  an explicit browser flag
- document where Datadog/PostHog production wiring would attach later
- keep route behavior unchanged
- avoid starting backend, auth, mutations, persistence, or investor `/about`

## Priority 3 — Investor `/about` Lens Planning

Status: unblocked after runtime hardening validation, still a separate product
planning pass.

Goal:

- plan the investor-facing `/about` lens as a separate product surface
- decide which existing deal data can be safely reused without importing kit
  fixtures into `apps/web`
- keep the operator route grammar separate from investor-facing deal content

## Priority 4 — Backend/Repository/Prisma Planning

Status: unblocked after runtime hardening validation, still a separate
architecture planning pass.

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
