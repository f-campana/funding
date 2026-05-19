import {
  DealOperationalOverviewActivity,
  DealOperationalOverviewBlockers,
  DealOperationalOverviewCapital,
  DealOperationalOverviewEmpty,
  DealOperationalOverviewError,
  DealOperationalOverviewHeader,
  DealOperationalOverviewLoading,
  DealOperationalOverviewPrimaryGrid,
  type DealOperationalOverviewProps,
  DealOperationalOverviewReadiness,
  DealOperationalOverviewRoot,
  DealOperationalOverviewSecondaryGrid,
} from '@repo/kit/deal-operational-overview'
import { getOperationalBlockerSummary } from '@repo/kit/deal-operational-overview/model'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import {
  dealOperationsRouteDataError,
  getDealOperationsData,
  isDealOperationsRouteNotFoundError,
} from '../data'
import { mapDealOperationalOverviewProps } from '../deal-operational-adapters'

type DealOverviewPageProps = {
  params: Promise<{ dealId: string }>
}

const operationalOverviewTitleId = 'deal-operational-overview-title'

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
  const overview = mapDealOperationalOverviewProps(data)

  return (
    <DealOperationalOverviewRoot
      aria-labelledby={operationalOverviewTitleId}
      className={overview.className}
      state={overview.state}
    >
      {renderOperationalOverviewContent(overview)}
    </DealOperationalOverviewRoot>
  )
}

const renderOperationalOverviewContent = ({
  labels,
  onAction,
  state,
}: DealOperationalOverviewProps): ReactNode => {
  switch (state.kind) {
    case 'loading':
      return (
        <DealOperationalOverviewLoading
          label={state.label ?? labels.loadingLabel}
          titleId={operationalOverviewTitleId}
        />
      )
    case 'error':
      return (
        <DealOperationalOverviewError
          onAction={onAction}
          state={state}
          titleId={operationalOverviewTitleId}
        />
      )
    case 'empty':
      return <DealOperationalOverviewEmpty state={state} titleId={operationalOverviewTitleId} />
    case 'ready':
      return (
        <>
          <DealOperationalOverviewHeader
            readiness={state.readiness}
            subtitle={labels.subtitle}
            title={labels.title}
            titleId={operationalOverviewTitleId}
          />
          <DealOperationalOverviewPrimaryGrid>
            <DealOperationalOverviewReadiness labels={labels} readiness={state.readiness} />
            <DealOperationalOverviewCapital capital={state.capital} labels={labels} />
          </DealOperationalOverviewPrimaryGrid>
          <DealOperationalOverviewSecondaryGrid>
            <DealOperationalOverviewBlockers
              blockers={state.blockers}
              labels={labels}
              summary={getOperationalBlockerSummary(state.readiness)}
            />
            <DealOperationalOverviewActivity activity={state.activity} labels={labels} />
          </DealOperationalOverviewSecondaryGrid>
        </>
      )
  }
}
