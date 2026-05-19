# tRPC Core Readiness Slice Spec

**Status:** Superseded as route-loader guidance; retained as a historical tRPC
adapter proposal.
**Scope:** one `apps/web` vertical slice that introduces a typed tRPC boundary
for closing readiness/capital reconciliation while reusing existing
`@repo/domain`, `@repo/core`, and `@repo/kit` work.
**Depends on:** Next.js App Router, React, `@repo/core`, `@repo/domain`,
`@repo/domain/reconciliation`, `@repo/kit`, `ts-pattern`, tRPC, TanStack Query
only if the chosen client surface needs client-side query state.
**Must not depend on:** Prisma/database, auth/session systems, external banking
providers, GraphQL, payment providers, realtime infrastructure, server actions,
or a new design system.

## 1. Purpose

The current app proves the static product surface. This slice proves the next
level of frontend engineering: a typed backend boundary that turns domain
outcomes into operational UI states.

It should demonstrate to Roundtable's CTO and team that this repository can
handle:

- end-to-end typed application contracts
- exact-money domain logic behind the route
- recoverable business failures as values
- exhaustive UI branching with `ts-pattern`
- deliberate package boundaries
- testable server/client integration

This is not a broad backend migration. It is one complete, inspectable vertical
slice.

## 2. Why This Slice Exists

Roundtable-like private-capital workflows are not simple CRUD. The frontend has
to represent server-authoritative operational truth: commitment progress,
document readiness, compliance blockers, payment/reconciliation exceptions, and
close readiness.

The current `apps/web` routes read app services directly from React Server
Components. That service-first route boundary is now intentional.

tRPC should remain available as an adapter over those same services for
client/API consumers and future mutations. Do not use this older proposal to
refactor RSC routes through tRPC server callers for symmetry.

Future client/API work should upgrade one workflow from:

```text
route imports fixture data directly
  -> route renders kit components
```

to:

```text
tRPC procedure
  -> validates input
  -> calls domain/core-backed application service
  -> maps domain Result into a serializable app DTO
  -> client/API consumer renders or handles DTO exhaustively
```

## 3. Product Scenario

Implement a closing-readiness API for the existing Northstar deal.

The procedure should answer:

- Is this deal supported?
- What readiness state should the operator see?
- Which blockers prevent the next closing action?
- What are the committed/signed/received/matched capital figures?
- Are there business-rule errors in the reconciliation input?

Use the existing dashboard vocabulary:

- deal lifecycle
- closing blockers
- document completeness
- investor operations
- capital reconciliation
- readiness state

Do not invent fund, community, auth, or persistence behavior in this slice.

## 4. Non-Goals

Do not implement:

- a database
- Prisma or migrations
- auth/session/permission checks
- mutations
- optimistic updates
- realtime subscriptions
- server actions
- GraphQL
- external KYC, document, signature, or banking integrations
- a generic API layer for every route
- tRPC routes for every existing page
- conversion of all `null` checks to `Option`
- conversion of all `if` statements to `ts-pattern`
- direct serialization of `@repo/core` objects containing methods

## 5. Package Boundary

Allowed implementation scope:

```text
apps/web/app/api/trpc/[trpc]/route.ts
apps/web/app/deals/[dealId]/**
apps/web/trpc/**
apps/web/server/**
apps/web/tests/e2e/**
apps/web/package.json
apps/web/tsconfig.json
apps/web/next.config.ts
tsconfig.json
pnpm-lock.yaml
docs/20-specs/trpc-core-readiness-slice-spec.md
docs/30-testing/testing-app.md
docs/README.md
```

Allowed package reads:

```text
packages/core/**
packages/domain/**
packages/kit/**
packages/ui/**
```

Do not modify package source unless the app integration exposes a real missing
export or bug. This slice should primarily prove app-level integration.

## 6. Dependencies

Add to `apps/web` only:

```json
{
  "dependencies": {
    "@repo/core": "workspace:*",
    "@repo/domain": "workspace:*",
    "@tanstack/react-query": "<current compatible version>",
    "@trpc/client": "<current compatible version>",
    "@trpc/server": "<current compatible version>",
    "@trpc/tanstack-react-query": "<current compatible version>",
    "ts-pattern": "^5.9.0",
    "zod": "^4.4.3"
  }
}
```

Notes:

- `@tanstack/react-query` and `@trpc/tanstack-react-query` are needed only if
  the implemented route uses client-side query state.
- If the first pass uses a server-side tRPC caller only, omit client query
  dependencies and document the reason in the implementation notes.
- Keep `@repo/core` and `@repo/domain` as explicit app dependencies if app code
  imports them directly.

