import 'server-only'

import type {
  Brand,
  CapitalReconciliationInput,
  ClosingBlocker,
  DealLifecycleState,
  DocumentRequirement,
  EuroCents,
  InvestorOperationsRecord,
} from '@repo/domain'
import { euroCentsFromMinorUnits } from '@repo/domain'

import type {
  ActivityEventDTO,
  ClosingBlockerRouteHintDTO,
  DealAccessDTO,
  DealClosingModeDTO,
  DealVehicleDTO,
  DocumentGroupDTO,
} from '../operational-center-dto'

const cents = (amountMinor: number): EuroCents => euroCentsFromMinorUnits(BigInt(amountMinor))

type NorthstarDealSlug = Brand<string, 'DealSlug'>

const dealSlug = (value: string): NorthstarDealSlug => value as NorthstarDealSlug

export const NORTHSTAR_DEAL_SLUG = dealSlug('northstar-energy')

export type NorthstarClosingBlockerFixture = ClosingBlocker & {
  readonly routeHint: ClosingBlockerRouteHintDTO
  readonly relatedInvestorIds: readonly string[]
  readonly relatedDocumentIds: readonly string[]
}

export type NorthstarDocumentRequirementFixture = DocumentRequirement & {
  readonly blocksClosing: boolean
  readonly relatedInvestorId?: string
  readonly groupId: string
  readonly dueDate?: string
  readonly lastActivityAt?: string
}

export type NorthstarInvestorOperationFixture = InvestorOperationsRecord & {
  readonly documentIds: readonly string[]
}

export type NorthstarOperationalFixture = {
  readonly generatedAt: string
  readonly deal: {
    readonly id: string
    readonly slug: string
    readonly name: string
    readonly companyName: string
    readonly stage: DealLifecycleState
    readonly closingMode: DealClosingModeDTO
    readonly currency: 'EUR'
    readonly vehicle: DealVehicleDTO
    readonly access: DealAccessDTO
    readonly targetCloseDate: string
    readonly lastUpdatedAt: string
  }
  readonly capital: CapitalReconciliationInput & {
    readonly entryFeesCents: EuroCents
    readonly spvFeeCents: EuroCents
    readonly netInvestableAmountCents: EuroCents
    readonly carryPercent: number
  }
  readonly blockers: readonly NorthstarClosingBlockerFixture[]
  readonly investors: readonly NorthstarInvestorOperationFixture[]
  readonly documents: readonly NorthstarDocumentRequirementFixture[]
  readonly documentGroups: readonly DocumentGroupDTO[]
  readonly activity: readonly ActivityEventDTO[]
}

