# React Composition Audit

Status: Audit findings
Created: 2026-05-18
Scope: React code under `apps/web`, `packages/ui`, and `packages/kit`
Principle: prefer composition, `children`, and compound components over prop-driven UI structure

## Executive Summary

The codebase has a clear split.

`@repo/ui` mostly follows React composition well. Core primitives such as
`Card`, `Field`, `Table`, `DropdownMenu`, `Tooltip`, `Button`, and `Sheet`
generally expose small primitive props and accept caller-owned children.

`@repo/kit` is where the drift has happened. Several exported business
components take large `state + labels` objects and then internally author whole
screens or panels. That makes consumers configure implementation details
instead of composing UI descriptions. The result is prop-heavy APIs that are
hard to extend without adding more labels, flags, render branches, and nested
configuration objects.

The highest-priority correction is to move kit components toward compound APIs:
small, styled, reusable parts that accept children, while keeping domain records
as data only at the leaves that truly render repeated business records.

## Audited Principle

The audit used this rule and this rule only:

React components are functions that return descriptions of UI. Composition
means combining those descriptions, not configuring an implementation from the
outside.

The preferred pattern is:

```tsx
<Card>
  <Card.Header>
    <Card.Title>...</Card.Title>
  </Card.Header>
  <Card.Content>{children}</Card.Content>
</Card>
```

The risky pattern is:

```tsx
<Card title="..." subtitle="..." footer={...} icon={...} />
```

This audit did not flag ordinary domain records, route params, primitive
variants, accessibility props, event handlers, or localization labels by
themselves. A label or state prop became a finding only when it forced a
component to own structure that the consumer should be able to compose.

## Method

The codebase was split into five review lanes, plus a manual consolidation pass:

- `packages/ui`: shared primitives and their exports.
- `packages/kit/src/commitment`: commitment table and inspector surfaces.
- `packages/kit/src/deal` and `packages/kit/src/document`: deal overview,
  progress panel, and document evidence surfaces.
- `apps/web/app`: route-level shells, tabs, pending sections, and workspaces.
- Stories and tests: consumer evidence for awkward or prop-heavy APIs.

The final findings below are grouped by production API, not by every duplicate
symptom found in stories or tests.

## Severity Definitions

- P1: exported API strongly violates composition and is likely to create
  continuing prop expansion or prevent product customization.
- P2: meaningful composition issue, but narrower in scope or easier to contain.
- P3: local or low-risk issue; worth fixing opportunistically or when touching
  the file.

## P1 Findings

### 1. `DealCommitmentsTable` Is A Configured Widget

Evidence:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts:159`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:263`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.stories.tsx:53`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.test.tsx:81`

The exported table API requires `title`, `subtitle`, `labels`, `toolbar`,
`footer`, lifecycle `state`, export callbacks, selection callbacks, pagination
callbacks, and row-open callbacks. The component then renders the same toolbar,
table body, fixed column set, and footer every time.

This is not just data rendering. The consumer cannot compose:

- a custom header,
- extra toolbar actions,
- a different search/filter arrangement,
- a footer with custom metrics,
- a table without footer,
- a custom export control,
- a row detail/drawer area,
- a different column arrangement.

Instead, consumers must feed implementation instructions into `toolbar`,
`footer`, `labels.columns`, and conditional export props.

The stories and tests are strong evidence of the problem. They need wrappers,
casts, fixture merges, and coordinated labels/callbacks just to mount common
states. The export behavior is especially configuration-heavy: labels and two
callbacks must line up so the table can infer what button to render.

Rationale:

The table is a workflow surface, not a single primitive. At this level,
composition should let the app own structure. The table can still provide
opinionated default parts, but those parts should be assembled by the consumer
or exposed as explicit slots.

Suggested direction:

```tsx
<DealCommitmentsTable.Root state={state} onRowOpen={openInspector}>
  <DealCommitmentsTable.Toolbar>
    <DealCommitmentsTable.Title>Deal commitments</DealCommitmentsTable.Title>
    <DealCommitmentsTable.Search placeholder="Search investors" />
    <DealCommitmentsTable.Filters labels={filterLabels} />
    <ExportCommitmentsButton />
  </DealCommitmentsTable.Toolbar>

  <DealCommitmentsTable.Grid rows={rows}>
    <DealCommitmentsTable.Column id="investor" header="Investor">
      {(row) => <InvestorCell row={row} />}
    </DealCommitmentsTable.Column>
    <DealCommitmentsTable.Column id="commitment" header="Commitment">
      {(row) => <CommitmentAmountCell>{row.commitmentLabel}</CommitmentAmountCell>}
    </DealCommitmentsTable.Column>
  </DealCommitmentsTable.Grid>

  <DealCommitmentsTable.Footer>
    <FooterMetric>{investorCountLabel}</FooterMetric>
    <FooterMetric>{totalCommittedLabel}</FooterMetric>
    <DealCommitmentsTable.Pagination />
  </DealCommitmentsTable.Footer>
</DealCommitmentsTable.Root>
```

