import { TableCell, TableRow } from '@repo/ui'

import { commitmentTableColumnCount } from './deal-commitments-table.model'
import type { DealCommitmentsTableLabels } from './deal-commitments-table.types'

export const CommitmentGroupRow = ({
  count,
  label,
  labels,
}: {
  readonly count: number
  readonly label: string
  readonly labels: DealCommitmentsTableLabels
}) => (
  <TableRow
    className="h-10 border-b border-border/50 bg-muted/35 hover:bg-muted/35"
    data-slot="commitment-group-row"
  >
    <TableCell colSpan={commitmentTableColumnCount} className="px-3 py-2">
      <span className="text-muted-foreground text-xs font-semibold uppercase">
        {labels.row.groupSummaryLabel(label, count)}
      </span>
    </TableCell>
  </TableRow>
)
