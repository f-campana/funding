import { Badge, cn } from '@repo/ui'

import { ActivitySection } from './deal-operational-overview.activity-section'
import { BlockersSection } from './deal-operational-overview.blockers-section'
import { CapitalSection } from './deal-operational-overview.capital-section'
import { ReadinessSection } from './deal-operational-overview.readiness-section'
import { readinessToneClasses } from './deal-operational-overview.styles'
import type {
  DealOperationalOverviewLabels,
  DealOperationalOverviewState,
  DealOperationalReadinessSummary,
} from './deal-operational-overview.types'

export const ReadyContent = ({
  labels,
  state,
  titleId,
}: {
  readonly labels: DealOperationalOverviewLabels
  readonly state: Extract<DealOperationalOverviewState, { readonly kind: 'ready' }>
  readonly titleId: string
}) => (
  <>
    <OverviewHeader labels={labels} readiness={state.readiness} titleId={titleId} />
    <div className="grid gap-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
      <ReadinessSection labels={labels} readiness={state.readiness} />
      <CapitalSection capital={state.capital} labels={labels} />
    </div>
    <div className="grid gap-0 border-t border-border/70 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
      <BlockersSection blockers={state.blockers} labels={labels} summary={state.blockerSummary} />
      <ActivitySection activity={state.activity} labels={labels} />
    </div>
  </>
)

const OverviewHeader = ({
  labels,
  readiness,
  titleId,
}: {
  readonly labels: DealOperationalOverviewLabels
  readonly readiness: DealOperationalReadinessSummary
  readonly titleId: string
}) => (
  <header
    className="flex flex-col gap-3 border-b border-border/70 p-5 sm:flex-row sm:items-start sm:justify-between"
    data-slot="deal-operational-header"
  >
    <div className="grid gap-1">
      <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
        {labels.title}
      </h2>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{labels.subtitle}</p>
    </div>
    <Badge
      className={cn('max-w-full justify-start', readinessToneClasses[readiness.state])}
      data-readiness-state={readiness.state}
      data-slot="deal-operational-readiness-status"
      variant="outline"
    >
      {readiness.label}
    </Badge>
  </header>
)
