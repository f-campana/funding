import { Result } from '@repo/core'
import { z } from 'zod'

import { type CommitmentId, CommitmentIdSchema } from '../ids'
import {
  compareEuroCents,
  type EuroCents,
  euroCentsFromMinorUnits,
  NonNegativeEuroCentsJsonSchema,
  subtractEuroCents,
} from '../money'

export const CapitalStageSchema = z.enum(['committed', 'signed', 'received', 'matched'])
export type CapitalStage = z.infer<typeof CapitalStageSchema>

export const PaymentStatusSchema = z.enum([
  'not_requested',
  'instructions_released',
  'pending',
  'received',
  'matched',
  'exception_pending',
  'refunded',
])
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>

export type PaymentRecord = {
  readonly commitmentId: CommitmentId
  readonly expectedAmountCents: EuroCents
  readonly receivedAmountCents: EuroCents
  readonly status: PaymentStatus
  readonly payerName: string
  readonly subscriberName: string
  readonly reference?: string
}

export type CapitalReconciliationInput = {
  readonly targetAmountCents: EuroCents
  readonly committedAmountCents: EuroCents
  readonly signedAmountCents: EuroCents
  readonly receivedAmountCents: EuroCents
  readonly matchedAmountCents: EuroCents
}

export const CapitalReconciliationInputSchema = z
  .object({
    committedAmountCents: NonNegativeEuroCentsJsonSchema,
    matchedAmountCents: NonNegativeEuroCentsJsonSchema,
    receivedAmountCents: NonNegativeEuroCentsJsonSchema,
    signedAmountCents: NonNegativeEuroCentsJsonSchema,
    targetAmountCents: NonNegativeEuroCentsJsonSchema,
  })
  .strict()

export type CapitalReconciliationSummary = CapitalReconciliationInput & {
  readonly remainingToTargetCents: EuroCents
  readonly overTargetCents: EuroCents
  readonly unsignedCommittedCents: EuroCents
  readonly unreceivedSignedCents: EuroCents
  readonly unmatchedReceivedCents: EuroCents
  readonly unfundedCommittedCents: EuroCents
  readonly hasUnmatchedFunds: boolean
  readonly isOverTarget: boolean
}

export type CapitalReconciliationAmountField =
  | 'targetAmountCents'
  | 'committedAmountCents'
  | 'signedAmountCents'
  | 'receivedAmountCents'
  | 'matchedAmountCents'

export type CapitalReconciliationError =
  | {
      readonly _tag: 'NegativeAmount'
      readonly field: CapitalReconciliationAmountField
      readonly amountCents: EuroCents
    }
  | {
      readonly _tag: 'StageOrderViolation'
      readonly earlierStage: CapitalStage
      readonly laterStage: CapitalStage
      readonly earlierAmountCents: EuroCents
      readonly laterAmountCents: EuroCents
    }

const ZERO_CENTS = euroCentsFromMinorUnits(0n)

const RequiredTrimmedStringSchema = z
  .string()
  .trim()
  .min(1, { error: 'reconciliation.text.required' })

export const PaymentRecordSchema = z
  .object({
    commitmentId: CommitmentIdSchema,
    expectedAmountCents: NonNegativeEuroCentsJsonSchema,
    payerName: RequiredTrimmedStringSchema,
    receivedAmountCents: NonNegativeEuroCentsJsonSchema,
    reference: RequiredTrimmedStringSchema.optional(),
    status: PaymentStatusSchema,
    subscriberName: RequiredTrimmedStringSchema,
  })
  .transform((record): PaymentRecord => {
    if (record.reference === undefined) {
      return {
        commitmentId: record.commitmentId,
        expectedAmountCents: record.expectedAmountCents,
        payerName: record.payerName,
        receivedAmountCents: record.receivedAmountCents,
        status: record.status,
        subscriberName: record.subscriberName,
      }
    }

    return {
      commitmentId: record.commitmentId,
      expectedAmountCents: record.expectedAmountCents,
      payerName: record.payerName,
      receivedAmountCents: record.receivedAmountCents,
      reference: record.reference,
      status: record.status,
      subscriberName: record.subscriberName,
    }
  })

