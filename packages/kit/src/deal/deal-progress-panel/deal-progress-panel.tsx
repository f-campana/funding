'use client'

import { Badge, Button, cn, Skeleton } from '@repo/ui'
import { AlertCircle, Eye } from 'lucide-react'
import { useId } from 'react'

import { statusToneClasses } from '../../status/status-tone'
import {
  getActionDisabledReason,
  getPanelVisualState,
  getPrimaryAction,
  getProgressAriaValueText,
  getProgressBarValue,
  getSecondaryActions,
  isActionDisabled,
  normalizeSegments,
} from './deal-progress-panel.model'
import type {
  DealProgressAction,
  DealProgressDataQuality,
  DealProgressMetric,
  DealProgressPanelProps,
  DealProgressPanelState,
  DealProgressSegmentTone,
} from './deal-progress-panel.types'

const segmentToneClasses = {
  attention: 'bg-status-attention-border',
  info: 'bg-status-info-border',
  neutral: 'bg-muted-foreground/40',
  success: 'bg-status-success-border',
} as const satisfies Record<DealProgressSegmentTone, string>

const metricToneClasses = {
  attention: 'text-status-attention',
  danger: 'text-status-danger',
  default: 'text-background',
  neutral: 'text-background/80',
} as const satisfies Record<NonNullable<DealProgressMetric['tone']>, string>

const dataQualityClasses = {
  fresh: 'border-background/15 bg-background/10 text-background/70',
  issue: 'border-status-danger-border/60 bg-status-danger-muted text-status-danger',
  stale: 'border-status-attention-border/60 bg-status-attention-muted text-status-attention',
  unavailable: 'border-background/15 bg-background/10 text-background/70',
} as const satisfies Record<DealProgressDataQuality['kind'], string>

export type {
  DealProgressAction,
  DealProgressActionAudience,
  DealProgressActionEvent,
  DealProgressActionKind,
  DealProgressActions,
  DealProgressCapitalSummary,
  DealProgressDataQuality,
  DealProgressMetric,
  DealProgressMetricTone,
  DealProgressMode,
  DealProgressPanelProps,
  DealProgressPanelState,
  DealProgressSegment,
  DealProgressSegmentKind,
  DealProgressSegmentTone,
  DealProgressStage,
  DealProgressStatus,
  DealProgressVisibility,
  DealProgressVisualProgress,
  NormalizedDealProgressSegment,
} from './deal-progress-panel.types'

