import {
  type CapitalStage,
  CapitalStageSchema,
  type ClosingBlockerOwner,
  ClosingBlockerOwnerSchema,
  type ClosingBlockerSeverity,
  ClosingBlockerSeveritySchema,
  type ClosingBlockerType,
  ClosingBlockerTypeSchema,
  type ClosingReadinessState,
  ClosingReadinessStateSchema,
  type CommitmentLifecycleState,
  CommitmentLifecycleStateSchema,
  type DealLifecycleState,
  DealLifecycleStateSchema,
  type DocumentRequirementCategory,
  DocumentRequirementCategorySchema,
  type DocumentRequirementOwner,
  DocumentRequirementOwnerSchema,
  type DocumentRequirementStatus,
  DocumentRequirementStatusSchema,
  type KybOperationalStatus,
  KybOperationalStatusSchema,
  type KycOperationalStatus,
  KycOperationalStatusSchema,
  type SignatureOperationalStatus,
  SignatureOperationalStatusSchema,
  STATUS_TONES,
  type StatusTone,
  type WireOperationalStatus,
  WireOperationalStatusSchema,
} from '@repo/domain'
import { z } from 'zod'

export const DealSlugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export const GetOperationalCenterInputSchema = z
  .object({
    dealId: DealSlugSchema,
  })
  .strict()

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

export type DocumentRequirementLevelDTO =
  | {
      readonly kind: 'required'
    }
  | {
      readonly kind: 'optional'
    }

export type DocumentClosingImpactDTO =
  | {
      readonly kind: 'blocks_closing'
    }
  | {
      readonly kind: 'cleared_for_closing'
    }
  | {
      readonly kind: 'does_not_block_closing'
    }

export type DocumentRequirementDTO = {
  readonly id: string
  readonly category: DocumentRequirementCategory
  readonly label: string
  readonly requirement: DocumentRequirementLevelDTO
  readonly status: DocumentRequirementStatus
  readonly owner: DocumentRequirementOwner
  readonly closingImpact: DocumentClosingImpactDTO
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

export type DealOperationalCenterValidationErrorDTO =
  | {
      readonly _tag: 'InvalidMoney'
      readonly path: string
    }
  | {
      readonly _tag: 'InvalidDateTime'
      readonly path: string
    }
  | {
      readonly _tag: 'CapitalInvariantViolation'
      readonly message: string
    }
  | {
      readonly _tag: 'DocumentInvariantViolation'
      readonly documentId: string
      readonly message: string
    }
  | {
      readonly _tag: 'DanglingReference'
      readonly path: string
      readonly target: string
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
  | {
      readonly _tag: 'ValidationError'
      readonly error: DealOperationalCenterValidationErrorDTO
    }

const NonEmptyStringSchema = z.string().min(1)
const StatusToneSchema = z.enum(STATUS_TONES)

export const CurrencyCodeSchema = z.literal('EUR')

export const MoneyMinorUnitsSchema = z
  .object({
    amountMinor: z.number().int().safe().nonnegative(),
    currency: CurrencyCodeSchema,
  })
  .strict()

export const IsoDateTimeStringSchema = z.string().datetime()

const DealVehicleTypeSchema = z.enum(['luxembourg_scsp', 'french_sc', 'french_sas'])
const DealVehicleSetupStatusSchema = z.enum(['not_started', 'in_progress', 'ready', 'blocked'])
const DealClosingModeSchema = z.enum(['standard', 'ongoing'])
const DealSharingModeSchema = z.enum(['disabled', 'request_access', 'anyone_with_link'])
const ClosingBlockerRouteHintSchema = z.enum(['about', 'commitments', 'documents'])
const ReadinessDimensionStateSchema = z.enum(['ready', 'attention', 'blocked', 'not_started'])

const ReadinessDimensionSchema = z
  .object({
    blockerCount: z.number().int().nonnegative(),
    id: z.enum([
      'investor_identity',
      'signatures',
      'wires',
      'documents',
      'capital_reconciliation',
      'vehicle_setup',
    ]),
    label: NonEmptyStringSchema,
    state: ReadinessDimensionStateSchema,
  })
  .strict()

const ClosingReadinessSchema = z
  .object({
    dimensions: z.array(ReadinessDimensionSchema),
    state: ClosingReadinessStateSchema,
  })
  .strict()

const CapitalTargetPositionSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('under_target'),
      remainingToTarget: MoneyMinorUnitsSchema,
    })
    .strict(),
  z
    .object({
      kind: z.literal('at_target'),
    })
    .strict(),
  z
    .object({
      kind: z.literal('over_target'),
      overTarget: MoneyMinorUnitsSchema,
    })
    .strict(),
])

const CapitalMatchingSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('matched'),
    })
    .strict(),
  z
    .object({
      kind: z.literal('unmatched'),
      unmatchedReceived: MoneyMinorUnitsSchema,
    })
    .strict(),
])

const DealEconomicsSchema = z
  .object({
    carryPercent: z.number().finite().nonnegative(),
    entryFees: MoneyMinorUnitsSchema,
    grossCommitted: MoneyMinorUnitsSchema,
    netInvestableAmount: MoneyMinorUnitsSchema,
    spvFee: MoneyMinorUnitsSchema,
  })
  .strict()

const CapitalReconciliationSchema = z
  .object({
    committedAmount: MoneyMinorUnitsSchema,
    economics: DealEconomicsSchema,
    matchedAmount: MoneyMinorUnitsSchema,
    matching: CapitalMatchingSchema,
    receivedAmount: MoneyMinorUnitsSchema,
    signedAmount: MoneyMinorUnitsSchema,
    targetAmount: MoneyMinorUnitsSchema,
    targetPosition: CapitalTargetPositionSchema,
    unfundedCommitted: MoneyMinorUnitsSchema,
    unreceivedSigned: MoneyMinorUnitsSchema,
    unsignedCommitted: MoneyMinorUnitsSchema,
  })
  .strict()

const ClosingBlockerSchema = z
  .object({
    description: NonEmptyStringSchema,
    id: NonEmptyStringSchema,
    owner: ClosingBlockerOwnerSchema,
    relatedDocumentIds: z.array(NonEmptyStringSchema),
    relatedInvestorIds: z.array(NonEmptyStringSchema),
    resolved: z.boolean(),
    routeHint: ClosingBlockerRouteHintSchema,
    severity: ClosingBlockerSeveritySchema,
    title: NonEmptyStringSchema,
    tone: StatusToneSchema,
    type: ClosingBlockerTypeSchema,
  })
  .strict()

const InvestorEntitySchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('individual'),
    })
    .strict(),
  z
    .object({
      kind: z.literal('legal_entity'),
      legalEntity: z
        .object({
          kyb: z.discriminatedUnion('kind', [
            z
              .object({
                kind: z.literal('available'),
                status: KybOperationalStatusSchema,
                statusLabel: NonEmptyStringSchema,
              })
              .strict(),
            z
              .object({
                kind: z.literal('missing'),
                statusLabel: NonEmptyStringSchema,
              })
              .strict(),
          ]),
          name: NonEmptyStringSchema,
        })
        .strict(),
    })
    .strict(),
])

const InvestorOperationSchema = z
  .object({
    blockerIds: z.array(NonEmptyStringSchema),
    commitmentAmount: MoneyMinorUnitsSchema,
    commitmentStatus: CommitmentLifecycleStateSchema,
    commitmentStatusLabel: NonEmptyStringSchema,
    documentIds: z.array(NonEmptyStringSchema),
    entity: InvestorEntitySchema,
    id: NonEmptyStringSchema,
    investorEmail: NonEmptyStringSchema.optional(),
    investorName: NonEmptyStringSchema,
    kycStatus: KycOperationalStatusSchema,
    kycStatusLabel: NonEmptyStringSchema,
    lastActivityAt: IsoDateTimeStringSchema.optional(),
    readinessState: ReadinessDimensionStateSchema,
    signatureStatus: SignatureOperationalStatusSchema,
    signatureStatusLabel: NonEmptyStringSchema,
    wireStatus: WireOperationalStatusSchema,
    wireStatusLabel: NonEmptyStringSchema,
  })
  .strict()

const DocumentRequirementLevelSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('required'),
    })
    .strict(),
  z
    .object({
      kind: z.literal('optional'),
    })
    .strict(),
])

const DocumentClosingImpactSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('blocks_closing'),
    })
    .strict(),
  z
    .object({
      kind: z.literal('cleared_for_closing'),
    })
    .strict(),
  z
    .object({
      kind: z.literal('does_not_block_closing'),
    })
    .strict(),
])

const DocumentRequirementSchema = z
  .object({
    category: DocumentRequirementCategorySchema,
    closingImpact: DocumentClosingImpactSchema,
    dueDate: IsoDateTimeStringSchema.optional(),
    groupId: NonEmptyStringSchema,
    id: NonEmptyStringSchema,
    label: NonEmptyStringSchema,
    lastActivityAt: IsoDateTimeStringSchema.optional(),
    owner: DocumentRequirementOwnerSchema,
    relatedInvestorId: NonEmptyStringSchema.optional(),
    requirement: DocumentRequirementLevelSchema,
    status: DocumentRequirementStatusSchema,
  })
  .strict()

const DocumentGroupSchema = z
  .object({
    documentIds: z.array(NonEmptyStringSchema),
    id: NonEmptyStringSchema,
    label: NonEmptyStringSchema,
    visibility: z.enum(['internal', 'investor_visible', 'protected']),
  })
  .strict()

const DocumentCenterSchema = z
  .object({
    groups: z.array(DocumentGroupSchema),
    requirements: z.array(DocumentRequirementSchema),
  })
  .strict()

const ActivityEventBaseFields = {
  actorLabel: NonEmptyStringSchema,
  id: NonEmptyStringSchema,
  occurredAt: IsoDateTimeStringSchema,
  summary: NonEmptyStringSchema,
} as const

const ActivityEventSchema = z.discriminatedUnion('eventType', [
  z
    .object({
      ...ActivityEventBaseFields,
      eventType: z.literal('commitment_updated'),
      relatedInvestorId: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      ...ActivityEventBaseFields,
      eventType: z.literal('document_uploaded'),
      relatedDocumentId: NonEmptyStringSchema,
      relatedInvestorId: NonEmptyStringSchema.optional(),
    })
    .strict(),
  z
    .object({
      ...ActivityEventBaseFields,
      eventType: z.literal('document_rejected'),
      relatedDocumentId: NonEmptyStringSchema,
      relatedInvestorId: NonEmptyStringSchema.optional(),
    })
    .strict(),
  z
    .object({
      ...ActivityEventBaseFields,
      eventType: z.literal('signature_sent'),
      relatedInvestorId: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      ...ActivityEventBaseFields,
      eventType: z.literal('signature_completed'),
      relatedInvestorId: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      ...ActivityEventBaseFields,
      eventType: z.literal('wire_flagged'),
      relatedBlockerId: NonEmptyStringSchema,
      relatedInvestorId: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      ...ActivityEventBaseFields,
      eventType: z.literal('wire_matched'),
      relatedInvestorId: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      ...ActivityEventBaseFields,
      eventType: z.literal('blocker_created'),
      relatedBlockerId: NonEmptyStringSchema,
      relatedDocumentId: NonEmptyStringSchema.optional(),
      relatedInvestorId: NonEmptyStringSchema.optional(),
    })
    .strict(),
  z
    .object({
      ...ActivityEventBaseFields,
      eventType: z.literal('blocker_resolved'),
      relatedBlockerId: NonEmptyStringSchema,
      relatedDocumentId: NonEmptyStringSchema.optional(),
      relatedInvestorId: NonEmptyStringSchema.optional(),
    })
    .strict(),
])

