# React Foundations Repo Audit

Status: Audit findings  
Created: 2026-05-19  
Scope: `apps/web`, `packages/ui`, `packages/kit`, repo React tooling, and
React-adjacent tests  
Primary reference: `/Users/fabiencampana/Documents/roundtable/07_cheat_sheets/react.md`

## Executive Summary

This audit reviewed the current repo against the local React Foundations cheat
sheet. The repo is generally healthy on basic React correctness: lint,
typecheck, and unit tests pass; production hook call order is clean; keys are
stable; TypeScript is strict; and UI/kit tests include meaningful interaction
and accessibility coverage.

The main risks are architectural rather than syntax-level:

- Several data-heavy surfaces are marked as client components even when the
  current ready-state UI is read-only.
- The commitments route eagerly serializes all inspector details into a client
  component although only one drawer can be open at a time.
- `DealCommitmentsTable` has ambiguous controlled/uncontrolled ownership and
  mirrors props into state with effects.
- Expensive table modeling is wrapped in `useMemo`, but the dependency shape
  prevents that memo from being useful.
- Some accessibility semantics describe only part of the actual interaction
  contract.
- Tooling catches many mistakes, but server/client boundary drift,
  StrictMode-style effect idempotency, Storybook interactions, contrast, and
  performance budgets are not fully enforced.

The best next implementation pass should not introduce a global store or more
memoization first. The highest leverage work is to sharpen boundaries:
server/client boundaries, state ownership boundaries, and semantic UI
boundaries.

## Audit Method

The review was split into four read-only lanes, then consolidated manually:

1. Hooks, state, effects, stale closures, dependency arrays, and controlled
   state.
2. Composition, performance, React Server Components, route boundaries, and
   streaming implications.
3. UI primitives, accessibility semantics, keyboard behavior, and design-system
   consistency.
4. Tests, linting, Storybook, CI-style safeguards, and static enforcement.

The audit intentionally treated the cheat sheet as the source of truth. It
looked for concrete code evidence, not theoretical preference. Findings below
are kept only where there is a file-level symptom and a practical risk.

## Verification Snapshot

Commands run during the audit:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Result: all passed.

The tooling lane also listed Playwright tests with `playwright test --list` and
found 13 e2e tests. A full `pnpm e2e` run was not part of this audit.

Current git state at the start of documentation work already had modified
planning docs. This new document was created separately and does not overwrite
those existing edits.

## Cheat-Sheet Principles Used

The findings below are tied to these local React principles:

- Hooks depend on call order and render snapshots.
- `useEffect` is a synchronization mechanism, not a lifecycle or prop-mirroring
  tool.
- Dependency arrays are correctness contracts.
- State should live as close as possible to its owner.
- Derived state should be computed rather than synchronized through effects.
- Structural performance comes before `memo`, `useMemo`, and `useCallback`.
- `useMemo` only helps if its dependencies are stable and the computation is
  worth memoizing.
- Composition and inversion of control scale better than configuration-heavy
  APIs.
- Server Components should carry data-heavy, non-interactive UI; client
  boundaries should be pushed to interactive leaves.
- UI semantics should match actual behavior.

## Severity Model

- P1: likely to create meaningful bundle, payload, correctness, or scaling risk
  as the app grows.
- P2: concrete product or developer-experience risk with local fixes available.
- P3: low-risk issue, tooling gap, or opportunistic cleanup.

## P1 Findings

### 1. Data-Heavy Surfaces Cross Client Boundaries Too Early

Evidence:

- `apps/web/app/deals/[dealId]/commitments/page.tsx:21`
- `apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts:178`
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:88`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.tsx:1`
- `apps/web/app/deals/[dealId]/overview/page.tsx:19`
- `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.tsx:1`
- `apps/web/app/deals/[dealId]/documents/page.tsx:19`

Current behavior:

The commitments page builds `mapDealCommitmentInspectorViewModel(data)` on the
server and passes the whole result into `CommitmentsWorkspace`, a client
component. That mapper constructs `propsByInvestorId` for every investor. The
client workspace then selects one entry by open row id and renders only one
drawer at a time.

