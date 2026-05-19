import {
  getDocumentEvidenceStatusTone,
  isDocumentEvidenceIssueStatus,
} from '../../status/document-status'
import { statusToneClasses } from '../../status/status-tone'
import type {
  DealDocumentsEvidenceGroup,
  DealDocumentsEvidenceItem,
  DealDocumentsEvidenceState,
  DealDocumentsEvidenceSummary,
  DealDocumentsEvidenceSummaryMetric,
  DealDocumentsEvidenceTone,
} from './deal-documents-evidence.types'

export { getDocumentEvidenceStatusTone, isDocumentEvidenceIssueStatus }

export const documentEvidenceToneBadgeClasses = statusToneClasses satisfies Record<
  DealDocumentsEvidenceTone,
  string
>

export const getDocumentsEvidenceSummaryCounts = (groups: readonly DealDocumentsEvidenceGroup[]) =>
  groups.reduce((totals, group) => {
    for (const document of group.documents) {
      incrementDocumentSummaryCounts(totals, document)
    }

    return totals
  }, createEmptyDocumentSummaryCounts())

export const getDocumentsEvidenceTotals = (groups: readonly DealDocumentsEvidenceGroup[]) => {
  const totals = getDocumentsEvidenceSummaryCounts(groups)

  return {
    blocking: totals.blocking,
    issues: totals.issues,
    total: totals.total,
  }
}

export const getDocumentsEvidenceSummary = (
  groups: readonly DealDocumentsEvidenceGroup[],
): DealDocumentsEvidenceSummary => {
  const totals = getDocumentsEvidenceSummaryCounts(groups)

  return {
    headlineLabel: `${totals.total} ${pluralize(totals.total, 'document')} · ${totals.blocking} blocking close · ${totals.issues} document ${pluralize(totals.issues, 'issue')}`,
    metrics: [
      { id: 'total', label: 'Total', value: String(totals.total) },
      { id: 'blocking', label: 'Blocking close', tone: 'danger', value: String(totals.blocking) },
      { id: 'missing', label: 'Missing', tone: 'danger', value: String(totals.missing) },
      {
        id: 'under-review',
        label: 'Under review',
        tone: 'pending',
        value: String(totals.underReview),
      },
      { id: 'approved', label: 'Approved', tone: 'success', value: String(totals.approved) },
      {
        id: 'rejected-expired',
        label: 'Rejected/expired',
        tone: 'attention',
        value: String(totals.rejectedExpired),
      },
    ] satisfies readonly DealDocumentsEvidenceSummaryMetric[],
  }
}

export const getDocumentsEvidenceTone = (
  state: DealDocumentsEvidenceState,
): DealDocumentsEvidenceTone => {
  if (state.kind !== 'ready') {
    return 'neutral'
  }

  const totals = getDocumentsEvidenceTotals(state.groups)

  if (totals.blocking > 0) {
    return 'danger'
  }

  if (totals.issues > 0) {
    return 'attention'
  }

  return totals.total > 0 ? 'success' : 'neutral'
}

export const getDocumentEvidenceItemTone = (
  document: Pick<DealDocumentsEvidenceItem, 'blocksClosing' | 'status'>,
): DealDocumentsEvidenceTone => {
  if (document.blocksClosing && isDocumentEvidenceIssueStatus(document.status.kind)) {
    return 'danger'
  }

  return getDocumentEvidenceStatusTone(document.status.kind)
}

const pluralize = (count: number, singular: string): string =>
  count === 1 ? singular : `${singular}s`

type DocumentSummaryCounts = {
  approved: number
  blocking: number
  issues: number
  missing: number
  rejectedExpired: number
  total: number
  underReview: number
}

const createEmptyDocumentSummaryCounts = (): DocumentSummaryCounts => ({
  approved: 0,
  blocking: 0,
  issues: 0,
  missing: 0,
  rejectedExpired: 0,
  total: 0,
  underReview: 0,
})

const incrementDocumentSummaryCounts = (
  totals: DocumentSummaryCounts,
  document: DealDocumentsEvidenceItem,
) => {
  totals.total += 1

  if (document.blocksClosing) {
    totals.blocking += 1
  }

  if (isDocumentEvidenceIssueStatus(document.status.kind)) {
    totals.issues += 1
  }

  switch (document.status.kind) {
    case 'approved':
      totals.approved += 1
      break
    case 'expired':
    case 'rejected':
      totals.rejectedExpired += 1
      break
    case 'missing':
      totals.missing += 1
      break
    case 'under_review':
      totals.underReview += 1
      break
    case 'uploaded':
      break
  }
}
