import type {
  DealDocumentsEvidenceGroup,
  DealDocumentsEvidenceItem,
  DealDocumentsEvidenceLabels,
  DealDocumentsEvidenceProps,
  DealDocumentsEvidenceReadyState,
  DealDocumentsEvidenceSummaryMetric,
} from '@repo/kit/deal-documents-evidence'

import type { DealOperationalCenterDTO } from '@/server/deals'

import { formatDateTimeLabel, pluralize } from './deal-operational-formatting'

type DocumentCenterDTO = DealOperationalCenterDTO['documents']
type DocumentRequirementDTO = DocumentCenterDTO['requirements'][number]
type DocumentGroupDTO = DocumentCenterDTO['groups'][number]

const documentsEvidenceLabels = {
  documentBlockingLabel: 'Closing impact',
  documentDueLabel: 'Due',
  documentLastActivityLabel: 'Last activity',
  documentOwnerLabel: 'Owner',
  documentRelatedInvestorLabel: 'Related investor',
  documentRequirementLabel: 'Requirement',
  documentStatusLabel: 'Status',
  documentVisibilityLabel: 'Visibility',
  groupCountLabel: 'Items',
  groupVisibilityLabel: 'Visibility',
  groupsTitle: 'Evidence groups',
  loadingLabel: 'Loading documents evidence',
  noGroupDocumentsLabel: 'No evidence items in this group.',
  noGroupsLabel: 'No document evidence is ready for display.',
  subtitle: 'Closing evidence across generated documents, investor evidence, and vehicle setup.',
  summaryTitle: 'Evidence summary',
  title: 'Documents',
} as const satisfies DealDocumentsEvidenceLabels

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

const documentCategoryLabel = {
  corporate_docs: 'Corporate documents',
  identity: 'Identity evidence',
  management_presentation: 'Management presentation',
  other: 'Document evidence',
  pitch_deck: 'Pitch deck',
  proof_of_address: 'Proof of address',
  shareholders_agreement: 'Shareholders agreement',
  source_of_funds: 'Source of funds',
  subscription_docs: 'Subscription documents',
  ubo_declaration: 'UBO declaration',
  wire_instructions: 'Wire instructions',
} as const satisfies Record<DocumentRequirementDTO['category'], string>

const documentVisibilityLabel = {
  internal: 'Internal operations',
  investor_visible: 'Investor-visible data room',
  protected: 'Protected close room',
} as const satisfies Record<DocumentGroupDTO['visibility'], string>

const groupDescriptionById: Readonly<Record<string, string>> = {
  'group-generated-closing':
    'Documents generated for the close and sponsor-side execution package.',
  'group-investor-evidence':
    'Investor-provided evidence needed for KYC, KYB, and subscription checks.',
  'group-vehicle-setup': 'Evidence that the vehicle and target-side setup can support closing.',
} as const satisfies Record<string, string>

export const mapDealDocumentsEvidenceProps = (
  data: DealOperationalCenterDTO,
): DealDocumentsEvidenceProps => ({
  className: 'min-w-0',
  labels: documentsEvidenceLabels,
  state: mapDocumentsEvidenceReadyState(data),
})

const mapDocumentsEvidenceReadyState = (
  data: DealOperationalCenterDTO,
): DealDocumentsEvidenceReadyState => ({
  groups: data.documents.groups
    .map((group) => mapDocumentGroup(group, data))
    .filter((group) => group.documents.length > 0),
  kind: 'ready',
  summary: mapSummary(data.documents.requirements),
})

const mapDocumentGroup = (
  group: DocumentGroupDTO,
  data: DealOperationalCenterDTO,
): DealDocumentsEvidenceGroup => {
  const groupDocumentOrder = new Map(
    group.documentIds.map((documentId, index) => [documentId, index]),
  )
  const documents = [...data.documents.requirements]
    .filter((document) => document.groupId === group.id)
    .sort((left, right) => compareByGroupOrder(left, right, groupDocumentOrder))

  return {
    countLabel: `${documents.length} ${pluralize(documents.length, 'document')}`,
    description: groupDescriptionById[group.id],
    documents: documents.map((document) => mapDocumentItem(document, data, group)),
    id: group.id,
    label: group.label,
    visibilityLabel: documentVisibilityLabel[group.visibility],
  }
}

