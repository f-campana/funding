import type {
  DealProgressCapitalSummary,
  DealProgressPanelProps,
  DealProgressPanelState,
} from './deal-progress-panel'

export const dealProgressPanelLabels = {
  progressAriaLabel: 'Deal capital progress',
  title: 'Deal progression',
} as const satisfies DealProgressPanelProps['labels']

const segmentedCapital = {
  amountRaisedLabel: '€100,000',
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
  details: [
    { label: 'Investable amount', value: '€95,500' },
    { label: 'Entry fees', value: '€2,500' },
    { label: 'SPV fees', value: '€2,000' },
  ],
  headlineLabel: '€100,000 / €200,000',
  progress: {
    basisPoints: 5_000,
    kind: 'knownTarget',
    label: 'Amount raised / target',
  },
  targetAmountLabel: '€200,000',
} as const satisfies DealProgressCapitalSummary

const highValueCapital = {
  amountRaisedLabel: '€87,800,000',
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
  targetAmountLabel: '€89.1M',
} as const satisfies DealProgressCapitalSummary

const readyBase = {
  actions: {
    primary: { kind: 'closeDeal', label: 'Close deal' },
    secondary: [{ kind: 'invite', label: 'Invite' }],
  },
  capital: segmentedCapital,
  mode: 'collectingCommitments',
  stage: 'open',
  status: { label: 'Collecting commitments', tone: 'success' },
  visibility: { kind: 'adminOnly', label: 'Only visible to admins' },
} as const satisfies Omit<Extract<DealProgressPanelState, { readonly kind: 'ready' }>, 'kind'>

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
  status: { label: 'Ongoing closing', tone: 'success' },
} as const satisfies DealProgressPanelState

export const openForInterestsState = {
  ...readyBase,
  actions: {
    primary: { kind: 'invite', label: 'Invite investors' },
  },
  capital: {
    amountRaisedLabel: '€0',
    details: [{ label: 'Target allocation', value: '€2,000,000' }],
    headlineLabel: '€0 / €2,000,000',
    progress: {
      basisPoints: 0,
      kind: 'knownTarget',
      label: 'Interest collection progress',
    },
    targetAmountLabel: '€2,000,000',
  },
  kind: 'ready',
  mode: 'openForInterests',
  stage: 'open',
  status: { label: 'Open for interests', tone: 'info' },
} as const satisfies DealProgressPanelState

export const moveToContractingState = {
  ...readyBase,
  actions: {
    primary: { kind: 'moveToContracting', label: 'Move deal to contracting', audience: 'admin' },
    secondary: [{ kind: 'invite', label: 'Invite' }],
  },
  capital: highValueCapital,
  kind: 'ready',
  mode: 'contracting',
  stage: 'preClosing',
  status: { label: 'Ready for contracting', tone: 'attention' },
} as const satisfies DealProgressPanelState

export const readyToCloseState = {
  ...readyBase,
  actions: {
    primary: { kind: 'closeDeal', label: 'Close deal', audience: 'admin' },
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
  status: { label: 'Ready to close', tone: 'success' },
} as const satisfies DealProgressPanelState

export const closedCompletedState = {
  ...readyBase,
  actions: {
    primary: { kind: 'closeDeal', label: 'Close deal', audience: 'admin' },
    secondary: [{ kind: 'invite', label: 'Invite', audience: 'admin' }],
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
  status: { label: 'Completed', tone: 'success' },
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
    amountRaisedLabel: '€225,000',
    headlineLabel: '€225,000 / €200,000',
    progress: {
      basisPoints: 11_250,
      capped: true,
      kind: 'knownTarget',
      label: 'Amount raised / target',
    },
  },
  kind: 'ready',
  status: { label: 'Over target', tone: 'attention' },
} as const satisfies DealProgressPanelState

export const noTargetKnownState = {
  ...readyBase,
  capital: {
    amountRaisedLabel: '€640,000',
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
  status: { label: 'Target pending', tone: 'pending' },
} as const satisfies DealProgressPanelState

export const readonlyNonAdminState = {
  ...readyBase,
  actions: {
    primary: { audience: 'admin', kind: 'closeDeal', label: 'Close deal' },
    secondary: [{ audience: 'admin', kind: 'invite', label: 'Invite' }],
  },
  kind: 'ready',
  visibility: { kind: 'readonly', label: 'Read-only view' },
} as const satisfies DealProgressPanelState

export const disabledActionsState = {
  ...readyBase,
  actions: {
    primary: {
      audience: 'admin',
      disabledReason: 'Resolve pending KYC/KYB and wire confirmations before closing.',
      kind: 'closeDeal',
      label: 'Close deal',
    },
    secondary: [{ kind: 'invite', label: 'Invite' }],
  },
  kind: 'ready',
  status: { label: 'Action blocked', tone: 'attention' },
} as const satisfies DealProgressPanelState

export const adminOnlyState = {
  ...readyBase,
  kind: 'ready',
  visibility: { kind: 'adminOnly', label: 'Only visible to admins' },
} as const satisfies DealProgressPanelState

export const dataIssueState = {
  ...readyBase,
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
  retryLabel: 'Retry',
  title: 'Deal progression could not be loaded',
} as const satisfies DealProgressPanelState
