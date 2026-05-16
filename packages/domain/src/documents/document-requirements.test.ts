import { describe, expect, it } from 'vitest'

import {
  DOCUMENT_REQUIREMENT_CATEGORIES,
  DOCUMENT_REQUIREMENT_OWNERS,
  DOCUMENT_REQUIREMENT_STATUSES,
  type DocumentRequirement,
  DocumentRequirementCategorySchema,
  DocumentRequirementOwnerSchema,
  DocumentRequirementSchema,
  DocumentRequirementStatusSchema,
  getDocumentRequirementStatusTone,
  summarizeDocumentCompleteness,
} from './document-requirements'

const requirements = [
  {
    category: 'subscription_docs',
    id: 'subscription',
    label: 'Subscription bulletin',
    owner: 'investor',
    required: true,
    status: 'approved',
  },
  {
    category: 'identity',
    id: 'identity',
    label: 'Identity document',
    owner: 'investor',
    required: true,
    status: 'missing',
  },
  {
    category: 'proof_of_address',
    id: 'address',
    label: 'Proof of address',
    owner: 'investor',
    required: true,
    status: 'rejected',
  },
  {
    category: 'source_of_funds',
    id: 'source-of-funds',
    label: 'Source of funds',
    owner: 'investor',
    required: false,
    status: 'under_review',
  },
  {
    category: 'corporate_docs',
    id: 'register-extract',
    label: 'Register extract',
    owner: 'legal_entity',
    required: false,
    status: 'expired',
  },
] as const satisfies readonly DocumentRequirement[]

describe('document requirement schemas', () => {
  it('parses every known enum value', () => {
    for (const category of DOCUMENT_REQUIREMENT_CATEGORIES) {
      expect(DocumentRequirementCategorySchema.parse(category)).toBe(category)
    }

    for (const status of DOCUMENT_REQUIREMENT_STATUSES) {
      expect(DocumentRequirementStatusSchema.parse(status)).toBe(status)
    }

    for (const owner of DOCUMENT_REQUIREMENT_OWNERS) {
      expect(DocumentRequirementOwnerSchema.parse(owner)).toBe(owner)
    }
  })

  it('rejects invalid requirement payloads', () => {
    expect(DocumentRequirementSchema.safeParse(requirements[0]).success).toBe(true)
    expect(
      DocumentRequirementSchema.safeParse({ ...requirements[0], category: 'tax_return' }).success,
    ).toBe(false)
    expect(DocumentRequirementSchema.safeParse({ ...requirements[0], label: '  ' }).success).toBe(
      false,
    )
  })
})

describe('document requirement helpers', () => {
  it('summarizes missing, rejected, approved, under-review, and expired documents', () => {
    expect(summarizeDocumentCompleteness(requirements)).toEqual({
      approvedCount: 1,
      expiredCount: 1,
      isComplete: false,
      missingCount: 1,
      optionalCount: 2,
      rejectedCount: 1,
      requiredCount: 3,
      requiredExpiredCount: 0,
      requiredMissingCount: 1,
      requiredRejectedCount: 1,
      totalCount: 5,
      underReviewCount: 1,
      uploadedCount: 0,
    })
  })

  it('requires all required documents to be approved for completeness', () => {
    expect(
      summarizeDocumentCompleteness([
        { ...requirements[0], required: true, status: 'approved' },
        { ...requirements[3], required: false, status: 'missing' },
      ]).isComplete,
    ).toBe(true)
    expect(summarizeDocumentCompleteness([]).isComplete).toBe(false)
  })

  it('maps document statuses to semantic tones', () => {
    expect(getDocumentRequirementStatusTone('approved')).toBe('success')
    expect(getDocumentRequirementStatusTone('missing')).toBe('attention')
    expect(getDocumentRequirementStatusTone('under_review')).toBe('pending')
    expect(getDocumentRequirementStatusTone('rejected')).toBe('danger')
    expect(getDocumentRequirementStatusTone('expired')).toBe('danger')
  })
})
