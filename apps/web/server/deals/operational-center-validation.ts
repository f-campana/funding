import 'server-only'

import { Result } from '@repo/core'
import { z } from 'zod'

import type {
  CapitalReconciliationDTO,
  DealOperationalCenterDTO,
  DealOperationalCenterValidationErrorDTO,
  MoneyMinorUnitsDTO,
} from './operational-center-dto'

export const MoneyMinorUnitsSchema = z
  .object({
    amountMinor: z.number().int().safe().nonnegative(),
    currency: z.literal('EUR'),
  })
  .strict()

export const IsoDateTimeStringSchema = z.string().datetime()

type MoneyCandidate = {
  readonly path: string
  readonly value: MoneyMinorUnitsDTO
}

type DateCandidate = {
  readonly path: string
  readonly value: string
}

type ReferenceCandidate = {
  readonly path: string
  readonly target: string
  readonly targetIds: ReadonlySet<string>
  readonly value: string
}

export const validateDealOperationalCenter = (
  data: DealOperationalCenterDTO,
): Result<DealOperationalCenterDTO, DealOperationalCenterValidationErrorDTO> => {
  const moneyError = findInvalidMoney(data)

  if (moneyError !== null) {
    return Result.Error(moneyError)
  }

  const dateError = findInvalidDate(data)

  if (dateError !== null) {
    return Result.Error(dateError)
  }

  const capitalError = validateCapital(data.capital)

  if (capitalError !== null) {
    return Result.Error(capitalError)
  }

  const graphError = findDanglingReference(data)

  if (graphError !== null) {
    return Result.Error(graphError)
  }

  return Result.Ok(data)
}

const findInvalidMoney = (
  data: DealOperationalCenterDTO,
): DealOperationalCenterValidationErrorDTO | null => {
  for (const candidate of getMoneyCandidates(data)) {
    if (!MoneyMinorUnitsSchema.safeParse(candidate.value).success) {
      return { _tag: 'InvalidMoney', path: candidate.path }
    }
  }

  return null
}

const findInvalidDate = (
  data: DealOperationalCenterDTO,
): DealOperationalCenterValidationErrorDTO | null => {
  for (const candidate of getDateCandidates(data)) {
    if (!IsoDateTimeStringSchema.safeParse(candidate.value).success) {
      return { _tag: 'InvalidDateTime', path: candidate.path }
    }
  }

  return null
}

const validateCapital = (
  capital: CapitalReconciliationDTO,
): DealOperationalCenterValidationErrorDTO | null =>
  validateNoFinanceAcceptedCapitalFields(capital) ??
  validateEconomicsInvariant(capital) ??
  validateMatchingInvariant(capital) ??
  validateTargetPositionInvariant(capital)

const validateNoFinanceAcceptedCapitalFields = (
  capital: CapitalReconciliationDTO,
): DealOperationalCenterValidationErrorDTO | null => {
  const capitalRecord = capital as Record<string, unknown>

  for (const field of forbiddenCapitalFieldNames) {
    if (Object.hasOwn(capitalRecord, field)) {
      return {
        _tag: 'CapitalInvariantViolation',
        message: `DTO must not expose ${field} without source finance acceptance`,
      }
    }
  }

  return null
}

const validateEconomicsInvariant = (
  capital: CapitalReconciliationDTO,
): DealOperationalCenterValidationErrorDTO | null => {
  const grossCommitted = capital.economics.grossCommitted.amountMinor
  const economicsTotal =
    capital.economics.netInvestableAmount.amountMinor +
    capital.economics.entryFees.amountMinor +
    capital.economics.spvFee.amountMinor

  if (grossCommitted !== economicsTotal) {
    return {
      _tag: 'CapitalInvariantViolation',
      message: 'grossCommitted must equal netInvestableAmount + entryFees + spvFee',
    }
  }

  return null
}

const validateMatchingInvariant = (
  capital: CapitalReconciliationDTO,
): DealOperationalCenterValidationErrorDTO | null => {
  const received = capital.receivedAmount.amountMinor
  const matched = capital.matchedAmount.amountMinor

  if (matched > received) {
    return {
      _tag: 'CapitalInvariantViolation',
      message: 'matchedAmount must not exceed receivedAmount',
    }
  }

  const unmatchedReceived = received - matched

  if (capital.matching.kind === 'matched') {
    return unmatchedReceived === 0
      ? null
      : {
          _tag: 'CapitalInvariantViolation',
          message: 'matched capital cannot have unmatched received funds',
        }
  }

  if (capital.matching.unmatchedReceived.amountMinor !== unmatchedReceived) {
    return {
      _tag: 'CapitalInvariantViolation',
      message: 'unmatchedReceived must equal receivedAmount - matchedAmount',
    }
  }

  return null
}

