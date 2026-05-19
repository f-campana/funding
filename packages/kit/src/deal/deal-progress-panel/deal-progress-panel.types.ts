import type { StatusTone } from '@repo/domain'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

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

export type DealProgressWorkflowActionKind =
  | 'invite'
  | 'moveToContracting'
  | 'closeDeal'
  | 'openForInterests'

export type DealProgressActionKind = DealProgressWorkflowActionKind | 'retry'

export type DealProgressActionAudience = 'all' | 'admin'

type DealProgressActionAvailability =
  | {
      readonly availability: 'enabled'
    }
  | {
      readonly availability: 'disabled'
      readonly disabledReason: string
    }

type DealProgressWorkflowAction<K extends DealProgressWorkflowActionKind> = {
  readonly kind: K
  readonly label: string
  readonly audience: DealProgressActionAudience
} & DealProgressActionAvailability

export type DealProgressAction =
  | DealProgressWorkflowAction<'invite'>
  | DealProgressWorkflowAction<'moveToContracting'>
  | DealProgressWorkflowAction<'closeDeal'>
  | DealProgressWorkflowAction<'openForInterests'>

export type DealProgressNoActions = {
  readonly kind: 'none'
}

export type DealProgressAvailableActions = {
  readonly kind: 'available'
  readonly primary: DealProgressAction
  readonly secondary?: readonly DealProgressAction[] | undefined
}

export type DealProgressActions = DealProgressNoActions | DealProgressAvailableActions

export type DealProgressActionEvent =
  | {
      readonly kind: DealProgressWorkflowActionKind
    }
  | {
      readonly kind: 'retry'
    }

export type DealProgressRetryAction = {
  readonly kind: 'retry'
  readonly label: string
}

export type DealProgressStatusKind =
  | Exclude<DealProgressMode, 'closed'>
  | 'draft'
  | 'moderation'
  | 'invested'
  | 'completed'
  | 'exited'
  | 'canceled'

type DealProgressStatusValue<K extends DealProgressStatusKind> = {
  readonly kind: K
  readonly label: string
  readonly tone: StatusTone
}

export type DealProgressStatus = {
  readonly [K in DealProgressStatusKind]: DealProgressStatusValue<K>
}[DealProgressStatusKind]

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

export type DealProgressMetricTone = 'default' | 'attention' | 'danger' | 'neutral'

export type DealProgressMetric = {
  readonly label: string
  readonly value: string
  readonly description?: string | undefined
  readonly tone?: DealProgressMetricTone | undefined
}

export type DealProgressCapitalSummary = {
  readonly headlineLabel: string
  readonly progress: DealProgressVisualProgress
  readonly breakdown?: readonly DealProgressSegment[] | undefined
  readonly details?: readonly DealProgressMetric[] | undefined
}

export type DealProgressDataQuality =
  | {
      readonly kind: 'fresh'
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

type DealProgressReadyBase = {
  readonly kind: 'ready'
  readonly capital: DealProgressCapitalSummary
  readonly dataQuality: DealProgressDataQuality
}

type DealProgressActionableVisibility = Exclude<
  DealProgressVisibility,
  { readonly kind: 'readonly' }
>

type DealProgressReadyActionContext =
  | {
      readonly visibility?: DealProgressActionableVisibility | undefined
      readonly actions: DealProgressAvailableActions
    }
  | {
      readonly visibility?: DealProgressActionableVisibility | undefined
      readonly actions: DealProgressNoActions
    }
  | {
      readonly visibility: Extract<DealProgressVisibility, { readonly kind: 'readonly' }>
      readonly actions: DealProgressNoActions
    }

type DealProgressDraftWorkflow = {
  readonly stage: 'draft'
  readonly mode: 'openForInterests'
  readonly status: Extract<DealProgressStatus, { readonly kind: 'draft' }>
}

type DealProgressModerationWorkflow = {
  readonly stage: 'moderation'
  readonly mode: 'openForInterests'
  readonly status: Extract<DealProgressStatus, { readonly kind: 'moderation' }>
}

type DealProgressOpenForInterestsWorkflow = {
  readonly stage: 'open'
  readonly mode: 'openForInterests'
  readonly status: Extract<DealProgressStatus, { readonly kind: 'openForInterests' }>
}

type DealProgressCollectingWorkflow = {
  readonly stage: 'open'
  readonly mode: 'collectingCommitments'
  readonly status: Extract<DealProgressStatus, { readonly kind: 'collectingCommitments' }>
}

type DealProgressOngoingClosingWorkflow = {
  readonly stage: 'open' | 'closing'
  readonly mode: 'ongoingClosing'
  readonly status: Extract<DealProgressStatus, { readonly kind: 'ongoingClosing' }>
}

type DealProgressStandardClosingWorkflow = {
  readonly stage: 'open' | 'closing'
  readonly mode: 'standardClosing'
  readonly status: Extract<DealProgressStatus, { readonly kind: 'standardClosing' }>
}

type DealProgressContractingWorkflow = {
  readonly stage: 'preClosing' | 'closing'
  readonly mode: 'contracting'
  readonly status: Extract<DealProgressStatus, { readonly kind: 'contracting' }>
}

type DealProgressReadyToCloseWorkflow = {
  readonly stage: 'preClosing' | 'closing'
  readonly mode: 'readyToClose'
  readonly status: Extract<DealProgressStatus, { readonly kind: 'readyToClose' }>
}

type DealProgressActiveWorkflow =
  | DealProgressDraftWorkflow
  | DealProgressModerationWorkflow
  | DealProgressOpenForInterestsWorkflow
  | DealProgressCollectingWorkflow
  | DealProgressOngoingClosingWorkflow
  | DealProgressStandardClosingWorkflow
  | DealProgressContractingWorkflow
  | DealProgressReadyToCloseWorkflow

type DealProgressClosedWorkflow = {
  readonly stage: 'invested' | 'completed' | 'exited' | 'canceled'
  readonly mode: 'closed'
  readonly status: Extract<
    DealProgressStatus,
    { readonly kind: 'invested' | 'completed' | 'exited' | 'canceled' }
  >
}

export type DealProgressReadyState =
  | (DealProgressReadyBase & DealProgressActiveWorkflow & DealProgressReadyActionContext)
  | (DealProgressReadyBase &
      DealProgressClosedWorkflow & {
        readonly visibility?: DealProgressVisibility | undefined
        readonly actions: DealProgressNoActions
      })

export type DealProgressErrorState =
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
      readonly retryAction: DealProgressRetryAction
    }

