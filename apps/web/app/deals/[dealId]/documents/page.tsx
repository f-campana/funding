import { DocumentCompletenessCard, MetricCard } from '@repo/kit'
import { notFound } from 'next/navigation'

import { getDealOperationsData } from '../data'
import { documentLabels } from '../labels'

type DealDocumentsPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealDocumentsPage({ params }: DealDocumentsPageProps) {
  const { dealId } = await params
  const data = getDealOperationsData(dealId)

  if (!data) {
    notFound()
  }

  return (
    <div className="grid gap-4" data-slot="deal-documents-route">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Document metrics">
        <MetricCard
          description="Required documents accepted for closing operations."
          emphasis="primary"
          label="Approved"
          value={`${data.documentCompletenessSummary.approvedCount}/${data.documentCompletenessSummary.requiredCount}`}
        />
        <MetricCard
          description="Required documents that have not been uploaded."
          label="Missing"
          value={data.documentCompletenessSummary.requiredMissingCount}
        />
        <MetricCard
          description="Required documents rejected by operations review."
          label="Rejected"
          value={data.documentCompletenessSummary.requiredRejectedCount}
        />
        <MetricCard
          description="Documents currently awaiting review."
          label="Under review"
          value={data.documentCompletenessSummary.underReviewCount}
        />
      </section>

      <DocumentCompletenessCard
        description="Deal, investor, and legal entity requirements needed for closing operations."
        labels={documentLabels}
        requirements={data.documentRequirements}
        summary={data.documentCompletenessSummary}
        title="Document completeness"
      />
    </div>
  )
}