export const DealProgressPanel = ({
  className,
  labels,
  onAction,
  state,
}: DealProgressPanelProps) => {
  const titleId = useId()
  const visualState = getPanelVisualState(state)

  return (
    <section
      aria-busy={state.kind === 'loading' ? true : undefined}
      aria-labelledby={titleId}
      className={cn(
        'grid w-full max-w-[26rem] gap-5 rounded-xl border border-foreground/15 bg-foreground p-5 text-background shadow-card',
        className,
      )}
      data-mode={state.kind === 'ready' ? state.mode : undefined}
      data-slot="deal-progress-panel"
      data-stage={state.kind === 'ready' ? state.stage : undefined}
      data-state={state.kind}
      data-visual-state={visualState}
    >
      {state.kind === 'loading' ? (
        <LoadingContent label={state.label ?? labels.title} titleId={titleId} />
      ) : null}
      {state.kind === 'error' ? (
        <ErrorContent onAction={onAction} state={state} titleId={titleId} />
      ) : null}
      {state.kind === 'ready' ? (
        <ReadyContent labels={labels} onAction={onAction} state={state} titleId={titleId} />
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
  <>
    <div className="flex items-start justify-between gap-3" data-slot="deal-progress-header">
      <h2 className="text-sm font-semibold text-background" id={titleId}>
        {label}
      </h2>
      <Skeleton className="h-7 w-24 bg-background/15 motion-reduce:animate-none" />
    </div>
    <div className="grid gap-4" data-slot="deal-progress-loading">
      <Skeleton className="h-5 w-40 bg-background/15 motion-reduce:animate-none" />
      <Skeleton className="h-10 w-64 bg-background/15 motion-reduce:animate-none" />
      <Skeleton className="h-2.5 w-full rounded-full bg-background/15 motion-reduce:animate-none" />
      <div className="grid gap-2">
        <Skeleton className="h-9 w-full bg-background/15 motion-reduce:animate-none" />
        <Skeleton className="h-9 w-full bg-background/15 motion-reduce:animate-none" />
      </div>
    </div>
  </>
)

const ErrorContent = ({
  onAction,
  state,
  titleId,
}: {
  readonly onAction: DealProgressPanelProps['onAction']
  readonly state: Extract<DealProgressPanelState, { readonly kind: 'error' }>
  readonly titleId: string
}) => (
  <>
    <div className="grid gap-2" data-slot="deal-progress-header">
      <h2 className="text-sm font-semibold text-background" id={titleId}>
        {state.title}
      </h2>
      {state.description ? (
        <p className="text-sm leading-6 text-background/70">{state.description}</p>
      ) : null}
    </div>
    {state.retryLabel ? (
      <Button
        className="w-full focus-visible:ring-background focus-visible:ring-offset-foreground"
        data-slot="deal-progress-action"
        onClick={() => onAction?.({ kind: 'retry' })}
        variant="default"
      >
        {state.retryLabel}
      </Button>
    ) : null}
  </>
)

const ReadyContent = ({
  labels,
  onAction,
  state,
  titleId,
}: {
  readonly labels: DealProgressPanelProps['labels']
  readonly onAction: DealProgressPanelProps['onAction']
  readonly state: Extract<DealProgressPanelState, { readonly kind: 'ready' }>
  readonly titleId: string
}) => {
  const primaryAction = getPrimaryAction(state)
  const secondaryActions = getSecondaryActions(state)
  const visibleActions = [primaryAction, ...secondaryActions].filter(
    (action): action is DealProgressAction => action !== undefined,
  )
  const disabledReasonId = useId()
  const firstDisabledReason = visibleActions
    .map((action) => getActionDisabledReason(action))
    .find(Boolean)

  return (
    <>
      <div className="flex items-start justify-between gap-3" data-slot="deal-progress-header">
        <div className="grid gap-2">
          <h2 className="text-sm font-semibold text-background" id={titleId}>
            {labels.title}
          </h2>
          {state.visibility ? <VisibilityNote visibility={state.visibility} /> : null}
        </div>
        <Badge
          className={cn(
            'max-w-[12rem] justify-start truncate',
            statusToneClasses[state.status.tone],
          )}
          data-slot="deal-progress-status"
          variant="outline"
        >
          {state.status.label}
        </Badge>
      </div>

      <div className="grid gap-3" data-slot="deal-progress-capital">
        <div className="grid gap-1">
          <p className="break-words font-mono text-3xl font-semibold leading-tight tabular-nums text-background">
            {state.capital.headlineLabel}
          </p>
          <p className="text-xs font-medium text-background/65">{state.capital.progress.label}</p>
        </div>
        <ProgressBar labels={labels} progress={state.capital.progress} />
        <ProgressLegend segments={state.capital.breakdown} />
      </div>

      {state.capital.details && state.capital.details.length > 0 ? (
        <dl
          className="grid gap-0 overflow-hidden rounded-md border border-background/15"
          data-slot="deal-progress-details"
        >
          {state.capital.details.map((metric) => (
            <ProgressMetric key={metric.label} metric={metric} />
          ))}
        </dl>
      ) : null}

      {state.dataQuality && state.dataQuality.kind !== 'fresh' ? (
        <DataQualityNotice dataQuality={state.dataQuality} />
      ) : null}

      {visibleActions.length > 0 ? (
        <div className="grid gap-2" data-slot="deal-progress-actions">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {primaryAction ? (
              <ActionButton
                action={primaryAction}
                describedById={disabledReasonId}
                onAction={onAction}
                primary={true}
              />
            ) : null}
            {secondaryActions.map((action) => (
              <ActionButton
                action={action}
                describedById={disabledReasonId}
                key={action.kind}
                onAction={onAction}
              />
            ))}
          </div>
          {firstDisabledReason ? (
            <p
              className="rounded-md border border-background/15 bg-background/10 px-3 py-2 text-xs leading-5 text-background/75"
              data-slot="deal-progress-disabled-reason"
              id={disabledReasonId}
            >
              {firstDisabledReason}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

const VisibilityNote = ({
  visibility,
}: {
  readonly visibility: Extract<DealProgressPanelState, { readonly kind: 'ready' }>['visibility']
}) => (
  <p
    className="flex min-w-0 items-center gap-2 text-sm leading-5 text-background/70"
    data-slot="deal-progress-visibility"
  >
    <Eye aria-hidden="true" className="size-4 shrink-0" />
    <span className="min-w-0 truncate">{visibility?.label}</span>
  </p>
)

const ProgressBar = ({
  labels,
  progress,
}: {
  readonly labels: DealProgressPanelProps['labels']
  readonly progress: Extract<
    DealProgressPanelState,
    { readonly kind: 'ready' }
  >['capital']['progress']
}) => {
  const value = getProgressBarValue(progress)
  const ariaValueText = getProgressAriaValueText(progress)

  return (
    <div
      aria-label={labels.progressAriaLabel}
      aria-valuemax={progress.kind === 'knownTarget' ? 100 : undefined}
      aria-valuemin={progress.kind === 'knownTarget' ? 0 : undefined}
      aria-valuenow={value ?? undefined}
      aria-valuetext={ariaValueText}
      className="relative h-2.5 w-full overflow-hidden rounded-full bg-background/20"
      data-capped={progress.kind === 'knownTarget' ? progress.capped === true : undefined}
      data-slot="deal-progress-bar"
      role="progressbar"
    >
      {progress.kind === 'knownTarget' ? (
        <div
          className="h-full rounded-full bg-status-success-border transition-[width] motion-reduce:transition-none"
          data-slot="deal-progress-indicator"
          style={{ width: `${value ?? 0}%` }}
        />
      ) : null}
    </div>
  )
}

const ProgressLegend = ({
  segments,
}: {
  readonly segments: Extract<
    DealProgressPanelState,
    { readonly kind: 'ready' }
  >['capital']['breakdown']
}) => {
  const normalizedSegments = normalizeSegments(segments)

  if (normalizedSegments.length === 0) {
    return null
  }

  return (
    <div className="grid gap-2" data-slot="deal-progress-segments">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-background/20">
        {normalizedSegments.map((segment) => (
          <span
            aria-hidden="true"
            className={cn('h-full', segmentToneClasses[segment.tone])}
            data-segment-kind={segment.kind}
            data-slot="deal-progress-segment"
            key={segment.kind}
            style={{ width: `${segment.visualBasisPoints / 100}%` }}
          />
        ))}
      </div>
      <ul className="grid gap-1 text-xs text-background/70">
        {normalizedSegments.map((segment) => (
          <li className="flex min-w-0 items-center justify-between gap-3" key={segment.kind}>
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className={cn('size-2.5 shrink-0 rounded-full', segmentToneClasses[segment.tone])}
              />
              <span className="min-w-0 truncate">{segment.label}</span>
            </span>
            <span className="shrink-0 font-mono tabular-nums text-background">
              {segment.amountLabel}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ProgressMetric = ({ metric }: { readonly metric: DealProgressMetric }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-b border-background/15 px-3 py-2.5 last:border-b-0">
    <dt className="text-sm text-background/65">{metric.label}</dt>
    <dd
      className={cn(
        'font-mono text-sm font-semibold tabular-nums',
        metricToneClasses[metric.tone ?? 'default'],
      )}
    >
      {metric.value}
    </dd>
    {metric.description ? (
      <dd className="col-span-2 text-xs leading-5 text-background/55">{metric.description}</dd>
    ) : null}
  </div>
)

const DataQualityNotice = ({
  dataQuality,
}: {
  readonly dataQuality: Exclude<DealProgressDataQuality, { readonly kind: 'fresh' }>
}) => (
  <div
    className={cn(
      'flex items-start gap-2 rounded-md border px-3 py-2 text-xs leading-5',
      dataQualityClasses[dataQuality.kind],
    )}
    data-slot="deal-progress-data-quality"
    data-state={dataQuality.kind}
  >
    <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
    <div className="grid gap-0.5">
      <p className="font-medium">{dataQuality.label}</p>
      {dataQuality.description ? <p>{dataQuality.description}</p> : null}
    </div>
  </div>
)

const ActionButton = ({
  action,
  describedById,
  onAction,
  primary = false,
}: {
  readonly action: DealProgressAction
  readonly describedById: string
  readonly onAction: DealProgressPanelProps['onAction']
  readonly primary?: boolean
}) => {
  const disabled = isActionDisabled(action)

  return (
    <Button
      className={cn(
        'min-w-0 focus-visible:ring-background focus-visible:ring-offset-foreground',
        primary
          ? 'w-full'
          : 'w-full border-background/15 bg-background/10 text-background hover:bg-background/15',
      )}
      aria-describedby={disabled ? describedById : undefined}
      data-action-kind={action.kind}
      data-slot="deal-progress-action"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onAction?.({ kind: action.kind })
        }
      }}
      variant={primary ? 'default' : 'outline'}
    >
      <span className="min-w-0 truncate">{action.label}</span>
    </Button>
  )
}
