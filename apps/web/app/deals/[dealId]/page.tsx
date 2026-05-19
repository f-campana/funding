import { notFound, redirect } from 'next/navigation'

import {
  dealOperationsRouteDataError,
  getDealOperationsData,
  isDealOperationsRouteNotFoundError,
} from './data'

type DealPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealPage({ params }: DealPageProps) {
  const { dealId } = await params
  const dataResult = getDealOperationsData(dealId)

  if (dataResult.isError()) {
    if (isDealOperationsRouteNotFoundError(dataResult.error)) {
      notFound()
    }

    throw dealOperationsRouteDataError(dataResult.error)
  }

  const data = dataResult.value
  redirect(`/deals/${data.deal.slug}/overview`)
}
