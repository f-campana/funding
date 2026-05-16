# T5D-A2 Data Spine And Kit Baseline Hardening Status

## Objective

Harden the Northstar operational data spine and the accepted `@repo/kit`
baselines before the next route wiring pass.

This pass does not wire `/about`, `/commitments`, or `/documents`, does not
rebuild the Deal Workspace UI, and does not reintroduce deleted kit surfaces.

## Current Truth

- `@repo/kit` currently exposes only:
  - `DealCommitmentsTable`
  - `DealProgressPanel`
  - public props, state, action, label, and input types needed by those
    components.
- Legacy kit surfaces from earlier loops were removed and should be treated as
  historical implementation work, not current API.
- Future app vertical work should rebuild route-specific surfaces from the
  accepted table and progress-panel baselines.
- `apps/web` owns the Northstar operational data spine under
  `apps/web/server/deals/**` and the tRPC seam under `apps/web/server/trpc/**`
  plus `apps/web/app/api/trpc/[trpc]/route.ts`.
- The Northstar vertical is not complete until the real app routes consume the
  hardened spine for the about, commitments, and documents workflows.

## Hardening Changes

- Readiness dimensions now derive state from source operational data and
  unresolved blockers, so missing blockers cannot falsely make a dimension
  ready.
- Investor row readiness in the app DTO also accounts for KYC/KYB, signature,
  and wire source statuses.
- `DealCommitmentsTable` keeps row click as a pointer convenience, but the row
  opener is now the focusable action button with an explicit open-detail label
  and keyboard tests for Enter and Space.
- Stable table and progress-panel copy moved into accepted label props and
  fixtures; product row/status fixture copy remains display-ready data.
- `NormalizedDealProgressSegment` is internal to the progress-panel model and
  is no longer exported from public kit entrypoints.

## Validation

Passed:

- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web typecheck`
- `pnpm --filter @repo/kit typecheck`
- `pnpm --filter @repo/kit lint`
- `pnpm --filter @repo/kit test:coverage`
- `pnpm storybook:build`
- `pnpm lint`
- `git diff --check`

Storybook build completed with non-blocking Vite chunk-size warnings and the
existing Turbo warning about no declared `@repo/kit#build` output files.

Search verification confirms current docs no longer present deleted kit
surfaces as active API. Remaining old surface references are historical/spec
archive context. `NormalizedDealProgressSegment` remains only as an internal
model type.

## Next Work

T5D-B route wiring is the next pass after this hardening validation is clean.
That pass should consume the app-owned Northstar DTO/tRPC seam and map it into
route-owned views without reviving removed kit surfaces.
