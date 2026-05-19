'use client'

import { cn } from '@repo/ui'
import { type ReactNode, useId } from 'react'
import { match } from 'ts-pattern'

import { ActionButton as DealProgressPanelActionButton } from './deal-progress-panel.actions'
import { CapitalProgress as DealProgressPanelCapital } from './deal-progress-panel.capital'
import { DataQualityNotice as DealProgressPanelDataQuality } from './deal-progress-panel.data-quality'
import {
  ErrorContent as DealProgressPanelError,
  LoadingContent as DealProgressPanelLoading,
} from './deal-progress-panel.lifecycle-content'
import { getPanelVisualState } from './deal-progress-panel.model'
import {
  DealProgressPanelActions,
  DealProgressPanelHeader,
  DealProgressPanelReadyContent,
} from './deal-progress-panel.ready-content'
import type {
  DealProgressPanelProps,
  DealProgressPanelRootProps,
} from './deal-progress-panel.types'

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
  DealProgressLoadingState,
  DealProgressMetric,
  DealProgressMetricTone,
  DealProgressMode,
  DealProgressNoActions,
  DealProgressPanelActionProps,
  DealProgressPanelActionsProps,
  DealProgressPanelCapitalProps,
  DealProgressPanelDataQualityProps,
  DealProgressPanelErrorProps,
  DealProgressPanelHeaderProps,
  DealProgressPanelLabels,
  DealProgressPanelLoadingProps,
  DealProgressPanelProps,
  DealProgressPanelReadyContentProps,
  DealProgressPanelRootProps,
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

export {
  DealProgressPanelActionButton,
  DealProgressPanelActions,
  DealProgressPanelCapital,
  DealProgressPanelDataQuality,
  DealProgressPanelError,
  DealProgressPanelHeader,
  DealProgressPanelLoading,
  DealProgressPanelReadyContent,
}

export const DealProgressPanelRoot = ({
  busy,
  children,
  className,
  state,
  ...sectionProps
}: DealProgressPanelRootProps) => {
  const visualState = state ? getPanelVisualState(state) : undefined

  return (
    <section
      {...sectionProps}
      aria-busy={busy ?? (state?.kind === 'loading' ? true : undefined)}
      className={cn(
        'grid h-fit w-full max-w-[26rem] gap-5 self-start rounded-xl border border-command-border bg-command p-5 text-command-foreground shadow-popover',
        className,
      )}
      data-mode={state?.kind === 'ready' ? state.mode : undefined}
      data-slot="deal-progress-panel"
      data-stage={state?.kind === 'ready' ? state.stage : undefined}
      data-state={state?.kind}
      data-visual-state={visualState}
    >
      {children}
    </section>
  )
}

const DealProgressPanelView = ({
  className,
  labels,
  locale,
  onAction,
  state,
}: DealProgressPanelProps) => {
  const titleId = useId()
  const content = match(state)
    .returnType<ReactNode>()
    .with({ kind: 'loading' }, (loadingState) => (
      <DealProgressPanelLoading label={loadingState.label ?? labels.title} titleId={titleId} />
    ))
    .with({ kind: 'error' }, (errorState) => (
      <DealProgressPanelError onAction={onAction} state={errorState} titleId={titleId} />
    ))
    .with({ kind: 'ready' }, (readyState) => (
      <DealProgressPanelReadyContent
        labels={labels}
        locale={locale}
        onAction={onAction}
        state={readyState}
        titleId={titleId}
      />
    ))
    .exhaustive()

  return (
    <DealProgressPanelRoot aria-labelledby={titleId} className={className} state={state}>
      {content}
    </DealProgressPanelRoot>
  )
}

export const DealProgressPanel = Object.assign(DealProgressPanelView, {
  Action: DealProgressPanelActionButton,
  Actions: DealProgressPanelActions,
  Capital: DealProgressPanelCapital,
  DataQuality: DealProgressPanelDataQuality,
  Error: DealProgressPanelError,
  Header: DealProgressPanelHeader,
  Loading: DealProgressPanelLoading,
  Ready: DealProgressPanelReadyContent,
  Root: DealProgressPanelRoot,
})