export type DealProgressLoadingState = {
  readonly kind: 'loading'
  readonly label?: string | undefined
}

export type DealProgressPanelState =
  | DealProgressLoadingState
  | DealProgressErrorState
  | DealProgressReadyState

export type DealProgressPanelLabels = {
  readonly title: string
  readonly progressAriaLabel: string
  readonly progressCappedLabel: string
  readonly capitalCompositionLabel: string
  readonly capitalBreakdownLabel: string
}

export type DealProgressActionHandler = (event: DealProgressActionEvent) => void

export type DealProgressPanelRootProps = ComponentPropsWithoutRef<'section'> & {
  readonly busy?: boolean | undefined
  readonly state?: DealProgressPanelState | undefined
}

export type DealProgressPanelReadyContentProps = {
  readonly labels: DealProgressPanelLabels
  readonly locale?: string | undefined
  readonly onAction?: DealProgressActionHandler | undefined
  readonly state: DealProgressReadyState
  readonly titleId: string
}

export type DealProgressPanelHeaderProps = {
  readonly labels: DealProgressPanelLabels
  readonly state: DealProgressReadyState
  readonly titleId: string
}

export type DealProgressPanelCapitalProps = {
  readonly capital: DealProgressReadyState['capital']
  readonly labels: DealProgressPanelLabels
  readonly locale?: string | undefined
}

export type DealProgressPanelDataQualityProps = {
  readonly dataQuality: Exclude<DealProgressDataQuality, { readonly kind: 'fresh' }>
}

export type DealProgressPanelActionsProps = {
  readonly onAction?: DealProgressActionHandler | undefined
  readonly state: DealProgressReadyState
}

export type DealProgressPanelActionProps = {
  readonly action: DealProgressAction
  readonly describedById?: string | undefined
  readonly onAction?: DealProgressActionHandler | undefined
  readonly primary?: boolean | undefined
}

export type DealProgressPanelLoadingProps = {
  readonly label: ReactNode
  readonly titleId: string
}

export type DealProgressPanelErrorProps = {
  readonly onAction?: DealProgressActionHandler | undefined
  readonly state: DealProgressErrorState
  readonly titleId: string
}

type DealProgressPanelPropsBase = {
  readonly labels: DealProgressPanelLabels
  readonly locale?: string | undefined
  readonly className?: string | undefined
}

type DealProgressRetryablePanelState = Extract<
  DealProgressPanelState,
  { readonly kind: 'error'; readonly retryAction: DealProgressRetryAction }
>

type DealProgressAvailableActionPanelState = Extract<
  DealProgressPanelState,
  { readonly kind: 'ready'; readonly actions: DealProgressAvailableActions }
>

type DealProgressActionablePanelState =
  | DealProgressRetryablePanelState
  | DealProgressAvailableActionPanelState

type DealProgressNonActionablePanelState = Exclude<
  DealProgressPanelState,
  DealProgressActionablePanelState
>

export type DealProgressPanelProps =
  | (DealProgressPanelPropsBase & {
      readonly state: DealProgressActionablePanelState
      readonly onAction: DealProgressActionHandler
    })
  | (DealProgressPanelPropsBase & {
      readonly state: DealProgressNonActionablePanelState
      readonly onAction?: DealProgressActionHandler | undefined
    })
  | (DealProgressPanelPropsBase & {
      readonly state: DealProgressPanelState
      readonly onAction: DealProgressActionHandler
    })
