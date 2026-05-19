# Hooks Synchronization Focused Remediation

Status: Remediation record for the focused implementation pass
Created: 2026-05-19
Updated: 2026-05-19
Scope: React hooks only, across `apps/web`, `packages/kit`, `apps/storybook`, and the audited Storybook footnote in `packages/ui`

## Purpose

This document captures the focused remediation path from the 2026-05-19 hooks
audit. It is intentionally narrow. The audit principle was:

React renders are snapshots. Hook callbacks, effects, and memoized values close
over the render that created them. Dependency arrays are correctness contracts,
not performance hints. Hook call order must be stable because React associates
hook state by position.

The goal was not to refactor the app broadly. The goal was to remove the places
where current code could drift away from the current render snapshot or where
ownership of hook state was ambiguous.

## Current Snapshot

The refreshed hook map found 21 real hook-bearing source files. The material
change since the prior audit conversation is new observability hook surface:

- `apps/web/observability/web-vitals-reporter.tsx`
  - `usePathname`
  - `useCallback`
  - `useReportWebVitals`

Other hook-heavy areas remain:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx`
  - local ready-state controls
  - render-time controlled/uncontrolled source-of-truth selection
  - model derivation through `useMemo`
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx`
  - table-owned row/detail state exposed through `rowState`
  - route-composed inspector Sheet content
- shared kit/UI components using `useId` and chart-local `useContext`

The kit/UI `useId` and `useContext` surfaces are currently clean: hooks are
called at stable top-level positions, no dependency arrays are involved, and no
provider/consumer synchronization issue was found.

## Agent Guardrail

Root `AGENT.md` now includes a short hooks rule based on
`/Users/fabiencampana/Documents/roundtable/07_cheat_sheets/react.md`:

```md
## React Hooks Synchronization Guardrail

Treat every render as a snapshot. Call hooks only at stable top-level positions,
keep dependency arrays truthful, and model effects as synchronization with
external systems rather than lifecycle events. Use functional state updates when
the next value depends on queued state, and use refs only to bridge stable
callbacks to latest values without resubscribing external observers. Controlled
and uncontrolled hook state must have one clear owner.
```

This makes the audit principle persistent for future repo agents.

## Findings To Address

### 1. Web Vitals Reporter Can Register Stale Route Callbacks

Severity: P2

Files:

- `apps/web/observability/web-vitals-reporter.tsx`
- local dependency behavior observed in Next 16's `next/dist/client/web-vitals.js`

Current behavior:

`WebVitalsReporter` reads the current pathname and creates a callback that
closes over that pathname:

```tsx
const pathname = usePathname()

const reportMetric = useCallback(
  (metric: WebVitalsMetricInput) => {
    const event = mapWebVitalMetricToTelemetryEvent(metric, pathname ?? '/')

    if (event) {
      emitTelemetryEvent(event)
    }
  },
  [pathname],
)

useReportWebVitals(reportMetric)
```

Why this violates the hooks model:

The callback dependency array is locally correct: `pathname` is read by the
callback, so `pathname` is listed. The deeper synchronization target, though, is
not the React callback by itself. The target is the browser Web Vitals observer
registration created by `useReportWebVitals`.

In local Next 16, `useReportWebVitals` runs an effect with
`[reportWebVitalsFn]` and registers the callback with `onCLS`, `onFID`, `onLCP`,
`onINP`, `onFCP`, and `onTTFB`. That implementation does not return a cleanup
function. If `reportMetric` changes on client navigation, a new callback can be
registered while old callbacks remain registered with old path snapshots.

The failure mode is route attribution drift:

- metrics emitted after a navigation can be reported for a previous route,
- the same metric can be emitted more than once if multiple callbacks remain
  registered,
- the code appears dependency-correct from React's local view while still being
  incorrect for the external observer being synchronized.

Focused fix:

Make the reporter function stable and store the latest route in a ref.

```tsx
const pathname = usePathname()
const pathnameRef = useRef('/')

pathnameRef.current = pathname ?? '/'

const reportMetric = useCallback((metric: WebVitalsMetricInput) => {
  const event = mapWebVitalMetricToTelemetryEvent(metric, pathnameRef.current)

  if (event) {
    emitTelemetryEvent(event)
  }
}, [])

useReportWebVitals(reportMetric)
```

Rationale for this shape:

- `useReportWebVitals` sees one callback identity, so it registers once.
- The callback does not close over a stale pathname.
- The ref gives the external observer access to the latest route snapshot without
  asking Next's hook to resubscribe.
- The stable module functions do not need to be dependencies because their
  identities are not reactive component values.

Focused tests:

- Add a component test for `WebVitalsReporter`.
- Mock `next/navigation` so `usePathname` can change across rerenders.
- Mock `next/web-vitals` so the test captures the function passed to
  `useReportWebVitals`.
- Assert that only one callback is registered across rerender.
- Invoke the captured callback after changing the mocked pathname and assert the
  emitted telemetry uses the latest route.

### 2. Table Row State Could Not Be Intentionally Cleared With `undefined`

Severity: P2

Files:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.model.ts`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx`

