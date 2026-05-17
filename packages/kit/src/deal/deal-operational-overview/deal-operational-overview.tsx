'use client'

import { Badge, Button, cn, Skeleton } from '@repo/ui'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  CircleDotDashed,
  Clock3,
  FileCheck2,
  Landmark,
  ListChecks,
  UserRound,
} from 'lucide-react'
import { useId } from 'react'

import {
  getOperationalBlockerTotal,
  getOperationalProgressValue,
  getOperationalReadinessState,
} from './deal-operational-overview.model'
import type {
  DealOperationalActivityItem,
  DealOperationalActivityTone,
  DealOperationalBlocker,
  DealOperationalBlockerSeverity,
  DealOperationalCapitalSummary,
  DealOperationalMetric,
  DealOperationalMetricTone,
  DealOperationalOverviewLabels,
  DealOperationalOverviewProps,
  DealOperationalOverviewState,
  DealOperationalReadinessDimension,
  DealOperationalReadinessState,
  DealOperationalReadinessSummary,
} from './deal-operational-overview.types'

export type {
  DealOperationalActivityItem,
  DealOperationalActivityTone,
  DealOperationalBlocker,
  DealOperationalBlockerCount,
  DealOperationalBlockerSeverity,
  DealOperationalCapitalSummary,
  DealOperationalMetric,
  DealOperationalMetricTone,
  DealOperationalOverviewActionEvent,
  DealOperationalOverviewLabels,
  DealOperationalOverviewProps,
  DealOperationalOverviewState,
  DealOperationalProgress,
  DealOperationalReadinessDimension,
  DealOperationalReadinessState,
  DealOperationalReadinessSummary,
} from './deal-operational-overview.types'

const readinessToneClasses = {
  attention: 'border-status-attention-border bg-status-attention-muted text-status-attention',
  blocked: 'border-status-danger-border bg-status-danger-muted text-status-danger',
  notStarted: 'border-status-pending-border bg-status-pending-muted text-status-pending',
  ready: 'border-status-success-border bg-status-success-muted text-status-success',
} as const satisfies Record<DealOperationalReadinessState, string>

const severityToneClasses = {
  critical: 'border-status-danger-border bg-status-danger-muted text-status-danger',
  high: 'border-status-attention-border bg-status-attention-muted text-status-attention',
  low: 'border-border bg-muted text-muted-foreground',
  medium: 'border-status-info-border bg-status-info-muted text-status-info',
} as const satisfies Record<DealOperationalBlockerSeverity, string>

const metricToneClasses = {
  attention: 'text-status-attention',
  danger: 'text-status-danger',
  default: 'text-card-foreground',
  neutral: 'text-muted-foreground',
  success: 'text-status-success',
} as const satisfies Record<DealOperationalMetricTone, string>

const activityToneClasses = {
  attention: 'bg-status-attention',
  danger: 'bg-status-danger',
  info: 'bg-status-info',
  neutral: 'bg-muted-foreground',
  success: 'bg-status-success',
} as const satisfies Record<DealOperationalActivityTone, string>

export const DealOperationalOverview = ({
  className,
  labels,
  onAction,
  state,
}: DealOperationalOverviewProps) => {
  const titleId = useId()
  const readinessState = getOperationalReadinessState(state)

  return (
    <section
      aria-busy={state.kind === 'loading' ? true : undefined}
      aria-labelledby={titleId}
      className={cn(
        'w-full overflow-hidden rounded-lg border border-border/70 bg-card text-card-foreground shadow-card',
        className,
      )}
      data-blocker-count={state.kind === 'ready' ? state.blockers.length : undefined}
      data-readiness-state={readinessState}
      data-slot="deal-operational-overview"
      data-state={state.kind}
    >
      {state.kind === 'loading' ? (
        <LoadingContent label={state.label ?? labels.loadingLabel} titleId={titleId} />
      ) : null}
      {state.kind === 'error' ? (
        <ErrorContent onAction={onAction} state={state} titleId={titleId} />
      ) : null}
      {state.kind === 'empty' ? <EmptyContent state={state} titleId={titleId} /> : null}
      {state.kind === 'ready' ? (
        <ReadyContent labels={labels} state={state} titleId={titleId} />
      ) : null}
    </section>
  )
}

