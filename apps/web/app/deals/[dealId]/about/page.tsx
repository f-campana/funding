import {
  ActivityTimeline,
  CapitalReconciliationPanel,
  ClosingBlockerQueue,
  ClosingReadinessSummary,
  DocumentCompletenessCard,
  MetricCard,
  MoneyDisplay,
} from '@repo/kit'
import { notFound } from 'next/navigation'
import { getDealOperationsData } from '../data'
import {
  activityLabels,
  blockerLabels,
  capitalLabels,
  documentLabels,
  readinessLabels,
} from '../labels'

type DealAboutPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealAboutPage({ params }: DealAboutPageProps) {
  const { dealId } = await params
  const data = getDealOperationsData(dealId)

  if (!data) {
    notFound()
  }

  const capitalSummary = data.capitalSummariesByReadiness[data.readinessState]
  const blockers = data.closingBlockersByState[data.readinessState]
  const readinessCopy = data.readinessCopyByState[data.readinessState]

  return (
    <div className="grid gap-4" data-slot="deal-about-route">
      <ClosingReadinessSummary
        blockerCount={blockers.length}
        closingDateLabel={data.deal.closingReviewDateLabel}
        deadlineLabel={readinessCopy.deadline}
        description={readinessCopy.description}
        labels={readinessLabels}
        lastUpdatedLabel={data.deal.lastUpdatedLabel}
        remainingAmount={capitalSummary.remainingToTargetCents}
        state={data.readinessState}
        title={readinessCopy.title}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Deal metrics">
        <MetricCard
          description="Total committed capital across operational records."
          emphasis="primary"
          label="Committed"
          value={<MoneyDisplay amount={capitalSummary.committedAmountCents} />}
        />
        <MetricCard
          description="Capital matched to the collection account."
          label="Matched"
          value={<MoneyDisplay amount={capitalSummary.matchedAmountCents} />}
        />
        <MetricCard
          description="Investor records in the current operating fixture."
          label="Investors"
          value={data.investorOperationsRecords.length}
        />
        <MetricCard
          description="Required documents still missing or rejected."
          label="Document gaps"
          value={
            data.documentCompletenessSummary.requiredMissingCount +
            data.documentCompletenessSummary.requiredRejectedCount
          }
        />
      </section>

      <div className="grid content-start gap-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.78fr)]">
          <ClosingBlockerQueue
            blockers={blockers}
            description="Top dependencies for the next closing action."
            labels={blockerLabels}
            title="Closing blockers"
          />
          <CapitalReconciliationPanel labels={capitalLabels} summary={capitalSummary} />
        </div>
        <DocumentCompletenessCard
          description="Document requirements across deal, investor, and legal entity owners."
          labels={documentLabels}
          requirements={data.documentRequirements}
          summary={data.documentCompletenessSummary}
          title="Document completeness"
        />
        <ActivityTimeline
          emptyLabel={activityLabels.empty}
          items={data.activityItems}
          title={activityLabels.title}
        />
      </div>
    </div>
  )
}
