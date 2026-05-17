import { Result } from '@repo/core'
import {
  type Brand,
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
  DocumentRequirementDTO,
  GetOperationalCenterInputDTO,
  InvestorOperationDTO,
  MoneyMinorUnitsDTO,
  MoneySerializationErrorDTO,
  ReadinessDimensionDTO,
  ReadinessDimensionStateDTO,
} from './operational-center-dto'

type DealSlug = Brand<string, 'DealSlug'>

const dealSlugFromInput = (value: string): DealSlug => value.trim() as DealSlug

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
  const dealId = dealSlugFromInput(input.dealId)

  if (dealId !== NORTHSTAR_DEAL_SLUG) {
    return Result.Error({ _tag: 'UnsupportedDeal', dealId })
  }

  const capitalResult = summarizeCapitalReconciliation(northstarOperationalFixture.capital)

  if (capitalResult.isError()) {
    const errorResult = mapCapitalReconciliationError(capitalResult.error)

    if (errorResult.isError()) {
      return Result.Error({ _tag: 'MoneySerializationError', error: errorResult.error })
    }

    return Result.Error({ _tag: 'ReconciliationError', error: errorResult.value })
  }

  const readinessSummary = summarizeClosingReadiness({
    blockers: northstarOperationalFixture.blockers,
    hasOperationalInputs: true,
  })
  const documents = mapDocuments(northstarOperationalFixture.documents)
  const blockers = northstarOperationalFixture.blockers.map(mapBlocker)
  const readiness = deriveClosingReadiness({
    blockers: northstarOperationalFixture.blockers,
    capital: capitalResult.value,
    documents: northstarOperationalFixture.documents,
    investors: northstarOperationalFixture.investors,
    summary: readinessSummary,
    vehicle: northstarOperationalFixture.deal.vehicle,
  })
  const documentsCenter: DocumentCenterDTO = {
    groups: northstarOperationalFixture.documentGroups,
    requirements: documents,
  }
  const capitalDtoResult = mapCapital(capitalResult.value)

  if (capitalDtoResult.isError()) {
    return Result.Error({ _tag: 'MoneySerializationError', error: capitalDtoResult.error })
  }

  const investorsResult = Result.traverse(northstarOperationalFixture.investors, (investor) =>
    mapInvestor(investor, northstarOperationalFixture.blockers),
  ).mapError(firstError)

  if (investorsResult.isError()) {
    return Result.Error({ _tag: 'MoneySerializationError', error: investorsResult.error })
  }

  return Result.Ok({
    _tag: 'DealOperationalCenter',
    activity: northstarOperationalFixture.activity,
    blockers,
    capital: capitalDtoResult.value,
    deal: {
      ...northstarOperationalFixture.deal,
      stageLabel: getDealLifecycleLabel(northstarOperationalFixture.deal.stage),
    },
    documents: documentsCenter,
    generatedAt: northstarOperationalFixture.generatedAt,
    investors: investorsResult.value,
    readiness,
  })
}

type MoneySerializationResult<T> = Result<T, MoneySerializationErrorDTO>

const money = (value: EuroCents, field: string): MoneySerializationResult<MoneyMinorUnitsDTO> =>
  serializeEuroCentsToNumber(value).match({
    Error: () =>
      Result.Error({
        _tag: 'UnsafeMoneyAmount',
        amountMinor: euroCentsToMinorUnits(value).toString(),
        field,
      }),
    Ok: (amountMinor) => Result.Ok({ amountMinor, currency: 'EUR' }),
  })

const firstError = <ErrorValue>(errors: readonly ErrorValue[]): ErrorValue => {
  const [first] = errors

  if (first === undefined) {
    throw new Error('Expected at least one Result error')
  }

  return first
}

