import { z } from 'zod'

import { DocumentIdSchema } from '../ids'
import { createEuroCentsJsonSchema } from '../money'

export const EU_EUVECA_COUNTRIES = [
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'HU',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK',
] as const

export const NON_EU_SUPPORTED_COUNTRIES = ['CH', 'GB', 'NO', 'IS', 'LI'] as const

export const ALL_SUPPORTED_COUNTRIES = [
  ...EU_EUVECA_COUNTRIES,
  ...NON_EU_SUPPORTED_COUNTRIES,
] as const

export type SupportedCountry = (typeof ALL_SUPPORTED_COUNTRIES)[number]
export type EuEuvecaCountry = (typeof EU_EUVECA_COUNTRIES)[number]
export type QualificationType = 'professional' | 'informed' | 'non_eligible'

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

const EntityTypeSchema = z.enum(['individual', 'legal_entity'])
const SupportedCountrySchema = z.enum(ALL_SUPPORTED_COUNTRIES)
const EuEuvecaCountrySchema = z.enum(EU_EUVECA_COUNTRIES, {
  error: 'commitment.qualification.euveca_country_required',
})
const IsoCountryCodeSchema = z
  .string()
  .length(2, { error: 'commitment.country.iso_alpha_2_required' })
  .regex(/^[A-Za-z]{2}$/, { error: 'commitment.country.iso_alpha_2_required' })
  .transform((value) => value.toUpperCase())
const RequiredTextSchema = z.string().trim().min(1, { error: 'commitment.text.required' })
const RequiredTrueSchema = (message: string) => z.literal(true, { error: message })

const AmountCentsSchema = createEuroCentsJsonSchema({
  minimum: 'positive',
  minimumError: 'commitment.amount.positive_required',
})

export const AmountStepSchema = z.object({
  amountCents: AmountCentsSchema,
  amountRaw: z.string().trim().min(1, { error: 'commitment.amount.raw_required' }),
})

export type AmountStep = z.infer<typeof AmountStepSchema>

const ProfessionalQualificationSchema = z
  .object({
    country: SupportedCountrySchema,
    entityType: EntityTypeSchema,
    portfolioOver500k: z.boolean(),
    qualificationType: z.literal('professional'),
    selfDeclarationAccepted: RequiredTrueSchema(
      'commitment.qualification.self_declaration_required',
    ),
    tenPlusTransactionsPerQuarter: z.boolean(),
    worksOrWorkedInFinancialSector: z.boolean(),
  })
  .refine(
    (data) =>
      [
        data.portfolioOver500k,
        data.tenPlusTransactionsPerQuarter,
        data.worksOrWorkedInFinancialSector,
      ].filter(Boolean).length >= 2,
    {
      message: 'commitment.qualification.professional_criteria_required',
      path: ['portfolioOver500k'],
    },
  )

const InformedQualificationSchema = z.object({
  country: EuEuvecaCountrySchema,
  entityType: EntityTypeSchema,
  illiquidityAccepted: RequiredTrueSchema('commitment.qualification.illiquidity_required'),
  investmentExperience: z.enum(['less_than_1_year', '1_to_3_years', 'more_than_3_years'], {
    error: 'commitment.qualification.investment_experience_required',
  }),
  minimumCommitmentAcknowledged: RequiredTrueSchema(
    'commitment.qualification.minimum_commitment_required',
  ),
  qualificationType: z.literal('informed'),
  riskOfLossAccepted: RequiredTrueSchema('commitment.qualification.risk_of_loss_required'),
})

const NonEligibleQualificationSchema = z.object({
  country: SupportedCountrySchema,
  entityType: EntityTypeSchema,
  qualificationType: z.literal('non_eligible'),
})

export const QualificationStepSchema = z.discriminatedUnion('qualificationType', [
  ProfessionalQualificationSchema,
  InformedQualificationSchema,
  NonEligibleQualificationSchema,
])

const SubmittableQualificationStepSchema = z.discriminatedUnion('qualificationType', [
  ProfessionalQualificationSchema,
  InformedQualificationSchema,
])

