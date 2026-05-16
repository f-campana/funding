import type { CapitalReconciliationSummary } from '@repo/domain/reconciliation'
import { Card, CardContent, CardHeader, CardTitle, cn } from '@repo/ui'

import { MoneyDisplay } from '../money'

export type CapitalReconciliationPanelProps = {
  readonly summary: CapitalReconciliationSummary
  readonly labels: {
    readonly title: string
    readonly description?: string
    readonly target: string
    readonly committed: string
    readonly signed: string
    readonly received: string
    readonly matched: string
    readonly remaining: string
    readonly unmatched: string
    readonly unfunded: string
    readonly overTarget: string
  }
  readonly locale?: string
  readonly className?: string
}

export const CapitalReconciliationPanel = ({
  className,
  labels,
  locale = 'fr-FR',
  summary,
}: CapitalReconciliationPanelProps) => {
  const alertTone = summary.hasUnmatchedFunds
    ? 'border-status-attention-border text-status-attention bg-status-attention-muted'
    : 'border-status-success-border text-status-success bg-status-success-muted'

  return (
    <Card
      className={cn('gap-0 overflow-hidden py-0', className)}
      data-slot="capital-reconciliation-panel"
    >
      <CardHeader className="gap-2 border-b border-border p-4">
        <CardTitle>{labels.title}</CardTitle>
        {labels.description ? (
          <p className="text-sm leading-6 text-muted-foreground">{labels.description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <div className="grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-3">
          <AmountMetric label={labels.target} value={summary.targetAmountCents} locale={locale} />
          <AmountMetric
            label={labels.committed}
            value={summary.committedAmountCents}
            locale={locale}
          />
          <AmountMetric label={labels.signed} value={summary.signedAmountCents} locale={locale} />
          <AmountMetric
            label={labels.received}
            value={summary.receivedAmountCents}
            locale={locale}
          />
          <AmountMetric label={labels.matched} value={summary.matchedAmountCents} locale={locale} />
          <AmountMetric
            label={labels.remaining}
            value={summary.remainingToTargetCents}
            locale={locale}
          />
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-3">
          <SignalMetric
            className={alertTone}
            label={labels.unmatched}
            value={summary.unmatchedReceivedCents}
            locale={locale}
          />
          <SignalMetric
            className="border-border bg-status-pending-muted text-status-pending"
            label={labels.unfunded}
            value={summary.unfundedCommittedCents}
            locale={locale}
          />
          <SignalMetric
            className={
              summary.isOverTarget
                ? 'border-status-info-border bg-status-info-muted text-status-info'
                : 'border-status-success-border bg-status-success-muted text-status-success'
            }
            label={labels.overTarget}
            value={summary.overTargetCents}
            locale={locale}
          />
        </div>
      </CardContent>
    </Card>
  )
}

const AmountMetric = ({
  label,
  locale,
  value,
}: {
  readonly label: string
  readonly locale: string
  readonly value: CapitalReconciliationSummary['targetAmountCents']
}) => (
  <div className="grid gap-1 rounded-md border border-border bg-background p-3">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
      <MoneyDisplay amount={value} locale={locale} />
    </span>
  </div>
)

const SignalMetric = ({
  className,
  label,
  locale,
  value,
}: {
  readonly className: string
  readonly label: string
  readonly locale: string
  readonly value: CapitalReconciliationSummary['targetAmountCents']
}) => (
  <div className={cn('grid gap-1 rounded-md border p-3', className)}>
    <span className="text-xs font-medium">{label}</span>
    <span className="font-mono text-sm font-semibold tabular-nums">
      <MoneyDisplay amount={value} locale={locale} />
    </span>
  </div>
)
