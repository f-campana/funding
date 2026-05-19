import { Result } from '@repo/core'
import type { CapitalReconciliationError, CapitalReconciliationSummary } from '@repo/domain'

import type { NorthstarOperationalFixture } from './fixtures/northstar-energy.fixture'
import type {
  CapitalReconciliationDTO,
  CapitalReconciliationErrorDTO,
} from './operational-center-dto'
import { type MoneySerializationResult, mapMoneyFields, money } from './operational-center-money'

export const mapCapital = (
  summary: CapitalReconciliationSummary,
  capital: NorthstarOperationalFixture['capital'],
): MoneySerializationResult<CapitalReconciliationDTO> =>
  mapMoneyFields([
    {
      field: 'capital.committedAmount',
      key: 'committedAmount',
      value: summary.committedAmountCents,
    },
    {
      field: 'capital.entryFees',
      key: 'entryFees',
      value: capital.entryFeesCents,
    },
    { field: 'capital.grossCommitted', key: 'grossCommitted', value: summary.committedAmountCents },
    { field: 'capital.matchedAmount', key: 'matchedAmount', value: summary.matchedAmountCents },
    {
      field: 'capital.netInvestableAmount',
      key: 'netInvestableAmount',
      value: capital.netInvestableAmountCents,
    },
    { field: 'capital.overTarget', key: 'overTarget', value: summary.overTargetCents },
    { field: 'capital.receivedAmount', key: 'receivedAmount', value: summary.receivedAmountCents },
    {
      field: 'capital.remainingToTarget',
      key: 'remainingToTarget',
      value: summary.remainingToTargetCents,
    },
    { field: 'capital.signedAmount', key: 'signedAmount', value: summary.signedAmountCents },
    {
      field: 'capital.spvFee',
      key: 'spvFee',
      value: capital.spvFeeCents,
    },
    { field: 'capital.targetAmount', key: 'targetAmount', value: summary.targetAmountCents },
    {
      field: 'capital.unfundedCommitted',
      key: 'unfundedCommitted',
      value: summary.unfundedCommittedCents,
    },
    {
      field: 'capital.unmatchedReceived',
      key: 'unmatchedReceived',
      value: summary.unmatchedReceivedCents,
    },
    {
      field: 'capital.unreceivedSigned',
      key: 'unreceivedSigned',
      value: summary.unreceivedSignedCents,
    },
    {
      field: 'capital.unsignedCommitted',
      key: 'unsignedCommitted',
      value: summary.unsignedCommittedCents,
    },
  ] as const).map((amounts) => ({
    committedAmount: amounts.committedAmount,
    economics: {
      carryPercent: capital.carryPercent,
      entryFees: amounts.entryFees,
      grossCommitted: amounts.grossCommitted,
      netInvestableAmount: amounts.netInvestableAmount,
      spvFee: amounts.spvFee,
    },
    matchedAmount: amounts.matchedAmount,
    matching:
      amounts.unmatchedReceived.amountMinor > 0
        ? { kind: 'unmatched', unmatchedReceived: amounts.unmatchedReceived }
        : { kind: 'matched' },
    receivedAmount: amounts.receivedAmount,
    signedAmount: amounts.signedAmount,
    targetAmount: amounts.targetAmount,
    targetPosition:
      amounts.overTarget.amountMinor > 0
        ? { kind: 'over_target', overTarget: amounts.overTarget }
        : amounts.remainingToTarget.amountMinor > 0
          ? { kind: 'under_target', remainingToTarget: amounts.remainingToTarget }
          : { kind: 'at_target' },
    unfundedCommitted: amounts.unfundedCommitted,
    unreceivedSigned: amounts.unreceivedSigned,
    unsignedCommitted: amounts.unsignedCommitted,
  }))

export const mapCapitalReconciliationError = (
  error: CapitalReconciliationError,
): MoneySerializationResult<CapitalReconciliationErrorDTO> => {
  if (error._tag === 'NegativeAmount') {
    return money(error.amountCents, `capital.${error.field}`).map((amount) => ({
      _tag: 'NegativeAmount',
      amount,
      field: error.field,
    }))
  }

  const earlierAmount = money(error.earlierAmountCents, `capital.${error.earlierStage}`)

  if (earlierAmount.isError()) {
    return Result.Error(earlierAmount.error)
  }

  const laterAmount = money(error.laterAmountCents, `capital.${error.laterStage}`)

  if (laterAmount.isError()) {
    return Result.Error(laterAmount.error)
  }

  return Result.Ok({
    _tag: 'StageOrderViolation',
    earlierAmount: earlierAmount.value,
    earlierStage: error.earlierStage,
    laterAmount: laterAmount.value,
    laterStage: error.laterStage,
  })
}
