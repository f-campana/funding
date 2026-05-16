# Ralph Loop: Domain Reconciliation

You are implementing the next bounded domain pass in the Funding monorepo.

## Objective

Implement `@repo/domain/reconciliation` from:

- `docs/20-specs/domain-reconciliation-spec.md`
- `docs/30-testing/testing-domain-reconciliation.md`

Also read and obey:

- `docs/20-specs/domain-spec.md`
- `docs/10-architecture/domain-adrs.md`
- `docs/10-architecture/package-boundaries.md`
- `docs/10-architecture/monorepo-conventions.md`
- `docs/30-testing/testing-domain.md`
- `docs/60-planning/closing-readiness-exception-dashboard-v1.md`
- `docs/60-planning/private-markets-domain-roadmap.md`

Preserve existing bootstrap, core, design-token, Tailwind, UI, kit, Storybook,
and app structure. This loop is scoped to `packages/domain` plus the standard
`PLAN.md` and `STATUS.md` bookkeeping.

## Non-Goals

Do not implement:

- React components
- kit/dashboard changes
- design-token changes
- status color tokens
- tRPC or GraphQL
- Prisma/database code
- banking integrations
- IBAN/SWIFT validation
- payment-provider webhooks
- accounting ledgers
- FX or multi-currency
- legal close-readiness computation
- concentration risk helpers
- app routes or server actions

The purpose is to create exact domain vocabulary and helpers that a later
Closing Readiness + Exception Dashboard loop can consume.

## Required Work

Add the reconciliation module:

```text
packages/domain/src/reconciliation/
  fixtures.ts
  index.ts
  reconciliation.test-types.ts
  reconciliation.test.ts
  reconciliation.ts
```

Update:

```text
packages/domain/src/index.ts
packages/domain/src/package-exports.test.ts
packages/domain/package.json
packages/domain/README.md
PLAN.md
STATUS.md
```

Implement the public API specified in
`docs/20-specs/domain-reconciliation-spec.md`:

- `CapitalStage`
- `CapitalStageSchema`
- `PaymentStatus`
- `PaymentStatusSchema`
- `PaymentRecord`
- `PaymentRecordSchema`
- `CapitalReconciliationInput`
- `CapitalReconciliationSummary`
- `CapitalReconciliationAmountField`
- `CapitalReconciliationError`
- `summarizeCapitalReconciliation`
- reconciliation/payment fixtures

Use `EuroCents` for every money value. Use existing money helpers for
arithmetic and comparison. Do not convert money to `number` for calculations.

## Milestones

### Milestone 1 — Read, Plan, Audit

1. Read every required document listed above.
2. Inspect current `packages/domain` structure, exports, tests, and README.
3. Write/update `PLAN.md` with the milestones for this loop.
4. Write/update `STATUS.md` with the starting state.

Verification:

```bash
pnpm --filter @repo/domain typecheck
```

### Milestone 2 — Module Skeleton And Exports

1. Create `packages/domain/src/reconciliation/index.ts`.
2. Create `packages/domain/src/reconciliation/reconciliation.ts`.
3. Add focused package export `@repo/domain/reconciliation`.
4. Add root barrel exports without removing existing exports.
5. Update the package export smoke test.

Verification:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
```

### Milestone 3 — Schemas And Exact Helpers

1. Implement capital and payment status schemas.
2. Implement `PaymentRecordSchema` with safe number-to-`EuroCents` transforms.
3. Implement `summarizeCapitalReconciliation`.
4. Add fixtures.

Rules:

- invalid reconciliation inputs return `Result.Error`
- no thrown exceptions for expected invalid domain data
- `matched <= received <= signed <= committed`
- over-target committed capital is allowed
- all derived amounts are exact `EuroCents`

Verification:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
```

### Milestone 4 — Tests

Add tests required by `docs/30-testing/testing-domain-reconciliation.md`:

- status schema tests
- payment record schema tests
- reconciliation summary unit tests
- property tests for monotonic capital inputs
- type tests for branded amounts and IDs

Verification:

```bash
pnpm --filter @repo/domain test:coverage
```

### Milestone 5 — Documentation And Final Audit

1. Update `packages/domain/README.md`.
2. Update `PLAN.md` and `STATUS.md` with final results.
3. Run all verification commands.
4. Run the boundary audits from the testing doc.
5. Record any blocker or deviation in `STATUS.md`.

Final verification:

```bash
pnpm --filter @repo/domain typecheck
pnpm --filter @repo/domain lint
pnpm --filter @repo/domain test:coverage
pnpm turbo typecheck lint test
pnpm lint
git diff --check
```

Boundary audits:

```bash
rg "from ['\\\"](react|next|@repo/ui|@repo/kit|@repo/tailwind-config|@repo/design-tokens)" packages/domain/src/reconciliation
rg "trpc|graphql|prisma|database|iban|swift|fx|currencyCode" packages/domain/src/reconciliation
rg "Number\\(|parseFloat|parseInt|\\.toFixed\\(" packages/domain/src/reconciliation
```

## Completion Report

Stop after verification. Report:

- files changed
- public API added
- tests added
- verification results
- audit results
- any deviations

Do not start the status-token pass or dashboard implementation pass in this
goal.
