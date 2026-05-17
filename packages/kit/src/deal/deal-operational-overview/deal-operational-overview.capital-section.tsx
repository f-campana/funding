import { cn } from '@repo/ui'
import { useId } from 'react'

import { getOperationalProgressValue } from './deal-operational-overview.model'
import { metricToneClasses } from './deal-operational-overview.styles'
import type {
  DealOperationalCapitalSummary,
  DealOperationalMetric,
  DealOperationalOverviewLabels,
} from './deal-operational-overview.types'

export const CapitalSection = ({
  capital,
  labels,
}: {
  readonly capital: DealOperationalCapitalSummary
  readonly labels: DealOperationalOverviewLabels
}) => {
  const sectionId = useId()
  const progressValue = getOperationalProgressValue(capital.progress)

  return (
    <section
      aria-labelledby={sectionId}
      className="grid content-start gap-5 border-t border-border/70 p-5 lg:border-l lg:border-t-0"
      data-slot="deal-operational-capital"
    >
      <div className="grid gap-3">
        <div className="grid gap-1">
          <h3 className="text-sm font-semibold text-card-foreground" id={sectionId}>
            {labels.capitalTitle}
          </h3>
          <p className="break-words font-mono text-3xl font-semibold leading-tight tabular-nums text-card-foreground">
            {capital.headlineLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
          <span>{capital.targetLabel}</span>
          <span aria-hidden="true">/</span>
          <span>{capital.matchedLabel}</span>
          {capital.supportingLabel ? (
            <>
              <span aria-hidden="true">/</span>
              <span>{capital.supportingLabel}</span>
            </>
          ) : null}
        </div>
        <ProgressBar
          ariaLabel={labels.capitalProgressAriaLabel}
          label={capital.progress.label}
          value={progressValue}
        />
      </div>

      <MetricList label={labels.capitalMetricsTitle} metrics={capital.metrics} slot="metrics" />
      <MetricList
        label={labels.capitalEconomicsTitle}
        metrics={capital.economics}
        slot="economics"
      />
    </section>
  )
}

const ProgressBar = ({
  ariaLabel,
  label,
  value,
}: {
  readonly ariaLabel: string
  readonly label: string
  readonly value: number
}) => (
  <div className="grid gap-1.5" data-slot="deal-operational-progress">
    <div
      aria-label={ariaLabel}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={value}
      aria-valuetext={label}
      className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted"
      data-progress-value={value}
      data-slot="deal-operational-progress-bar"
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-command-progress transition-[width] motion-reduce:transition-none"
        data-slot="deal-operational-progress-indicator"
        style={{ width: `${value}%` }}
      />
    </div>
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
  </div>
)

const MetricList = ({
  label,
  metrics,
  slot,
}: {
  readonly label: string
  readonly metrics: readonly DealOperationalMetric[]
  readonly slot: 'metrics' | 'economics'
}) => {
  if (metrics.length === 0) {
    return null
  }

  return (
    <div className="grid gap-2" data-slot={`deal-operational-capital-${slot}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <dl className="grid gap-0 overflow-hidden rounded-md border border-border/70">
        {metrics.map((metric) => (
          <MetricRow key={metric.label} metric={metric} />
        ))}
      </dl>
    </div>
  )
}

const MetricRow = ({ metric }: { readonly metric: DealOperationalMetric }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-b border-border/70 px-3 py-2.5 last:border-b-0">
    <dt className="text-sm text-muted-foreground">{metric.label}</dt>
    <dd
      className={cn(
        'font-mono text-sm font-semibold tabular-nums',
        metricToneClasses[metric.tone ?? 'default'],
      )}
    >
      {metric.value}
    </dd>
    {metric.description ? (
      <dd className="col-span-2 text-xs leading-5 text-muted-foreground">{metric.description}</dd>
    ) : null}
  </div>
)
