import {
  DealProgressCard,
  type DealTerm,
  DealTermsPanel,
  InvestorStatusBreakdown,
  MoneyDisplay,
} from '@repo/kit'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'

import type { DealOperationsRouteData } from './data'
import { dealProgressLabels, investorStatusLabels } from './labels'

type DealOperationalRailProps = {
  readonly data: DealOperationsRouteData
}

export function DealOperationalRail({ data }: DealOperationalRailProps) {
  const capitalSummary = data.capitalSummariesByReadiness[data.readinessState]
  const blockers = data.closingBlockersByState[data.readinessState]
  const readinessCopy = data.readinessCopyByState[data.readinessState]
  const dealTerms = data.dealTerms.map(
    (term): DealTerm => ({
      ...term,
      value:
        term.value.kind === 'money' ? <MoneyDisplay amount={term.value.amount} /> : term.value.text,
    }),
  )

  return (
    <aside
      aria-label="Deal operational rail"
      className="grid content-start gap-3 lg:sticky lg:top-5"
      data-slot="deal-operational-rail"
    >
      <DealProgressCard
        committedAmount={capitalSummary.committedAmountCents}
        deadlineLabel={readinessCopy.deadline}
        labels={dealProgressLabels}
        lifecycleState={data.deal.lifecycleState}
        matchedAmount={capitalSummary.matchedAmountCents}
        nextActionLabel="Clear critical blockers before close review."
        supportingText={data.deal.description}
        targetAmount={capitalSummary.targetAmountCents}
        title="Deal progress"
      />
      <Card className="gap-0 overflow-hidden py-0" data-slot="deal-rail-readiness-card">
        <CardHeader className="gap-2 border-b border-border p-4">
          <CardTitle className="text-sm">Close readiness</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">{readinessCopy.title}</p>
        </CardHeader>
        <CardContent className="grid gap-3 p-4 text-sm">
          <RailMetric label="Active blockers" value={blockers.length.toString()} />
          <RailMetric
            label="Document gaps"
            value={(
              data.documentCompletenessSummary.requiredMissingCount +
              data.documentCompletenessSummary.requiredRejectedCount
            ).toString()}
          />
          <RailMetric
            label="Investor records"
            value={data.investorOperationsRecords.length.toString()}
          />
        </CardContent>
      </Card>
      <InvestorStatusBreakdown
        countLabel="investors"
        description="Closing blockers grouped by investor state."
        emptyLabel={investorStatusLabels.empty}
        items={data.investorStatusBreakdown}
        percentageLabel={investorStatusLabels.percentage}
        title="Investor status"
      />
      <DealTermsPanel terms={dealTerms} title="Deal terms" />
    </aside>
  )
}

const RailMetric = ({ label, value }: { readonly label: string; readonly value: string }) => (
  <div className="flex items-baseline justify-between gap-3 rounded-md border border-border bg-muted/45 px-3 py-2">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{value}</span>
  </div>
)
