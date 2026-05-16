import type { EuroCents } from '@repo/domain'
import { Card, CardContent, CardHeader, CardTitle, cn } from '@repo/ui'
import type { ReactNode } from 'react'

import { MoneyDisplay } from '../money'

export type ClosingReadinessState = 'ready' | 'attention' | 'blocked' | 'not_started'

export type ClosingReadinessSummaryProps = {
  readonly state: ClosingReadinessState
  readonly title: string
  readonly description: string
  readonly blockerCount: number
  readonly closingDateLabel: string
  readonly deadlineLabel: string
  readonly remainingAmount: EuroCents
  readonly lastUpdatedLabel: string
  readonly labels: {
    readonly blockers: string
    readonly closingDate: string
    readonly deadline: string
    readonly remaining: string
    readonly lastUpdated: string
  }
  readonly locale?: string
  readonly className?: string
}

const stateClasses: Record<ClosingReadinessState, string> = {
  attention: 'border-readiness-attention-border',
  blocked: 'border-readiness-blocked-border',
  not_started: 'border-readiness-not-started-border',
  ready: 'border-readiness-ready-border',
}

const badgeClasses: Record<ClosingReadinessState, string> = {
  attention:
    'border-readiness-attention-border bg-readiness-attention-muted text-readiness-attention',
  blocked: 'border-readiness-blocked-border bg-readiness-blocked-muted text-readiness-blocked',
  not_started:
    'border-readiness-not-started-border bg-readiness-not-started-muted text-readiness-not-started',
  ready: 'border-readiness-ready-border bg-readiness-ready-muted text-readiness-ready',
}

export const ClosingReadinessSummary = ({
  blockerCount,
  className,
  closingDateLabel,
  deadlineLabel,
  description,
  labels,
  lastUpdatedLabel,
  locale = 'fr-FR',
  remainingAmount,
  state,
  title,
}: ClosingReadinessSummaryProps) => (
  <Card
    className={cn('overflow-hidden border py-0 shadow-card', stateClasses[state], className)}
    data-slot="closing-readiness-summary"
    data-state={state}
  >
    <CardHeader className="gap-3 p-5">
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="grid gap-2">
          <CardTitle className="text-xl font-semibold tracking-normal text-foreground">
            {title}
          </CardTitle>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div
          className={cn('rounded-md border px-3 py-2 text-sm font-semibold', badgeClasses[state])}
        >
          {blockerCount} {labels.blockers}
        </div>
      </div>
    </CardHeader>
    <CardContent className="grid gap-3 border-t border-border bg-muted/40 p-4 text-sm text-card-foreground sm:grid-cols-2 lg:grid-cols-4">
      <SummaryMetric label={labels.closingDate} value={closingDateLabel} />
      <SummaryMetric label={labels.deadline} value={deadlineLabel} />
      <SummaryMetric
        label={labels.remaining}
        value={<MoneyDisplay amount={remainingAmount} locale={locale} />}
      />
      <SummaryMetric label={labels.lastUpdated} value={lastUpdatedLabel} />
    </CardContent>
  </Card>
)

const SummaryMetric = ({ label, value }: { readonly label: string; readonly value: ReactNode }) => (
  <div className="grid gap-1">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground">{value}</span>
  </div>
)
