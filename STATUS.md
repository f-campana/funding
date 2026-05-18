# T5D-D Operator Documents Route Status

## Objective

Wire the operator documents route to the accepted `DealDocumentsEvidence` kit
baseline using the app-owned Northstar `DealOperationalCenterDTO.documents`
data.

This pass does not build the investor `/about` lens, does not add a persona
toggle, and does not change backend, tRPC, domain, auth, database, mutation, or
persistence behavior.

## Current Truth

- `/deals/northstar-energy` redirects to `/deals/northstar-energy/overview`.
- `/deals/northstar-energy/overview` remains the operator workspace entry
  route.
- `/deals/northstar-energy/about` redirects to `/deals/northstar-energy/overview`
  for compatibility and remains reserved for the future investor lens.
- `/deals/northstar-energy/commitments` renders the operator commitments table
  and opens the route-owned commitment inspector in a Sheet drawer.
- `/deals/northstar-energy/documents` renders the operator documents and
  evidence readiness surface with `DealDocumentsEvidence`.
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
- The documents route uses an app-owned adapter from
  `DealOperationalCenterDTO.documents` to `DealDocumentsEvidenceProps`.
- The documents surface is read-only: no fake upload, review, approval, request,
  mutation, or persistence actions are wired.
- The app does not import kit fixtures or Storybook fixtures.

## Validation

Passed for this pass:

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
  `/tmp/t5d-d-wire-operator-documents-route/`

## Next Work

The operator vertical is route-complete for the current operator IA: overview,
commitments, and documents are all wired to accepted kit surfaces.
The investor `/about` lens, persona toggle, backend/database work, and document
mutations remain future scope.
