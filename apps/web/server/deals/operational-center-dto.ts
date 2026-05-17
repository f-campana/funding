import type {
  CapitalStage,
  ClosingBlockerOwner,
  ClosingBlockerSeverity,
  ClosingBlockerType,
  ClosingReadinessState,
  CommitmentLifecycleState,
  DealLifecycleState,
  DocumentRequirementCategory,
  DocumentRequirementOwner,
  DocumentRequirementStatus,
  KybOperationalStatus,
  KycOperationalStatus,
  SignatureOperationalStatus,
  StatusTone,
  WireOperationalStatus,
} from '@repo/domain'
import { z } from 'zod'

export const GetOperationalCenterInputSchema = z.object({
  dealId: z.string().trim().min(1),
})

export type GetOperationalCenterInputDTO = z.infer<typeof GetOperationalCenterInputSchema>

export type CurrencyCodeDTO = 'EUR'

export type MoneyMinorUnitsDTO = {
  readonly amountMinor: number
  readonly currency: CurrencyCodeDTO
}

export type StatusToneDTO = StatusTone

export type DealVehicleTypeDTO = 'luxembourg_scsp' | 'french_sc' | 'french_sas'
export type DealVehicleSetupStatusDTO = 'not_started' | 'in_progress' | 'ready' | 'blocked'
export type DealClosingModeDTO = 'standard' | 'ongoing'
export type DealSharingModeDTO = 'disabled' | 'request_access' | 'anyone_with_link'
export type ClosingBlockerRouteHintDTO = 'about' | 'commitments' | 'documents'
export type ReadinessDimensionStateDTO = 'ready' | 'attention' | 'blocked' | 'not_started'

export type DealOperationalCenterDTO = {
  readonly _tag: 'DealOperationalCenter'
  readonly generatedAt: string
  readonly deal: DealSummaryDTO
  readonly readiness: ClosingReadinessDTO
  readonly capital: CapitalReconciliationDTO
  readonly blockers: readonly ClosingBlockerDTO[]
  readonly investors: readonly InvestorOperationDTO[]
  readonly documents: DocumentCenterDTO
  readonly activity: readonly ActivityEventDTO[]
}

export type DealSummaryDTO = {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly companyName: string
  readonly stage: DealLifecycleState
  readonly stageLabel: string
  readonly closingMode: DealClosingModeDTO
  readonly currency: CurrencyCodeDTO
  readonly vehicle: DealVehicleDTO
  readonly access: DealAccessDTO
  readonly targetCloseDate: string
  readonly lastUpdatedAt: string
}

export type DealVehicleDTO = {
  readonly name: string
  readonly type: DealVehicleTypeDTO
  readonly jurisdiction: string
  readonly setupStatus: DealVehicleSetupStatusDTO
}

export type DealAccessDTO = {
  readonly sharingMode: DealSharingModeDTO
  readonly pendingAccessRequestCount: number
}

export type ClosingReadinessDTO = {
  readonly state: ClosingReadinessState
  readonly dimensions: readonly ReadinessDimensionDTO[]
}

export type ReadinessDimensionDTO = {
  readonly id:
    | 'investor_identity'
    | 'signatures'
    | 'wires'
    | 'documents'
    | 'capital_reconciliation'
    | 'vehicle_setup'
  readonly label: string
  readonly state: ReadinessDimensionStateDTO
  readonly blockerCount: number
}

export type CapitalReconciliationDTO = {
  readonly targetAmount: MoneyMinorUnitsDTO
  readonly committedAmount: MoneyMinorUnitsDTO
  readonly signedAmount: MoneyMinorUnitsDTO
  readonly receivedAmount: MoneyMinorUnitsDTO
  readonly matchedAmount: MoneyMinorUnitsDTO
  readonly unsignedCommitted: MoneyMinorUnitsDTO
  readonly unreceivedSigned: MoneyMinorUnitsDTO
  readonly unfundedCommitted: MoneyMinorUnitsDTO
  readonly targetPosition: CapitalTargetPositionDTO
  readonly matching: CapitalMatchingDTO
  readonly economics: DealEconomicsDTO
}

export type CapitalTargetPositionDTO =
  | {
      readonly kind: 'under_target'
      readonly remainingToTarget: MoneyMinorUnitsDTO
    }
  | {
      readonly kind: 'at_target'
    }
  | {
      readonly kind: 'over_target'
      readonly overTarget: MoneyMinorUnitsDTO
    }

export type CapitalMatchingDTO =
  | {
      readonly kind: 'matched'
    }
  | {
      readonly kind: 'unmatched'
      readonly unmatchedReceived: MoneyMinorUnitsDTO
    }

