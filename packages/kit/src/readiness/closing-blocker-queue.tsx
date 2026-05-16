'use client'

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn } from '@repo/ui'
import { Check, ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'

export type ClosingBlockerSeverity = 'critical' | 'warning' | 'info'
export type ClosingBlockerKind =
  | 'kyc'
  | 'kyb'
  | 'subscription_document'
  | 'wire'
  | 'payment_match'
  | 'qualification'
  | 'deadline'
  | 'lifecycle'
  | 'audit_file'
export type ClosingOwner =
  | 'operations'
  | 'compliance'
  | 'finance'
  | 'legal'
  | 'deal_lead'
  | 'investor'
  | 'system'
export type ClosingDueState = 'overdue' | 'due_today' | 'due_soon' | 'on_track' | 'no_due_date'

export type ClosingBlocker = {
  readonly id: string
  readonly severity: ClosingBlockerSeverity
  readonly kind: ClosingBlockerKind
  readonly title: string
  readonly detail: string
  readonly nextAction: string
  readonly owner: ClosingOwner
  readonly dueState: ClosingDueState
  readonly investorName?: string
  readonly reference?: string
}

export type ClosingBlockerQueueProps = {
  readonly title: string
  readonly description?: string
  readonly blockers: readonly ClosingBlocker[]
  readonly labels: {
    readonly empty: string
    readonly owner: string
    readonly nextAction: string
    readonly dueState: Record<ClosingDueState, string>
    readonly severity: Record<ClosingBlockerSeverity, string>
    readonly acknowledge: string
    readonly acknowledged: string
    readonly showDetails: string
    readonly hideDetails: string
  }
  readonly className?: string
}

const severityRank: Record<ClosingBlockerSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

const dueRank: Record<ClosingDueState, number> = {
  overdue: 0,
  due_today: 1,
  due_soon: 2,
  on_track: 3,
  no_due_date: 4,
}

const severityClasses: Record<ClosingBlockerSeverity, string> = {
  critical: 'border-status-danger-border text-status-danger bg-status-danger-muted',
  info: 'border-status-info-border text-status-info bg-status-info-muted',
  warning: 'border-status-attention-border text-status-attention bg-status-attention-muted',
}

const toggleSetValue = (values: ReadonlySet<string>, id: string) => {
  const next = new Set(values)

  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }

  return next
}

export const ClosingBlockerQueue = ({
  blockers,
  className,
  description,
  labels,
  title,
}: ClosingBlockerQueueProps) => {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set())
  const [acknowledgedIds, setAcknowledgedIds] = useState<ReadonlySet<string>>(() => new Set())
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const sortedBlockers = useMemo(
    () =>
      [...blockers].sort(
        (first, second) =>
          severityRank[first.severity] - severityRank[second.severity] ||
          dueRank[first.dueState] - dueRank[second.dueState] ||
          first.title.localeCompare(second.title),
      ),
    [blockers],
  )

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)} data-slot="closing-blocker-queue">
      <CardHeader className="gap-2 border-b border-border bg-card p-4">
        <CardTitle>{title}</CardTitle>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {sortedBlockers.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <ol className="grid">
            {sortedBlockers.map((blocker) => (
              <BlockerQueueItem
                blocker={blocker}
                isAcknowledged={acknowledgedIds.has(blocker.id)}
                isExpanded={expandedIds.has(blocker.id)}
                isSelected={selectedId === blocker.id}
                key={blocker.id}
                labels={labels}
                onAcknowledge={() => {
                  setSelectedId(blocker.id)
                  setAcknowledgedIds((current) => toggleSetValue(current, blocker.id))
                }}
                onToggleDetails={() => {
                  setSelectedId(blocker.id)
                  setExpandedIds((current) => toggleSetValue(current, blocker.id))
                }}
              />
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

type BlockerQueueItemProps = {
  readonly blocker: ClosingBlocker
  readonly isAcknowledged: boolean
  readonly isExpanded: boolean
  readonly isSelected: boolean
  readonly labels: ClosingBlockerQueueProps['labels']
  readonly onAcknowledge: () => void
  readonly onToggleDetails: () => void
}

const BlockerQueueItem = ({
  blocker,
  isAcknowledged,
  isExpanded,
  isSelected,
  labels,
  onAcknowledge,
  onToggleDetails,
}: BlockerQueueItemProps) => {
  const detailsId = `closing-blocker-${blocker.id}-details`

  return (
    <li
      className={cn(
        'grid gap-3 border-b border-border px-4 py-3.5 last:border-b-0',
        isSelected ? 'bg-muted' : 'bg-card hover:bg-muted/50',
      )}
      data-acknowledged={isAcknowledged ? 'true' : 'false'}
      data-selected={isSelected ? 'true' : 'false'}
      data-slot="closing-blocker-item"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid min-w-0 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={severityClasses[blocker.severity]} variant="outline">
              {labels.severity[blocker.severity]}
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">
              {labels.dueState[blocker.dueState]}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-foreground">{blocker.title}</h3>
          {blocker.investorName ? (
            <p className="text-sm text-muted-foreground">{blocker.investorName}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            aria-pressed={isAcknowledged}
            onClick={onAcknowledge}
            size="sm"
            variant={isAcknowledged ? 'secondary' : 'outline'}
          >
            <Check aria-hidden="true" className="size-4" />
            {isAcknowledged ? labels.acknowledged : labels.acknowledge}
          </Button>
          <Button
            aria-controls={detailsId}
            aria-expanded={isExpanded}
            onClick={onToggleDetails}
            size="sm"
            variant="ghost"
          >
            <ChevronDown
              aria-hidden="true"
              className={cn('size-4 transition-transform', isExpanded ? 'rotate-180' : null)}
            />
            {isExpanded ? labels.hideDetails : labels.showDetails}
          </Button>
        </div>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="grid gap-1">
          <dt className="text-xs font-medium text-muted-foreground">{labels.owner}</dt>
          <dd className="font-medium text-foreground">{blocker.owner}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-xs font-medium text-muted-foreground">{labels.nextAction}</dt>
          <dd className="font-medium text-foreground">{blocker.nextAction}</dd>
        </div>
      </dl>
      {isExpanded ? (
        <div
          className="grid gap-2 rounded-md border border-border bg-background p-3 text-sm leading-6 text-foreground"
          id={detailsId}
        >
          <p>{blocker.detail}</p>
          {blocker.reference ? (
            <p className="text-xs font-medium text-muted-foreground">{blocker.reference}</p>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
