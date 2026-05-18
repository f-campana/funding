# T5D-C3 Commitment Inspector Sheet Drawer Status

## Objective

Convert the accepted `DealCommitmentInspector` kit baseline from an inline
operator commitments panel into a route-owned Sheet drawer.

This pass does not wire `/documents`, does not build the investor `/about`
lens, does not add a persona toggle, and does not change backend, tRPC, domain,
auth, database, mutation, or persistence behavior.

## Current Truth

- `/deals/northstar-energy` redirects to `/deals/northstar-energy/overview`.
- `/deals/northstar-energy/overview` remains the operator workspace entry
  route.
- `/deals/northstar-energy/about` redirects to `/deals/northstar-energy/overview`
  for compatibility and remains reserved for the future investor lens.
- `/deals/northstar-energy/commitments` renders the operator commitments table
  and opens the route-owned commitment inspector in a Sheet drawer.
- `/deals/northstar-energy/documents` remains pending until the documents route
  pass.
- Visible operator tabs are Overview, Commitments, and Documents.

## Implementation Notes

- The commitments route uses app-owned adapters from the Northstar operational
  DTO.
- `DealCommitmentsTable` remains the commitments list and batch-selection
  surface.
- `DealCommitmentInspector` is composed from selected investor DTO data plus
  related blockers, evidence, and activity.
- Row open state, inspector open state, and checkbox selection are owned by the
  route and kept separate.
- The inspector is no longer persistent inline route content; it renders inside
  `@repo/ui` `SheetContent` when an investor row opener is activated.
- The app does not import kit fixtures or Storybook fixtures.

## Validation

Passed:

- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web typecheck`
- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/web e2e`
- `pnpm --filter @repo/ui typecheck`
- `pnpm --filter @repo/ui test:coverage`
- `pnpm --filter @repo/kit typecheck`
- `pnpm --filter @repo/kit test:coverage`
- `pnpm storybook:build`
- `pnpm lint`
- `git diff --check`
- fixture/copy searches for `apps/web`
- Browser screenshot QA under
  `/tmp/t5d-c3-commitment-inspector-sheet-drawer/`

## Next Work

T5E-D documents/evidence kit baseline is unblocked by the route composition
work. Keep `/documents`, the investor `/about` lens, persona toggle, and
backend/domain work out of that kit baseline pass unless a later scope expands.
