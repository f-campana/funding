import { z } from 'zod'

import type { StatusTone } from '../status-tone'

export const DOCUMENT_REQUIREMENT_CATEGORIES = [
  'pitch_deck',
  'management_presentation',
  'subscription_docs',
  'shareholders_agreement',
  'wire_instructions',
  'identity',
  'proof_of_address',
  'source_of_funds',
  'corporate_docs',
  'ubo_declaration',
  'other',
] as const
export type DocumentRequirementCategory = (typeof DOCUMENT_REQUIREMENT_CATEGORIES)[number]

export const DOCUMENT_REQUIREMENT_STATUSES = [
  'missing',
  'uploaded',
  'under_review',
  'approved',
  'rejected',
  'expired',
] as const
export type DocumentRequirementStatus = (typeof DOCUMENT_REQUIREMENT_STATUSES)[number]

export const DOCUMENT_REQUIREMENT_OWNERS = [
  'deal',
  'investor',
  'legal_entity',
  'spv',
  'fund',
] as const
export type DocumentRequirementOwner = (typeof DOCUMENT_REQUIREMENT_OWNERS)[number]

export type DocumentRequirement = {
  readonly id: string
  readonly category: DocumentRequirementCategory
  readonly label: string
  readonly required: boolean
  readonly status: DocumentRequirementStatus
  readonly owner: DocumentRequirementOwner
}

export type DocumentCompletenessSummary = {
  readonly totalCount: number
  readonly requiredCount: number
  readonly optionalCount: number
  readonly approvedCount: number
  readonly uploadedCount: number
  readonly underReviewCount: number
  readonly missingCount: number
  readonly rejectedCount: number
  readonly expiredCount: number
  readonly requiredMissingCount: number
  readonly requiredRejectedCount: number
  readonly requiredExpiredCount: number
  readonly isComplete: boolean
}

export const DocumentRequirementCategorySchema = z.enum(DOCUMENT_REQUIREMENT_CATEGORIES)
export const DocumentRequirementStatusSchema = z.enum(DOCUMENT_REQUIREMENT_STATUSES)
export const DocumentRequirementOwnerSchema = z.enum(DOCUMENT_REQUIREMENT_OWNERS)

export const DocumentRequirementSchema = z.object({
  category: DocumentRequirementCategorySchema,
  id: z.string().trim().min(1, { error: 'documentRequirement.id.required' }),
  label: z.string().trim().min(1, { error: 'documentRequirement.label.required' }),
  owner: DocumentRequirementOwnerSchema,
  required: z.boolean(),
  status: DocumentRequirementStatusSchema,
})

const DOCUMENT_REQUIREMENT_STATUS_TONES = {
  approved: 'success',
  expired: 'danger',
  missing: 'attention',
  rejected: 'danger',
  under_review: 'pending',
  uploaded: 'info',
} as const satisfies Record<DocumentRequirementStatus, StatusTone>

export const getDocumentRequirementStatusTone = (status: DocumentRequirementStatus): StatusTone =>
  DOCUMENT_REQUIREMENT_STATUS_TONES[status]

export const summarizeDocumentCompleteness = (
  requirements: readonly DocumentRequirement[],
): DocumentCompletenessSummary => {
  const requiredRequirements = requirements.filter((requirement) => requirement.required)

  const approvedCount = countByStatus(requirements, 'approved')
  const uploadedCount = countByStatus(requirements, 'uploaded')
  const underReviewCount = countByStatus(requirements, 'under_review')
  const missingCount = countByStatus(requirements, 'missing')
  const rejectedCount = countByStatus(requirements, 'rejected')
  const expiredCount = countByStatus(requirements, 'expired')
  const requiredMissingCount = countByStatus(requiredRequirements, 'missing')
  const requiredRejectedCount = countByStatus(requiredRequirements, 'rejected')
  const requiredExpiredCount = countByStatus(requiredRequirements, 'expired')

  return {
    approvedCount,
    expiredCount,
    isComplete:
      requiredRequirements.length > 0 &&
      requiredRequirements.every((requirement) => requirement.status === 'approved'),
    missingCount,
    optionalCount: requirements.length - requiredRequirements.length,
    rejectedCount,
    requiredCount: requiredRequirements.length,
    requiredExpiredCount,
    requiredMissingCount,
    requiredRejectedCount,
    totalCount: requirements.length,
    underReviewCount,
    uploadedCount,
  }
}

const countByStatus = (
  requirements: readonly DocumentRequirement[],
  status: DocumentRequirementStatus,
): number => requirements.filter((requirement) => requirement.status === status).length