const LoadingContent = ({
  label,
  titleId,
}: {
  readonly label: string
  readonly titleId: string
}) => (
  <div className="grid gap-0" data-slot="deal-operational-loading">
    <div className="grid gap-2 border-b border-border/70 p-5">
      <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
        {label}
      </h2>
      <Skeleton className="h-4 w-full max-w-lg motion-reduce:animate-none" />
    </div>
    <div className="grid gap-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
      <div className="grid gap-4 p-5">
        <Skeleton className="h-6 w-48 motion-reduce:animate-none" />
        <Skeleton className="h-16 w-full motion-reduce:animate-none" />
        <div className="grid gap-2 sm:grid-cols-3">
          <Skeleton className="h-16 motion-reduce:animate-none" />
          <Skeleton className="h-16 motion-reduce:animate-none" />
          <Skeleton className="h-16 motion-reduce:animate-none" />
        </div>
      </div>
      <div className="grid gap-4 border-t border-border/70 p-5 lg:border-l lg:border-t-0">
        <Skeleton className="h-6 w-44 motion-reduce:animate-none" />
        <Skeleton className="h-10 w-64 max-w-full motion-reduce:animate-none" />
        <Skeleton className="h-2.5 w-full rounded-full motion-reduce:animate-none" />
        <Skeleton className="h-28 w-full motion-reduce:animate-none" />
      </div>
    </div>
  </div>
)

const ErrorContent = ({
  onAction,
  state,
  titleId,
}: {
  readonly onAction: DealOperationalOverviewProps['onAction']
  readonly state: Extract<DealOperationalOverviewState, { readonly kind: 'error' }>
  readonly titleId: string
}) => (
  <div className="grid gap-4 p-5" data-slot="deal-operational-error">
    <div className="flex items-start gap-3">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-status-danger" />
      <div className="grid gap-1">
        <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
          {state.title}
        </h2>
        {state.description ? (
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{state.description}</p>
        ) : null}
      </div>
    </div>
    {state.retryLabel ? (
      <Button className="w-fit" onClick={() => onAction?.({ kind: 'retry' })} variant="outline">
        {state.retryLabel}
      </Button>
    ) : null}
  </div>
)

const EmptyContent = ({
  state,
  titleId,
}: {
  readonly state: Extract<DealOperationalOverviewState, { readonly kind: 'empty' }>
  readonly titleId: string
}) => (
  <div className="grid gap-2 p-5" data-slot="deal-operational-empty">
    <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
      {state.title}
    </h2>
    {state.description ? (
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{state.description}</p>
    ) : null}
  </div>
)

