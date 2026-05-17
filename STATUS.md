# T5D-C1 Commitments Route Hardening Status

## Objective

Align the repository status after the operator commitments route was wired and
polish the commitments footer so the table exposes useful deal information.

This pass does not add the row inspector, does not start the documents route,
does not add the investor `/about` lens, and does not change kit APIs.

## Current Truth

- `/deals/northstar-energy` redirects to `/deals/northstar-energy/overview`.
- `/deals/northstar-energy/overview` renders the operator workspace entry route.
- `/deals/northstar-energy/about` redirects to `/deals/northstar-energy/overview`
  for compatibility and remains reserved for the future investor lens.
- `/deals/northstar-energy/commitments` renders the operator commitments
  workflow using `DealCommitmentsTable`.
- `/deals/northstar-energy/documents` remains pending until the documents route
  pass.
- Visible operator tabs are Overview, Commitments, and Documents.

## Implementation Notes

- The overview route uses app-owned adapters from the Northstar operational DTO.
- The commitments route maps `InvestorOperationDTO` rows into
  `DealCommitmentsTable` props without kit fixture imports.
- The commitments footer now shows the useful committed-capital summary:
  `Overall committed €4,850,000`.
- The right rail still owns committed-vs-target progression, net investable
  amount, fees, primary actions, operational snapshot, and exception queue.
- The main overview capital block emphasizes reconciliation evidence and
  exceptions instead of repeating the full progression/economics story.
- Public route copy no longer uses internal rebuild, baseline, scaffold, or
  placeholder language.

## Validation

Passed:

- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web typecheck`
- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/web e2e`
- `pnpm lint`
- `git diff --check`

## Next Work

T5E-C2 should build a `DealCommitmentInspector` kit baseline before documents
work starts. The row inspector will expose investor-specific blockers, readiness
details, and related evidence, which gives the later documents route clearer
connection points back to commitments.
