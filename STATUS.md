# T5E-C3 DealCommitmentInspector Contract Hardening Status

## Objective

Harden the newly added `DealCommitmentInspector` kit baseline before wiring it
into the operator commitments route.

This pass does not wire apps/web, does not create the drawer/panel route
container, does not start the documents route, does not add the investor
`/about` lens, and does not change backend/tRPC/domain behavior.

## Current Truth

- `/deals/northstar-energy` redirects to `/deals/northstar-energy/overview`.
- `/deals/northstar-energy/overview` renders the operator workspace entry route.
- `/deals/northstar-energy/about` redirects to `/deals/northstar-energy/overview`
  for compatibility and remains reserved for the future investor lens.
- `/deals/northstar-energy/commitments` renders the operator commitments
  workflow using `DealCommitmentsTable`.
- `DealCommitmentInspector` is an accepted `@repo/kit` baseline for inspecting
  one investor commitment, but it is not wired into apps/web yet.
- `/deals/northstar-energy/documents` remains pending until the documents route
  pass.
- Visible operator tabs are Overview, Commitments, and Documents.

## Implementation Notes

- The overview route uses app-owned adapters from the Northstar operational DTO.
- The commitments route continues to map `InvestorOperationDTO` rows into
  `DealCommitmentsTable` props without kit fixture imports.
- `DealCommitmentInspector` now uses its `labels.title` contract as the root
  accessible region name.
- `DealCommitmentsTable` and `DealCommitmentInspector` share the same
  commitment readiness key contract.
- The right rail still owns committed-vs-target progression, net investable
  amount, fees, primary actions, operational snapshot, and exception queue.
- The main overview capital block emphasizes reconciliation evidence and
  exceptions instead of repeating the full progression/economics story.
- Public route copy no longer uses internal rebuild, baseline, scaffold, or
  placeholder language.

## Validation

Passed:

- `pnpm --filter @repo/kit test -- deal-commitment-inspector deal-commitments-table`
- `pnpm --filter @repo/kit typecheck`
- `pnpm --filter @repo/kit lint`
- `pnpm --filter @repo/kit test:coverage`
- `pnpm storybook:build`
- `pnpm lint`
- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web typecheck`
- `git diff --check`

## Next Work

T5D-C2 should wire `DealCommitmentInspector` into the commitments route as the
route-owned investor commitment inspection surface. That pass should compose app
DTO data into the accepted kit baseline without starting `/documents`, the
investor `/about` lens, persona toggles, or backend/domain work.
