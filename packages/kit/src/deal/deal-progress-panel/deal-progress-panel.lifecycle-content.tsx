import { Button, Skeleton } from '@repo/ui'

import type {
  DealProgressPanelErrorProps,
  DealProgressPanelLoadingProps,
} from './deal-progress-panel.types'

export const LoadingContent = ({ label, titleId }: DealProgressPanelLoadingProps) => (
  <>
    <div className="flex items-start justify-between gap-3" data-slot="deal-progress-header">
      <h2 className="text-sm font-semibold text-command-foreground" id={titleId}>
        {label}
      </h2>
      <Skeleton className="h-7 w-24 bg-command-muted motion-reduce:animate-none" />
    </div>
    <div className="grid gap-4" data-slot="deal-progress-loading">
      <Skeleton className="h-5 w-40 bg-command-muted motion-reduce:animate-none" />
      <Skeleton className="h-10 w-64 bg-command-muted motion-reduce:animate-none" />
      <Skeleton className="h-2.5 w-full rounded-full bg-command-muted motion-reduce:animate-none" />
      <div className="grid gap-2">
        <Skeleton className="h-9 w-full bg-command-muted motion-reduce:animate-none" />
        <Skeleton className="h-9 w-full bg-command-muted motion-reduce:animate-none" />
      </div>
    </div>
  </>
)

export const ErrorContent = ({ onAction, state, titleId }: DealProgressPanelErrorProps) => (
  <>
    <div className="grid gap-2" data-slot="deal-progress-header">
      <h2 className="text-sm font-semibold text-command-foreground" id={titleId}>
        {state.title}
      </h2>
      {state.description ? (
        <p className="text-sm leading-6 text-command-foreground/70">{state.description}</p>
      ) : null}
    </div>
    {state.retryAction && onAction ? (
      <Button
        className="w-full bg-command-accent text-command-accent-foreground hover:bg-command-accent/90 focus-visible:ring-command-accent focus-visible:ring-offset-command"
        data-slot="deal-progress-action"
        onClick={() => onAction({ kind: state.retryAction.kind })}
        variant="default"
      >
        {state.retryAction.label}
      </Button>
    ) : null}
  </>
)
