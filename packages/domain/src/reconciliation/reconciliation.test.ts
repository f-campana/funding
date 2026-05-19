import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import {
  addEuroCents,
  euroCentsFromMinorUnits,
  euroCentsToMinorUnits,
  subtractEuroCents,
} from '../money'
import { paymentRecordFixtures, reconciliationFixtures } from './fixtures'
import {
  type CapitalReconciliationInput,
  CapitalReconciliationInputSchema,
  CapitalStageSchema,
  PaymentRecordSchema,
  PaymentStatusSchema,
  summarizeCapitalReconciliation,
} from './reconciliation'

const capitalStages = ['committed', 'signed', 'received', 'matched'] as const
const paymentStatuses = [
  'not_requested',
  'instructions_released',
  'pending',
  'received',
  'matched',
  'exception_pending',
  'refunded',
] as const

const cents = euroCentsFromMinorUnits

const expectOkSummary = (input: CapitalReconciliationInput) => {
  const result = summarizeCapitalReconciliation(input)

  expect(result).toMatchObject({ _tag: 'Ok' })

  if (result.isError()) {
    throw new Error('expected reconciliation summary to be valid')
  }

  return result.value
}

describe('reconciliation status schemas', () => {
  it.each(capitalStages)('parses capital stage %s', (stage) => {
    expect(CapitalStageSchema.parse(stage)).toBe(stage)
  })

  it('rejects unknown capital stages', () => {
    expect(CapitalStageSchema.safeParse('cleared').success).toBe(false)
  })

  it.each(paymentStatuses)('parses payment status %s', (status) => {
    expect(PaymentStatusSchema.parse(status)).toBe(status)
  })

  it('rejects unknown payment statuses', () => {
    expect(PaymentStatusSchema.safeParse('settled').success).toBe(false)
  })
})

describe('PaymentRecordSchema', () => {
  const validInput = {
    commitmentId: '11111111-1111-4111-8111-111111111111',
    expectedAmountCents: 250_000_00,
    payerName: ' Camille Durand ',
    receivedAmountCents: 250_000_00,
    reference: ' WIRE-CAMILLE ',
    status: 'matched',
    subscriberName: ' Camille Durand ',
  }

  it('brands JSON-safe payment amount inputs and preserves optional reference', () => {
    const parsed = PaymentRecordSchema.safeParse(validInput)

    expect(parsed.success).toBe(true)

    if (!parsed.success) {
      throw new Error('expected valid payment record')
    }

    expect(euroCentsToMinorUnits(parsed.data.expectedAmountCents)).toBe(250_000_00n)
    expect(euroCentsToMinorUnits(parsed.data.receivedAmountCents)).toBe(250_000_00n)
    expect(parsed.data.status).toBe('matched')
    expect(parsed.data.payerName).toBe('Camille Durand')
    expect(parsed.data.subscriberName).toBe('Camille Durand')
    expect(parsed.data.reference).toBe('WIRE-CAMILLE')
  })

  it('omits optional reference when absent', () => {
    const { reference: _reference, ...withoutReference } = validInput
    const parsed = PaymentRecordSchema.parse(withoutReference)

    expect('reference' in parsed).toBe(false)
  })

  it.each([
    ['non-integer amount', { ...validInput, expectedAmountCents: 12.34 }],
    ['unsafe integer amount', { ...validInput, expectedAmountCents: Number.MAX_SAFE_INTEGER + 1 }],
    ['negative amount', { ...validInput, receivedAmountCents: -1 }],
    ['empty payerName', { ...validInput, payerName: '   ' }],
    ['empty subscriberName', { ...validInput, subscriberName: '' }],
    ['empty optional reference', { ...validInput, reference: '  ' }],
    ['unknown payment status', { ...validInput, status: 'settled' }],
  ])('rejects %s', (_label, input) => {
    expect(PaymentRecordSchema.safeParse(input).success).toBe(false)
  })
})

