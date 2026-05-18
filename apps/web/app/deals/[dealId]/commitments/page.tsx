import { notFound } from 'next/navigation'

import { getDealOperationsData } from '../data'
import { mapDealCommitmentInspectorViewModel } from '../deal-commitment-inspector-adapter'
import { mapDealCommitmentsTableViewModel } from '../deal-commitments-table-adapter'
import { CommitmentsWorkspace } from './commitments-workspace'

type DealCommitmentsPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealCommitmentsPage({ params }: DealCommitmentsPageProps) {
  const { dealId } = await params
  const data = getDealOperationsData(dealId)

  if (!data) {
    notFound()
  }

  return (
    <CommitmentsWorkspace
      inspector={mapDealCommitmentInspectorViewModel(data)}
      table={mapDealCommitmentsTableViewModel(data)}
    />
  )
}
