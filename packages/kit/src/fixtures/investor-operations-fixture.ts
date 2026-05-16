import { euroCentsFromMinorUnits, InvestorIdSchema, type SupportedCountry } from '@repo/domain'
import type {
  CommitmentLifecycleState,
  InvestorOperationsRecord,
  KybOperationalStatus,
  KycOperationalStatus,
  SignatureOperationalStatus,
  WireOperationalStatus,
} from '@repo/domain/commitments'

import type { InvestorCommitmentStatus, InvestorRowData } from '../investors'

type InvestorFixtureInput = {
  readonly id: string
  readonly name: string
  readonly investorEmail?: string
  readonly legalEntityName?: string
  readonly country: SupportedCountry
  readonly entityType: InvestorRowData['entityType']
  readonly qualificationType: InvestorRowData['qualificationType']
  readonly committedAmountCents: bigint
  readonly rowStatus: InvestorCommitmentStatus
  readonly commitmentStatus: CommitmentLifecycleState
  readonly kycStatus: KycOperationalStatus
  readonly kybStatus?: KybOperationalStatus
  readonly signatureStatus: SignatureOperationalStatus
  readonly wireStatus: WireOperationalStatus
  readonly blockerIds: readonly string[]
  readonly lastActivityAt?: string
  readonly rowDetails: NonNullable<InvestorRowData['details']>
}

