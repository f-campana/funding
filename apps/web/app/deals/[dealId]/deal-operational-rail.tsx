'use client'

import { DealProgressPanel, type DealProgressPanelProps } from '@repo/kit'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import type { DealOperationsRouteData } from './data'
import {
  getDealOperationalRailViewModel,
  mapDealProgressPanelProps,
} from './deal-operational-adapters'

type DealOperationalRailProps = {
  readonly data: DealOperationsRouteData
}

type DealProgressActionHandler = NonNullable<DealProgressPanelProps['onAction']>

export function DealOperationalRail({ data }: DealOperationalRailProps) {
  const router = useRouter()
  const rail = getDealOperationalRailViewModel(data)
  const handleProgressAction = useCallback<DealProgressActionHandler>(
    (event) => {
      if (event.kind === 'retry') {
        router.refresh()
        return
      }

      if (event.kind === 'invite' || event.kind === 'openForInterests') {
        router.push(`/deals/${data.deal.slug}/commitments`)
        return
      }

      router.push(`/deals/${data.deal.slug}/documents`)
    },
    [data.deal.slug, router],
  )

  return (
    <aside
      aria-label="Deal operational rail"
      className="grid content-start gap-3 lg:sticky lg:top-5"
      data-slot="deal-operational-rail"
    >
      <DealProgressPanel
        {...mapDealProgressPanelProps(data, handleProgressAction)}
        className="max-w-none"
      />

      <section className="rounded-lg border border-border bg-background p-4 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Operational snapshot</h2>
        <div className="mt-3 grid gap-2 text-sm">
          <RailMetric label="Readiness" value={rail.readinessLabel} />
          <RailMetric label="Target close" value={rail.targetCloseDateLabel} />
          <RailMetric label={rail.capitalCalloutLabel} value={rail.capitalCalloutValueLabel} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-background p-4 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Exception queue</h2>
        <div className="mt-3 grid gap-2 text-sm">
          <RailMetric label="Critical blockers" value={rail.criticalBlockerCountLabel} />
          <RailMetric label="Warning blockers" value={rail.warningBlockerCountLabel} />
          <RailMetric label="Document issues" value={rail.documentIssueCountLabel} />
          <RailMetric label="Blocked investors" value={rail.blockedInvestorCountLabel} />
        </div>
      </section>
    </aside>
  )
}

const RailMetric = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <div className="flex items-end justify-between gap-3 rounded-md border border-border bg-muted/45 px-3 py-2">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{value}</span>
  </div>
)
