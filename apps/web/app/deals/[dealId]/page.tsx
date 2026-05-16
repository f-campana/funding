import { notFound, redirect } from 'next/navigation'

import { isSupportedDealId } from './data'

type DealPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealPage({ params }: DealPageProps) {
  const { dealId } = await params

  if (!isSupportedDealId(dealId)) {
    notFound()
  }

  redirect(`/deals/${dealId}/about`)
}
