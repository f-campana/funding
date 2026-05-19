# State Management Principle Audit

Snapshot refreshed: 2026-05-19
Previous snapshot: 2026-05-18

Freshness check: re-validated against the current split commitment table implementation on 2026-05-19. The same remediation pass moved route-owned table selection back into `DealCommitmentsTableContent`, removed the prop-to-local synchronization effects, gated controlled handlers so controlled values do not write hidden local mirrors, memoized `ChartContext` provider value, derived kit summaries from canonical lists, restored route-owned composition for the overview/documents ready states while moving derived helper imports to model-only kit subpaths, centralized activity metadata, added a pure commitment operational snapshot validator, added exhaustive lifecycle transition tests, and applied the state-ownership guardrail to `AGENT.md`.

## Scope

This audit covers the current repository against one rule only:

1. Prefer local component state with `useState` as the default.
2. Lift state only when siblings need to share it, and only to the nearest common owner.
3. Use React Context as dependency injection for stable or infrequently changing values, not as a general state-management layer.
4. Use an external store such as Zustand or Redux only when state must live outside the React tree, or when a measured Context broadcast/re-render problem justifies selector-based subscriptions.
5. Use XState only for real domain workflows with explicit events, guarded transitions, async effects, replay/reconciliation, or parallel states. Do not use it for ordinary component state or simple form progression.

The 2026-05-19 refresh split the audit across:

- `apps/web` state ownership, route state, server/client boundaries, telemetry, and adapters
- `packages/kit` interactive components, controlled/uncontrolled APIs, derived state, and workflow panels
- `packages/ui` Context/provider usage, Radix wrappers, stories, and primitive state ownership
- repo-wide external store dependencies, package metadata, lockfile transitives, global mutable state, and storage APIs
- domain/workflow state modeling in `packages/domain`, server DTO/readiness code, and app workflow adapters
- docs/specs/planning guidance drift

This snapshot now includes the 2026-05-19 remediation pass, not just the original audit findings.

## Executive Summary

The implementation remains mostly aligned with the principle. There is still no live app/package implementation of Zustand, Redux, Jotai, Valtio, MobX, XState, or direct `useSyncExternalStore`. React Context usage is narrow and mostly dependency injection:

- `NextIntlClientProvider` for locale/messages
- `TooltipProvider` for Radix tooltip behavior
- chart-local `ChartContext` for chart metadata

The remediation pass separates remaining risks from issues that have been cleaned up:

- `CommitmentsWorkspace` no longer lifts table selection; selection is table-local again.
- `CommitmentsWorkspace` no longer represents inspector open state twice; that previous finding remains resolved.
- `DealCommitmentsTableContent` no longer mirrors ready-state props into local state with `useEffect`.
- Controlled table handlers now avoid writing hidden local mirrors when the caller provides a controlled value.
- `DealCommitmentsTableContext` is still a live compound-component state bus. This is local to the table, but it is the main remaining Context/state-management tradeoff to revisit if render cost grows.
- Kit document/operational summaries now derive from canonical groups/readiness counts instead of being separate ready-state fields; app routes compose the granular kit parts and import the derivation helpers from model-only kit subpaths.
- `ChartContext` now throws a targeted provider error instead of silently falling back; its fresh provider object issue was also fixed with `useMemo`.
- Domain/server readiness still has duplicate state authority and workflow actions are not yet derived from transition maps. Commitment lifecycle drift is now guarded by a pure domain validator at the server DTO boundary.
- Activity event metadata now has one base map plus an explicit commitment-inspector tone override.
- Deal and commitment lifecycle tests now include exhaustive transition-pair coverage.
- Documentation drift around Zustand/XState defaults and route-owned commitment state has been updated in the main current docs touched by this pass.

No current implementation area justifies Zustand. XState is also not justified yet. The remaining next steps are smaller: measure or split the table compound context only if it becomes expensive, consolidate operational readiness authority in domain naming/ownership, and derive future workflow actions from pure transition reducers before considering a runtime machine.

## Current External Store Snapshot

### Implementation

No live app/package imports were found for:

- Zustand
- Redux / React Redux / Redux Toolkit
- Jotai
- Valtio
- MobX
- XState
- direct `useSyncExternalStore`

Evidence:

