# Kit Package Spec

## `@repo/kit` - product-shaped composed components

**Status:** Implemented first component batch
**Scope:** `packages/kit`, Storybook stories, component tests
**Depends on:** `@repo/domain`, `@repo/ui`, React, Motion, Lucide, `ts-pattern`
**Must not depend on:** Next.js, `next-intl`, tRPC, database, auth, app routes

## 1. Purpose

`@repo/kit` is the first product-shaped UI layer.

It composes generic primitives from `@repo/ui` with domain types from
`@repo/domain`. This is where private-market concepts become visible in React:
money amounts, commitment progress, SPV statuses, investor rows, deal terms, and
dashboard demo blocks.

The first component batch is implemented. The next product-surface pass is
specified separately in
[kit-visual-refinement-spec.md](../60-planning/kit-visual-refinement-spec.md).

The package stays render-focused. It may accept domain-shaped props, but it must
not fetch data, call tRPC, own routing, own auth, or read app-level providers.

## 2. Package Boundary

Allowed imports:

```ts
import type { EuroCents, InvestorId, SpvStatus, SupportedCountry } from '@repo/domain'
import { formatEuroCents, SPV_STATUSES } from '@repo/domain'
import { Button, Card, Progress, cn } from '@repo/ui'
import { match } from 'ts-pattern'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
```

Forbidden imports:

```ts
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { trpc } from '@/trpc'
import { prisma } from '@/server/db'
```

Rules:

- no data fetching
- no server actions
- no app routing
- no auth/session code
- no direct DOM measurement for animation unless Motion cannot express the
  behavior
- no hardcoded translated product copy inside reusable components
- no `data-testid`
- no `React.forwardRef`
- no `.displayName =`

## 3. i18n Boundary

`@repo/kit` must be framework-neutral.

Do not import `next-intl`. Instead, components receive user-facing labels and
locale-sensitive values through props.

Good:

```tsx
<MoneyDisplay amount={amount} locale={locale} />

<SpvStateTracker
  currentStatus={status}
  labels={{
    draft: t('spv.status.draft'),
    open: t('spv.status.open'),
    kyc_in_progress: t('spv.status.kyc_in_progress'),
    e_signatures: t('spv.status.e_signatures'),
    collecting: t('spv.status.collecting'),
    incorporated: t('spv.status.incorporated'),
    closed: t('spv.status.closed'),
  }}
/>
```

Bad:

```tsx
const t = useTranslations('spv')
const locale = useLocale()
```

Default story/demo labels may be English, but reusable components should not
require English copy to function.

## 4. Money Display

Create:

```text
packages/kit/src/money/money-display.tsx
packages/kit/src/money/index.ts
```

Public API:

```ts
export type MoneyDisplayProps = {
  readonly amount: EuroCents
  readonly locale?: string
  readonly currencyDisplay?: 'symbol' | 'code' | 'name'
  readonly fallback?: string
  readonly className?: string
}
```

Behavior:

- default locale is `fr-FR`
- use `formatEuroCents` from `@repo/domain`
- render exact cents, never approximate
- use tabular numbers with `font-mono tabular-nums`
- if formatting returns `Result.Error`, render `fallback ?? '-'`
- expose `data-slot="money-display"`
- expose `data-state="ready"` or `data-state="error"`

Do not convert `EuroCents` to `number` directly in the component. All formatting
goes through `formatEuroCents`.

## 5. Metric Card

Create:

```text
packages/kit/src/metrics/metric-card.tsx
packages/kit/src/metrics/index.ts
```

Public API:

```ts
export type MetricCardProps = {
  readonly label: string
  readonly value: ReactNode
  readonly description?: ReactNode
  readonly trend?: ReactNode
  readonly className?: string
}
```

Behavior:

- compose `Card` primitives from `@repo/ui`
- no hardcoded domain vocabulary
- expose `data-slot="metric-card"`
- keep value typography suitable for financial numbers

## 6. Commitment Progress

Create:

```text
packages/kit/src/commitment/commitment-progress.tsx
packages/kit/src/commitment/index.ts
```

Public API:

```ts
export type CommitmentProgressProps = {
  readonly committedAmount: EuroCents
  readonly targetAmount: EuroCents
  readonly investorCount: number
  readonly locale?: string
  readonly labels: {
    readonly title: string
    readonly committed: string
    readonly target: string
    readonly investors: string
  }
  readonly className?: string
}
```

Behavior:

- use `MoneyDisplay` for visible amounts
- render a semantic custom SVG donut or radial progress
- compute display percentage from minor units using `bigint` first
- avoid floating-point money arithmetic
- clamp visual progress to `0..100`
- expose `data-slot="commitment-progress"`

Allowed display-ratio algorithm:

