import type {
  DealCommitmentActivityItem,
  DealCommitmentBlocker,
  DealCommitmentEvidenceItem,
  DealCommitmentInspectorLabels,
  DealCommitmentInspectorProps,
  DealCommitmentInspectorState,
  DealCommitmentInspectorTone,
  DealCommitmentInvestorSummary,
  DealCommitmentReadinessItem,
  DealCommitmentReadinessRecord,
} from '@repo/kit'

import type { DealOperationalCenterDTO } from '@/server/deals'

import { formatDateTimeLabel, formatMoney, pluralize } from './deal-operational-formatting'
import { blockerSurfaceLabel, ownerLabel, severityLabel } from './deal-operational-labels'

type InvestorOperationDTO = DealOperationalCenterDTO['investors'][number]
type ClosingBlockerDTO = DealOperationalCenterDTO['blockers'][number]
type DocumentRequirementDTO = DealOperationalCenterDTO['documents']['requirements'][number]
type DocumentGroupDTO = DealOperationalCenterDTO['documents']['groups'][number]
type ActivityEventDTO = DealOperationalCenterDTO['activity'][number]
type DealCommitmentInspectorReadyState = Extract<
  DealCommitmentInspectorState,
  { readonly kind: 'ready' }
>

export type DealCommitmentInspectorViewModel = {
  readonly emptyProps: DealCommitmentInspectorProps
  readonly propsByInvestorId: Readonly<Record<string, DealCommitmentInspectorProps>>
}

const commitmentInspectorLabels = {
  activityTitle: 'Recent investor activity',
  blockerDocumentsLabel: 'Documents',
  blockerDueLabel: 'Due',
  blockerInvestorsLabel: 'Investors',
  blockerOwnerLabel: 'Owner',
  blockerSurfaceLabel: 'Surface',
  blockersTitle: 'Related blockers',
  documentBlockingLabel: 'Closing impact',
  documentDueLabel: 'Due',
  documentLastActivityLabel: 'Last activity',
  documentOwnerLabel: 'Owner',
  documentRequirementLabel: 'Requirement',
  documentVisibilityLabel: 'Visibility',
  documentsTitle: 'Related evidence',
  loadingLabel: 'Loading commitment inspector',
  nextActionLabel: 'Next action',
  noActivityLabel: 'No recent investor activity.',
  noBlockersLabel: 'No investor-specific blockers.',
  noDocumentsLabel: 'No related evidence.',
  noNextActionLabel: 'No investor-specific action is open.',
  readinessTitle: 'Readiness breakdown',
  title: 'Commitment inspector',
} as const satisfies DealCommitmentInspectorLabels

const emptyCommitmentInspectorState = {
  description: 'Open an investor to inspect blockers and evidence.',
  kind: 'empty',
  title: 'No commitment selected',
} as const satisfies DealCommitmentInspectorState

const emptyCommitmentInspectorProps = {
  labels: commitmentInspectorLabels,
  state: emptyCommitmentInspectorState,
} as const satisfies DealCommitmentInspectorProps

const identityStatusTone = {
  approved: 'success',
  blocked: 'danger',
  expired: 'danger',
  in_progress: 'pending',
  not_started: 'neutral',
  pending_review: 'pending',
  rejected: 'danger',
} as const satisfies Record<InvestorOperationDTO['kycStatus'], DealCommitmentInspectorTone>

const signatureStatusTone = {
  completed: 'success',
  declined: 'danger',
  expired: 'danger',
  failed: 'danger',
  not_sent: 'neutral',
  part_signed: 'attention',
  prepared: 'pending',
  sent: 'pending',
  viewed: 'info',
} as const satisfies Record<InvestorOperationDTO['signatureStatus'], DealCommitmentInspectorTone>

const wireStatusTone = {
  failed: 'danger',
  instructions_sent: 'pending',
  matched: 'success',
  not_requested: 'neutral',
  partially_matched: 'attention',
  pending: 'pending',
  received: 'attention',
  reconciled: 'success',
  returned: 'danger',
  under_review: 'pending',
  unmatched: 'danger',
} as const satisfies Record<InvestorOperationDTO['wireStatus'], DealCommitmentInspectorTone>

const documentStatusLabel = {
  approved: 'Approved',
  expired: 'Expired',
  missing: 'Missing',
  rejected: 'Rejected',
  under_review: 'Under review',
  uploaded: 'Uploaded',
} as const satisfies Record<DocumentRequirementDTO['status'], string>

const documentOwnerLabel = {
  deal: 'Deal',
  fund: 'Fund',
  investor: 'Investor',
  legal_entity: 'Legal entity',
  spv: 'SPV',
} as const satisfies Record<DocumentRequirementDTO['owner'], string>