Keep a convenience `DealCommitmentsTable.Default` only if it is clearly a
pre-composed wrapper around composable parts.

### 2. `DealCommitmentInspector` Owns The Whole Panel Body

Evidence:

- `packages/kit/src/commitment/deal-commitment-inspector/deal-commitment-inspector.types.ts:85`
- `packages/kit/src/commitment/deal-commitment-inspector/deal-commitment-inspector.tsx:112`
- `packages/kit/src/commitment/deal-commitment-inspector/deal-commitment-inspector.stories.tsx:181`

`DealCommitmentInspector` receives `state`, `labels`, and `onAction`, then
renders a fixed sequence:

- investor header,
- next action,
- readiness,
- blockers,
- documents,
- activity,
- loading,
- empty,
- error.

The domain records are legitimate data. The violation is that the exported
component also owns all section ordering, all section presence, all fact layout,
all icon choices, all empty states, and all retry UI.

The context story also exposes a boundary problem: the table and inspector are
two independent configured widgets, so the consumer must manually coordinate
`activeRowId`, `drawerOpenRowId`, row fixtures, and the sibling inspector. A
composed row-detail slot would make the consumer own the inspector content at
the table/detail boundary.

Rationale:

Investor inspection is a product panel that is likely to evolve. The first time
the app needs to omit activity, reorder blockers above readiness, add an action
bar, insert compliance notes, or show richer documents, the current API will
need more props or branching.

Suggested direction:

```tsx
<DealCommitmentInspector.Root tone={tone}>
  <DealCommitmentInspector.Header>
    <InvestorSummary investor={investor} />
  </DealCommitmentInspector.Header>

  <DealCommitmentInspector.Section title="Next action">
    <p>{nextAction}</p>
  </DealCommitmentInspector.Section>

  <DealCommitmentInspector.Readiness items={readiness} />
  <DealCommitmentInspector.Blockers blockers={blockers} />
  <DealCommitmentInspector.Documents documents={documents} />
  <DealCommitmentInspector.Activity>{activityItems}</DealCommitmentInspector.Activity>
</DealCommitmentInspector.Root>
```

### 3. `DealOperationalOverview` Is A Monolithic `state + labels` Renderer

Evidence:

- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.types.ts:161`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.tsx:37`
- `packages/kit/src/deal/deal-operational-overview/deal-operational-overview.ready-content.tsx:24`

`DealOperationalOverview` takes a single lifecycle state and a large labels
object, then internally renders header, readiness, capital, blockers, activity,
loading, empty, and error content.

The records are useful view models. The problem is the exported surface:
consumers cannot decide section order, omit a section, provide a custom header,
compose a richer empty state, add secondary content, or split the overview
across responsive regions. The only path is to add more props and branches to
the component.

Rationale:

The overview is app-level product composition disguised as a kit component. It
should expose a frame and reusable section parts; the app should choose how to
assemble them.

Suggested direction:

```tsx
<DealOperationalOverview.Root readinessState={readiness.state}>
  <DealOperationalOverview.Header>
    <OverviewTitle />
    <ReadinessBadge>{readiness.label}</ReadinessBadge>
  </DealOperationalOverview.Header>

  <DealOperationalOverview.Grid>
    <DealOperationalOverview.Readiness readiness={readiness} />
    <DealOperationalOverview.Capital capital={capital} />
    <DealOperationalOverview.Blockers>{blockerItems}</DealOperationalOverview.Blockers>
    <DealOperationalOverview.Activity>{activityItems}</DealOperationalOverview.Activity>
  </DealOperationalOverview.Grid>
</DealOperationalOverview.Root>
```

### 4. `DealDocumentsEvidence` Introduces The Same Drift In New Code

Evidence:

- `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.types.ts:145`
- `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.tsx:56`
- `packages/kit/src/document/index.ts:1`

`DealDocumentsEvidence` is an exported, fully prop-authored document surface.
`labels`, `state`, and `onAction` drive header copy, summary metrics, group
layout, document facts, badges, loading, empty, error, and retry UI.

This is structurally similar to the overview and inspector problems, but it is
more urgent because these files are currently untracked. The API can be corrected
before it becomes accepted package surface area.

