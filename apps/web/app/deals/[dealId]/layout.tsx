import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import {
  dealOperationsRouteDataError,
  getDealOperationsData,
  isDealOperationsRouteNotFoundError,
} from './data'
import {
  DealAppShell,
  DealAppShellLeftRail,
  DealAppShellLogo,
  DealAppShellNav,
  DealAppShellNavGlyph,
  type DealAppShellNavItem,
  DealAppShellNavLink,
  DealAppShellVersionBadge,
} from './deal-app-shell'
import { DealEntityHeader } from './deal-entity-header'
import {
  getDealHeaderViewModel,
  getDealOperationalRailViewModel,
} from './deal-operational-adapters'
import {
  DealOperationalRail,
  DealOperationalRailCard,
  DealOperationalRailMetric,
  DealOperationalRailMetrics,
} from './deal-operational-rail'
import { DealTabLink, DealTabsRoot } from './deal-tabs'

type DealLayoutProps = {
  children: ReactNode
  params: Promise<{ dealId: string }>
}

export default async function DealLayout({ children, params }: DealLayoutProps) {
  const { dealId } = await params
  const dataResult = getDealOperationsData(dealId)

  if (dataResult.isError()) {
    if (isDealOperationsRouteNotFoundError(dataResult.error)) {
      notFound()
    }

    throw dealOperationsRouteDataError(dataResult.error)
  }

  const data = dataResult.value
  const routeDealId = data.deal.slug
  const t = await getTranslations('DealLayout')
  const entityHeader = getDealHeaderViewModel(data.deal)
  const operationalRail = getDealOperationalRailViewModel(data)
  const tabs = [
    {
      glyph: 'overview',
      href: `/deals/${routeDealId}/overview`,
      label: t('tabs.overview'),
      segment: 'overview',
    },
    {
      glyph: 'commitments',
      href: `/deals/${routeDealId}/commitments`,
      label: t('tabs.commitments'),
      segment: 'commitments',
    },
    {
      glyph: 'documents',
      href: `/deals/${routeDealId}/documents`,
      label: t('tabs.documents'),
      segment: 'documents',
    },
  ] satisfies readonly DealAppShellNavItem[]

  return (
    <DealAppShell
      header={
        <DealEntityHeader.Root>
          <DealEntityHeader.Hero>
            <DealEntityHeader.Identity>
              <DealEntityHeader.BrandMark>NS</DealEntityHeader.BrandMark>
              <DealEntityHeader.Copy>
                <DealEntityHeader.Kicker statusLabel={entityHeader.statusLabel}>
                  {t('workspace')}
                </DealEntityHeader.Kicker>
                <DealEntityHeader.TitleBlock>
                  <DealEntityHeader.Title>{entityHeader.title}</DealEntityHeader.Title>
                  <DealEntityHeader.Description>
                    {entityHeader.description}
                  </DealEntityHeader.Description>
                </DealEntityHeader.TitleBlock>
              </DealEntityHeader.Copy>
            </DealEntityHeader.Identity>

            <DealEntityHeader.Metrics>
              <DealEntityHeader.Metric label={t('vehicle')} value={entityHeader.vehicleLabel} />
              <DealEntityHeader.Metric
                label={t('closingReview')}
                value={entityHeader.targetCloseDateLabel}
              />
              <DealEntityHeader.Metric
                label={t('lastUpdated')}
                value={entityHeader.lastUpdatedLabel}
              />
            </DealEntityHeader.Metrics>
          </DealEntityHeader.Hero>
          <DealEntityHeader.Tabs>
            <DealTabsRoot aria-label={t('tabsLabel')}>
              {tabs.map((tab) => (
                <DealTabLink href={tab.href} key={tab.href} segment={tab.segment}>
                  {tab.label}
                </DealTabLink>
              ))}
            </DealTabsRoot>
          </DealEntityHeader.Tabs>
          <DealEntityHeader.LifecycleSummary
            label={t('lifecycle')}
            value={entityHeader.statusLabel}
          />
        </DealEntityHeader.Root>
      }
      leftRail={
        <DealAppShellLeftRail aria-label={t('workspaceLabel')}>
          <DealAppShellLogo
            aria-label={t('workspaceLabel')}
            href={`/deals/${routeDealId}/overview`}
          >
            NS
          </DealAppShellLogo>
          <DealAppShellNav aria-label={t('workspaceLabel')}>
            {tabs.map((tab) => (
              <DealAppShellNavLink
                href={tab.href}
                key={tab.href}
                label={tab.label}
                segment={tab.segment}
              >
                <DealAppShellNavGlyph glyph={tab.glyph} />
              </DealAppShellNavLink>
            ))}
          </DealAppShellNav>
          <DealAppShellVersionBadge>V1</DealAppShellVersionBadge>
        </DealAppShellLeftRail>
      }
      rail={
        <DealOperationalRail data={data}>
          <DealOperationalRailCard title="Operational snapshot">
            <DealOperationalRailMetrics>
              <DealOperationalRailMetric label="Readiness" value={operationalRail.readinessLabel} />
              <DealOperationalRailMetric
                label="Target close"
                value={operationalRail.targetCloseDateLabel}
              />
              <DealOperationalRailMetric
                label={operationalRail.capitalCalloutLabel}
                value={operationalRail.capitalCalloutValueLabel}
              />
            </DealOperationalRailMetrics>
          </DealOperationalRailCard>
          <DealOperationalRailCard title="Exception queue">
            <DealOperationalRailMetrics>
              <DealOperationalRailMetric
                label="Critical blockers"
                value={operationalRail.criticalBlockerCountLabel}
              />
              <DealOperationalRailMetric
                label="Warning blockers"
                value={operationalRail.warningBlockerCountLabel}
              />
              <DealOperationalRailMetric
                label="Document issues"
                value={operationalRail.documentIssueCountLabel}
              />
              <DealOperationalRailMetric
                label="Blocked investors"
                value={operationalRail.blockedInvestorCountLabel}
              />
            </DealOperationalRailMetrics>
          </DealOperationalRailCard>
        </DealOperationalRail>
      }
    >
      {children}
    </DealAppShell>
  )
}
