# React Composition Audit

Status: Audit findings
Created: 2026-05-18
Last updated: 2026-05-19
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

## Current Snapshot

Snapshot date: 2026-05-19

A fresh six-lane audit confirms the original composition concern. The priority
order has changed in two places:

- `DealDocumentsEvidence` is no longer an untracked/new surface. It is now
  tracked, exported from `@repo/kit`, covered by tests/stories, consumed by the
  app documents route, and asserted in package export tests. The composition
  issue therefore moved from "fix before acceptance" to "accepted public surface
  now needs an intentional migration or ADR."
- `DealPendingWorkspaceSection` is gone from active app code. The documents
  route now renders `DealDocumentsEvidence`, which strengthens the broader
  finding that app routes are pass-through consumers of configured kit widgets.

Remediated in this pass:

- `DealDocumentsEvidence` now exposes compound parts (`Root`, `Header`,
  `Summary`, `Metric`, `Groups`, `Group`, `Document`, `Fact`, `Loading`,
  `Error`, and `Empty`) while keeping the original pre-composed component as a
  compatibility wrapper.
- The documents route now composes the document evidence surface explicitly
  instead of spreading the adapter prop bag into a monolithic kit widget.
- `DealOperationalOverview` now exposes compound parts (`Root`, `Header`,
  `PrimaryGrid`, `SecondaryGrid`, `Readiness`, `Capital`, `Blockers`,
  `Activity`, `Loading`, `Error`, and `Empty`) while keeping the original
  pre-composed component as a compatibility wrapper.
- The overview route now composes the operational overview explicitly instead
  of spreading the adapter prop bag into a monolithic kit widget.
- `DealCommitmentInspector` now exposes compound parts (`Root`, `Header`,
  `NextAction`, `Readiness`, `ReadinessItem`, `Blockers`, `Blocker`,
  `Documents`, `Document`, `Activity`, `ActivityItem`, `Loading`, `Error`, and
  `Empty`) while keeping the original pre-composed component as a compatibility
  wrapper.
- The commitments workspace now composes the commitment inspector inside the
  sheet instead of rendering the full configured inspector widget.
- `DealCommitmentsTable` now exposes composable `Root`, `Content`, granular
  toolbar/grid/footer parts, `Detail`, `RowActionButton`, and `Model` render-prop
  boundaries, preserving the existing table model and pre-composed wrapper while
  letting the commitments route own the table surface shell, part ordering, row
  detail composition, and row action rendering.
- `DealProgressPanel` now exposes composable `Root`, `Header`, `Capital`,
  `DataQuality`, `Actions`, `ActionButton`, `Loading`, `Error`, and
  `ReadyContent` parts, preserving the existing pre-composed wrapper while
  letting app routes own panel section ordering.
- `DealOperationalRail` now composes the progress panel from those parts instead
  of spreading a configured panel prop object into the wrapper.
- `DealAppShell` now accepts caller-owned `leftRail` content and exposes
  composable left-rail parts (`LeftRail`, `Logo`, `Nav`, `NavLink`, `NavGlyph`,
  and `VersionBadge`) instead of requiring navigation records.
- `DealTabs` now exposes `Root` and `Link` compound parts, and the layout now
  composes tab links directly. The small record-driven wrapper remains for
  compatibility.
- `DealEntityHeader` now exposes compound header parts (`Root`, `Hero`,
  `Identity`, `BrandMark`, `Copy`, `Kicker`, `TitleBlock`, `Title`,
  `Description`, `Metrics`, `Metric`, `Tabs`, and `LifecycleSummary`), and the
  layout now assembles the entity header explicitly.
- `SheetContent` no longer injects a close button behind a boolean. Consumers
  compose `SheetCloseButton` or their own `SheetClose` control explicitly.
- `DealOperationalRail` now accepts caller-owned rail card children. The layout
  composes the operational snapshot and exception queue cards with rail card and
  metric parts.
- `ChartTooltipContent` and `ChartLegendContent` now compose public tooltip and
  legend subparts, giving custom chart layouts a lower-level composition path.
- Story layout helpers now expose composable section header/title/description
  parts and an explicit `header` slot while keeping simple title/description
  props as compatibility sugar.