Rationale:

Document evidence is likely to need custom grouping, permissions, review
actions, file metadata, due-state treatments, data-room affordances, and
route-specific empty states. A single configured renderer will accumulate props
quickly.

Suggested direction:

Expose:

- `DealDocumentsEvidence.Root`
- `DealDocumentsEvidence.Header`
- `DealDocumentsEvidence.Summary`
- `DealDocumentsEvidence.Metric`
- `DealDocumentsEvidence.Groups`
- `DealDocumentsEvidence.Group`
- `DealDocumentsEvidence.Document`
- `DealDocumentsEvidence.Fact`
- `DealDocumentsEvidence.Empty`
- `DealDocumentsEvidence.Loading`
- `DealDocumentsEvidence.Error`

Map domain records outside the root shell, then compose the rendered parts.

## P2 Findings

### 5. `DealProgressPanel` Should Compose Actions

Evidence:

- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:323`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.ready-content.tsx:81`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.lifecycle-content.tsx:49`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.stories.tsx:58`

`DealProgressPanel` models workflow actions as data: primary action, secondary
actions, retry action, labels, audiences, availability, and disabled reasons.
It then renders button order, variants, disabled state, and disabled-reason UI
internally.

Rationale:

Progress, status, and capital values are legitimate data. Buttons are UI
structure. Consumers will reasonably need icons, confirmation wrappers, links,
menu grouping, custom disabled messaging, or a different retry placement.

Suggested direction:

Keep the panel frame and progress primitives, but make actions compositional:

```tsx
<DealProgressPanel.Root state={state}>
  <DealProgressPanel.Header />
  <DealProgressPanel.Capital capital={capital} />
  <DealProgressPanel.Actions>
    <DealProgressPanel.Action asChild>
      <Button onClick={invite}>Invite investors</Button>
    </DealProgressPanel.Action>
    <DealProgressPanel.DisabledReason>{reason}</DealProgressPanel.DisabledReason>
  </DealProgressPanel.Actions>
</DealProgressPanel.Root>
```

### 6. `DealAppShell` Still Configures Product-Specific Left Navigation

Evidence:

- `apps/web/app/deals/[dealId]/deal-app-shell.tsx:15`
- `apps/web/app/deals/[dealId]/layout.tsx:39`

`DealAppShell` already does one important thing right: it accepts `children`,
`header`, and `rail` as React nodes. The drift is in the left rail. The shell
receives `dealId`, `navItems`, `glyph`, and `workspaceLabel`, then renders fixed
brand initials, glyph selection, link markup, nav active state, and a version
badge.

Rationale:

The shell should ideally be a layout container. The route is the natural owner
of product-specific navigation, branding, badges, icons, and link content.

Suggested direction:

```tsx
<DealAppShell>
  <DealAppShell.LeftRail>
    <DealWorkspaceLogo href={...}>NS</DealWorkspaceLogo>
    <DealNav>
      <DealNavLink href={...} icon={<OverviewIcon />}>Overview</DealNavLink>
    </DealNav>
  </DealAppShell.LeftRail>
  <DealAppShell.Header>{header}</DealAppShell.Header>
  <DealAppShell.Body>{children}</DealAppShell.Body>
  <DealAppShell.Rail>{rail}</DealAppShell.Rail>
</DealAppShell>
```

## P3 Findings

### 7. `SheetContent` Injects A Fixed Close Button

Evidence:

- `packages/ui/src/components/sheet.tsx:68`
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:118`

`SheetContent` exposes `showCloseButton` and injects a fixed close button,
placement, icon, label, size, and variant. The commitment workspace disables it
with `showCloseButton={false}` so it can compose its own sticky close control,
which proves the default is not always structurally appropriate.

Suggested direction:

Prefer explicit composition:

```tsx
<SheetContent>
  <SheetClose asChild>
    <Button aria-label="Close" size="icon" variant="ghost">
      <XIcon />
    </Button>
  </SheetClose>
  {children}
