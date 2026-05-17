import type {
  DealProgressCapitalSummary,
  DealProgressPanelProps,
  DealProgressPanelState,
} from './deal-progress-panel'

export const dealProgressPanelLabels = {
  capitalBreakdownLabel: 'Capital breakdown',
  capitalCompositionLabel: 'Capital composition',
  progressCappedLabel: 'capped',
  progressAriaLabel: 'Deal capital progress',
  title: 'Deal progression',
} as const satisfies DealProgressPanelProps['labels']

const segmentedCapital = {
  breakdown: [
    {
      amountLabel: '€95,500',
      basisPoints: 4_775,
      kind: 'investable',
      label: 'Investable',
      tone: 'success',
    },
    {
      amountLabel: '€2,500',
      basisPoints: 125,
      kind: 'entryFees',
      label: 'Entry fees',
      tone: 'info',
    },
    {
      amountLabel: '€2,000',
      basisPoints: 100,
      kind: 'spvFees',
      label: 'SPV fees',
      tone: 'attention',
    },
  ],
  headlineLabel: '€100,000 / €200,000',
  progress: {
    basisPoints: 5_000,
    kind: 'knownTarget',
    label: 'Amount raised / target',
  },
} as const satisfies DealProgressCapitalSummary

const highValueCapital = {
  details: [
    { label: 'Investable amount', value: '€86,746,400' },
    { label: 'SPV fees', value: '€1,053,600' },
    { label: 'Unique viewers', value: '15', tone: 'neutral' },
  ],
  headlineLabel: '€87,800,000 / €89.1M',
  progress: {
    basisPoints: 9_854,
    kind: 'knownTarget',
    label: 'Amount raised / target',
  },
} as const satisfies DealProgressCapitalSummary

const readyBase = {
  actions: {
    kind: 'available',
    primary: {
      audience: 'admin',
      availability: 'enabled',
      kind: 'closeDeal',
      label: 'Close deal',
    },
    secondary: [
      {
        audience: 'admin',
        availability: 'enabled',
        kind: 'invite',
        label: 'Invite',
      },
    ],
  },
  capital: segmentedCapital,
  dataQuality: { kind: 'fresh' },
  mode: 'collectingCommitments',
  stage: 'open',
  status: { kind: 'collectingCommitments', label: 'Collecting commitments', tone: 'success' },
  visibility: { kind: 'adminOnly', label: 'Only visible to admins' },
} as const

export const defaultCollectingCommitmentsState = {
  ...readyBase,
  kind: 'ready',
} as const satisfies DealProgressPanelState

export const ongoingClosingState = {
  ...readyBase,
  capital: {
    ...segmentedCapital,
    headlineLabel: '€126,000 / €180,000',
    progress: {
      basisPoints: 7_000,
      kind: 'knownTarget',
      label: 'Ongoing collection progress',
    },
  },
  kind: 'ready',
  mode: 'ongoingClosing',
  status: { kind: 'ongoingClosing', label: 'Ongoing closing', tone: 'success' },
} as const satisfies DealProgressPanelState

export const openForInterestsState = {
  ...readyBase,
  actions: {
    kind: 'available',
    primary: {
      audience: 'admin',
      availability: 'enabled',
      kind: 'invite',
      label: 'Invite investors',
    },
  },
  capital: {
    details: [{ label: 'Target allocation', value: '€2,000,000' }],
    headlineLabel: '€0 / €2,000,000',
    progress: {
      basisPoints: 0,
      kind: 'knownTarget',
      label: 'Interest collection progress',
    },
  },
  kind: 'ready',
  mode: 'openForInterests',
  stage: 'open',
  status: { kind: 'openForInterests', label: 'Open for interests', tone: 'info' },
} as const satisfies DealProgressPanelState

export const moveToContractingState = {
  ...readyBase,
  actions: {
    kind: 'available',
    primary: {
      audience: 'admin',
      availability: 'enabled',
      kind: 'moveToContracting',
      label: 'Move deal to contracting',
    },
    secondary: [
      {
        audience: 'admin',
        availability: 'enabled',
        kind: 'invite',
        label: 'Invite',
      },
    ],
  },
  capital: highValueCapital,
  kind: 'ready',
  mode: 'contracting',
  stage: 'preClosing',
  status: { kind: 'contracting', label: 'Ready for contracting', tone: 'attention' },
} as const satisfies DealProgressPanelState

