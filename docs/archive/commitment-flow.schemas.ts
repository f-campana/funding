/**
 * Historical draft.
 *
 * This file was used to design the initial commitment-flow schema surface.
 * It is preserved as context, not as the current implementation source of
 * truth.
 *
 * Current implementation:
 * packages/domain/src/commitment-flow/commitment-flow.ts
 *
 * ---
 *
 * Investor Commitment Flow — Zod Schemas
 * packages/domain/src/schemas/commitment-flow.ts
 *
 * Four-step progressive disclosure form:
 *   1. Amount       — ticket size, validated against deal terms
 *   2. Qualification — MiFID II investor classification, jurisdiction-aware
 *   3. KYC / KYB    — identity documents, individual or legal entity
 *   4. Review       — wire instructions acknowledgement, final consent
 *
 * Design decisions:
 * - Each step schema is independently valid and testable
 * - The full CommitmentFormData type is the intersection of all steps
 * - Discriminated unions (entityType, qualificationType) drive conditional fields
 * - All monetary amounts are integers (eurocents) — never floats
 * - Zod refinements enforce domain invariants the type system cannot
 * - z.literal(true) for boolean consents — forces explicit acceptance, not default
 */

import { z } from 'zod'

// ─── Constants ───────────────────────────────────────────────────────────────

/** ISO 3166-1 alpha-2 codes for EU EuVECA-eligible member states */
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

/** Additional supported jurisdictions (non-EU, more restrictive onboarding) */
export const NON_EU_SUPPORTED_COUNTRIES = ['CH', 'GB', 'NO', 'IS', 'LI'] as const

export const ALL_SUPPORTED_COUNTRIES = [
  ...EU_EUVECA_COUNTRIES,
  ...NON_EU_SUPPORTED_COUNTRIES,
] as const

export type SupportedCountry = (typeof ALL_SUPPORTED_COUNTRIES)[number]
export type EuEuvecaCountry = (typeof EU_EUVECA_COUNTRIES)[number]

/** EuVECA investor qualification types per EU Regulation 345/2013 */
export type QualificationType = 'professional' | 'informed' | 'non_eligible'

// ─── Step 1: Amount ───────────────────────────────────────────────────────────

/**
 * Amount is stored as eurocents (integer) — never as a float.
 * The minimum is enforced per deal at runtime via `minTicketCents`.
 * The schema accepts a static lower bound (€1 = 100 eurocents) as a floor;
 * deal-specific validation is applied via `.superRefine()` at the form level.
 */
export const AmountStepSchema = z.object({
  /**
   * The committed amount in eurocents (integer).
   * UI layer converts the formatted input string → eurocents before submission.
   * Example: "5 000,00 €" → 500000n → 500000 (stored as number for Zod compat,
   * branded EuroCents type is enforced at the TypeScript layer above this schema).
   */
  amountCents: z
    .number()
    .int('Amount must be expressed in whole eurocents')
    .min(100, 'Amount must be at least €1.00')
    .max(100_000_000_00, 'Amount exceeds maximum supported value'),

  /**
   * The raw string the investor typed — preserved for display and audit.
   * Accepts European decimal format (comma as separator) and standard format.
   */
  amountRaw: z
    .string()
    .regex(
      /^\d{1,3}(?:[\s.]\d{3})*(?:,\d{1,2})?(?:\s?€)?$|^\d+(?:\.\d{1,2})?(?:\s?€)?$/,
      'Invalid amount format',
    ),
})

export type AmountStep = z.infer<typeof AmountStepSchema>

// ─── Step 2: Qualification ────────────────────────────────────────────────────

/**
 * MiFID II Article 4(1)(10) and Annex II — Professional investor criteria.
 * Status requires meeting at least 2 of 3 quantitative criteria.
 * Self-declaration is mandatory — the platform does not verify independently.
 */
const ProfessionalQualificationSchema = z
  .object({
    qualificationType: z.literal('professional'),
    country: z.enum(ALL_SUPPORTED_COUNTRIES),
    entityType: z.enum(['individual', 'legal_entity']),

    // MiFID II Annex II quantitative criteria (at least 2 must be true)
    portfolioOver500k: z.boolean(),
    tenPlusTransactionsPerQuarter: z.boolean(),
    worksOrWorkedInFinancialSector: z.boolean(),

    // Mandatory self-declaration — z.literal(true) prevents default false
    selfDeclarationAccepted: z.literal(true, {
      errorMap: () => ({ message: 'Self-declaration is required to continue' }),
    }),
  })
  .refine(
    (data) =>
      [
        data.portfolioOver500k,
        data.tenPlusTransactionsPerQuarter,
        data.worksOrWorkedInFinancialSector,
      ].filter(Boolean).length >= 2,
    {
      message:
        'Professional investor status requires meeting at least 2 of the 3 MiFID II quantitative criteria',
      path: ['portfolioOver500k'],
    },
  )

