import type { StatusTone } from '@repo/domain'

export type DealProgressStage =
  | 'draft'
  | 'moderation'
  | 'open'
  | 'preClosing'
  | 'closing'
  | 'invested'
  | 'completed'
  | 'exited'
  | 'canceled'

export type DealProgressMode =
  | 'collectingCommitments'
  | 'openForInterests'
  | 'ongoingClosing'
  | 'standardClosing'
  | 'contracting'
  | 'readyToClose'
  | 'closed'

export type DealProgressVisibility =
  | { readonly kind: 'adminOnly'; readonly label: string }
  | { readonly kind: 'restricted'; readonly label: string }
  | { readonly kind: 'public'; readonly label: string }
  | { readonly kind: 'readonly'; readonly label: string }

export type DealProgressActionKind =
  | 'invite'
  | 'moveToContracting'
  | 'closeDeal'
  | 'openForInterests'
  | 'retry'

export type DealProgressActionAudience = 'all' | 'admin'

export type DealProgressAction = {
  readonly kind: DealProgressActionKind
  readonly label: string
  readonly disabledReason?: string | undefined
  readonly audience?: DealProgressActionAudience | undefined
}

export type DealProgressActions = {
  readonly primary?: DealProgressAction | undefined
  readonly secondary?: readonly DealProgressAction[] | undefined
}

export type DealProgressActionEvent = {
  readonly kind: DealProgressActionKind
}

export type DealProgressStatus = {
  readonly label: string
  readonly tone: StatusTone
}

export type DealProgressVisualProgress =
  | {
      readonly kind: 'knownTarget'
      readonly basisPoints: number
      readonly label: string
      readonly capped?: boolean | undefined
    }
  | {
      readonly kind: 'noTarget'
      readonly label: string
    }

export type DealProgressSegmentKind = 'investable' | 'entryFees' | 'spvFees'

export type DealProgressSegmentTone = 'success' | 'info' | 'attention' | 'neutral'

export type DealProgressSegment = {
  readonly kind: DealProgressSegmentKind
  readonly label: string
  readonly amountLabel: string
  readonly basisPoints: number
  readonly tone: DealProgressSegmentTone
}

export type NormalizedDealProgressSegment = DealProgressSegment & {
  readonly visualBasisPoints: number
}

export type DealProgressMetricTone = 'default' | 'attention' | 'danger' | 'neutral'

export type DealProgressMetric = {
  readonly label: string
  readonly value: string
  readonly description?: string | undefined
  readonly tone?: DealProgressMetricTone | undefined
}

export type DealProgressCapitalSummary = {
  readonly amountRaisedLabel: string
  readonly targetAmountLabel?: string | undefined
  readonly headlineLabel: string
  readonly progress: DealProgressVisualProgress
  readonly breakdown?: readonly DealProgressSegment[] | undefined
  readonly details?: readonly DealProgressMetric[] | undefined
}

export type DealProgressDataQuality =
  | {
      readonly kind: 'fresh'
      readonly label?: string | undefined
    }
  | {
      readonly kind: 'stale'
      readonly label: string
      readonly description?: string | undefined
    }
  | {
      readonly kind: 'issue'
      readonly label: string
      readonly description?: string | undefined
    }
  | {
      readonly kind: 'unavailable'
      readonly label: string
      readonly description?: string | undefined
    }

export type DealProgressPanelState =
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
      readonly kind: 'ready'
      readonly stage: DealProgressStage
      readonly mode: DealProgressMode
      readonly status: DealProgressStatus
      readonly visibility?: DealProgressVisibility | undefined
      readonly capital: DealProgressCapitalSummary
      readonly actions: DealProgressActions
      readonly dataQuality?: DealProgressDataQuality | undefined
    }

export type DealProgressPanelProps = {
  readonly state: DealProgressPanelState
  readonly labels: {
    readonly title: string
    readonly progressAriaLabel: string
  }
  readonly onAction?: (event: DealProgressActionEvent) => void
  readonly className?: string
}
