import type {
  DealCommitmentInspectorLabels,
  DealCommitmentInspectorReadyState,
  DealCommitmentInspectorState,
  DealCommitmentReadinessRecord,
} from './deal-commitment-inspector'

const readiness = (
  kycKyb: DealCommitmentReadinessRecord['kycKyb'],
  signature: DealCommitmentReadinessRecord['signature'],
  wire: DealCommitmentReadinessRecord['wire'],
  reconciliation: DealCommitmentReadinessRecord['reconciliation'],
): DealCommitmentReadinessRecord => ({
  kycKyb,
  reconciliation,
  signature,
  wire,
})

export const dealCommitmentInspectorLabels = {
  activityTitle: 'Recent investor activity',
  blockerDocumentsLabel: 'Documents',
  blockerDueLabel: 'Due',
  blockerInvestorsLabel: 'Investors',
  blockerOwnerLabel: 'Owner',
  blockerSurfaceLabel: 'Surface',
  blockersTitle: 'Related blockers',
  documentBlockingLabel: 'Closing impact',
  documentDueLabel: 'Due',
  documentLastActivityLabel: 'Last activity',
  documentOwnerLabel: 'Owner',
  documentRequirementLabel: 'Requirement',
  documentVisibilityLabel: 'Visibility',
  documentsTitle: 'Related evidence',
  loadingLabel: 'Loading commitment inspector',
  nextActionLabel: 'Next action',
  noActivityLabel: 'No recent investor activity.',
  noBlockersLabel: 'No investor-specific blockers.',
  noDocumentsLabel: 'No related evidence.',
  noNextActionLabel: 'No investor-specific action is open.',
  readinessTitle: 'Readiness breakdown',
  title: 'Commitment inspector',
} as const satisfies DealCommitmentInspectorLabels

export const blockedCommitmentInspectorState = {
  activity: [
    {
      actor: 'Operations',
      dateTime: '2026-05-13T09:20:00.000Z',
      id: 'kyb-follow-up',
      summary: 'Asked legal ops to collect the signed UBO declaration before countersignature.',
      timestampLabel: '13 May 2026, 11:20',
      tone: 'attention',
      typeLabel: 'KYB',
    },
    {
      actor: 'Legal ops',
      dateTime: '2026-05-12T14:10:00.000Z',
      id: 'signature-package-sent',
      summary: 'Released subscription package to the investor signatory.',
      timestampLabel: '12 May 2026, 16:10',
      tone: 'info',
      typeLabel: 'Signature',
    },
    {
      actor: 'Fund admin',
      dateTime: '2026-05-10T08:45:00.000Z',
      id: 'kyc-approved',
      summary: 'Approved individual KYC and left entity KYB in pending review.',
      timestampLabel: '10 May 2026, 10:45',
      tone: 'success',
      typeLabel: 'Identity',
    },
  ],
  blockers: [
    {
      description:
        'The investor can sign, but closing cannot proceed until beneficial ownership evidence is reviewed.',
      dueLabel: 'Due 18 May 2026',
      id: 'meridian-kyb-evidence',
      owner: 'Legal ops',
      relatedDocumentLabel: '1 evidence item',
      relatedInvestorLabel: '1 investor',
      severity: 'critical',
      severityLabel: 'Critical',
      surfaceLabel: 'Commitments -> evidence review',
      title: 'Beneficial owner evidence is missing',
    },
  ],
  documents: [
    {
      blockingLabel: 'Blocks closing',
      dueLabel: 'Due 18 May 2026',
      id: 'meridian-ubo-declaration',
      label: 'Meridian UBO declaration',
      lastActivityDateTime: '2026-05-13T09:20:00.000Z',
      lastActivityLabel: 'Updated 13 May 2026',
      owner: 'Legal ops',
      requirementLabel: 'Required',
      statusLabel: 'Missing',
      statusTone: 'danger',
      visibilityLabel: 'Investor evidence',
    },
    {
      blockingLabel: 'Does not block closing',
      id: 'meridian-subscription-agreement',
      label: 'Subscription agreement package',
      lastActivityDateTime: '2026-05-12T14:10:00.000Z',
      lastActivityLabel: 'Sent 12 May 2026',
      owner: 'Legal ops',
      requirementLabel: 'Required',
      statusLabel: 'Package sent',
      statusTone: 'info',
      visibilityLabel: 'Signature package',
    },
  ],
  investor: {
    commitmentLabel: '€1,250,000 commitment',
    contactLabel: 'closing@meridian.example',
    entityName: 'Meridian Ventures II LP',
    id: 'meridian-ventures',
    lastActivityDateTime: '2026-05-13T09:20:00.000Z',
    lastActivityLabel: 'Updated 13 May 2026',
    name: 'Meridian Ventures',
    status: {
      label: 'Needs attention',
      tone: 'attention',
    },
  },
  kind: 'ready',
  nextAction: 'Collect KYB evidence before signature completion.',
  readiness: readiness(
    {
      detail: 'Individual KYC is approved. Entity KYB is pending the UBO declaration.',
      key: 'kycKyb',
      label: 'KYC/KYB',
      metadata: ['KYC approved', 'KYB pending review'],
      tone: 'attention',
      value: 'KYC approved · KYB pending review',
    },
    {
      detail: 'Subscription package is with the investor signatory.',
      key: 'signature',
      label: 'Signature',
      metadata: ['Sent 12 May'],
      tone: 'info',
      value: 'Package sent',
    },
    {
      detail: 'No incoming wire has been matched to this commitment.',
      key: 'wire',
      label: 'Wire',
      metadata: ['€1,250,000 expected'],
      tone: 'pending',
      value: 'Not received',
    },
    {
      detail: 'Cannot reconcile until the signed package and wire are complete.',
      key: 'reconciliation',
      label: 'Reconciliation',
      tone: 'pending',
      value: 'Pending',
    },
  ),
} as const satisfies DealCommitmentInspectorReadyState