const validateTargetPositionInvariant = (
  capital: CapitalReconciliationDTO,
): DealOperationalCenterValidationErrorDTO | null => {
  const committed = capital.committedAmount.amountMinor
  const target = capital.targetAmount.amountMinor

  if (capital.targetPosition.kind === 'under_target') {
    return capital.targetPosition.remainingToTarget.amountMinor === target - committed
      ? null
      : {
          _tag: 'CapitalInvariantViolation',
          message: 'remainingToTarget must equal targetAmount - committedAmount',
        }
  }

  if (capital.targetPosition.kind === 'over_target') {
    return capital.targetPosition.overTarget.amountMinor === committed - target
      ? null
      : {
          _tag: 'CapitalInvariantViolation',
          message: 'overTarget must equal committedAmount - targetAmount',
        }
  }

  return committed === target
    ? null
    : {
        _tag: 'CapitalInvariantViolation',
        message: 'at_target requires committedAmount to equal targetAmount',
      }
}

const findDanglingReference = (
  data: DealOperationalCenterDTO,
): DealOperationalCenterValidationErrorDTO | null => {
  for (const candidate of getReferenceCandidates(data)) {
    if (!candidate.targetIds.has(candidate.value)) {
      return {
        _tag: 'DanglingReference',
        path: candidate.path,
        target: candidate.target,
      }
    }
  }

  return null
}

const getMoneyCandidates = (data: DealOperationalCenterDTO): readonly MoneyCandidate[] => [
  { path: 'capital.targetAmount', value: data.capital.targetAmount },
  { path: 'capital.committedAmount', value: data.capital.committedAmount },
  { path: 'capital.signedAmount', value: data.capital.signedAmount },
  { path: 'capital.receivedAmount', value: data.capital.receivedAmount },
  { path: 'capital.matchedAmount', value: data.capital.matchedAmount },
  { path: 'capital.unsignedCommitted', value: data.capital.unsignedCommitted },
  { path: 'capital.unreceivedSigned', value: data.capital.unreceivedSigned },
  { path: 'capital.unfundedCommitted', value: data.capital.unfundedCommitted },
  ...targetPositionMoneyCandidates(data.capital),
  ...matchingMoneyCandidates(data.capital),
  { path: 'capital.economics.grossCommitted', value: data.capital.economics.grossCommitted },
  { path: 'capital.economics.entryFees', value: data.capital.economics.entryFees },
  { path: 'capital.economics.spvFee', value: data.capital.economics.spvFee },
  {
    path: 'capital.economics.netInvestableAmount',
    value: data.capital.economics.netInvestableAmount,
  },
  ...data.investors.map((investor) => ({
    path: `investors.${investor.id}.commitmentAmount`,
    value: investor.commitmentAmount,
  })),
]

const targetPositionMoneyCandidates = (
  capital: CapitalReconciliationDTO,
): readonly MoneyCandidate[] => {
  if (capital.targetPosition.kind === 'under_target') {
    return [
      {
        path: 'capital.targetPosition.remainingToTarget',
        value: capital.targetPosition.remainingToTarget,
      },
    ]
  }

  if (capital.targetPosition.kind === 'over_target') {
    return [
      {
        path: 'capital.targetPosition.overTarget',
        value: capital.targetPosition.overTarget,
      },
    ]
  }

  return []
}

const matchingMoneyCandidates = (capital: CapitalReconciliationDTO): readonly MoneyCandidate[] =>
  capital.matching.kind === 'unmatched'
    ? [
        {
          path: 'capital.matching.unmatchedReceived',
          value: capital.matching.unmatchedReceived,
        },
      ]
    : []