export type QualificationStep = z.infer<typeof QualificationStepSchema>
export type ProfessionalQualification = z.infer<typeof ProfessionalQualificationSchema>
export type InformedQualification = z.infer<typeof InformedQualificationSchema>

const UploadedDocumentSchema = z.object({
  filename: RequiredTextSchema,
  id: DocumentIdSchema,
  mimeType: z.enum(ALLOWED_DOCUMENT_MIME_TYPES, {
    error: 'commitment.document.mime_type_unsupported',
  }),
  previewUrl: z.string().url({ error: 'commitment.document.preview_url_invalid' }).optional(),
  sizeBytes: z
    .number({ error: 'commitment.document.size_invalid' })
    .int({ error: 'commitment.document.size_invalid' })
    .nonnegative({ error: 'commitment.document.size_invalid' })
    .max(MAX_DOCUMENT_SIZE_BYTES, { error: 'commitment.document.size_max' }),
  uploadedAt: z.iso.datetime({ error: 'commitment.document.uploaded_at_invalid' }),
})

const IndividualKycSchema = z.object({
  entityType: z.literal('individual'),
  idDocument: UploadedDocumentSchema,
  isUsPerson: z.boolean(),
  proofOfAddress: UploadedDocumentSchema,
  taxIdentificationNumber: RequiredTextSchema.optional(),
  taxResidencyCountry: IsoCountryCodeSchema,
})

const UboSchema = z.object({
  fullName: z.string().trim().min(2, { error: 'commitment.ubo.full_name_required' }),
  idDocument: UploadedDocumentSchema,
  nationality: IsoCountryCodeSchema,
  ownershipPercentage: z
    .number({ error: 'commitment.ubo.ownership_invalid' })
    .min(25, { error: 'commitment.ubo.ownership_minimum' })
    .max(100, { error: 'commitment.ubo.ownership_maximum' }),
})

const LegalEntityKybSchema = z.object({
  articlesOfAssociation: UploadedDocumentSchema,
  entityName: RequiredTextSchema,
  entityType: z.literal('legal_entity'),
  proofOfRegistration: UploadedDocumentSchema,
  registrationCountry: IsoCountryCodeSchema,
  registrationNumber: RequiredTextSchema,
  uboListIsComplete: RequiredTrueSchema('commitment.kyb.ubo_list_complete_required'),
  ubos: z.array(UboSchema).min(1, { error: 'commitment.kyb.ubo_required' }),
})

export const KycStepSchema = z.discriminatedUnion('entityType', [
  IndividualKycSchema,
  LegalEntityKybSchema,
])

export type UploadedDocument = z.infer<typeof UploadedDocumentSchema>
export type KycStep = z.infer<typeof KycStepSchema>
export type IndividualKyc = z.infer<typeof IndividualKycSchema>
export type LegalEntityKyb = z.infer<typeof LegalEntityKybSchema>
export type Ubo = z.infer<typeof UboSchema>

export const ReviewStepSchema = z.object({
  dataProcessingConsentGiven: RequiredTrueSchema(
    'commitment.review.data_processing_consent_required',
  ),
  electronicSignatureConsentGiven: RequiredTrueSchema(
    'commitment.review.electronic_signature_consent_required',
  ),
  subscriptionTermsAccepted: RequiredTrueSchema('commitment.review.subscription_terms_required'),
  wireConfirmationEmail: z.string().email({ error: 'commitment.review.email_invalid' }),
  wireInstructionsAcknowledged: RequiredTrueSchema('commitment.review.wire_instructions_required'),
})

export type ReviewStep = z.infer<typeof ReviewStepSchema>

export const CommitmentFormSchema = z.object({
  amount: AmountStepSchema,
  kyc: KycStepSchema,
  qualification: QualificationStepSchema,
  review: ReviewStepSchema,
})

export const SubmittableCommitmentFormSchema = z.object({
  amount: AmountStepSchema,
  kyc: KycStepSchema,
  qualification: SubmittableQualificationStepSchema,
  review: ReviewStepSchema,
})

export type CommitmentFormData = z.infer<typeof CommitmentFormSchema>
export type SubmittableCommitmentFormData = z.infer<typeof SubmittableCommitmentFormSchema>
