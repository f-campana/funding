# T5D-C2 Commitment Inspector Route Wiring Status

## Objective

Wire the accepted `DealCommitmentInspector` kit baseline into the operator
commitments route.

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
  and a route-owned commitment inspector panel.
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
- The inspector panel is inline route content, not a global modal.
- The app does not import kit fixtures or Storybook fixtures.

## Validation

Passed:

- `pnpm --filter @repo/web test`
- `pnpm --filter @repo/web typecheck`
- `pnpm --filter @repo/web build`
- `pnpm --filter @repo/kit typecheck`
- `pnpm --filter @repo/kit test:coverage`
- `pnpm storybook:build`
- `pnpm lint`
- `git diff --check`
- fixture/copy searches for `apps/web`

Blocked by the local browser environment:

- `pnpm --filter @repo/web e2e` failed before test execution because Chromium
  could not launch in the macOS sandbox:
  `bootstrap_check_in org.chromium.Chromium.MachPortRendezvousServer... Permission denied (1100)`.
- Codex in-app Browser screenshot QA was also blocked by its browser security
  policy for `http://127.0.0.1:3000`.

## Next Work

T5E-D documents/evidence kit baseline is technically unblocked by the route
composition work, but browser e2e and screenshot QA should be rerun in a
non-blocked local browser environment before calling the route fully QA-cleared.