- `apps/web/package.json` has no Zustand/Redux/XState/TanStack Query dependency.
- `packages/kit/package.json` depends on `@repo/domain`, `@repo/ui`, `lucide-react`, and `ts-pattern`, not an external store. Its added `./deal-documents-evidence/model` and `./deal-operational-overview/model` exports are pure derivation subpaths, not state stores.
- repo-wide import scans found no direct implementation imports for the store libraries above.

### TanStack Query

`@tanstack/react-query` exists only in `@repo/core` as an adapter surface:

- dev dependency and optional peer at `packages/core/package.json:23`, `packages/core/package.json:31`, and `packages/core/package.json:36`
- type-only adapter import at `packages/core/src/adapters/tanstack-query.ts:1`
- not re-exported from `packages/core/src/index.ts`

This is currently justified as an optional adapter, not active app state management.

### Transitive Redux

Redux-related packages are lockfile transitives from Recharts, not repo implementation choices:

- `@repo/ui` depends on `recharts` at `packages/ui/package.json:36`
- `pnpm-lock.yaml:5367` shows `recharts` pulling `@reduxjs/toolkit`, `react-redux`, and `use-sync-external-store`

This does not count as adopting Redux for application state.

### Browser Storage And Global State

No top-level mutable `let`/`var` store, `sessionStorage`, `BroadcastChannel`, or direct event emitter usage was found.

The only implementation `localStorage` use is an opt-in dev telemetry console flag at `apps/web/observability/telemetry-transport.ts:52`. It does not drive React rendering and does not justify an external store.

Top-level `Set` instances in telemetry and validation code are lookup tables, not mutated stores.

## App Findings

### 1. Table Selection Was Lifted Without A Current Sibling Consumer

Status: Remediated

Files:

- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx`

Previous behavior:

- `CommitmentsWorkspace` owned `selectedRowIds`.
- It passed `onSelectedRowIdsChange` into `DealCommitmentsTable`.
- It injected the selected IDs back into the table state through `getControlledTableSelectionState`.
- No sibling of `DealCommitmentsTable` read selected rows.

Evidence:

- `CommitmentsWorkspace` now passes `table.state` directly to `DealCommitmentsTableRoot` at `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:139`.
- `DealCommitmentsTableContent` is rendered without `onSelectedRowIdsChange` at `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:140`.
- `DealCommitmentsTableContent` already has local selected-row state at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:56`.

Why this matters:

Selection is table-local interaction state unless another route-level surface needs it. Lifting it into the workspace creates a wider re-render boundary and makes the route responsible for a table concern.

Implemented direction:

- `DealCommitmentsTable` owns selection locally until a sibling actually consumes it.
- If a route-level batch action bar, inspector, export command, or keyboard command surface needs selected rows later, lift selection to `CommitmentsWorkspace`.
- Do not use Zustand or Context for this; the nearest common owner is enough.

### 2. Previous Inspector Open Duplication Is Resolved

Status: Resolved in the current snapshot

Files:

- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table-detail.tsx`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.model.ts`

Current behavior:

`CommitmentsWorkspace` no longer owns separate `activeRowId` and `drawerOpenRowId` states. The table models row/detail state as one `rowState` union, derives `activeRowId` and `drawerOpenRowId` for rendering, and exposes the current detail row through `DealCommitmentsTableDetail`.

Evidence:

- `CommitmentsWorkspace` currently has no local React state at `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:122`.
- `DealCommitmentsTableDetail` reads the drawer row from the table model at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table-detail.tsx:7`.
- The model derives `activeRowId` and `drawerOpenRowId` from `rowState` at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.model.ts:136`.

Why this matters:

The previous duplicate-state concern should not drive a workspace refactor anymore. The remaining row/detail ownership concern is now inside the table's controlled/uncontrolled state contract.

Recommended direction:

- Keep inspector row state table-local unless another sibling needs to own it.
- Do not introduce Zustand or Context for this path.
- Address the current `rowState` issue through the controllable-state cleanup in finding 4.

### 3. Full Inspector View Models Are Eagerly Sent Across The Client Boundary

Severity: Low

Files:

- `apps/web/app/deals/[dealId]/commitments/page.tsx`
- `apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts`
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx`

Current behavior:

The server page passes a full `propsByInvestorId` inspector map to the client workspace. The client only displays one row's inspector at a time.

Evidence:

- `mapDealCommitmentInspectorViewModel(data)` is passed to the client route at `apps/web/app/deals/[dealId]/commitments/page.tsx:21`.
- The adapter builds `propsByInvestorId` for every investor at `apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts:178`.
- The client indexes the map by the table detail render prop's `rowId` at `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:203`.

Why this matters:

This is not global state, but it broadens the client payload for a one-row-at-a-time drawer. It is acceptable for current fixtures, but may become expensive with large investor lists.

Recommended direction:

- Measure RSC/client payload before scaling this pattern.
- If it grows, route-load or fetch one inspector view model by investor id, or pass a narrower detail index.

### Clean App Patterns

- No live app usage of Zustand, Redux, XState, custom React state Context, reducers, or `useSyncExternalStore`.
- `NextIntlClientProvider` at `apps/web/app/layout.tsx:47` is appropriate root dependency injection.
- `DealAppShell` and `DealTabs` source active navigation state from Next route segment state at `deal-app-shell.tsx:32` and `deal-tabs.tsx:19`.
- Route data is server-only in `apps/web/app/deals/[dealId]/data.ts`.
- The new `WebVitalsReporter` uses `usePathname` and `useReportWebVitals` without becoming a store.
- The telemetry `localStorage` flag does not drive React rendering.

## Kit Findings

### 4. Uncontrolled Table Values Could Be Reset By Parent Re-renders

Status: Remediated

File:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx`

Previous behavior:

`DealCommitmentsTableContent` seeded local state from `state`, but also re-synced uncontrolled local state from later ready-state prop values in six effects.

Evidence:

- Local state is seeded from `state` at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:41`.
- Render-time controlled flags are computed at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:66`.
- The prop-to-local sync effects were removed; there is no `useEffect` import in `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx`.
- Regression coverage verifies uncontrolled search no longer re-syncs from parent rerenders in `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.test.tsx`.

Why this matters:

The issue is not the raw count of effects. The issue is that all six effects copy props into local state after render. When a parent-provided ready-state value changes, the table can first render with stale local state, then the effect patches the local mirror, then React renders again. Multiple prop changes can also pass through intermediate local combinations that never existed in the parent state. Array values such as `activeFilterIds` and `selectedRowIds` are identity-sensitive, so parent-created arrays can retrigger local resets even when their contents are effectively unchanged.

Implemented direction:

- Ready-state fields choose their source of truth during render.
- Callback-only fields remain local and emit notifications.
- Fields with a provided controlled value and callback do not resync through effects.
- Row state keeps `onRowStateChange` as the controlled clear signal so `rowState: undefined` means idle instead of reviving local drawer state.

### 5. Row Detail State Is Improved And No Longer Shares The Sync Effect Smell

Status: Remediated for prop synchronization

Files:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.model.ts`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx`

Current behavior:

The table no longer accepts separate public `activeRowId` and `drawerOpenRowId` state. It accepts a single public `rowState` union and an `onRowStateChange` callback. Internally, row state no longer has an uncontrolled prop-sync effect.

Evidence:

- The public row state union starts at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts:122`.
- `rowState` and `onRowStateChange` are paired at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts:147` and `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts:181`.
- The model derives `activeRowId` and `drawerOpenRowId` from `rowState` at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.model.ts:136`.
- `DealCommitmentsTableContent` treats `onRowStateChange` as the controlled row-state signal at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:70`.
- Row clicks update `rowState` and emit the separate telemetry-style `onRowOpen` event at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:168`.

Why this matters:

The prior split active/drawer ownership issue is resolved. `onRowOpen` remains a side-effect event, not a state owner; callers should not need it to keep visual state coherent.

Recommended direction:

- Keep the single `rowState/onRowStateChange` public contract.
- Keep the render-time controlled row-state semantics covered by the regression tests.
- Keep `onRowOpen` as telemetry/notification only, not a second state path.
- This does not justify XState; the table is local UI state.

### 6. Controlled Table Handlers Updated Hidden Local Mirrors

Status: Remediated for controlled values

File:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx`

Previous behavior:

The table detected controlled dimensions, but event handlers still updated local state before calling callbacks.

Evidence:

