'use client'

import { Button, Skeleton } from '@repo/ui'
import { CircleAlert } from 'lucide-react'

import type {
  DealCommitmentInspectorEmptyProps,
  DealCommitmentInspectorErrorProps,
  DealCommitmentInspectorLoadingProps,
} from './deal-commitment-inspector.types'

export const DealCommitmentInspectorLoading = ({
  label,
  titleId,
}: DealCommitmentInspectorLoadingProps) => (
  <div className="grid gap-0" data-slot="deal-commitment-inspector-loading">
    <div className="grid gap-2 border-b border-border/70 p-4">
      <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
        {label}
      </h2>
      <Skeleton className="h-4 w-full max-w-md motion-reduce:animate-none" />
    </div>
    <div className="grid gap-3 p-4">
      <Skeleton className="h-16 w-full motion-reduce:animate-none" />
      <div className="grid gap-2 sm:grid-cols-2">
        <Skeleton className="h-24 w-full motion-reduce:animate-none" />
        <Skeleton className="h-24 w-full motion-reduce:animate-none" />
        <Skeleton className="h-24 w-full motion-reduce:animate-none" />
        <Skeleton className="h-24 w-full motion-reduce:animate-none" />
      </div>
      <Skeleton className="h-28 w-full motion-reduce:animate-none" />
      <Skeleton className="h-28 w-full motion-reduce:animate-none" />
    </div>
  </div>
)

export const DealCommitmentInspectorError = ({
  onAction,
  state,
  titleId,
}: DealCommitmentInspectorErrorProps) => (
  <div className="grid gap-4 p-4" data-slot="deal-commitment-inspector-error">
    <div className="flex items-start gap-3">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-status-danger" />
      <div className="grid gap-1">
        <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
          {state.title}
        </h2>
        {state.description ? (
          <p className="text-sm leading-6 text-muted-foreground">{state.description}</p>
        ) : null}
      </div>
    </div>
    {state.retryLabel && onAction ? (
      <Button className="w-fit" onClick={() => onAction({ kind: 'retry' })} variant="outline">
        {state.retryLabel}
      </Button>
    ) : null}
  </div>
)

export const DealCommitmentInspectorEmpty = ({
  state,
  titleId,
}: DealCommitmentInspectorEmptyProps) => (
  <div className="grid gap-2 p-4" data-slot="deal-commitment-inspector-empty">
    <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
      {state.title}
    </h2>
    {state.description ? (
      <p className="text-sm leading-6 text-muted-foreground">{state.description}</p>
    ) : null}
  </div>
)
