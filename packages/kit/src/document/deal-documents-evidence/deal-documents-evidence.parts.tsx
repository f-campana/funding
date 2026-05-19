import { Badge, cn } from '@repo/ui'
import type { ReactNode } from 'react'

import { documentEvidenceToneBadgeClasses } from './deal-documents-evidence.model'
import type {
  DealDocumentsEvidenceFactProps,
  DealDocumentsEvidenceTone,
} from './deal-documents-evidence.types'

export const SectionTitle = ({
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

export const EmptySectionText = ({
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

export const ToneBadge = ({
  children,
  tone,
}: {
  readonly children: ReactNode
  readonly tone: DealDocumentsEvidenceTone
}) => (
  <Badge
    className={cn(
      'max-w-full justify-start whitespace-normal text-left leading-5',
      documentEvidenceToneBadgeClasses[tone],
    )}
    data-tone={tone}
    variant="outline"
  >
    {children}
  </Badge>
)

export const CompactFact = ({
  label,
  value,
}: {
  readonly label: string
  readonly value: string
}) => (
  <div className="grid min-w-0 gap-0.5 rounded-md border border-border/70 bg-muted/50 px-2 py-1">
    <dt className="break-words text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="break-words text-xs text-card-foreground">{value}</dd>
  </div>
)

export const DealDocumentsEvidenceFact = ({
  icon,
  label,
  value,
}: DealDocumentsEvidenceFactProps) => (
  <div className="grid min-w-0 gap-0.5 rounded-md bg-muted/50 px-2 py-1.5">
    <dt className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 break-words">{label}</span>
    </dt>
    <dd className="min-w-0 break-words pl-5 text-xs text-card-foreground">{value}</dd>
  </div>
)
