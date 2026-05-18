export type DealCommitmentInspectorTone =
  | 'success'
  | 'attention'
  | 'danger'
  | 'info'
  | 'pending'
  | 'neutral'

export type DealCommitmentReadinessKey = 'kycKyb' | 'signature' | 'wire' | 'reconciliation'

export type DealCommitmentBlockerSeverity = 'critical' | 'warning' | 'info'

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
  ? {
      readonly key: Key
      readonly label: string
      readonly value: string
      readonly tone: DealCommitmentInspectorTone
      readonly detail?: string | undefined
      readonly metadata?: readonly string[] | undefined
    }
  : never

export type DealCommitmentReadinessRecord = {
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
  readonly statusLabel: string
  readonly statusTone: DealCommitmentInspectorTone
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
