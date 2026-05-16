import { Result } from '@repo/core'
import {
  type CapitalReconciliationError,
  type CapitalReconciliationSummary,
  type ClosingBlockerType,
  type DocumentRequirementStatus,
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
  type KycOperationalStatus,
  type SignatureOperationalStatus,
  serializeEuroCentsToNumber,
  summarizeCapitalReconciliation,
  summarizeClosingReadiness,
  summarizeDocumentCompleteness,
  type WireOperationalStatus,
} from '@repo/domain'

import {
  NORTHSTAR_DEAL_SLUG,
  type NorthstarClosingBlockerFixture,
  type NorthstarDocumentRequirementFixture,
  type NorthstarInvestorOperationFixture,
  type NorthstarOperationalFixture,
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
    hasOperationalInputs: true,
  })
  const documents = mapDocuments(northstarOperationalFixture.documents)
  const blockers = northstarOperationalFixture.blockers.map(mapBlocker)
  const investors = northstarOperationalFixture.investors.map((investor) =>
    mapInvestor(investor, northstarOperationalFixture.blockers, moneyContext.money),
  )
  const documentSummary = summarizeDocumentCompleteness(northstarOperationalFixture.documents)
  const readiness = deriveClosingReadiness({
    blockers: northstarOperationalFixture.blockers,
    capital: capitalResult.value,
    documents: northstarOperationalFixture.documents,
    investors: northstarOperationalFixture.investors,
    summary: readinessSummary,
    vehicle: northstarOperationalFixture.deal.vehicle,
  })
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

const READINESS_NEXT_ACTION_LABELS = {
  attention: 'Review operational exceptions before close',
  blocked: 'Resolve blocking operational exceptions before close',
  not_started: 'Start operational readiness review',
  ready: 'Proceed to closing review',
} as const satisfies Record<ClosingReadinessDTO['state'], string>

export const deriveClosingReadiness = ({
  blockers,
  capital,
  documents,
  investors,
  summary,
  vehicle,
}: {
  readonly summary: Omit<ClosingReadinessDTO, 'dimensions'>
  readonly blockers: readonly NorthstarClosingBlockerFixture[]
  readonly investors: readonly NorthstarInvestorOperationFixture[]
  readonly documents: readonly NorthstarDocumentRequirementFixture[]
  readonly capital: CapitalReconciliationSummary
  readonly vehicle: NorthstarOperationalFixture['deal']['vehicle']
}): ClosingReadinessDTO => {
  const dimensions = [
    mapDimension({
      blockers,
      id: 'investor_identity',
      label: 'Investor identity',
      sourceState: getInvestorIdentitySourceState(investors),
      types: ['kyc', 'kyb', 'compliance'],
    }),
    mapDimension({
      blockers,
      id: 'signatures',
      label: 'Signatures',
      sourceState: getSignatureSourceState(investors),
      types: ['signature'],
    }),
    mapDimension({
      blockers,
      id: 'wires',
      label: 'Wires',
      sourceState: getWireSourceState(investors),
      types: ['wire'],
    }),
    mapDimension({
      blockers,
      id: 'documents',
      label: 'Documents',
      sourceState: getDocumentSourceState(documents),
      types: ['document'],
    }),
    mapDimension({
      blockers,
      id: 'capital_reconciliation',
      label: 'Capital reconciliation',
      sourceState: getCapitalSourceState(capital),
      types: ['reconciliation', 'allocation'],
    }),
    mapDimension({
      blockers,
      id: 'vehicle_setup',
      label: 'Vehicle setup',
      sourceState: getVehicleSourceState(vehicle.setupStatus),
      types: ['deadline'],
    }),
  ] as const satisfies readonly ReadinessDimensionDTO[]
  const state = combineReadinessStates([
    summary.state,
    ...dimensions.map((dimension) => dimension.state),
  ])

  return {
    ...summary,
    dimensions,
    nextActionLabel: READINESS_NEXT_ACTION_LABELS[state],
    state,
  }
}

