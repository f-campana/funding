import type {
  CommitmentInvestorRow,
  CommitmentReadinessState,
  DealCommitmentsTableLifecycleState,
} from '@repo/kit/deal-commitments-table'

import type { DealOperationalCenterDTO } from '@/server/deals'
import {
  isFinanceAcceptedInvestor,
  isMatchedPendingFinanceAcceptance,
} from './deal-operational-capital-helpers'
import { formatDateTimeLabel, formatMoney, pluralize } from './deal-operational-formatting'

type InvestorOperationDTO = DealOperationalCenterDTO['investors'][number]
type ClosingBlockerDTO = DealOperationalCenterDTO['blockers'][number]

const whitespacePattern = /\s+/

export type DealCommitmentsTableViewModel = {
  readonly title: string
  readonly subtitle: string
  readonly toolbar: {
    readonly searchPlaceholder: string
    readonly workflowFiltersLabel: string
    readonly selectedLabel: string
  }
  readonly footer: {
    readonly investorsLabel: string
    readonly totalCommittedLabel: string
    readonly rowsPerPageLabel: string
    readonly rangeLabel: string
  }
  readonly state: DealCommitmentsTableLifecycleState
}

export const mapDealCommitmentsTableViewModel = (
  data: DealOperationalCenterDTO,
): DealCommitmentsTableViewModel => {
  const blockerById = new Map(data.blockers.map((blocker) => [blocker.id, blocker]))
  const rows = data.investors.map((investor) => mapCommitmentInvestorRow(investor, blockerById))

  return {
    footer: {
      investorsLabel: `${rows.length} ${pluralize(rows.length, 'investor')}`,
      rangeLabel: rows.length === 0 ? '0 of 0' : `1-${Math.min(rows.length, 8)} of ${rows.length}`,
      rowsPerPageLabel: '8 rows per page',
      totalCommittedLabel: `Overall committed ${formatMoney(data.capital.committedAmount)}`,
    },
    state:
      rows.length === 0
        ? {
            description: 'Invited investors and submitted commitments will appear here.',
            kind: 'empty',
            title: 'No commitments yet',
            variant: 'no-data',
          }
        : {
            kind: 'ready',
            pagination: {
              page: 1,
              pageSize: 8,
            },
            rows,
          },
    subtitle: 'Investor readiness across KYC/KYB, signature, and wire',
    title: 'Commitments',
    toolbar: {
      searchPlaceholder: 'Search investors',
      selectedLabel: 'selected',
      workflowFiltersLabel: 'Workflow filters',
    },
  }
}

const mapCommitmentInvestorRow = (
  investor: InvestorOperationDTO,
  blockerById: ReadonlyMap<string, ClosingBlockerDTO>,
): CommitmentInvestorRow => {
  const blockers = investor.blockerIds
    .map((blockerId) => blockerById.get(blockerId))
    .filter((blocker): blocker is ClosingBlockerDTO => blocker !== undefined && !blocker.resolved)
  const dataIssue = getCommitmentDataIssue(investor, blockers)

  return {
    attention: investor.readinessState === 'attention' || investor.readinessState === 'blocked',
    commitmentLabel: formatMoney(investor.commitmentAmount),
    commitmentSortValue: investor.commitmentAmount.amountMinor,
    entityName: getEntityName(investor),
    id: investor.id,
    investorInitials: getInitials(investor.investorName),
    investorMeta: getInvestorMeta(investor, blockers.length),
    investorName: investor.investorName,
    readiness: mapReadinessRecord(investor),
    status: mapInvestorStatus(investor),
    ...(dataIssue ? { dataIssue } : {}),
  }
}

const mapReadinessRecord = (
  investor: InvestorOperationDTO,
): CommitmentInvestorRow['readiness'] => ({
  kycKyb: mapKycKybReadiness(investor),
  reconciliation: mapReconciliationReadiness(investor),
  signature: mapSignatureReadiness(investor),
  wire: mapWireReadiness(investor),
})