describe('CapitalReconciliationInputSchema', () => {
  it('brands JSON-safe capital inputs', () => {
    const parsed = CapitalReconciliationInputSchema.parse({
      committedAmountCents: 3,
      matchedAmountCents: 1,
      receivedAmountCents: 1,
      signedAmountCents: 2,
      targetAmountCents: 5,
    })

    expect(euroCentsToMinorUnits(parsed.targetAmountCents)).toBe(5n)
    expect(summarizeCapitalReconciliation(parsed).isOk()).toBe(true)
  })

  it('rejects invalid raw capital inputs before summary helpers run', () => {
    expect(
      CapitalReconciliationInputSchema.safeParse({
        committedAmountCents: 3,
        matchedAmountCents: 1,
        receivedAmountCents: 1,
        signedAmountCents: 2,
        targetAmountCents: -1,
      }).success,
    ).toBe(false)
  })
})

describe('summarizeCapitalReconciliation', () => {
  it('summarizes the on-track exact example', () => {
    const summary = expectOkSummary(reconciliationFixtures.onTrack)

    expect(euroCentsToMinorUnits(summary.remainingToTargetCents)).toBe(625_000_00n)
    expect(euroCentsToMinorUnits(summary.unsignedCommittedCents)).toBe(375_000_00n)
    expect(euroCentsToMinorUnits(summary.unreceivedSignedCents)).toBe(750_000_00n)
    expect(euroCentsToMinorUnits(summary.unmatchedReceivedCents)).toBe(0n)
    expect(euroCentsToMinorUnits(summary.unfundedCommittedCents)).toBe(1_125_000_00n)
    expect(summary.hasUnmatchedFunds).toBe(false)
    expect(summary.isOverTarget).toBe(false)
  })

  it('summarizes blocked unmatched funds exactly', () => {
    const summary = expectOkSummary(reconciliationFixtures.blockedUnmatchedFunds)

    expect(summary.hasUnmatchedFunds).toBe(true)
    expect(euroCentsToMinorUnits(summary.unmatchedReceivedCents)).toBe(125_000_00n)
  })

  it('summarizes over-target committed capital exactly', () => {
    const summary = expectOkSummary(reconciliationFixtures.overTarget)

    expect(euroCentsToMinorUnits(summary.remainingToTargetCents)).toBe(0n)
    expect(summary.isOverTarget).toBe(true)
    expect(euroCentsToMinorUnits(summary.overTargetCents)).toBe(250_000_00n)
  })

  it('summarizes not-started zero amounts', () => {
    const summary = expectOkSummary(reconciliationFixtures.notStarted)

    expect(euroCentsToMinorUnits(summary.remainingToTargetCents)).toBe(0n)
    expect(euroCentsToMinorUnits(summary.overTargetCents)).toBe(0n)
    expect(euroCentsToMinorUnits(summary.unsignedCommittedCents)).toBe(0n)
    expect(euroCentsToMinorUnits(summary.unreceivedSignedCents)).toBe(0n)
    expect(euroCentsToMinorUnits(summary.unmatchedReceivedCents)).toBe(0n)
    expect(euroCentsToMinorUnits(summary.unfundedCommittedCents)).toBe(0n)
    expect(summary.isOverTarget).toBe(false)
    expect(summary.hasUnmatchedFunds).toBe(false)
  })

  it.each([
    [
      'negative target amount',
      { ...reconciliationFixtures.notStarted, targetAmountCents: cents(-1n) },
      { _tag: 'NegativeAmount', field: 'targetAmountCents' },
    ],
    [
      'negative committed amount',
      { ...reconciliationFixtures.notStarted, committedAmountCents: cents(-1n) },
      { _tag: 'NegativeAmount', field: 'committedAmountCents' },
    ],
    [
      'signed greater than committed',
      {
        ...reconciliationFixtures.notStarted,
        committedAmountCents: cents(1n),
        signedAmountCents: cents(2n),
      },
      {
        _tag: 'StageOrderViolation',
        earlierStage: 'committed',
        laterStage: 'signed',
      },
    ],
    [
      'received greater than signed',
      reconciliationFixtures.invalidReceivedMoreThanSigned,
      {
        _tag: 'StageOrderViolation',
        earlierStage: 'signed',
        laterStage: 'received',
      },
    ],
    [
      'matched greater than received',
      {
        ...reconciliationFixtures.notStarted,
        committedAmountCents: cents(3n),
        matchedAmountCents: cents(1n),
        receivedAmountCents: cents(0n),
        signedAmountCents: cents(2n),
      },
      {
        _tag: 'StageOrderViolation',
        earlierStage: 'received',
        laterStage: 'matched',
      },
    ],
  ])('returns Result.Error for %s', (_label, input, expectedError) => {
    expect(summarizeCapitalReconciliation(input)).toMatchObject({
      _tag: 'Error',
      error: expectedError,
    })
  })
})