const mapDimension = ({
  blockers,
  id,
  label,
  sourceState,
  types,
}: {
  readonly id: ReadinessDimensionDTO['id']
  readonly label: string
  readonly sourceState: ReadinessDimensionStateDTO
  readonly types: readonly ClosingBlockerType[]
  readonly blockers: readonly NorthstarClosingBlockerFixture[]
}): ReadinessDimensionDTO => {
  const relevant = blockers.filter((blocker) => !blocker.resolved && types.includes(blocker.type))

  return {
    blockerCount: relevant.length,
    id,
    label,
    state: combineReadinessStates([sourceState, readinessStateFromBlockers(relevant)]),
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

const combineReadinessStates = (
  states: readonly ReadinessDimensionStateDTO[],
): ReadinessDimensionStateDTO => {
  if (states.some((state) => state === 'blocked')) {
    return 'blocked'
  }

  if (states.some((state) => state === 'attention')) {
    return 'attention'
  }

  if (states.some((state) => state === 'not_started')) {
    return 'not_started'
  }

  return 'ready'
}

const IDENTITY_BLOCKED_STATUSES = new Set<KycOperationalStatus>(['blocked', 'expired', 'rejected'])
const IDENTITY_ATTENTION_STATUSES = new Set<KycOperationalStatus>([
  'in_progress',
  'not_started',
  'pending_review',
])
const SIGNATURE_BLOCKED_STATUSES = new Set<SignatureOperationalStatus>([
  'declined',
  'expired',
  'failed',
])
const SIGNATURE_ATTENTION_STATUSES = new Set<SignatureOperationalStatus>([
  'not_sent',
  'part_signed',
  'prepared',
  'sent',
  'viewed',
])
const WIRE_BLOCKED_STATUSES = new Set<WireOperationalStatus>(['failed', 'returned'])
const WIRE_ATTENTION_STATUSES = new Set<WireOperationalStatus>([
  'instructions_sent',
  'not_requested',
  'partially_matched',
  'pending',
  'received',
  'under_review',
  'unmatched',
])
const DOCUMENT_BLOCKED_STATUSES = new Set<DocumentRequirementStatus>([
  'expired',
  'missing',
  'rejected',
])
const DOCUMENT_ATTENTION_STATUSES = new Set<DocumentRequirementStatus>(['under_review', 'uploaded'])

const getInvestorIdentitySourceState = (
  investors: readonly NorthstarInvestorOperationFixture[],
): ReadinessDimensionStateDTO => {
  if (investors.length === 0) {
    return 'not_started'
  }

  return combineReadinessStates(investors.map(getSingleInvestorIdentitySourceState))
}

const getSingleInvestorIdentitySourceState = (
  investor: NorthstarInvestorOperationFixture,
): ReadinessDimensionStateDTO => {
  const statuses: KycOperationalStatus[] = [investor.kycStatus]

  if (investor.kybStatus !== undefined) {
    statuses.push(investor.kybStatus)
  } else if (investor.legalEntityName !== undefined) {
    return 'attention'
  }

  return sourceStateFromStatuses(statuses, IDENTITY_BLOCKED_STATUSES, IDENTITY_ATTENTION_STATUSES)
}

const getSignatureSourceState = (
  investors: readonly NorthstarInvestorOperationFixture[],
): ReadinessDimensionStateDTO =>
  sourceStateFromStatuses(
    investors.map((investor) => investor.signatureStatus),
    SIGNATURE_BLOCKED_STATUSES,
    SIGNATURE_ATTENTION_STATUSES,
  )

const getWireSourceState = (
  investors: readonly NorthstarInvestorOperationFixture[],
): ReadinessDimensionStateDTO =>
  sourceStateFromStatuses(
    investors.map((investor) => investor.wireStatus),
    WIRE_BLOCKED_STATUSES,
    WIRE_ATTENTION_STATUSES,
  )

const getDocumentSourceState = (
  documents: readonly NorthstarDocumentRequirementFixture[],
): ReadinessDimensionStateDTO =>
  sourceStateFromStatuses(
    documents.filter((document) => document.required).map((document) => document.status),
    DOCUMENT_BLOCKED_STATUSES,
    DOCUMENT_ATTENTION_STATUSES,
  )

const getCapitalSourceState = (
  capital: CapitalReconciliationSummary,
): ReadinessDimensionStateDTO =>
  capital.hasUnmatchedFunds || capital.isOverTarget ? 'attention' : 'ready'

const getVehicleSourceState = (
  setupStatus: NorthstarOperationalFixture['deal']['vehicle']['setupStatus'],
): ReadinessDimensionStateDTO => {
  if (setupStatus === 'blocked') {
    return 'blocked'
  }

  if (setupStatus === 'in_progress' || setupStatus === 'not_started') {
    return 'attention'
  }

  return 'ready'
}

const sourceStateFromStatuses = <Status extends string>(
  statuses: readonly Status[],
  blockedStatuses: ReadonlySet<Status>,
  attentionStatuses: ReadonlySet<Status>,
): ReadinessDimensionStateDTO => {
  if (statuses.length === 0) {
    return 'not_started'
  }

  if (statuses.some((status) => blockedStatuses.has(status))) {
    return 'blocked'
  }

  if (statuses.some((status) => attentionStatuses.has(status))) {
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
    readinessState: combineReadinessStates([
      getSingleInvestorIdentitySourceState(investor),
      sourceStateFromStatuses(
        [investor.signatureStatus],
        SIGNATURE_BLOCKED_STATUSES,
        SIGNATURE_ATTENTION_STATUSES,
      ),
      sourceStateFromStatuses(
        [investor.wireStatus],
        WIRE_BLOCKED_STATUSES,
        WIRE_ATTENTION_STATUSES,
      ),
      readinessStateFromBlockers(investorBlockers),
    ]),
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
