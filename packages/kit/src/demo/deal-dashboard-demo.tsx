'use client'

import type { SpvStatus } from '@repo/domain'
import { Card, CardContent, CardHeader, CardTitle, cn } from '@repo/ui'
import type { ComponentProps, ReactNode } from 'react'
import { useState, useSyncExternalStore } from 'react'

import { ActivityTimeline } from '../activity'
import { CommitmentProgress } from '../commitment'
import { type DealTerm, DealTermsPanel } from '../deal'
import { InvestorStatusBreakdown, TicketDistribution } from '../distribution'
import {
  northstarActivityItems,
  northstarCapitalSummariesByReadiness,
  northstarClosingBlockersByState,
  northstarDealFixture,
  northstarDealTerms,
  northstarInvestorRows,
  northstarInvestorStatusBreakdown,
  northstarReadinessCopyByState,
  northstarTicketDistribution,
} from '../fixtures'
import { InvestorRow, type InvestorRowProps } from '../investors'
import { MoneyDisplay } from '../money'
import {
  CapitalReconciliationPanel,
  ClosingBlockerQueue,
  type ClosingReadinessState,
  ClosingReadinessSummary,
} from '../readiness'
import { SpvStateTracker } from '../spv'

export type DealDashboardDemoProps = {
  readonly readinessState?: ClosingReadinessState
  readonly className?: string
}

const demoLabels = {
  activity: {
    empty: 'No recent activity.',
    title: 'Activity timeline',
  },
  commitment: {
    committed: 'Committed',
    investors: 'Investors',
    remaining: 'Remaining',
    target: 'Target',
    title: 'Commitment progress',
    velocity: '7 day movement',
  },
  blocker: {
    acknowledge: 'Acknowledge locally',
    acknowledged: 'Acknowledged locally',
    dueState: {
      due_soon: 'Due soon',
      due_today: 'Due today',
      no_due_date: 'No due date',
      on_track: 'On track',
      overdue: 'Overdue',
    },
    empty: 'No blockers for the next close.',
    hideDetails: 'Hide details',
    nextAction: 'Next action',
    owner: 'Owner',
    severity: {
      critical: 'Critical',
      info: 'Info',
      warning: 'Warning',
    },
    showDetails: 'Show details',
  },
  capital: {
    committed: 'Committed',
    description: 'Capital is separated by operational stage before the close.',
    matched: 'Matched',
    overTarget: 'Over target',
    received: 'Received',
    remaining: 'Remaining',
    signed: 'Signed',
    target: 'Target',
    title: 'Capital reconciliation',
    unfunded: 'Unfunded committed',
    unmatched: 'Unmatched received',
  },
  investor: {
    amount: 'Commitment',
    collapse: 'Collapse investor details',
    country: 'Country',
    entityType: 'Entity type',
    expand: 'Expand investor details',
    qualification: 'Qualification',
    qualificationType: {
      informed: 'Informed investor',
      non_eligible: 'Not eligible',
      professional: 'Professional investor',
    },
    status: {
      committed: 'Committed',
      invited: 'Invited',
      kyc_pending: 'KYC pending',
      reviewing: 'Reviewing',
      signed: 'Signed',
      wired: 'Wired',
    },
  },
  readiness: {
    blockers: 'blockers',
    closingDate: 'Closing review',
    deadline: 'Deadline',
    lastUpdated: 'Last updated',
    remaining: 'Remaining',
  },
  spv: {
    closed: 'Closed',
    collecting: 'Collecting',
    draft: 'Draft',
    e_signatures: 'E-signatures',
    incorporated: 'Incorporated',
    kyc_in_progress: 'KYC in progress',
    open: 'Open',
  },
  statusBreakdown: {
    count: (count: number) => `${count} ${count === 1 ? 'investor' : 'investors'}`,
    empty: 'No investor statuses yet.',
    percentage: 'Share',
    title: 'Investor status',
  },
  ticketDistribution: {
    amount: 'Amount',
    empty: 'No committed tickets yet.',
    investorCount: (count: number) => `${count} ${count === 1 ? 'investor' : 'investors'}`,
    percentage: 'Share',
    title: 'Ticket distribution',
  },
} as const satisfies {
  activity: {
    empty: string
    title: string
  }
  blocker: ComponentProps<typeof ClosingBlockerQueue>['labels']
  capital: ComponentProps<typeof CapitalReconciliationPanel>['labels']
  commitment: ComponentProps<typeof CommitmentProgress>['labels']
  investor: InvestorRowProps['labels']
  readiness: ComponentProps<typeof ClosingReadinessSummary>['labels']
  spv: Record<SpvStatus, string>
  statusBreakdown: {
    count: (count: number) => string
    empty: string
    percentage: string
    title: string
  }
  ticketDistribution: {
    amount: string
    empty: string
    investorCount: (count: number) => string
    percentage: string
    title: string
  }
}

