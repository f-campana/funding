'use client'

import type { ChartConfig } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle, ChartContainer, cn } from '@repo/ui'
import type { ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

export type InvestorStatusBreakdownItem = {
  readonly id: string
  readonly label: string
  readonly count: number
  readonly percentageBasisPoints: number
}

export type InvestorStatusBreakdownProps = {
  readonly title: string
  readonly description?: string
  readonly items: readonly InvestorStatusBreakdownItem[]
  readonly emptyLabel?: string
  readonly locale?: string
  readonly countLabel?: string | ((count: number) => ReactNode)
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

const renderCountLabel = (count: number, label: InvestorStatusBreakdownProps['countLabel']) => {
  if (typeof label === 'function') {
    return label(count)
  }

  return label ? `${count} ${label}` : count
}

export const InvestorStatusBreakdown = ({
  className,
  countLabel,
  description,
  emptyLabel,
  items,
  locale = 'fr-FR',
  percentageLabel,
  title,
}: InvestorStatusBreakdownProps) => {
  const chartConfig = {
    count: {
      color: 'var(--chart-1)',
      label: title,
    },
  } satisfies ChartConfig
  const chartData = items.map((item, index) => ({
    count: item.count,
    fill: getChartColor(index),
    id: item.id,
    label: item.label,
  }))

  return (
    <Card className={cn('gap-4', className)} data-slot="investor-status-breakdown">
      <CardHeader className="gap-1">
        <CardTitle>{title}</CardTitle>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.length > 0 ? (
          <>
            <div data-slot="investor-status-breakdown-chart">
              <ChartContainer
                aria-label={title}
                className="h-28 w-full"
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
                  <XAxis allowDecimals={false} dataKey="count" hide type="number" />
                  <YAxis dataKey="label" hide type="category" />
                  <Bar dataKey="count" isAnimationActive={false} radius={[0, 4, 4, 0]}>
                    {chartData.map((entry) => (
                      <Cell fill={entry.fill} key={entry.id} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
            <div className="grid gap-2" data-slot="investor-status-breakdown-list">
              {items.map((item, index) => {
                const percentage = formatBasisPoints(item.percentageBasisPoints, locale)
                const width = `${toPercentage(item.percentageBasisPoints)}%`
                const barStyle = {
                  backgroundColor: getChartColor(index),
                  width,
                }

                return (
                  <div
                    className="grid gap-2"
                    data-slot="investor-status-breakdown-item"
                    key={item.id}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {renderCountLabel(item.count, countLabel)}
                        </p>
                      </div>
                      <div className="font-mono text-sm font-medium tabular-nums text-foreground">
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
                        data-slot="investor-status-breakdown-bar"
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
