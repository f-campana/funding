import { notFound, redirect } from 'next/navigation'

import { getDealOperationsData } from '../data'

type LegacyInvestorRouteRedirectProps = {
  params: Promise<{ dealId: string }>
}

export default async function LegacyInvestorRouteRedirectPage({
  params,
}: LegacyInvestorRouteRedirectProps) {
  const { dealId } = await params
  const data = getDealOperationsData(dealId)

  if (!data) {
    notFound()
  }

  redirect(`/deals/${data.deal.slug}/overview`)
}
