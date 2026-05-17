'use client'

import { DealCommitmentsTable, type DealCommitmentsTableLabels } from '@repo/kit'

import type { DealCommitmentsTableViewModel } from '../deal-commitments-table-adapter'

type CommitmentsWorkspaceProps = {
  readonly table: DealCommitmentsTableViewModel
}

const commitmentsTableLabels = {
  columns: {
    actions: 'Actions',
    commitment: 'Commitment',
    investor: 'Investor',
    kycKyb: 'KYC/KYB',
    readiness: 'Readiness',
    signature: 'Signature',
    status: 'Status',
    wire: 'Wire',
  },
  empty: {
    noDataDescription: 'Invited investors and submitted commitments will appear here.',
    noDataTitle: 'No commitments yet',
    noResultsDescription: 'Clear search or filters to return to all commitments.',
    noResultsTitle: 'No commitments match your search or filters',
  },
  filters: {
    completedKycKyb: 'Completed KYC/KYB',
    needsAttention: 'Needs attention',
    pendingKycKyb: 'Pending KYC/KYB',
    readyForClosing: 'Ready for closing',
    signaturePending: 'Signature pending',
    wirePending: 'Wire pending',
  },
  footer: {
    emptyTotalCommittedLabel: 'No listed commitments',
    investorsLabel: (count) => `${count} ${count === 1 ? 'investor' : 'investors'}`,
    nextPageLabel: 'Next commitments page',
    previousPageLabel: 'Previous commitments page',
    rangeLabel: (start, end, total) => `${start}-${end} of ${total}`,
    rowsPerPageLabel: (pageSize) => `${pageSize} rows per page`,
    rowsPerPageOptionLabel: (pageSize) => `${pageSize} rows`,
  },
  row: {
    groupSummaryLabel: (label, count) =>
      `${label}: ${count} ${count === 1 ? 'investor' : 'investors'}`,
    openDetailsLabel: (row) => `Open ${row.investorName} commitment`,
    selectRowLabel: (row) => `Select ${row.investorName} commitment`,
  },
  selection: {
    selectAllVisibleLabel: 'Select all visible commitments',
  },
} satisfies DealCommitmentsTableLabels

export function CommitmentsWorkspace({ table }: CommitmentsWorkspaceProps) {
  return <DealCommitmentsTable {...table} labels={commitmentsTableLabels} />
}
