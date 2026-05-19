import { isDocumentEvidenceIssueStatus } from '../../status/document-status'
import { statusToneClasses } from '../../status/status-tone'
import type {
  DealDocumentsEvidenceGroup,
  DealDocumentsEvidenceState,
  DealDocumentsEvidenceTone,
} from './deal-documents-evidence.types'

export {
  getDocumentEvidenceStatusTone,
  isDocumentEvidenceIssueStatus,
} from '../../status/document-status'

export const documentEvidenceToneBadgeClasses = statusToneClasses satisfies Record<
  DealDocumentsEvidenceTone,
  string
>

export const getDocumentsEvidenceTotals = (groups: readonly DealDocumentsEvidenceGroup[]) =>
  groups.reduce(
    (totals, group) => {
      const groupTotals = group.documents.reduce(
        (documentTotals, document) => ({
          blocking: document.blocksClosing ? documentTotals.blocking + 1 : documentTotals.blocking,
          issues: isDocumentEvidenceIssueStatus(document.status.kind)
            ? documentTotals.issues + 1
            : documentTotals.issues,
          total: documentTotals.total + 1,
        }),
        { blocking: 0, issues: 0, total: 0 },
      )

      return {
        blocking: totals.blocking + groupTotals.blocking,
        issues: totals.issues + groupTotals.issues,
        total: totals.total + groupTotals.total,
      }
    },
    { blocking: 0, issues: 0, total: 0 },
  )

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
