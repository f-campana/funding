'use client'

import {
  DealProgressPanelActions,
  DealProgressPanelCapital,
  DealProgressPanelDataQuality,
  DealProgressPanelError,
  DealProgressPanelHeader,
  DealProgressPanelLoading,
  type DealProgressPanelProps,
  DealProgressPanelRoot,
} from '@repo/kit/deal-progress-panel'
import { useRouter } from 'next/navigation'
import { type ReactNode, useCallback } from 'react'

import type { DealOperationsRouteData } from './data'
import { mapDealProgressPanelProps } from './deal-operational-adapters'

type DealOperationalRailProps = {
  readonly children?: ReactNode
  readonly data: DealOperationsRouteData
}

type DealProgressActionHandler = NonNullable<DealProgressPanelProps['onAction']>

const dealProgressPanelTitleId = 'deal-progress-panel-title'

export function DealOperationalRail({ children, data }: DealOperationalRailProps) {
  const router = useRouter()
  const handleProgressAction = useCallback<DealProgressActionHandler>(
    (event) => {
      if (event.kind === 'retry') {
        router.refresh()
        return
      }

      if (event.kind === 'invite' || event.kind === 'openForInterests') {
        router.push(`/deals/${data.deal.slug}/commitments`)
        return
      }

      router.push(`/deals/${data.deal.slug}/documents`)
    },
    [data.deal.slug, router],
  )
  const progressPanel = mapDealProgressPanelProps(data, handleProgressAction)

  return (
    <aside
      aria-label="Deal operational rail"
      className="grid content-start gap-3 lg:sticky lg:top-5"
      data-slot="deal-operational-rail"
    >
      <DealProgressPanelRoot
        aria-labelledby={dealProgressPanelTitleId}
        className="max-w-none"
        state={progressPanel.state}
      >
        {renderDealProgressPanelContent(progressPanel)}
      </DealProgressPanelRoot>

      {children}
    </aside>
  )
}

const renderDealProgressPanelContent = ({
  labels,
  locale,
  onAction,
  state,
}: DealProgressPanelProps): ReactNode => {
  switch (state.kind) {
    case 'loading':
      return (
        <DealProgressPanelLoading
          label={state.label ?? labels.title}
          titleId={dealProgressPanelTitleId}
        />
      )
    case 'error':
      return (
        <DealProgressPanelError
          onAction={onAction}
          state={state}
          titleId={dealProgressPanelTitleId}
        />
      )
    case 'ready':
      return (
        <>
          <DealProgressPanelHeader
            labels={labels}
            state={state}
            titleId={dealProgressPanelTitleId}
          />
          <DealProgressPanelCapital capital={state.capital} labels={labels} locale={locale} />
          {state.dataQuality.kind !== 'fresh' ? (
            <DealProgressPanelDataQuality dataQuality={state.dataQuality} />
          ) : null}
          <DealProgressPanelActions onAction={onAction} state={state} />
        </>
      )
  }
}

export const DealOperationalRailCard = ({
  children,
  title,
}: {
  readonly children: ReactNode
  readonly title: string
}) => (
  <section className="rounded-lg border border-border bg-background p-4 shadow-card">
    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    {children}
  </section>
)

export const DealOperationalRailMetrics = ({ children }: { readonly children: ReactNode }) => (
  <div className="mt-3 grid gap-2 text-sm">{children}</div>
)

export const DealOperationalRailMetric = ({
  label,
  value,
}: {
  readonly label: string
  readonly value: string
}) => (
  <div className="flex items-end justify-between gap-3 rounded-md border border-border bg-muted/45 px-3 py-2">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{value}</span>
  </div>
)