Remaining current P1 issues:

- None currently known in the prioritized `@repo/kit` deal/commitment/document
  surfaces after this remediation pass.
Confirmed current P2 issues:

- None currently known in the prioritized app route consumers.

Confirmed current P3 issues:

- None currently known from this audit pass.

Post-remediation verification update:

- The e2e suite exposed one non-composition regression after the composition
  pass: `DealTabs.Root` and `DealTabs.Link` were accessed as static properties
  across a React Server Component boundary, rendering as `undefined` in the
  production route shell. The layout now imports `DealTabsRoot` and
  `DealTabLink` directly, keeping the same composed tab structure without the
  RSC static-property hazard.
- The e2e suite also exposed a nearby semantic mismatch: document evidence rows
  used status-only tone, so a missing document that blocked closing rendered as
  `attention`. The kit now derives row tone from both status and closing impact,
  so blocking document issues render as `danger`.
- `pnpm --filter @repo/web e2e` passed after those fixes: 13/13 Playwright
  tests. The composition snapshot is current with the implemented work.

## Kit Component Split Review

The composition pass intentionally exposed more compound parts. That made a few
kit entry files longer than ideal even though the public APIs moved in the
right direction.

Current split decisions from the 2026-05-19 follow-up:

- `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.tsx`
  was split. The public wrapper now owns the root, compatibility component, and
  aggregate exports; `deal-documents-evidence.content.tsx` owns composed ready
  sections; `deal-documents-evidence.lifecycle.tsx` owns loading/error/empty
  states; `deal-documents-evidence.parts.tsx` owns small reusable local parts.
  This was the lowest-risk split because it preserved all public exports and did
  not move stateful context.
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx`
  remains the largest production candidate. It should be split next around a
  dedicated context/content module, then toolbar, grid/model, footer, and detail
  modules. Do this deliberately because the controlled/uncontrolled table state
  and render-prop model all share one context.
- `packages/kit/src/commitment/deal-commitment-inspector/deal-commitment-inspector.tsx`
  is the second production candidate. A safe split would mirror the document
  evidence shape: root/wrapper exports, ready sections, lifecycle states, and
  shared local parts. It is less urgent than the table because it has no local
  controlled state.
- Large fixture and test files are acceptable for now. Split them only when a
  production module split makes test setup difficult to navigate.

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
- `apps/web/app`: route-level shells, tabs, rails, pages, and workspaces.
- Stories and tests: consumer evidence for awkward or prop-heavy APIs.

The final findings below are grouped primarily by production API, not by every
duplicate symptom found in stories or tests. Story-only helpers are listed as
P3 local findings where they show the same pattern in miniature.

## Severity Definitions

- P1: exported API strongly violates composition and is likely to create
  continuing prop expansion or prevent product customization.
- P2: meaningful composition issue, but narrower in scope or easier to contain.
- P3: local or low-risk issue; worth fixing opportunistically or when touching
  the file.

## P1 Findings

### 1. `DealCommitmentsTable` Is A Configured Widget

Remediation status: addressed on 2026-05-19 by splitting the public surface
into `DealCommitmentsTable.Root`/`DealCommitmentsTableContent`, exposing
toolbar, grid/table/header/body, footer, detail, row action, and model
render-prop compound parts, and updating the commitments route to compose those
parts explicitly. The provided toolbar/grid/footer remain opinionated defaults,
but they are now replaceable presets rather than the only public rendering path.

Evidence:

- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.types.ts:159`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.tsx:263`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.stories.tsx:53`
- `packages/kit/src/commitment/deal-commitments-table/deal-commitments-table.test.tsx:81`

The original exported table API was centered on `title`, `subtitle`, `labels`, `toolbar`,
`footer`, lifecycle `state`, and optional or conditional callbacks for export,
selection, pagination, and row-open behavior. The component then rendered the
same toolbar, table body, fixed column set, row action, and footer every time.

This was not just data rendering. The consumer could not compose:

- a custom header,
- extra toolbar actions,
- a different search/filter arrangement,
- a footer with custom metrics,
- a table without footer,
- a custom export control,
- a different column arrangement.

