import type {
  CapitalReconciliationSummary,
  ClosingBlockerType,
  DocumentRequirementStatus,
  KycOperationalStatus,
  SignatureOperationalStatus,
  WireOperationalStatus,
} from '@repo/domain'

import type {
  NorthstarClosingBlockerFixture,
  NorthstarDocumentRequirementFixture,
  NorthstarInvestorOperationFixture,
  NorthstarOperationalFixture,
} from './fixtures/northstar-energy.fixture'
import type {
  ClosingReadinessDTO,
  ReadinessDimensionDTO,
  ReadinessDimensionStateDTO,
} from './operational-center-dto'

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

export const deriveInvestorReadinessState = (
  investor: NorthstarInvestorOperationFixture,
  investorBlockers: readonly NorthstarClosingBlockerFixture[],
): ReadinessDimensionStateDTO =>
  combineReadinessStates([
    getSingleInvestorIdentitySourceState(investor),
    sourceStateFromStatuses([investor.signatureStatus], SIGNATURE_STATUS_READINESS),
    sourceStateFromStatuses([investor.wireStatus], WIRE_STATUS_READINESS),
    readinessStateFromBlockers(investorBlockers),
  ])

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
  matched: 'attention',
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