const documentVisibilityLabel = {
  internal: 'Internal',
  investor_visible: 'Investor visible',
  protected: 'Protected',
} as const satisfies Record<DocumentGroupDTO['visibility'], string>

const routeHintLabel = {
  about: 'Overview',
  commitments: 'Commitments',
  documents: 'Documents',
} as const satisfies Record<ClosingBlockerDTO['routeHint'], string>

const blockerSeverityRank = {
  critical: 0,
  warning: 1,
  info: 2,
} as const satisfies Record<ClosingBlockerDTO['severity'], number>

const documentStatusRank = {
  rejected: 0,
  expired: 1,
  missing: 2,
  under_review: 3,
  uploaded: 4,
  approved: 5,
} as const satisfies Record<DocumentRequirementDTO['status'], number>

const activityTypeLabel = {
  blocker_created: 'Blockers',
  blocker_resolved: 'Blockers',
  commitment_updated: 'Commitments',
  document_rejected: 'Documents',
  document_uploaded: 'Documents',
  signature_completed: 'Signatures',
  signature_sent: 'Signatures',
  wire_flagged: 'Wires',
  wire_matched: 'Wires',
} as const satisfies Record<ActivityEventDTO['eventType'], string>

const activityTone = {
  blocker_created: 'attention',
  blocker_resolved: 'success',
  commitment_updated: 'info',
  document_rejected: 'attention',
  document_uploaded: 'info',
  signature_completed: 'success',
  signature_sent: 'info',
  wire_flagged: 'attention',
  wire_matched: 'success',
} as const satisfies Record<ActivityEventDTO['eventType'], DealCommitmentInspectorTone>

export const mapDealCommitmentInspectorViewModel = (
  data: DealOperationalCenterDTO,
): DealCommitmentInspectorViewModel => ({
  emptyProps: emptyCommitmentInspectorProps,
  propsByInvestorId: Object.fromEntries(
    data.investors.map((investor) => [
      investor.id,
      mapDealCommitmentInspectorProps(data, investor.id),
    ]),
  ) as Readonly<Record<string, DealCommitmentInspectorProps>>,
})

export const mapDealCommitmentInspectorProps = (
  data: DealOperationalCenterDTO,
  investorId: string,
): DealCommitmentInspectorProps => {
  const investor = data.investors.find((candidate) => candidate.id === investorId)

  if (!investor) {
    return emptyCommitmentInspectorProps
  }

  return {
    labels: commitmentInspectorLabels,
    state: mapCommitmentInspectorReadyState(data, investor),
  }
}

const mapCommitmentInspectorReadyState = (
  data: DealOperationalCenterDTO,
  investor: InvestorOperationDTO,
): DealCommitmentInspectorReadyState => {
  const blockers = selectRelatedBlockers(data, investor)
  const documents = selectRelatedDocuments(data, investor, blockers)
  const readiness = mapReadinessRecord(investor)

  return {
    activity: selectRelatedActivity(data, investor, blockers, documents).map(mapActivity),
    blockers: blockers.map((blocker) => mapBlocker(blocker, data)),
    documents: documents.map((document) => mapDocument(document, data.documents.groups)),
    investor: mapInvestorSummary(investor, blockers),
    kind: 'ready',
    nextAction: getNextAction(blockers, readiness),
    readiness,
  }
}

const mapInvestorSummary = (
  investor: InvestorOperationDTO,
  blockers: readonly ClosingBlockerDTO[],
): DealCommitmentInvestorSummary => ({
  commitmentLabel: `${formatMoney(investor.commitmentAmount)} commitment`,
  contactLabel: investor.investorEmail ?? 'No email on file',
  entityName: getEntityName(investor),
  id: investor.id,
  name: investor.investorName,
  status: mapInvestorStatus(investor, blockers),
  ...(investor.lastActivityAt
    ? {
        lastActivityDateTime: investor.lastActivityAt,
        lastActivityLabel: `Updated ${formatDateTimeLabel(investor.lastActivityAt)}`,
      }
    : {}),
})

const mapInvestorStatus = (
  investor: InvestorOperationDTO,
  blockers: readonly ClosingBlockerDTO[],
): DealCommitmentInvestorSummary['status'] => {
  const unresolvedBlockers = blockers.filter((blocker) => !blocker.resolved)

  if (unresolvedBlockers.some((blocker) => blocker.severity === 'critical')) {
    return {
      label: 'Needs attention',
      tone: 'danger',
    }
  }

  if (investor.readinessState === 'ready') {
    return {
      label: 'Ready for closing',
      tone: 'success',
    }
  }

  if (investor.readinessState === 'blocked' || investor.readinessState === 'attention') {
    return {
      label: 'Needs attention',
      tone: 'attention',
    }
  }

  return {
    label: 'Pending',
    tone: 'pending',
  }
}

