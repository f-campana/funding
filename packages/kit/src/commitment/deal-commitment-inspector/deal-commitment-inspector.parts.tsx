'use client'

import { Badge, cn } from '@repo/ui'
import { Banknote, type LucideIcon, Scale, ShieldCheck, Signature } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  inspectorToneBadgeClasses,
  inspectorToneDotClasses,
} from './deal-commitment-inspector.model'
import type {
  DealCommitmentInspectorFactProps,
  DealCommitmentInspectorTone,
  DealCommitmentReadinessKey,
} from './deal-commitment-inspector.types'

export const DealCommitmentInspectorSectionTitle = ({
  children,
  icon,
  id,
}: {
  readonly children: ReactNode
  readonly icon: ReactNode
  readonly id: string
}) => (
  <h3
    className="flex min-w-0 items-center gap-2 text-sm font-semibold text-card-foreground"
    id={id}
  >
    <span className="text-muted-foreground">{icon}</span>
    <span className="min-w-0 break-words">{children}</span>
  </h3>
)

export const DealCommitmentInspectorEmptySectionText = ({
  children,
  dataSlot,
}: {
  readonly children: ReactNode
  readonly dataSlot: string
}) => (
  <p
    className="rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm leading-6 text-muted-foreground"
    data-slot={dataSlot}
  >
    {children}
  </p>
)

export const DealCommitmentInspectorToneBadge = ({
  children,
  tone,
}: {
  readonly children: ReactNode
  readonly tone: DealCommitmentInspectorTone
}) => (
  <Badge
    className={cn(
      'max-w-full justify-start whitespace-normal text-left leading-5',
      inspectorToneBadgeClasses[tone],
    )}
    data-tone={tone}
    variant="outline"
  >
    {children}
  </Badge>
)

export const DealCommitmentInspectorFact = ({
  icon,
  label,
  value,
}: DealCommitmentInspectorFactProps) => (
  <div className="grid min-w-0 gap-0.5 rounded-md bg-muted/50 px-2 py-1.5">
    <dt className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 break-words">{label}</span>
    </dt>
    <dd className="min-w-0 break-words pl-5 text-xs text-card-foreground">{value}</dd>
  </div>
)

export const dealCommitmentInspectorReadinessIconByKey = {
  kycKyb: ShieldCheck,
  reconciliation: Scale,
  signature: Signature,
  wire: Banknote,
} as const satisfies Record<DealCommitmentReadinessKey, LucideIcon>

export const DealCommitmentInspectorReadinessIcon = ({
  readinessKey,
}: {
  readonly readinessKey: DealCommitmentReadinessKey
}) => {
  const Icon = dealCommitmentInspectorReadinessIconByKey[readinessKey]

  return <Icon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
}

export { inspectorToneDotClasses }