const mapCapital = (
  summary: CapitalReconciliationSummary,
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
      value: northstarOperationalFixture.capital.entryFeesCents,
    },
    { field: 'capital.grossCommitted', key: 'grossCommitted', value: summary.committedAmountCents },
    { field: 'capital.matchedAmount', key: 'matchedAmount', value: summary.matchedAmountCents },
    {
      field: 'capital.netInvestableAmount',
      key: 'netInvestableAmount',
      value: northstarOperationalFixture.capital.netInvestableAmountCents,
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
      value: northstarOperationalFixture.capital.spvFeeCents,
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
      carryPercent: northstarOperationalFixture.capital.carryPercent,
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

const mapCapitalReconciliationError = (
  error: CapitalReconciliationError,
): MoneySerializationResult<CapitalReconciliationErrorDTO> => {
  if (error._tag === 'NegativeAmount') {
    return money(error.amountCents, `capital.${error.field}`).map((amount) => ({
      _tag: 'NegativeAmount',
      amount,
      field: error.field,
    }))
  }

  return Result.all([
    money(error.earlierAmountCents, `capital.${error.earlierStage}`),
    money(error.laterAmountCents, `capital.${error.laterStage}`),
  ])
    .mapError(firstError)
    .map(([earlierAmount, laterAmount]) => ({
      _tag: 'StageOrderViolation',
      earlierAmount,
      earlierStage: error.earlierStage,
      laterAmount,
      laterStage: error.laterStage,
    }))
}

type MoneyField<Key extends string> = {
  readonly key: Key
  readonly field: string
  readonly value: EuroCents
}

type MoneyFieldValues<Fields extends readonly MoneyField<string>[]> = {
  readonly [Field in Fields[number] as Field['key']]: MoneyMinorUnitsDTO
}

const mapMoneyFields = <const Fields extends readonly MoneyField<string>[]>(
  fields: Fields,
): MoneySerializationResult<MoneyFieldValues<Fields>> =>
  Result.traverse(fields, ({ field, key, value }) =>
    money(value, field).map((amount) => [key, amount] as const),
  )
    .mapError(firstError)
    .map((entries) => Object.fromEntries(entries) as MoneyFieldValues<Fields>)

export const deriveClosingReadiness = ({
  blockers,
  capital,
  documents,
  investors,
  summary,
  vehicle,
}: {
  readonly summary: { readonly state: ClosingReadinessDTO['state'] }
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
    dimensions,
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
): ReadinessDimensionStateDTO =>
  combineReadinessStates(blockers.map((blocker) => BLOCKER_SEVERITY_READINESS[blocker.severity]))

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

const IDENTITY_STATUS_READINESS = {
  approved: 'ready',
  blocked: 'blocked',
  expired: 'blocked',
  in_progress: 'attention',
  not_started: 'attention',
  pending_review: 'attention',
  rejected: 'blocked',
} as const satisfies Record<KycOperationalStatus, ReadinessDimensionStateDTO>

const SIGNATURE_STATUS_READINESS = {
  completed: 'ready',
  declined: 'blocked',
  expired: 'blocked',
  failed: 'blocked',
  not_sent: 'attention',
  part_signed: 'attention',
  prepared: 'attention',
  sent: 'attention',
  viewed: 'attention',
} as const satisfies Record<SignatureOperationalStatus, ReadinessDimensionStateDTO>

const WIRE_STATUS_READINESS = {
  failed: 'blocked',
  instructions_sent: 'attention',
  matched: 'ready',
  not_requested: 'attention',
  partially_matched: 'attention',
  pending: 'attention',
  received: 'attention',
  reconciled: 'ready',
  returned: 'blocked',
  under_review: 'attention',
  unmatched: 'attention',
} as const satisfies Record<WireOperationalStatus, ReadinessDimensionStateDTO>

const DOCUMENT_STATUS_READINESS = {
  approved: 'ready',
  expired: 'blocked',
  missing: 'blocked',
  rejected: 'blocked',
  under_review: 'attention',
  uploaded: 'attention',
} as const satisfies Record<DocumentRequirementStatus, ReadinessDimensionStateDTO>

const BLOCKER_SEVERITY_READINESS = {
  critical: 'blocked',
  info: 'attention',
  warning: 'attention',
} as const satisfies Record<NorthstarClosingBlockerFixture['severity'], ReadinessDimensionStateDTO>

const VEHICLE_SETUP_STATUS_READINESS = {
  blocked: 'blocked',
  in_progress: 'attention',
  not_started: 'attention',
  ready: 'ready',
} as const satisfies Record<
  NorthstarOperationalFixture['deal']['vehicle']['setupStatus'],
  ReadinessDimensionStateDTO
>

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

  return sourceStateFromStatuses(statuses, IDENTITY_STATUS_READINESS)
}

const getSignatureSourceState = (
  investors: readonly NorthstarInvestorOperationFixture[],
): ReadinessDimensionStateDTO =>
  sourceStateFromStatuses(
    investors.map((investor) => investor.signatureStatus),
    SIGNATURE_STATUS_READINESS,
  )

const getWireSourceState = (
  investors: readonly NorthstarInvestorOperationFixture[],
): ReadinessDimensionStateDTO =>
  sourceStateFromStatuses(
    investors.map((investor) => investor.wireStatus),
    WIRE_STATUS_READINESS,
  )

const getDocumentSourceState = (
  documents: readonly NorthstarDocumentRequirementFixture[],
): ReadinessDimensionStateDTO =>
  sourceStateFromStatuses(
    documents.filter((document) => document.required).map((document) => document.status),
    DOCUMENT_STATUS_READINESS,
  )

const getCapitalSourceState = (
  capital: CapitalReconciliationSummary,
): ReadinessDimensionStateDTO =>
  capital.hasUnmatchedFunds || capital.isOverTarget ? 'attention' : 'ready'

const getVehicleSourceState = (
  setupStatus: NorthstarOperationalFixture['deal']['vehicle']['setupStatus'],
): ReadinessDimensionStateDTO => VEHICLE_SETUP_STATUS_READINESS[setupStatus]

const sourceStateFromStatuses = <Status extends string>(
  statuses: readonly Status[],
  readinessByStatus: Record<Status, ReadinessDimensionStateDTO>,
): ReadinessDimensionStateDTO => {
  if (statuses.length === 0) {
    return 'not_started'
  }

  return combineReadinessStates(statuses.map((status) => readinessByStatus[status]))
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
): MoneySerializationResult<InvestorOperationDTO> => {
  const unresolvedBlockersById = new Map(
    blockers.filter((blocker) => !blocker.resolved).map((blocker) => [blocker.id, blocker]),
  )
  const investorBlockers = investor.blockerIds
    .map((blockerId) => unresolvedBlockersById.get(blockerId))
    .filter((blocker): blocker is NorthstarClosingBlockerFixture => blocker !== undefined)

  return money(investor.commitmentAmountCents, `investors.${investor.id}.commitment`).map(
    (commitmentAmount) =>
      buildInvestorOperation({
        commitmentAmount,
        investor,
        investorBlockers,
      }),
  )
}

const buildInvestorOperation = ({
  commitmentAmount,
  investor,
  investorBlockers,
}: {
  readonly investor: NorthstarInvestorOperationFixture
  readonly investorBlockers: readonly NorthstarClosingBlockerFixture[]
  readonly commitmentAmount: MoneyMinorUnitsDTO
}): InvestorOperationDTO => {
  const entity =
    investor.legalEntityName === undefined
      ? ({ kind: 'individual' } as const)
      : {
          kind: 'legal_entity' as const,
          legalEntity: {
            kyb:
              investor.kybStatus === undefined
                ? {
                    kind: 'missing' as const,
                    statusLabel: 'KYB status missing',
                  }
                : {
                    kind: 'available' as const,
                    status: investor.kybStatus,
                    statusLabel: getKybOperationalStatusLabel(investor.kybStatus),
                  },
            name: investor.legalEntityName,
          },
        }

  return {
    blockerIds: investor.blockerIds,
    commitmentAmount,
    commitmentStatus: investor.commitmentStatus,
    commitmentStatusLabel: getCommitmentLifecycleLabel(investor.commitmentStatus),
    documentIds: investor.documentIds,
    entity,
    id: investor.id,
    investorName: investor.investorName,
    kycStatus: investor.kycStatus,
    kycStatusLabel: getKycOperationalStatusLabel(investor.kycStatus),
    readinessState: combineReadinessStates([
      getSingleInvestorIdentitySourceState(investor),
      sourceStateFromStatuses([investor.signatureStatus], SIGNATURE_STATUS_READINESS),
      sourceStateFromStatuses([investor.wireStatus], WIRE_STATUS_READINESS),
      readinessStateFromBlockers(investorBlockers),
    ]),
    signatureStatus: investor.signatureStatus,
    signatureStatusLabel: getSignatureOperationalStatusLabel(investor.signatureStatus),
    wireStatus: investor.wireStatus,
    wireStatusLabel: getWireOperationalStatusLabel(investor.wireStatus),
    ...(investor.investorEmail === undefined ? {} : { investorEmail: investor.investorEmail }),
    ...(investor.lastActivityAt === undefined ? {} : { lastActivityAt: investor.lastActivityAt }),
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
