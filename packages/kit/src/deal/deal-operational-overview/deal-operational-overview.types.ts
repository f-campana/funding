export type DealOperationalReadinessState = 'ready' | 'attention' | 'blocked' | 'notStarted'

export type DealOperationalBlockerSeverity = 'critical' | 'high' | 'medium' | 'low'

export type DealOperationalMetricTone = 'default' | 'success' | 'attention' | 'danger' | 'neutral'

export type DealOperationalActivityTone = 'neutral' | 'success' | 'attention' | 'danger' | 'info'

export type DealOperationalReadinessDimension = {
  readonly id: string
  readonly label: string
  readonly state: DealOperationalReadinessState
  readonly blockerCount: number
  readonly description?: string | undefined
}

export type DealOperationalBlockerCount = {
  readonly severity: DealOperationalBlockerSeverity
  readonly label: string
  readonly count: number
}

export type DealOperationalReadinessSummary = {
  readonly state: DealOperationalReadinessState
  readonly label: string
  readonly nextAction: string
  readonly blockerCounts: readonly DealOperationalBlockerCount[]
  readonly dimensions: readonly DealOperationalReadinessDimension[]
}

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

export type DealOperationalOverviewState =
  | {
      readonly kind: 'loading'
      readonly label?: string | undefined
    }
  | {
      readonly kind: 'error'
      readonly title: string
      readonly description?: string | undefined
      readonly retryLabel?: string | undefined
    }
  | {
      readonly kind: 'empty'
      readonly title: string
      readonly description?: string | undefined
    }
  | {
      readonly kind: 'ready'
      readonly readiness: DealOperationalReadinessSummary
      readonly capital: DealOperationalCapitalSummary
      readonly blockerSummary: string
      readonly blockers: readonly DealOperationalBlocker[]
      readonly activity: readonly DealOperationalActivityItem[]
    }

export type DealOperationalOverviewActionEvent = {
  readonly kind: 'retry'
}

export type DealOperationalOverviewLabels = {
  readonly title: string
  readonly subtitle: string
  readonly readinessTitle: string
  readonly nextActionLabel: string
  readonly blockerCountsLabel: string
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

export type DealOperationalOverviewProps = {
  readonly state: DealOperationalOverviewState
  readonly labels: DealOperationalOverviewLabels
  readonly className?: string | undefined
  readonly onAction?: (event: DealOperationalOverviewActionEvent) => void
}