const mapReadinessRecord = (investor: InvestorOperationDTO): DealCommitmentReadinessRecord => ({
  kycKyb: mapKycKybReadiness(investor),
  reconciliation: mapReconciliationReadiness(investor),
  signature: mapSignatureReadiness(investor),
  wire: mapWireReadiness(investor),
})

const mapKycKybReadiness = (
  investor: InvestorOperationDTO,
): DealCommitmentReadinessItem<'kycKyb'> => {
  const statuses = [
    {
      label: 'KYC',
      status: investor.kycStatus,
      statusLabel: investor.kycStatusLabel,
      tone: identityStatusTone[investor.kycStatus],
    },
    ...(investor.entity.kind === 'legal_entity' &&
    investor.entity.legalEntity.kyb.kind === 'available'
      ? [
          {
            label: 'KYB',
            status: investor.entity.legalEntity.kyb.status,
            statusLabel: investor.entity.legalEntity.kyb.statusLabel,
            tone: identityStatusTone[investor.entity.legalEntity.kyb.status],
          },
        ]
      : []),
  ] as const
  const detail = statuses.map(({ label, statusLabel }) => `${label}: ${statusLabel}`).join(' | ')
  const metadata = statuses.map(({ label, statusLabel }) => `${label} ${statusLabel}`)

  if (
    investor.entity.kind === 'legal_entity' &&
    investor.entity.legalEntity.kyb.kind === 'missing'
  ) {
    return {
      detail: `${detail} | KYB: ${investor.entity.legalEntity.kyb.statusLabel}`,
      key: 'kycKyb',
      label: 'KYC/KYB',
      metadata: [...metadata, `KYB ${investor.entity.legalEntity.kyb.statusLabel}`],
      tone: 'attention',
      value: 'KYB missing',
    }
  }

  const blockingStatus = statuses.find(({ tone }) => tone === 'danger')
  const pendingStatus = statuses.find(({ tone }) => tone === 'pending')
  const notStartedStatus = statuses.find(({ status }) => status === 'not_started')

  if (blockingStatus) {
    return {
      detail,
      key: 'kycKyb',
      label: 'KYC/KYB',
      metadata,
      tone: 'danger',
      value: blockingStatus.statusLabel,
    }
  }

  if (pendingStatus) {
    return {
      detail,
      key: 'kycKyb',
      label: 'KYC/KYB',
      metadata,
      tone: 'pending',
      value: pendingStatus.statusLabel,
    }
  }

  if (notStartedStatus) {
    return {
      detail,
      key: 'kycKyb',
      label: 'KYC/KYB',
      metadata,
      tone: 'neutral',
      value: 'Not started',
    }
  }

  return {
    detail,
    key: 'kycKyb',
    label: 'KYC/KYB',
    metadata,
    tone: 'success',
    value: 'Verified',
  }
}

const mapSignatureReadiness = (
  investor: InvestorOperationDTO,
): DealCommitmentReadinessItem<'signature'> => ({
  detail: `Signature: ${investor.signatureStatusLabel}`,
  key: 'signature',
  label: 'Signature',
  metadata: [investor.signatureStatusLabel],
  tone: signatureStatusTone[investor.signatureStatus],
  value: investor.signatureStatus === 'completed' ? 'Signed' : investor.signatureStatusLabel,
})

const mapWireReadiness = (investor: InvestorOperationDTO): DealCommitmentReadinessItem<'wire'> => ({
  detail: `Wire: ${investor.wireStatusLabel}`,
  key: 'wire',
  label: 'Wire',
  metadata: [`Expected ${formatMoney(investor.commitmentAmount)}`],
  tone: wireStatusTone[investor.wireStatus],
  value:
    investor.wireStatus === 'matched' || investor.wireStatus === 'reconciled'
      ? investor.wireStatusLabel
      : investor.wireStatusLabel,
})

