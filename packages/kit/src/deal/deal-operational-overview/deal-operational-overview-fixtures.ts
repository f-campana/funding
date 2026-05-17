import type {
  DealOperationalCapitalSummary,
  DealOperationalOverviewLabels,
  DealOperationalOverviewState,
  DealOperationalReadinessSummary,
} from './deal-operational-overview'

export const dealOperationalOverviewLabels = {
  activityTitle: 'Latest activity',
  blockerCountsLabel: 'Blocker counts by severity',
  blockersTitle: 'Priority blockers',
  capitalEconomicsTitle: 'Economics',
  capitalMetricsTitle: 'Reconciliation metrics',
  capitalProgressAriaLabel: 'Capital reconciliation progress',
  capitalTitle: 'Capital reconciliation',
  dimensionsTitle: 'Readiness dimensions',
  loadingLabel: 'Loading operational overview',
  nextActionLabel: 'Next action',
  noActivityLabel: 'No recent operational activity.',
  noBlockersLabel: 'No priority blockers are open.',
  readinessTitle: 'Closing readiness',
  subtitle: 'Mission-control surface for close readiness, blockers, capital, and recent movement.',
  title: 'Operational overview',
} as const satisfies DealOperationalOverviewLabels

const northstarCapital = {
  economics: [
    { label: 'Net investable', value: '€4,612,500', tone: 'success' },
    { label: 'Entry fees', value: '€97,000' },
    { label: 'SPV fee', value: '€72,750' },
    { label: 'Carry', value: '10%' },
  ],
  headlineLabel: '€4,850,000 committed',
  matchedLabel: '€3,650,000 matched',
  metrics: [
    { label: 'Signed', value: '€4,850,000', tone: 'success' },
    { label: 'Received', value: '€3,910,000' },
    { label: 'Unreceived signed', value: '€940,000', tone: 'attention' },
    { label: 'Unmatched received', value: '€260,000', tone: 'danger' },
  ],
  progress: { label: '97% of target', value: 97 },
  supportingLabel: '73 investor records',
  targetLabel: '€5,000,000 target',
} as const satisfies DealOperationalCapitalSummary

const readyCapital = {
  ...northstarCapital,
  headlineLabel: '€5,000,000 committed',
  matchedLabel: '€5,000,000 matched',
  metrics: [
    { label: 'Signed', value: '€5,000,000', tone: 'success' },
    { label: 'Received', value: '€5,000,000', tone: 'success' },
    { label: 'Unreceived signed', value: '€0', tone: 'neutral' },
    { label: 'Unmatched received', value: '€0', tone: 'neutral' },
  ],
  progress: { label: '100% of target reconciled', value: 100 },
  supportingLabel: '76 investor records',
} as const satisfies DealOperationalCapitalSummary

const blockedReadiness = {
  blockerCounts: [
    { count: 2, label: 'Critical', severity: 'critical' },
    { count: 3, label: 'High', severity: 'high' },
    { count: 1, label: 'Medium', severity: 'medium' },
    { count: 0, label: 'Low', severity: 'low' },
  ],
  dimensions: [
    {
      blockerCount: 2,
      description: 'Two subscription entities still need verified beneficiary ownership.',
      id: 'investor-identity',
      label: 'Investor identity',
      state: 'blocked',
    },
    {
      blockerCount: 1,
      description: 'One counter-signature package is waiting on sponsor approval.',
      id: 'signatures',
      label: 'Signatures',
      state: 'attention',
    },
    {
      blockerCount: 2,
      description: 'Incoming wires need investor-level matching before close.',
      id: 'wires',
      label: 'Wires',
      state: 'blocked',
    },
    {
      blockerCount: 1,
      description: 'Final executed side letter is uploaded but not operator-reviewed.',
      id: 'documents',
      label: 'Documents',
      state: 'attention',
    },
    {
      blockerCount: 1,
      description: 'Unmatched receipts remain above the close tolerance.',
      id: 'capital-reconciliation',
      label: 'Capital reconciliation',
      state: 'attention',
    },
    {
      blockerCount: 0,
      description: 'Vehicle banking and administrator onboarding are confirmed.',
      id: 'vehicle-setup',
      label: 'Vehicle setup',
      state: 'ready',
    },
  ],
  label: 'Blocked from close',
  nextAction: 'Resolve identity and wire matching blockers before scheduling final close.',
  state: 'blocked',
} as const satisfies DealOperationalReadinessSummary

