import { Badge, cn } from '@repo/ui'
import { AlertTriangle, CheckCircle2, CircleAlert, CircleDotDashed } from 'lucide-react'
import { type ReactNode, useId } from 'react'
import { match } from 'ts-pattern'

import { getOperationalBlockerTotal } from './deal-operational-overview.model'
import {
  metricToneClasses,
  readinessToneClasses,
  severityToneClasses,
} from './deal-operational-overview.styles'
import type {
  DealOperationalMetricTone,
  DealOperationalOverviewLabels,
  DealOperationalReadinessDimension,
  DealOperationalReadinessState,
  DealOperationalReadinessSummary,
} from './deal-operational-overview.types'

export const ReadinessSection = ({
  labels,
  readiness,
}: {
  readonly labels: DealOperationalOverviewLabels
  readonly readiness: DealOperationalReadinessSummary
}) => {
  const sectionId = useId()
  const dimensionsId = useId()
  const blockerTotal = getOperationalBlockerTotal(readiness.blockerCounts)

  return (
    <section
      aria-labelledby={sectionId}
      className="grid content-start gap-5 p-5"
      data-readiness-state={readiness.state}
      data-slot="deal-operational-readiness"
    >
      <div className="grid gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <h3 className="text-sm font-semibold text-card-foreground" id={sectionId}>
              {labels.readinessTitle}
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              <span className="font-medium text-card-foreground">{labels.nextActionLabel}: </span>
              {readiness.nextAction}
            </p>
          </div>
          <Badge className={readinessToneClasses[readiness.state]} variant="outline">
            {blockerTotal}
          </Badge>
        </div>
        <dl
          aria-label={labels.blockerCountsLabel}
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          data-slot="deal-operational-blocker-counts"
        >
          {readiness.blockerCounts.map((count) => (
            <div
              className={cn('rounded-md border px-3 py-2', severityToneClasses[count.severity])}
              data-severity={count.severity}
              data-slot="deal-operational-blocker-count"
              key={count.severity}
            >
              <dt className="text-xs font-medium">{count.label}</dt>
              <dd className="font-mono text-xl font-semibold tabular-nums">{count.count}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-3">
        <h4
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          id={dimensionsId}
        >
          {labels.dimensionsTitle}
        </h4>
        <ul
          aria-labelledby={dimensionsId}
          className="grid gap-2"
          data-slot="deal-operational-dimensions"
        >
          {readiness.dimensions.map((dimension) => (
            <DimensionItem dimension={dimension} key={dimension.id} />
          ))}
        </ul>
      </div>
    </section>
  )
}

const DimensionItem = ({
  dimension,
}: {
  readonly dimension: DealOperationalReadinessDimension
}) => (
  <li
    className="grid gap-1 rounded-md border border-border/70 bg-background/60 px-3 py-2.5"
    data-dimension-id={dimension.id}
    data-slot="deal-operational-dimension"
    data-state={dimension.state}
  >
    <div className="flex min-w-0 items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <DimensionIcon state={dimension.state} />
        <span className="min-w-0 truncate text-sm font-medium text-card-foreground">
          {dimension.label}
        </span>
      </span>
      <Badge className={readinessToneClasses[dimension.state]} variant="outline">
        {dimension.blockerCount}
      </Badge>
    </div>
    {dimension.description ? (
      <p className="text-xs leading-5 text-muted-foreground">{dimension.description}</p>
    ) : null}
  </li>
)

const DimensionIcon = ({ state }: { readonly state: DealOperationalReadinessState }) => {
  const className = cn('size-4 shrink-0', metricToneClasses[getDimensionTone(state)])

  return match(state)
    .returnType<ReactNode>()
    .with('ready', () => <CheckCircle2 aria-hidden="true" className={className} />)
    .with('blocked', () => <AlertTriangle aria-hidden="true" className={className} />)
    .with('attention', () => <CircleAlert aria-hidden="true" className={className} />)
    .with('not_started', () => <CircleDotDashed aria-hidden="true" className={className} />)
    .exhaustive()
}

const dimensionToneByState = {
  attention: 'attention',
  blocked: 'danger',
  not_started: 'neutral',
  ready: 'success',
} as const satisfies Record<DealOperationalReadinessState, DealOperationalMetricTone>

const getDimensionTone = (state: DealOperationalReadinessState): DealOperationalMetricTone =>
  dimensionToneByState[state]
