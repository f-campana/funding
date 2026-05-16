import { Result } from '@repo/core'
import {
  type CapitalReconciliationError,
  type CapitalReconciliationSummary,
  type ClosingBlockerType,
  type EuroCents,
  euroCentsToMinorUnits,
  getClosingBlockerSeverityTone,
  getCommitmentLifecycleLabel,
  getDealLifecycleLabel,
  getDocumentRequirementStatusTone,
  getKybOperationalStatusLabel,
  getKycOperationalStatusLabel,
  getSignatureOperationalStatusLabel,
  getWireOperationalStatusLabel,
  serializeEuroCentsToNumber,
  summarizeCapitalReconciliation,
  summarizeClosingReadiness,
  summarizeDocumentCompleteness,
} from '@repo/domain'

import {
  NORTHSTAR_DEAL_SLUG,
  type NorthstarClosingBlockerFixture,
  type NorthstarDocumentRequirementFixture,
  type NorthstarInvestorOperationFixture,
  northstarOperationalFixture,
} from './fixtures/northstar-energy.fixture'
import type {
  CapitalReconciliationDTO,
  CapitalReconciliationErrorDTO,
  ClosingReadinessDTO,
  DealOperationalCenterDTO,
  DocumentCenterDTO,
  DocumentCompletenessDTO,
  DocumentRequirementDTO,
  GetOperationalCenterInputDTO,
  MoneyMinorUnitsDTO,
  MoneySerializationErrorDTO,
  OperationalRailDTO,
  ReadinessDimensionDTO,
  ReadinessDimensionStateDTO,
} from './operational-center-dto'

export type GetDealOperationalCenterError =
  | {
      readonly _tag: 'UnsupportedDeal'
      readonly dealId: string
    }
  | {
      readonly _tag: 'ReconciliationError'
      readonly error: CapitalReconciliationErrorDTO
    }
  | {
      readonly _tag: 'MoneySerializationError'
      readonly error: MoneySerializationErrorDTO
    }

export const getDealOperationalCenter = (
  input: GetOperationalCenterInputDTO,
): Result<DealOperationalCenterDTO, GetDealOperationalCenterError> => {
  const dealId = input.dealId.trim()

  if (dealId !== NORTHSTAR_DEAL_SLUG) {
    return Result.Error({ _tag: 'UnsupportedDeal', dealId })
  }

  const moneyContext = createMoneySerializationContext()
  const capitalResult = summarizeCapitalReconciliation(northstarOperationalFixture.capital)

  if (capitalResult.isError()) {
    return Result.Error({
      _tag: 'ReconciliationError',
      error: mapCapitalReconciliationError(capitalResult.error, moneyContext.money),
    })
  }

  const readinessSummary = summarizeClosingReadiness({
    blockers: northstarOperationalFixture.blockers,
  })
  const documents = mapDocuments(northstarOperationalFixture.documents)
  const blockers = northstarOperationalFixture.blockers.map(mapBlocker)
  const investors = northstarOperationalFixture.investors.map((investor) =>
    mapInvestor(investor, northstarOperationalFixture.blockers, moneyContext.money),
  )
  const documentSummary = summarizeDocumentCompleteness(northstarOperationalFixture.documents)
  const readiness = mapReadiness(readinessSummary, northstarOperationalFixture.blockers)
  const capital = mapCapital(capitalResult.value, moneyContext.money)
  const documentsCenter: DocumentCenterDTO = {
    groups: northstarOperationalFixture.documentGroups,
    requirements: documents,
    summary: mapDocumentSummary(documentSummary),
  }
  const routes = {
    about: `/deals/${northstarOperationalFixture.deal.slug}/about`,
    commitments: `/deals/${northstarOperationalFixture.deal.slug}/commitments`,
    documents: `/deals/${northstarOperationalFixture.deal.slug}/documents`,
  } as const
  const rail = mapRail({
    capital,
    documentSummary: documentsCenter.summary,
    investors,
    readiness,
  })

  const moneyError = moneyContext.firstError()

  if (moneyError !== undefined) {
    return Result.Error({ _tag: 'MoneySerializationError', error: moneyError })
  }

  return Result.Ok({
    _tag: 'DealOperationalCenter',
    activity: northstarOperationalFixture.activity,
    blockers,
    capital,
    deal: {
      ...northstarOperationalFixture.deal,
      stageLabel: getDealLifecycleLabel(northstarOperationalFixture.deal.stage),
    },
    documents: documentsCenter,
    generatedAt: northstarOperationalFixture.generatedAt,
    investors,
    rail,
    readiness,
    routes,
  })
}

type MoneySerializer = (value: EuroCents, field: string) => MoneyMinorUnitsDTO