Separately, overview and document evidence kit roots are marked `'use client'`.
Their current ready states are mostly structured read-only lists, cards, facts,
badges, timestamps, and progress sections.

Why this matters:

The cheat sheet's Server Component guidance is explicit: data-heavy UI with no
interactivity should stay on the server, and `'use client'` should be pushed to
the leaves. The current shape sends more serialized data and component code to
the browser than the UI requires.

For current fixtures this is manageable. With a real backend, more investors,
larger activity histories, and more documents, the commitments page payload and
hydration memory will scale with hidden inspector details. Overview and
documents also lose the chance to stay as streamable server-rendered markup.

Rationale:

This is higher priority than ordinary component cleanup because it affects the
route's architectural direction. Once large view models are normalized as client
props, later features tend to add more client-side derivation, more callbacks,
and more memoization around an avoidable boundary.

Recommended direction:

- Split ready-state read-only rendering from interactive retry/action leaves.
- Keep overview and documents ready content as server-renderable composition
  where possible.
- For commitments, pass table rows to the client only where table interaction
  requires it.
- Load or derive inspector details only for the selected investor, or move the
  drawer detail content behind a route/search-param/server boundary.
- If keeping eager inspector maps temporarily, add a payload budget or explicit
  acceptance note so it remains a measured tradeoff.

### 2. Server Deal Data Is Recomputed In Layout And Child Routes

Evidence:

- `apps/web/app/deals/[dealId]/layout.tsx:17`
- `apps/web/app/deals/[dealId]/overview/page.tsx:13`
- `apps/web/app/deals/[dealId]/documents/page.tsx:13`
- `apps/web/app/deals/[dealId]/commitments/page.tsx:14`
- `apps/web/server/deals/operational-center-service.ts:72`

Current behavior:

The deal layout calls `getDealOperationsData(dealId)`. Each nested route calls
the same loader again. The service performs reconciliation, document mapping,
blocker mapping, investor mapping, DTO construction, and validation.

Why this matters:

The cheat sheet supports colocated Server Component data fetching, but
colocation does not mean repeated expensive work by default. With fixture data,
this is cheap. With real I/O and validation, this can become duplicated
request-time work unless cached or split by route-specific DTOs.

Rationale:

This is a structural performance issue. React memoization does not solve it
because the duplicated work happens before the client render and across route
segments. The better fix is to decide what the layout owns, what each route
owns, and what should be cached or narrowed.

Recommended direction:

- Add request-level caching around `getDealOperationsData` if the full DTO
  remains shared across layout and child routes.
- Prefer route-specific DTOs for overview, commitments, rail, and documents as
  backend work becomes real.
- Keep the layout data narrow: deal shell/header/nav/rail summary only.
- Avoid passing a full operational DTO into client components.

## P2 Findings

### 3. `DealCommitmentsTable` Mirrors Props Into Local State With Effects

Evidence:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:68`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:92`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:122`

Previous behavior:

The table seeded local state from `state`, then used effects to copy later
ready-state prop values into local state when matching callbacks were absent:

- `activeFilterIds`
- `page`
- `pageSize`
- `searchValue`
- `selectedRowIds`

Why this matters:

The cheat sheet frames `useEffect` as synchronization with external systems,
not a general way to mirror props. Here the effects blur the ownership
contract:

- If the table is uncontrolled, prop values should usually seed initial state,
  not keep overwriting user edits after paint.
- If the table is controlled, the state should come from props and callbacks.
- If a later ready state omits values like `searchValue` or `selectedRowIds`,
  old local state can persist and filter or select a new row set unexpectedly.
- The effect write produces at least one stale render before the synced local
  state lands.

Rationale:

This is a correctness risk, not just a style concern. It is exactly the kind of
derived-state ambiguity the cheat sheet warns about: every render is a snapshot,
and prop-to-state sync needs an explicit owner and reset rule.

Implemented direction:

- The table now computes controlled/uncontrolled source-of-truth flags during
  render and no longer uses prop-mirroring effects.
- Controlled-value handlers no longer write hidden local mirrors.
- Callback-only controls remain local and emit notifications.

### 4. Route-Level Selection Could Outlive Its Source Rows

Evidence:

- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:85`
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:90`
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:132`