Instead, consumers had to feed implementation instructions into `toolbar`,
`footer`, `labels.columns`, and conditional export props.

The stories and tests are strong evidence of the problem. They need wrappers,
casts, fixture merges, and coordinated labels/callbacks just to mount common
states. The export behavior is especially configuration-heavy: labels and two
callbacks must line up so the table can infer what button to render.

The earlier commitments route strengthened this finding. It tracked
`activeRowId`, `drawerOpenRowId`, selected rows, Sheet state, telemetry events,
and inspector lookup separately because the table did not expose a composed
detail boundary. That detail boundary is now available through
`DealCommitmentsTable.Detail`.

The column model also shows future pressure. Rows carry a full readiness record,
including reconciliation, while the visible table columns are fixed to KYC/KYB,
signature, and wire in the default preset. Consumers can now replace the grid
with a custom table via `DealCommitmentsTable.Model` without reimplementing the
table controls.

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

### 2. `DealCommitmentInspector` Owned The Whole Panel Body

Remediation status: addressed on 2026-05-19 by adding compound inspector parts
and updating the commitments sheet to compose them directly. The finding text
below is retained as rationale and historical context.

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

### 3. `DealOperationalOverview` Was A Monolithic `state + labels` Renderer

Remediation status: addressed on 2026-05-19 by adding compound overview parts
and updating the overview route to compose them directly. The finding text below
is retained as rationale and historical context.

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

### 4. `DealDocumentsEvidence` Was An Accepted Configured Surface

Remediation status: addressed on 2026-05-19 by adding compound document evidence
parts and updating the documents route to compose them directly. The finding
text below is retained as rationale and historical context.

Evidence:

- `packages/kit/src/package-exports.test.ts:13`
- `packages/kit/src/package-exports.test.ts:34`
- `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.types.ts:145`
- `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.tsx:56`
- `packages/kit/src/document/deal-documents-evidence/deal-documents-evidence.stories.tsx:39`
- `packages/kit/src/document/index.ts:1`
- `apps/web/app/deals/[dealId]/documents/page.tsx:19`

`DealDocumentsEvidence` is an exported, fully prop-authored document surface.
`labels`, `state`, and `onAction` drive header copy, summary metrics, group
layout, document facts, badges, loading, empty, error, and retry UI.

This is structurally similar to the overview and inspector problems. The fresh
2026-05-19 audit changes the status: this is no longer a new untracked surface.
It is tracked, package-exported, covered by stories/tests, and consumed by the
documents route. That makes it a normal public API migration problem rather
than a pre-acceptance cleanup.

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

### 5. App Routes Mostly Configured Kit Widgets

Remediation status: addressed on 2026-05-19. The overview, documents,
commitment inspector, progress panel, app shell, entity header, operational
rail cards, and commitments table workflow are now route-composed through
compound parts or explicit render-prop boundaries.

Evidence:

- `apps/web/app/deals/[dealId]/overview/page.tsx:19`
- `apps/web/app/deals/[dealId]/documents/page.tsx:19`
- `apps/web/app/deals/[dealId]/commitments/page.tsx:20`
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:82`
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:132`
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:177`

The overview and documents routes were adapter-spread pass-throughs into
monolithic kit components. The commitments route chose configured table and
inspector view models, then `CommitmentsWorkspace` manually synchronized row
state, drawer state, selected rows, telemetry, and inspector props around two
configured kit widgets.

Rationale:

Route files are the natural home for product-level composition. Today they are
mostly orchestration layers that feed view-model props into pre-authored kit
surfaces. That is a symptom of the kit API shape, not a standalone route bug,
but it means app code cannot exercise React's composition model until kit
exports composable parts.

Suggested direction:

Once kit exposes compound pieces, route pages should assemble the workflow
directly:

```tsx
<DealOperationalOverview.Root>
  <DealOperationalOverview.Header>{header}</DealOperationalOverview.Header>
  <DealOperationalOverview.Readiness readiness={readiness} />
  <DealOperationalOverview.Capital capital={capital} />
