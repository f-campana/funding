import { DealOperationalOverview } from '@repo/kit'
import { notFound } from 'next/navigation'

import { getDealOperationsData } from '../data'
import { mapDealOperationalOverviewProps } from '../deal-operational-adapters'

type DealOverviewPageProps = {
  params: Promise<{ dealId: string }>
}

export default async function DealOverviewPage({ params }: DealOverviewPageProps) {
  const { dealId } = await params
  const data = getDealOperationsData(dealId)

  if (!data) {
    notFound()
  }

  return <DealOperationalOverview {...mapDealOperationalOverviewProps(data)} />
}
