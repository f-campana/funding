import { notFound } from 'next/navigation'

import { getDealOperationsData } from '../data'
import { DealAboutOverview } from '../deal-about-overview'

type DealAboutPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealAboutPage({ params }: DealAboutPageProps) {
  const { dealId } = await params
  const data = getDealOperationsData(dealId)

  if (!data) {
    notFound()
  }

  return <DealAboutOverview data={data} />
}