</DealOperationalOverview.Root>
```

For commitments, the table still needs column/toolbar/footer composition if
those areas need route-specific customization beyond the provided defaults.

## P2 Findings

### 6. `DealProgressPanel` Should Compose Actions And Sections

Remediation status: addressed on 2026-05-19 by adding compound progress panel
parts and updating the operational rail to compose the panel directly. The
default `Actions` helper still renders the standard action-button group and
disabled-reason UI, but it is now a replaceable compound part rather than the
only public rendering path.

Evidence:

- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.types.ts:323`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.ready-content.tsx:54`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.ready-content.tsx:81`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.lifecycle-content.tsx:49`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.actions.tsx:20`
- `packages/kit/src/deal/deal-progress-panel/deal-progress-panel.stories.tsx:58`

`DealProgressPanel` modeled workflow actions as data: primary action, secondary
actions, retry action, labels, audiences, availability, and disabled reasons.
It then rendered button order, variants, disabled state, and disabled-reason UI
internally.

The ready content order was also fixed: header/status, capital, data-quality
notice, then actions. Consumers cannot move data-quality messaging below
actions, replace the header, split capital from controls, or insert adjacent
warnings without more props.

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

### 7. `DealAppShell` Configured Product-Specific Left Navigation

Remediation status: addressed on 2026-05-19 by changing the shell to accept a
caller-owned `leftRail` node and by exposing composable left-rail, logo, nav,
nav-link, glyph, and version-badge parts. The layout now assembles the
product-specific navigation directly.

Evidence:

- `apps/web/app/deals/[dealId]/deal-app-shell.tsx:15`
- `apps/web/app/deals/[dealId]/layout.tsx:39`

`DealAppShell` already did one important thing right: it accepted `children`,
`header`, and `rail` as React nodes. The drift was in the left rail. The shell
received `dealId`, `navItems`, `glyph`, and `workspaceLabel`, then rendered
fixed brand initials, glyph selection, link markup, nav active state, and a
version badge.

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

### 8. `DealOperationalRail` Hardcodes Rail Cards

Remediation status: addressed on 2026-05-19 by changing the rail to accept
caller-owned children after the progress panel and by moving the snapshot and
exception card composition into the route layout.

Evidence:

- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx:19`
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx:45`
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx:50`
- `apps/web/app/deals/[dealId]/deal-operational-rail.tsx:59`

The operational rail maps progress-panel events into router pushes and now
composes the progress panel from compound parts. It previously still hardcoded
the remaining rail sections as local metric cards.

Rationale:

The rail is app-local, so this is less risky than exported kit APIs. Still, it
could not compose rail cards from children.

Suggested direction:

Keep snapshot/exception card content in the route layout. Add more rail card
parts only if a second route needs a different rail structure.

## P3 Findings

### 9. `SheetContent` Injected A Fixed Close Button

Remediation status: addressed on 2026-05-19 by removing the `showCloseButton`
branch from `SheetContent` and exporting `SheetCloseButton` as an explicit
composable close control.

Evidence:

- `packages/ui/src/components/sheet.tsx:68`
- `apps/web/app/deals/[dealId]/commitments/commitments-workspace.tsx:144`

`SheetContent` exposed `showCloseButton` and injected a fixed close button,
placement, icon, label, size, and variant. The commitment workspace previously
disabled it with `showCloseButton={false}` so it could compose its own sticky
close control, which proved the default was not always structurally appropriate.

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

### 10. Chart Default Content Helpers Have Layout Flags

Remediation status: addressed on 2026-05-19 by extracting public tooltip and
legend subparts (`ChartTooltipContentRoot`, `ChartTooltipLabel`,
`ChartTooltipItems`, `ChartTooltipIndicator`, `ChartTooltipItem`,
`ChartLegendContentRoot`, `ChartLegendItem`, `ChartLegendIndicator`, and
`ChartLegendLabel`) and composing the default helpers from them. The flag-based
helpers remain compatibility presets for common chart layouts.

Evidence:

- `packages/ui/src/components/chart.tsx:230`
- `packages/ui/src/components/chart.tsx:367`
- `packages/ui/src/components/chart.tsx:475`
- `packages/ui/src/components/chart.stories.tsx:131`
- `packages/ui/src/components/chart.stories.tsx:224`

`ChartTooltipContent` and `ChartLegendContent` accept legitimate Recharts/data
props such as payload, key selection, config, and custom `content`. Those should
not be treated as composition problems. The narrower issue is that the default
content helpers own fixed item markup and expose layout toggles such as
`hideLabel`, `hideIndicator`, `indicator`, and `hideIcon`.

This is lower risk because `ChartTooltip` and `ChartLegend` already accept
custom `content`. Still, the provided default content components are moving
toward flag-driven layout rather than exposed composable parts.

Suggested direction:

Expose tooltip/legend subparts, or keep the default content components as
convenience wrappers while encouraging custom composed content for non-default
layouts.

### 11. `DealTabs` Received Tab Config Objects

Remediation status: addressed on 2026-05-19 by exposing `DealTabs.Root` and
`DealTabs.Link` compound parts and updating the layout to compose tab links
directly. The record-driven wrapper remains available for small default usage.

Evidence:

- `apps/web/app/deals/[dealId]/deal-tabs.tsx:13`

`DealTabs` received a list of `{ href, label, segment }` records and owned all
link rendering. This is currently small, but future badges, icons, disabled
states, or secondary labels would push it toward prop expansion.

Suggested direction:

```tsx
<DealTabs ariaLabel={label}>
  <DealTabLink href={href} segment="overview">Overview</DealTabLink>
  <DealTabLink href={href} segment="commitments">Commitments</DealTabLink>
