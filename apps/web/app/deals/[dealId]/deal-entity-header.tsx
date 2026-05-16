import { Badge } from '@repo/ui'
import type { ReactNode } from 'react'

import type { DealOperationsRouteData } from './data'

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

export function DealEntityHeader({ deal, labels, tabs }: DealEntityHeaderProps) {
  return (
    <header
      className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-card"
      data-slot="deal-entity-header"
    >
      <div className="grid gap-4 border-b border-border bg-gradient-to-r from-card via-card to-muted/55 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="flex min-w-0 gap-3">
          <div
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-md border border-foreground/10 bg-foreground text-sm font-semibold text-background shadow-card"
          >
            NS
          </div>
          <div className="grid min-w-0 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                {labels.workspace}
              </span>
              <Badge
                className="border-status-info-border bg-status-info-muted text-status-info"
                variant="outline"
              >
                {deal.statusLabel}
              </Badge>
            </div>
            <div className="grid gap-1">
              <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
                {deal.title}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {deal.description}
              </p>
            </div>
          </div>
        </div>

        <dl className="grid gap-3 rounded-md border border-border bg-background/80 p-3 text-sm sm:grid-cols-3 lg:min-w-[28rem]">
          <HeaderMetric label={labels.vehicle} value={deal.vehicleLabel} />
          <HeaderMetric label={labels.closingReview} value={deal.closingReviewDateLabel} />
          <HeaderMetric label={labels.lastUpdated} value={deal.lastUpdatedLabel} />
        </dl>
      </div>
      <div className="px-4 sm:px-5">{tabs}</div>
      <span className="sr-only">
        {labels.lifecycle}: {deal.statusLabel}
      </span>
    </header>
  )
}

const HeaderMetric = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <div className="grid gap-1">
    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
    <dd className="font-semibold text-foreground">{value}</dd>
  </div>
)
