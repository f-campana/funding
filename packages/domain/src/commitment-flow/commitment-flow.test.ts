import { describe, expect, it } from 'vitest'

import { euroCentsToMinorUnits } from '../money'
import {
  AmountStepSchema,
  CommitmentFormSchema,
  KycStepSchema,
  QualificationStepSchema,
  ReviewStepSchema,
  SubmittableCommitmentFormSchema,
} from './commitment-flow'
import {
  invalidInformedInvestorCh,
  invalidLegalEntityWithNoUbo,
  invalidReviewStepWithMissingConsent,
  invalidUboBelow25PercentOwnership,
  nonEligibleCommitmentForm,
  nonEligibleInvestor,
  validAmountStep,
  validIndividualProfessionalCommitmentForm,
  validIndividualProfessionalQualification,
  validInformedInvestorFr,
  validKybLegalEntity,
  validKycIndividual,
  validLegalEntityProfessionalQualification,
  validReviewStep,
  validUploadedDocument,
} from './fixtures'

describe('AmountStepSchema', () => {
  it('brands safe integer amount cents as EuroCents', () => {
    const parsed = AmountStepSchema.parse(validAmountStep)

    expect(euroCentsToMinorUnits(parsed.amountCents)).toBe(500_000n)
  })

  it('trims display amount text and rejects whitespace-only text', () => {
    expect(
      AmountStepSchema.parse({ ...validAmountStep, amountRaw: '  5 000,00 €  ' }),
    ).toMatchObject({
      amountRaw: '5 000,00 €',
    })
    expect(AmountStepSchema.safeParse({ ...validAmountStep, amountRaw: '   ' }).success).toBe(false)
  })

  it('rejects unsafe, non-integer, and non-positive amount cents', () => {
    expect(
      AmountStepSchema.safeParse({
        ...validAmountStep,
        amountCents: Number.MAX_SAFE_INTEGER + 1,
      }).success,
    ).toBe(false)
    expect(AmountStepSchema.safeParse({ ...validAmountStep, amountCents: 12.34 }).success).toBe(
      false,
    )
    expect(AmountStepSchema.safeParse({ ...validAmountStep, amountCents: 0 }).success).toBe(false)
  })
})

describe('QualificationStepSchema', () => {
  it('accepts professional investors with at least two MiFID criteria', () => {
    expect(
      QualificationStepSchema.safeParse(validIndividualProfessionalQualification).success,
    ).toBe(true)
    expect(
      QualificationStepSchema.safeParse(validLegalEntityProfessionalQualification).success,
    ).toBe(true)
  })

  it('rejects professional investors with fewer than two MiFID criteria', () => {
    const result = QualificationStepSchema.safeParse({
      ...validIndividualProfessionalQualification,
      tenPlusTransactionsPerQuarter: false,
    })

    expect(result.success).toBe(false)
  })

  it('restricts informed investors to EuVECA countries', () => {
    expect(QualificationStepSchema.safeParse(validInformedInvestorFr).success).toBe(true)
    expect(QualificationStepSchema.safeParse(invalidInformedInvestorCh).success).toBe(false)
  })

  it('allows non-eligible qualification as a blocking form state', () => {
    expect(QualificationStepSchema.safeParse(nonEligibleInvestor).success).toBe(true)
  })

  it('requires legal acknowledgements to be literal true', () => {
    expect(
      QualificationStepSchema.safeParse({
        ...validInformedInvestorFr,
        riskOfLossAccepted: false,
      }).success,
    ).toBe(false)
    expect(
      QualificationStepSchema.safeParse({
        ...validIndividualProfessionalQualification,
        selfDeclarationAccepted: false,
      }).success,
    ).toBe(false)
  })
})

