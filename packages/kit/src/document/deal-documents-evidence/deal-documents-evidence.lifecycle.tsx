import { Button, Skeleton } from '@repo/ui'
import { CircleAlert } from 'lucide-react'

import type {
  DealDocumentsEvidenceEmptyProps,
  DealDocumentsEvidenceErrorProps,
  DealDocumentsEvidenceLoadingProps,
} from './deal-documents-evidence.types'

export const DealDocumentsEvidenceLoading = ({
  label,
  titleId,
}: DealDocumentsEvidenceLoadingProps) => (
  <div className="grid gap-0" data-slot="deal-documents-evidence-loading">
    <div className="grid gap-2 border-b border-border/70 p-5">
      <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
        {label}
      </h2>
      <Skeleton className="h-4 w-full max-w-xl motion-reduce:animate-none" />
    </div>
    <div className="grid gap-4 p-5">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <Skeleton className="h-20 motion-reduce:animate-none" />
        <Skeleton className="h-20 motion-reduce:animate-none" />
        <Skeleton className="h-20 motion-reduce:animate-none" />
        <Skeleton className="h-20 motion-reduce:animate-none" />
        <Skeleton className="h-20 motion-reduce:animate-none" />
      </div>
      <Skeleton className="h-44 w-full motion-reduce:animate-none" />
      <Skeleton className="h-44 w-full motion-reduce:animate-none" />
    </div>
  </div>
)

export const DealDocumentsEvidenceError = ({
  onAction,
  state,
  titleId,
}: DealDocumentsEvidenceErrorProps) => (
  <div className="grid gap-4 p-5" data-slot="deal-documents-evidence-error">
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
    {state.retryLabel && onAction ? (
      <Button className="w-fit" onClick={() => onAction({ kind: 'retry' })} variant="outline">
        {state.retryLabel}
      </Button>
    ) : null}
  </div>
)

export const DealDocumentsEvidenceEmpty = ({ state, titleId }: DealDocumentsEvidenceEmptyProps) => (
  <div className="grid gap-2 p-5" data-slot="deal-documents-evidence-empty">
    <h2 className="text-base font-semibold text-card-foreground" id={titleId}>
      {state.title}
    </h2>
    {state.description ? (
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{state.description}</p>
    ) : null}
  </div>
)