export const readyCommitmentInspectorState = {
  ...blockedCommitmentInspectorState,
  activity: [
    {
      actor: 'Fund admin',
      dateTime: '2026-05-17T07:45:00.000Z',
      id: 'ready-reconciled',
      summary: 'Matched the final wire receipt to the executed subscription agreement.',
      timestampLabel: '17 May 2026, 09:45',
      tone: 'success',
      typeLabel: 'Reconciliation',
    },
    {
      actor: 'Legal ops',
      dateTime: '2026-05-16T13:25:00.000Z',
      id: 'ready-signed',
      summary: 'Marked the countersigned package as complete.',
      timestampLabel: '16 May 2026, 15:25',
      tone: 'success',
      typeLabel: 'Signature',
    },
  ],
  blockers: [],
  documents: [
    {
      blockingLabel: 'Cleared for closing',
      id: 'solenne-subscription-package',
      label: 'Executed subscription package',
      lastActivityDateTime: '2026-05-16T13:25:00.000Z',
      lastActivityLabel: 'Reviewed 16 May 2026',
      owner: 'Legal ops',
      requirementLabel: 'Required',
      statusLabel: 'Complete',
      statusTone: 'success',
      visibilityLabel: 'Closing binder',
    },
  ],
  investor: {
    commitmentLabel: '€800,000 commitment',
    contactLabel: 'operations@solenne.example',
    entityName: 'Solenne Family Office SARL',
    id: 'solenne-family-office',
    lastActivityDateTime: '2026-05-17T07:45:00.000Z',
    lastActivityLabel: 'Updated 17 May 2026',
    name: 'Solenne Family Office',
    status: {
      label: 'Ready to close',
      tone: 'success',
    },
  },
  nextAction: undefined,
  readiness: readiness(
    {
      detail: 'KYC and KYB checks are complete.',
      key: 'kycKyb',
      label: 'KYC/KYB',
      metadata: ['KYC approved', 'KYB approved'],
      tone: 'success',
      value: 'Approved',
    },
    {
      detail: 'All signature pages are countersigned.',
      key: 'signature',
      label: 'Signature',
      tone: 'success',
      value: 'Signed',
    },
    {
      detail: 'Wire receipt is confirmed by the fund administrator.',
      key: 'wire',
      label: 'Wire',
      tone: 'success',
      value: 'Received',
    },
    {
      detail: 'Commitment, signature, and cash receipt are matched.',
      key: 'reconciliation',
      label: 'Reconciliation',
      tone: 'success',
      value: 'Reconciled',
    },
  ),
} as const satisfies DealCommitmentInspectorReadyState