Current behavior:

The table now exposes active/drawer state as a single `rowState` discriminated
union, which is the right public shape:

```ts
type CommitmentTableRowState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'active'; readonly rowId: string; readonly drawerOpen: false }
  | { readonly kind: 'active'; readonly rowId: string; readonly drawerOpen: true }
```

Before this pass, however, `getReadyControls` resolved controlled row state
through the same nullish fallback helper used by other ready controls:

```ts
rowState: getControlValue(controlled.rowState, state.rowState, local.rowState)
```

Why this violated the hooks model:

The table can be either locally owned or controlled by a parent. A row can be
opened by a table callback, which writes local row state. A parent can also pass
`state.rowState` and `onRowStateChange` to own the row-open state.

The problem was that `undefined` had two meanings:

1. The parent did not provide row state, so the table should use local state.
2. The parent intentionally cleared row state, so the table should become idle.

The generic nullish fallback could not distinguish those cases. With
`onRowStateChange` present, a parent rerender with `rowState: undefined` still
fell back to whatever local row state existed from an earlier render. React's
render snapshot was doing exactly what the code asked, but the state ownership
contract was ambiguous.

Implemented fix:

Keep the generic fallback for controls whose public contract still treats
`undefined` as "uncontrolled", but give row state a dedicated controlled
resolver:

```ts
const idleRowState = { kind: 'idle' } as const satisfies CommitmentTableRowState

const getRowStateControlValue = (
  controlled: boolean,
  controlledValue: CommitmentTableRowState | undefined,
  localValue: CommitmentTableRowState,
) => (controlled ? (controlledValue ?? idleRowState) : localValue)
```

`getReadyControls` now calls that resolver for `rowState`.

The table content also gained the missing prop-to-local synchronization effect
for uncontrolled seeded `rowState`, matching the existing search, pagination,
filter, and selection effects:

```ts
useEffect(() => {
  if (onRowStateChange === undefined && readyRowState !== undefined) {
    setLocalRowState(readyRowState)
  }
}, [onRowStateChange, readyRowState])
```

Rationale for this shape:

- `onRowStateChange` remains the ownership signal for controlled row state.
- Controlled callers can clear row state by omitting the active value, which now
  resolves to idle instead of reviving local state.
- Uncontrolled callers still get editable local row state seeded from incoming
  ready state.
- The fix is scoped to row-open ownership instead of changing the semantics of
  all nullable ready controls.

Focused tests added:

- `deal-commitments-table.test.tsx` now rerenders a controlled table from active
  `rowState` to `rowState: undefined` and asserts the row becomes inactive and
  drawer-closed.
- The same test clicks the row after the controlled clear and confirms the
  callback fires while the UI remains controlled until the parent provides a new
  row state.

### 3. Workspace Selection Was Seeded From The First Render And Could Drift

Status: Remediated

File:

- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx`

Previous behavior:

The commitments workspace initializes selected rows from the incoming table
state:

```tsx
const [selectedRowIds, setSelectedRowIds] = useState<readonly string[]>(() =>
  table.state.kind === 'ready' ? (table.state.selectedRowIds ?? []) : [],
)
```

It then always injected `selectedRowIds` back into controlled table state.

Why this violates the hooks model:

The initializer only runs on the first render. If the server-provided
`table.state` later changes through navigation, revalidation, or a ready-state
transition, the local `selectedRowIds` value remains the first render's snapshot.

That is safe only if the workspace is the permanent source of truth for
selection. The code does not make that ownership explicit; it seeds from props,
then ignores later prop changes.

Implemented fix:

Selection is now table-local by default. `CommitmentsWorkspace` passes
`table.state` directly into `DealCommitmentsTableContent` and no longer owns
`selectedRowIds`, no longer syncs it in an effect, and no longer injects it back
into table state. The temporary `commitments-workspace-selection` helper and its
unit test were removed.

Rationale:

State should have one owner. No current route sibling consumes selected rows, so
the nearest owner is the table, not the route. If a route-level batch action bar
or another sibling later needs selected rows, lift selection back to the nearest
shared owner with an explicit controlled contract.

Focused tests added:

- `deal-commitments-table.test.tsx` verifies that controlled selection callbacks
  do not leave hidden local selection behind.
- It verifies that uncontrolled search does not resync from parent rerenders
  after local edits.
- Existing table interaction tests cover local selection, controlled search,
  controlled row-state clearing, and pagination behavior.

### 4. Package-Level Turbo Lint Does Not Cover Web Or Storybook Hooks

Severity: P3

Files:

- `apps/web/package.json`
- `apps/storybook/package.json`

Current behavior:

Root `pnpm lint` is strong. It runs Biome over `apps` and `packages`, and Biome
2.4.14 includes the relevant React hook rules:

- `lint/correctness/useExhaustiveDependencies`
- `lint/correctness/useHookAtTopLevel`

However, `@repo/web` and `@repo/storybook` do not have package-level `lint`
scripts. A filtered Turbo lint command for those packages can succeed while
running zero tasks.

Why this matters for hooks:

The main hook safety net works only when the root lint command is run. Developers
using package-filtered Turbo validation can miss hook-order and dependency
diagnostics for the app and Storybook surfaces.

Focused fix:

Add scoped package scripts.

Recommended direction:

```json
{
  "scripts": {
    "lint": "biome check --config-path ../../biome.json ."
  }
}
```

Use the repo's actual package paths and existing script conventions when
applying this. The important requirement is that `turbo run lint --filter
@repo/web --filter @repo/storybook` executes real lint tasks.

Focused verification:

- `pnpm lint`
- `pnpm turbo run lint --filter @repo/web --filter @repo/storybook`

## Optional Cleanup

### Storybook `render` Callback Hook

File:

- `packages/ui/src/components/dropdown-menu.stories.tsx`

The story calls `useState` directly inside the CSF `render` callback. The audit
confirmed that Biome accepts this pattern in this repo, and Storybook treats the
render function as a component boundary. This is not an active production issue.

It is still reasonable to extract a named story body component when touching the
file:

```tsx
const DropdownMenuStory = () => {
  const [checked, setChecked] = useState(true)

  return <DropdownMenu>{/* ... */}</DropdownMenu>
}