- Controlled dimensions are detected at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:66`.
- Local mirrors are initialized at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:41`.
- Handlers now gate local writes behind uncontrolled checks at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:107`, `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:119`, `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:128`, `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:137`, and `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:153`.

Why this matters:

The controlled value wins, so this is not currently a correctness bug. It still creates avoidable renders and weakens single ownership.

Implemented direction:

- In controlled-value mode, call only the callback.
- In uncontrolled or callback-only mode, update local state and notify the callback.
- Regression coverage verifies controlled selection does not leave a hidden local selection behind.

### 7. Derived Kit Summaries Could Drift From Canonical Lists

Status: Remediated

Files:

- `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.types.ts`
- `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.tsx`
- `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.model.ts`
- `apps/web/app/deals/[dealId]/documents/page.tsx`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.types.ts`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.tsx`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.model.ts`
- `apps/web/app/deals/[dealId]/overview/page.tsx`
- `packages/kit/package.json`

Previous behavior:

Some components accept precomputed summary data while also deriving related tone/count/state from raw lists.

Evidence:

- `DealDocumentsEvidenceReadyState` now carries `groups`, not a separate `summary`, at `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.types.ts`.
- Document headline and metrics are derived by `getDocumentsEvidenceSummary(groups)` in `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.model.ts`.
- The app documents route owns ready-state composition at `apps/web/app/deals/[dealId]/documents/page.tsx`: it composes `DealDocumentsEvidenceHeader`, `DealDocumentsEvidenceSummarySection`, `DealDocumentsEvidenceGroups`, `DealDocumentsEvidenceGroupSection`, and `DealDocumentsEvidenceDocument` directly, then imports `getDocumentsEvidenceSummary` from `@repo/kit/deal-documents-evidence/model`.
- `DealOperationalOverviewReadyState` now carries `readiness`, `capital`, `blockers`, and `activity`, not a separate `blockerSummary`, at `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.types.ts`.
- Blocker summary copy is derived by `getOperationalBlockerSummary(readiness)` in `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.model.ts`.
- The app overview route owns ready-state composition at `apps/web/app/deals/[dealId]/overview/page.tsx`: it composes `DealOperationalOverviewHeader`, `DealOperationalOverviewPrimaryGrid`, `DealOperationalOverviewReadiness`, `DealOperationalOverviewCapital`, `DealOperationalOverviewSecondaryGrid`, `DealOperationalOverviewBlockers`, and `DealOperationalOverviewActivity` directly, then imports `getOperationalBlockerSummary` from `@repo/kit/deal-operational-overview/model`.
- `packages/kit/package.json` exposes `./deal-documents-evidence/model` and `./deal-operational-overview/model` so server routes can use pure derivation helpers without importing them through mixed component entrypoints.

Why this matters:

Caller-provided summaries can contradict derived tone/counts. That is derived-state drift: more than one value claims authority for the same concept.

Implemented direction:

- Documents evidence uses groups as the canonical source for summary/tone/counts.
- Operational overview uses readiness blocker counts as the canonical source for the blocker summary text.
- App routes retain ownership of product section ordering and ready-state layout instead of delegating to pre-composed `ReadyContent` presets.
- Server routes import pure derivation helpers from model-only subpaths, not from mixed UI component barrels.
- Compound consumers can still pass explicit custom copy to subcomponents, but the ready-state contracts no longer contain duplicate summary fields.

### 8. Table Memoization Currently Does Not Buy Much

Severity: Low

Files:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table-body.tsx`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.model.ts`

Current behavior:

`controls` is rebuilt every render and used as a `useMemo` dependency, handlers are recreated each render, and selected-row checks use `includes` per visible row.

Evidence:

- `controls` is rebuilt at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:105`.
- It is used as a `useMemo` dependency at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:128`.
- Row/table handlers start at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx:135`.
- Row selection checks use `selectedRowIds.includes` at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table-body.tsx:102`.
- The model already builds a selected-id `Set` at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.model.ts:130`.

Why this matters:

Current fixture sizes are fine. Larger investor lists will recompute and re-render more than necessary on each keystroke or toggle.

Recommended direction:

- Memoize `controls` by scalar dependencies if the model remains expensive.
- Use `useCallback` for row/table handlers only if child memoization is introduced.
- Keep a selected-id `Set` in the model and reuse it.
- Consider `React.memo` for row components only after measuring list sizes/render cost.

### Clean Kit Patterns

- `DealCommitmentInspector`, `DealDocumentsEvidence`, `DealProgressPanel`, and `DealOperationalOverview` use discriminated `state.kind` unions.
- Retry/action handlers are type-gated rather than globally available.
- Explicit prop flow is preferable to Context for packaged kit panels unless sections become externally composable.
- XState belongs outside these kit display panels. A local reducer is enough for table interaction cleanup.

## UI/Context Findings

### Table Context Tradeoff: Compound API Uses A Live Local State Bus

Severity: Medium if table render cost grows

Files:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.context.tsx`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.content.tsx`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table-toolbar.tsx`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table-grid.tsx`

Current behavior:

The compound table API passes `controls`, `model`, `state`, and all mutation handlers through one local context provider.

Why this matters:

This is convenient for compound subcomponents, but it is still Context carrying changing state. Every table state change broadcasts to all compound consumers. Current fixture sizes are fine, and this does not justify Zustand, but it should be measured before adding virtualization, row memoization, or high-frequency interaction state.

Recommended direction:

- Keep this local to the table; do not lift it to app Context or an external store.
- If render cost grows, split read-heavy model/config from action callbacks or pass narrow props to memoized row sections.
- Avoid putting hover, drag, resize, or other high-frequency state into this provider.

### 9. `ChartContext` Silently Degraded Outside `ChartContainer`

Status: Remediated

File:

- `packages/ui/src/components/chart.tsx`

Previous behavior:

Chart consumers returned `{ config: {} }` when no provider existed.

Evidence:

- `requireChartContext` now throws a targeted provider error at `packages/ui/src/components/chart.tsx:52`.
- Tooltip and legend consumers read chart context at the top of render and require the provider only for non-empty render states in `packages/ui/src/components/chart.tsx`.
- Regression tests assert the targeted error in `packages/ui/src/components/chart.test.tsx`.

Why this matters:

If a tooltip or legend was accidentally used outside `ChartContainer`, it rendered raw keys/names instead of configured labels/icons/colors. The integration error was quiet and could be missed.

Implemented direction:

- `ChartContainer` is required for configured tooltip and legend content.
- Missing provider usage now fails with `Chart components must be rendered inside ChartContainer.`

### 10. `ChartContext.Provider` Broadcasted A Fresh Value On Each Render

Status: Remediated

File:

- `packages/ui/src/components/chart.tsx`

Previous behavior:

`ChartContainer` provided chart config through `value={{ config }}`.

Evidence:

- `ChartContainer` now memoizes the wrapper value at `packages/ui/src/components/chart.tsx:171`.
- `ChartContext.Provider` uses that memoized value at `packages/ui/src/components/chart.tsx:174`.

Why this matters:

Every `ChartContainer` render previously changed the provider value identity, so all chart context consumers saw a changed value even if the `config` prop itself was referentially unchanged. This risk grows if charts later add hover/selection state.

Implemented direction:

- Memoized the wrapper with `useMemo(() => ({ config }), [config])`.
- Keep high-frequency chart interaction state out of this context or split by update frequency.

### UI Clean Patterns

- `DropdownMenu` and `Sheet` delegate open state to Radix rather than mirroring it.
- `Checkbox` forwards Radix state props without maintaining duplicate local state.
- Storybook demo state, such as dropdown checkbox state, remains story-local.
- `TooltipProvider` is scoped Radix dependency injection.

The UI audit also noted that exported Radix portal wrappers do not control the default styled content wrappers. That is a composition/API issue, not a state-management finding, so it is not treated as a primary snapshot finding here.

## Domain And Workflow Findings

### 11. Closing Readiness Has Two Authoritative Definitions

Severity: Medium

Files:

- `packages/domain/src/deals/deal-readiness.ts`
- `apps/web/server/deals/operational-center-readiness.ts`

Current behavior:

Domain readiness defines `ClosingReadinessState` from blocker counts and `hasOperationalInputs`. Server operational readiness reuses that state concept but recomputes it from dimensions/source operations.

Evidence:

- Domain readiness state starts at `packages/domain/src/deals/deal-readiness.ts:9`.
- Domain readiness calculation uses blocker counts and operational-input presence at `packages/domain/src/deals/deal-readiness.ts:35` and `packages/domain/src/deals/deal-readiness.ts:57`.
- Server readiness recomputes readiness from dimensions/source operations at `apps/web/server/deals/operational-center-readiness.ts:81`.
- Info blockers become `attention` at `apps/web/server/deals/operational-center-readiness.ts:194`.

Why this matters:

Callers can treat `ClosingReadinessState` as one concept while domain and server can disagree. That is duplicated state authority.

Recommended direction:

- Move dimension/source readiness into domain as the canonical operational closing summary, or
- Rename the DTO state to distinguish operational readiness from blocker-only domain readiness.

### 12. Commitment Lifecycle Could Drift From Operational Axes

Status: Remediated for invalid snapshots

Files:

- `packages/domain/src/commitments/commitment-lifecycle.ts`
- `packages/domain/src/commitments/investor-operations.ts`
- `apps/web/server/deals/operational-center-readiness.ts`
- `apps/web/server/deals/operational-center-validation.ts`

Previous behavior:

`CommitmentLifecycleState` includes signature, wire, reconciliation, and active milestones. `InvestorOperationsRecord` stores independent signature and wire statuses. Server readiness ignores `commitmentStatus`, and DTO validation does not reject impossible combinations.

Evidence:

- Commitment lifecycle milestones start at `packages/domain/src/commitments/commitment-lifecycle.ts:12`.
- Independent operational axes live at `packages/domain/src/commitments/investor-operations.ts:56`.
- `validateCommitmentOperationalSnapshot` now lives in `packages/domain/src/commitments/investor-operations.ts`.
- Domain tests reject impossible combinations such as `active` plus `signatureStatus: not_sent` or `wireStatus: not_requested`.
- Server DTO validation calls the domain validator for every investor in `apps/web/server/deals/operational-center-validation.ts`.
- Server validation returns `InvestorInvariantViolation` when an investor lifecycle/axis combination is incoherent.

Why this matters:

Snapshots such as `active` plus `signatureStatus: not_sent` or `wireStatus: not_requested` can pass modeling and render incoherently.

Implemented direction:

- Added the pure domain validator rather than a runtime machine.
- Used it at the server DTO validation boundary.
- Keep this as pure domain validation before considering a runtime machine.

### 13. Workflow Actions Are Not Tied To Transition Maps

Severity: Medium

Files:

- `packages/domain/src/deals/deal-lifecycle.ts`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts`
- `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts`

