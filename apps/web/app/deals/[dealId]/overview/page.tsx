import { DealOperationalOverview } from '@repo/kit/deal-operational-overview'
import { notFound } from 'next/navigation'

import {
  dealOperationsRouteDataError,
  getDealOperationsData,
  isDealOperationsRouteNotFoundError,
} from '../data'
import { mapDealOperationalOverviewProps } from '../deal-operational-adapters'

type DealOverviewPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealOverviewPage({ params }: DealOverviewPageProps) {
  const { dealId } = await params
  const dataResult = getDealOperationsData(dealId)

  if (dataResult.isError()) {
    if (isDealOperationsRouteNotFoundError(dataResult.error)) {
      notFound()
    }

    throw dealOperationsRouteDataError(dataResult.error)
  }

  const data = dataResult.value
  return <DealOperationalOverview {...mapDealOperationalOverviewProps(data)} />
}