export const wireIssueCommitmentInspectorState = {
  ...blockedCommitmentInspectorState,
  blockers: [
    {
      description:
        'Treasury received funds from a different remitter name and cannot match the receipt automatically.',
      dueLabel: 'Due today',
      id: 'wire-remitter-mismatch',
      owner: 'Fund admin',
      relatedDocumentLabel: '2 evidence items',
      relatedInvestorLabel: '1 investor',
      severity: 'critical',
      severityLabel: 'Critical',
      surfaceLabel: 'Capital reconciliation',
      title: 'Wire remitter name does not match',
    },
  ],
  documents: [
    {
      blockingLabel: 'Blocks closing',
      dueLabel: 'Due today',
      id: 'wire-confirmation',
      label: 'Bank remittance confirmation',
      lastActivityDateTime: '2026-05-18T07:15:00.000Z',
      lastActivityLabel: 'Uploaded today',
      owner: 'Fund admin',
      requirementLabel: 'Required',
      statusLabel: 'Needs review',
      statusTone: 'attention',
      visibilityLabel: 'Wire evidence',
    },
  ],
  investor: {
    commitmentLabel: '€600,000 commitment',
    contactLabel: 'finance@asterridge.example',
    entityName: 'Aster Ridge Co-Invest SCSp',
    id: 'aster-ridge',
    lastActivityDateTime: '2026-05-18T07:15:00.000Z',
    lastActivityLabel: 'Updated today',
    name: 'Aster Ridge',
    status: {
      label: 'Wire issue',
      tone: 'danger',
    },
  },
  nextAction:
    'Review remitter evidence and confirm whether the received wire belongs to Aster Ridge.',
  readiness: readiness(
    {
      key: 'kycKyb',
      label: 'KYC/KYB',
      tone: 'success',
      value: 'Approved',
    },
    {
      key: 'signature',
      label: 'Signature',
      tone: 'success',
      value: 'Signed',
    },
    {
      detail:
        'Incoming receipt exists, but remitter identity does not match the commitment record.',
      key: 'wire',
      label: 'Wire',
      metadata: ['€600,000 received', 'Remitter mismatch'],
      tone: 'danger',
      value: 'Needs match',
    },
    {
      detail: 'Reconciliation is blocked until the wire source is confirmed.',
      key: 'reconciliation',
      label: 'Reconciliation',
      tone: 'danger',
      value: 'Blocked',
    },
  ),
} as const satisfies DealCommitmentInspectorReadyState

export const documentIssueCommitmentInspectorState = {
  ...blockedCommitmentInspectorState,
  blockers: [
    {
      description: 'The side letter is uploaded, but the operator review stamp is missing.',
      dueLabel: 'Due 20 May 2026',
      id: 'side-letter-review',
      owner: 'Legal ops',
      relatedDocumentLabel: '1 document',
      relatedInvestorLabel: '1 investor',
      severity: 'warning',
      severityLabel: 'Warning',
      surfaceLabel: 'Evidence review',
      title: 'Side letter requires operator review',
    },
  ],
  documents: [
    {
      blockingLabel: 'Blocks closing',
      dueLabel: 'Due 20 May 2026',
      id: 'signed-side-letter',
      label: 'Executed side letter',
      lastActivityDateTime: '2026-05-15T12:00:00.000Z',
      lastActivityLabel: 'Uploaded 15 May 2026',
      owner: 'Legal ops',
      requirementLabel: 'Required',
      statusLabel: 'Pending review',
      statusTone: 'attention',
      visibilityLabel: 'Investor evidence',
    },
  ],
  investor: {
    commitmentLabel: '€450,000 commitment',
    contactLabel: 'legal@aurora-anchor.example',
    entityName: 'Aurora Anchor Holdings LP',
    id: 'aurora-anchor',
    lastActivityDateTime: '2026-05-15T12:00:00.000Z',
    lastActivityLabel: 'Updated 15 May 2026',
    name: 'Aurora Anchor',
    status: {
      label: 'Document review',
      tone: 'attention',
    },
  },
  nextAction: 'Review the uploaded side letter before releasing the closing binder.',
} as const satisfies DealCommitmentInspectorReadyState

export const noBlockersCommitmentInspectorState = {
  ...blockedCommitmentInspectorState,
  blockers: [],
  nextAction: 'Confirm final evidence labels before closing packet assembly.',
} as const satisfies DealCommitmentInspectorReadyState

export const noDocumentsCommitmentInspectorState = {
  ...blockedCommitmentInspectorState,
  documents: [],
} as const satisfies DealCommitmentInspectorReadyState