export const Default = {
  render: () => <DropdownMenuStory />,
}
```

Rationale:

The named component makes the hook boundary obvious to humans and keeps the
story resilient if decorators or story wrappers change later. This should not
block the focused production fixes above.

## Implemented Changes

1. Fixed `WebVitalsReporter`.
   - The callback passed to `useReportWebVitals` is stable.
   - The latest route is stored in a ref so the external Web Vitals observer does
     not need to resubscribe on navigation.

2. Added a Web Vitals reporter component test.
   - The test mocks `next/navigation` and `next/web-vitals`.
   - It asserts callback identity remains stable across rerender.
   - It invokes the captured callback after a mocked route change and verifies
     latest-route telemetry attribution.

3. Fixed `DealCommitmentsTable` controlled row-state clear semantics.
   - Controlled `rowState: undefined` now resolves to idle.
   - Uncontrolled row state can still be seeded and then edited locally.

4. Added table rerender coverage.
   - The new test covers the exact controlled-clear regression and confirms user
     interaction still fires `onRowStateChange` without mutating controlled UI.

5. Fixed `CommitmentsWorkspace` selected-row drift.
   - Route-owned selection now synchronizes from latest incoming ready state.
   - A helper test documents the ownership rules without requiring a broad route
     integration harness.

6. Added package-level lint scripts.
   - `@repo/web` and `@repo/storybook` now run real Biome checks under filtered
     Turbo lint.
   - The scripts run from the repo root so Biome can resolve the shared config
     and git ignore file.

7. Left the Storybook `render` callback hook as an optional cleanup.
   - The audit did not find a production defect there, and the focused pass did
     not need to touch the story.

## Verification Run

Commands run for the focused pass:

```text
pnpm lint
pnpm --filter @repo/web test
pnpm --filter @repo/kit test
pnpm --filter @repo/web typecheck
pnpm --filter @repo/kit typecheck
pnpm turbo run lint --filter @repo/web --filter @repo/storybook
```

Results:

- `pnpm lint`: passed.
- `pnpm --filter @repo/web test`: passed, 9 files and 47 tests.
- `pnpm --filter @repo/kit test`: passed, 6 files and 131 tests.
- `pnpm --filter @repo/web typecheck`: passed.
- `pnpm --filter @repo/kit typecheck`: passed.
- `pnpm turbo run lint --filter @repo/web --filter @repo/storybook`: passed, 2
  package lint tasks.

After adding the root hooks guardrail to `AGENT.md`, the following commands were
rerun and passed:

- `pnpm lint`
- `pnpm --filter @repo/web test`: passed, 9 files and 47 tests.
- `pnpm --filter @repo/kit test`: passed, 6 files and 131 tests.
- `pnpm turbo run lint --filter @repo/web --filter @repo/storybook`

`git diff --check` was also attempted. It reported trailing whitespace in two
pre-existing dirty planning documents outside this remediation:

- `docs/60-planning/state-management-principle-audit.md`
- `docs/60-planning/zod-runtime-validation-audit.md`

The focused remediation files were then checked separately with `git diff
--check -- <focused files>`.

## Non-Goals

Do not use this pass to:

- rewrite the commitments table API,
- introduce Zustand, Redux, XState, or a custom external store,
- convert broad route components between server and client boundaries,
- change telemetry transport strategy,
- redesign Storybook conventions,
- refactor unrelated state or composition findings.

Those may be valid future work, but they are not required to satisfy this hooks
synchronization remediation.

## Success Criteria

The pass is complete when:

- Web Vitals route attribution uses the latest pathname without resubscribing
  callback identities on navigation.
- A controlled table consumer can clear active/drawer row state with an explicit
  `undefined` value.
- The commitments workspace no longer keeps a first-render selected-row snapshot
  when upstream selected ids change.
- Filtered Turbo lint runs real lint tasks for `@repo/web` and `@repo/storybook`.
- Focused tests cover the changed hook synchronization behavior.
- Root lint and relevant package tests pass.