const mapDocumentItem = (
  document: DocumentRequirementDTO,
  data: DealOperationalCenterDTO,
  group: DocumentGroupDTO,
): DealDocumentsEvidenceItem => ({
  blockingLabel: getBlockingLabel(document),
  blocksClosing: isDocumentBlocking(document),
  description: documentCategoryLabel[document.category],
  id: document.id,
  label: document.label,
  ownerLabel: documentOwnerLabel[document.owner],
  requirement: {
    kind: document.requirement.kind,
    label: getRequirementLabel(document),
  },
  status: {
    kind: document.status,
    label: documentStatusLabel[document.status],
  },
  visibilityLabel: documentVisibilityLabel[group.visibility],
  ...(document.relatedInvestorId
    ? { relatedInvestorLabel: getRelatedInvestorLabel(document.relatedInvestorId, data) }
    : {}),
  ...(document.dueDate
    ? {
        dueDateTime: document.dueDate,
        dueLabel: `Due ${formatDateTimeLabel(document.dueDate)}`,
      }
    : {}),
  ...(document.lastActivityAt
    ? {
        lastActivityDateTime: document.lastActivityAt,
        lastActivityLabel: `Updated ${formatDateTimeLabel(document.lastActivityAt)}`,
      }
    : {}),
})

const mapSummary = (
  documents: readonly DocumentRequirementDTO[],
): DealDocumentsEvidenceReadyState['summary'] => {
  const total = documents.length
  const blocking = documents.filter(isDocumentBlocking).length
  const missing = countByStatus(documents, 'missing')
  const underReview = countByStatus(documents, 'under_review')
  const approved = countByStatus(documents, 'approved')
  const rejectedExpired = countByStatus(documents, 'rejected') + countByStatus(documents, 'expired')
  const issueCount = missing + underReview + rejectedExpired

  return {
    headlineLabel: `${total} ${pluralize(total, 'document')} · ${blocking} blocking close · ${issueCount} document ${pluralize(issueCount, 'issue')}`,
    metrics: [
      { id: 'total', label: 'Total', value: String(total) },
      { id: 'blocking', label: 'Blocking close', tone: 'danger', value: String(blocking) },
      { id: 'missing', label: 'Missing', tone: 'danger', value: String(missing) },
      { id: 'under-review', label: 'Under review', tone: 'pending', value: String(underReview) },
      { id: 'approved', label: 'Approved', tone: 'success', value: String(approved) },
      {
        id: 'rejected-expired',
        label: 'Rejected/expired',
        tone: 'attention',
        value: String(rejectedExpired),
      },
    ] satisfies readonly DealDocumentsEvidenceSummaryMetric[],
  }
}

const countByStatus = (
  documents: readonly DocumentRequirementDTO[],
  status: DocumentRequirementDTO['status'],
): number => documents.filter((document) => document.status === status).length

const getBlockingLabel = (document: DocumentRequirementDTO): string => {
  switch (document.closingImpact.kind) {
    case 'blocks_closing':
      return 'Blocks closing'
    case 'cleared_for_closing':
      return 'Cleared for closing'
    case 'does_not_block_closing':
      return 'Does not block closing'
  }
}

const getRequirementLabel = (document: DocumentRequirementDTO): string =>
  document.requirement.kind === 'required' ? 'Required' : 'Optional'

const isDocumentBlocking = (document: DocumentRequirementDTO): boolean =>
  document.closingImpact.kind === 'blocks_closing'

const getRelatedInvestorLabel = (
  investorId: string,
  data: DealOperationalCenterDTO,
): string | undefined => data.investors.find((investor) => investor.id === investorId)?.investorName

const compareByGroupOrder = (
  left: DocumentRequirementDTO,
  right: DocumentRequirementDTO,
  groupDocumentOrder: ReadonlyMap<string, number>,
): number =>
  (groupDocumentOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
    (groupDocumentOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER) ||
  left.label.localeCompare(right.label)