export const northstarOperationalFixture = {
  activity: [
    {
      actorLabel: 'Roundtable Operations',
      eventType: 'blocker_created',
      id: 'act-001',
      occurredAt: '2026-05-13T09:15:00.000Z',
      relatedBlockerId: 'blk-kyb-meridian',
      relatedInvestorId: 'inv-meridian',
      summary: 'Meridian Ventures needs KYB evidence before signature completion.',
    },
    {
      actorLabel: 'Helix Capital',
      eventType: 'wire_flagged',
      id: 'act-002',
      occurredAt: '2026-05-14T14:20:00.000Z',
      relatedBlockerId: 'blk-reconciliation-helix',
      relatedInvestorId: 'inv-helix',
      summary: 'Helix Capital flagged a wire that still needs finance matching.',
    },
    {
      actorLabel: 'Legal Operations',
      eventType: 'document_rejected',
      id: 'act-003',
      occurredAt: '2026-05-15T11:40:00.000Z',
      relatedDocumentId: 'doc-riverbend-proof-address',
      relatedInvestorId: 'inv-riverbend',
      summary: 'Riverbend proof of address expired and needs a refreshed file.',
    },
    {
      actorLabel: 'Signature Desk',
      eventType: 'signature_completed',
      id: 'act-004',
      occurredAt: '2026-05-15T17:05:00.000Z',
      relatedInvestorId: 'inv-alba',
      summary: 'Alba Family Office completed the subscription package.',
    },
  ],
  blockers: [
    {
      description: 'UBO declaration and corporate registry extract are missing for the entity.',
      id: 'blk-kyb-meridian',
      owner: 'compliance',
      relatedDocumentIds: ['doc-meridian-ubo'],
      relatedInvestorIds: ['inv-meridian'],
      resolved: false,
      routeHint: 'commitments',
      severity: 'critical',
      title: 'Meridian KYB evidence incomplete',
      type: 'kyb',
    },
    {
      description:
        'The signed package is complete, but the wire remains pending past the target date.',
      id: 'blk-wire-riverbend',
      owner: 'finance',
      relatedDocumentIds: [],
      relatedInvestorIds: ['inv-riverbend'],
      resolved: false,
      routeHint: 'commitments',
      severity: 'critical',
      title: 'Riverbend wire not received',
      type: 'wire',
    },
    {
      description: 'A received Helix transfer has not been matched to the commitment reference.',
      id: 'blk-reconciliation-helix',
      owner: 'finance',
      relatedDocumentIds: [],
      relatedInvestorIds: ['inv-helix'],
      resolved: false,
      routeHint: 'about',
      severity: 'warning',
      title: 'Helix wire requires reconciliation',
      type: 'reconciliation',
    },
    {
      description: 'The subscription bulletin is uploaded but still under legal review.',
      id: 'blk-document-subscription-bulletin',
      owner: 'legal',
      relatedDocumentIds: ['doc-subscription-bulletin'],
      relatedInvestorIds: [],
      resolved: false,
      routeHint: 'documents',
      severity: 'warning',
      title: 'Subscription bulletin not approved',
      type: 'document',
    },
    {
      description: 'Target close is approaching with two investor-side exceptions still open.',
      id: 'blk-deadline-close',
      owner: 'operations',
      relatedDocumentIds: [],
      relatedInvestorIds: ['inv-meridian', 'inv-riverbend'],
      resolved: false,
      routeHint: 'about',
      severity: 'info',
      title: 'Closing date needs operator review',
      type: 'deadline',
    },
  ],
  capital: {
    carryPercent: 10,
    committedAmountCents: cents(485_000_000),
    entryFeesCents: cents(10_000_000),
    matchedAmountCents: cents(365_000_000),
    netInvestableAmountCents: cents(470_000_000),
    receivedAmountCents: cents(395_000_000),
    signedAmountCents: cents(440_000_000),
    spvFeeCents: cents(5_000_000),
    targetAmountCents: cents(500_000_000),
  },
  deal: {
    access: {
      pendingAccessRequestCount: 3,
      sharingMode: 'request_access',
    },
    closingMode: 'standard',
    companyName: 'Northstar Energy',
    currency: 'EUR',
    id: 'deal-northstar-energy',
    lastUpdatedAt: '2026-05-16T16:30:00.000Z',
    name: 'Northstar Energy SPV',
    slug: NORTHSTAR_DEAL_SLUG,
    stage: 'closing_review',
    targetCloseDate: '2026-05-24T17:00:00.000Z',
    vehicle: {
      jurisdiction: 'Luxembourg',
      name: 'Northstar Energy SCSp',
      setupStatus: 'in_progress',
      type: 'luxembourg_scsp',
    },
  },
  documentGroups: [
    {
      documentIds: [
        'doc-subscription-bulletin',
        'doc-shareholders-agreement',
        'doc-wire-instructions',
      ],
      id: 'group-generated-closing',
      label: 'Generated closing documents',
      visibility: 'protected',
    },
    {
      documentIds: [
        'doc-meridian-ubo',
        'doc-riverbend-proof-address',
        'doc-helix-source-of-funds',
        'doc-alba-identity',
      ],
      id: 'group-investor-evidence',
      label: 'Investor evidence',
      visibility: 'internal',
    },
    {
      documentIds: ['doc-spv-register-extract', 'doc-target-legal-pack'],
      id: 'group-vehicle-setup',
      label: 'Vehicle and target setup',
      visibility: 'investor_visible',
    },
  ],
  documents: [
    {
      blocksClosing: true,
      category: 'subscription_docs',
      dueDate: '2026-05-20T12:00:00.000Z',
      groupId: 'group-generated-closing',
      id: 'doc-subscription-bulletin',
      label: 'Subscription bulletin',
      lastActivityAt: '2026-05-15T10:00:00.000Z',
      owner: 'spv',
      required: true,
      status: 'under_review',
    },
    {
      blocksClosing: false,
      category: 'shareholders_agreement',
      groupId: 'group-generated-closing',
      id: 'doc-shareholders-agreement',
      label: 'Shareholders agreement',
      lastActivityAt: '2026-05-14T09:00:00.000Z',
      owner: 'spv',
      required: true,
      status: 'approved',
    },
    {
      blocksClosing: false,
      category: 'wire_instructions',
      groupId: 'group-generated-closing',
      id: 'doc-wire-instructions',
      label: 'Wire instructions package',
      lastActivityAt: '2026-05-13T16:00:00.000Z',
      owner: 'spv',
      required: true,
      status: 'approved',
    },
    {
      blocksClosing: true,
      category: 'ubo_declaration',
      dueDate: '2026-05-18T12:00:00.000Z',
      groupId: 'group-investor-evidence',
      id: 'doc-meridian-ubo',
      label: 'Meridian UBO declaration',
      owner: 'legal_entity',
      relatedInvestorId: 'inv-meridian',
      required: true,
      status: 'missing',
    },
    {
      blocksClosing: true,
      category: 'proof_of_address',
      dueDate: '2026-05-19T12:00:00.000Z',
      groupId: 'group-investor-evidence',
      id: 'doc-riverbend-proof-address',
      label: 'Riverbend proof of address',
      lastActivityAt: '2026-05-15T11:40:00.000Z',
      owner: 'investor',
      relatedInvestorId: 'inv-riverbend',
      required: true,
      status: 'expired',
    },
    {
      blocksClosing: false,
      category: 'source_of_funds',
      groupId: 'group-investor-evidence',
      id: 'doc-helix-source-of-funds',
      label: 'Helix source of funds memo',
      lastActivityAt: '2026-05-14T14:20:00.000Z',
      owner: 'investor',
      relatedInvestorId: 'inv-helix',
      required: true,
      status: 'uploaded',
    },
    {
      blocksClosing: false,
      category: 'identity',
      groupId: 'group-investor-evidence',
      id: 'doc-alba-identity',
      label: 'Alba identity verification',
      lastActivityAt: '2026-05-12T08:20:00.000Z',
      owner: 'investor',
      relatedInvestorId: 'inv-alba',
      required: true,
      status: 'approved',
    },
    {
      blocksClosing: false,
      category: 'corporate_docs',
      groupId: 'group-vehicle-setup',
      id: 'doc-spv-register-extract',
      label: 'SPV register extract',
      owner: 'spv',
      required: true,
      status: 'uploaded',
    },
    {
      blocksClosing: true,
      category: 'other',
      dueDate: '2026-05-21T12:00:00.000Z',
      groupId: 'group-vehicle-setup',
      id: 'doc-target-legal-pack',
      label: 'Target legal closing pack',
      lastActivityAt: '2026-05-13T13:00:00.000Z',
      owner: 'deal',
      required: true,
      status: 'rejected',
    },
  ] satisfies readonly NorthstarDocumentRequirementFixture[],
  generatedAt: '2026-05-16T16:30:00.000Z',
  investors: [
    {
      blockerIds: [],
      commitmentAmountCents: cents(150_000_000),
      commitmentStatus: 'reconciled',
      documentIds: ['doc-alba-identity'],
      id: 'inv-alba',
      investorEmail: 'operations@alba.example',
      investorName: 'Alba Family Office',
      kybStatus: 'approved',
      kycStatus: 'approved',
      lastActivityAt: '2026-05-15T17:05:00.000Z',
      legalEntityName: 'Alba FO SARL',
      signatureStatus: 'completed',
      wireStatus: 'reconciled',
    },
    {
      blockerIds: ['blk-kyb-meridian'],
      commitmentAmountCents: cents(125_000_000),
      commitmentStatus: 'signature_sent',
      documentIds: ['doc-meridian-ubo'],
      id: 'inv-meridian',
      investorEmail: 'closing@meridian.example',
      investorName: 'Meridian Ventures',
      kybStatus: 'pending_review',
      kycStatus: 'approved',
      lastActivityAt: '2026-05-13T09:15:00.000Z',
      legalEntityName: 'Meridian Ventures II LP',
      signatureStatus: 'sent',
      wireStatus: 'not_requested',
    },
    {
      blockerIds: ['blk-reconciliation-helix'],
      commitmentAmountCents: cents(90_000_000),
      commitmentStatus: 'wire_received',
      documentIds: ['doc-helix-source-of-funds'],
      id: 'inv-helix',
      investorEmail: 'finance@helix.example',
      investorName: 'Helix Capital',
      kybStatus: 'approved',
      kycStatus: 'approved',
      lastActivityAt: '2026-05-14T14:20:00.000Z',
      legalEntityName: 'Helix Capital Partners',
      signatureStatus: 'completed',
      wireStatus: 'unmatched',
    },
    {
      blockerIds: ['blk-wire-riverbend'],
      commitmentAmountCents: cents(60_000_000),
      commitmentStatus: 'signed',
      documentIds: ['doc-riverbend-proof-address'],
      id: 'inv-riverbend',
      investorEmail: 'ops@riverbend.example',
      investorName: 'Riverbend Holdings',
      kybStatus: 'approved',
      kycStatus: 'expired',
      lastActivityAt: '2026-05-15T11:40:00.000Z',
      legalEntityName: 'Riverbend Holdings SAS',
      signatureStatus: 'completed',
      wireStatus: 'pending',
    },
    {
      blockerIds: [],
      commitmentAmountCents: cents(60_000_000),
      commitmentStatus: 'wire_matched',
      documentIds: [],
      id: 'inv-julien-moreau',
      investorEmail: 'julien.moreau@example.com',
      investorName: 'Julien Moreau',
      kycStatus: 'approved',
      lastActivityAt: '2026-05-15T15:30:00.000Z',
      signatureStatus: 'completed',
      wireStatus: 'matched',
    },
  ],
} as const satisfies NorthstarOperationalFixture
