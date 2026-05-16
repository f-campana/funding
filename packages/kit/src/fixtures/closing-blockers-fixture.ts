import type {
  ClosingBlockerType,
  ClosingReadinessState,
  ClosingBlocker as DomainClosingBlocker,
} from '@repo/domain/deals'

import type {
  ClosingBlockerKind,
  ClosingDueState,
  ClosingBlocker as KitClosingBlocker,
} from '../readiness'

type ClosingBlockerFixtureMetadata = {
  readonly dueState: ClosingDueState
  readonly nextAction: string
  readonly investorName?: string
  readonly reference?: string
  readonly kitKind?: ClosingBlockerKind
}

type DomainClosingBlockerFixture = DomainClosingBlocker & {
  readonly metadata: ClosingBlockerFixtureMetadata
}

const blockerKindByType = {
  allocation: 'deadline',
  compliance: 'qualification',
  deadline: 'deadline',
  document: 'subscription_document',
  kyc: 'kyc',
  kyb: 'kyb',
  reconciliation: 'payment_match',
  signature: 'subscription_document',
  wire: 'wire',
} as const satisfies Record<ClosingBlockerType, ClosingBlockerKind>

const toKitClosingBlocker = ({
  description,
  id,
  metadata,
  owner,
  severity,
  title,
  type,
}: DomainClosingBlockerFixture): KitClosingBlocker => ({
  detail: description,
  dueState: metadata.dueState,
  id,
  kind: metadata.kitKind ?? blockerKindByType[type],
  nextAction: metadata.nextAction,
  owner,
  severity,
  title,
  ...(metadata.investorName ? { investorName: metadata.investorName } : {}),
  ...(metadata.reference ? { reference: metadata.reference } : {}),
})

const unresolvedKitBlockers = (
  blockers: readonly DomainClosingBlockerFixture[],
): readonly KitClosingBlocker[] =>
  blockers.filter((blocker) => !blocker.resolved).map((blocker) => toKitClosingBlocker(blocker))

export const northstarDomainClosingBlockersByState = {
  attention: [
    {
      description: 'Belair has signed but still needs wire follow-up before the next review.',
      id: 'belair-wire',
      metadata: {
        dueState: 'due_soon',
        investorName: 'Belair Capital SCSp Renewable Infrastructure Compartment',
        nextAction: 'Confirm wire timing with investor',
      },
      owner: 'finance',
      resolved: false,
      severity: 'warning',
      title: 'Signed investor has not funded',
      type: 'wire',
    },
    {
      description: 'Attach the closing memo once payment review is complete.',
      id: 'audit-memo-attention',
      metadata: {
        dueState: 'on_track',
        kitKind: 'audit_file',
        nextAction: 'Attach memo to audit file',
      },
      owner: 'operations',
      resolved: false,
      severity: 'info',
      title: 'Audit memo pending',
      type: 'document',
    },
    {
      description: 'Earlier legal memo review was completed and no longer blocks close.',
      id: 'legal-memo-resolved',
      metadata: {
        dueState: 'on_track',
        kitKind: 'audit_file',
        nextAction: 'No action required',
      },
      owner: 'legal',
      resolved: true,
      severity: 'info',
      title: 'Legal memo reviewed',
      type: 'document',
    },
  ],
  blocked: [
    {
      description: 'Refreshed proof of address is required before subscription signing.',
      id: 'elise-kyc',
      metadata: {
        dueState: 'overdue',
        investorName: 'Elise Martin',
        nextAction: 'Review uploaded address document',
        reference: 'KYC-ELISE-2026',
      },
      owner: 'compliance',
      resolved: false,
      severity: 'critical',
      title: 'KYC evidence blocks signing',
      type: 'kyc',
    },
    {
      description:
        'Received funds are in the account but not matched to the expected investor reference.',
      id: 'wire-match',
      metadata: {
        dueState: 'due_today',
        nextAction: 'Match receipt against bank reference',
        reference: 'WIRE-BELAIR-REVIEW',
      },
      owner: 'finance',
      resolved: false,
      severity: 'warning',
      title: 'Wire receipt needs matching',
      type: 'reconciliation',
    },
    {
      description:
        'Rhine Ventures can sign after the beneficial-owner declaration is counter-signed.',
      id: 'rhine-kyb',
      metadata: {
        dueState: 'due_soon',
        investorName: 'Rhine Ventures GmbH',
        nextAction: 'Send signing packet after KYB review',
      },
      owner: 'legal',
      resolved: false,
      severity: 'info',
      title: 'KYB follow-up before signing packet',
      type: 'kyb',
    },
    {
      description: 'Camille wire confirmation was matched and archived in the review file.',
      id: 'camille-wire-resolved',
      metadata: {
        dueState: 'on_track',
        investorName: 'Camille Moreau',
        nextAction: 'No action required',
        reference: 'WIRE-CAMILLE-2026',
      },
      owner: 'finance',
      resolved: true,
      severity: 'warning',
      title: 'Wire confirmation matched',
      type: 'reconciliation',
    },
  ],
  not_started: [],
  ready: [],
} as const satisfies Record<ClosingReadinessState, readonly DomainClosingBlockerFixture[]>

export const northstarClosingBlockersByState = {
  attention: unresolvedKitBlockers(northstarDomainClosingBlockersByState.attention),
  blocked: unresolvedKitBlockers(northstarDomainClosingBlockersByState.blocked),
  not_started: unresolvedKitBlockers(northstarDomainClosingBlockersByState.not_started),
  ready: unresolvedKitBlockers(northstarDomainClosingBlockersByState.ready),
} as const satisfies Record<ClosingReadinessState, readonly KitClosingBlocker[]>
