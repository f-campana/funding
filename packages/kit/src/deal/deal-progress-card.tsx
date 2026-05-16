import {
  type DealLifecycleState,
  type EuroCents,
  euroCentsToMinorUnits,
  getDealLifecycleLabel,
  getDealLifecycleTone,
  type StatusTone,
} from '@repo/domain'
import { Badge, Card, CardContent, CardHeader, CardTitle, cn, Progress } from '@repo/ui'
import type { ReactNode } from 'react'

import { MoneyDisplay } from '../money'
import { statusToneClasses } from '../status/status-tone'

export type DealProgressCardProps = {
  readonly title: string
  readonly lifecycleState: DealLifecycleState
  readonly targetAmount: EuroCents
  readonly committedAmount: EuroCents
  readonly matchedAmount: EuroCents
  readonly deadlineLabel: string
  readonly nextActionLabel: string
  readonly labels: {
    readonly lifecycle: string
    readonly target: string
    readonly committed: string
    readonly matched: string
    readonly progress: string
    readonly deadline: string
    readonly nextAction: string
  }
  readonly lifecycleLabel?: string
  readonly lifecycleTone?: StatusTone
  readonly supportingText?: ReactNode
  readonly locale?: string
  readonly className?: string
}

const progressPercent = (
  committedAmount: DealProgressCardProps['committedAmount'],
  targetAmount: DealProgressCardProps['targetAmount'],
) => {
  const committedMinorUnits = euroCentsToMinorUnits(committedAmount)
  const targetMinorUnits = euroCentsToMinorUnits(targetAmount)

  if (targetMinorUnits === 0n) {
    return 0
  }

  const basisPoints = (committedMinorUnits * 10_000n) / targetMinorUnits
  const cappedBasisPoints = basisPoints > 10_000n ? 10_000n : basisPoints < 0n ? 0n : basisPoints

  return Number(cappedBasisPoints) / 100
}

export const DealProgressCard = ({
  className,
  committedAmount,
  deadlineLabel,
  labels,
  lifecycleLabel,
  lifecycleState,
  lifecycleTone,
  locale = 'fr-FR',
  matchedAmount,
  nextActionLabel,
  supportingText,
  targetAmount,
  title,
}: DealProgressCardProps) => {
  const tone = lifecycleTone ?? getDealLifecycleTone(lifecycleState)
  const statusLabel = lifecycleLabel ?? getDealLifecycleLabel(lifecycleState)
  const percentage = progressPercent(committedAmount, targetAmount)
  const percentageLabel = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(percentage)

  return (
    <Card
      className={cn(
        'gap-0 overflow-hidden border-foreground/15 bg-foreground py-0 text-background shadow-card',
        className,
      )}
      data-slot="deal-progress-card"
    >
      <CardHeader className="gap-4 border-b border-background/15 p-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-background">{title}</CardTitle>
          <Badge className={statusToneClasses[tone]} variant="outline">
            {statusLabel}
          </Badge>
        </div>
        {supportingText ? (
          <p className="text-sm leading-6 text-background/70">{supportingText}</p>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <div className="grid gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-medium text-background/65">{labels.progress}</span>
            <span className="font-mono text-xl font-semibold tabular-nums text-background">
              {percentageLabel}%
            </span>
          </div>
          <Progress
            aria-label={labels.progress}
            className="h-2.5 bg-background/20 [&_[data-slot=progress-indicator]]:bg-status-success-border"
            value={percentage}
          />
        </div>
        <dl className="grid gap-2.5 text-sm">
          <ProgressMetric label={labels.committed}>
            <MoneyDisplay amount={committedAmount} locale={locale} />
          </ProgressMetric>
          <ProgressMetric label={labels.target}>
            <MoneyDisplay amount={targetAmount} locale={locale} />
          </ProgressMetric>
          <ProgressMetric label={labels.matched}>
            <MoneyDisplay amount={matchedAmount} locale={locale} />
          </ProgressMetric>
          <ProgressMetric label={labels.deadline}>{deadlineLabel}</ProgressMetric>
        </dl>
        <div className="grid gap-1 rounded-md border border-background/15 bg-background/10 p-3">
          <span className="text-xs font-medium text-background/65">{labels.nextAction}</span>
          <span className="text-sm font-semibold text-background">{nextActionLabel}</span>
        </div>
        <span className="sr-only">
          {labels.lifecycle}: {statusLabel}
        </span>
      </CardContent>
    </Card>
  )
}

const ProgressMetric = ({
  children,
  label,
}: {
  readonly children: ReactNode
  readonly label: string
}) => (
  <div className="flex items-baseline justify-between gap-4">
    <dt className="text-background/65">{label}</dt>
    <dd className="font-medium text-background">{children}</dd>
  </div>
)