const attentionReadiness = {
  ...blockedReadiness,
  blockerCounts: [
    { count: 0, label: 'Critical', severity: 'critical' },
    { count: 1, label: 'High', severity: 'high' },
    { count: 2, label: 'Medium', severity: 'medium' },
    { count: 1, label: 'Low', severity: 'low' },
  ],
  dimensions: [
    {
      blockerCount: 0,
      description: 'All investor identity checks are operator-reviewed.',
      id: 'investor-identity',
      label: 'Investor identity',
      state: 'ready',
    },
    {
      blockerCount: 1,
      description: 'Sponsor counter-signature needs final release.',
      id: 'signatures',
      label: 'Signatures',
      state: 'attention',
    },
    {
      blockerCount: 0,
      description: 'Wire receipts are matched to investor records.',
      id: 'wires',
      label: 'Wires',
      state: 'ready',
    },
    {
      blockerCount: 1,
      description: 'One investor document package needs final review.',
      id: 'documents',
      label: 'Documents',
      state: 'attention',
    },
    {
      blockerCount: 1,
      description: 'Capital is within close tolerance after administrator review.',
      id: 'capital-reconciliation',
      label: 'Capital reconciliation',
      state: 'attention',
    },
    {
      blockerCount: 0,
      description: 'Vehicle setup is complete.',
      id: 'vehicle-setup',
      label: 'Vehicle setup',
      state: 'ready',
    },
  ],
  label: 'Attention needed',
  nextAction: 'Confirm final signatures and economics before issuing close instructions.',
  state: 'attention',
} as const satisfies DealOperationalReadinessSummary

const readyReadiness = {
  blockerCounts: [
    { count: 0, label: 'Critical', severity: 'critical' },
    { count: 0, label: 'High', severity: 'high' },
    { count: 0, label: 'Medium', severity: 'medium' },
    { count: 0, label: 'Low', severity: 'low' },
  ],
  dimensions: [
    {
      blockerCount: 0,
      description: 'Identity checks are complete for all closing investors.',
      id: 'investor-identity',
      label: 'Investor identity',
      state: 'ready',
    },
    {
      blockerCount: 0,
      description: 'Signature packages are fully executed.',
      id: 'signatures',
      label: 'Signatures',
      state: 'ready',
    },
    {
      blockerCount: 0,
      description: 'All wires are received and matched.',
      id: 'wires',
      label: 'Wires',
      state: 'ready',
    },
    {
      blockerCount: 0,
      description: 'Closing document set is complete.',
      id: 'documents',
      label: 'Documents',
      state: 'ready',
    },
    {
      blockerCount: 0,
      description: 'Capital is reconciled against the final target.',
      id: 'capital-reconciliation',
      label: 'Capital reconciliation',
      state: 'ready',
    },
    {
      blockerCount: 0,
      description: 'Vehicle setup is confirmed.',
      id: 'vehicle-setup',
      label: 'Vehicle setup',
      state: 'ready',
    },
  ],
  label: 'Ready to close',
  nextAction: 'Send the closing packet to the signing operator.',
  state: 'ready',
} as const satisfies DealOperationalReadinessSummary

const latestActivity = [
  {
    actor: 'Operations',
    dateTime: '2026-05-17T08:35:00.000Z',
    id: 'capital-sync',
    summary: 'Matched €410,000 of incoming wires to signed subscription records.',
    timestampLabel: 'Today 10:35',
    tone: 'success',
    typeLabel: 'Capital',
  },
  {
    actor: 'Fund admin',
    dateTime: '2026-05-16T16:20:00.000Z',
    id: 'wire-review',
    summary: 'Flagged two unmatched receipts for investor-level reconciliation.',
    timestampLabel: 'Yesterday 18:20',
    tone: 'attention',
    typeLabel: 'Wires',
  },
  {
    actor: 'Legal',
    dateTime: '2026-05-16T10:10:00.000Z',
    id: 'signature-release',
    summary: 'Released countersignature package for the final subscription batch.',
    timestampLabel: 'Yesterday 12:10',
    tone: 'info',
    typeLabel: 'Documents',
  },
] as const

export const blockedOperationalOverviewState = {
  activity: latestActivity,
  blockerSummary:
    'Six close-impacting items remain. The critical path is investor identity plus wire matching.',
  blockers: [
    {
      description: 'Beneficial owner evidence is missing for two subscription entities.',
      documentCountLabel: '3 documents',
      dueLabel: 'Due today',
      id: 'bo-evidence',
      investorCountLabel: '2 investors',
      owner: 'Investor operations',
      severity: 'critical',
      severityLabel: 'Critical',
      surfaceLabel: 'Investor identity',
      title: 'Verify beneficial owner evidence',
    },
    {
      description: 'Receipts from two banking references are not matched to signed commitments.',
      dueLabel: 'Due today',
      id: 'wire-matching',
      investorCountLabel: '2 investors',
      owner: 'Fund admin',
      severity: 'critical',
      severityLabel: 'Critical',
      surfaceLabel: 'Wires',
      title: 'Match incoming wires',
    },
    {
      description: 'Unmatched received capital is above the tolerance for final close approval.',
      dueLabel: 'Due tomorrow',
      id: 'unmatched-received',
      owner: 'Finance',
      severity: 'high',
      severityLabel: 'High',
      surfaceLabel: 'Capital reconciliation',
      title: 'Reduce unmatched received balance',
    },
  ],
  capital: northstarCapital,
  kind: 'ready',
  readiness: blockedReadiness,
} as const satisfies DealOperationalOverviewState

