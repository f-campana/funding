import { Badge, cn } from '@repo/ui'
import { Clock3, FileCheck2, Landmark, ListChecks, UserRound } from 'lucide-react'
import { type ReactNode, useId } from 'react'
import { match } from 'ts-pattern'

import { severityToneClasses } from './deal-operational-overview.styles'
import type {
  DealOperationalBlocker,
  DealOperationalOverviewLabels,
} from './deal-operational-overview.types'

type BlockerFactIconName = 'documents' | 'due' | 'investors' | 'owner' | 'surface'

export const BlockersSection = ({
  blockers,
  labels,
  summary,
}: {
  readonly blockers: readonly DealOperationalBlocker[]
  readonly labels: DealOperationalOverviewLabels
  readonly summary: string
}) => {
  const sectionId = useId()

  return (
    <section
      aria-labelledby={sectionId}
      className="grid content-start gap-4 p-5"
      data-slot="deal-operational-blockers"
    >
      <div className="grid gap-1">
        <h3 className="text-sm font-semibold text-card-foreground" id={sectionId}>
          {labels.blockersTitle}
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">{summary}</p>
      </div>
      {blockers.length > 0 ? (
        <ol className="grid gap-2">
          {blockers.map((blocker) => (
            <BlockerItem blocker={blocker} key={blocker.id} labels={labels} />
          ))}
        </ol>
      ) : (
        <p
          className="rounded-md border border-status-success-border bg-status-success-muted px-3 py-2 text-sm text-status-success"
          data-slot="deal-operational-no-blockers"
        >
          {labels.noBlockersLabel}
        </p>
      )}
    </section>
  )
}

const BlockerItem = ({
  blocker,
  labels,
}: {
  readonly blocker: DealOperationalBlocker
  readonly labels: DealOperationalOverviewLabels
}) => (
  <li>
    <article
      className="grid gap-3 rounded-md border border-border/70 bg-background/60 px-3 py-3"
      data-blocker-id={blocker.id}
      data-severity={blocker.severity}
      data-slot="deal-operational-blocker"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h4 className="text-sm font-semibold text-card-foreground">{blocker.title}</h4>
          <p className="text-sm leading-6 text-muted-foreground">{blocker.description}</p>
        </div>
        <Badge
          className={cn('justify-start', severityToneClasses[blocker.severity])}
          data-severity={blocker.severity}
          variant="outline"
        >
          {blocker.severityLabel}
        </Badge>
      </div>
      <dl className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
        <BlockerFact icon="owner" label={labels.blockerOwnerLabel} value={blocker.owner} />
        <BlockerFact
          icon="surface"
          label={labels.blockerSurfaceLabel}
          value={blocker.surfaceLabel}
        />
        {blocker.investorCountLabel ? (
          <BlockerFact
            icon="investors"
            label={labels.blockerInvestorsLabel}
            value={blocker.investorCountLabel}
          />
        ) : null}
        {blocker.documentCountLabel ? (
          <BlockerFact
            icon="documents"
            label={labels.blockerDocumentsLabel}
            value={blocker.documentCountLabel}
          />
        ) : null}
        {blocker.dueLabel ? (
          <BlockerFact icon="due" label={labels.blockerDueLabel} value={blocker.dueLabel} />
        ) : null}
      </dl>
    </article>
  </li>
)

const BlockerFact = ({
  icon,
  label,
  value,
}: {
  readonly icon: BlockerFactIconName
  readonly label: string
  readonly value: string
}) => (
  <div className="flex min-w-0 items-center gap-2">
    <BlockerFactIcon icon={icon} />
    <dt className="sr-only">{label}</dt>
    <dd className="min-w-0 truncate">{value}</dd>
  </div>
)

const BlockerFactIcon = ({ icon }: { readonly icon: BlockerFactIconName }) => {
  const className = 'size-3.5 shrink-0'

  return match(icon)
    .returnType<ReactNode>()
    .with('owner', () => <UserRound aria-hidden="true" className={className} />)
    .with('surface', () => <ListChecks aria-hidden="true" className={className} />)
    .with('documents', () => <FileCheck2 aria-hidden="true" className={className} />)
    .with('due', () => <Clock3 aria-hidden="true" className={className} />)
    .with('investors', () => <Landmark aria-hidden="true" className={className} />)
    .exhaustive()
}