const mapKycKybReadiness = (investor: InvestorOperationDTO): CommitmentReadinessState<'kycKyb'> => {
  const statuses = [
    { label: 'KYC', status: investor.kycStatus, statusLabel: investor.kycStatusLabel },
    ...(investor.entity.kind === 'legal_entity' &&
    investor.entity.legalEntity.kyb.kind === 'available'
      ? [
          {
            label: 'KYB',
            status: investor.entity.legalEntity.kyb.status,
            statusLabel: investor.entity.legalEntity.kyb.statusLabel,
          },
        ]
      : []),
  ] as const
  const detail = statuses.map(({ label, statusLabel }) => `${label}: ${statusLabel}`).join(' | ')

  if (
    investor.entity.kind === 'legal_entity' &&
    investor.entity.legalEntity.kyb.kind === 'missing'
  ) {
    return {
      detail: `${detail} | KYB: ${investor.entity.legalEntity.kyb.statusLabel}`,
      key: 'kycKyb',
      label: 'KYC/KYB',
      value: 'KYB missing',
      variant: 'unavailable',
    }
  }

  if (statuses.some(({ status }) => isIdentityDangerStatus(status))) {
    return {
      detail,
      key: 'kycKyb',
      label: 'KYC/KYB',
      value: firstStatusLabel(statuses, isIdentityDangerStatus),
      variant: 'expired',
    }
  }

  if (statuses.some(({ status }) => isIdentityReviewStatus(status))) {
    return {
      detail,
      key: 'kycKyb',
      label: 'KYC/KYB',
      value: firstStatusLabel(statuses, isIdentityReviewStatus),
      variant: 'inReview',
    }
  }

  if (statuses.some(({ status }) => status === 'not_started')) {
    return {
      detail,
      key: 'kycKyb',
      label: 'KYC/KYB',
      value: 'Not started',
      variant: 'unavailable',
    }
  }

  return {
    detail,
    key: 'kycKyb',
    label: 'KYC/KYB',
    value: 'Verified',
    variant: 'verified',
  }
}

const mapSignatureReadiness = (
  investor: InvestorOperationDTO,
): CommitmentReadinessState<'signature'> => {
  if (investor.signatureStatus === 'completed') {
    return {
      detail: investor.signatureStatusLabel,
      key: 'signature',
      label: 'Signature',
      value: 'Signed',
      variant: 'signed',
    }
  }

  if (investor.signatureStatus === 'not_sent') {
    return {
      detail: investor.signatureStatusLabel,
      key: 'signature',
      label: 'Signature',
      value: 'Not sent',
      variant: 'unavailable',
    }
  }

  return {
    detail: investor.signatureStatusLabel,
    key: 'signature',
    label: 'Signature',
    value: investor.signatureStatusLabel,
    variant: 'pending',
  }
}

const mapWireReadiness = (investor: InvestorOperationDTO): CommitmentReadinessState<'wire'> => {
  if (investor.wireStatus === 'matched' || investor.wireStatus === 'reconciled') {
    return {
      detail: investor.wireStatusLabel,
      key: 'wire',
      label: 'Wire',
      value: investor.wireStatusLabel,
      variant: 'received',
    }
  }

  if (investor.wireStatus === 'unmatched' || investor.wireStatus === 'failed') {
    return {
      detail: investor.wireStatusLabel,
      key: 'wire',
      label: 'Wire',
      value: investor.wireStatusLabel,
      variant: 'syncFailed',
    }
  }

  if (investor.wireStatus === 'returned') {
    return {
      detail: investor.wireStatusLabel,
      key: 'wire',
      label: 'Wire',
      value: 'Returned',
      variant: 'syncFailed',
    }
  }

  if (investor.wireStatus === 'not_requested') {
    return {
      detail: investor.wireStatusLabel,
      key: 'wire',
      label: 'Wire',
      value: 'Not received',
      variant: 'notReceived',
    }
  }

  return {
    detail: investor.wireStatusLabel,
    key: 'wire',
    label: 'Wire',
    value: investor.wireStatusLabel,
    variant: 'pending',
  }
}

