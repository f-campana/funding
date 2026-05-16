import type { EuroCents } from '@repo/domain'
import { euroCentsToMinorUnits } from '@repo/domain'
import { Card, CardContent, CardHeader, CardTitle, cn } from '@repo/ui'
import type { ReactNode } from 'react'

import { MoneyDisplay } from '../money'

export type CommitmentProgressProps = {
  readonly committedAmount: EuroCents
  readonly targetAmount: EuroCents
  readonly remainingAmount?: EuroCents
  readonly investorCount: number
  readonly locale?: string
  readonly labels: {
    readonly title: string
    readonly committed: string
    readonly target: string
    readonly remaining?: string
    readonly investors: string
    readonly velocity?: string
  }
  readonly velocity?: ReactNode
  readonly className?: string
}

const DONUT_RADIUS = 42
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS

const calculatePercentage = (committedAmount: EuroCents, targetAmount: EuroCents) => {
  const committedMinorUnits = euroCentsToMinorUnits(committedAmount)
  const targetMinorUnits = euroCentsToMinorUnits(targetAmount)
  const basisPoints =
    targetMinorUnits === 0n ? 0n : (committedMinorUnits * 10_000n) / targetMinorUnits
  const cappedBasisPoints = basisPoints > 10_000n ? 10_000n : basisPoints < 0n ? 0n : basisPoints

  return Number(cappedBasisPoints) / 100
}

export const CommitmentProgress = ({
  className,
  committedAmount,
  investorCount,
  labels,
  locale = 'fr-FR',
  remainingAmount,
  targetAmount,
  velocity,
}: CommitmentProgressProps) => {
  const percentage = calculatePercentage(committedAmount, targetAmount)
  const normalizedPercentage = Number(percentage.toFixed(2))
  const strokeDashoffset = DONUT_CIRCUMFERENCE - (DONUT_CIRCUMFERENCE * percentage) / 100
  const percentageLabel = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(percentage)

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)} data-slot="commitment-progress">
      <CardHeader className="border-b border-border p-4">
        <CardTitle>{labels.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative size-36">
          <svg
            aria-label={labels.title}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={normalizedPercentage}
            className="size-36 -rotate-90"
            role="progressbar"
            viewBox="0 0 100 100"
          >
            <title>{`${labels.title}: ${percentageLabel}%`}</title>
            <circle
              className="text-muted"
              cx="50"
              cy="50"
              fill="none"
              r={DONUT_RADIUS}
              stroke="currentColor"
              strokeWidth="10"
            />
            <circle
              className="text-primary transition-all"
              cx="50"
              cy="50"
              fill="none"
              r={DONUT_RADIUS}
              stroke="currentColor"
              strokeDasharray={DONUT_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="10"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl font-semibold tabular-nums">{percentageLabel}%</span>
            <span className="text-xs font-medium text-muted-foreground">{labels.committed}</span>
          </div>
        </div>
        <dl className="grid gap-3 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">{labels.committed}</dt>
            <dd>
              <MoneyDisplay amount={committedAmount} locale={locale} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">{labels.target}</dt>
            <dd>
              <MoneyDisplay amount={targetAmount} locale={locale} />
            </dd>
          </div>
          {remainingAmount && labels.remaining ? (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">{labels.remaining}</dt>
              <dd>
                <MoneyDisplay amount={remainingAmount} locale={locale} />
              </dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">{labels.investors}</dt>
            <dd className="font-mono tabular-nums">{investorCount}</dd>
          </div>
          {velocity && labels.velocity ? (
            <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
              <dt className="text-muted-foreground">{labels.velocity}</dt>
              <dd className="font-mono text-sm font-medium tabular-nums text-foreground">
                {velocity}
              </dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  )
}