Current behavior:

Deal transitions are explicit in domain, but kit exposes workflow action kinds and the app maps lifecycle to UI workflow separately. Current active-state actions are always `invite`.

Evidence:

- Domain transition map starts at `packages/domain/src/deals/deal-lifecycle.ts:38`.
- Kit workflow action kinds are declared at `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:29`.
- The app lifecycle-to-workflow map starts at `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:190`.
- Active-state actions are mapped at `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts:175`.

Why this matters:

When actions such as `closeDeal` or `moveToContracting` become real, UI availability can diverge from valid domain transitions.

Recommended direction:

- Introduce a small pure domain reducer such as `transitionDealLifecycle(state, event): Result`.
- Derive enabled workflow actions from that reducer and the current actor/visibility.
- XState is not needed until async actors, timers, retries, or long-lived event projections exist.

### 14. Activity Event Projection Metadata Was Duplicated And Diverged

Status: Remediated

Files:

- `apps/web/server/deals/operational-center-dto.ts`
- `apps/web/app/deals/[dealId]/deal-operational-activity-metadata.ts`
- `apps/web/app/deals/[dealId]/deal-operational-activity-helpers.ts`
- `apps/web/app/deals/[dealId]/deal-commitment-inspector-adapter.ts`

Previous behavior:

Activity event labels/tones are mapped in more than one app surface, and `commitment_updated` already differs by tone.

Evidence:

- The DTO event union is at `apps/web/server/deals/operational-center-dto.ts:238`.
- Base labels and tones now live in `apps/web/app/deals/[dealId]/deal-operational-activity-metadata.ts`.
- Overview activity mapping calls the shared helpers in `apps/web/app/deals/[dealId]/deal-operational-activity-helpers.ts`.
- The commitment inspector calls the same label helper and a named `getCommitmentInspectorActivityTone` helper.
- The previous `commitment_updated` tone difference is now an explicit commitment-inspector override, not an accidental duplicate map.