const mapReconciliationReadiness = (
  investor: InvestorOperationDTO,
): CommitmentReadinessState<'reconciliation'> => {
  if (isFinanceAcceptedInvestor(investor)) {
    return {
      detail: `Commitment: ${investor.commitmentStatusLabel} | Wire: ${investor.wireStatusLabel}`,
      key: 'reconciliation',
      label: 'Reconciliation',
      value: 'Finance accepted',
      variant: 'reconciled',
    }
  }

  if (isMatchedPendingFinanceAcceptance(investor)) {
    return {
      detail: `Commitment: ${investor.commitmentStatusLabel} | Wire: ${investor.wireStatusLabel}`,
      key: 'reconciliation',
      label: 'Reconciliation',
      value: 'Matched, finance pending',
      variant: 'reconciling',
    }
  }

  if (
    investor.wireStatus === 'failed' ||
    investor.wireStatus === 'returned' ||
    investor.wireStatus === 'unmatched'
  ) {
    return {
      detail: investor.wireStatusLabel,
      key: 'reconciliation',
      label: 'Reconciliation',
      value: 'Needs review',
      variant: 'needsReview',
    }
  }

  if (
    investor.wireStatus === 'received' ||
    investor.wireStatus === 'under_review' ||
    investor.wireStatus === 'partially_matched'
  ) {
    return {
      detail: investor.wireStatusLabel,
      key: 'reconciliation',
      label: 'Reconciliation',
      value: 'Reconciling',
      variant: 'reconciling',
    }
  }

  if (investor.wireStatus === 'pending' || investor.wireStatus === 'instructions_sent') {
    return {
      detail: investor.wireStatusLabel,
      key: 'reconciliation',
      label: 'Reconciliation',
      value: 'Pending',
      variant: 'pending',
    }
  }

  return {
    detail: investor.wireStatusLabel,
    key: 'reconciliation',
    label: 'Reconciliation',
    value: 'Not started',
    variant: 'notStarted',
  }
}

const mapInvestorStatus = (investor: InvestorOperationDTO): CommitmentInvestorRow['status'] => {
  if (investor.readinessState === 'ready') {
    return {
      label: 'Ready for closing review',
      sortValue: 3,
      tone: 'complete',
    }
  }

  if (investor.readinessState === 'blocked') {
    return {
      label: 'Needs attention',
      sortValue: 0,
      tone: 'attention',
    }
  }

  if (investor.readinessState === 'attention') {
    return {
      label: 'In progress',
      sortValue: 1,
      tone: 'inProgress',
    }
  }

  return {
    label: 'Pending',
    sortValue: 2,
    tone: 'pending',
  }
}

const getCommitmentDataIssue = (
  investor: InvestorOperationDTO,
  blockers: readonly ClosingBlockerDTO[],
): CommitmentInvestorRow['dataIssue'] => {
  const blockingIssue = blockers.find((blocker) => blocker.severity === 'critical') ?? blockers[0]

  if (blockingIssue) {
    return {
      label: blockingIssue.title,
      tone: blockingIssue.severity === 'critical' ? 'danger' : 'neutral',
    }
  }

  if (
    investor.signatureStatus === 'declined' ||
    investor.signatureStatus === 'expired' ||
    investor.signatureStatus === 'failed'
  ) {
    return {
      label: `Signature ${investor.signatureStatusLabel.toLocaleLowerCase()}`,
      tone: 'danger',
    }
  }

  if (
    investor.entity.kind === 'legal_entity' &&
    investor.entity.legalEntity.kyb.kind === 'missing'
  ) {
    return {
      label: investor.entity.legalEntity.kyb.statusLabel,
      tone: 'neutral',
    }
  }

  return undefined
}

const getEntityName = (investor: InvestorOperationDTO): string =>
  investor.entity.kind === 'legal_entity' ? investor.entity.legalEntity.name : 'Individual'

const getInvestorMeta = (investor: InvestorOperationDTO, blockerCount: number): string => {
  const details = [
    investor.investorEmail,
    blockerCount > 0 ? `${blockerCount} ${pluralize(blockerCount, 'blocker')}` : undefined,
    investor.lastActivityAt ? `Updated ${formatDateTimeLabel(investor.lastActivityAt)}` : undefined,
  ].filter((detail): detail is string => detail !== undefined)

  return details.length > 0 ? details.join(' | ') : 'No recent activity'
}

const getInitials = (name: string): string => {
  const initials = name
    .trim()
    .split(whitespacePattern)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase()

  return initials || 'IN'
}

const isIdentityDangerStatus = (status: InvestorOperationDTO['kycStatus']) =>
  status === 'blocked' || status === 'expired' || status === 'rejected'

const isIdentityReviewStatus = (status: InvestorOperationDTO['kycStatus']) =>
  status === 'in_progress' || status === 'pending_review'

const firstStatusLabel = (
  statuses: readonly {
    readonly status: InvestorOperationDTO['kycStatus']
    readonly statusLabel: string
  }[],
  predicate: (status: InvestorOperationDTO['kycStatus']) => boolean,
) => statuses.find(({ status }) => predicate(status))?.statusLabel ?? 'Needs review'