describe('reconciliation fixtures', () => {
  it('provide payment records with exact branded amounts', () => {
    expect(euroCentsToMinorUnits(paymentRecordFixtures.matchedCamille.expectedAmountCents)).toBe(
      250_000_00n,
    )
    expect(paymentRecordFixtures.pendingElise.status).toBe('pending')
    expect(paymentRecordFixtures.exceptionBelair.status).toBe('exception_pending')
  })
})

describe('capital reconciliation properties', () => {
  const boundedCents = fc.bigInt({ max: 10_000_000_000n, min: 0n }).map(cents)
  const monotonicInput = fc
    .record({
      matched: boundedCents,
      target: boundedCents,
      unmatchedReceived: boundedCents,
      unreceivedSigned: boundedCents,
      unsignedCommitted: boundedCents,
    })
    .map(({ matched, target, unmatchedReceived, unreceivedSigned, unsignedCommitted }) => {
      const received = addEuroCents(matched, unmatchedReceived)
      const signed = addEuroCents(received, unreceivedSigned)
      const committed = addEuroCents(signed, unsignedCommitted)

      return {
        committedAmountCents: committed,
        matchedAmountCents: matched,
        receivedAmountCents: received,
        signedAmountCents: signed,
        targetAmountCents: target,
      }
    })

  it('returns valid exact non-negative summaries for monotonic inputs', () => {
    fc.assert(
      fc.property(monotonicInput, (input) => {
        const summary = expectOkSummary(input)

        expect(euroCentsToMinorUnits(summary.remainingToTargetCents)).toBeGreaterThanOrEqual(0n)
        expect(euroCentsToMinorUnits(summary.overTargetCents)).toBeGreaterThanOrEqual(0n)
        expect(euroCentsToMinorUnits(summary.unsignedCommittedCents)).toBeGreaterThanOrEqual(0n)
        expect(euroCentsToMinorUnits(summary.unreceivedSignedCents)).toBeGreaterThanOrEqual(0n)
        expect(euroCentsToMinorUnits(summary.unmatchedReceivedCents)).toBeGreaterThanOrEqual(0n)
        expect(euroCentsToMinorUnits(summary.unfundedCommittedCents)).toBeGreaterThanOrEqual(0n)
      }),
    )
  })

  it('preserves stage delta equations', () => {
    fc.assert(
      fc.property(monotonicInput, (input) => {
        const summary = expectOkSummary(input)

        expect(
          euroCentsToMinorUnits(
            addEuroCents(summary.signedAmountCents, summary.unsignedCommittedCents),
          ),
        ).toBe(euroCentsToMinorUnits(summary.committedAmountCents))
        expect(
          euroCentsToMinorUnits(
            addEuroCents(summary.receivedAmountCents, summary.unreceivedSignedCents),
          ),
        ).toBe(euroCentsToMinorUnits(summary.signedAmountCents))
        expect(
          euroCentsToMinorUnits(
            addEuroCents(summary.matchedAmountCents, summary.unmatchedReceivedCents),
          ),
        ).toBe(euroCentsToMinorUnits(summary.receivedAmountCents))
        expect(
          euroCentsToMinorUnits(
            addEuroCents(summary.receivedAmountCents, summary.unfundedCommittedCents),
          ),
        ).toBe(euroCentsToMinorUnits(summary.committedAmountCents))
      }),
    )
  })

  it('keeps target and status flags coherent', () => {
    fc.assert(
      fc.property(monotonicInput, (input) => {
        const summary = expectOkSummary(input)
        const remaining = euroCentsToMinorUnits(summary.remainingToTargetCents)
        const overTarget = euroCentsToMinorUnits(summary.overTargetCents)
        const unmatched = euroCentsToMinorUnits(summary.unmatchedReceivedCents)

        expect(remaining === 0n || overTarget === 0n).toBe(true)
        expect(summary.hasUnmatchedFunds).toBe(unmatched > 0n)
        expect(summary.isOverTarget).toBe(overTarget > 0n)
        expect(
          euroCentsToMinorUnits(
            subtractEuroCents(summary.committedAmountCents, summary.receivedAmountCents),
          ),
        ).toBe(euroCentsToMinorUnits(summary.unfundedCommittedCents))
      }),
    )
  })
})
