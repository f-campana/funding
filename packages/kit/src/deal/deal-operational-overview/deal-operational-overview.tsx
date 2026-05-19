'use client'

import { cn } from '@repo/ui'
import { type ReactNode, useId } from 'react'
import { match } from 'ts-pattern'

import { ActivitySection as DealOperationalOverviewActivity } from './deal-operational-overview.activity-section'
import { BlockersSection as DealOperationalOverviewBlockers } from './deal-operational-overview.blockers-section'
import { CapitalSection as DealOperationalOverviewCapital } from './deal-operational-overview.capital-section'
import {
  EmptyContent as DealOperationalOverviewEmpty,
  ErrorContent as DealOperationalOverviewError,
  LoadingContent as DealOperationalOverviewLoading,
} from './deal-operational-overview.lifecycle'
import {
  getOperationalBlockerTotal,
  getOperationalReadinessState,
} from './deal-operational-overview.model'
import { ReadinessSection as DealOperationalOverviewReadiness } from './deal-operational-overview.readiness-section'
import {
  DealOperationalOverviewHeader,
  DealOperationalOverviewPrimaryGrid,
  DealOperationalOverviewReadyContent,
  DealOperationalOverviewSecondaryGrid,
} from './deal-operational-overview.ready-content'
import type {
  DealOperationalOverviewProps,
  DealOperationalOverviewRootProps,
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
  DealOperationalOverviewActionHandler,
  DealOperationalOverviewEmptyProps,
  DealOperationalOverviewErrorProps,
  DealOperationalOverviewErrorState,
  DealOperationalOverviewGridProps,
  DealOperationalOverviewHeaderProps,
  DealOperationalOverviewLabels,
  DealOperationalOverviewLoadingProps,
  DealOperationalOverviewProps,
  DealOperationalOverviewReadyContentProps,
  DealOperationalOverviewReadyState,
  DealOperationalOverviewRetryAction,
  DealOperationalOverviewRootProps,
  DealOperationalOverviewState,
  DealOperationalProgress,
  DealOperationalReadinessDimension,
  DealOperationalReadinessState,
  DealOperationalReadinessSummary,
} from './deal-operational-overview.types'

export {
  DealOperationalOverviewActivity,
  DealOperationalOverviewBlockers,
  DealOperationalOverviewCapital,
  DealOperationalOverviewEmpty,
  DealOperationalOverviewError,
  DealOperationalOverviewHeader,
  DealOperationalOverviewLoading,
  DealOperationalOverviewPrimaryGrid,
  DealOperationalOverviewReadiness,
  DealOperationalOverviewReadyContent,
  DealOperationalOverviewSecondaryGrid,
}

export const DealOperationalOverviewRoot = ({
  busy,
  children,
  className,
  state,
  ...sectionProps
}: DealOperationalOverviewRootProps) => (
  <section
    {...sectionProps}
    aria-busy={busy ?? (state?.kind === 'loading' ? true : undefined)}
    className={cn(
      'w-full overflow-hidden rounded-lg border border-border/70 bg-card text-card-foreground shadow-card',
      className,
    )}
    data-readiness-state={state ? getOperationalReadinessState(state) : undefined}
    data-slot="deal-operational-overview"
    data-state={state?.kind}
    data-total-blocker-count={
      state?.kind === 'ready'
        ? getOperationalBlockerTotal(state.readiness.blockerCounts)
        : undefined
    }
    data-visible-blocker-count={state?.kind === 'ready' ? state.blockers.length : undefined}
  >
    {children}
  </section>
)

const DealOperationalOverviewView = ({
  className,
  labels,
  onAction,
  state,
}: DealOperationalOverviewProps) => {
  const titleId = useId()
  const content = match(state)
    .returnType<ReactNode>()
    .with({ kind: 'loading' }, (loadingState) => (
      <DealOperationalOverviewLoading
        label={loadingState.label ?? labels.loadingLabel}
        titleId={titleId}
      />
    ))
    .with({ kind: 'error' }, (errorState) => (
      <DealOperationalOverviewError onAction={onAction} state={errorState} titleId={titleId} />
    ))
    .with({ kind: 'empty' }, (emptyState) => (
      <DealOperationalOverviewEmpty state={emptyState} titleId={titleId} />
    ))
    .with({ kind: 'ready' }, (readyState) => (
      <DealOperationalOverviewReadyContent labels={labels} state={readyState} titleId={titleId} />
    ))
    .exhaustive()

  return (
    <DealOperationalOverviewRoot aria-labelledby={titleId} className={className} state={state}>
      {content}
    </DealOperationalOverviewRoot>
  )
}

export const DealOperationalOverview = Object.assign(DealOperationalOverviewView, {
  Activity: DealOperationalOverviewActivity,
  Blockers: DealOperationalOverviewBlockers,
  Capital: DealOperationalOverviewCapital,
  Empty: DealOperationalOverviewEmpty,
  Error: DealOperationalOverviewError,
  Header: DealOperationalOverviewHeader,
  Loading: DealOperationalOverviewLoading,
  PrimaryGrid: DealOperationalOverviewPrimaryGrid,
  Readiness: DealOperationalOverviewReadiness,
  Ready: DealOperationalOverviewReadyContent,
  Root: DealOperationalOverviewRoot,
  SecondaryGrid: DealOperationalOverviewSecondaryGrid,
})