/**
 * Informed investor — EuVECA Regulation Article 6(1)(b).
 * Acknowledges higher risk profile than retail without meeting professional criteria.
 * Only available in EU EuVECA jurisdictions.
 */
const InformedQualificationSchema = z.object({
  qualificationType: z.literal('informed'),
  country: z.enum(EU_EUVECA_COUNTRIES, {
    errorMap: () => ({
      message: 'Informed investor status is only available in EuVECA member states',
    }),
  }),
  entityType: z.enum(['individual', 'legal_entity']),

  investmentExperience: z.enum(['less_than_1_year', '1_to_3_years', 'more_than_3_years'], {
    errorMap: () => ({ message: 'Please select your investment experience' }),
  }),

  // Explicit risk acknowledgements — all must be true
  riskOfLossAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must acknowledge the risk of total capital loss' }),
  }),
  illiquidityAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must acknowledge the illiquid nature of this investment' }),
  }),
  minimumCommitmentAcknowledged: z.literal(true, {
    errorMap: () => ({ message: 'You must acknowledge the minimum investment commitment' }),
  }),
})

/**
 * Non-eligible — the investor does not qualify under any supported category.
 * Captured explicitly so the UI can render a blocking state rather than silently failing.
 * No further steps are possible; the commitment cannot proceed.
 */
const NonEligibleSchema = z.object({
  qualificationType: z.literal('non_eligible'),
  country: z.enum(ALL_SUPPORTED_COUNTRIES),
  entityType: z.enum(['individual', 'legal_entity']),
})

export const QualificationStepSchema = z.discriminatedUnion('qualificationType', [
  ProfessionalQualificationSchema,
  InformedQualificationSchema,
  NonEligibleSchema,
])

export type QualificationStep = z.infer<typeof QualificationStepSchema>
export type ProfessionalQualification = z.infer<typeof ProfessionalQualificationSchema>
export type InformedQualification = z.infer<typeof InformedQualificationSchema>

// ─── Step 3: KYC / KYB ───────────────────────────────────────────────────────

/**
 * Uploaded document — returned by the document upload API.
 * The schema validates the server response, not the raw File object.
 */
const UploadedDocumentSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1),
  sizeBytes: z
    .number()
    .int()
    .max(10 * 1024 * 1024, 'Document must not exceed 10 MB'),
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  uploadedAt: z.string().datetime(),
  /** Short-lived presigned URL for preview — not stored in form state */
  previewUrl: z.string().url().optional(),
})

export type UploadedDocument = z.infer<typeof UploadedDocumentSchema>

/**
 * Individual KYC — natural person.
 * Standard two-document approach: identity + proof of address.
 */
const IndividualKycSchema = z.object({
  entityType: z.literal('individual'),

  /**
   * Government-issued identity document.
   * Accepted: passport, national identity card, residence permit.
   */
  idDocument: UploadedDocumentSchema,

  /**
   * Proof of address dated within the last 3 months.
   * Accepted: utility bill, bank statement, official government letter.
   */
  proofOfAddress: UploadedDocumentSchema,

  /** ISO 3166-1 alpha-2 — may differ from qualification jurisdiction */
  taxResidencyCountry: z
    .string()
    .length(2, 'Must be an ISO 3166-1 alpha-2 country code')
    .toUpperCase(),

  /**
   * Tax identification number — required for non-EU residents
   * and for FATCA compliance for US persons.
   */
  taxIdentificationNumber: z.string().min(1).optional(),

  /** True if the investor is a US person under FATCA regulations */
  isUsPerson: z.boolean(),
})

/**
 * Ultimate Beneficial Owner — person holding ≥ 25% of legal entity.
 * EU 4th Anti-Money Laundering Directive requirement.
 */
const UboSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  ownershipPercentage: z.number().min(25, 'UBO threshold is 25% minimum ownership').max(100),
  nationality: z.string().length(2, 'Must be an ISO 3166-1 alpha-2 country code').toUpperCase(),
  idDocument: UploadedDocumentSchema,
})

/**
 * Legal entity KYB — corporate investor.
 * Requires entity documentation plus UBO declarations.
 * UBO list must be exhaustive — the form prompts until the user confirms completeness.
 */