Previous behavior:

`CommitmentsWorkspace` initialized `selectedRowIds` from `table.state` once,
then passed those IDs back into the table as controlled state. No sibling
consumed selected rows.

Why this matters:

Selection is table-local unless another component needs it. Lifting it widens
the re-render boundary and creates stale-snapshot risk. If data refreshes while
the client component persists, selected IDs from an older row set can remain
active.

Rationale:

The cheat sheet's state hierarchy starts with local state and lifts only when
siblings need shared ownership. This route currently owns selection without a
present sibling need.

Implemented direction:

- `DealCommitmentsTable` now owns selection locally until route-level batch
  actions need it.
- Keep row/detail open state as the single `rowState` contract and address
  remaining ownership cleanup through the controlled/uncontrolled table-state
  model.

### 5. Table Model Memoization Is Defeated By Unstable Dependencies

Evidence:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:124`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:147`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.model.ts:110`

Current behavior:

`controls` is rebuilt as a fresh object on every render. `model` is wrapped in
`useMemo`, but the dependency list includes that fresh `controls` object. The
model function builds maps, filters, sorts, paginates, groups rows, and applies
selection/open state.

Why this matters:

`useMemo` only helps when dependencies are stable. Here it gives the appearance
of optimization while still recomputing on parent renders. It also couples
selection/drawer changes with full row filtering and sorting.

Rationale:

This is the cheat sheet's memoization cascade problem in miniature. A structural
split would do more than adding more memo wrappers.

Recommended direction:

- Split the model into stages:
  - row source filtering/sorting/pagination,
  - selection/open visual state,
  - export/header derived IDs.
- Memoize only the expensive row-source stage on stable primitive dependencies.
- Alternatively remove the ineffective `useMemo` until profiling shows the
  computation matters.

### 6. The Commitments Table API Is Configuration-Heavy

Evidence:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts:159`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts:199`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:263`

Current behavior:

`DealCommitmentsTableProps` owns title, subtitle, footer, toolbar variants,
state, six control callbacks, export callbacks, and a large nested labels
contract. The component internally fixes toolbar layout, columns, row action,
table body, empty states, and footer.

Why this matters:

The cheat sheet warns that prop explosion is a configuration approach.
Configuration is not automatically wrong, but this component is large enough
that product variation will likely require more props rather than composition.
Future needs like row virtualization, route-owned batch actions, custom footer
metrics, alternate empty states, or different readiness columns will pressure
the same single API.

Rationale:

This is an architectural maintainability risk. The current table works, and
tests are strong, but the API shape makes extension expensive.

Recommended direction:

- Keep the current default table as a convenience wrapper.
- Extract composable subparts behind it: root, toolbar, search, filters, grid,
  column, row action, pagination, footer, and empty state.
- Let the app assemble workflow-specific composition while kit owns stable
  behavior and styling primitives.

### 7. The Full-Row Open Affordance Is Mouse-Only

Evidence:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table-row.tsx:60`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table-row-cells.tsx:271`

Current behavior:

The whole table row has `onClick={() => onRowOpen(row)}` and a pointer cursor.
The trailing chevron button is keyboard reachable and covered by tests, but the
row-level affordance itself has no keyboard or semantic contract.

Why this matters:

A pointer cursor on the full row tells mouse users the row is actionable. A
keyboard or assistive-tech user discovers only the trailing button. This is not
a catastrophic failure because the button exists, but it is an inconsistent UI
description.

Rationale:

The cheat sheet's composition model says components return descriptions of UI.
If the full row is part of the interaction, the semantic structure should
describe that interaction. If the trailing button is the true interaction, the
row should not pretend to be a separate actionable target.

Recommended direction:

- Prefer making the row visually hoverable but not independently clickable, and
  rely on the explicit button.
