import type { CommitmentId } from '../ids'
import { euroCentsFromMinorUnits } from '../money'
import type { CapitalReconciliationInput, PaymentRecord } from './reconciliation'

export type ReconciliationFixtures = {
  readonly onTrack: CapitalReconciliationInput
  readonly blockedUnmatchedFunds: CapitalReconciliationInput
  readonly overTarget: CapitalReconciliationInput
  readonly notStarted: CapitalReconciliationInput
  readonly invalidReceivedMoreThanSigned: CapitalReconciliationInput
}

export type PaymentRecordFixtures = {
  readonly matchedCamille: PaymentRecord
  readonly pendingElise: PaymentRecord
  readonly exceptionBelair: PaymentRecord
}

const commitmentId = (value: string): CommitmentId => value as CommitmentId

export const reconciliationFixtures: ReconciliationFixtures = {
  blockedUnmatchedFunds: {
    committedAmountCents: euroCentsFromMinorUnits(1_875_000_00n),
    matchedAmountCents: euroCentsFromMinorUnits(625_000_00n),
    receivedAmountCents: euroCentsFromMinorUnits(750_000_00n),
    signedAmountCents: euroCentsFromMinorUnits(1_500_000_00n),
    targetAmountCents: euroCentsFromMinorUnits(2_500_000_00n),
  },
  invalidReceivedMoreThanSigned: {
    committedAmountCents: euroCentsFromMinorUnits(1_000_000_00n),
    matchedAmountCents: euroCentsFromMinorUnits(800_000_00n),
    receivedAmountCents: euroCentsFromMinorUnits(900_000_00n),
    signedAmountCents: euroCentsFromMinorUnits(750_000_00n),
    targetAmountCents: euroCentsFromMinorUnits(1_500_000_00n),
  },
  notStarted: {
    committedAmountCents: euroCentsFromMinorUnits(0n),
    matchedAmountCents: euroCentsFromMinorUnits(0n),
    receivedAmountCents: euroCentsFromMinorUnits(0n),
    signedAmountCents: euroCentsFromMinorUnits(0n),
    targetAmountCents: euroCentsFromMinorUnits(0n),
  },
  onTrack: {
    committedAmountCents: euroCentsFromMinorUnits(1_875_000_00n),
    matchedAmountCents: euroCentsFromMinorUnits(750_000_00n),
    receivedAmountCents: euroCentsFromMinorUnits(750_000_00n),
    signedAmountCents: euroCentsFromMinorUnits(1_500_000_00n),
    targetAmountCents: euroCentsFromMinorUnits(2_500_000_00n),
  },
  overTarget: {
    committedAmountCents: euroCentsFromMinorUnits(2_750_000_00n),
    matchedAmountCents: euroCentsFromMinorUnits(1_500_000_00n),
    receivedAmountCents: euroCentsFromMinorUnits(1_750_000_00n),
    signedAmountCents: euroCentsFromMinorUnits(2_250_000_00n),
    targetAmountCents: euroCentsFromMinorUnits(2_500_000_00n),
  },
}

export const paymentRecordFixtures: PaymentRecordFixtures = {
  exceptionBelair: {
    commitmentId: commitmentId('33333333-3333-4333-8333-333333333333'),
    expectedAmountCents: euroCentsFromMinorUnits(375_000_00n),
    payerName: 'Belair Holdings',
    receivedAmountCents: euroCentsFromMinorUnits(350_000_00n),
    reference: 'WIRE-BELAIR-REVIEW',
    status: 'exception_pending',
    subscriberName: 'Belair Holdings SAS',
  },
  matchedCamille: {
    commitmentId: commitmentId('11111111-1111-4111-8111-111111111111'),
    expectedAmountCents: euroCentsFromMinorUnits(250_000_00n),
    payerName: 'Camille Durand',
    receivedAmountCents: euroCentsFromMinorUnits(250_000_00n),
    reference: 'WIRE-CAMILLE-2026',
    status: 'matched',
    subscriberName: 'Camille Durand',
  },
  pendingElise: {
    commitmentId: commitmentId('22222222-2222-4222-8222-222222222222'),
    expectedAmountCents: euroCentsFromMinorUnits(500_000_00n),
    payerName: 'Elise Martin',
    receivedAmountCents: euroCentsFromMinorUnits(0n),
    status: 'pending',
    subscriberName: 'Elise Martin',
  },
}
