'use client'

import { cn } from '@repo/ui'
import { type ReactNode, useId } from 'react'
import { match } from 'ts-pattern'

import { ErrorContent, LoadingContent } from './deal-progress-panel.lifecycle-content'
import { getPanelVisualState } from './deal-progress-panel.model'
import { ReadyContent } from './deal-progress-panel.ready-content'
import type { DealProgressPanelProps } from './deal-progress-panel.types'

export type {
  DealProgressAction,
  DealProgressActionAudience,
  DealProgressActionEvent,
  DealProgressActionHandler,
  DealProgressActionKind,
  DealProgressActions,
  DealProgressAvailableActions,
  DealProgressCapitalSummary,
  DealProgressDataQuality,
  DealProgressErrorState,
  DealProgressMetric,
  DealProgressMetricTone,
  DealProgressMode,
  DealProgressNoActions,
  DealProgressPanelLabels,
  DealProgressPanelProps,
  DealProgressPanelState,
  DealProgressReadyState,
  DealProgressRetryAction,
  DealProgressSegment,
  DealProgressSegmentKind,
  DealProgressSegmentTone,
  DealProgressStage,
  DealProgressStatus,
  DealProgressVisibility,
  DealProgressVisualProgress,
  DealProgressWorkflowActionKind,
} from './deal-progress-panel.types'

export const DealProgressPanel = ({
  className,
  labels,
  locale,
  onAction,
  state,
}: DealProgressPanelProps) => {
  const titleId = useId()
  const visualState = getPanelVisualState(state)
  const content = match(state)
    .returnType<ReactNode>()
    .with({ kind: 'loading' }, (loadingState) => (
      <LoadingContent label={loadingState.label ?? labels.title} titleId={titleId} />
    ))
    .with({ kind: 'error' }, (errorState) => (
      <ErrorContent onAction={onAction} state={errorState} titleId={titleId} />
    ))
    .with({ kind: 'ready' }, (readyState) => (
      <ReadyContent
        labels={labels}
        locale={locale}
        onAction={onAction}
        state={readyState}
        titleId={titleId}
      />
    ))
    .exhaustive()

  return (
    <section
      aria-busy={state.kind === 'loading' ? true : undefined}
      aria-labelledby={titleId}
      className={cn(
        'grid h-fit w-full max-w-[26rem] gap-5 self-start rounded-xl border border-command-border bg-command p-5 text-command-foreground shadow-popover',
        className,
      )}
      data-mode={state.kind === 'ready' ? state.mode : undefined}
      data-slot="deal-progress-panel"
      data-stage={state.kind === 'ready' ? state.stage : undefined}
      data-state={state.kind}
      data-visual-state={visualState}
    >
      {content}
    </section>
  )
}