```ts
const basisPoints = targetMinorUnits === 0n
  ? 0n
  : (committedMinorUnits * 10_000n) / targetMinorUnits

const cappedBasisPoints = basisPoints > 10_000n ? 10_000n : basisPoints
const percentage = Number(cappedBasisPoints) / 100
```

This is display-only. Do not add ratio helpers to `@repo/domain`.

## 7. SPV State Tracker

Create:

```text
packages/kit/src/spv/spv-state-tracker.tsx
packages/kit/src/spv/index.ts
```

Public API:

```ts
export type SpvStateTrackerProps = {
  readonly currentStatus: SpvStatus
  readonly labels: Record<SpvStatus, string>
  readonly className?: string
}
```

Behavior:

- render statuses in `SPV_STATUSES` order
- show completed, current, and pending states
- use `ts-pattern` where branching on `SpvStatus` is needed
- expose `data-slot="spv-state-tracker"`
- expose per-step `data-state="complete" | "current" | "pending"`

Do not duplicate the SPV status array locally.

## 8. Deal Terms Panel

Create:

```text
packages/kit/src/deal/deal-terms-panel.tsx
packages/kit/src/deal/index.ts
```

Public API:

```ts
export type DealTerm = {
  readonly id: string
  readonly label: string
  readonly value: ReactNode
  readonly description?: ReactNode
}

export type DealTermsPanelProps = {
  readonly title: string
  readonly terms: readonly DealTerm[]
  readonly className?: string
}
```

Behavior:

- render a compact term/value list
- preserve labels and values exactly as provided
- no internal product copy beyond structural markup
- expose `data-slot="deal-terms-panel"`

## 9. Investor Row

Create:

```text
packages/kit/src/investors/investor-row.tsx
packages/kit/src/investors/index.ts
```

Public API:

```ts
export type InvestorCommitmentStatus =
  | 'invited'
  | 'reviewing'
  | 'committed'
  | 'kyc_pending'
  | 'signed'
  | 'wired'

export type InvestorRowData = {
  readonly id: InvestorId
  readonly name: string
  readonly country: SupportedCountry
  readonly entityType: 'individual' | 'legal_entity'
  readonly qualificationType: QualificationType
  readonly status: InvestorCommitmentStatus
  readonly committedAmount: EuroCents
}

export type InvestorRowProps = {
  readonly investor: InvestorRowData
  readonly locale?: string
  readonly labels: {
    readonly expand: string
    readonly collapse: string
    readonly amount: string
    readonly country: string
    readonly entityType: string
    readonly qualification: string
    readonly status: Record<InvestorCommitmentStatus, string>
    readonly qualificationType: Record<QualificationType, string>
  }
  readonly className?: string
}
```

Behavior:

- render as a row-like disclosure component, not necessarily a literal `<tr>`
- use `MoneyDisplay` for committed amount
- use `AnimatePresence` and `motion` for disclosure mount/unmount
- toggle with a real button and `aria-expanded`
- expose `data-slot="investor-row"`
- expose `data-state="open" | "closed"`
- use semantic Tailwind tokens only

Do not fetch investor detail on expand. Expanded content is derived only from
props in this loop.

## 10. Dashboard Demo Block

Create:

```text
packages/kit/src/demo/deal-dashboard-demo.tsx
packages/kit/src/demo/index.ts
```

Purpose:

- prove the composed components work together
- provide a useful Storybook surface for visual review
- give future agents a stable target before app routes exist

Behavior:

- hardcode a small realistic demo dataset inside the demo module or story
- use existing domain constructors such as `euroCentsFromMinorUnits`
- assemble `MetricCard`, `CommitmentProgress`, `SpvStateTracker`,
  `InvestorRow`, and `DealTermsPanel`
- no network calls
- no app providers

The demo can include English labels. It is documentation, not a reusable
translation boundary.

## 11. Stories

Every component added in this loop needs a Storybook story under:

```text
packages/kit/src/**/*.stories.tsx
```

Stories should be grouped under `Kit/*`.

Required stories:

- `Kit/MoneyDisplay`
- `Kit/MetricCard`
- `Kit/CommitmentProgress`
- `Kit/SpvStateTracker`
- `Kit/DealTermsPanel`
- `Kit/InvestorRow`
- `Kit/DealDashboardDemo`

Do not import private story helpers from `@repo/ui` source paths. If story
layout helpers are useful, create local helpers in:

```text
packages/kit/src/stories/story-layout.tsx
```

## 12. Out Of Scope

Do not implement in this loop:

- React Hook Form commitment form
- Zod resolver integration
- TanStack Table
- TanStack Virtual
- Recharts
- D3
- XState
- app routes
- data fetching
- tRPC
- auth/session code
- visual regression/image snapshot infrastructure

These belong to later loops after the composed component foundation is stable.

## 13. Exports

Update `packages/kit/src/index.ts` to export all public components and types.

Focused subpath exports are optional in this loop. Root exports are required.

Remove the bootstrap placeholder component, test, and story.