</SheetContent>
```

If a convenience close button is useful, export it as `SheetCloseButton` instead
of making it a boolean branch inside `SheetContent`.

### 8. `ChartTooltipContent` Has Layout Flags

Evidence:

- `packages/ui/src/components/chart.tsx:230`
- `packages/ui/src/components/chart.stories.tsx:131`

`ChartTooltipContent` accepts legitimate Recharts/data props, but also includes
presentational structure flags such as `hideLabel`, `hideIndicator`,
`indicator`, `labelClassName`, and `color`.

This is lower risk because `ChartTooltip` already accepts custom `content`.
Still, the provided content component is moving toward flag-driven layout
rather than exposing composable tooltip parts.

Suggested direction:

Expose tooltip subparts, or keep `ChartTooltipContent` as a default convenience
while encouraging custom composed content for non-default layouts.

### 9. `DealTabs` Receives Tab Config Objects

Evidence:

- `apps/web/app/deals/[dealId]/deal-tabs.tsx:13`

`DealTabs` receives a list of `{ href, label, segment }` records and owns all
link rendering. This is currently small, but future badges, icons, disabled
states, or secondary labels would push it toward prop expansion.

Suggested direction:

```tsx
<DealTabs ariaLabel={label}>
  <DealTabLink href={href} segment="overview">Overview</DealTabLink>
  <DealTabLink href={href} segment="commitments">Commitments</DealTabLink>
</DealTabs>
```

### 10. `DealPendingWorkspaceSection` Is Over-Configured For Its Size

Evidence:

- `apps/web/app/deals/[dealId]/deal-pending-workspace-section.tsx:1`

The component receives `sectionLabel` and `description`, then authors a complete
heading and fixed three-card layout. The route is the natural owner of this
small page structure.

Suggested direction:

Inline it in the route or turn it into a small shell with children.

### 11. Story Layout Helpers Use Text Props

Evidence:

- `packages/ui/src/stories/story-layout.tsx:14`
- `packages/kit/src/stories/story-layout.tsx:13`

`StorySection` helpers take `title` and `description` props and own heading
markup. This is story-only and low priority, but it is the same pattern in
miniature.

Suggested direction:

Allow composed section headers when stories need anything beyond plain copy.

## Non-Findings

The following were intentionally not flagged:

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and
  `CardFooter`: these are already compound composition primitives.
- `Field`, `Table`, `DropdownMenu`, `Tooltip`, `Button`, `Badge`, `Input`,
  `Textarea`, `Checkbox`, `Progress`, `Separator`, and `Skeleton`: their props
  are mostly primitive DOM, accessibility, or variant props.
- Route `params`, DTOs, adapters, and domain records: data props are fine when
  they do not force UI structure.
- Localization label dictionaries by themselves: labels become a problem only
  when they are used as a hidden schema for fixed UI structure.
- Lifecycle states by themselves: loading/error/empty/ready states are fine, but
  consumers should be able to compose the rendered content for those states when
  the component is an exported product surface.

## Recommended Refactor Order

1. Start with `DealDocumentsEvidence` because it is new and currently
   untracked. Correcting its API now prevents a new configured widget from
   becoming accepted kit surface.
2. Refactor `DealCommitmentsTable` next. It has the highest consumer friction
   and the strongest story/test evidence of prop explosion.
3. Refactor `DealCommitmentInspector` alongside or immediately after the table
   so the row-detail boundary can become compositional.
4. Convert `DealOperationalOverview` to a compound shell and section parts.
5. Make `DealProgressPanel` actions compositional.
6. Opportunistically simplify `DealAppShell`, `SheetContent`, `DealTabs`, and
   the story helpers when those files are next touched.

## Composition Guardrail Checklist

Use this checklist before adding a prop to a React component:

- Is this prop primitive behavior or accessibility, such as `disabled`,
  `aria-label`, `onClick`, `variant`, or `size`?
- Is this prop domain data that the component maps over as repeated records?
- Or is this prop asking the component to author UI structure, such as `title`,
  `subtitle`, `header`, `footer`, `toolbar`, `actions`, `icon`, `emptyState`,
  `retryLabel`, or `columns`?
- If the prop is structural, can the caller pass children instead?
- Would a compound component make the consumer code clearer?
- Would the next customization require another prop, flag, or label?
- Is this a low-level primitive, a reusable kit part, or an app-owned product
  composition? The higher it is in the product stack, the more it should favor
  explicit composition.

## Proposed `AGENT.md` Addition

No root `AGENT.md` or `AGENTS.md` exists in this repository at the time of this
audit. If one is added, this short rule should be included:

```md
## React Composition Guardrail

When creating or changing React components, prefer composition over
configuration. Components should combine caller-owned UI descriptions through
`children`, slots, or compound subcomponents instead of accepting structural
props such as `title`, `subtitle`, `header`, `footer`, `toolbar`, `actions`,
`icon`, `emptyState`, or `columns`.

Small primitive props, accessibility props, variants, event handlers, and domain
data records are fine. But if a prop makes the component decide layout,
ordering, nested controls, section presence, or rendered action UI, stop and
use children or a compound API. Exported `@repo/kit` product surfaces should
expose composable parts first; pre-composed defaults may wrap those parts, but
must not be the only public API.
```
