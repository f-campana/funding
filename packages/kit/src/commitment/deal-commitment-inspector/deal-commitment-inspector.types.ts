import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import type {
  DocumentEvidenceStatus,
  DocumentEvidenceStatusKind,
} from '../../status/document-status'
import type {
  CommitmentReadinessKey,
  CommitmentReadinessRecord,
  CommitmentReadinessState,
} from '../commitment-readiness.types'

export type DealCommitmentInspectorTone =
  | 'success'
  | 'attention'
  | 'danger'
  | 'info'
  | 'pending'
  | 'neutral'

export type DealCommitmentReadinessKey = CommitmentReadinessKey

export type DealCommitmentBlockerSeverity = 'critical' | 'warning' | 'info'

export type DealCommitmentEvidenceStatusKind = DocumentEvidenceStatusKind

export type DealCommitmentEvidenceStatus = DocumentEvidenceStatus

export type DealCommitmentStatus = {
  readonly label: string
  readonly tone: DealCommitmentInspectorTone
}

export type DealCommitmentInvestorSummary = {
  readonly id: string
  readonly name: string
  readonly entityName: string
  readonly contactLabel: string
  readonly commitmentLabel: string
  readonly status: DealCommitmentStatus
  readonly lastActivityLabel?: string | undefined
  readonly lastActivityDateTime?: string | undefined
}

export type DealCommitmentReadinessItem<
  Key extends DealCommitmentReadinessKey = DealCommitmentReadinessKey,
> = Key extends DealCommitmentReadinessKey
  ? CommitmentReadinessState<Key> & {
      readonly detail?: string | undefined
      readonly metadata?: readonly string[] | undefined
    }
  : never

export type DealCommitmentReadinessRecord = CommitmentReadinessRecord & {
  readonly [Key in DealCommitmentReadinessKey]: DealCommitmentReadinessItem<Key>
}

export type DealCommitmentBlocker = {
  readonly id: string
  readonly title: string
  readonly severity: DealCommitmentBlockerSeverity
  readonly severityLabel: string
  readonly owner: string
  readonly description: string
  readonly surfaceLabel: string
  readonly dueLabel?: string | undefined
  readonly relatedDocumentLabel?: string | undefined
  readonly relatedInvestorLabel?: string | undefined
}

export type DealCommitmentEvidenceItem = {
  readonly id: string
  readonly label: string
  readonly status: DealCommitmentEvidenceStatus
  readonly owner: string
  readonly requirementLabel: string
  readonly blockingLabel?: string | undefined
  readonly dueLabel?: string | undefined
  readonly lastActivityLabel?: string | undefined
  readonly lastActivityDateTime?: string | undefined
  readonly visibilityLabel?: string | undefined
}

export type DealCommitmentActivityItem = {
  readonly id: string
  readonly actor: string
  readonly timestampLabel: string
  readonly dateTime: string
  readonly summary: string
  readonly typeLabel?: string | undefined
  readonly tone?: DealCommitmentInspectorTone | undefined
}

export type DealCommitmentInspectorReadyState = {
  readonly kind: 'ready'
  readonly investor: DealCommitmentInvestorSummary
  readonly nextAction?: string | undefined
  readonly readiness: DealCommitmentReadinessRecord
  readonly blockers: readonly DealCommitmentBlocker[]
  readonly documents: readonly DealCommitmentEvidenceItem[]
  readonly activity: readonly DealCommitmentActivityItem[]
}

export type DealCommitmentInspectorErrorState =
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

export type DealCommitmentInspectorState =
  | {
      readonly kind: 'loading'
      readonly label?: string | undefined
    }
  | DealCommitmentInspectorErrorState
  | {
      readonly kind: 'empty'
      readonly title: string
      readonly description?: string | undefined
    }
  | DealCommitmentInspectorReadyState

export type DealCommitmentInspectorActionEvent = {
  readonly kind: 'retry'
}

export type DealCommitmentInspectorLabels = {
  readonly title: string
  readonly nextActionLabel: string
  readonly readinessTitle: string
  readonly blockersTitle: string
  readonly documentsTitle: string
  readonly activityTitle: string
  readonly noNextActionLabel: string
  readonly noBlockersLabel: string
  readonly noDocumentsLabel: string
  readonly noActivityLabel: string
  readonly loadingLabel: string
  readonly blockerOwnerLabel: string
  readonly blockerSurfaceLabel: string
  readonly blockerDueLabel: string
  readonly blockerDocumentsLabel: string
  readonly blockerInvestorsLabel: string
  readonly documentOwnerLabel: string
  readonly documentRequirementLabel: string
  readonly documentBlockingLabel: string
  readonly documentDueLabel: string
  readonly documentLastActivityLabel: string
  readonly documentVisibilityLabel: string
}