const dealTerms = northstarDealTerms.map(
  (term): DealTerm => ({
    ...term,
    value:
      term.value.kind === 'money' ? <MoneyDisplay amount={term.value.amount} /> : term.value.text,
  }),
)

const subscribeToMediaQuery = (query: string, onStoreChange: () => void) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined
  }

  const mediaQueryList = window.matchMedia(query)
  mediaQueryList.addEventListener('change', onStoreChange)

  return () => mediaQueryList.removeEventListener('change', onStoreChange)
}

const getMediaQuerySnapshot = (query: string) => {
  if (typeof window === 'undefined') {
    return false
  }

  if (typeof window.matchMedia !== 'function') {
    return true
  }

  return window.matchMedia(query).matches
}

const useMediaQuery = (query: string) =>
  useSyncExternalStore(
    (onStoreChange) => subscribeToMediaQuery(query, onStoreChange),
    () => getMediaQuerySnapshot(query),
    () => false,
  )

const ResponsiveOnly = ({
  children,
  query,
}: {
  readonly children: ReactNode
  readonly query: string
}) => (useMediaQuery(query) ? children : null)

const SecondaryMobileSection = ({
  children,
  title,
}: {
  readonly children: ReactNode
  readonly title: string
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <details
      className="rounded-lg border border-border bg-card text-card-foreground shadow-card"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-foreground">
        {title}
      </summary>
      {isOpen ? <div className="border-t border-border p-4">{children}</div> : null}
    </details>
  )
}

