import { Badge } from '@repo/ui/components/badge'
import { cn } from '@repo/ui/lib/utils'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import type { DealOperationsRouteData } from './data'
import { getDealHeaderViewModel } from './deal-operational-adapters'

type DealEntityHeaderProps = {
  readonly deal: DealOperationsRouteData['deal']
  readonly labels: {
    readonly closingReview: string
    readonly lastUpdated: string
    readonly lifecycle: string
    readonly vehicle: string
    readonly workspace: string
  }
  readonly tabs: ReactNode
}

export const DealEntityHeaderRoot = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'header'>) => (
  <header
    className={cn(
      'overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-card',
      className,
    )}
    data-slot="deal-entity-header"
    {...props}
  />
)

export const DealEntityHeaderHero = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn(
      'grid gap-4 border-b border-border bg-gradient-to-r from-card via-card to-muted/55 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end',
      className,
    )}
    {...props}
  />
)

export const DealEntityHeaderIdentity = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex min-w-0 gap-3', className)} {...props} />
)

export const DealEntityHeaderBrandMark = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    aria-hidden="true"
    className={cn(
      'flex size-12 shrink-0 items-center justify-center rounded-md border border-foreground/10 bg-foreground text-sm font-semibold text-background shadow-card',
      className,
    )}
    {...props}
  />
)

export const DealEntityHeaderCopy = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('grid min-w-0 gap-2', className)} {...props} />
)

export const DealEntityHeaderKicker = ({
  children,
  statusLabel,
}: {
  readonly children: ReactNode
  readonly statusLabel: string
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
      {children}
    </span>
    <Badge
      className="border-status-info-border bg-status-info-muted text-status-info"
      variant="outline"
    >
      {statusLabel}
    </Badge>
  </div>
)

export const DealEntityHeaderTitleBlock = ({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('grid gap-1', className)} {...props}>
    {children}
  </div>
)

export const DealEntityHeaderTitle = ({ className, ...props }: ComponentPropsWithoutRef<'h1'>) => (
  <h1
    className={cn('text-2xl font-semibold tracking-normal text-foreground sm:text-3xl', className)}
    {...props}
  />
)

export const DealEntityHeaderDescription = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'p'>) => (
  <p className={cn('max-w-3xl text-sm leading-6 text-muted-foreground', className)} {...props} />
)

export const DealEntityHeaderMetrics = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'dl'>) => (
  <dl
    className={cn(
      'grid gap-3 rounded-md border border-border bg-background/80 p-3 text-sm sm:grid-cols-3 lg:min-w-[28rem]',
      className,
    )}
    {...props}
  />
)

export const DealEntityHeaderMetric = ({
  label,
  value,
}: {
  readonly label: string
  readonly value: string
}) => (
  <div className="grid gap-1">
    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="font-semibold text-foreground">{value}</dd>
  </div>
)

export const DealEntityHeaderTabs = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('px-4 sm:px-5', className)} {...props} />
)

export const DealEntityHeaderLifecycleSummary = ({
  label,
  value,
}: {
  readonly label: string
  readonly value: string
}) => (
  <span className="sr-only">
    {label}: {value}
  </span>
)

const DealEntityHeaderView = ({ deal, labels, tabs }: DealEntityHeaderProps) => {
  const header = getDealHeaderViewModel(deal)

  return (
    <DealEntityHeaderRoot>
      <DealEntityHeaderHero>
        <DealEntityHeaderIdentity>
          <DealEntityHeaderBrandMark>NS</DealEntityHeaderBrandMark>
          <DealEntityHeaderCopy>
            <DealEntityHeaderKicker statusLabel={header.statusLabel}>
              {labels.workspace}
            </DealEntityHeaderKicker>
            <DealEntityHeaderTitleBlock>
              <DealEntityHeaderTitle>{header.title}</DealEntityHeaderTitle>
              <DealEntityHeaderDescription>{header.description}</DealEntityHeaderDescription>
            </DealEntityHeaderTitleBlock>
          </DealEntityHeaderCopy>
        </DealEntityHeaderIdentity>

        <DealEntityHeaderMetrics>
          <DealEntityHeaderMetric label={labels.vehicle} value={header.vehicleLabel} />
          <DealEntityHeaderMetric
            label={labels.closingReview}
            value={header.targetCloseDateLabel}
          />
          <DealEntityHeaderMetric label={labels.lastUpdated} value={header.lastUpdatedLabel} />
        </DealEntityHeaderMetrics>
      </DealEntityHeaderHero>
      <DealEntityHeaderTabs>{tabs}</DealEntityHeaderTabs>
      <DealEntityHeaderLifecycleSummary label={labels.lifecycle} value={header.statusLabel} />
    </DealEntityHeaderRoot>
  )
}

export const DealEntityHeader = Object.assign(DealEntityHeaderView, {
  BrandMark: DealEntityHeaderBrandMark,
  Copy: DealEntityHeaderCopy,
  Description: DealEntityHeaderDescription,
  Hero: DealEntityHeaderHero,
  Identity: DealEntityHeaderIdentity,
  Kicker: DealEntityHeaderKicker,
  LifecycleSummary: DealEntityHeaderLifecycleSummary,
  Metric: DealEntityHeaderMetric,
  Metrics: DealEntityHeaderMetrics,
  Root: DealEntityHeaderRoot,
  Tabs: DealEntityHeaderTabs,
  Title: DealEntityHeaderTitle,
  TitleBlock: DealEntityHeaderTitleBlock,
})