const createMoneySerializationContext = () => {
  const errors: MoneySerializationErrorDTO[] = []

  const money: MoneySerializer = (value, field) => {
    const serialized = serializeEuroCentsToNumber(value)

    if (serialized.isError()) {
      errors.push({
        _tag: 'UnsafeMoneyAmount',
        amountMinor: euroCentsToMinorUnits(value).toString(),
        field,
      })

      return { amountMinor: 0, currency: 'EUR' }
    }

    return { amountMinor: serialized.value, currency: 'EUR' }
  }

  return {
    firstError: (): MoneySerializationErrorDTO | undefined => errors.at(0),
    money,
  }
}

const mapCapital = (
  summary: CapitalReconciliationSummary,
  money: MoneySerializer,
): CapitalReconciliationDTO => ({
  committedAmount: money(summary.committedAmountCents, 'capital.committedAmount'),
  economics: {
    carryPercent: northstarOperationalFixture.capital.carryPercent,
    entryFees: money(northstarOperationalFixture.capital.entryFeesCents, 'capital.entryFees'),
    grossCommitted: money(summary.committedAmountCents, 'capital.grossCommitted'),
    netInvestableAmount: money(
      northstarOperationalFixture.capital.netInvestableAmountCents,
      'capital.netInvestableAmount',
    ),
    spvFee: money(northstarOperationalFixture.capital.spvFeeCents, 'capital.spvFee'),
  },
  hasUnmatchedFunds: summary.hasUnmatchedFunds,
  isOverTarget: summary.isOverTarget,
  matchedAmount: money(summary.matchedAmountCents, 'capital.matchedAmount'),
  overTarget: money(summary.overTargetCents, 'capital.overTarget'),
  receivedAmount: money(summary.receivedAmountCents, 'capital.receivedAmount'),
  remainingToTarget: money(summary.remainingToTargetCents, 'capital.remainingToTarget'),
  signedAmount: money(summary.signedAmountCents, 'capital.signedAmount'),
  targetAmount: money(summary.targetAmountCents, 'capital.targetAmount'),
  unfundedCommitted: money(summary.unfundedCommittedCents, 'capital.unfundedCommitted'),
  unmatchedReceived: money(summary.unmatchedReceivedCents, 'capital.unmatchedReceived'),
  unreceivedSigned: money(summary.unreceivedSignedCents, 'capital.unreceivedSigned'),
  unsignedCommitted: money(summary.unsignedCommittedCents, 'capital.unsignedCommitted'),
})

const mapCapitalReconciliationError = (
  error: CapitalReconciliationError,
  money: MoneySerializer,
): CapitalReconciliationErrorDTO => {
  if (error._tag === 'NegativeAmount') {
    return {
      _tag: 'NegativeAmount',
      amount: money(error.amountCents, `capital.${error.field}`),
      field: error.field,
    }
  }

  return {
    _tag: 'StageOrderViolation',
    earlierAmount: money(error.earlierAmountCents, `capital.${error.earlierStage}`),
    earlierStage: error.earlierStage,
    laterAmount: money(error.laterAmountCents, `capital.${error.laterStage}`),
    laterStage: error.laterStage,
  }
}

const mapReadiness = (
  summary: Omit<ClosingReadinessDTO, 'dimensions'>,
  blockers: readonly NorthstarClosingBlockerFixture[],
): ClosingReadinessDTO => ({
  ...summary,
  dimensions: [
    mapDimension('investor_identity', 'Investor identity', ['kyc', 'kyb', 'compliance'], blockers),
    mapDimension('signatures', 'Signatures', ['signature'], blockers),
    mapDimension('wires', 'Wires', ['wire'], blockers),
    mapDimension('documents', 'Documents', ['document'], blockers),
    mapDimension(
      'capital_reconciliation',
      'Capital reconciliation',
      ['reconciliation', 'allocation'],
      blockers,
    ),
    mapDimension('vehicle_setup', 'Vehicle setup', ['deadline'], blockers),
  ],
})

const mapDimension = (
  id: ReadinessDimensionDTO['id'],
  label: string,
  types: readonly ClosingBlockerType[],
  blockers: readonly NorthstarClosingBlockerFixture[],
): ReadinessDimensionDTO => {
  const relevant = blockers.filter((blocker) => !blocker.resolved && types.includes(blocker.type))

  return {
    blockerCount: relevant.length,
    id,
    label,
    state: readinessStateFromBlockers(relevant),
  }
}

const readinessStateFromBlockers = (
  blockers: readonly NorthstarClosingBlockerFixture[],
): ReadinessDimensionStateDTO => {
  if (blockers.some((blocker) => blocker.severity === 'critical')) {
    return 'blocked'
  }

  if (blockers.some((blocker) => blocker.severity === 'warning')) {
    return 'attention'
  }

  if (blockers.some((blocker) => blocker.severity === 'info')) {
    return 'attention'
  }

  return 'ready'
}