## 7. tRPC File Layout

Create a narrow app-local API layer:

```text
apps/web/
  app/api/trpc/[trpc]/route.ts
  server/
    application/
      deal-readiness-service.ts
    trpc/
      context.ts
      init.ts
      root.ts
      routers/
        deal-router.ts
  trpc/
    client.tsx
    query-client.ts
    server.ts
```

If the first pass stays RSC-only, `apps/web/trpc/client.tsx` and
`query-client.ts` may be deferred. Do not create unused provider code.

## 8. Procedure Contract

Expose one procedure:

```text
deal.getClosingReadiness
```

Input:

```ts
const GetClosingReadinessInputSchema = z.object({
  dealId: z.string().min(1),
})
```

Output:

```ts
export type ClosingReadinessProcedureOutput =
  | {
      readonly _tag: 'Ok'
      readonly data: ClosingReadinessDto
    }
  | {
      readonly _tag: 'UnsupportedDeal'
      readonly dealId: string
    }
  | {
      readonly _tag: 'ReconciliationError'
      readonly error: CapitalReconciliationErrorDto
    }
```

Rules:

- Use a serializable discriminated union for the tRPC output.
- Do not return `@repo/core` `Result` instances directly because the current
  core objects include methods.
- Use `@repo/core` in the application service to model fallible internal flow.
- Map from internal `Result<T, E>` to output DTO at the tRPC boundary.
- Keep output money JSON-safe. Prefer integer minor units as numbers only while
  fixtures remain inside `Number.MAX_SAFE_INTEGER`; otherwise use decimal
  strings.

## 9. DTO Shape

```ts
export type MoneyMinorUnitsDto = {
  readonly amountMinor: number
  readonly currency: 'EUR'
}

export type CapitalReconciliationErrorDto =
  | {
      readonly _tag: 'NegativeAmount'
      readonly field: string
      readonly amount: MoneyMinorUnitsDto
    }
  | {
      readonly _tag: 'StageOrderViolation'
      readonly earlierStage: string
      readonly laterStage: string
      readonly earlierAmount: MoneyMinorUnitsDto
      readonly laterAmount: MoneyMinorUnitsDto
    }

export type ClosingReadinessDto = {
  readonly deal: {
    readonly id: string
    readonly name: string
    readonly lifecycleState: string
    readonly closingReviewDateLabel: string
    readonly lastUpdatedLabel: string
  }
  readonly readiness: {
    readonly state: 'ready' | 'attention' | 'blocked' | 'not_started'
    readonly title: string
    readonly description: string
    readonly deadline: string
    readonly blockerCount: number
  }
  readonly capital: {
    readonly targetAmount: MoneyMinorUnitsDto
    readonly committedAmount: MoneyMinorUnitsDto
    readonly signedAmount: MoneyMinorUnitsDto
    readonly receivedAmount: MoneyMinorUnitsDto
    readonly matchedAmount: MoneyMinorUnitsDto
    readonly remainingToTarget: MoneyMinorUnitsDto
    readonly overTarget: MoneyMinorUnitsDto
    readonly unsignedCommitted: MoneyMinorUnitsDto
    readonly unreceivedSigned: MoneyMinorUnitsDto
    readonly unmatchedReceived: MoneyMinorUnitsDto
    readonly unfundedCommitted: MoneyMinorUnitsDto
    readonly hasUnmatchedFunds: boolean
    readonly isOverTarget: boolean
  }
  readonly blockers: readonly {
    readonly id: string
    readonly severity: 'critical' | 'warning' | 'info'
    readonly kind: string
    readonly owner: string
    readonly title: string
    readonly nextAction: string
    readonly dueLabel?: string
  }[]
}
```

The DTO is intentionally app-facing. It may contain display copy derived from
fixtures for this showcase pass, but domain packages must still not return
translated prose.

## 10. Application Service

Create:

```text
apps/web/server/application/deal-readiness-service.ts
```

Responsibilities:

- find the deal fixture by `dealId`
- convert fixture capital data into `CapitalReconciliationInput`
- call `summarizeCapitalReconciliation`
- use `Result` to represent supported/unsupported/reconciliation outcomes
- map exact `EuroCents` values into JSON-safe DTO money values
- return a typed internal result to the router

Suggested internal type:

```ts
type DealReadinessServiceError =
  | { readonly _tag: 'UnsupportedDeal'; readonly dealId: string }
  | { readonly _tag: 'ReconciliationError'; readonly error: CapitalReconciliationError }

type DealReadinessServiceResult = Result<ClosingReadinessDto, DealReadinessServiceError>
```

