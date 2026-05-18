export type CommitmentReadinessKey = 'kycKyb' | 'signature' | 'wire' | 'reconciliation'

export const commitmentReadinessKeys = [
  'kycKyb',
  'signature',
  'wire',
  'reconciliation',
] as const satisfies readonly CommitmentReadinessKey[]
