import type { CommitmentInvestorRow, DealCommitmentsTableProps } from './deal-commitments-table'

const readiness = (
  kycKyb: CommitmentInvestorRow['readiness']['kycKyb'],
  signature: CommitmentInvestorRow['readiness']['signature'],
  wire: CommitmentInvestorRow['readiness']['wire'],
  reconciliation: CommitmentInvestorRow['readiness']['reconciliation'],
) => ({
  kycKyb,
  reconciliation,
  signature,
  wire,
})

export const lockedCommitmentRows = [
  {
    commitmentLabel: '$35,000,000',
    commitmentSortValue: 35_000_000,
    entityName: 'Tailwind Partners LP',
    id: 'tailwind-partners',
    avatarTone: 'navy',
    investorInitials: 'TP',
    investorMeta: 'Existing investor · $35M',
    investorName: 'Tailwind Partners',
    readiness: readiness(
      { key: 'kycKyb', label: 'KYC / KYB', variant: 'verified', value: 'Verified' },
      { key: 'signature', label: 'Signature', variant: 'signed', value: 'Signed' },
      { key: 'wire', label: 'Wire', variant: 'received', value: 'Received' },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'reconciled',
        value: 'Reconciled',
      },
    ),
    status: { label: 'Complete', tone: 'complete' },
  },
  {
    attention: true,
    commitmentLabel: '$25,000,000',
    commitmentSortValue: 25_000_000,
    entityName: 'Pine Point Capital Fund LP',
    id: 'pine-point-capital',
    avatarTone: 'blush',
    investorInitials: 'PP',
    investorMeta: 'Existing investor · $25M · Attention',
    investorName: 'Pine Point Capital',
    readiness: readiness(
      { key: 'kycKyb', label: 'KYC / KYB', variant: 'expired', value: 'Expired' },
      { key: 'signature', label: 'Signature', variant: 'pending', value: 'Pending' },
      { key: 'wire', label: 'Wire', variant: 'notReceived', value: 'Not received' },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'pending',
        value: 'Pending',
      },
    ),
    status: { label: 'Attention', tone: 'attention' },
  },
  {
    commitmentLabel: '$20,000,000',
    commitmentSortValue: 20_000_000,
    entityName: 'Atlas Secure Fund Ltd',
    id: 'atlas-secure-fund',
    avatarTone: 'blue',
    investorInitials: 'AS',
    investorMeta: 'New investor · $20M',
    investorName: 'Atlas Secure Fund',
    readiness: readiness(
      { key: 'kycKyb', label: 'KYC / KYB', variant: 'verified', value: 'Verified' },
      { key: 'signature', label: 'Signature', variant: 'signed', value: 'Signed' },
      { key: 'wire', label: 'Wire', variant: 'pending', value: 'Pending' },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'notStarted',
        value: 'Not started',
      },
    ),
    status: { label: 'In progress', tone: 'inProgress' },
  },
  {
    commitmentLabel: '$15,000,000',
    commitmentSortValue: 15_000_000,
    entityName: 'Northbridge Advisors LP',
    id: 'northbridge-advisors',
    avatarTone: 'purple',
    investorInitials: 'NA',
    investorMeta: 'Existing investor · $15M',
    investorName: 'Northbridge Advisors',
    readiness: readiness(
      { key: 'kycKyb', label: 'KYC / KYB', variant: 'verified', value: 'Verified' },
      { key: 'signature', label: 'Signature', variant: 'signed', value: 'Signed' },
      { key: 'wire', label: 'Wire', variant: 'received', value: 'Received' },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'reconciling',
        value: 'Reconciling',
      },
    ),
    status: { label: 'In progress', tone: 'inProgress' },
  },
  {
    commitmentLabel: '$12,500,000',
    commitmentSortValue: 12_500_000,
    entityName: 'Elysian Capital LLC',
    id: 'elysian-capital',
    avatarTone: 'teal',
    investorInitials: 'EC',
    investorMeta: 'Existing investor · $12.5M',
    investorName: 'Elysian Capital',
    readiness: readiness(
      { key: 'kycKyb', label: 'KYC / KYB', variant: 'verified', value: 'Verified' },
      { key: 'signature', label: 'Signature', variant: 'signed', value: 'Signed' },
      { key: 'wire', label: 'Wire', variant: 'received', value: 'Received' },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'reconciled',
        value: 'Reconciled',
      },
    ),
    status: { label: 'Complete', tone: 'complete' },
  },
  {
    commitmentLabel: '$10,000,000',
    commitmentSortValue: 10_000_000,
    entityName: 'Maverick Ventures Fund LP',
    id: 'maverick-ventures',
    avatarTone: 'ochre',
    investorInitials: 'MV',
    investorMeta: 'New investor · $10M',
    investorName: 'Maverick Ventures',
    readiness: readiness(
      { key: 'kycKyb', label: 'KYC / KYB', variant: 'inReview', value: 'In review' },
      { key: 'signature', label: 'Signature', variant: 'pending', value: 'Pending' },
      { key: 'wire', label: 'Wire', variant: 'notReceived', value: 'Not received' },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'pending',
        value: 'Pending',
      },
    ),
    status: { label: 'Pending action', tone: 'attention' },
  },
  {
    commitmentLabel: '$7,500,000',
    commitmentSortValue: 7_500_000,
    entityName: 'Silvergate Family Office LLC',
    id: 'silvergate-family-office',
    avatarTone: 'slate',
    investorInitials: 'SF',
    investorMeta: 'Existing investor · $7.5M',
    investorName: 'Silvergate Family Office',
    readiness: readiness(
      { key: 'kycKyb', label: 'KYC / KYB', variant: 'verified', value: 'Verified' },
      { key: 'signature', label: 'Signature', variant: 'signed', value: 'Signed' },
      { key: 'wire', label: 'Wire', variant: 'received', value: 'Received' },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'reconciled',
        value: 'Reconciled',
      },
    ),
    status: { label: 'Complete', tone: 'complete' },
  },
  {
    commitmentLabel: '$5,000,000',
    commitmentSortValue: 5_000_000,
    entityName: 'Redwood Wealth Partners LP',
    id: 'redwood-wealth',
    avatarTone: 'brown',
    investorInitials: 'RW',
    investorMeta: 'New investor · $5M',
    investorName: 'Redwood Wealth',
    readiness: readiness(
      { key: 'kycKyb', label: 'KYC / KYB', variant: 'verified', value: 'Verified' },
      { key: 'signature', label: 'Signature', variant: 'signed', value: 'Signed' },
      { key: 'wire', label: 'Wire', variant: 'pending', value: 'Pending' },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'notStarted',
        value: 'Not started',
      },
    ),
    status: { label: 'In progress', tone: 'inProgress' },
  },
  {
    commitmentLabel: '$18,000,000',
    commitmentSortValue: 18_000_000,
    entityName: 'Harborview Endowment LP',
    id: 'harborview-endowment',
    avatarTone: 'navy',
    investorInitials: 'HE',
    investorMeta: 'Existing investor · $18M',
    investorName: 'Harborview Endowment',
    readiness: readiness(
      { key: 'kycKyb', label: 'KYC / KYB', variant: 'verified', value: 'Verified' },
      { key: 'signature', label: 'Signature', variant: 'signed', value: 'Signed' },
      { key: 'wire', label: 'Wire', variant: 'received', value: 'Received' },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'reconciled',
        value: 'Reconciled',
      },
    ),
    status: { label: 'Complete', tone: 'complete' },
  },
  {
    commitmentLabel: '$16,000,000',
    commitmentSortValue: 16_000_000,
    entityName: 'Bluecrest Growth Fund LP',
    id: 'bluecrest-growth',
    avatarTone: 'blue',
    investorInitials: 'BG',
    investorMeta: 'New investor · $16M',
    investorName: 'Bluecrest Growth',
    readiness: readiness(
      { key: 'kycKyb', label: 'KYC / KYB', variant: 'verified', value: 'Verified' },
      { key: 'signature', label: 'Signature', variant: 'pending', value: 'Pending' },
      { key: 'wire', label: 'Wire', variant: 'notReceived', value: 'Not received' },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'pending',
        value: 'Pending',
      },
    ),
    status: { label: 'Pending action', tone: 'attention' },
  },
  {
    commitmentLabel: '$14,600,000',
    commitmentSortValue: 14_600_000,
    entityName: 'Summit Ridge Advisors LP',
    id: 'summit-ridge',
    avatarTone: 'purple',
    investorInitials: 'SR',
    investorMeta: 'Existing investor · $14.6M',
    investorName: 'Summit Ridge',
    readiness: readiness(
      { key: 'kycKyb', label: 'KYC / KYB', variant: 'inReview', value: 'In review' },
      { key: 'signature', label: 'Signature', variant: 'signed', value: 'Signed' },
      { key: 'wire', label: 'Wire', variant: 'received', value: 'Received' },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'reconciling',
        value: 'Reconciling',
      },
    ),
    status: { label: 'In progress', tone: 'inProgress' },
  },
  {
    commitmentLabel: '$9,000,000',
    commitmentSortValue: 9_000_000,
    entityName: 'Cedar Point Trust LLC',
    id: 'cedar-point-trust',
    avatarTone: 'teal',
    investorInitials: 'CP',
    investorMeta: 'Existing investor · $9M',
    investorName: 'Cedar Point Trust',
    readiness: readiness(
      { key: 'kycKyb', label: 'KYC / KYB', variant: 'verified', value: 'Verified' },
      { key: 'signature', label: 'Signature', variant: 'signed', value: 'Signed' },
      { key: 'wire', label: 'Wire', variant: 'received', value: 'Received' },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'reconciled',
        value: 'Reconciled',
      },
    ),
    status: { label: 'Complete', tone: 'complete' },
  },
] as const satisfies readonly CommitmentInvestorRow[]