Implementation constraint:

- `deal-readiness-service.ts` may import `@repo/core` and `@repo/domain`.
- Client Components must not call this service directly.
- React Server Components may call app services directly through route loaders.

## 11. Rendering Strategy

Use `ts-pattern` in `apps/web` where the output is consumed.

Minimum required match:

```ts
match(readiness)
  .with({ _tag: 'Ok' }, ...)
  .with({ _tag: 'UnsupportedDeal' }, ...)
  .with({ _tag: 'ReconciliationError' }, ...)
  .exhaustive()
```

For the current App Router surface:

- unsupported deal should call/render `notFound()` from the route layer
- reconciliation error should render the route `error.tsx` path or a local
  operational error panel, depending on implementation simplicity
- successful data should render the same dashboard modules as today

Do not use `ts-pattern` merely to replace obvious booleans.

## 12. RSC And Client Components

Current RSC implementation:

- Server Component routes call app services directly through route loaders.
- tRPC adapts the same app services for API/client and future mutation
  boundaries.
- RSC routes should not be refactored to tRPC server callers for symmetry.
- Existing interactive client components remain local and receive already
  resolved data.

Optional extension:

- Add a client-side `trpc` provider and TanStack Query only for a meaningful
  interactive query state, such as a refreshable readiness panel.
- If added, render `pending/error/success` states explicitly and test them.

Do not add a global provider if no client component uses it.

## 13. Route Integration

The first target route is:

```text
/deals/[dealId]/about
```

Required behavior:

- keep `/deals/[dealId]` redirecting to `/about`
- keep unsupported deal routes rendering not found
- render the existing dashboard success state for `northstar-energy`
- source the about route readiness/capital/blocker data from
  `deal.getClosingReadiness`
- avoid duplicating direct fixture reads in the about route after integration

Follow-up routes may continue using direct fixtures until later passes:

```text
/deals/[dealId]/commitments
/deals/[dealId]/documents
```

This keeps the slice narrow and reviewable.

## 14. Tests

Add focused tests at three layers.

### Service Tests

If `apps/web` has no Vitest setup yet, either:

- add a narrow app Vitest setup for server application code, or
- test the service through tRPC caller tests.

Required cases:

- supported deal returns `_tag: 'Ok'`
- unsupported deal returns `_tag: 'UnsupportedDeal'`
- reconciliation error maps to `_tag: 'ReconciliationError'` using a controlled
  invalid fixture/input path
- money DTOs preserve exact minor-unit values

### Type Tests

Use TypeScript `satisfies` or compile-time checks to ensure the procedure output
is a discriminated union and the UI match remains exhaustive.

### Playwright

Update app e2e coverage:

- `/deals/northstar-energy/about` still renders the readiness dashboard
- unsupported deal still renders not found
- if a local operational error panel is rendered for reconciliation errors,
  cover it through a deterministic test route or injected fixture flag

Do not add broad network mocking unless the implementation chooses a client-side
tRPC query. Service-first RSC integration should be covered through normal route
navigation.

## 15. Verification

Required commands:

```bash
pnpm --filter @repo/web typecheck
pnpm --filter @repo/web build
pnpm --filter @repo/web e2e
pnpm turbo typecheck lint test
pnpm lint
pnpm e2e
git diff --check
```

If adding app-level unit tests:

```bash
pnpm --filter @repo/web test
```

## 16. Acceptance Criteria

The slice is complete when:

- `apps/web` has one working tRPC router and route handler
- `deal.getClosingReadiness` is the source for the about route's readiness
  summary/capital/blocker data
- the server application service uses `@repo/core` `Result` internally
- the tRPC output is serializable and discriminated by `_tag`
- app rendering uses `ts-pattern` with `.exhaustive()` for the procedure output
- no package boundary is weakened
- unsupported deal behavior remains intact
- existing app visuals do not regress
- verification commands pass or documented blockers are recorded

## 17. Rationale

This slice is intentionally small because the goal is architectural signal, not
backend breadth.

It shows the right things:

- `tRPC` for typed application boundaries
- `@repo/core` for recoverable domain/application outcomes
- `@repo/domain/reconciliation` for exact financial rules
- `ts-pattern` for exhaustive UI decisions
- `@repo/kit` for reusable product presentation

It avoids the wrong things:

- fake persistence
- premature auth
- API boilerplate across every route
- returning non-serializable rich core objects over the wire
- using libraries as decoration

For a Roundtable review, this is the credible middle ground: one production
shaped workflow slice that demonstrates depth without pretending the whole app
has a backend.
