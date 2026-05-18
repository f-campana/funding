import type {
  DealDocumentsEvidenceGroup,
  DealDocumentsEvidenceState,
  DealDocumentsEvidenceStatusKind,
  DealDocumentsEvidenceTone,
} from './deal-documents-evidence.types'

export const documentEvidenceToneBadgeClasses = {
  attention: 'border-status-attention-border bg-status-attention-muted text-status-attention',
  danger: 'border-status-danger-border bg-status-danger-muted text-status-danger',
  info: 'border-status-info-border bg-status-info-muted text-status-info',
  neutral: 'border-border bg-muted text-muted-foreground',
  pending: 'border-status-pending-border bg-status-pending-muted text-status-pending',
  success: 'border-status-success-border bg-status-success-muted text-status-success',
} as const satisfies Record<DealDocumentsEvidenceTone, string>

export const documentEvidenceStatusDefaultTone = {
  approved: 'success',
  expired: 'attention',
  missing: 'danger',
  rejected: 'danger',
  under_review: 'pending',
  uploaded: 'info',
} as const satisfies Record<DealDocumentsEvidenceStatusKind, DealDocumentsEvidenceTone>

export const isDocumentEvidenceIssueStatus = (status: DealDocumentsEvidenceStatusKind) =>
  status === 'missing' || status === 'rejected' || status === 'expired' || status === 'under_review'

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