const mapBlocker = (blocker: NorthstarClosingBlockerFixture) => ({
  description: blocker.description,
  id: blocker.id,
  owner: blocker.owner,
  relatedDocumentIds: blocker.relatedDocumentIds,
  relatedInvestorIds: blocker.relatedInvestorIds,
  resolved: blocker.resolved,
  routeHint: blocker.routeHint,
  severity: blocker.severity,
  title: blocker.title,
  tone: getClosingBlockerSeverityTone(blocker.severity),
  type: blocker.type,
})

const mapInvestor = (
  investor: NorthstarInvestorOperationFixture,
  blockers: readonly NorthstarClosingBlockerFixture[],
  money: MoneySerializer,
) => {
  const unresolvedBlockersById = new Map(
    blockers.filter((blocker) => !blocker.resolved).map((blocker) => [blocker.id, blocker]),
  )
  const investorBlockers = investor.blockerIds
    .map((blockerId) => unresolvedBlockersById.get(blockerId))
    .filter((blocker): blocker is NorthstarClosingBlockerFixture => blocker !== undefined)
  const kybStatusLabel =
    investor.kybStatus === undefined ? undefined : getKybOperationalStatusLabel(investor.kybStatus)

  return {
    blockerIds: investor.blockerIds,
    commitmentAmount: money(investor.commitmentAmountCents, `investors.${investor.id}.commitment`),
    commitmentStatus: investor.commitmentStatus,
    commitmentStatusLabel: getCommitmentLifecycleLabel(investor.commitmentStatus),
    documentIds: investor.documentIds,
    id: investor.id,
    investorName: investor.investorName,
    kycStatus: investor.kycStatus,
    kycStatusLabel: getKycOperationalStatusLabel(investor.kycStatus),
    readinessState: readinessStateFromBlockers(investorBlockers),
    signatureStatus: investor.signatureStatus,
    signatureStatusLabel: getSignatureOperationalStatusLabel(investor.signatureStatus),
    wireStatus: investor.wireStatus,
    wireStatusLabel: getWireOperationalStatusLabel(investor.wireStatus),
    ...(investor.investorEmail === undefined ? {} : { investorEmail: investor.investorEmail }),
    ...(investor.kybStatus === undefined
      ? {}
      : {
          kybStatus: investor.kybStatus,
          ...(kybStatusLabel === undefined ? {} : { kybStatusLabel }),
        }),
    ...(investor.lastActivityAt === undefined ? {} : { lastActivityAt: investor.lastActivityAt }),
    ...(investor.legalEntityName === undefined
      ? {}
      : { legalEntityName: investor.legalEntityName }),
  }
}

const mapDocuments = (
  documents: readonly NorthstarDocumentRequirementFixture[],
): readonly DocumentRequirementDTO[] =>
  documents.map((document) => ({
    blocksClosing: document.blocksClosing,
    category: document.category,
    groupId: document.groupId,
    id: document.id,
    label: document.label,
    owner: document.owner,
    required: document.required,
    status: document.status,
    tone: getDocumentRequirementStatusTone(document.status),
    ...(document.dueDate === undefined ? {} : { dueDate: document.dueDate }),
    ...(document.lastActivityAt === undefined ? {} : { lastActivityAt: document.lastActivityAt }),
    ...(document.relatedInvestorId === undefined
      ? {}
      : { relatedInvestorId: document.relatedInvestorId }),
  }))

const mapDocumentSummary = (summary: DocumentCompletenessDTO): DocumentCompletenessDTO => ({
  approvedCount: summary.approvedCount,
  expiredCount: summary.expiredCount,
  isComplete: summary.isComplete,
  missingCount: summary.missingCount,
  optionalCount: summary.optionalCount,
  rejectedCount: summary.rejectedCount,
  requiredCount: summary.requiredCount,
  requiredExpiredCount: summary.requiredExpiredCount,
  requiredMissingCount: summary.requiredMissingCount,
  requiredRejectedCount: summary.requiredRejectedCount,
  totalCount: summary.totalCount,
  underReviewCount: summary.underReviewCount,
  uploadedCount: summary.uploadedCount,
})

const mapRail = ({
  capital,
  documentSummary,
  investors,
  readiness,
}: {
  readonly capital: CapitalReconciliationDTO
  readonly documentSummary: DocumentCompletenessDTO
  readonly investors: readonly { readonly readinessState: ReadinessDimensionStateDTO }[]
  readonly readiness: ClosingReadinessDTO
}): OperationalRailDTO => ({
  capitalCallout: {
    label: 'Net investable amount',
    value: capital.economics.netInvestableAmount,
  },
  criticalBlockerCount: readiness.criticalBlockerCount,
  documentIssueCount:
    documentSummary.requiredMissingCount +
    documentSummary.requiredRejectedCount +
    documentSummary.requiredExpiredCount,
  investorsBlockedCount: investors.filter((investor) => investor.readinessState === 'blocked')
    .length,
  nextActionLabel: readiness.nextActionLabel,
  readinessState: readiness.state,
  targetCloseDate: northstarOperationalFixture.deal.targetCloseDate,
  warningBlockerCount: readiness.warningBlockerCount,
})
