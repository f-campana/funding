export type CommitmentReadinessKey = 'kycKyb' | 'signature' | 'wire' | 'reconciliation'

export const commitmentReadinessKeys = [
  'kycKyb',
  'signature',
  'wire',
  'reconciliation',
] as const satisfies readonly CommitmentReadinessKey[]

export type CommitmentReadinessTone = 'success' | 'danger' | 'attention' | 'info' | 'neutral'

export type CommitmentReadinessVariantByKey = {
  readonly kycKyb: 'verified' | 'inReview' | 'expired' | 'unavailable'
  readonly signature: 'signed' | 'pending' | 'unavailable'
  readonly wire: 'received' | 'pending' | 'notReceived' | 'syncFailed'
  readonly reconciliation: 'reconciled' | 'pending' | 'notStarted' | 'reconciling' | 'needsReview'
}

export type CommitmentReadinessVariant = CommitmentReadinessVariantByKey[CommitmentReadinessKey]

export type CommitmentReadinessState<Key extends CommitmentReadinessKey = CommitmentReadinessKey> =
  Key extends CommitmentReadinessKey
    ? {
        readonly key: Key
        readonly variant: CommitmentReadinessVariantByKey[Key]
        /**
         * Display labels remain caller-owned for localization. Behavior derives from
         * `variant`, not from these strings.
         */
        readonly label: string
        readonly value: string
        readonly detail?: string | undefined
      }
    : never

export type CommitmentReadinessRecord = {
  readonly [Key in CommitmentReadinessKey]: CommitmentReadinessState<Key>
}