- Or make the primary cell contain a real button/link that owns the row-opening
  affordance.
- Avoid adding `role="button"` to `<tr>` unless the full keyboard and table
  semantics tradeoff is intentionally accepted.

### 8. Investor Identity Cells Should Be Row Headers

Evidence:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table-row-cells.tsx:86`
- `packages/ui/src/components/table.tsx:71`

Current behavior:

The investor identity cell renders `TableCell`, which is a `<td>`.

Why this matters:

In a data table, the investor name is the row identity. Using a row header gives
screen-reader table navigation better context for amount, readiness, status,
and action cells.

Rationale:

This is a semantic structure issue. It is not about visual styling; it is about
making the row's identity explicit in the returned UI description.

Recommended direction:

- Add a `TableRowHeader` primitive that renders `<th scope="row">`.
- Use it for the investor identity cell while preserving current styling.

### 9. Toolbar Semantics Overpromise Keyboard Behavior

Evidence:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table-toolbar.tsx:62`

Current behavior:

A plain `<div>` is assigned `role="toolbar"` around a search input and several
buttons. The controls still use normal tab order; no toolbar arrow-key behavior
is implemented.

Why this matters:

ARIA roles are contracts. If the role is present, assistive tech may announce a
toolbar interaction model that the implementation does not provide.

Rationale:

The cheat sheet principle here is semantic accuracy: structural descriptions
should match behavior.

Recommended direction:

- Remove `role="toolbar"` if normal form/control tabbing is intended.
- Or implement a real toolbar pattern with roving focus where appropriate.

## P3 Findings And Tooling Gaps

### 10. Nested Table Scroll Containers Accumulate Structure

Evidence:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:275`
- `packages/ui/src/components/table.tsx:8`

Current behavior:

`DealCommitmentsTable` wraps `Table` in an overflow container, and `Table`
itself already wraps the table in an overflow container.

Why this matters:

Nested horizontal scrollers can create confusing focus, scroll, and
scroll-into-view behavior. The current tests assert the outer container, so
this may be intentional for layout control. It should still be made explicit.

Recommended direction:

- Let `Table` accept a wrapper class/slot if the product table needs the outer
  scroller.
- Or add an unwrapped table primitive for cases where the caller owns overflow.

### 11. Server/Client Boundary Enforcement Is Partial

Evidence:

- `apps/web/vitest.config.ts:11`
- `apps/web/package.json:35`
- `turbo.json:19`

Current behavior:

Vitest aliases `server-only` to a test stub. Unit tests are plain `vitest run`.
The root test pipeline does not require `next build`.

Why this matters:

A client file can drift into importing server-only modules and still pass
lint/typecheck/unit tests unless a Next build or e2e run catches it.

Recommended direction:

- Add an app boundary contract script that scans `'use client'` files for
  `@/server`, `server-only`, Node-only APIs, and server modules missing
  `import 'server-only'`.
- Wire it into `pnpm lint` or `pnpm test`.
- Require `pnpm --filter @repo/web build` in CI.

### 12. StrictMode-Style Effect Checks Are Not Enforced In Component Tests

Evidence:

- `packages/test-config/src/index.ts:26`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.test.tsx:39`
- `apps/web/next.config.ts:4`

Current behavior:

Shared React Vitest config uses jsdom and setup files but does not wrap renders
in `React.StrictMode`. Tests render components directly. No explicit
`reactStrictMode` setting was found in Next config.

Why this matters:

The cheat sheet calls out StrictMode double-invocation as a way to expose
non-idempotent effects. Without a shared StrictMode render helper, effect
cleanup and resync bugs are easier to miss.

Recommended direction:

- Add shared test render helpers that wrap in `StrictMode`.
- Fail tests on unexpected React warnings where practical.
- Set `reactStrictMode: true` explicitly in Next config if supported by the
  current Next version and repo policy.

### 13. Storybook Does Not Enforce Interaction Or Accessibility

Evidence:

- `apps/storybook/.storybook/main.ts:4`
- `apps/storybook/package.json:26`