export const attentionOperationalOverviewState = {
  ...blockedOperationalOverviewState,
  blockerSummary:
    'No critical blockers remain. Final signature release and economics review are on the close path.',
  blockers: [
    {
      description: 'Sponsor countersignature package is approved but not released.',
      documentCountLabel: '1 document',
      dueLabel: 'Due today',
      id: 'signature-release',
      investorCountLabel: '1 investor',
      owner: 'Legal',
      severity: 'high',
      severityLabel: 'High',
      surfaceLabel: 'Signatures',
      title: 'Release final countersignature',
    },
    {
      description: 'Carry and fee memo needs final operator signoff before close packet creation.',
      dueLabel: 'Due tomorrow',
      id: 'fee-memo',
      owner: 'Finance',
      severity: 'medium',
      severityLabel: 'Medium',
      surfaceLabel: 'Economics',
      title: 'Approve economics memo',
    },
  ],
  capital: {
    ...northstarCapital,
    matchedLabel: '€4,720,000 matched',
    metrics: [
      { label: 'Signed', value: '€4,850,000', tone: 'success' },
      { label: 'Received', value: '€4,760,000', tone: 'success' },
      { label: 'Unreceived signed', value: '€90,000', tone: 'attention' },
      { label: 'Unmatched received', value: '€40,000', tone: 'attention' },
    ],
    progress: { label: '97% of target; reconciliation within tolerance', value: 97 },
  },
  readiness: attentionReadiness,
} as const satisfies DealOperationalOverviewState

export const readyOperationalOverviewState = {
  ...blockedOperationalOverviewState,
  activity: [
    {
      actor: 'Operations',
      dateTime: '2026-05-17T09:00:00.000Z',
      id: 'close-ready',
      summary: 'Marked all readiness dimensions ready for final close.',
      timestampLabel: 'Today 11:00',
      tone: 'success',
      typeLabel: 'Readiness',
    },
    {
      actor: 'Finance',
      dateTime: '2026-05-17T08:45:00.000Z',
      id: 'capital-final',
      summary: 'Confirmed final capital reconciliation at €5,000,000.',
      timestampLabel: 'Today 10:45',
      tone: 'success',
      typeLabel: 'Capital',
    },
  ],
  blockerSummary: 'All close-critical blockers are resolved.',
  blockers: [],
  capital: readyCapital,
  readiness: readyReadiness,
} as const satisfies DealOperationalOverviewState

export const longTextOperationalOverviewState = {
  ...blockedOperationalOverviewState,
  blockerSummary:
    'The close can proceed only after a cross-functional exception review resolves the longest-running investor identity, capital matching, and document evidence issues in the final closing cohort.',
  blockers: [
    {
      description:
        'A multi-entity investor with a delegated signing authority has provided evidence that is internally consistent but still needs legal review before the operations team can mark the identity dimension as ready.',
      documentCountLabel: '8 documents requiring named review',
      dueLabel: 'Due before close packet generation',
      id: 'long-identity-review',
      investorCountLabel: '1 investor with 4 subscription entities',
      owner: 'Investor operations and legal',
      severity: 'critical',
      severityLabel: 'Critical',
      surfaceLabel: 'Investor identity and document evidence',
      title: 'Resolve delegated signing authority evidence for multi-entity investor',
    },
  ],
  readiness: {
    ...blockedReadiness,
    nextAction:
      'Coordinate legal, fund administration, and investor operations signoff for the delegated authority package before the close packet is generated.',
  },
} as const satisfies DealOperationalOverviewState

export const loadingOperationalOverviewState = {
  kind: 'loading',
  label: 'Loading operational overview',
} as const satisfies DealOperationalOverviewState

export const emptyOperationalOverviewState = {
  description: 'Operational readiness data will appear after the deal has a closing workflow.',
  kind: 'empty',
  title: 'No operational overview yet',
} as const satisfies DealOperationalOverviewState

export const errorOperationalOverviewState = {
  description: 'Refresh the workspace or retry loading the deal operations summary.',
  kind: 'error',
  retryLabel: 'Retry',
  title: 'Operational overview could not be loaded',
} as const satisfies DealOperationalOverviewState
