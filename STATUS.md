# T5F-E Web Vitals And Observability Baseline Status

## Objective

Add a lightweight Web Vitals and frontend observability baseline around the
route-complete Northstar operator vertical.

This pass does not add Datadog, PostHog, Sentry, vendor SDKs, credentials,
backend, Prisma, auth, database, live data, mutations, investor `/about`,
persona toggles, route-loader tRPC refactors, kit API changes, or additional
bundle/RSC optimization.

## Current Truth

- `/deals/northstar-energy` redirects to `/deals/northstar-energy/overview`.
- `/deals/northstar-energy/overview` remains the operator workspace entry
  route.
- `/deals/northstar-energy/about` redirects to `/deals/northstar-energy/overview`
  for compatibility and remains reserved for the future investor lens.
- `/deals/northstar-energy/commitments` renders the operator commitments table
  and composes the commitment inspector inside a Sheet drawer driven by the
  table detail state.
- `/deals/northstar-energy/documents` renders the operator documents and
  evidence readiness surface with `DealDocumentsEvidence`.
- Visible operator tabs are Overview, Commitments, and Documents.
- App Router server routes load deal data through `getDealOperationsData()`,
  which calls the app service `getDealOperationalCenter()` directly.
- Route deal params are normalized through the app/service input schema and
  invalid slug-shaped params fall through the existing unsupported/not-found
  behavior.
- tRPC is not the route-loader boundary. It is a typed transport adapter for
  client/API access and future mutations over the same app services.
- The current `deal.getOperationalCenter` tRPC read is fixture-backed
  demo/internal access through `publicProcedure`. It is not
  production-private-data safe until real auth and protected procedures exist.
- `DealOperationalCenterDTO` output is validated at the app service boundary
  before `Result.Ok` and mapped through the tRPC output union on validation
  failure.
- Northstar capital follows the invariant
  `gross committed = net investable amount + entry fees + SPV fees`.
- Matched funds are a payment-matching stage. They are not presented as
  finance-accepted, reconciled, or deployable capital unless the source model
  explicitly proves finance acceptance.
- `apps/web/observability` owns typed frontend telemetry events, route
  sanitization, Web Vitals event mapping, and local transport behavior.
- `WebVitalsReporter` is mounted once in the root app layout and uses Next.js
  `useReportWebVitals`.
- Telemetry routes are stored as stable patterns such as
  `/deals/[dealId]/commitments`, not raw deal URLs.
- The commitment inspector emits only safe open/close route interaction events.

## Implementation Notes

- The operator routes use app-owned adapters from the Northstar operational DTO.
- Route loaders and server deal modules are marked with `server-only`
  guardrails where they must stay out of client component graphs.
- Runtime validation is app-owned in `apps/web/server/deals`: Zod protects
  route/service/API trust boundaries for slug input, JSON-safe EUR money DTOs,
  and ISO date-time strings.
- Cross-DTO graph references are validated across investors, blockers,
  documents, document groups, and activity.
- Capital validation checks committed economics, matched-vs-received semantics,
  target position coherence, and forbids finance-accepted/deployable/reconciled
  aggregate fields unless the source model proves those semantics.
- TypeScript remains the internal contract for route adapters and accepted kit
  props; broad Zod schemas for React props are intentionally not added.
- RSC routes should not be refactored to call `createServerTrpcCaller()` for
  architectural symmetry.
- The overview route maps readiness, blockers, capital exceptions, and activity
  to `DealOperationalOverview`.
- The rail maps deal progression and operational snapshot data to
  `DealProgressPanel` plus route-owned summary cards.
- `DealCommitmentsTable` remains the commitments list and batch-selection
  surface.
- `DealCommitmentInspector` is composed from selected investor DTO data plus
  related blockers, evidence, and activity, and renders through
  `DealCommitmentsTableDetail`.
- Row/detail open state is table-owned by default through `rowState`; lift it
  only if another route sibling needs ownership.
- Checkbox selection is table-local unless a route-level batch action bar or
  another sibling consumes it.
- The inspector is no longer persistent inline route content; it renders inside
  `@repo/ui` `SheetContent` when an investor row opener is activated.
- The documents route uses an app-owned adapter from
  `DealOperationalCenterDTO.documents` to `DealDocumentsEvidenceProps`.
- The documents surface is read-only: no upload, review, approval, request,
  mutation, or persistence actions are wired.
- The app does not import kit fixtures or component-preview fixtures.
- The telemetry model currently covers `web_vital` and `route_interaction`
  events.
- Production observability should wire Datadog, PostHog, or another provider by
  replacing or composing the telemetry transport boundary, not by changing route
  components.
- The default production transport is no-op. Local browser console telemetry is
  available only when explicitly enabled with the
  `funding.telemetry.console` localStorage flag.
- Telemetry metadata intentionally excludes investor email, investor/legal
  names, document labels, raw descriptions, blocker descriptions, sensitive
  financial details, and other private deal content.

## Validation

Current observability validation target:

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
- `pnpm --filter @repo/web bundle:report`
- observability privacy/vendor/server-import guardrail searches
- browser smoke under `/tmp/t5f-e-web-vitals-observability-baseline/`

## Next Work

The operator vertical is route-complete for the current operator IA and now has
a lightweight, privacy-safe frontend telemetry boundary. Investor `/about`
planning and backend/repository planning are unblocked as separate future
planning passes. Persona toggles, database work, auth, mutations, uploads, and
document workflow actions remain out of scope.
