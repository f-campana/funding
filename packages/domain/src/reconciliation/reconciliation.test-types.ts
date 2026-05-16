import type { CommitmentId } from '../ids'
import { type EuroCents, euroCentsFromMinorUnits, euroCentsToMinorUnits } from '../money'
import {
  type CapitalReconciliationInput,
  type PaymentRecord,
  PaymentRecordSchema,
} from './reconciliation'

const amount: EuroCents = euroCentsFromMinorUnits(123n)
const commitmentId = '11111111-1111-4111-8111-111111111111' as CommitmentId

const validInput: CapitalReconciliationInput = {
  committedAmountCents: amount,
  matchedAmountCents: amount,
  receivedAmountCents: amount,
  signedAmountCents: amount,
  targetAmountCents: amount,
}

const numberInput: CapitalReconciliationInput = {
  // @ts-expect-error Plain number amounts must not be assignable.
  committedAmountCents: 123,
  matchedAmountCents: amount,
  receivedAmountCents: amount,
  signedAmountCents: amount,
  targetAmountCents: amount,
}

const bigintInput: CapitalReconciliationInput = {
  // @ts-expect-error Plain bigint amounts must not be assignable.
  committedAmountCents: 123n,
  matchedAmountCents: amount,
  receivedAmountCents: amount,
  signedAmountCents: amount,
  targetAmountCents: amount,
}

const paymentRecordWithStringId: PaymentRecord = {
  // @ts-expect-error Plain string commitment IDs must not be assignable.
  commitmentId: '11111111-1111-4111-8111-111111111111',
  expectedAmountCents: amount,
  payerName: 'Camille Durand',
  receivedAmountCents: amount,
  status: 'matched',
  subscriberName: 'Camille Durand',
}

const validPaymentRecord: PaymentRecord = {
  commitmentId,
  expectedAmountCents: amount,
  payerName: 'Camille Durand',
  receivedAmountCents: amount,
  status: 'matched',
  subscriberName: 'Camille Durand',
}

const parsedPaymentRecord = PaymentRecordSchema.parse({
  commitmentId: '11111111-1111-4111-8111-111111111111',
  expectedAmountCents: 123,
  payerName: 'Camille Durand',
  receivedAmountCents: 123,
  status: 'matched',
  subscriberName: 'Camille Durand',
})

const parsedExpectedAmount: EuroCents = parsedPaymentRecord.expectedAmountCents

void validInput
void numberInput
void bigintInput
void paymentRecordWithStringId
void validPaymentRecord
void parsedExpectedAmount
void euroCentsToMinorUnits(parsedExpectedAmount)
