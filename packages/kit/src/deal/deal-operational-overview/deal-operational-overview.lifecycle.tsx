import { Button, Skeleton } from '@repo/ui'
import { CircleAlert } from 'lucide-react'

import type {
  DealOperationalOverviewEmptyProps,
  DealOperationalOverviewErrorProps,
  DealOperationalOverviewLoadingProps,
} from './deal-operational-overview.types'

export const LoadingContent = ({ label, titleId }: DealOperationalOverviewLoadingProps) => (
  <div className="grid gap-0" data-slot="deal-operational-loading">
    <div className="grid gap-2 border-b border-border/70 p-5">
      <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
        {label}
      </h2>
      <Skeleton className="h-4 w-full max-w-lg motion-reduce:animate-none" />
    </div>
    <div className="grid gap-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
      <div className="grid gap-4 p-5">
        <Skeleton className="h-6 w-48 motion-reduce:animate-none" />
        <Skeleton className="h-16 w-full motion-reduce:animate-none" />
        <div className="grid gap-2 sm:grid-cols-3">
          <Skeleton className="h-16 motion-reduce:animate-none" />
          <Skeleton className="h-16 motion-reduce:animate-none" />
          <Skeleton className="h-16 motion-reduce:animate-none" />
        </div>
      </div>
      <div className="grid gap-4 border-t border-border/70 p-5 lg:border-l lg:border-t-0">
        <Skeleton className="h-6 w-44 motion-reduce:animate-none" />
        <Skeleton className="h-10 w-64 max-w-full motion-reduce:animate-none" />
        <Skeleton className="h-2.5 w-full rounded-full motion-reduce:animate-none" />
        <Skeleton className="h-28 w-full motion-reduce:animate-none" />
      </div>
    </div>
  </div>
)

export const ErrorContent = ({ onAction, state, titleId }: DealOperationalOverviewErrorProps) => (
  <div className="grid gap-4 p-5" data-slot="deal-operational-error">
    <div className="flex items-start gap-3">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-status-danger" />
      <div className="grid gap-1">
        <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
          {state.title}
        </h2>
        {state.description ? (
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{state.description}</p>
        ) : null}
      </div>
    </div>
    {state.retryAction && onAction ? (
      <Button
        className="w-fit"
        onClick={() => onAction({ kind: state.retryAction.kind })}
        variant="outline"
      >
        {state.retryAction.label}
      </Button>
    ) : null}
  </div>
)

export const EmptyContent = ({ state, titleId }: DealOperationalOverviewEmptyProps) => (
  <div className="grid gap-2 p-5" data-slot="deal-operational-empty">
    <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
      {state.title}
    </h2>
    {state.description ? (
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{state.description}</p>
    ) : null}
  </div>
)
