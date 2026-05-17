# T5D-B4 Overview Route IA Status

## Objective

Rename the Northstar operator entry route from About to Overview and align the
app route IA with the product design spec.

This pass keeps `/commitments` and `/documents` unwired, reserves `/about` for a
future investor lens, does not add a persona toggle, and does not change
backend, tRPC, domain, or kit APIs.

## Current Truth

- `/deals/northstar-energy` redirects to `/deals/northstar-energy/overview`.
- `/deals/northstar-energy/overview` renders the operator workspace entry route.
- `/deals/northstar-energy/about` redirects to `/deals/northstar-energy/overview`
  for compatibility and remains reserved for the future investor lens.
- Visible operator tabs are Overview, Commitments, and Documents.
- The overview route still composes accepted kit baselines:
  - `DealOperationalOverview`
  - `DealProgressPanel`
- Commitments and documents remain pending product routes.

## Implementation Notes

- The overview route uses app-owned adapters from the Northstar operational DTO.
- The right rail owns committed-vs-target progression, net investable amount,
  fees, primary actions, operational snapshot, and exception queue.
- The main overview capital block now emphasizes reconciliation evidence and
  exceptions instead of repeating the full progression/economics story.
- Public route copy no longer uses internal rebuild, baseline, scaffold, or
  placeholder language.

## Validation

Passed:

- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web typecheck`
- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/web e2e`
- `pnpm --filter @repo/kit typecheck`
- `pnpm --filter @repo/kit test:coverage`
- `pnpm storybook:build`
- `pnpm lint`
- `git diff --check`

Storybook build completed with the existing Vite chunk-size warning and the
existing Turbo warning about no declared `@repo/kit#build` output files.

## Next Work

T5D-C commitments wiring is unblocked from the route-IA side. It should wire the
operator commitments workflow without using `/about`, without adding the
investor lens, and without weakening the current kit-first composition.
