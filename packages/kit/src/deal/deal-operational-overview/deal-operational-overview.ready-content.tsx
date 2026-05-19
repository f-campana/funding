import { Badge, cn } from '@repo/ui'

import { ActivitySection } from './deal-operational-overview.activity-section'
import { BlockersSection } from './deal-operational-overview.blockers-section'
import { CapitalSection } from './deal-operational-overview.capital-section'
import { getOperationalBlockerSummary } from './deal-operational-overview.model'
import { ReadinessSection } from './deal-operational-overview.readiness-section'
import { readinessToneClasses } from './deal-operational-overview.styles'
import type {
  DealOperationalOverviewGridProps,
  DealOperationalOverviewHeaderProps,
  DealOperationalOverviewReadyContentProps,
} from './deal-operational-overview.types'

export const DealOperationalOverviewReadyContent = ({
  labels,
  state,
  titleId,
}: DealOperationalOverviewReadyContentProps) => (
  <>
    <DealOperationalOverviewHeader labels={labels} readiness={state.readiness} titleId={titleId} />
    <DealOperationalOverviewPrimaryGrid>
      <ReadinessSection labels={labels} readiness={state.readiness} />
      <CapitalSection capital={state.capital} labels={labels} />
    </DealOperationalOverviewPrimaryGrid>
    <DealOperationalOverviewSecondaryGrid>
      <BlockersSection
        blockers={state.blockers}
        labels={labels}
        summary={getOperationalBlockerSummary(state.readiness)}
      />
      <ActivitySection activity={state.activity} labels={labels} />
    </DealOperationalOverviewSecondaryGrid>
  </>
)

export const DealOperationalOverviewHeader = ({
  labels,
  readiness,
  subtitle,
  title,
  titleId,
}: DealOperationalOverviewHeaderProps) => (
  <header
    className="flex flex-col gap-3 border-b border-border/70 p-5 sm:flex-row sm:items-start sm:justify-between"
    data-slot="deal-operational-header"
  >
    <div className="grid gap-1">
      <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
        {title ?? labels?.title}
      </h2>
      {(subtitle ?? labels?.subtitle) ? (
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {subtitle ?? labels?.subtitle}
        </p>
      ) : null}
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

export const DealOperationalOverviewPrimaryGrid = ({
  children,
}: DealOperationalOverviewGridProps) => (
  <div className="grid gap-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">{children}</div>
)

export const DealOperationalOverviewSecondaryGrid = ({
  children,
}: DealOperationalOverviewGridProps) => (
  <div className="grid gap-0 border-t border-border/70 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
    {children}
  </div>
)
