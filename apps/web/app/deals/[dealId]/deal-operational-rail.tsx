import type { DealOperationsRouteData } from './data'

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
      <section className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-card">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          Current state
        </p>
        <h2 className="mt-2 text-sm font-semibold text-foreground">Workspace status</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.deal.description}</p>
      </section>

      <section className="rounded-lg border border-border bg-background p-4 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Cleanup scope</h2>
        <div className="mt-3 grid gap-2 text-sm">
          <RailMetric label="Runtime kit imports" value="Removed" />
          <RailMetric label="Fixture dependency" value="Removed" />
          <RailMetric label="Live data" value="Deferred" />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-background p-4 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Next rebuild pass</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Deal commitments and progress baselines stay Storybook-first until the app-owned adapter
          is defined.
        </p>
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
