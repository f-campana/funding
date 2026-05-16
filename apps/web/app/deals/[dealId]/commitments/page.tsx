import { MetricCard, MoneyDisplay } from '@repo/kit'
import { notFound } from 'next/navigation'

import { getDealOperationsData } from '../data'
import { CommitmentsClient } from './commitments-client'

type DealCommitmentsPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealCommitmentsPage({ params }: DealCommitmentsPageProps) {
  const { dealId } = await params
  const data = getDealOperationsData(dealId)

  if (!data) {
    notFound()
  }

  const capitalSummary = data.capitalSummariesByReadiness[data.readinessState]
  const blockedRecords = data.investorOperationsRecords.filter(
    (record) => record.blockerIds.length > 0,
  )
  const signedOrFundedRecords = data.investorOperationsRecords.filter((record) =>
    ['signed', 'wired', 'reconciled'].includes(record.commitmentStatus),
  )

  return (
    <div className="grid gap-4" data-slot="deal-commitments-route">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Commitment metrics">
        <MetricCard
          description="Investor commitments currently tracked for this deal."
          emphasis="primary"
          label="Committed"
          value={<MoneyDisplay amount={capitalSummary.committedAmountCents} />}
        />
        <MetricCard
          description="Records with signature or wire progress."
          label="Signed or funded"
          value={signedOrFundedRecords.length}
        />
        <MetricCard
          description="Investor records linked to unresolved operational blockers."
          label="Blocked records"
          value={blockedRecords.length}
        />
        <MetricCard
          description="Capital matched to investor references."
          label="Matched"
          value={<MoneyDisplay amount={capitalSummary.matchedAmountCents} />}
        />
      </section>

      <CommitmentsClient dealId={dealId} />
    </div>
  )
}