const DealVehicleSchema = z
  .object({
    jurisdiction: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    setupStatus: DealVehicleSetupStatusSchema,
    type: DealVehicleTypeSchema,
  })
  .strict()

const DealAccessSchema = z
  .object({
    pendingAccessRequestCount: z.number().int().nonnegative(),
    sharingMode: DealSharingModeSchema,
  })
  .strict()

const DealSummarySchema = z
  .object({
    access: DealAccessSchema,
    closingMode: DealClosingModeSchema,
    companyName: NonEmptyStringSchema,
    currency: CurrencyCodeSchema,
    id: NonEmptyStringSchema,
    lastUpdatedAt: IsoDateTimeStringSchema,
    name: NonEmptyStringSchema,
    slug: DealSlugSchema,
    stage: DealLifecycleStateSchema,
    stageLabel: NonEmptyStringSchema,
    targetCloseDate: IsoDateTimeStringSchema,
    vehicle: DealVehicleSchema,
  })
  .strict()

export const DealOperationalCenterSchema = z
  .object({
    _tag: z.literal('DealOperationalCenter'),
    activity: z.array(ActivityEventSchema),
    blockers: z.array(ClosingBlockerSchema),
    capital: CapitalReconciliationSchema,
    deal: DealSummarySchema,
    documents: DocumentCenterSchema,
    generatedAt: IsoDateTimeStringSchema,
    investors: z.array(InvestorOperationSchema),
    readiness: ClosingReadinessSchema,
  })
  .strict()

const CapitalReconciliationErrorSchema = z.discriminatedUnion('_tag', [
  z
    .object({
      _tag: z.literal('NegativeAmount'),
      amount: MoneyMinorUnitsSchema,
      field: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      _tag: z.literal('StageOrderViolation'),
      earlierAmount: MoneyMinorUnitsSchema,
      earlierStage: CapitalStageSchema,
      laterAmount: MoneyMinorUnitsSchema,
      laterStage: CapitalStageSchema,
    })
    .strict(),
])

const MoneySerializationErrorSchema = z
  .object({
    _tag: z.literal('UnsafeMoneyAmount'),
    amountMinor: NonEmptyStringSchema,
    field: NonEmptyStringSchema,
  })
  .strict()

const DealOperationalCenterValidationErrorSchema = z.discriminatedUnion('_tag', [
  z
    .object({
      _tag: z.literal('InvalidMoney'),
      path: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      _tag: z.literal('InvalidDateTime'),
      path: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      _tag: z.literal('CapitalInvariantViolation'),
      message: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      _tag: z.literal('DocumentInvariantViolation'),
      documentId: NonEmptyStringSchema,
      message: NonEmptyStringSchema,
    })
    .strict(),
  z
    .object({
      _tag: z.literal('DanglingReference'),
      path: NonEmptyStringSchema,
      target: NonEmptyStringSchema,
    })
    .strict(),
])

const GetDealOperationalCenterOutputSchemaBase = z.discriminatedUnion('_tag', [
  z
    .object({
      _tag: z.literal('Ok'),
      data: DealOperationalCenterSchema,
    })
    .strict(),
  z
    .object({
      _tag: z.literal('UnsupportedDeal'),
      dealId: DealSlugSchema,
    })
    .strict(),
  z
    .object({
      _tag: z.literal('ReconciliationError'),
      error: CapitalReconciliationErrorSchema,
    })
    .strict(),
  z
    .object({
      _tag: z.literal('MoneySerializationError'),
      error: MoneySerializationErrorSchema,
    })
    .strict(),
  z
    .object({
      _tag: z.literal('ValidationError'),
      error: DealOperationalCenterValidationErrorSchema,
    })
    .strict(),
])

export const GetDealOperationalCenterOutputSchema =
  GetDealOperationalCenterOutputSchemaBase as z.ZodType<GetDealOperationalCenterOutputDTO>
