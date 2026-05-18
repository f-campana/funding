# Current Priorities And Rationale

**Status:** Active tracking  
**Created:** 2026-05-09  
**Updated:** 2026-05-18

This document tracks the current implementation sequence. Historical dashboard
and kit exploration remains useful context, but the current baseline is now
narrower.

## Current State

The repository has:

- safe TypeScript primitives in `@repo/core`
- exact EUR money, IDs, commitment schemas, lifecycle helpers, and capital
  reconciliation helpers in `@repo/domain`
- shadcn-compatible light/dark tokens and Tailwind v4 mapping
- generic UI primitives and chart infrastructure in `@repo/ui`
- accepted `@repo/kit` baselines:
  - `DealCommitmentsTable`
  - `DealCommitmentInspector`
  - `DealOperationalOverview`
  - `DealProgressPanel`
- an app-owned Northstar operational data spine in `apps/web/server/deals`
- a narrow tRPC seam in `apps/web/server/trpc` and
  `apps/web/app/api/trpc/[trpc]/route.ts`
- app route work in progress under `/deals/northstar-energy`

Deleted kit surfaces from earlier passes are historical and are not current
public API.

## Priority 1 — T5D-A2 Data Spine And Kit Baseline Hardening

Status: in progress in the current pass.

Goal:

- align current docs/status after legacy kit deletion
- derive readiness dimensions from source operational statuses and unresolved
  blockers
- harden `DealCommitmentsTable` row-open keyboard affordance
- harden the `DealOperationalOverview` public baseline contract
- complete the accepted kit label/copy contracts
- remove internal public API leaks from kit exports
- run the required web, kit, Storybook, lint, and diff validation

Why this is first:

- T5D-B route wiring should not inherit blocker-only readiness assumptions.
- Accepted kit baselines should be app-label-ready before route adapters depend
  on them.
- Deleted kit surfaces should not leak back into docs or public exports.

## Priority 2 — T5D-C Commitments Wiring

Status: next pass is T5D-C2 route wiring for `DealCommitmentInspector`.

Goal:

- wire the real Northstar commitments workflow to the app-owned DTO/tRPC spine
- compose the accepted `DealCommitmentInspector` kit baseline into the route
  container for one selected commitment
- keep `/deals/[dealId]/overview` as the operator entry route
- keep `/deals/[dealId]/about` reserved for a future investor lens
- map commitment DTO sections into route-owned views and accepted kit baselines
- preserve package boundaries
- avoid reviving deleted kit surfaces

The Northstar vertical should not be called complete until these route workflows
consume the hardened contract.

## Priority 3 — Investor Commitment Flow

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