Current behavior:

Storybook is configured for docs/build/typecheck, but there are no interaction
test `play` functions or Storybook a11y test runner in the current setup.

Why this matters:

Stories can visually render while keyboard, focus, menu, sheet, tooltip, and
a11y behavior regresses. Component unit tests cover many of these cases, but
Storybook is not currently a CI-quality guard.

Recommended direction:

- Add Storybook interaction tests for the most important states.
- Add a11y checks for story states where browser-computed styles matter.
- Keep unit tests as the primary low-level contract; use Storybook for
  integration-like component states.

### 14. Color Contrast Is Not Enforced In Component A11y Tests

Evidence:

- `packages/ui/src/test/axe.ts:8`
- `packages/kit/src/test/axe.ts:8`
- `packages/design-tokens/package.json:21`

Current behavior:

The axe helpers disable `color-contrast`. The design-token package has a
separate `check` script, but root `pnpm test` does not obviously make contrast
validation a central gate for component states.

Why this matters:

JSDOM cannot reliably evaluate contrast the way a browser can. Disabling the
axe rule is understandable, but it leaves component-level contrast regressions
to visual review unless another gate covers them.

Recommended direction:

- Keep token contrast validation wired into the normal quality gate.
- Add browser-level contrast/a11y checks through Playwright or Storybook for
  important rendered states.

### 15. Performance Budgets Are Mostly Manual

Evidence:

- `apps/web/scripts/report-route-bundles.mjs:12`
- `apps/web/observability/telemetry.test.ts:14`

Current behavior:

`bundle:report` reports route bundles, but there are no thresholds. Web Vitals
tests validate event shape, not budgets. No render-count or profiler-style
tests were found for high-volume components.

Why this matters:

The current RSC/client-boundary findings can regress silently. Without budgets,
client island growth and unnecessary rerenders become review discipline rather
than enforced contracts.

Recommended direction:

- Add route bundle thresholds for app routes.
- Add a render-count or profiler smoke test for `DealCommitmentsTable` once
  table state ownership is clarified.
- Track RSC payload/client JS size for the commitments route specifically.

### 16. Hook Rule Configuration Is Implicit

Evidence:

- `biome.json:58`

Current behavior:

Biome recommended rules are enabled, and Biome has React hook rules for
`useExhaustiveDependencies` and `useHookAtTopLevel`. No explicit custom hook
options are configured.

Why this matters:

This is fine today because there are no custom dependency-array hooks. If such
hooks are added later, they may not be checked by default.

Recommended direction:

- Keep as-is until custom hooks with dependency arrays exist.
- When they do, configure hook rule options explicitly and add tests for the
  custom synchronization behavior.

### 17. Storybook Story Hook Ownership Is Implicit

Evidence:

- `packages/ui/src/components/dropdown-menu.stories.tsx:26`

Current behavior:

The dropdown story calls `useState` inside an anonymous `render` function.

Why this matters:

Storybook usually treats this as a component render, but hook ownership is less
obvious than a named component. It is story-only and not a production bug.

Recommended direction:

- Extract the story body into a named `DefaultDropdownMenuStory` component.

### 18. Next TypeScript Config Allows JavaScript

Evidence:

- `packages/typescript-config/next.json:5`

Current behavior:

The shared Next config has `allowJs: true`.

Why this matters:

Strict TypeScript is one of the repo's strongest safeguards. Allowing future JS
source files creates an escape hatch.

Recommended direction:

- Disable `allowJs` if not needed.
- Or add a source rule that forbids JS in app/package source while still
  allowing config scripts where intended.

## Areas Checked With No Issue

- No production conditional hook calls found in `apps/web`, `packages/kit`, or
  `packages/ui`.
- `WebVitalsReporter` includes `pathname` in its `useCallback` dependencies.
- `DealOperationalRail` includes `data.deal.slug` and `router` in its
  `useCallback` dependencies.
- No production `useRef` escape-hatch misuse found.
- `ChartContext` is narrow and chart-local; no broad frequently changing
  context state found.