export const readyToCloseState = {
  ...readyBase,
  actions: {
    kind: 'available',
    primary: {
      audience: 'admin',
      availability: 'enabled',
      kind: 'closeDeal',
      label: 'Close deal',
    },
  },
  capital: {
    ...segmentedCapital,
    headlineLabel: '€200,000 / €200,000',
    progress: {
      basisPoints: 10_000,
      kind: 'knownTarget',
      label: 'Amount raised / target',
    },
  },
  kind: 'ready',
  mode: 'readyToClose',
  stage: 'closing',
  status: { kind: 'readyToClose', label: 'Ready to close', tone: 'success' },
} as const satisfies DealProgressPanelState

export const closedCompletedState = {
  ...readyBase,
  actions: {
    kind: 'none',
  },
  capital: {
    ...segmentedCapital,
    headlineLabel: '€200,000 / €200,000',
    progress: {
      basisPoints: 10_000,
      kind: 'knownTarget',
      label: 'Final amount raised',
    },
  },
  kind: 'ready',
  mode: 'closed',
  stage: 'completed',
  status: { kind: 'completed', label: 'Completed', tone: 'success' },
  visibility: { kind: 'restricted', label: 'Visible to deal admins and investors' },
} as const satisfies DealProgressPanelState

export const segmentedProgressState = {
  ...readyBase,
  capital: segmentedCapital,
  kind: 'ready',
} as const satisfies DealProgressPanelState

export const zeroProgressState = {
  ...openForInterestsState,
  kind: 'ready',
} as const satisfies DealProgressPanelState

export const overTargetCappedState = {
  ...readyBase,
  capital: {
    ...segmentedCapital,
    headlineLabel: '€225,000 / €200,000',
    progress: {
      basisPoints: 11_250,
      capped: true,
      kind: 'knownTarget',
      label: 'Amount raised / target',
    },
  },
  kind: 'ready',
  status: { kind: 'collectingCommitments', label: 'Over target', tone: 'attention' },
} as const satisfies DealProgressPanelState

export const noTargetKnownState = {
  ...readyBase,
  capital: {
    details: [
      {
        description: 'Target allocation has not been confirmed by operations.',
        label: 'Amount raised',
        value: '€640,000',
      },
    ],
    headlineLabel: '€640,000 raised',
    progress: {
      kind: 'noTarget',
      label: 'Target amount not available',
    },
  },
  kind: 'ready',
  mode: 'standardClosing',
  status: { kind: 'standardClosing', label: 'Target pending', tone: 'pending' },
} as const satisfies DealProgressPanelState

export const readonlyNonAdminState = {
  ...readyBase,
  actions: {
    kind: 'none',
  },
  kind: 'ready',
  visibility: { kind: 'readonly', label: 'Read-only view' },
} as const satisfies DealProgressPanelState

export const disabledActionsState = {
  ...readyBase,
  actions: {
    kind: 'available',
    primary: {
      audience: 'admin',
      availability: 'disabled',
      disabledReason: 'Resolve pending KYC/KYB and wire confirmations before closing.',
      kind: 'closeDeal',
      label: 'Close deal',
    },
    secondary: [
      {
        audience: 'admin',
        availability: 'enabled',
        kind: 'invite',
        label: 'Invite',
      },
    ],
  },
  kind: 'ready',
  status: { kind: 'collectingCommitments', label: 'Action blocked', tone: 'attention' },
} as const satisfies DealProgressPanelState

export const adminOnlyState = {
  ...readyBase,
  kind: 'ready',
  visibility: { kind: 'adminOnly', label: 'Only visible to admins' },
} as const satisfies DealProgressPanelState

export const dataIssueState = {
  ...readyBase,
  capital: {
    ...segmentedCapital,
    details: [
      {
        description: 'Refresh fund admin sync before closing decisions.',
        label: 'Affected workflow',
        tone: 'attention',
        value: 'Wire reconciliation',
      },
    ],
  },
  dataQuality: {
    description: 'Wire reconciliation data was last synced 2 hours ago.',
    kind: 'stale',
    label: 'Progress data may be stale',
  },
  kind: 'ready',
} as const satisfies DealProgressPanelState

export const loadingState = {
  kind: 'loading',
  label: 'Loading deal progression',
} as const satisfies DealProgressPanelState

export const errorState = {
  description: 'Refresh the page or try again.',
  kind: 'error',
  retryAction: { kind: 'retry', label: 'Retry' },
  title: 'Deal progression could not be loaded',
} as const satisfies DealProgressPanelState
