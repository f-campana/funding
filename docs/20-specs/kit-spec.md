# Kit Package Spec

## Status

Current accepted baseline.

`@repo/kit` was narrowed after earlier exploratory dashboard work. The current
package must not be read as the older broad dashboard kit. Deleted surfaces such
as money display primitives, metric cards, investor rows, deal terms panels,
dashboard demos, readiness cards, blocker queues, and reconciliation panels are
historical and are not current public API.

## Purpose

`@repo/kit` owns reusable, product-shaped React baselines that can be consumed by
the app without importing app routing, tRPC, auth, or provider concerns.

The package currently exposes only:

- `DealCommitmentsTable`
- `DealOperationalOverview`
- `DealProgressPanel`
- public props, state, action, label, and input types needed by those
  components

Future Northstar route work should compose route-specific UI in `apps/web` from
these accepted baselines and app-owned DTO adapters.

## Package Boundary

Allowed imports:

```ts
import type { StatusTone } from '@repo/domain'
import { Button, Table, cn } from '@repo/ui'
import { match } from 'ts-pattern'
import { ChevronRight } from 'lucide-react'
```

Forbidden imports:

```ts
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { trpc } from '@/trpc'
import { prisma } from '@/server/db'
```

Rules:

- no data fetching
- no server actions
- no app routing
- no auth/session code
- no app-owned DTO imports
- no hardcoded translated product copy inside reusable components
- no `data-testid`
- no `React.forwardRef`
- no `.displayName =`

## Label Boundary

Reusable kit components receive user-facing copy as props. Default English
labels belong in kit fixtures and stories, not hidden inside component logic.

Product state labels carried by row data, action data, metrics, and status data
are display-ready inputs and may remain in fixtures.

## `DealCommitmentsTable`

Public surface:

- `DealCommitmentsTable`
- `DealCommitmentsTableProps`
- `DealCommitmentsTableLabels`
- commitment row, readiness, filter, pagination, sort, group, and lifecycle
  types needed to adapt app DTOs into the table

Behavior:

- renders a compact operations table for investor commitment readiness
- keeps batch selection independent from row open/drawer state
- exposes one keyboard-focusable row opener button per enabled row
- may keep row click as a pointer convenience
- accepts labels for columns, filters, empty states, generated row labels, and
  pagination copy
- does not fetch investor details or own route state

## `DealOperationalOverview`

Public surface:

- `DealOperationalOverview`
- `DealOperationalOverviewProps`
- `DealOperationalOverviewLabels`
- operational readiness, blocker, capital summary, metric, activity, progress,
  and action event types needed by adapters

Behavior:

- renders a composed close-operations overview for readiness, capital
  reconciliation, priority blockers, and latest activity
- accepts display-ready monetary, metric, blocker, activity, readiness, and
  status labels
- accepts static section labels, empty/loading copy, and progress aria labels
  through `labels`
- exposes loading, error, empty, and ready lifecycle states without fetching data
  or owning app route state
- emits stable action events for retry behavior

## `DealProgressPanel`

Public surface:

- `DealProgressPanel`
- `DealProgressPanelProps`
- `DealProgressPanelLabels`
- progress state, action, capital summary, segment, metric, visibility, and
  data-quality types needed by adapters

Behavior:

- renders a right-rail style command panel for deal progress and capital
  composition
- accepts display-ready monetary, metric, status, action, and visibility labels
- accepts static section labels and progress aria labels through `labels`
- accepts `locale` for progress aria percentage formatting
- keeps normalized visual segment data internal to the component model

## App Data Boundary

`apps/web` owns the Northstar operational data spine:

```text
apps/web/server/deals/**
apps/web/server/trpc/**
apps/web/app/api/trpc/[trpc]/route.ts
```

Kit must not import that spine. App route adapters should map DTO sections into
the accepted kit baselines.

## Out Of Scope

Do not add or restore standalone kit surfaces outside the accepted baselines:

- dashboard demos
- money display primitives
- metric cards
- SPV trackers
- investor disclosure rows
- deal terms panels
- readiness summary cards
- blocker queues
- capital reconciliation panels
- document completeness cards
- activity timelines

These can appear only as internal parts of an accepted composed baseline, be
rebuilt inside app routes, or be introduced as new kit surfaces through an
explicit future pass.

## Verification

Required package checks:

```bash
pnpm --filter @repo/kit typecheck
pnpm --filter @repo/kit lint
pnpm --filter @repo/kit test:coverage
pnpm storybook:build
```