export const dataIssueCommitmentRows = lockedCommitmentRows.map((row) =>
  row.id === 'atlas-secure-fund'
    ? {
        ...row,
        dataIssue: {
          label: 'Readiness sync failed',
          tone: 'danger',
        },
        readiness: readiness(
          { ...row.readiness.kycKyb, variant: 'unavailable', value: 'Unavailable' },
          { ...row.readiness.signature, variant: 'unavailable', value: 'Unavailable' },
          { ...row.readiness.wire, variant: 'syncFailed', value: 'Sync failed' },
          { ...row.readiness.reconciliation, variant: 'needsReview', value: 'Needs review' },
        ),
      }
    : row,
) satisfies readonly CommitmentInvestorRow[]

export const disabledCommitmentRows = lockedCommitmentRows.map((row) =>
  row.id === 'maverick-ventures'
    ? {
        ...row,
        disabled: true,
      }
    : row,
) satisfies readonly CommitmentInvestorRow[]

export const longTextCommitmentRows = [
  {
    ...lockedCommitmentRows[0],
    commitmentLabel: '$123,456,789',
    commitmentSortValue: 123_456_789,
    entityName:
      'North American Evergreen Private Capital Continuation Feeder Vehicle Series 2026 LP',
    id: 'long-text-investor',
    investorInitials: 'LC',
    investorMeta:
      'Existing investor · cross-border feeder vehicle · awaiting final operations review',
    investorName: 'Longview Capital Strategic Opportunities Evergreen Partners',
    readiness: readiness(
      {
        key: 'kycKyb',
        label: 'KYC / KYB',
        variant: 'inReview',
        value: 'In review',
        detail: 'Enhanced diligence review in progress',
      },
      {
        key: 'signature',
        label: 'Signature',
        variant: 'pending',
        value: 'Pending',
        detail: 'Awaiting delegated signatory confirmation',
      },
      {
        key: 'wire',
        label: 'Wire',
        variant: 'notReceived',
        value: 'Not received',
        detail: 'Not received from treasury operations',
      },
      {
        key: 'reconciliation',
        label: 'Reconciliation',
        variant: 'reconciling',
        value: 'Reconciling',
        detail: 'Reconciling subscription and wire details',
      },
    ),
    status: {
      label: 'Operations review pending with fund administrator',
      tone: 'attention',
    },
  },
  ...lockedCommitmentRows.slice(1),
] satisfies readonly CommitmentInvestorRow[]