Why this matters:

Duplicated projection metadata can drift. Sometimes surface-specific tone is valid, but the code does not name that distinction.

Implemented direction:

- Centralized base event metadata.
- Kept surface-specific tone behavior as a named override.

### 15. Deal And Commitment Transition Tests Were Not Exhaustive

Status: Remediated

Files:

- `packages/domain/src/deals/deal-lifecycle.test.ts`
- `packages/domain/src/commitments/commitment-lifecycle.test.ts`
- `packages/domain/src/spv/spv-status.test.ts`

Previous behavior:

SPV transition tests cover the full cross-product of possible pairs. Deal and commitment tests cover allowed edges plus selected invalid examples.

Evidence:

- Deal lifecycle tests now include every possible `from/to` pair in `packages/domain/src/deals/deal-lifecycle.test.ts`.
- Commitment lifecycle tests now include every possible `from/to` pair in `packages/domain/src/commitments/commitment-lifecycle.test.ts`.
- SPV has explicit cross-product coverage at `packages/domain/src/spv/spv-status.test.ts:73`.

Why this matters:

Transition maps are state contracts. Exhaustive pair tests catch accidental newly allowed or newly blocked transitions.

Implemented direction:

- Added cross-product tests for deal and commitment transitions using explicit allowed-pair sets.

## Zustand Assessment

No current implementation area justifies Zustand.

Why:

- No state currently needs broad cross-route access.
- No state currently needs to live outside the React tree, except the dev telemetry flag, which does not drive React rendering.
- No measured Context broadcast issue requires selector subscriptions.
- Current interactive state is mostly route-local or component-local.
- The clearest over-shared case, commitment table selection, should move down, not out.

Potential future Zustand candidates:

- Persistent workspace chrome shared across unrelated route trees.
- A global command palette with subscriptions from independent surfaces.
- Multi-panel selection state coordinating tables, inspectors, bulk actions, and keyboard shortcuts across route boundaries.
- Client-only state that must be read or written from non-React modules and drives multiple React surfaces.

Before adding Zustand, require a short design note proving why local state, lifted state, URL state, server/cache state, or Context DI are insufficient.

## XState Assessment

No current UI component state justifies XState.

Legitimate future candidates remain:

- `packages/domain/src/deals/deal-lifecycle.ts`
- `packages/domain/src/commitments/commitment-lifecycle.ts`
- `packages/domain/src/spv/spv-status.ts`
- the deal progress workflow surface in `apps/web/app/deals/[dealId]/deal-progress-panel-adapter.ts` and `packages/kit/src/deal/deal-progress-panel`

Why not now:

- The current lifecycle implementations are simple pure functions and adjacency maps.
- There are snapshots and projections, but no long-lived client interpreter.
- There are no modeled async actors, timers, retries, invoked services, or concurrent machine-owned regions.
- The immediate issues are better addressed with pure reducers, validators, selectors, and exhaustive tests; the current pass added selectors, a validator, and exhaustive transition tests where they were bounded.

Trigger for revisiting XState:

- Backend events start driving a long-lived frontend lifecycle projection.
- Operators initiate optimistic transitions that later reconcile with server outcomes.
- Workflows need guarded transitions based on live facts, not just `from -> to`.
- Multiple parallel substates must be coordinated, such as lifecycle, document readiness, signature state, wire state, and reconciliation state.
- Transition logic starts spreading across components, adapters, and tests.

## Documentation Drift

### 1. `funding-frontend-spec.md` Defaulted UI State To Zustand

Status: Remediated in current research spec

File:

- `docs/50-research/funding-frontend-spec.md`

Previous evidence:

- It maps `UI state -> Zustand` at `docs/50-research/funding-frontend-spec.md:176`.
- It lists expanded rows, tabs, modals, filters, and theme preference under `UI state - Zustand` at `docs/50-research/funding-frontend-spec.md:224`.
- It compares Zustand only against React Context at `docs/50-research/funding-frontend-spec.md:230`.
- The reference architecture includes `Zustand UI Store` at `docs/50-research/funding-frontend-spec.md:847`.