const investorFixtures: readonly InvestorFixtureInput[] = [
  {
    blockerIds: [],
    committedAmountCents: 750_000_00n,
    commitmentStatus: 'reconciled',
    country: 'FR',
    entityType: 'individual',
    id: 'a36ad8a4-828c-4e9a-9e61-8dd5f60edc4a',
    investorEmail: 'camille.moreau@example.com',
    kycStatus: 'approved',
    lastActivityAt: '2026-05-08T09:15:00.000Z',
    name: 'Camille Moreau',
    qualificationType: 'professional',
    rowDetails: [
      {
        id: 'entity',
        label: 'Entity',
        value: 'Natural person',
      },
      {
        description: 'AML match cleared and proof of address accepted.',
        id: 'kyc',
        label: 'KYC documents',
        tone: 'success',
        value: 'Cleared',
      },
      {
        description: 'Bank receipt matched to the SPV collection account.',
        id: 'wire',
        label: 'Wire state',
        tone: 'success',
        value: 'Received',
      },
      {
        id: 'next-action',
        label: 'Next action',
        value: 'Include in incorporation pack',
      },
    ],
    rowStatus: 'wired',
    signatureStatus: 'completed',
    wireStatus: 'reconciled',
  },
  {
    blockerIds: ['belair-wire', 'wire-match'],
    committedAmountCents: 525_000_00n,
    commitmentStatus: 'signed',
    country: 'LU',
    entityType: 'legal_entity',
    id: '5290899e-5137-4b34-ad76-31544a4532d9',
    investorEmail: 'ops@belair.example.com',
    kybStatus: 'approved',
    kycStatus: 'approved',
    lastActivityAt: '2026-05-08T10:40:00.000Z',
    legalEntityName: 'Belair Capital SCSp Renewable Infrastructure Compartment',
    name: 'Belair Capital SCSp Renewable Infrastructure Compartment',
    qualificationType: 'professional',
    rowDetails: [
      {
        id: 'entity',
        label: 'Entity',
        value: 'Luxembourg SCSp',
      },
      {
        description: 'Corporate register extract accepted.',
        id: 'kyc',
        label: 'KYB documents',
        tone: 'success',
        value: 'Cleared',
      },
      {
        description: 'Signed bulletin received, wire expected before closing review.',
        id: 'subscription',
        label: 'Subscription package',
        tone: 'success',
        value: 'Signed',
      },
      {
        id: 'reference',
        label: 'Internal reference',
        value: 'NS-INV-042',
      },
    ],
    rowStatus: 'signed',
    signatureStatus: 'completed',
    wireStatus: 'received',
  },
  {
    blockerIds: ['elise-kyc'],
    committedAmountCents: 250_000_00n,
    commitmentStatus: 'pending_review',
    country: 'BE',
    entityType: 'individual',
    id: 'ec331d48-94b9-4655-a11d-b011401d38b3',
    investorEmail: 'elise.martin@example.com',
    kycStatus: 'blocked',
    lastActivityAt: '2026-05-07T16:20:00.000Z',
    name: 'Elise Martin',
    qualificationType: 'informed',
    rowDetails: [
      {
        id: 'entity',
        label: 'Entity',
        value: 'Natural person',
      },
      {
        description: 'Refreshed proof of address requested before subscription signing.',
        id: 'kyc',
        label: 'KYC documents',
        tone: 'warning',
        value: 'Blocked',
      },
      {
        id: 'last-event',
        label: 'Last event',
        value: 'Evidence request sent 7 May 2026',
      },
      {
        id: 'next-action',
        label: 'Next action',
        value: 'Review uploaded address document',
      },
    ],
    rowStatus: 'kyc_pending',
    signatureStatus: 'not_sent',
    wireStatus: 'not_requested',
  },
  {
    blockerIds: ['rhine-kyb'],
    committedAmountCents: 150_000_00n,
    commitmentStatus: 'approved',
    country: 'DE',
    entityType: 'legal_entity',
    id: 'c3bde9f2-5ed6-4654-9ef8-5b1d9a39bd40',
    investorEmail: 'legal@rhine.example.com',
    kybStatus: 'pending_review',
    kycStatus: 'approved',
    lastActivityAt: '2026-05-07T11:05:00.000Z',
    legalEntityName: 'Rhine Ventures GmbH',
    name: 'Rhine Ventures GmbH',
    qualificationType: 'professional',
    rowDetails: [
      {
        id: 'entity',
        label: 'Entity',
        value: 'GmbH',
      },
      {
        description: 'Beneficial-owner declaration is pending counter-signature.',
        id: 'kyb',
        label: 'KYB documents',
        tone: 'warning',
        value: 'In review',
      },
      {
        id: 'subscription',
        label: 'Subscription package',
        value: 'Drafted',
      },
      {
        id: 'next-action',
        label: 'Next action',
        value: 'Send signing packet',
      },
    ],
    rowStatus: 'committed',
    signatureStatus: 'prepared',
    wireStatus: 'not_requested',
  },
  {
    blockerIds: [],
    committedAmountCents: 125_000_00n,
    commitmentStatus: 'submitted',
    country: 'FR',
    entityType: 'individual',
    id: 'ce9e77cf-d895-428f-9849-f668e656d50b',
    investorEmail: 'nicolas.perrin@example.com',
    kycStatus: 'not_started',
    lastActivityAt: '2026-05-06T13:00:00.000Z',
    name: 'Nicolas Perrin',
    qualificationType: 'informed',
    rowDetails: [
      {
        id: 'entity',
        label: 'Entity',
        value: 'Natural person',
      },
      {
        id: 'kyc',
        label: 'KYC documents',
        value: 'Not started',
      },
      {
        id: 'last-event',
        label: 'Last event',
        value: 'Data room opened 6 May 2026',
      },
      {
        id: 'next-action',
        label: 'Next action',
        value: 'Confirm investment thesis review',
      },
    ],
    rowStatus: 'reviewing',
    signatureStatus: 'not_sent',
    wireStatus: 'not_requested',
  },
  {
    blockerIds: [],
    committedAmountCents: 75_000_00n,
    commitmentStatus: 'draft',
    country: 'NL',
    entityType: 'individual',
    id: 'e7af7969-4c58-42bd-92e9-d81748155d31',
    investorEmail: 'mila.janssen@example.com',
    kycStatus: 'not_started',
    lastActivityAt: '2026-05-06T09:00:00.000Z',
    name: 'Mila Janssen',
    qualificationType: 'professional',
    rowDetails: [
      {
        id: 'entity',
        label: 'Entity',
        value: 'Natural person',
      },
      {
        id: 'outreach',
        label: 'Outreach state',
        value: 'Invitation sent',
      },
      {
        id: 'last-event',
        label: 'Last event',
        value: 'Reminder scheduled for 10 May 2026',
      },
      {
        id: 'next-action',
        label: 'Next action',
        value: 'Await data-room access',
      },
    ],
    rowStatus: 'invited',
    signatureStatus: 'not_sent',
    wireStatus: 'not_requested',
  },
] as const satisfies readonly InvestorFixtureInput[]

export const northstarInvestorRows = investorFixtures.map(
  ({
    committedAmountCents,
    country,
    entityType,
    id,
    name,
    qualificationType,
    rowDetails,
    rowStatus,
  }): InvestorRowData => ({
    committedAmount: euroCentsFromMinorUnits(committedAmountCents),
    country,
    details: rowDetails,
    entityType,
    id: InvestorIdSchema.parse(id),
    name,
    qualificationType,
    status: rowStatus,
  }),
)

export const northstarInvestorOperationsRecords = investorFixtures.map(
  ({
    blockerIds,
    committedAmountCents,
    commitmentStatus,
    id,
    investorEmail,
    kybStatus,
    kycStatus,
    lastActivityAt,
    legalEntityName,
    name,
    signatureStatus,
    wireStatus,
  }): InvestorOperationsRecord => ({
    blockerIds,
    commitmentAmountCents: euroCentsFromMinorUnits(committedAmountCents),
    commitmentStatus,
    id,
    investorName: name,
    kycStatus,
    signatureStatus,
    wireStatus,
    ...(investorEmail ? { investorEmail } : {}),
    ...(kybStatus ? { kybStatus } : {}),
    ...(lastActivityAt ? { lastActivityAt } : {}),
    ...(legalEntityName ? { legalEntityName } : {}),
  }),
)