const mapReconciliationReadiness = (
  investor: InvestorOperationDTO,
): DealCommitmentReadinessItem<'reconciliation'> => {
  if (
    investor.commitmentStatus === 'reconciled' ||
    investor.wireStatus === 'matched' ||
    investor.wireStatus === 'reconciled'
  ) {
    return {
      detail: `Commitment: ${investor.commitmentStatusLabel} | Wire: ${investor.wireStatusLabel}`,
      key: 'reconciliation',
      label: 'Reconciliation',
      tone: 'success',
      value: 'Reconciled',
    }
  }

  if (
    investor.wireStatus === 'failed' ||
    investor.wireStatus === 'returned' ||
    investor.wireStatus === 'unmatched'
  ) {
    return {
      detail: `Commitment: ${investor.commitmentStatusLabel} | Wire: ${investor.wireStatusLabel}`,
      key: 'reconciliation',
      label: 'Reconciliation',
      tone: 'danger',
      value: 'Needs review',
    }
  }

  if (
    investor.wireStatus === 'received' ||
    investor.wireStatus === 'under_review' ||
    investor.wireStatus === 'partially_matched'
  ) {
    return {
      detail: `Commitment: ${investor.commitmentStatusLabel} | Wire: ${investor.wireStatusLabel}`,
      key: 'reconciliation',
      label: 'Reconciliation',
      tone: 'info',
      value: 'Reconciling',
    }
  }

  if (investor.wireStatus === 'pending' || investor.wireStatus === 'instructions_sent') {
    return {
      detail: `Commitment: ${investor.commitmentStatusLabel} | Wire: ${investor.wireStatusLabel}`,
      key: 'reconciliation',
      label: 'Reconciliation',
      tone: 'pending',
      value: 'Pending',
    }
  }

  return {
    detail: `Commitment: ${investor.commitmentStatusLabel} | Wire: ${investor.wireStatusLabel}`,
    key: 'reconciliation',
    label: 'Reconciliation',
    tone: 'neutral',
    value: 'Not started',
  }
}

const selectRelatedBlockers = (
  data: DealOperationalCenterDTO,
  investor: InvestorOperationDTO,
): readonly ClosingBlockerDTO[] =>
  data.blockers
    .filter(
      (blocker) =>
        investor.blockerIds.includes(blocker.id) ||
        blocker.relatedInvestorIds.includes(investor.id),
    )
    .sort(compareBlockers)

const compareBlockers = (left: ClosingBlockerDTO, right: ClosingBlockerDTO): number =>
  Number(left.resolved) - Number(right.resolved) ||
  blockerSeverityRank[left.severity] - blockerSeverityRank[right.severity] ||
  left.title.localeCompare(right.title)

const selectRelatedDocuments = (
  data: DealOperationalCenterDTO,
  investor: InvestorOperationDTO,
  blockers: readonly ClosingBlockerDTO[],
): readonly DocumentRequirementDTO[] => {
  const relatedDocumentIds = new Set([
    ...investor.documentIds,
    ...blockers.flatMap((blocker) => blocker.relatedDocumentIds),
  ])

  return data.documents.requirements
    .filter(
      (document) =>
        relatedDocumentIds.has(document.id) || document.relatedInvestorId === investor.id,
    )
    .sort(compareDocuments)
}

const compareDocuments = (left: DocumentRequirementDTO, right: DocumentRequirementDTO): number =>
  Number(right.blocksClosing) - Number(left.blocksClosing) ||
  documentStatusRank[left.status] - documentStatusRank[right.status] ||
  compareOptionalDate(left.dueDate, right.dueDate) ||
  left.label.localeCompare(right.label)

const selectRelatedActivity = (
  data: DealOperationalCenterDTO,
  investor: InvestorOperationDTO,
  blockers: readonly ClosingBlockerDTO[],
  documents: readonly DocumentRequirementDTO[],
): readonly ActivityEventDTO[] => {
  const blockerIds = new Set(blockers.map((blocker) => blocker.id))
  const documentIds = new Set(documents.map((document) => document.id))

  return data.activity
    .filter(
      (activity) =>
        ('relatedInvestorId' in activity && activity.relatedInvestorId === investor.id) ||
        ('relatedBlockerId' in activity && blockerIds.has(activity.relatedBlockerId)) ||
        ('relatedDocumentId' in activity && documentIds.has(activity.relatedDocumentId)),
    )
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 5)
}

const mapBlocker = (
  blocker: ClosingBlockerDTO,
  data: DealOperationalCenterDTO,
): DealCommitmentBlocker => {
  const relatedDocuments = data.documents.requirements.filter((document) =>
    blocker.relatedDocumentIds.includes(document.id),
  )

  return {
    description: blocker.description,
    id: blocker.id,
    owner: ownerLabel(blocker.owner),
    severity: blocker.severity,
    severityLabel: severityLabel(blocker.severity),
    surfaceLabel: `${blockerSurfaceLabel(blocker.type)} - ${routeHintLabel[blocker.routeHint]}`,
    title: blocker.title,
    ...(getBlockerDueLabel(blocker, data) ? { dueLabel: getBlockerDueLabel(blocker, data) } : {}),
    ...(getRelatedDocumentLabel(relatedDocuments)
      ? { relatedDocumentLabel: getRelatedDocumentLabel(relatedDocuments) }
      : {}),
    ...(getRelatedInvestorLabel(blocker, data)
      ? { relatedInvestorLabel: getRelatedInvestorLabel(blocker, data) }
      : {}),
  }
}