const ReadyContent = ({
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

const ReadinessSection = ({
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

  if (state === 'ready') {
    return <CheckCircle2 aria-hidden="true" className={className} />
  }

  if (state === 'blocked') {
    return <AlertTriangle aria-hidden="true" className={className} />
  }

  if (state === 'attention') {
    return <CircleAlert aria-hidden="true" className={className} />
  }

  return <CircleDotDashed aria-hidden="true" className={className} />
}

const getDimensionTone = (state: DealOperationalReadinessState): DealOperationalMetricTone => {
  if (state === 'ready') {
    return 'success'
  }

  if (state === 'blocked') {
    return 'danger'
  }

  if (state === 'attention') {
    return 'attention'
  }

  return 'neutral'
}

const CapitalSection = ({
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

const BlockersSection = ({
  blockers,
  labels,
  summary,
}: {
  readonly blockers: readonly DealOperationalBlocker[]
  readonly labels: DealOperationalOverviewLabels
  readonly summary: string
}) => {
  const sectionId = useId()

  return (
    <section
      aria-labelledby={sectionId}
      className="grid content-start gap-4 p-5"
      data-slot="deal-operational-blockers"
    >
      <div className="grid gap-1">
        <h3 className="text-sm font-semibold text-card-foreground" id={sectionId}>
          {labels.blockersTitle}
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">{summary}</p>
      </div>
      {blockers.length > 0 ? (
        <ol className="grid gap-2">
          {blockers.map((blocker) => (
            <BlockerItem blocker={blocker} key={blocker.id} />
          ))}
        </ol>
      ) : (
        <p
          className="rounded-md border border-status-success-border bg-status-success-muted px-3 py-2 text-sm text-status-success"
          data-slot="deal-operational-no-blockers"
        >
          {labels.noBlockersLabel}
        </p>
      )}
    </section>
  )
}

const BlockerItem = ({ blocker }: { readonly blocker: DealOperationalBlocker }) => (
  <li>
    <article
      className="grid gap-3 rounded-md border border-border/70 bg-background/60 px-3 py-3"
      data-blocker-id={blocker.id}
      data-severity={blocker.severity}
      data-slot="deal-operational-blocker"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h4 className="text-sm font-semibold text-card-foreground">{blocker.title}</h4>
          <p className="text-sm leading-6 text-muted-foreground">{blocker.description}</p>
        </div>
        <Badge
          className={cn('justify-start', severityToneClasses[blocker.severity])}
          data-severity={blocker.severity}
          variant="outline"
        >
          {blocker.severityLabel}
        </Badge>
      </div>
      <dl className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
        <BlockerFact icon="owner" label="Owner" value={blocker.owner} />
        <BlockerFact icon="surface" label="Surface" value={blocker.surfaceLabel} />
        {blocker.investorCountLabel ? (
          <BlockerFact icon="investors" label="Investors" value={blocker.investorCountLabel} />
        ) : null}
        {blocker.documentCountLabel ? (
          <BlockerFact icon="documents" label="Documents" value={blocker.documentCountLabel} />
        ) : null}
        {blocker.dueLabel ? <BlockerFact icon="due" label="Due" value={blocker.dueLabel} /> : null}
      </dl>
    </article>
  </li>
)

const BlockerFact = ({
  icon,
  label,
  value,
}: {
  readonly icon: 'documents' | 'due' | 'investors' | 'owner' | 'surface'
  readonly label: string
  readonly value: string
}) => (
  <div className="flex min-w-0 items-center gap-2">
    <BlockerFactIcon icon={icon} />
    <dt className="sr-only">{label}</dt>
    <dd className="min-w-0 truncate">{value}</dd>
  </div>
)

const BlockerFactIcon = ({
  icon,
}: {
  readonly icon: 'documents' | 'due' | 'investors' | 'owner' | 'surface'
}) => {
  if (icon === 'owner') {
    return <UserRound aria-hidden="true" className="size-3.5 shrink-0" />
  }

  if (icon === 'surface') {
    return <ListChecks aria-hidden="true" className="size-3.5 shrink-0" />
  }

  if (icon === 'documents') {
    return <FileCheck2 aria-hidden="true" className="size-3.5 shrink-0" />
  }

  if (icon === 'due') {
    return <Clock3 aria-hidden="true" className="size-3.5 shrink-0" />
  }

  return <Landmark aria-hidden="true" className="size-3.5 shrink-0" />
}

const ActivitySection = ({
  activity,
  labels,
}: {
  readonly activity: readonly DealOperationalActivityItem[]
  readonly labels: DealOperationalOverviewLabels
}) => {
  const sectionId = useId()

  return (
    <section
      aria-labelledby={sectionId}
      className="grid content-start gap-4 border-t border-border/70 p-5 lg:border-l lg:border-t-0"
      data-slot="deal-operational-activity"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-card-foreground" id={sectionId}>
          {labels.activityTitle}
        </h3>
        <Activity aria-hidden="true" className="size-4 text-muted-foreground" />
      </div>
      {activity.length > 0 ? (
        <ol className="grid gap-3">
          {activity.map((item) => (
            <ActivityItem item={item} key={item.id} />
          ))}
        </ol>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">{labels.noActivityLabel}</p>
      )}
    </section>
  )
}

const ActivityItem = ({ item }: { readonly item: DealOperationalActivityItem }) => (
  <li
    className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"
    data-slot="deal-operational-activity-item"
  >
    <span
      aria-hidden="true"
      className={cn('mt-2 size-2 rounded-full', activityToneClasses[item.tone ?? 'neutral'])}
    />
    <div className="grid gap-1">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span className="font-medium text-card-foreground">{item.actor}</span>
        <time dateTime={item.dateTime}>{item.timestampLabel}</time>
        {item.typeLabel ? (
          <Badge className="border-border bg-muted text-muted-foreground" variant="outline">
            {item.typeLabel}
          </Badge>
        ) : null}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
    </div>
  </li>
)
