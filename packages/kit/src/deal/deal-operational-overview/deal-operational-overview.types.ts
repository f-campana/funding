import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export type DealOperationalReadinessState = 'ready' | 'attention' | 'blocked' | 'not_started'

export type DealOperationalBlockerSeverity = 'critical' | 'warning' | 'info'

export type DealOperationalMetricTone = 'default' | 'success' | 'attention' | 'danger' | 'neutral'

export type DealOperationalActivityTone = 'neutral' | 'success' | 'attention' | 'danger' | 'info'

export type DealOperationalReadinessDimension<
  State extends DealOperationalReadinessState = DealOperationalReadinessState,
> = State extends DealOperationalReadinessState
  ? {
      readonly id: string
      readonly label: string
      readonly state: State
      readonly blockerCount: number
      readonly description?: string | undefined
    }
  : never

export type DealOperationalBlockerCount = {
  readonly severity: DealOperationalBlockerSeverity
  readonly label: string
  readonly count: number
}

export type DealOperationalReadinessSummary<
  State extends DealOperationalReadinessState = DealOperationalReadinessState,
> = State extends DealOperationalReadinessState
  ? {
      readonly state: State
      readonly label: string
      readonly nextAction: string
      readonly blockerCounts: readonly DealOperationalBlockerCount[]
      readonly dimensions: readonly DealOperationalReadinessDimension[]
    }
  : never

export type DealOperationalProgress = {
  readonly value: number
  readonly label: string
}

export type DealOperationalMetric = {
  readonly label: string
  readonly value: string
  readonly description?: string | undefined
  readonly tone?: DealOperationalMetricTone | undefined
}

export type DealOperationalCapitalSummary = {
  readonly headlineLabel: string
  readonly targetLabel: string
  readonly matchedLabel: string
  readonly supportingLabel?: string | undefined
  readonly progress: DealOperationalProgress
  readonly metrics: readonly DealOperationalMetric[]
  readonly economics: readonly DealOperationalMetric[]
}

export type DealOperationalBlocker = {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly severity: DealOperationalBlockerSeverity
  readonly severityLabel: string
  readonly owner: string
  readonly surfaceLabel: string
  readonly investorCountLabel?: string | undefined
  readonly documentCountLabel?: string | undefined
  readonly dueLabel?: string | undefined
}

export type DealOperationalActivityItem = {
  readonly id: string
  readonly actor: string
  readonly timestampLabel: string
  readonly dateTime: string
  readonly summary: string
  readonly typeLabel?: string | undefined
  readonly tone?: DealOperationalActivityTone | undefined
}

export type DealOperationalOverviewReadyState = {
  readonly kind: 'ready'
  readonly readiness: DealOperationalReadinessSummary
  readonly capital: DealOperationalCapitalSummary
  readonly blockers: readonly DealOperationalBlocker[]
  readonly activity: readonly DealOperationalActivityItem[]
}

export type DealOperationalOverviewState =
  | {
      readonly kind: 'loading'
      readonly label?: string | undefined
    }
  | DealOperationalOverviewErrorState
  | {
      readonly kind: 'empty'
      readonly title: string
      readonly description?: string | undefined
    }
  | DealOperationalOverviewReadyState

export type DealOperationalOverviewActionEvent = {
  readonly kind: 'retry'
}

export type DealOperationalOverviewActionHandler = (
  event: DealOperationalOverviewActionEvent,
) => void

export type DealOperationalOverviewRetryAction = {
  readonly kind: 'retry'
  readonly label: string
}

export type DealOperationalOverviewErrorState =
  | {
      readonly kind: 'error'
      readonly title: string
      readonly description?: string | undefined
      readonly retryAction?: undefined
    }
  | {
      readonly kind: 'error'
      readonly title: string
      readonly description?: string | undefined
      readonly retryAction: DealOperationalOverviewRetryAction
    }

export type DealOperationalOverviewLabels = {
  readonly title: string
  readonly subtitle: string
  readonly readinessTitle: string
  readonly nextActionLabel: string
  readonly blockerCountsLabel: string
  readonly blockerDocumentsLabel: string
  readonly blockerDueLabel: string
  readonly blockerInvestorsLabel: string
  readonly blockerOwnerLabel: string
  readonly blockerSurfaceLabel: string
  readonly dimensionsTitle: string
  readonly capitalTitle: string
  readonly capitalProgressAriaLabel: string
  readonly capitalMetricsTitle: string
  readonly capitalEconomicsTitle: string
  readonly blockersTitle: string
  readonly activityTitle: string
  readonly noBlockersLabel: string
  readonly noActivityLabel: string
  readonly loadingLabel: string
}

export type DealOperationalOverviewRootProps = ComponentPropsWithoutRef<'section'> & {
  readonly busy?: boolean | undefined
  readonly state?: DealOperationalOverviewState | undefined
}

export type DealOperationalOverviewReadyContentProps = {
  readonly labels: DealOperationalOverviewLabels
  readonly state: DealOperationalOverviewReadyState
  readonly titleId: string
}

export type DealOperationalOverviewHeaderProps = {
  readonly labels?: DealOperationalOverviewLabels | undefined
  readonly readiness: DealOperationalReadinessSummary
  readonly subtitle?: ReactNode | undefined
  readonly title?: ReactNode | undefined
  readonly titleId: string
}

export type DealOperationalOverviewGridProps = {
  readonly children: ReactNode
}

export type DealOperationalOverviewLoadingProps = {
  readonly label: ReactNode
  readonly titleId: string
}

export type DealOperationalOverviewErrorProps = {
  readonly onAction?: DealOperationalOverviewActionHandler | undefined
  readonly state: DealOperationalOverviewErrorState
  readonly titleId: string
}

export type DealOperationalOverviewEmptyProps = {
  readonly state: Extract<DealOperationalOverviewState, { readonly kind: 'empty' }>
  readonly titleId: string
}

type DealOperationalOverviewPropsBase = {
  readonly labels: DealOperationalOverviewLabels
  readonly className?: string | undefined
}

type DealOperationalOverviewRetryableState = Extract<
  DealOperationalOverviewState,
  { readonly kind: 'error'; readonly retryAction: DealOperationalOverviewRetryAction }
>

type DealOperationalOverviewNonRetryableState = Exclude<
  DealOperationalOverviewState,
  DealOperationalOverviewRetryableState
>

export type DealOperationalOverviewProps =
  | (DealOperationalOverviewPropsBase & {
      readonly state: DealOperationalOverviewRetryableState
      readonly onAction: DealOperationalOverviewActionHandler
    })
  | (DealOperationalOverviewPropsBase & {
      readonly state: DealOperationalOverviewNonRetryableState
      readonly onAction?: DealOperationalOverviewActionHandler | undefined
    })
  | (DealOperationalOverviewPropsBase & {
      readonly state: DealOperationalOverviewState
      readonly onAction: DealOperationalOverviewActionHandler
    })