const LegalEntityKybSchema = z.object({
  entityType: z.literal('legal_entity'),
  entityName: z.string().min(1, 'Entity name is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  registrationCountry: z
    .string()
    .length(2, 'Must be an ISO 3166-1 alpha-2 country code')
    .toUpperCase(),

  /** Certificate of incorporation or equivalent */
  articlesOfAssociation: UploadedDocumentSchema,
  /** Official commercial registry extract dated within 3 months */
  proofOfRegistration: UploadedDocumentSchema,

  /**
   * UBOs: all persons with ≥ 25% direct or indirect ownership.
   * If no single person owns ≥ 25%, the senior managing official is listed.
   */
  ubos: z.array(UboSchema).min(1, 'At least one Ultimate Beneficial Owner must be declared'),

  /** Confirmed by the signatory that the UBO list is complete and accurate */
  uboListIsComplete: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm the UBO list is complete and accurate' }),
  }),
})

export const KycStepSchema = z.discriminatedUnion('entityType', [
  IndividualKycSchema,
  LegalEntityKybSchema,
])

export type KycStep = z.infer<typeof KycStepSchema>
export type IndividualKyc = z.infer<typeof IndividualKycSchema>
export type LegalEntityKyb = z.infer<typeof LegalEntityKybSchema>
export type Ubo = z.infer<typeof UboSchema>

// ─── Step 4: Review & Confirm ─────────────────────────────────────────────────

/**
 * Final review step — no new data collection, only explicit acknowledgements.
 * All consents use z.literal(true) — preventing form submission with unchecked boxes
 * via type system, not just runtime validation.
 *
 * Wire instructions are displayed server-side; only the investor's confirmation
 * email is collected here for the wire confirmation receipt.
 */
export const ReviewStepSchema = z.object({
  /**
   * Investor confirms they have noted the wire transfer details.
   * Wire must arrive within the deal's collection window or the commitment lapses.
   */
  wireInstructionsAcknowledged: z.literal(true, {
    errorMap: () => ({ message: 'You must acknowledge the wire transfer instructions' }),
  }),

  /** GDPR Article 7 — explicit, informed, freely given consent */
  dataProcessingConsentGiven: z.literal(true, {
    errorMap: () => ({ message: 'Data processing consent is required to proceed' }),
  }),

  /** Subscription bulletin and investment terms */
  subscriptionTermsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the subscription terms' }),
  }),

  /** Electronic signature consent — legally binding under eIDAS Regulation */
  electronicSignatureConsentGiven: z.literal(true, {
    errorMap: () => ({
      message: 'You must consent to electronic signature to receive your subscription bulletin',
    }),
  }),

  /**
   * Confirmation email for wire receipt and subscription bulletin delivery.
   * May differ from the investor's account email (e.g., for legal entities).
   */
  wireConfirmationEmail: z
    .string()
    .email('A valid email address is required for the wire confirmation'),
})

export type ReviewStep = z.infer<typeof ReviewStepSchema>

// ─── Full Commitment Form ─────────────────────────────────────────────────────

/**
 * Complete commitment form data — the union of all four steps.
 * Used for the final submission mutation after all steps are validated.
 *
 * Note: QualificationStep is a discriminated union — TypeScript preserves
 * the narrowed type throughout. Components should use the narrowed type
 * after checking qualificationType.
 */
export type CommitmentFormData = {
  amount: AmountStep
  qualification: QualificationStep
  kyc: KycStep
  review: ReviewStep
}

/**
 * Server-side submission schema — validates the complete payload sent
 * to the tRPC mutation. Includes the dealId resolved from URL context.
 */
export const CommitmentSubmissionSchema = z.object({
  dealId: z.string().uuid(),
  amount: AmountStepSchema,
  qualification: QualificationStepSchema,
  kyc: KycStepSchema,
  review: ReviewStepSchema,
})

export type CommitmentSubmission = z.infer<typeof CommitmentSubmissionSchema>

// ─── Step discriminant helpers ────────────────────────────────────────────────

/** Ordered step identifiers — used by the form stepper and URL routing */
export const COMMITMENT_STEPS = ['amount', 'qualification', 'kyc', 'review'] as const
export type CommitmentStepId = (typeof COMMITMENT_STEPS)[number]

export const COMMITMENT_STEP_LABELS: Record<CommitmentStepId, string> = {
  amount: 'Investment amount',
  qualification: 'Investor qualification',
  kyc: 'Identity verification',
  review: 'Review & confirm',
}

/** Schema map — enables per-step validation in the form stepper */
export const COMMITMENT_STEP_SCHEMAS = {
  amount: AmountStepSchema,
  qualification: QualificationStepSchema,
  kyc: KycStepSchema,
  review: ReviewStepSchema,
} satisfies Record<CommitmentStepId, z.ZodTypeAny>