const mapDocument = (
  document: DocumentRequirementDTO,
  groups: readonly DocumentGroupDTO[],
): DealCommitmentEvidenceItem => {
  const group = groups.find((candidate) => candidate.id === document.groupId)

  return {
    blockingLabel: document.blocksClosing ? 'Blocks closing' : 'Does not block closing',
    id: document.id,
    label: document.label,
    owner: documentOwnerLabel[document.owner],
    requirementLabel: document.required ? 'Required' : 'Optional',
    statusLabel: documentStatusLabel[document.status],
    statusTone: document.tone,
    ...(document.dueDate ? { dueLabel: `Due ${formatDateTimeLabel(document.dueDate)}` } : {}),
    ...(document.lastActivityAt
      ? {
          lastActivityDateTime: document.lastActivityAt,
          lastActivityLabel: `Updated ${formatDateTimeLabel(document.lastActivityAt)}`,
        }
      : {}),
    ...(group
      ? { visibilityLabel: `${group.label} - ${documentVisibilityLabel[group.visibility]}` }
      : {}),
  }
}

const mapActivity = (activity: ActivityEventDTO): DealCommitmentActivityItem => ({
  actor: activity.actorLabel,
  dateTime: activity.occurredAt,
  id: activity.id,
  summary: activity.summary,
  timestampLabel: formatDateTimeLabel(activity.occurredAt),
  tone: activityTone[activity.eventType],
  typeLabel: activityTypeLabel[activity.eventType],
})

const getNextAction = (
  blockers: readonly ClosingBlockerDTO[],
  readiness: DealCommitmentReadinessRecord,
): string | undefined => {
  const unresolvedBlocker = blockers.find((blocker) => !blocker.resolved)

  if (unresolvedBlocker) {
    return `Review ${unresolvedBlocker.title} before closing review.`
  }

  if (readiness.kycKyb.tone !== 'success') {
    return 'Review KYC/KYB status before closing review.'
  }

  if (readiness.signature.tone !== 'success') {
    return 'Review signature status before closing review.'
  }

  if (readiness.wire.tone !== 'success') {
    return 'Review wire status before closing review.'
  }

  if (readiness.reconciliation.tone !== 'success') {
    return 'Review reconciliation status before closing review.'
  }

  return undefined
}

const getBlockerDueLabel = (
  blocker: ClosingBlockerDTO,
  data: DealOperationalCenterDTO,
): string | undefined => {
  if (blocker.type === 'deadline') {
    return `Target close ${formatDateTimeLabel(data.deal.targetCloseDate)}`
  }

  const earliestDueDate = data.documents.requirements
    .filter((document) => blocker.relatedDocumentIds.includes(document.id))
    .map((document) => document.dueDate)
    .filter((dueDate): dueDate is string => dueDate !== undefined)
    .sort()
    .at(0)

  return earliestDueDate ? `Due ${formatDateTimeLabel(earliestDueDate)}` : undefined
}

const getRelatedDocumentLabel = (
  documents: readonly DocumentRequirementDTO[],
): string | undefined => {
  if (documents.length === 0) {
    return undefined
  }

  if (documents.length === 1) {
    return documents[0]?.label
  }

  return `${documents.length} evidence ${pluralize(documents.length, 'item')}`
}

const getRelatedInvestorLabel = (
  blocker: ClosingBlockerDTO,
  data: DealOperationalCenterDTO,
): string | undefined => {
  const investors = data.investors.filter((investor) =>
    blocker.relatedInvestorIds.includes(investor.id),
  )

  if (investors.length === 0) {
    return undefined
  }

  if (investors.length === 1) {
    return investors[0]?.investorName
  }

  return `${investors.length} ${pluralize(investors.length, 'investor')}`
}

const getEntityName = (investor: InvestorOperationDTO): string =>
  investor.entity.kind === 'legal_entity' ? investor.entity.legalEntity.name : 'Individual'

const compareOptionalDate = (left: string | undefined, right: string | undefined): number => {
  if (left === undefined && right === undefined) {
    return 0
  }

  if (left === undefined) {
    return 1
  }

  if (right === undefined) {
    return -1
  }

  return left.localeCompare(right)
}
