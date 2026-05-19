import { Button, cn } from '@repo/ui'

import { isActionDisabled } from './deal-progress-panel.model'
import type { DealProgressPanelActionProps } from './deal-progress-panel.types'

export const ActionButton = ({
  action,
  describedById,
  onAction,
  primary = false,
}: DealProgressPanelActionProps) => {
  const disabled = isActionDisabled(action)

  return (
    <Button
      className={cn(
        'min-w-0 shadow-card focus-visible:ring-offset-command disabled:shadow-none',
        primary
          ? 'w-full bg-command-accent text-command-accent-foreground hover:bg-command-accent/90 focus-visible:ring-command-accent disabled:bg-command-muted disabled:text-command-foreground/50'
          : 'w-full border-command-border bg-command-muted text-command-foreground hover:border-command-border hover:bg-command-border/50 hover:text-command-foreground focus-visible:ring-command-foreground disabled:border-command-border/60 disabled:bg-command-muted disabled:text-command-foreground/50 disabled:opacity-50',
      )}
      aria-describedby={disabled ? describedById : undefined}
      data-action-kind={action.kind}
      data-slot="deal-progress-action"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onAction?.({ kind: action.kind })
        }
      }}
      variant={primary ? 'default' : 'outline'}
    >
      <span className="min-w-0 truncate">{action.label}</span>
    </Button>
  )
}