export type DealEconomicsDTO = {
  readonly grossCommitted: MoneyMinorUnitsDTO
  readonly entryFees: MoneyMinorUnitsDTO
  readonly spvFee: MoneyMinorUnitsDTO
  readonly netInvestableAmount: MoneyMinorUnitsDTO
  readonly carryPercent: number
}

export type ClosingBlockerDTO = {
  readonly id: string
  readonly severity: ClosingBlockerSeverity
  readonly type: ClosingBlockerType
  readonly title: string
  readonly description: string
  readonly owner: ClosingBlockerOwner
  readonly resolved: boolean
  readonly tone: StatusToneDTO
  readonly routeHint: ClosingBlockerRouteHintDTO
  readonly relatedInvestorIds: readonly string[]
  readonly relatedDocumentIds: readonly string[]
}

export type InvestorOperationDTO = {
  readonly id: string
  readonly investorName: string
  readonly investorEmail?: string
  readonly commitmentAmount: MoneyMinorUnitsDTO
  readonly commitmentStatus: CommitmentLifecycleState
  readonly commitmentStatusLabel: string
  readonly kycStatus: KycOperationalStatus
  readonly kycStatusLabel: string
  readonly entity: InvestorEntityDTO
  readonly signatureStatus: SignatureOperationalStatus
  readonly signatureStatusLabel: string
  readonly wireStatus: WireOperationalStatus
  readonly wireStatusLabel: string
  readonly readinessState: ReadinessDimensionStateDTO
  readonly blockerIds: readonly string[]
  readonly documentIds: readonly string[]
  readonly lastActivityAt?: string
}

export type InvestorEntityDTO =
  | {
      readonly kind: 'individual'
    }
  | {
      readonly kind: 'legal_entity'
      readonly legalEntity: {
        readonly name: string
        readonly kyb:
          | {
              readonly kind: 'available'
              readonly status: KybOperationalStatus
              readonly statusLabel: string
            }
          | {
              readonly kind: 'missing'
              readonly statusLabel: string
            }
      }
    }

export type DocumentCenterDTO = {
  readonly requirements: readonly DocumentRequirementDTO[]
  readonly groups: readonly DocumentGroupDTO[]
}

export type DocumentRequirementDTO = {
  readonly id: string
  readonly category: DocumentRequirementCategory
  readonly label: string
  readonly required: boolean
  readonly status: DocumentRequirementStatus
  readonly owner: DocumentRequirementOwner
  readonly tone: StatusToneDTO
  readonly blocksClosing: boolean
  readonly relatedInvestorId?: string
  readonly groupId: string
  readonly dueDate?: string
  readonly lastActivityAt?: string
}

export type DocumentGroupDTO = {
  readonly id: string
  readonly label: string
  readonly visibility: 'internal' | 'investor_visible' | 'protected'
  readonly documentIds: readonly string[]
}

type ActivityEventBaseDTO = {
  readonly id: string
  readonly occurredAt: string
  readonly actorLabel: string
  readonly summary: string
}

export type ActivityEventDTO =
  | (ActivityEventBaseDTO & {
      readonly eventType: 'commitment_updated'
      readonly relatedInvestorId: string
    })
  | (ActivityEventBaseDTO & {
      readonly eventType: 'document_uploaded' | 'document_rejected'
      readonly relatedDocumentId: string
      readonly relatedInvestorId?: string
    })
  | (ActivityEventBaseDTO & {
      readonly eventType: 'signature_sent' | 'signature_completed'
      readonly relatedInvestorId: string
    })
  | (ActivityEventBaseDTO & {
      readonly eventType: 'wire_flagged'
      readonly relatedInvestorId: string
      readonly relatedBlockerId: string
    })
  | (ActivityEventBaseDTO & {
      readonly eventType: 'wire_matched'
      readonly relatedInvestorId: string
    })
  | (ActivityEventBaseDTO & {
      readonly eventType: 'blocker_created' | 'blocker_resolved'
      readonly relatedBlockerId: string
      readonly relatedInvestorId?: string
      readonly relatedDocumentId?: string
    })

export type ActivityEventTypeDTO = ActivityEventDTO['eventType']

export type CapitalReconciliationErrorDTO =
  | {
      readonly _tag: 'NegativeAmount'
      readonly field: string
      readonly amount: MoneyMinorUnitsDTO
    }
  | {
      readonly _tag: 'StageOrderViolation'
      readonly earlierStage: CapitalStage
      readonly laterStage: CapitalStage
      readonly earlierAmount: MoneyMinorUnitsDTO
      readonly laterAmount: MoneyMinorUnitsDTO
    }

export type MoneySerializationErrorDTO = {
  readonly _tag: 'UnsafeMoneyAmount'
  readonly field: string
  readonly amountMinor: string
}

export type GetDealOperationalCenterOutputDTO =
  | {
      readonly _tag: 'Ok'
      readonly data: DealOperationalCenterDTO
    }
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
