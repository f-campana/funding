import { notFound, redirect } from 'next/navigation'

import { isSupportedDealId } from '../data'

type LegacyInvestorRouteRedirectProps = {
  params: Promise<{ dealId: string }>
}

export default async function LegacyInvestorRouteRedirectPage({
  params,
}: LegacyInvestorRouteRedirectProps) {
  const { dealId } = await params

  if (!isSupportedDealId(dealId)) {
    notFound()
  }

  redirect(`/deals/${dealId}/overview`)
}
