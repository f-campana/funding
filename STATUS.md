# T5F-A Route-Complete Operator Vertical Status

## Objective

Review and lightly harden the route-complete Northstar operator vertical across
Overview, Commitments, the commitment inspector Sheet, and Documents.

This pass does not build the investor `/about` lens, does not add a persona
toggle, and does not change backend, tRPC, domain, Prisma, auth, database,
mutation, action, upload, reminder, approval, or persistence behavior.

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

- The operator routes use app-owned adapters from the Northstar operational DTO.
- The overview route maps readiness, blockers, capital exceptions, and activity
  to `DealOperationalOverview`.
- The rail maps deal progression and operational snapshot data to
  `DealProgressPanel` plus route-owned summary cards.
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
- The documents surface is read-only: no upload, review, approval, request,
  mutation, or persistence actions are wired.
- The app does not import kit fixtures or component-preview fixtures.

## Validation

Current hardening validation target:

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
- fixture/copy/current-route searches for `apps/web`
- Browser screenshot QA under
  `/tmp/t5f-a-review-harden-route-complete-operator-vertical/`

## Next Work

The operator vertical is route-complete for the current operator IA: overview,
commitments, and documents are all wired to accepted kit surfaces.
The investor `/about` lens, persona toggle, backend/database work, and document
mutations remain future scope. The next strategic direction is planning the
investor `/about` lens, backend/repository/Prisma integration, app-level
dark-mode support, or broader portfolio polish after this route vertical passes
review validation.
