import type { z } from 'zod'

import type {
  AmountStepSchema,
  CommitmentFormSchema,
  KycStepSchema,
  QualificationStepSchema,
  ReviewStepSchema,
} from './commitment-flow'

const VALID_DOCUMENT_ID = '11111111-1111-4111-8111-111111111111'
const SECOND_DOCUMENT_ID = '22222222-2222-4222-8222-222222222222'
const THIRD_DOCUMENT_ID = '33333333-3333-4333-8333-333333333333'
const FOURTH_DOCUMENT_ID = '44444444-4444-4444-8444-444444444444'

export const validAmountStep = {
  amountCents: 500_000,
  amountRaw: '5 000,00 €',
} satisfies z.input<typeof AmountStepSchema>

export const validUploadedDocument = {
  filename: 'passport.pdf',
  id: VALID_DOCUMENT_ID,
  mimeType: 'application/pdf',
  sizeBytes: 1_024_000,
  uploadedAt: '2026-04-01T12:00:00.000Z',
} as const

export const validProofOfAddressDocument = {
  filename: 'proof-of-address.png',
  id: SECOND_DOCUMENT_ID,
  mimeType: 'image/png',
  previewUrl: 'https://example.com/documents/proof-of-address',
  sizeBytes: 512_000,
  uploadedAt: '2026-04-01T12:01:00.000Z',
} as const

export const validRegistryDocument = {
  filename: 'registry-extract.pdf',
  id: THIRD_DOCUMENT_ID,
  mimeType: 'application/pdf',
  sizeBytes: 768_000,
  uploadedAt: '2026-04-01T12:02:00.000Z',
} as const

export const validArticlesDocument = {
  filename: 'articles.pdf',
  id: FOURTH_DOCUMENT_ID,
  mimeType: 'application/pdf',
  sizeBytes: 864_000,
  uploadedAt: '2026-04-01T12:03:00.000Z',
} as const

export const validIndividualProfessionalQualification = {
  country: 'FR',
  entityType: 'individual',
  portfolioOver500k: true,
  qualificationType: 'professional',
  selfDeclarationAccepted: true,
  tenPlusTransactionsPerQuarter: true,
  worksOrWorkedInFinancialSector: false,
} satisfies z.input<typeof QualificationStepSchema>

export const validLegalEntityProfessionalQualification = {
  country: 'GB',
  entityType: 'legal_entity',
  portfolioOver500k: true,
  qualificationType: 'professional',
  selfDeclarationAccepted: true,
  tenPlusTransactionsPerQuarter: false,
  worksOrWorkedInFinancialSector: true,
} satisfies z.input<typeof QualificationStepSchema>

export const validInformedInvestorFr = {
  country: 'FR',
  entityType: 'individual',
  illiquidityAccepted: true,
  investmentExperience: 'more_than_3_years',
  minimumCommitmentAcknowledged: true,
  qualificationType: 'informed',
  riskOfLossAccepted: true,
} satisfies z.input<typeof QualificationStepSchema>

export const invalidInformedInvestorCh = {
  ...validInformedInvestorFr,
  country: 'CH',
}

export const nonEligibleInvestor = {
  country: 'FR',
  entityType: 'individual',
  qualificationType: 'non_eligible',
} satisfies z.input<typeof QualificationStepSchema>

export const validKycIndividual = {
  entityType: 'individual',
  idDocument: validUploadedDocument,
  isUsPerson: false,
  proofOfAddress: validProofOfAddressDocument,
  taxResidencyCountry: 'fr',
} satisfies z.input<typeof KycStepSchema>

export const validKybLegalEntity = {
  articlesOfAssociation: validArticlesDocument,
  entityName: 'Funding Ventures SAS',
  entityType: 'legal_entity',
  proofOfRegistration: validRegistryDocument,
  registrationCountry: 'FR',
  registrationNumber: 'RCS-123456789',
  uboListIsComplete: true,
  ubos: [
    {
      fullName: 'Ada Lovelace',
      idDocument: validUploadedDocument,
      nationality: 'GB',
      ownershipPercentage: 51,
    },
  ],
} satisfies z.input<typeof KycStepSchema>

export const invalidLegalEntityWithNoUbo = {
  ...validKybLegalEntity,
  ubos: [],
}

export const invalidUboBelow25PercentOwnership = {
  ...validKybLegalEntity,
  ubos: [
    {
      ...validKybLegalEntity.ubos[0],
      ownershipPercentage: 24.99,
    },
  ],
}

export const validReviewStep = {
  dataProcessingConsentGiven: true,
  electronicSignatureConsentGiven: true,
  subscriptionTermsAccepted: true,
  wireConfirmationEmail: 'investor@example.com',
  wireInstructionsAcknowledged: true,
} satisfies z.input<typeof ReviewStepSchema>

export const invalidReviewStepWithMissingConsent = {
  ...validReviewStep,
  wireInstructionsAcknowledged: false,
}

export const validIndividualProfessionalCommitmentForm = {
  amount: validAmountStep,
  kyc: validKycIndividual,
  qualification: validIndividualProfessionalQualification,
  review: validReviewStep,
} satisfies z.input<typeof CommitmentFormSchema>

export const nonEligibleCommitmentForm = {
  ...validIndividualProfessionalCommitmentForm,
  qualification: nonEligibleInvestor,
} satisfies z.input<typeof CommitmentFormSchema>
