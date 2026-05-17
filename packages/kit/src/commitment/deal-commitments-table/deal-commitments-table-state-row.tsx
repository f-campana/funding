import { Button, cn, TableCell, TableRow } from '@repo/ui'
import { AlertCircle, CircleMinus } from 'lucide-react'

import { commitmentTableColumnCount } from './deal-commitments-table.model'
import type { CommitmentTableRetryAction } from './deal-commitments-table.types'

export const CommitmentTableStateRow = ({
  description,
  kind,
  retry,
  title,
}: {
  readonly description?: string | undefined
  readonly kind: 'empty' | 'error'
  readonly retry?: CommitmentTableRetryAction | undefined
  readonly title: string
}) => {
  const StateIcon = kind === 'error' ? AlertCircle : CircleMinus

  return (
    <TableRow
      className="h-36 border-b border-border/50 bg-card hover:bg-card"
      data-slot="commitment-table-state-row"
      data-state={kind}
    >
      <TableCell className="px-6 py-10 text-center" colSpan={commitmentTableColumnCount}>
        <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
          <StateIcon
            aria-hidden="true"
            className={cn(
              'size-5',
              kind === 'error' ? 'text-status-danger' : 'text-muted-foreground',
            )}
          />
          <p
            className="text-sm font-semibold text-foreground"
            data-slot="commitment-table-state-title"
          >
            {title}
          </p>
          {description ? (
            <p
              className="text-sm leading-6 text-muted-foreground"
              data-slot="commitment-table-state-description"
            >
              {description}
            </p>
          ) : null}
          {kind === 'error' && retry ? (
            <Button className="mt-2 rounded-lg" onClick={retry.onRetry} size="sm" variant="outline">
              {retry.label}
            </Button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  )
}
