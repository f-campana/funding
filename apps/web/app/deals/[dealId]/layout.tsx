import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { getDealOperationsData } from './data'
import { DealAppShell, type DealAppShellNavItem } from './deal-app-shell'
import { DealEntityHeader } from './deal-entity-header'
import { DealOperationalRail } from './deal-operational-rail'
import { DealTabs } from './deal-tabs'

type DealLayoutProps = {
  children: ReactNode
  params: Promise<{ dealId: string }>
}

export default async function DealLayout({ children, params }: DealLayoutProps) {
  const { dealId } = await params
  const data = getDealOperationsData(dealId)

  if (!data) {
    notFound()
  }

  const t = await getTranslations('DealLayout')
  const tabs = [
    { glyph: 'about', href: `/deals/${dealId}/about`, label: t('tabs.about'), segment: 'about' },
    {
      glyph: 'commitments',
      href: `/deals/${dealId}/commitments`,
      label: t('tabs.commitments'),
      segment: 'commitments',
    },
    {
      glyph: 'documents',
      href: `/deals/${dealId}/documents`,
      label: t('tabs.documents'),
      segment: 'documents',
    },
  ] satisfies readonly DealAppShellNavItem[]

  return (
    <DealAppShell
      dealId={dealId}
      header={
        <DealEntityHeader
          deal={data.deal}
          labels={{
            closingReview: t('closingReview'),
            lastUpdated: t('lastUpdated'),
            lifecycle: t('lifecycle'),
            vehicle: t('vehicle'),
            workspace: t('workspace'),
          }}
          tabs={<DealTabs ariaLabel={t('tabsLabel')} tabs={tabs} />}
        />
      }
      navItems={tabs}
      rail={<DealOperationalRail data={data} />}
      workspaceLabel={t('workspaceLabel')}
    >
      {children}
    </DealAppShell>
  )
}