</DealTabs>
```

### 12. `DealEntityHeader` Was Partially Compositional But Fixed

Remediation status: addressed on 2026-05-19 by exposing compound header parts
and updating the layout to compose the brand mark, status, title block, metrics,
tabs, and lifecycle summary directly.

Evidence:

- `apps/web/app/deals/[dealId]/deal-entity-header.tsx:7`
- `apps/web/app/deals/[dealId]/deal-entity-header.tsx:20`
- `apps/web/app/deals/[dealId]/deal-entity-header.tsx:27`
- `apps/web/app/deals/[dealId]/deal-entity-header.tsx:58`

`DealEntityHeader` did one important thing right: `tabs` was a `ReactNode`, so
the tab strip is caller-owned. The rest is fixed app-local structure: internal
view-model mapping, hard-coded `NS` brand block, status badge placement, and
exactly three header metrics.

Suggested direction:

Keep this low priority because it is app-local. If it grows, split it into
composable header pieces or move the metric list to children.

### 13. Story Layout Helpers Used Text Props

Remediation status: addressed on 2026-05-19 by adding composable
`StorySectionHeader`, `StorySectionTitle`, and `StorySectionDescription` parts
plus a `header` slot to both UI and kit story helpers. Existing `title` and
`description` props remain as simple compatibility sugar.

Evidence:

- `packages/ui/src/stories/story-layout.tsx:14`
- `packages/kit/src/stories/story-layout.tsx:13`

`StorySection` helpers took `title` and `description` props and owned heading
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

1. `DealDocumentsEvidence` is remediated. Keep the pre-composed wrapper for
   compatibility, but route consumers should prefer the compound parts.
2. `DealCommitmentsTable` is remediated. Keep the pre-composed wrapper and
   default toolbar/grid/footer presets for compatibility, but route consumers
   should prefer the granular parts or `Model` render prop when they need custom
   structure.
3. `DealCommitmentInspector` is remediated. Keep the pre-composed wrapper for
   compatibility, but route consumers should prefer the compound parts.
4. `DealOperationalOverview` is remediated. Keep the pre-composed wrapper for
   compatibility, but route consumers should prefer the compound parts.
5. `DealProgressPanel` is remediated. Keep the pre-composed wrapper for
   compatibility, but app consumers should prefer the compound parts when they
   need to own section ordering.
6. `DealAppShell`, `DealTabs`, and `DealEntityHeader` are remediated for the
   current route layout; keep route consumers on the compound parts.
7. No remaining composition findings are currently known from this audit pass.

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

Root `AGENT.md` now exists and contains this rule as its first entry:

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
