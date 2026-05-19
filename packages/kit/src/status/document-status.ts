import type { StatusTone } from './status-tone'

export type DocumentEvidenceStatusKind =
  | 'missing'
  | 'uploaded'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired'

export type DocumentEvidenceStatus = {
  readonly kind: DocumentEvidenceStatusKind
  readonly label: string
}

const documentEvidenceStatusToneByKind = {
  approved: 'success',
  expired: 'danger',
  missing: 'attention',
  rejected: 'danger',
  under_review: 'pending',
  uploaded: 'info',
} as const satisfies Record<DocumentEvidenceStatusKind, StatusTone>

const documentEvidenceIssueByStatus = {
  approved: false,
  expired: true,
  missing: true,
  rejected: true,
  under_review: true,
  uploaded: false,
} as const satisfies Record<DocumentEvidenceStatusKind, boolean>

export const getDocumentEvidenceStatusTone = (status: DocumentEvidenceStatusKind): StatusTone =>
  documentEvidenceStatusToneByKind[status]

export const isDocumentEvidenceIssueStatus = (status: DocumentEvidenceStatusKind): boolean =>
  documentEvidenceIssueByStatus[status]