export type DealCommitmentInspectorActionHandler = (
  event: DealCommitmentInspectorActionEvent,
) => void

export type DealCommitmentInspectorRootProps = ComponentPropsWithoutRef<'section'> & {
  readonly busy?: boolean | undefined
  readonly state?: DealCommitmentInspectorState | undefined
}

export type DealCommitmentInspectorReadyContentProps = {
  readonly labels: DealCommitmentInspectorLabels
  readonly state: DealCommitmentInspectorReadyState
  readonly titleId: string
}

export type DealCommitmentInspectorHeaderProps = {
  readonly investor: DealCommitmentInvestorSummary
  readonly titleId: string
}

export type DealCommitmentInspectorNextActionProps = {
  readonly labels?: DealCommitmentInspectorLabels | undefined
  readonly nextAction?: ReactNode | undefined
  readonly title?: ReactNode | undefined
}

export type DealCommitmentInspectorReadinessProps = {
  readonly children?: ReactNode
  readonly labels?: DealCommitmentInspectorLabels | undefined
  readonly readiness?: DealCommitmentInspectorReadyState['readiness'] | undefined
  readonly title?: ReactNode | undefined
}

export type DealCommitmentInspectorReadinessItemProps = {
  readonly item: DealCommitmentReadinessItem
}

export type DealCommitmentInspectorBlockersProps = {
  readonly blockers?: readonly DealCommitmentBlocker[] | undefined
  readonly children?: ReactNode
  readonly emptyLabel?: ReactNode | undefined
  readonly labels?: DealCommitmentInspectorLabels | undefined
  readonly title?: ReactNode | undefined
}

export type DealCommitmentInspectorBlockerProps = {
  readonly blocker: DealCommitmentBlocker
  readonly labels: DealCommitmentInspectorLabels
}

export type DealCommitmentInspectorDocumentsProps = {
  readonly children?: ReactNode
  readonly documents?: readonly DealCommitmentEvidenceItem[] | undefined
  readonly emptyLabel?: ReactNode | undefined
  readonly labels?: DealCommitmentInspectorLabels | undefined
  readonly title?: ReactNode | undefined
}

export type DealCommitmentInspectorDocumentProps = {
  readonly document: DealCommitmentEvidenceItem
  readonly labels: DealCommitmentInspectorLabels
}

export type DealCommitmentInspectorActivityProps = {
  readonly activity?: readonly DealCommitmentActivityItem[] | undefined
  readonly children?: ReactNode
  readonly emptyLabel?: ReactNode | undefined
  readonly labels?: DealCommitmentInspectorLabels | undefined
  readonly title?: ReactNode | undefined
}

export type DealCommitmentInspectorActivityItemProps = {
  readonly item: DealCommitmentActivityItem
}

export type DealCommitmentInspectorLoadingProps = {
  readonly label: ReactNode
  readonly titleId: string
}

export type DealCommitmentInspectorErrorProps = {
  readonly onAction?: DealCommitmentInspectorActionHandler | undefined
  readonly state: DealCommitmentInspectorErrorState
  readonly titleId: string
}

export type DealCommitmentInspectorEmptyProps = {
  readonly state: Extract<DealCommitmentInspectorState, { readonly kind: 'empty' }>
  readonly titleId: string
}

export type DealCommitmentInspectorFactProps = {
  readonly icon: ReactNode
  readonly label: ReactNode
  readonly value: ReactNode
}

type DealCommitmentInspectorPropsBase = {
  readonly labels: DealCommitmentInspectorLabels
  readonly className?: string | undefined
}

type DealCommitmentInspectorRetryableState = Extract<
  DealCommitmentInspectorState,
  { readonly kind: 'error'; readonly retryLabel: string }
>

type DealCommitmentInspectorNonRetryableState = Exclude<
  DealCommitmentInspectorState,
  DealCommitmentInspectorRetryableState
>

export type DealCommitmentInspectorProps =
  | (DealCommitmentInspectorPropsBase & {
      readonly state: DealCommitmentInspectorRetryableState
      readonly onAction: DealCommitmentInspectorActionHandler
    })
  | (DealCommitmentInspectorPropsBase & {
      readonly state: DealCommitmentInspectorNonRetryableState
      readonly onAction?: DealCommitmentInspectorActionHandler | undefined
    })
  | (DealCommitmentInspectorPropsBase & {
      readonly state: DealCommitmentInspectorState
      readonly onAction: DealCommitmentInspectorActionHandler
    })
