import { notFound } from 'next/navigation'

import {
  dealOperationsRouteDataError,
  getDealOperationsData,
  isDealOperationsRouteNotFoundError,
} from '../data'
import { mapDealCommitmentInspectorViewModel } from '../deal-commitment-inspector-adapter'
import { mapDealCommitmentsTableViewModel } from '../deal-commitments-table-adapter'
import { CommitmentsWorkspace } from './commitments-workspace'

type DealCommitmentsPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealCommitmentsPage({ params }: DealCommitmentsPageProps) {
  const { dealId } = await params
  const dataResult = getDealOperationsData(dealId)

  if (dataResult.isError()) {
    if (isDealOperationsRouteNotFoundError(dataResult.error)) {
      notFound()
    }

    throw dealOperationsRouteDataError(dataResult.error)
  }

  const data = dataResult.value
  return (
    <CommitmentsWorkspace
      inspector={mapDealCommitmentInspectorViewModel(data)}
      table={mapDealCommitmentsTableViewModel(data)}
    />
  )
}
