import { type DocumentRequirement, summarizeDocumentCompleteness } from '@repo/domain/documents'

export const northstarDocumentRequirements = [
  {
    category: 'pitch_deck',
    id: 'northstar-pitch-deck',
    label: 'Investor pitch deck',
    owner: 'deal',
    required: true,
    status: 'approved',
  },
  {
    category: 'subscription_docs',
    id: 'northstar-subscription-bulletin',
    label: 'Subscription bulletin',
    owner: 'investor',
    required: true,
    status: 'approved',
  },
  {
    category: 'identity',
    id: 'elise-identity',
    label: 'Elise Martin identity document',
    owner: 'investor',
    required: true,
    status: 'uploaded',
  },
  {
    category: 'proof_of_address',
    id: 'elise-proof-of-address',
    label: 'Elise Martin proof of address',
    owner: 'investor',
    required: true,
    status: 'rejected',
  },
  {
    category: 'source_of_funds',
    id: 'belair-source-of-funds',
    label: 'Belair source-of-funds evidence',
    owner: 'legal_entity',
    required: true,
    status: 'under_review',
  },
  {
    category: 'ubo_declaration',
    id: 'rhine-ubo-declaration',
    label: 'Rhine Ventures UBO declaration',
    owner: 'legal_entity',
    required: true,
    status: 'missing',
  },
  {
    category: 'corporate_docs',
    id: 'rhine-register-extract',
    label: 'Rhine Ventures register extract',
    owner: 'legal_entity',
    required: false,
    status: 'expired',
  },
] as const satisfies readonly DocumentRequirement[]

export const northstarDocumentCompletenessSummary = summarizeDocumentCompleteness(
  northstarDocumentRequirements,
)