export const DealDashboardDemo = ({
  className,
  readinessState = 'blocked',
}: DealDashboardDemoProps) => {
  const capitalSummary = northstarCapitalSummariesByReadiness[readinessState]
  const blockers = northstarClosingBlockersByState[readinessState]
  const copy = northstarReadinessCopyByState[readinessState]

  return (
    <section className={cn('grid gap-6', className)} data-slot="deal-dashboard-demo">
      <header className="grid gap-4 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-card lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-normal text-foreground">
              {northstarDealFixture.title}
            </h2>
            <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-primary">
              {northstarDealFixture.statusLabel}
            </span>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {northstarDealFixture.description}
          </p>
        </div>
        <dl className="grid gap-2 text-sm lg:text-right">
          <div className="grid gap-1">
            <dt className="text-muted-foreground">Closing review</dt>
            <dd className="font-medium text-foreground">
              {northstarDealFixture.closingReviewDateLabel}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-muted-foreground">Vehicle</dt>
            <dd className="font-medium text-foreground">{northstarDealFixture.vehicleLabel}</dd>
          </div>
        </dl>
      </header>

      <ClosingReadinessSummary
        blockerCount={blockers.length}
        closingDateLabel={northstarDealFixture.closingReviewDateLabel}
        deadlineLabel={copy.deadline}
        description={copy.description}
        labels={demoLabels.readiness}
        lastUpdatedLabel={northstarDealFixture.lastUpdatedLabel}
        remainingAmount={capitalSummary.remainingToTargetCents}
        state={readinessState}
        title={copy.title}
      />

      <div
        className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]"
        data-slot="deal-dashboard-layout"
      >
        <div className="grid content-start gap-4" data-slot="deal-dashboard-main">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.78fr)]">
            <ClosingBlockerQueue
              blockers={blockers}
              description="Top dependencies for the next closing action."
              labels={demoLabels.blocker}
              title="Closing blockers"
            />
            <CapitalReconciliationPanel labels={demoLabels.capital} summary={capitalSummary} />
          </div>

          <Card className="gap-0 overflow-hidden py-0" data-slot="investor-commitments-panel">
            <CardHeader className="border-b border-border p-4">
              <CardTitle>Investor commitments</CardTitle>
              <p className="text-sm text-muted-foreground">
                Record-style view of investor state, jurisdiction, qualification, and exact
                committed capital.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(12rem,1.4fr)_minmax(7rem,0.7fr)_minmax(9rem,1fr)_minmax(9rem,auto)_auto] md:items-center">
                <span>Investor</span>
                <span>Country</span>
                <span>Qualification</span>
                <span className="text-right">Commitment</span>
                <span aria-hidden="true" />
              </div>
              {northstarInvestorRows.map((investor) => (
                <InvestorRow investor={investor} key={investor.id} labels={demoLabels.investor} />
              ))}
            </CardContent>
          </Card>

          <ResponsiveOnly query="(max-width: 1023px)">
            <div className="grid gap-3" data-slot="deal-dashboard-mobile-secondary">
              <SecondaryMobileSection title={demoLabels.commitment.title}>
                <CommitmentProgress
                  committedAmount={capitalSummary.committedAmountCents}
                  investorCount={northstarInvestorRows.length}
                  labels={demoLabels.commitment}
                  remainingAmount={capitalSummary.remainingToTargetCents}
                  targetAmount={capitalSummary.targetAmountCents}
                  velocity="+3 records"
                />
              </SecondaryMobileSection>
              <SecondaryMobileSection title="SPV lifecycle">
                <SpvStateTracker
                  currentStatus={northstarDealFixture.spvStatus}
                  labels={demoLabels.spv}
                  variant="compact"
                />
              </SecondaryMobileSection>
              <SecondaryMobileSection title={demoLabels.ticketDistribution.title}>
                <TicketDistribution
                  amountLabel={demoLabels.ticketDistribution.amount}
                  description="Concentration by committed ticket size."
                  emptyLabel={demoLabels.ticketDistribution.empty}
                  investorCountLabel={demoLabels.ticketDistribution.investorCount}
                  percentageLabel={demoLabels.ticketDistribution.percentage}
                  segments={northstarTicketDistribution}
                  title={demoLabels.ticketDistribution.title}
                />
              </SecondaryMobileSection>
              <SecondaryMobileSection title={demoLabels.activity.title}>
                <ActivityTimeline
                  emptyLabel={demoLabels.activity.empty}
                  items={northstarActivityItems}
                  title={demoLabels.activity.title}
                />
              </SecondaryMobileSection>
              <SecondaryMobileSection title="Deal terms">
                <DealTermsPanel terms={dealTerms} title="Deal terms" />
              </SecondaryMobileSection>
            </div>
          </ResponsiveOnly>
        </div>

        <ResponsiveOnly query="(min-width: 1024px)">
          <aside className="grid content-start gap-4">
            <CommitmentProgress
              committedAmount={capitalSummary.committedAmountCents}
              investorCount={northstarInvestorRows.length}
              labels={demoLabels.commitment}
              remainingAmount={capitalSummary.remainingToTargetCents}
              targetAmount={capitalSummary.targetAmountCents}
              velocity="+3 records"
            />
            <TicketDistribution
              amountLabel={demoLabels.ticketDistribution.amount}
              description="Concentration by committed ticket size."
              emptyLabel={demoLabels.ticketDistribution.empty}
              investorCountLabel={demoLabels.ticketDistribution.investorCount}
              percentageLabel={demoLabels.ticketDistribution.percentage}
              segments={northstarTicketDistribution}
              title={demoLabels.ticketDistribution.title}
            />
            <Card className="gap-4 py-4" data-slot="spv-lifecycle-panel">
              <CardHeader className="px-4">
                <CardTitle>SPV lifecycle</CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <SpvStateTracker
                  currentStatus={northstarDealFixture.spvStatus}
                  labels={demoLabels.spv}
                  variant="compact"
                />
              </CardContent>
            </Card>
            <InvestorStatusBreakdown
              countLabel={demoLabels.statusBreakdown.count}
              description="Closing blockers grouped by investor state."
              emptyLabel={demoLabels.statusBreakdown.empty}
              items={northstarInvestorStatusBreakdown}
              percentageLabel={demoLabels.statusBreakdown.percentage}
              title={demoLabels.statusBreakdown.title}
            />
            <ActivityTimeline
              emptyLabel={demoLabels.activity.empty}
              items={northstarActivityItems}
              title={demoLabels.activity.title}
            />
            <DealTermsPanel terms={dealTerms} title="Deal terms" />
          </aside>
        </ResponsiveOnly>
      </div>
    </section>
  )
}
