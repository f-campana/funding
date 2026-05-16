import { DealProgressPanel } from '@repo/kit'

import type { DealOperationsRouteData } from './data'
import {
  formatDateTimeLabel,
  formatMoney,
  getReadinessLabel,
  mapDealProgressPanelProps,
} from './deal-operational-adapters'

type DealOperationalRailProps = {
  readonly data: DealOperationsRouteData
}

export function DealOperationalRail({ data }: DealOperationalRailProps) {
  return (
    <aside
      aria-label="Deal operational rail"
      className="grid content-start gap-3 lg:sticky lg:top-5"
      data-slot="deal-operational-rail"
    >
      <DealProgressPanel {...mapDealProgressPanelProps(data)} className="max-w-none" />

      <section className="rounded-lg border border-border bg-background p-4 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Operational snapshot</h2>
        <div className="mt-3 grid gap-2 text-sm">
          <RailMetric label="Readiness" value={getReadinessLabel(data.rail.readinessState)} />
          <RailMetric label="Target close" value={formatDateTimeLabel(data.rail.targetCloseDate)} />
          <RailMetric
            label={data.rail.capitalCallout.label}
            value={formatMoney(data.rail.capitalCallout.value)}
          />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-background p-4 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Exception queue</h2>
        <div className="mt-3 grid gap-2 text-sm">
          <RailMetric label="Critical blockers" value={String(data.rail.criticalBlockerCount)} />
          <RailMetric label="Warning blockers" value={String(data.rail.warningBlockerCount)} />
          <RailMetric label="Document issues" value={String(data.rail.documentIssueCount)} />
          <RailMetric label="Blocked investors" value={String(data.rail.investorsBlockedCount)} />
        </div>
      </section>
    </aside>
  )
}

const RailMetric = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <div className="flex items-baseline justify-between gap-3 rounded-md border border-border bg-muted/45 px-3 py-2">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{value}</span>
  </div>
)
