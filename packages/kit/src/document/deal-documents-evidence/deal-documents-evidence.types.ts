import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import type {
  DocumentEvidenceStatus,
  DocumentEvidenceStatusKind,
} from '../../status/document-status'
import type { StatusTone } from '../../status/status-tone'

export type DealDocumentsEvidenceTone = StatusTone

export type DealDocumentsEvidenceStatusKind = DocumentEvidenceStatusKind

export type DealDocumentsEvidenceRequirementKind = 'required' | 'optional'

export type DealDocumentsEvidenceStatus = DocumentEvidenceStatus

export type DealDocumentsEvidenceRequirement = {
  readonly kind: DealDocumentsEvidenceRequirementKind
  readonly label: string
}

export type DealDocumentsEvidenceSummaryMetric = {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly tone?: DealDocumentsEvidenceTone | undefined
  readonly description?: string | undefined
}

export type DealDocumentsEvidenceSummary = {
  readonly headlineLabel: string
  readonly metrics: readonly DealDocumentsEvidenceSummaryMetric[]
}

export type DealDocumentsEvidenceItem = {
  readonly id: string
  readonly label: string
  readonly description?: string | undefined
  readonly status: DealDocumentsEvidenceStatus
  readonly ownerLabel: string
  readonly requirement: DealDocumentsEvidenceRequirement
  readonly blockingLabel: string
  readonly blocksClosing: boolean
  readonly relatedInvestorLabel?: string | undefined
  readonly dueLabel?: string | undefined
  readonly dueDateTime?: string | undefined
  readonly lastActivityLabel?: string | undefined
  readonly lastActivityDateTime?: string | undefined
  readonly visibilityLabel?: string | undefined
}

export type DealDocumentsEvidenceGroup = {
  readonly id: string
  readonly label: string
  readonly description?: string | undefined
  readonly visibilityLabel: string
  readonly countLabel: string
  readonly documents: readonly DealDocumentsEvidenceItem[]
}

export type DealDocumentsEvidenceReadyState = {
  readonly kind: 'ready'
  readonly summary: DealDocumentsEvidenceSummary
  readonly groups: readonly DealDocumentsEvidenceGroup[]
}

export type DealDocumentsEvidenceErrorState =
  | {
      readonly kind: 'error'
      readonly title: string
      readonly description?: string | undefined
      readonly retryLabel?: undefined
    }
  | {
      readonly kind: 'error'
      readonly title: string
      readonly description?: string | undefined
      readonly retryLabel: string
    }

export type DealDocumentsEvidenceState =
  | {
      readonly kind: 'loading'
      readonly label?: string | undefined
    }
  | DealDocumentsEvidenceErrorState
  | {
      readonly kind: 'empty'
      readonly title: string
      readonly description?: string | undefined
    }
  | DealDocumentsEvidenceReadyState

export type DealDocumentsEvidenceActionEvent = {
  readonly kind: 'retry'
}

export type DealDocumentsEvidenceActionHandler = (event: DealDocumentsEvidenceActionEvent) => void

export type DealDocumentsEvidenceLabels = {
  readonly title: string
  readonly subtitle: string
  readonly summaryTitle: string
  readonly groupsTitle: string
  readonly loadingLabel: string
  readonly noGroupsLabel: string
  readonly noGroupDocumentsLabel: string
  readonly groupVisibilityLabel: string
  readonly groupCountLabel: string
  readonly documentStatusLabel: string
  readonly documentOwnerLabel: string
  readonly documentRequirementLabel: string
  readonly documentBlockingLabel: string
  readonly documentRelatedInvestorLabel: string
  readonly documentDueLabel: string
  readonly documentLastActivityLabel: string
  readonly documentVisibilityLabel: string
}

export type DealDocumentsEvidenceRootProps = ComponentPropsWithoutRef<'section'> & {
  readonly busy?: boolean | undefined
  readonly state?: DealDocumentsEvidenceState | undefined
}

export type DealDocumentsEvidenceReadyContentProps = {
  readonly labels: DealDocumentsEvidenceLabels
  readonly state: DealDocumentsEvidenceReadyState
  readonly titleId: string
}

export type DealDocumentsEvidenceHeaderProps = {
  readonly headline?: ReactNode | undefined
  readonly labels?: DealDocumentsEvidenceLabels | undefined
  readonly state?: DealDocumentsEvidenceReadyState | undefined
  readonly subtitle?: ReactNode | undefined
  readonly title?: ReactNode | undefined
  readonly titleId: string
  readonly tone?: DealDocumentsEvidenceTone | undefined
}

export type DealDocumentsEvidenceSummaryProps = {
  readonly children?: ReactNode
  readonly labels?: DealDocumentsEvidenceLabels | undefined
  readonly metrics?: readonly DealDocumentsEvidenceSummaryMetric[] | undefined
  readonly title?: ReactNode | undefined
}

export type DealDocumentsEvidenceMetricProps = {
  readonly metric: DealDocumentsEvidenceSummaryMetric
}

export type DealDocumentsEvidenceGroupsProps = {
  readonly children?: ReactNode
  readonly emptyLabel?: ReactNode | undefined
  readonly groups?: readonly DealDocumentsEvidenceGroup[] | undefined
  readonly labels?: DealDocumentsEvidenceLabels | undefined
  readonly title?: ReactNode | undefined
}

export type DealDocumentsEvidenceGroupProps = {
  readonly children?: ReactNode
  readonly group: DealDocumentsEvidenceGroup
  readonly labels: DealDocumentsEvidenceLabels
}

export type DealDocumentsEvidenceDocumentProps = {
  readonly document: DealDocumentsEvidenceItem
  readonly labels: DealDocumentsEvidenceLabels
}

export type DealDocumentsEvidenceLoadingProps = {
  readonly label: ReactNode
  readonly titleId: string
}

export type DealDocumentsEvidenceErrorProps = {
  readonly onAction?: DealDocumentsEvidenceActionHandler | undefined
  readonly state: DealDocumentsEvidenceErrorState
  readonly titleId: string
}

export type DealDocumentsEvidenceEmptyProps = {
  readonly state: Extract<DealDocumentsEvidenceState, { readonly kind: 'empty' }>
  readonly titleId: string
}

export type DealDocumentsEvidenceFactProps = {
  readonly icon: ReactNode
  readonly label: ReactNode
  readonly value: ReactNode
}

type DealDocumentsEvidencePropsBase = {
  readonly labels: DealDocumentsEvidenceLabels
  readonly className?: string | undefined
}

type DealDocumentsEvidenceRetryableState = Extract<
  DealDocumentsEvidenceState,
  { readonly kind: 'error'; readonly retryLabel: string }
>

type DealDocumentsEvidenceNonRetryableState = Exclude<
  DealDocumentsEvidenceState,
  DealDocumentsEvidenceRetryableState
>

export type DealDocumentsEvidenceProps =
  | (DealDocumentsEvidencePropsBase & {
      readonly state: DealDocumentsEvidenceRetryableState
      readonly onAction: DealDocumentsEvidenceActionHandler
    })
  | (DealDocumentsEvidencePropsBase & {
      readonly state: DealDocumentsEvidenceNonRetryableState
      readonly onAction?: DealDocumentsEvidenceActionHandler | undefined
    })
  | (DealDocumentsEvidencePropsBase & {
      readonly state: DealDocumentsEvidenceState
      readonly onAction: DealDocumentsEvidenceActionHandler
    })
