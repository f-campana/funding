import { euroCentsFromMinorUnits, type SpvStatus } from '@repo/domain'
import type { DealLifecycleState } from '@repo/domain/deals'
import {
  type CapitalReconciliationInput,
  type CapitalReconciliationSummary,
  reconciliationFixtures,
  summarizeCapitalReconciliation,
} from '@repo/domain/reconciliation'

import type { DealTerm } from '../deal'
import type { InvestorStatusBreakdownItem, TicketDistributionSegment } from '../distribution'
import type { ClosingReadinessState } from '../readiness'
import { northstarDocumentCompletenessSummary } from './document-requirements-fixture'

export type DealOperationTermValue =
  | {
      readonly kind: 'text'
      readonly text: string
    }
  | {
      readonly kind: 'money'
      readonly amount: ReturnType<typeof euroCentsFromMinorUnits>
    }

export type DealOperationTerm = Omit<DealTerm, 'description' | 'value'> & {
  readonly description?: string
  readonly value: DealOperationTermValue
}

export type DealOperationsFixture = {
  readonly id: string
  readonly title: string
  readonly statusLabel: string
  readonly description: string
  readonly lifecycleState: DealLifecycleState
  readonly spvStatus: SpvStatus
  readonly closingReviewDateLabel: string
  readonly lastUpdatedLabel: string
  readonly vehicleLabel: string
  readonly minimumTicketAmountCents: ReturnType<typeof euroCentsFromMinorUnits>
  readonly documentSummary: typeof northstarDocumentCompletenessSummary
}

export const northstarDealFixture = {
  closingReviewDateLabel: '24 May 2026',
  description:
    'Operating review for a European energy deal moving through investor signing, wire collection, and incorporation readiness.',
  documentSummary: northstarDocumentCompletenessSummary,
  id: 'northstar-energy',
  lastUpdatedLabel: '10 May 2026, 09:30',
  lifecycleState: 'awaiting_wires',
  minimumTicketAmountCents: euroCentsFromMinorUnits(50_000_00n),
  spvStatus: 'collecting',
  statusLabel: 'Collecting',
  title: 'Northstar Energy SPV',
  vehicleLabel: 'Luxembourg SPV',
} as const satisfies DealOperationsFixture

const capitalSummaryFor = (input: CapitalReconciliationInput): CapitalReconciliationSummary => {
  const result = summarizeCapitalReconciliation(input)

  if (result.isError()) {
    throw new Error(`Invalid Northstar reconciliation fixture: ${result.error._tag}`)
  }

  return result.value
}

export const northstarCapitalSummariesByReadiness = {
  attention: capitalSummaryFor(reconciliationFixtures.onTrack),
  blocked: capitalSummaryFor(reconciliationFixtures.blockedUnmatchedFunds),
  not_started: capitalSummaryFor(reconciliationFixtures.notStarted),
  ready: capitalSummaryFor({
    committedAmountCents: euroCentsFromMinorUnits(2_500_000_00n),
    matchedAmountCents: euroCentsFromMinorUnits(2_500_000_00n),
    receivedAmountCents: euroCentsFromMinorUnits(2_500_000_00n),
    signedAmountCents: euroCentsFromMinorUnits(2_500_000_00n),
    targetAmountCents: euroCentsFromMinorUnits(2_500_000_00n),
  }),
} as const satisfies Record<ClosingReadinessState, CapitalReconciliationSummary>

export const northstarReadinessCopyByState = {
  attention: {
    deadline: '5 days',
    description:
      'Work remains across signing and funding, but no critical dependency blocks review.',
    title: 'Attention needed before close',
  },
  blocked: {
    deadline: '5 days',
    description:
      'Critical compliance evidence and payment matching must be cleared before close review.',
    title: 'Close is blocked',
  },
  not_started: {
    deadline: 'Not set',
    description: 'Operational data is not complete enough to assess the next closing action.',
    title: 'Readiness not started',
  },
  ready: {
    deadline: 'Ready now',
    description: 'No known blocker is preventing the next closing action.',
    title: 'Ready for close review',
  },
} as const satisfies Record<
  ClosingReadinessState,
  { readonly title: string; readonly description: string; readonly deadline: string }
>

export const northstarTicketDistribution = [
  {
    amount: euroCentsFromMinorUnits(1_275_000_00n),
    id: 'large-ticket',
    investorCount: 2,
    label: '500k plus tickets',
    percentageBasisPoints: 6800,
  },
  {
    amount: euroCentsFromMinorUnits(525_000_00n),
    id: 'core-ticket',
    investorCount: 3,
    label: '100k to 499k tickets',
    percentageBasisPoints: 2800,
  },
  {
    amount: euroCentsFromMinorUnits(75_000_00n),
    id: 'small-ticket',
    investorCount: 1,
    label: 'Under 100k tickets',
    percentageBasisPoints: 400,
  },
] as const satisfies readonly TicketDistributionSegment[]

export const northstarInvestorStatusBreakdown = [
  {
    count: 2,
    id: 'ready',
    label: 'Signed or wired',
    percentageBasisPoints: 3334,
  },
  {
    count: 1,
    id: 'kyc',
    label: 'KYC pending',
    percentageBasisPoints: 1667,
  },
  {
    count: 1,
    id: 'committed',
    label: 'Committed',
    percentageBasisPoints: 1667,
  },
  {
    count: 2,
    id: 'outreach',
    label: 'Reviewing or invited',
    percentageBasisPoints: 3332,
  },
] as const satisfies readonly InvestorStatusBreakdownItem[]

export const northstarDealTerms = [
  {
    description: 'Equity round through a single dedicated vehicle.',
    id: 'instrument',
    label: 'Instrument',
    value: { kind: 'text', text: 'SPV subscription' },
  },
  {
    id: 'minimum-ticket',
    label: 'Minimum ticket',
    value: { amount: euroCentsFromMinorUnits(50_000_00n), kind: 'money' },
  },
  {
    id: 'carry',
    label: 'Carried interest',
    value: { kind: 'text', text: '10%' },
  },
  {
    id: 'jurisdiction',
    label: 'Vehicle jurisdiction',
    value: { kind: 'text', text: 'Luxembourg' },
  },
] as const satisfies readonly DealOperationTerm[]