const getDateCandidates = (data: DealOperationalCenterDTO): readonly DateCandidate[] => [
  { path: 'generatedAt', value: data.generatedAt },
  { path: 'deal.targetCloseDate', value: data.deal.targetCloseDate },
  { path: 'deal.lastUpdatedAt', value: data.deal.lastUpdatedAt },
  ...data.investors.flatMap((investor) =>
    optionalDateCandidate(investor.lastActivityAt, `investors.${investor.id}.lastActivityAt`),
  ),
  ...data.documents.requirements.flatMap((document) => [
    ...optionalDateCandidate(document.dueDate, `documents.requirements.${document.id}.dueDate`),
    ...optionalDateCandidate(
      document.lastActivityAt,
      `documents.requirements.${document.id}.lastActivityAt`,
    ),
  ]),
  ...data.activity.map((activity) => ({
    path: `activity.${activity.id}.occurredAt`,
    value: activity.occurredAt,
  })),
]

const optionalDateCandidate = (
  value: string | undefined,
  path: string,
): readonly DateCandidate[] => (value === undefined ? [] : [{ path, value }])

const getReferenceCandidates = (data: DealOperationalCenterDTO): readonly ReferenceCandidate[] => {
  const investorIds = new Set(data.investors.map((investor) => investor.id))
  const blockerIds = new Set(data.blockers.map((blocker) => blocker.id))
  const documentIds = new Set(data.documents.requirements.map((document) => document.id))
  const groupIds = new Set(data.documents.groups.map((group) => group.id))

  return [
    ...data.investors.flatMap((investor) => [
      ...referenceCandidates(
        investor.blockerIds,
        blockerIds,
        `investors.${investor.id}.blockerIds`,
        'blockers',
      ),
      ...referenceCandidates(
        investor.documentIds,
        documentIds,
        `investors.${investor.id}.documentIds`,
        'documents.requirements',
      ),
    ]),
    ...data.blockers.flatMap((blocker) => [
      ...referenceCandidates(
        blocker.relatedInvestorIds,
        investorIds,
        `blockers.${blocker.id}.relatedInvestorIds`,
        'investors',
      ),
      ...referenceCandidates(
        blocker.relatedDocumentIds,
        documentIds,
        `blockers.${blocker.id}.relatedDocumentIds`,
        'documents.requirements',
      ),
    ]),
    ...data.documents.requirements.flatMap((document) => [
      referenceCandidate(
        document.groupId,
        groupIds,
        `documents.requirements.${document.id}.groupId`,
        'documents.groups',
      ),
      ...optionalReferenceCandidate(
        document.relatedInvestorId,
        investorIds,
        `documents.requirements.${document.id}.relatedInvestorId`,
        'investors',
      ),
    ]),
    ...data.documents.groups.flatMap((group) =>
      referenceCandidates(
        group.documentIds,
        documentIds,
        `documents.groups.${group.id}.documentIds`,
        'documents.requirements',
      ),
    ),
    ...data.activity.flatMap((activity) => [
      ...optionalReferenceCandidate(
        'relatedInvestorId' in activity ? activity.relatedInvestorId : undefined,
        investorIds,
        `activity.${activity.id}.relatedInvestorId`,
        'investors',
      ),
      ...optionalReferenceCandidate(
        'relatedDocumentId' in activity ? activity.relatedDocumentId : undefined,
        documentIds,
        `activity.${activity.id}.relatedDocumentId`,
        'documents.requirements',
      ),
      ...optionalReferenceCandidate(
        'relatedBlockerId' in activity ? activity.relatedBlockerId : undefined,
        blockerIds,
        `activity.${activity.id}.relatedBlockerId`,
        'blockers',
      ),
    ]),
  ]
}

const referenceCandidates = (
  values: readonly string[],
  targetIds: ReadonlySet<string>,
  path: string,
  target: string,
): readonly ReferenceCandidate[] =>
  values.map((value, index) => ({
    path: `${path}[${index}]`,
    target: `${target}.${value}`,
    targetIds,
    value,
  }))

const optionalReferenceCandidate = (
  value: string | undefined,
  targetIds: ReadonlySet<string>,
  path: string,
  target: string,
): readonly ReferenceCandidate[] =>
  value === undefined ? [] : [referenceCandidate(value, targetIds, path, target)]

const referenceCandidate = (
  value: string,
  targetIds: ReadonlySet<string>,
  path: string,
  target: string,
): ReferenceCandidate => ({
  path,
  target: `${target}.${value}`,
  targetIds,
  value,
})

const forbiddenCapitalFieldNames = [
  'deployableAmount',
  'deployableCapital',
  'financeAcceptedAmount',
  'financeAcceptedCapital',
  'reconciledAmount',
  'reconciledCapital',
] as const
