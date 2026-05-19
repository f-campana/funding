import { notFound, redirect } from 'next/navigation'

import { getDealOperationsData } from './data'

type DealPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealPage({ params }: DealPageProps) {
  const { dealId } = await params
  const data = getDealOperationsData(dealId)

  if (!data) {
    notFound()
  }

  redirect(`/deals/${data.deal.slug}/overview`)
}
