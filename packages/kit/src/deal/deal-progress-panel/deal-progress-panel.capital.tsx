import { cn } from '@repo/ui'

import {
  getProgressAriaValueText,
  getProgressBarValue,
  normalizeCompositionSegments,
  normalizeSegments,
} from './deal-progress-panel.model'
import { getSegmentClassName, metricToneClasses } from './deal-progress-panel.styles'
import type {
  DealProgressMetric,
  DealProgressPanelLabels,
  DealProgressReadyState,
} from './deal-progress-panel.types'

export const CapitalProgress = ({
  capital,
  labels,
  locale,
}: {
  readonly capital: DealProgressReadyState['capital']
  readonly labels: DealProgressPanelLabels
  readonly locale?: string | undefined
}) => (
  <>
    <div className="grid gap-3" data-slot="deal-progress-capital">
      <div className="grid gap-1">
        <p className="break-words font-mono text-3xl font-semibold leading-tight tabular-nums text-command-foreground">
          {capital.headlineLabel}
        </p>
        <p className="text-xs font-medium text-command-foreground/65">{capital.progress.label}</p>
      </div>
      <ProgressBar labels={labels} locale={locale} progress={capital.progress} />
      <CapitalBreakdown labels={labels} segments={capital.breakdown} />
    </div>

    {capital.details && capital.details.length > 0 ? (
      <dl
        className="grid gap-0 overflow-hidden rounded-md border border-command-border"
        data-slot="deal-progress-details"
      >
        {capital.details.map((metric) => (
          <ProgressMetric key={metric.label} metric={metric} />
        ))}
      </dl>
    ) : null}
  </>
)

const ProgressBar = ({
  labels,
  locale,
  progress,
}: {
  readonly labels: DealProgressPanelLabels
  readonly locale?: string | undefined
  readonly progress: DealProgressReadyState['capital']['progress']
}) => {
  const value = getProgressBarValue(progress)
  const ariaValueText = getProgressAriaValueText({
    cappedLabel: labels.progressCappedLabel,
    locale,
    progress,
  })

  return (
    <div
      aria-label={labels.progressAriaLabel}
      aria-valuemax={progress.kind === 'knownTarget' ? 100 : undefined}
      aria-valuemin={progress.kind === 'knownTarget' ? 0 : undefined}
      aria-valuenow={value ?? undefined}
      aria-valuetext={ariaValueText}
      className="relative h-2.5 w-full overflow-hidden rounded-full bg-command-progress-muted"
      data-capped={progress.kind === 'knownTarget' ? progress.capped === true : undefined}
      data-slot="deal-progress-bar"
      role="progressbar"
    >
      {progress.kind === 'knownTarget' ? (
        <div
          className="h-full rounded-full bg-command-progress transition-[width] motion-reduce:transition-none"
          data-slot="deal-progress-indicator"
          style={{ width: `${value ?? 0}%` }}
        />
      ) : null}
    </div>
  )
}

const CapitalBreakdown = ({
  labels,
  segments,
}: {
  readonly labels: DealProgressPanelLabels
  readonly segments: DealProgressReadyState['capital']['breakdown']
}) => {
  const breakdownSegments = normalizeSegments(segments)
  const compositionSegments = normalizeCompositionSegments(segments)

  if (breakdownSegments.length === 0) {
    return null
  }

  return (
    <div className="grid gap-2.5" data-slot="deal-progress-breakdown">
      <div className="grid gap-1.5">
        <p className="text-xs font-medium text-command-foreground/65">
          {labels.capitalCompositionLabel}
        </p>
        <div
          aria-hidden="true"
          className="rounded-md border border-command-border bg-command-muted p-1"
          data-slot="deal-capital-composition"
        >
          <div className="flex h-2 overflow-hidden rounded-sm bg-command-progress-muted/60">
            {compositionSegments.map((segment) => (
              <span
                className={cn('h-full', getSegmentClassName(segment))}
                data-segment-kind={segment.kind}
                data-slot="deal-capital-composition-segment"
                data-visual-basis-points={segment.visualBasisPoints}
                key={segment.kind}
                style={{ width: `${segment.visualBasisPoints / 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-1.5">
        <p className="text-xs font-medium text-command-foreground/65">
          {labels.capitalBreakdownLabel}
        </p>
        <ul className="grid gap-1 text-xs text-command-foreground/70">
          {breakdownSegments.map((segment) => (
            <li className="flex min-w-0 items-center justify-between gap-3" key={segment.kind}>
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn('size-2.5 shrink-0 rounded-full', getSegmentClassName(segment))}
                  data-segment-kind={segment.kind}
                  data-slot="deal-progress-segment-marker"
                />
                <span className="min-w-0 truncate">{segment.label}</span>
              </span>
              <span className="shrink-0 font-mono tabular-nums text-command-foreground">
                {segment.amountLabel}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const ProgressMetric = ({ metric }: { readonly metric: DealProgressMetric }) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-b border-command-border px-3 py-2.5 last:border-b-0">
    <dt className="text-sm text-command-foreground/65">{metric.label}</dt>
    <dd
      className={cn(
        'font-mono text-sm font-semibold tabular-nums',
        metricToneClasses[metric.tone ?? 'default'],
      )}
    >
      {metric.value}
    </dd>
    {metric.description ? (
      <dd className="col-span-2 text-xs leading-5 text-command-foreground/55">
        {metric.description}
      </dd>
    ) : null}
  </div>
)
