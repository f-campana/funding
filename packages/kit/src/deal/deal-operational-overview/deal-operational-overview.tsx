'use client'

import { cn } from '@repo/ui'
import { type ReactNode, useId } from 'react'
import { match } from 'ts-pattern'

import { EmptyContent, ErrorContent, LoadingContent } from './deal-operational-overview.lifecycle'
import {
  getOperationalBlockerTotal,
  getOperationalReadinessState,
} from './deal-operational-overview.model'
import { ReadyContent } from './deal-operational-overview.ready-content'
import type { DealOperationalOverviewProps } from './deal-operational-overview.types'

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
  DealOperationalOverviewActionHandler,
  DealOperationalOverviewErrorState,
  DealOperationalOverviewLabels,
  DealOperationalOverviewProps,
  DealOperationalOverviewRetryAction,
  DealOperationalOverviewState,
  DealOperationalProgress,
  DealOperationalReadinessDimension,
  DealOperationalReadinessState,
  DealOperationalReadinessSummary,
} from './deal-operational-overview.types'

export const DealOperationalOverview = ({
  className,
  labels,
  onAction,
  state,
}: DealOperationalOverviewProps) => {
  const titleId = useId()
  const readinessState = getOperationalReadinessState(state)
  const content = match(state)
    .returnType<ReactNode>()
    .with({ kind: 'loading' }, (loadingState) => (
      <LoadingContent label={loadingState.label ?? labels.loadingLabel} titleId={titleId} />
    ))
    .with({ kind: 'error' }, (errorState) => (
      <ErrorContent onAction={onAction} state={errorState} titleId={titleId} />
    ))
    .with({ kind: 'empty' }, (emptyState) => <EmptyContent state={emptyState} titleId={titleId} />)
    .with({ kind: 'ready' }, (readyState) => (
      <ReadyContent labels={labels} state={readyState} titleId={titleId} />
    ))
    .exhaustive()

  return (
    <section
      aria-busy={state.kind === 'loading' ? true : undefined}
      aria-labelledby={titleId}
      className={cn(
        'w-full overflow-hidden rounded-lg border border-border/70 bg-card text-card-foreground shadow-card',
        className,
      )}
      data-readiness-state={readinessState}
      data-slot="deal-operational-overview"
      data-state={state.kind}
      data-total-blocker-count={
        state.kind === 'ready'
          ? getOperationalBlockerTotal(state.readiness.blockerCounts)
          : undefined
      }
      data-visible-blocker-count={state.kind === 'ready' ? state.blockers.length : undefined}
    >
      {content}
    </section>
  )
}