export const noActivityCommitmentInspectorState = {
  ...blockedCommitmentInspectorState,
  activity: [],
} as const satisfies DealCommitmentInspectorReadyState

export const longTextCommitmentInspectorState = {
  ...blockedCommitmentInspectorState,
  blockers: [
    {
      description:
        'The delegated signatory confirmation, beneficial ownership declaration, and administrator intake record use inconsistent legal names that need one operator decision before closing proceeds.',
      dueLabel: 'Due 21 May 2026 after administrator escalation window closes',
      id: 'long-text-legal-name-mismatch',
      owner: 'Cross-border legal operations and fund administration review desk',
      relatedDocumentLabel: '3 evidence items',
      relatedInvestorLabel: '1 investor legal entity',
      severity: 'critical',
      severityLabel: 'Critical blocker requiring operator review',
      surfaceLabel: 'Commitments -> investor evidence -> administrator exceptions',
      title:
        'Delegated signatory and beneficial ownership records use inconsistent long-form legal names',
    },
  ],
  documents: [
    {
      blockingLabel: 'Blocks closing until operator review and administrator sign-off are complete',
      dueLabel: 'Due 21 May 2026 after administrator escalation window closes',
      id: 'long-text-delegated-signatory',
      label:
        'North Atlantic Renewable Infrastructure Continuation Feeder Delegated Signatory Certificate',
      lastActivityDateTime: '2026-05-14T10:30:00.000Z',
      lastActivityLabel: 'Escalated 14 May 2026 with administrator comments',
      owner: 'Cross-border legal operations and fund administration review desk',
      requirementLabel: 'Required for close and delegated authority confirmation',
      statusLabel: 'Needs operator review',
      statusTone: 'attention',
      visibilityLabel: 'Restricted investor evidence and closing binder',
    },
  ],
  investor: {
    commitmentLabel: '€12,345,678 commitment with staged wire funding',
    contactLabel: 'delegated.authority.operations@longview-renewables.example',
    entityName:
      'North Atlantic Renewable Infrastructure Continuation Feeder Vehicle Series 2026 SCSp',
    id: 'longview-renewables',
    lastActivityDateTime: '2026-05-14T10:30:00.000Z',
    lastActivityLabel: 'Updated 14 May 2026 after administrator escalation',
    name: 'Longview Renewable Infrastructure Strategic Opportunities Partners',
    status: {
      label: 'Needs cross-border documentation review',
      tone: 'attention',
    },
  },
  nextAction:
    'Compare the delegated signatory certificate, UBO declaration, and administrator intake record before approving the entity name for closing.',
  readiness: readiness(
    {
      detail:
        'Individual KYC is approved, but KYB depends on legal-name alignment across administrator evidence.',
      key: 'kycKyb',
      label: 'KYC/KYB',
      metadata: ['KYC approved', 'KYB exception open', 'Cross-border review'],
      tone: 'attention',
      value: 'Approved KYC · KYB exception open',
    },
    {
      detail:
        'The signing package is ready, but delegated authority cannot be accepted until the certificate is reviewed.',
      key: 'signature',
      label: 'Signature',
      metadata: ['Package ready', 'Delegated authority review'],
      tone: 'attention',
      value: 'Ready with authority exception',
    },
    {
      detail: 'First-stage wire is expected after the authority exception clears.',
      key: 'wire',
      label: 'Wire',
      metadata: ['Staged funding', 'No receipt yet'],
      tone: 'pending',
      value: 'Awaiting staged wire',
    },
    {
      detail:
        'Reconciliation will require matching staged receipts against the corrected legal entity record.',
      key: 'reconciliation',
      label: 'Reconciliation',
      tone: 'pending',
      value: 'Not started',
    },
  ),
} as const satisfies DealCommitmentInspectorReadyState

export const loadingCommitmentInspectorState = {
  kind: 'loading',
  label: 'Loading Meridian commitment',
} as const satisfies DealCommitmentInspectorState

export const errorCommitmentInspectorState = {
  description: 'Refresh the inspector or return to the commitments list.',
  kind: 'error',
  retryLabel: 'Retry',
  title: 'Commitment inspector could not be loaded',
} as const satisfies DealCommitmentInspectorState

export const emptyCommitmentInspectorState = {
  description: 'Select an investor commitment to inspect readiness, blockers, and evidence.',
  kind: 'empty',
  title: 'No commitment selected',
} as const satisfies DealCommitmentInspectorState
