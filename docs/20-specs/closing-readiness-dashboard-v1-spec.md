# Closing Readiness Dashboard V1 Spec

**Status:** Historical implemented pass; superseded as current kit API
**Scope:** `packages/kit` product components, kit stories/tests, and narrow
`apps/web` e2e assertions only when needed.

Current status note: the kit surfaces described in this file were removed after
the baseline cleanup. Treat this document as implementation history, not the
current `@repo/kit` public API. New route work should consume the app-owned
Northstar data spine and the accepted `DealCommitmentsTable` /
`DealOperationalOverview` / `DealProgressPanel` baselines.
**Depends on:** `@repo/domain`, `@repo/domain/reconciliation`, `@repo/ui`,
`@repo/tailwind-config`, React, existing kit components.
**Must not depend on:** Next.js app APIs, `next-intl`, tRPC, GraphQL, database,
auth, server actions, route handlers, payment providers, or persistence.

## 1. Purpose

The current dashboard is visually credible but still behaves like a status
report. It shows useful facts, but it does not foreground what a private-markets
operator must do to close an SPV safely.

This pass turns the dashboard into a first exception workspace:

- readiness is visible at the top
- top blockers are visible without expanding investor rows
- capital is separated into committed, signed, received, matched, and remaining
- blocker ownership and next actions are explicit
- local interactions make the surface feel operational without implying real
  persistence

This is not a backend pass, API pass, legal readiness engine, or full workflow
engine.

## 2. Current Inputs

The enabling passes are already implemented:

- `@repo/domain/reconciliation`
  - `CapitalStage`
  - `PaymentStatus`
  - `PaymentRecord`
  - `CapitalReconciliationInput`
  - `CapitalReconciliationSummary`
  - `summarizeCapitalReconciliation`
  - `reconciliationFixtures`
  - `paymentRecordFixtures`
- `@repo/design-tokens` and `@repo/tailwind-config`
  - `status-success`
  - `status-attention`
  - `status-danger`
  - `status-info`
  - `status-pending`
  - `readiness-ready`
  - `readiness-attention`
  - `readiness-blocked`
  - `readiness-not-started`

The dashboard pass must consume these instead of rebuilding parallel money or
status semantics inside kit.

## 3. Non-Goals

Do not implement:

- new domain package models
- readiness legal computation
- concentration-risk domain helpers
- document lifecycle domain models
- React Hook Form
- commitment form
- tRPC
- GraphQL
- Prisma/database code
- auth/session logic
- server actions
- route handlers
- real reminder sending
- real document upload/download
- real payment-provider behavior
- persisted blocker acknowledgement
- new external UI libraries
- broad token redesign
- Tailwind v3 configuration

## 4. Package Boundary

Allowed implementation scope:

```text
packages/kit/src/**
packages/kit/package.json, only if a narrow script/export update is needed
apps/web/tests/e2e/**, only for public route assertions
PLAN.md
STATUS.md
```

Allowed docs updates only if implementation discovers a necessary correction:

```text
docs/20-specs/closing-readiness-dashboard-v1-spec.md
docs/30-testing/testing-closing-readiness-dashboard.md
```

Do not modify:

```text
packages/core/**
packages/domain/**
packages/design-tokens/**
packages/tailwind-config/**
packages/ui/**
apps/web/app/**
apps/storybook/**
```

`@repo/kit` must remain framework-neutral. It must not import `next-intl`,
`next/navigation`, app code, tRPC, database/server modules, or route handlers.

## 5. Components To Add

Create a focused readiness module:

```text
packages/kit/src/readiness/
  capital-reconciliation-panel.tsx
  closing-blocker-queue.tsx
  closing-readiness-summary.tsx
  index.ts
```

Update:

```text
packages/kit/src/index.ts
packages/kit/src/demo/deal-dashboard-demo.tsx
packages/kit/src/demo/deal-dashboard-demo.stories.tsx
packages/kit/src/demo/deal-dashboard-demo.test.tsx
```

Add tests/stories for each new component.

## 6. Readiness States

Kit owns the presentation-level readiness state for V1.

```ts
export type ClosingReadinessState =
  | 'ready'
  | 'attention'
  | 'blocked'
  | 'not_started'
```

Meaning:

| State | Meaning |
|---|---|
| `ready` | No known blocker for the next closing action. |
| `attention` | Work remains, but no critical blocker is known. |
| `blocked` | At least one critical dependency blocks closing progress. |
| `not_started` | Operational data is not sufficient yet. |

V1 must render all four states in stories and tests. It must not pretend to
compute legal close-readiness from domain rules.

## 7. Closing Readiness Summary

Create:

```ts
export type ClosingReadinessSummaryProps = {
  readonly state: ClosingReadinessState
  readonly title: string
  readonly description: string
  readonly blockerCount: number
  readonly closingDateLabel: string
  readonly deadlineLabel: string
  readonly remainingAmount: EuroCents
  readonly lastUpdatedLabel: string
  readonly labels: {
    readonly blockers: string
    readonly closingDate: string
    readonly deadline: string
    readonly remaining: string
    readonly lastUpdated: string
  }
  readonly locale?: string
  readonly className?: string
}
```

Behavior:

- use `MoneyDisplay` for `remainingAmount`
- expose `data-slot="closing-readiness-summary"`
- expose `data-state` equal to the readiness state
- use readiness semantic token classes, for example:
  - `bg-readiness-blocked-muted`
  - `text-readiness-blocked`
  - `border-readiness-blocked-border`
- avoid hardcoded Tailwind color-family utilities
- keep copy prop-driven; demo copy may be static English inside
  `DealDashboardDemo`
- place the summary before secondary dashboard modules

## 8. Closing Blocker Queue

V1 blocker types remain kit-local presentation types.

```ts
export type ClosingBlockerSeverity = 'critical' | 'warning' | 'info'

export type ClosingBlockerKind =
  | 'kyc'
  | 'kyb'
  | 'subscription_document'
  | 'wire'
  | 'payment_match'
  | 'qualification'
  | 'deadline'
  | 'lifecycle'
  | 'audit_file'

export type ClosingOwner =
  | 'operations'
  | 'compliance'
  | 'finance'
  | 'legal'
  | 'deal_lead'
  | 'investor'
  | 'system'

export type ClosingDueState =
  | 'overdue'
  | 'due_today'
  | 'due_soon'
  | 'on_track'
  | 'no_due_date'

export type ClosingBlocker = {
  readonly id: string
  readonly severity: ClosingBlockerSeverity
  readonly kind: ClosingBlockerKind
  readonly title: string
  readonly detail: string
  readonly nextAction: string
  readonly owner: ClosingOwner
  readonly dueState: ClosingDueState
  readonly investorName?: string
  readonly reference?: string
}
```

Create:

```ts
export type ClosingBlockerQueueProps = {
  readonly title: string
  readonly description?: string
  readonly blockers: readonly ClosingBlocker[]
  readonly labels: {
    readonly empty: string
    readonly owner: string
    readonly nextAction: string
    readonly dueState: Record<ClosingDueState, string>
    readonly severity: Record<ClosingBlockerSeverity, string>
    readonly acknowledge: string
    readonly acknowledged: string
    readonly showDetails: string
    readonly hideDetails: string
  }
  readonly className?: string
}
```

Behavior:

- sort blockers by severity, then due state
- render critical blockers before warning blockers, then info blockers
- render overdue / due today / due soon before on-track / no due date within the
  same severity
- keep empty state accessible
- expose `data-slot="closing-blocker-queue"`
- each blocker exposes `data-slot="closing-blocker-item"`
- use local React state for interaction:
  - select/focus a blocker
  - expand/collapse details
  - acknowledge/unacknowledge a blocker locally
- acknowledgement must not imply persistence:
  - no fake network call
  - no server action
  - no optimistic mutation language
- all interactive affordances must be real buttons with accessible names
- keyboard users must be able to operate the queue

## 9. Capital Reconciliation Panel

Create:

```ts
export type CapitalReconciliationPanelProps = {
  readonly summary: CapitalReconciliationSummary
  readonly labels: {
    readonly title: string
    readonly description?: string
    readonly target: string
    readonly committed: string
    readonly signed: string
    readonly received: string
    readonly matched: string
    readonly remaining: string
    readonly unmatched: string
    readonly unfunded: string
    readonly overTarget: string
  }
  readonly locale?: string
  readonly className?: string
}
```

Behavior:

- render all visible money values through `MoneyDisplay`
- clearly distinguish:
  - committed
  - signed
  - received
  - matched
  - remaining
  - unmatched received funds
  - unfunded committed capital
- do not use a donut for reconciliation because sequence matters
- a horizontal staged bar, rail, or compact ledger layout is preferred
- use `summary.hasUnmatchedFunds` and `summary.isOverTarget` to elevate
  warnings through status token classes
- do not perform new money arithmetic in React when the domain summary already
  provides the derived amounts
- if additional display percentages are needed, compute from `bigint` minor
  units only and treat them as display-only

## 10. Dashboard Composition

Refine `DealDashboardDemo`.

Desktop hierarchy:

1. deal title / date / vehicle context
2. readiness summary
3. blocker queue and capital reconciliation
4. investor records with next-action context
5. lifecycle, status distribution, activity, and deal terms as supporting
   context

Mobile hierarchy:

1. deal title / date / vehicle context
2. readiness summary
3. blocker queue
4. capital reconciliation
5. investor records
6. secondary modules in closed native disclosure where appropriate

Rules:

- blockers must not be hidden behind collapsed disclosure on mobile
- readiness must be visible before secondary charts
- investor rows must keep the behavior from the Investor Records V2 pass
- lifecycle remains useful but should not be the only readiness model
- deal terms remain reference data and should not outrank blockers
- no horizontal overflow at narrow viewport widths
- no broad page redesign outside the dashboard composition

## 11. Demo Data

Use static demo data only.

Required demo conditions:

- `blocked` dashboard state
- at least three blockers:
  - critical KYC/KYB or document blocker
  - warning payment/reconciliation blocker
  - info or deadline/lifecycle blocker
- static `lastUpdatedLabel`
- static closing date
- capital summary built through `summarizeCapitalReconciliation`
- one story where committed capital is high but matched capital is low
- one ready/no-blocker story
- one attention story
- one not-started story

Concentration risk is deferred. If mentioned, it must be labelled as
prototype/demo context and not exported as domain logic.

## 12. Storybook Requirements

Add or update stories for:

- `ClosingReadinessSummary`
  - ready
  - attention
  - blocked
  - not started
- `ClosingBlockerQueue`
  - populated
  - empty
  - interaction review
- `CapitalReconciliationPanel`
  - normal
  - unmatched funds
  - high committed / low matched
  - not started
- `DealDashboardDemo`
  - desktop review
  - narrow/mobile review
  - ready state
  - attention state
  - blocked state

Stories should use existing story layout helpers. Do not add new Storybook
addons.

## 13. Tests

Component tests must cover:

- readiness states map to distinct `data-state` values
- readiness summary renders blocker count, remaining amount, closing date, and
  last updated label
- blocker sorting by severity and due state
- blocker queue empty state
- blocker details expand/collapse
- acknowledgement toggles locally and remains accessible
- capital reconciliation renders committed, signed, received, matched,
  remaining, unmatched, and unfunded values
- no invalid direct money conversion patterns are introduced
- dashboard renders readiness and critical blockers without expanding investor
  rows
- mobile/narrow dashboard keeps blockers visible before collapsed secondary
  modules
- representative `vitest-axe` checks pass

Update existing kit tests if component public APIs change.

## 14. App E2E

Update `apps/web/tests/e2e/**` only if needed.

E2E expectations:

- `/deals/northstar-energy` renders the readiness summary
- a critical blocker is visible without opening an investor row
- action queue interaction is keyboard-accessible
- first investor row can still expand
- mobile viewport has no horizontal overflow
- mobile viewport does not hide top blockers behind collapsed disclosure

Use Playwright screenshots as review artifacts when available. Do not add
brittle image snapshot assertions unless the existing test setup already
supports them cleanly and they are scoped to a stable review surface.

## 15. Verification

Run:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test:coverage
pnpm --filter @repo/web build
pnpm --filter @repo/web e2e
pnpm storybook:build
pnpm turbo typecheck lint test
pnpm lint
pnpm e2e
git diff --check
```

Also run package-boundary audits:

```bash
rg -n "from ['\\\"](?:next-intl|next/navigation|@repo/web|@/|.*trpc|.*prisma|.*database|.*server)" packages/kit/src || true
rg -n "#[0-9a-fA-F]{3,8}|oklch\\(|\\bdark:|\\b(?:text|bg|border|ring|fill|stroke)-(?:red|green|blue|amber|yellow|slate|zinc|neutral|stone|gray|teal)-[0-9]{2,3}" packages/kit/src || true
```

Both audits should return no hits except false positives that are documented in
`STATUS.md`.

If browser launch is blocked locally, record the exact error in `STATUS.md` and
still run typecheck, lint, unit coverage, Storybook build, app build, and
workspace tests.

## 16. Acceptance Criteria

The pass is complete when:

- first screen answers whether the close is ready, attention-worthy, blocked,
  or not started
- top blockers are visible without reading the whole investor table
- every blocker has owner, next action, and due-state context
- action buttons are real local interactions and do not imply persistence
- committed capital no longer implies funded/matched capital
- capital reconciliation uses `@repo/domain/reconciliation`
- readiness and blocker colors use semantic status/readiness tokens
- mobile keeps readiness and blockers visible before secondary context
- investor records retain the improved desktop/mobile behavior
- package boundaries remain intact
- all required verification commands pass or documented browser environment
  blockers are recorded precisely