- No `key={index}` usage found in rendered JSX maps; rendered lists use stable
  IDs or stable kinds.
- Client components do not value-import `server-only` modules in the inspected
  code.
- Route segments have root and `[dealId]` loading/error boundaries.
- No explicit Suspense misuse found; the concern is overly broad client
  boundaries that reduce opportunities for finer streaming.
- `DealAppShell` uses `children`, `header`, and `rail` as React nodes, which is
  aligned with composition.
- `Button asChild` preserves link semantics, and disabled `asChild` links are
  made inert in tests.
- Radix-backed primitives for checkbox, dropdown menu, sheet, tooltip,
  separator, and progress preserve expected roles and keyboard behavior in
  covered cases.
- No `<img>`, `next/image`, `backgroundImage`, or CSS `url(...)` usage was found
  in `packages/ui/src` or `packages/kit/src`.
- Design-system contract scans found no current `React.forwardRef`, `React.FC`,
  `displayName`, `data-testid`, `dangerouslySetInnerHTML`, raw color literals,
  `dark:`, or `space-x`/`space-y` matches in the requested source scope.

## Safeguards Already Present

The repo has a strong baseline:

- Root scripts cover lint, typecheck, tests, coverage, Storybook build, and e2e.
- Biome enforces broad correctness, security, and a11y rules, including
  dangerous HTML, ARIA validity, button types, labels, click/key pairing, and
  alt text.
- TypeScript strictness is strong: `strict`, `noImplicitAny`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, isolated modules,
  and verbatim module syntax.
- UI and kit packages use jsdom, Testing Library, `user-event`, and axe-based
  tests.
- Component tests cover keyboard row opening, filters, export, pagination,
  Sheet escape behavior, menu actions, tooltip focus, and many axe states.
- Playwright covers route flows, mobile overflow, keyboard row opening, and
  not-found behavior.
- Kit/UI contract scripts block several bad patterns: `data-testid`,
  `dangerouslySetInnerHTML`, `forwardRef`, app/server imports in kit, raw
  colors, and hardcoded Tailwind color utility drift.
- Server-only intent is already marked in several app/server modules.

## Recommended Follow-Up Sequence

1. Add boundary enforcement before refactoring.

   Start with a script that catches client imports of server modules and missing
   `server-only` markers. This prevents new boundary drift while larger RSC work
   is in progress.

2. Clarify `DealCommitmentsTable` state ownership.

   Remove prop-to-state mirroring effects, introduce explicit `default*` or
   controlled props, and decide whether route-level selection is needed now. This
   reduces correctness risk before performance tuning.

3. Narrow the commitments client payload.

   Stop eagerly sending every inspector view model if the route is expected to
   scale. Either fetch/load details per selected row or move detail rendering
   behind a server boundary.

4. Split read-only kit ready states from interactive leaves.

   Overview and document evidence are good candidates for server-renderable
   ready content. Keep retry/action buttons as client leaves where needed.

5. Fix table semantics.

   Add a row-header primitive, remove or formalize the full-row click affordance,
   and remove the toolbar role unless real toolbar keyboard behavior is added.

6. Add performance budgets after boundaries are intentional.

   Bundle thresholds and render-count tests are more useful once the intended
   client/server split and table state model are clear.

7. Improve secondary tooling.

   Add StrictMode-oriented render helpers, Storybook interaction/a11y checks,
   browser-level contrast checks, and a no-JS-source guard if the repo wants to
   preserve strict TypeScript as a hard rule.

## Non-Recommendations

Do not introduce Zustand, Redux, XState, or another external store to solve the
current findings. The audit found no current state problem that needs state
outside the React tree. The main issues are ownership and boundary design.

Do not add more `useMemo`/`useCallback` as the first response to table
performance. The current table issue is structural: the model combines
row-source derivation with selection/open visual state and depends on fresh
objects.

Do not remove all `'use client'` directives blindly. Some current kit components
contain interactive error/retry/action paths, Radix primitives, and route-level
navigation behavior. The right move is to split server-renderable content from
interactive leaves.