export const dealCommitmentsTableLabels = {
  footer: {
    investorsLabel: '12 investors',
    rangeLabel: '1–8 of 12',
    rowsPerPageLabel: 'Rows per page 8',
    totalCommittedLabel: 'Overall committed $187,600,000',
  },
  subtitle: 'Investor readiness across KYC/KYB, signature, and wire.',
  title: 'Commitments',
  toolbar: {
    searchPlaceholder: 'Search investors',
    selectedLabel: 'selected',
    workflowFiltersLabel: 'Workflow filters',
  },
  labels: {
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
      emptyTotalCommittedLabel: 'Total committed $0',
      investorsLabel: (count: number) => `${count} ${count === 1 ? 'investor' : 'investors'}`,
      nextPageLabel: 'Next page',
      previousPageLabel: 'Previous page',
      rangeLabel: (start: number, end: number, total: number) => `${start}–${end} of ${total}`,
      rowsPerPageLabel: (pageSize: number) => `Rows per page ${pageSize}`,
      rowsPerPageOptionLabel: (pageSize: number) => `${pageSize} rows`,
    },
    row: {
      groupSummaryLabel: (label: string, count: number) =>
        `${label} · ${count} ${count === 1 ? 'investor' : 'investors'}`,
      openDetailsLabel: (row: CommitmentInvestorRow) =>
        `Open commitment detail for ${row.investorName}`,
      selectRowLabel: (row: CommitmentInvestorRow) => `Select ${row.investorName}`,
    },
    selection: {
      selectAllVisibleLabel: 'Select all visible commitments',
    },
  },
} as const satisfies Pick<
  DealCommitmentsTableProps,
  'footer' | 'labels' | 'subtitle' | 'title' | 'toolbar'
>

export const dealCommitmentsTableExportToolbarLabels = {
  exportLabel: 'Export',
  exportSelectedLabel: 'Export selected',
  exportVisibleLabel: 'Export visible',
} as const

export const emptyDealCommitmentsTableLabels = {
  ...dealCommitmentsTableLabels,
  footer: {
    investorsLabel: '0 investors',
    rangeLabel: '0–0 of 0',
    rowsPerPageLabel: 'Rows per page 8',
    totalCommittedLabel: 'Total committed $0',
  },
} as const satisfies Pick<
  DealCommitmentsTableProps,
  'footer' | 'labels' | 'subtitle' | 'title' | 'toolbar'
>

export const errorDealCommitmentsTableLabels = {
  ...dealCommitmentsTableLabels,
  footer: {
    investorsLabel: 'Investors unavailable',
    rangeLabel: 'Range unavailable',
    rowsPerPageLabel: 'Rows per page 8',
    totalCommittedLabel: 'Total committed unavailable',
  },
} as const satisfies Pick<
  DealCommitmentsTableProps,
  'footer' | 'labels' | 'subtitle' | 'title' | 'toolbar'
>
