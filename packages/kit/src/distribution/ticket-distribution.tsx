'use client'

import type { EuroCents } from '@repo/domain'
import type { ChartConfig } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle, ChartContainer, cn } from '@repo/ui'
import type { ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import { MoneyDisplay } from '../money'

export type TicketDistributionSegment = {
  readonly id: string
  readonly label: string
  readonly amount: EuroCents
  readonly investorCount: number
  readonly percentageBasisPoints: number
}

export type TicketDistributionProps = {
  readonly title: string
  readonly description?: string
  readonly segments: readonly TicketDistributionSegment[]
  readonly locale?: string
  readonly emptyLabel?: string
  readonly amountLabel?: string
  readonly investorCountLabel?: string | ((count: number) => ReactNode)
  readonly percentageLabel?: string
  readonly className?: string
}

const chartColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const

const getChartColor = (index: number) => chartColors[index % chartColors.length] ?? 'var(--chart-1)'

const toPercentage = (basisPoints: number) => Math.max(0, Math.min(100, basisPoints / 100))

const formatBasisPoints = (basisPoints: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(toPercentage(basisPoints))

const renderCountLabel = (count: number, label: TicketDistributionProps['investorCountLabel']) => {
  if (typeof label === 'function') {
    return label(count)
  }

  return label ? `${count} ${label}` : count
}

export const TicketDistribution = ({
  amountLabel,
  className,
  description,
  emptyLabel,
  investorCountLabel,
  locale = 'fr-FR',
  percentageLabel,
  segments,
  title,
}: TicketDistributionProps) => {
  const chartConfig = {
    percentage: {
      color: 'var(--chart-1)',
      label: title,
    },
  } satisfies ChartConfig
  const chartData = segments.map((segment, index) => ({
    fill: getChartColor(index),
    id: segment.id,
    label: segment.label,
    percentage: toPercentage(segment.percentageBasisPoints),
  }))

  return (
    <Card className={cn('gap-4', className)} data-slot="ticket-distribution">
      <CardHeader className="gap-1">
        <CardTitle>{title}</CardTitle>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className="grid gap-4">
        {segments.length > 0 ? (
          <>
            <div data-slot="ticket-distribution-chart">
              <ChartContainer
                aria-label={title}
                className="h-32 w-full"
                config={chartConfig}
                role="img"
              >
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  layout="vertical"
                  margin={{ bottom: 4, left: 0, right: 0, top: 4 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis dataKey="percentage" domain={[0, 100]} hide type="number" />
                  <YAxis dataKey="label" hide type="category" />
                  <Bar dataKey="percentage" isAnimationActive={false} radius={[0, 4, 4, 0]}>
                    {chartData.map((entry) => (
                      <Cell fill={entry.fill} key={entry.id} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
            <div className="grid gap-3" data-slot="ticket-distribution-list">
              {segments.map((segment, index) => {
                const percentage = formatBasisPoints(segment.percentageBasisPoints, locale)
                const width = `${toPercentage(segment.percentageBasisPoints)}%`
                const barStyle = {
                  backgroundColor: getChartColor(index),
                  width,
                }

                return (
                  <div
                    className="grid gap-2"
                    data-slot="ticket-distribution-segment"
                    key={segment.id}
                  >
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-baseline">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {segment.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {renderCountLabel(segment.investorCount, investorCountLabel)}
                        </p>
                      </div>
                      <div className="grid gap-1 sm:text-right">
                        {amountLabel ? (
                          <span className="text-xs text-muted-foreground">{amountLabel}</span>
                        ) : null}
                        <MoneyDisplay amount={segment.amount} locale={locale} />
                      </div>
                      <div className="font-mono text-sm font-medium tabular-nums text-foreground sm:text-right">
                        {percentageLabel ? (
                          <span className="sr-only">{percentageLabel}: </span>
                        ) : null}
                        {percentage}%
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        aria-hidden="true"
                        className="h-full rounded-full"
                        data-slot="ticket-distribution-bar"
                        style={barStyle}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