Implemented update:

The spec now maps UI state to local/lifted/URL state first and reserves external stores for written justification.

```text
UI state -> local component state by default; lift to nearest common owner when shared; URL/search params for navigable state; external store only with written justification.
```

### 2. `STATUS.md` Blessed Route-Owned Commitment Table State

Status: Remediated

File:

- `STATUS.md`

Previous evidence:

- `STATUS.md:76` says row open state, inspector open state, and checkbox selection are route-owned.
- Current implementation now owns row/detail state inside the table via `rowState`, and checkbox selection is table-local unless a sibling needs it.

Implemented update:

`STATUS.md` now says row/detail state is table-owned by default and checkbox selection should remain table-local unless a route-level batch action bar or another sibling consumes it.

### 3. XState Wording Was Too Broad In Older Research

Status: Remediated in the cited research docs

Files:

- `docs/50-research/funding.md`
- `docs/50-research/funding-frontend-spec.md`

Previous evidence:

- `funding.md:115` says multi-step onboarding flows have "state machines under the hood."
- `funding-frontend-spec.md:346` calls machine state the "authoritative local representation."

Implemented update:

- `funding.md` now says simple step progression should stay local or form-library-owned.
- `funding-frontend-spec.md` now says pure reducers/validators come first and XState is only for justified long-lived runtime orchestration.
- Backend/event log state remains the source of truth; XState would be a local runtime projection.

### 4. Historical Specs Are Stale But Not Directly Conflicting

Examples:

- `docs/20-specs/app-shell-spec.md` is historical but still says the app does not import kit.
- `PLAN.md` is a completed closing-readiness plan, not a current planning snapshot.

These are lower priority than the Zustand/XState guidance drift.

## Aligned Guidance To Preserve

- `docs/20-specs/northstar-operational-center-dto-spec.md` correctly defers client query state until needed.
- `docs/20-specs/trpc-core-readiness-slice-spec.md` correctly says not to create unused provider code and to add client TanStack/tRPC providers only for meaningful interactive query state.
- Domain ADRs correctly keep XState out of domain and treat it as app/kit orchestration if needed later.

## Enforcement Checklist

Use this checklist during implementation and review:

1. Is the state only used by one component? Keep it local.
2. Do siblings need it? Lift it to their nearest common owner.
3. Is the state navigable or shareable by URL? Prefer route/search params over a client store.
4. Is it server data or a projection of server data? Prefer server components, tRPC/TanStack Query where justified, or explicit DTO adapters.
5. Is Context being used? It must be dependency injection for stable or infrequently changing values.
6. Does a Context provider value include changing state? Split by update frequency or avoid Context.
7. Is an external store proposed? Require proof that local/lifted/URL/server state is insufficient.
8. Is XState proposed? Require domain workflow complexity, not just multi-step UI.
9. Is state accepted as both raw data and derived summary? Pick one canonical source or centralize selectors.
10. Does a component support controlled and uncontrolled state? Use explicit `value/defaultValue/onChange` semantics or a single controllable-state helper.
11. Is an effect copying props into local state? Prefer deriving the rendered value from the current source of truth during render, or initialize uncontrolled defaults once.
12. Does a server route need a pure selector/helper from a UI package? Import it through a model-only subpath or app/server adapter, not through a mixed component barrel.

## Applied `AGENT.md` Addition

```md
## React State Ownership Guardrail

Default to colocated `useState`. Lift state only to the nearest common owner when siblings genuinely share it. Treat Context as dependency injection for stable or infrequently changing values, not as a state-management layer; split providers by update frequency and avoid fresh provider objects that broadcast every render. Do not introduce Zustand, Redux, XState, or another external state tool unless the change includes a short rationale proving local state, lifted state, URL state, server/cache state, and Context DI are insufficient. Use XState only for real domain workflows with explicit events, guarded transitions, async effects, replay/reconciliation, or parallel states, not for ordinary component or form progression. For reusable components, make controlled/uncontrolled ownership explicit with `value/defaultValue/onChange` semantics or a local controllable-state helper; do not mirror props into local state with `useEffect` when the rendered value can be chosen from the current source of truth during render. Avoid accepting both raw inputs and independently derived summaries unless one is clearly canonical.
```
