import type { DealOperationalMetricTone } from '@repo/kit/deal-operational-overview'

import type {
  CapitalMatchingDTO,
  CapitalReconciliationDTO,
  CapitalTargetPositionDTO,
  DealOperationalCenterDTO,
  MoneyMinorUnitsDTO,
} from '@/server/deals'

import { formatMoney } from './deal-operational-formatting'

export const getCapitalProgressLabel = (capital: CapitalReconciliationDTO): string => {
  if (capital.targetPosition.kind === 'over_target') {
    return `${formatMoney(capital.targetPosition.overTarget)} over target`
  }

  return `${progressPercent(
    capital.committedAmount.amountMinor,
    capital.targetAmount.amountMinor,
  )}% of target committed`
}

export const getCapitalSupportingLabel = (targetPosition: CapitalTargetPositionDTO): string => {
  if (targetPosition.kind === 'over_target') {
    return `${formatMoney(targetPosition.overTarget)} over target`
  }

  if (targetPosition.kind === 'under_target') {
    return `${formatMoney(targetPosition.remainingToTarget)} remaining to target`
  }

  return 'Target reached'
}

export const getUnmatchedReceivedAmount = (
  matching: CapitalMatchingDTO,
  currency: MoneyMinorUnitsDTO['currency'],
): MoneyMinorUnitsDTO =>
  matching.kind === 'unmatched' ? matching.unmatchedReceived : { amountMinor: 0, currency }

export const amountDescription = (amount: MoneyMinorUnitsDTO, label: string) =>
  amount.amountMinor > 0 ? { description: `${formatMoney(amount)} ${label}` } : {}

export const amountTone = (
  amount: MoneyMinorUnitsDTO,
  positiveTone: DealOperationalMetricTone,
  zeroTone: DealOperationalMetricTone,
): DealOperationalMetricTone => (amount.amountMinor > 0 ? positiveTone : zeroTone)

export const progressPercent = (part: number, total: number): number => {
  if (total <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round((part / total) * 100)))
}

export const basisPoints = (part: MoneyMinorUnitsDTO, total: MoneyMinorUnitsDTO): number => {
  if (total.amountMinor <= 0) {
    return 0
  }

  return Math.max(0, Math.round((part.amountMinor / total.amountMinor) * 10_000))
}

export const compositionBasisPoints = (
  part: MoneyMinorUnitsDTO,
  capital: DealOperationalCenterDTO['capital'],
): number => {
  const total =
    capital.economics.netInvestableAmount.amountMinor +
    capital.economics.entryFees.amountMinor +
    capital.economics.spvFee.amountMinor

  if (total <= 0) {
    return 0
  }

  return Math.max(0, Math.round((part.amountMinor / total) * 10_000))
}
