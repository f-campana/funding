export const readinessLabels = {
  blockers: 'blockers',
  closingDate: 'Closing review',
  deadline: 'Deadline',
  lastUpdated: 'Last updated',
  remaining: 'Remaining',
} as const

export const blockerLabels = {
  acknowledge: 'Acknowledge locally',
  acknowledged: 'Acknowledged locally',
  dueState: {
    due_soon: 'Due soon',
    due_today: 'Due today',
    no_due_date: 'No due date',
    on_track: 'On track',
    overdue: 'Overdue',
  },
  empty: 'No blockers for the next close.',
  hideDetails: 'Hide details',
  nextAction: 'Next action',
  owner: 'Owner',
  severity: {
    critical: 'Critical',
    info: 'Info',
    warning: 'Warning',
  },
  showDetails: 'Show details',
} as const

export const capitalLabels = {
  committed: 'Committed',
  description: 'Capital is separated by operational stage before the close.',
  matched: 'Matched',
  overTarget: 'Over target',
  received: 'Received',
  remaining: 'Remaining',
  signed: 'Signed',
  target: 'Target',
  title: 'Capital reconciliation',
  unfunded: 'Unfunded committed',
  unmatched: 'Unmatched received',
} as const

export const dealProgressLabels = {
  committed: 'Committed',
  deadline: 'Deadline',
  lifecycle: 'Lifecycle',
  matched: 'Matched',
  nextAction: 'Next action',
  progress: 'Commitment progress',
  target: 'Target',
} as const

export const documentLabels = {
  approved: 'approved',
  empty: 'No document requirements yet.',
  expired: 'Expired',
  missing: 'Missing',
  optional: 'Optional',
  owner: {
    deal: 'Deal',
    fund: 'Fund',
    investor: 'Investor',
    legal_entity: 'Legal entity',
    spv: 'SPV',
  },
  rejected: 'Rejected',
  required: 'Required',
  status: {
    approved: 'Approved',
    expired: 'Expired',
    missing: 'Missing',
    rejected: 'Rejected',
    under_review: 'Under review',
    uploaded: 'Uploaded',
  },
  underReview: 'Under review',
} as const

export const investorStatusLabels = {
  empty: 'No investor statuses yet.',
  percentage: 'Share',
} as const

export const activityLabels = {
  empty: 'No recent activity.',
  title: 'Activity timeline',
} as const

export const investorTableLabels = {
  columns: {
    actions: 'Actions',
    commitmentAmount: 'Commitment',
    commitmentStatus: 'Status',
    investor: 'Investor',
    kyb: 'KYB',
    kyc: 'KYC',
    legalEntity: 'Legal entity',
    signature: 'Signature',
    wire: 'Wire',
  },
  empty: 'No investor commitments yet.',
  inspectAction: 'Inspect',
  noLegalEntity: 'Natural person',
  notApplicable: 'N/A',
} as const

export const commitmentInspectorLabels = {
  actions: 'Actions',
  activity: 'Recent activity',
  approve: 'Approve next step',
  blockers: 'Blockers',
  commitment: 'Commitment',
  documents: 'Documents',
  documentStatus: documentLabels.status,
  empty: 'Select an investor to inspect operational state.',
  identity: 'Identity',
  legalEntity: 'Legal entity',
  noActivity: 'No recent activity for this investor.',
  noBlockers: 'No active blockers for this investor.',
  noDocuments: 'No linked documents.',
  noLegalEntity: 'Natural person',
  openDocuments: 'Open documents',
  remind: 'Send reminder',
  status: {
    commitment: 'Commitment',
    kyb: 'KYB',
    kyc: 'KYC',
    signature: 'Signature',
    wire: 'Wire',
  },
  statuses: 'Operational status',
} as const
