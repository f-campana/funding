# State Management Principle Audit

Date: 2026-05-18

## Scope

This audit covers the current repository against one rule only:

1. Prefer local component state with `useState` as the default.
2. Lift state only when siblings need to share it, and only to the nearest common owner.
3. Use React Context as dependency injection for infrequently changing values, not as a general state-management layer.
4. Use an external store such as Zustand or Redux only when state must live outside the React tree, or when a measured Context broadcast/re-render problem justifies selector-based subscriptions.

The audit looked at:

- `apps/web/app/**/*.tsx`
- `packages/kit/src/**/*.tsx`
- `packages/ui/src/**/*.tsx`
- repo-wide context/provider/store patterns
- docs, specs, READMEs, and Storybook examples

No code changes were made as part of the audit.

## Executive Summary

The implementation is mostly aligned with the principle. There is no live Redux, Zustand, Jotai, Valtio, MobX, or `useSyncExternalStore` usage in app/package code. Most interactive state is local to a route or component, and shared state is generally passed by explicit props rather than hidden behind Context.

The main implementation risks are narrow:

- `CommitmentsWorkspace` currently lifts table selection even though no sibling consumes it.
- `DealCommitmentsTable` has a controlled/uncontrolled hybrid that still writes local mirrors in controlled mode.
- `ChartContainer` uses Context appropriately for chart metadata, but creates a fresh provider value on every render.

The larger drift risk is documentation. `docs/50-research/funding-frontend-spec.md` recommends Zustand as the default home for broad UI state categories. That conflicts with the audited principle and could push future work toward global stores before local or lifted state has been exhausted.

## Implementation Findings

### 1. Unjustified Lifted Selection State In `CommitmentsWorkspace`

Severity: Medium

Files:

- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx`

Current behavior:

- `CommitmentsWorkspace` owns `selectedRowIds`.
- It passes `onSelectedRowIdsChange` into `DealCommitmentsTable`.
- It injects the selected IDs back into the table state through `getControlledTableState`.
- No sibling of `DealCommitmentsTable` currently reads the selected row IDs.

Evidence:

- `CommitmentsWorkspace` initializes selected row state at `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:78`.
- It passes `onSelectedRowIdsChange={setSelectedRowIds}` at `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:113`.
- It writes `selectedRowIds` into controlled table state at `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:167`.
- `DealCommitmentsTable` already has local selection state at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:82`.

Why this matters:

Selection is table-local interaction state unless another component needs to respond to it. Lifting it into the route workspace creates a wider re-render boundary and makes ownership less clear. It also makes the app route responsible for a table concern that the table already knows how to manage locally.

This does not require Zustand. It is the opposite case: state has been lifted when local state would be enough.

Recommended direction:

- Let `DealCommitmentsTable` own selection locally by default.
- Lift selection only when a sibling needs it, for example:
  - a workspace-level batch action bar outside the table
  - a drawer or inspector that reacts to selection independently of row opening
  - a cross-component export/command surface
- If selection later needs to be lifted, keep it at the nearest route workspace owner. Do not move it to an external store unless it needs to survive outside the route tree or coordinate independent UI surfaces across routes.

### 2. Controlled Table State Still Updates Local Mirrors

Severity: Low to Medium

File:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx`

Current behavior:

`DealCommitmentsTable` supports controlled and uncontrolled dimensions such as search, filters, pagination, and selected rows. The model chooses controlled values when the matching callback is present, but event handlers still write local state before calling callbacks.

Evidence:

- Controlled dimensions are detected at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:126`.
- Local mirrors are initialized at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:68`.
- Handler examples update local state and then call callbacks at `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:156`, `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:165`, `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:171`, `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:177`, and `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:182`.

Why this matters:

The controlled value wins, so this is not currently a correctness bug. The issue is ownership clarity and avoidable rendering. In controlled mode, local state is no longer authoritative. Updating it anyway adds noise and can produce extra renders without changing the rendered value.

Recommended direction:

- Keep the hybrid controlled/uncontrolled API, but make each setter ownership-aware.
- If a dimension is controlled, call only the callback.
- If a dimension is uncontrolled, update local state.
- Keep the existing local state path for standalone table use.

This should remain a component-local concern. It does not justify Zustand because the state does not need to live outside React, and Context would not solve the ownership problem.

### 3. `ChartContext` Provider Value Broadcasts On Each Container Render

Severity: Low to Medium

File:

- `packages/ui/src/components/chart.tsx`

Current behavior:

`ChartContainer` provides chart config through `ChartContext.Provider` using `value={{ config }}`. That object is recreated on every `ChartContainer` render. Consumers include `ChartTooltipContent` and `ChartLegendContent`.

Evidence:

- `useChart` reads the context at `packages/ui/src/components/chart.tsx:50`.
- The fresh provider object is created at `packages/ui/src/components/chart.tsx:173`.
- Tooltip and legend consumers read the config at `packages/ui/src/components/chart.tsx:383` and `packages/ui/src/components/chart.tsx:490`.

Why this matters:

The Context usage itself is appropriate: chart config is dependency data for nested tooltip and legend components. The problem is the provider value identity. Because Context broadcasts to consumers when the value changes by identity, a fresh wrapper object defeats some memoization opportunities even when `config` itself did not change.

Recommended direction:

- Prefer making the context value the `ChartConfig` directly and pass `value={config}`.
- Alternatively, memoize the wrapper with `useMemo(() => ({ config }), [config])`.
- Keep the context scoped to `ChartContainer`; do not introduce a wider chart store.

This finding reinforces the principle that Context is dependency injection, not a render optimization mechanism.

## Clean Implementation Areas

### `apps/web`

The app layer has no custom React Context, reducers, or external stores in TSX code.

Clean patterns:

- `NextIntlClientProvider` in `apps/web/app/layout.tsx` is root-level dependency injection for locale/messages. Locale data changes infrequently and is appropriate provider data.
- `DealAppShell` and `DealTabs` read selected route segment state from Next navigation instead of duplicating it in custom state.
- Deal pages derive server/component props and pass them explicitly to kit components.

The one app-layer state concern is the lifted selection state in `CommitmentsWorkspace`, covered above.

### `packages/kit`

Most kit components are prop-driven renderers. `DealOperationalOverview`, `DealProgressPanel`, `DealCommitmentInspector`, and `DealDocumentsEvidence` use discriminated unions such as `loading`, `error`, `empty`, and `ready` as input state, but they do not own broad mutable state.

`DealCommitmentsTable` is the main interactive component. Its local state is generally justified because toolbar, header, body, and footer need shared table controls. The table is the nearest common owner for search, filters, pagination, active row, drawer row, and local selection in standalone mode.

`TooltipProvider` usage is acceptable scoped dependency injection for Radix tooltip behavior.

### `packages/ui`

Most primitives are stateless wrappers around DOM or Radix primitives.

The only relevant local state sample in Storybook is `dropdown-menu.stories.tsx`, which uses local `useState` for a checkbox story. That is aligned with the principle.

`ChartContext` is scoped and conceptually valid. Its value identity should be tightened as described above.

## Documentation Findings

### 1. `funding-frontend-spec.md` Defaults UI State To Zustand

Severity: Medium

File:

- `docs/50-research/funding-frontend-spec.md`

Current guidance:

- The layer map assigns `UI state -> Zustand`.
- The UI state section lists expanded rows, collapsed sidebar sections, active tabs, open modals, filter selections, and theme preference as Zustand candidates.
- The rationale compares Zustand to React Context, citing direct access and selective subscriptions.
- The reference architecture includes a `Zustand UI Store` for tabs, modals, and filters.

Evidence:

- The layer map assigns `UI state -> Zustand` at `docs/50-research/funding-frontend-spec.md:176`.
- The section title `UI state - Zustand` appears at `docs/50-research/funding-frontend-spec.md:224`.
- The rationale starts at `docs/50-research/funding-frontend-spec.md:230`.
- The reference architecture includes `Zustand UI Store` at `docs/50-research/funding-frontend-spec.md:847`.

Why this conflicts with the principle:

The comparison skips the real default: component-local state. Many listed examples should start local or lifted:

- expanded rows: usually table-local
- active tabs: often URL/router state or local route state
- open modals: local to the triggering surface unless shared globally
- filter selections: local to the table/list unless encoded in URL or shared with another surface
- collapsed sidebar sections: local to the sidebar or persisted preference, depending on product requirements
- theme preference: possibly external because it crosses the tree and persists outside React, but that should be stated explicitly

Zustand can be a good tool when selector subscriptions or outside-tree access are required. It should not be the default bucket for ordinary UI state.

Recommended documentation correction:

- Change the layer map from `UI state -> Zustand` to `UI state -> local state by default; lift when shared; URL for navigable state; external store only when justified`.
- Rewrite the Zustand section as an escalation path, not a default.
- Require a short justification before adding any external store:
  - What component owns the state today?
  - Which siblings or routes need it?
  - Why is URL state, local state, lifted state, or server/cache state insufficient?
  - Is there a measured re-render or Context-broadcast problem?

### 2. XState Language Needs Narrowing

Severity: Low

Files:

- `docs/50-research/funding-frontend-spec.md`
- `docs/50-research/funding.md`

Current guidance:

- The frontend spec scopes XState to SPV/fund lifecycle machines and event-driven projections, which is mostly aligned.
- One section calls the XState projection the "authoritative local representation" of deal lifecycle.
- The research doc says multi-step onboarding flows have "state machines under the hood."

Evidence:

- The spec says XState is scoped to lifecycle machines at `docs/50-research/funding-frontend-spec.md:212`.
- The same spec calls the machine state the authoritative local representation at `docs/50-research/funding-frontend-spec.md:346`.
- The research doc says onboarding flows have state machines under the hood at `docs/50-research/funding.md:115`.

Why this is a near miss:

State machines are appropriate for domain lifecycle workflows with explicit transitions, guards, event replay, side effects, and reconciliation. They are not automatically appropriate for every wizard, form, or multi-step UI. Ordinary step progression should remain local or form-library-owned unless the flow has real transition complexity.

Recommended documentation correction:

- Clarify that the backend/event log remains the source of truth.
- Describe XState projections as local runtime projections, not authoritative domain truth.
- Scope XState to workflows with guarded domain transitions, parallel/async states, event replay, retries, or reconciliation.
- Avoid describing all multi-step forms as requiring state machines.

## Zustand Assessment

No current implementation area justifies a Zustand refactor.

Why:

- No state currently needs broad cross-route access.
- No state currently needs to live outside the React tree.
- No measured Context broadcast issue exists that would require selector subscriptions.
- Current interactive state is mostly route-local or component-local.
- The one over-shared case, table selection in `CommitmentsWorkspace`, should move down, not out.

Potential future Zustand candidates:

- Persistent workspace chrome shared across unrelated route trees.
- A global command palette with subscriptions from independent surfaces.
- Multi-panel selection state that must coordinate tables, inspectors, bulk actions, and keyboard shortcuts across route boundaries.
- Client-only state that must be read or written from non-React modules.

Before adding Zustand, require a short design note proving why local state, lifted state, URL state, TanStack Query/server state, or Context DI are not sufficient.

## XState Assessment

No current UI component state justifies an XState refactor.

There are legitimate future candidates in domain lifecycle areas:

- `packages/domain/src/deals/deal-lifecycle.ts`
- `packages/domain/src/commitments/commitment-lifecycle.ts`
- `packages/domain/src/spv/spv-status.ts`
- the deal progress workflow types in `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts`

Evidence:

- Deal lifecycle transitions are an explicit adjacency map at `packages/domain/src/deals/deal-lifecycle.ts:38`.
- Commitment lifecycle transitions are an explicit adjacency map at `packages/domain/src/commitments/commitment-lifecycle.ts:37`.
- SPV status transitions are an explicit adjacency map at `packages/domain/src/spv/spv-status.ts:17`.
- Deal progress workflow variants begin at `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:189`.

Why these are candidates:

- They already model explicit states and allowed transitions.
- They are business workflows, not visual toggle state.
- They may eventually need guards, event replay, optimistic transitions, backend reconciliation, async side effects, retries, and parallel substates.

Why not refactor now:

- The current implementations are simple pure functions and adjacency maps.
- They are easy to test exhaustively.
- They avoid runtime dependency and integration cost.
- There is no current local event processor or long-lived client projection requiring XState.

Trigger for revisiting XState:

- Backend events start driving a long-lived frontend lifecycle projection.
- Operators can initiate transitions optimistically and later reconcile with server outcomes.
- Workflows need guarded transitions based on live facts, not just `from -> to`.
- There are parallel substates such as lifecycle, document readiness, signature state, wire state, and reconciliation state that must coordinate.
- The transition logic starts spreading across components, adapters, and tests.

## Enforcement Checklist

Use this checklist during implementation and review:

1. Is the state only used by one component? Keep it local.
2. Do siblings need it? Lift it to their nearest common owner.
3. Is the state navigable or shareable by URL? Prefer route/search params over a client store.
4. Is it server data or a projection of server data? Prefer server components, tRPC/TanStack Query, or explicit DTO adapters.
5. Is Context being used? It must be dependency injection for stable or infrequently changing values.
6. Does a Context provider value include changing state? Split by update frequency or avoid Context.
7. Is an external store proposed? Require proof that local/lifted/URL/server state is insufficient.
8. Is XState proposed? Require domain workflow complexity, not just multi-step UI.

## Proposed `AGENT.md` Addition

```md
### React State Ownership

Default to colocated `useState`. Lift state only to the nearest common owner when siblings genuinely share it. Treat Context as dependency injection for stable or infrequently changing values, not as a state-management layer; split providers by update frequency and avoid fresh provider objects that broadcast every render. Do not introduce Zustand, Redux, XState, or another external state tool unless the change includes a short rationale proving local state, lifted state, URL state, server/cache state, and Context DI are insufficient. Use XState only for real domain workflows with explicit events, guarded transitions, async effects, replay/reconciliation, or parallel states, not for ordinary component or form progression.
```