export const summarizeCapitalReconciliation = (
  input: CapitalReconciliationInput,
): Result<CapitalReconciliationSummary, CapitalReconciliationError> => {
  const negativeAmount = findNegativeAmount(input)

  if (negativeAmount !== undefined) {
    return Result.Error(negativeAmount)
  }

  const stageOrderViolation = findStageOrderViolation(input)

  if (stageOrderViolation !== undefined) {
    return Result.Error(stageOrderViolation)
  }

  const remainingToTargetCents = positiveDifference(
    input.targetAmountCents,
    input.committedAmountCents,
  )
  const overTargetCents = positiveDifference(input.committedAmountCents, input.targetAmountCents)
  const unsignedCommittedCents = subtractEuroCents(
    input.committedAmountCents,
    input.signedAmountCents,
  )
  const unreceivedSignedCents = subtractEuroCents(
    input.signedAmountCents,
    input.receivedAmountCents,
  )
  const unmatchedReceivedCents = subtractEuroCents(
    input.receivedAmountCents,
    input.matchedAmountCents,
  )
  const unfundedCommittedCents = subtractEuroCents(
    input.committedAmountCents,
    input.receivedAmountCents,
  )

  return Result.Ok({
    ...input,
    hasUnmatchedFunds: compareEuroCents(unmatchedReceivedCents, ZERO_CENTS) > 0,
    isOverTarget: compareEuroCents(overTargetCents, ZERO_CENTS) > 0,
    overTargetCents,
    remainingToTargetCents,
    unfundedCommittedCents,
    unreceivedSignedCents,
    unmatchedReceivedCents,
    unsignedCommittedCents,
  })
}

const findNegativeAmount = (
  input: CapitalReconciliationInput,
): CapitalReconciliationError | undefined => {
  const entries: readonly {
    readonly field: CapitalReconciliationAmountField
    readonly amountCents: EuroCents
  }[] = [
    { amountCents: input.targetAmountCents, field: 'targetAmountCents' },
    { amountCents: input.committedAmountCents, field: 'committedAmountCents' },
    { amountCents: input.signedAmountCents, field: 'signedAmountCents' },
    { amountCents: input.receivedAmountCents, field: 'receivedAmountCents' },
    { amountCents: input.matchedAmountCents, field: 'matchedAmountCents' },
  ]

  const negative = entries.find((entry) => compareEuroCents(entry.amountCents, ZERO_CENTS) < 0)

  if (negative === undefined) {
    return undefined
  }

  return {
    _tag: 'NegativeAmount',
    amountCents: negative.amountCents,
    field: negative.field,
  }
}

const findStageOrderViolation = (
  input: CapitalReconciliationInput,
): CapitalReconciliationError | undefined => {
  const pairs: readonly {
    readonly earlierStage: CapitalStage
    readonly earlierAmountCents: EuroCents
    readonly laterStage: CapitalStage
    readonly laterAmountCents: EuroCents
  }[] = [
    {
      earlierAmountCents: input.committedAmountCents,
      earlierStage: 'committed',
      laterAmountCents: input.signedAmountCents,
      laterStage: 'signed',
    },
    {
      earlierAmountCents: input.signedAmountCents,
      earlierStage: 'signed',
      laterAmountCents: input.receivedAmountCents,
      laterStage: 'received',
    },
    {
      earlierAmountCents: input.receivedAmountCents,
      earlierStage: 'received',
      laterAmountCents: input.matchedAmountCents,
      laterStage: 'matched',
    },
  ]

  const violation = pairs.find(
    (pair) => compareEuroCents(pair.laterAmountCents, pair.earlierAmountCents) > 0,
  )

  if (violation === undefined) {
    return undefined
  }

  return {
    _tag: 'StageOrderViolation',
    earlierAmountCents: violation.earlierAmountCents,
    earlierStage: violation.earlierStage,
    laterAmountCents: violation.laterAmountCents,
    laterStage: violation.laterStage,
  }
}

const positiveDifference = (left: EuroCents, right: EuroCents): EuroCents => {
  if (compareEuroCents(left, right) <= 0) {
    return ZERO_CENTS
  }

  return subtractEuroCents(left, right)
}
