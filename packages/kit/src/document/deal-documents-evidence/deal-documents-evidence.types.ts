export type DealDocumentsEvidenceTone =
  | 'neutral'
  | 'info'
  | 'pending'
  | 'attention'
  | 'success'
  | 'danger'

export type DealDocumentsEvidenceStatusKind =
  | 'missing'
  | 'uploaded'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired'

export type DealDocumentsEvidenceRequirementKind = 'required' | 'optional'

export type DealDocumentsEvidenceStatus = {
  readonly kind: DealDocumentsEvidenceStatusKind
  readonly label: string
  readonly tone: DealDocumentsEvidenceTone
}

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