describe('KycStepSchema', () => {
  it('accepts valid individual KYC and uppercases tax residency country', () => {
    const parsed = KycStepSchema.parse(validKycIndividual)

    expect(parsed.entityType).toBe('individual')
    if (parsed.entityType !== 'individual') {
      throw new Error('expected individual KYC')
    }

    expect(parsed.taxResidencyCountry).toBe('FR')
  })

  it('rejects malformed ISO alpha-2 country codes', () => {
    expect(
      KycStepSchema.safeParse({
        ...validKycIndividual,
        taxResidencyCountry: '1!',
      }).success,
    ).toBe(false)
  })

  it('accepts valid legal entity KYB and uppercases UBO country codes', () => {
    const parsed = KycStepSchema.parse({
      ...validKybLegalEntity,
      ubos: [{ ...validKybLegalEntity.ubos[0], fullName: '  Ada Lovelace  ' }],
    })

    expect(parsed.entityType).toBe('legal_entity')
    if (parsed.entityType !== 'legal_entity') {
      throw new Error('expected legal entity KYB')
    }

    expect(parsed.registrationCountry).toBe('FR')
    expect(parsed.ubos[0]?.fullName).toBe('Ada Lovelace')
    expect(parsed.ubos[0]?.nationality).toBe('GB')
  })

  it('rejects whitespace-only UBO full names', () => {
    expect(
      KycStepSchema.safeParse({
        ...validKybLegalEntity,
        ubos: [{ ...validKybLegalEntity.ubos[0], fullName: '   ' }],
      }).success,
    ).toBe(false)
  })

  it('rejects documents larger than 10 MB', () => {
    const result = KycStepSchema.safeParse({
      ...validKycIndividual,
      idDocument: {
        ...validUploadedDocument,
        sizeBytes: 10 * 1024 * 1024 + 1,
      },
    })

    expect(result.success).toBe(false)
  })

  it('rejects unsupported document MIME types', () => {
    const result = KycStepSchema.safeParse({
      ...validKycIndividual,
      idDocument: {
        ...validUploadedDocument,
        mimeType: 'text/plain',
      },
    })

    expect(result.success).toBe(false)
  })

  it('requires at least one UBO for legal entities', () => {
    expect(KycStepSchema.safeParse(invalidLegalEntityWithNoUbo).success).toBe(false)
  })

  it('rejects UBO ownership below 25 percent', () => {
    expect(KycStepSchema.safeParse(invalidUboBelow25PercentOwnership).success).toBe(false)
  })

  it('requires UBO completeness acknowledgement to be literal true', () => {
    expect(
      KycStepSchema.safeParse({
        ...validKybLegalEntity,
        uboListIsComplete: false,
      }).success,
    ).toBe(false)
  })
})

describe('ReviewStepSchema', () => {
  it('accepts a valid review step', () => {
    expect(ReviewStepSchema.safeParse(validReviewStep).success).toBe(true)
  })

  it('requires every final consent to be literal true', () => {
    expect(ReviewStepSchema.safeParse(invalidReviewStepWithMissingConsent).success).toBe(false)
    expect(
      ReviewStepSchema.safeParse({
        ...validReviewStep,
        dataProcessingConsentGiven: false,
      }).success,
    ).toBe(false)
    expect(
      ReviewStepSchema.safeParse({
        ...validReviewStep,
        electronicSignatureConsentGiven: false,
      }).success,
    ).toBe(false)
    expect(
      ReviewStepSchema.safeParse({
        ...validReviewStep,
        subscriptionTermsAccepted: false,
      }).success,
    ).toBe(false)
  })

  it('validates wire confirmation email', () => {
    expect(
      ReviewStepSchema.safeParse({
        ...validReviewStep,
        wireConfirmationEmail: 'not-an-email',
      }).success,
    ).toBe(false)
  })
})

describe('Commitment form schemas', () => {
  it('accepts complete commitment data including non-eligible blocking states', () => {
    expect(CommitmentFormSchema.safeParse(validIndividualProfessionalCommitmentForm).success).toBe(
      true,
    )
    expect(CommitmentFormSchema.safeParse(nonEligibleCommitmentForm).success).toBe(true)
  })

  it('rejects non-eligible investors for submittable commitment payloads', () => {
    expect(
      SubmittableCommitmentFormSchema.safeParse(validIndividualProfessionalCommitmentForm).success,
    ).toBe(true)
    expect(SubmittableCommitmentFormSchema.safeParse(nonEligibleCommitmentForm).success).toBe(false)
  })
})
