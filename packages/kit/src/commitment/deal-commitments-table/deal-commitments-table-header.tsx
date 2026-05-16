import { Checkbox, cn, TableHead, TableHeader, TableRow } from '@repo/ui'
import type { ReactNode } from 'react'

import type { DealCommitmentsTableLabels } from './deal-commitments-table.types'

export const CommitmentsTableColgroup = () => (
  <colgroup>
    <col className="w-12" />
    <col className="w-[18.5rem]" />
    <col className="w-[7.75rem]" />
    <col className="w-[7.25rem]" />
    <col className="w-[7.25rem]" />
    <col className="w-[7.25rem]" />
    <col className="w-[7.25rem]" />
    <col className="w-14" />
  </colgroup>
)

export const CommitmentsTableHeader = ({
  headerCheckboxState,
  headerSelectionDisabled,
  labels,
  onSelectVisible,
}: {
  readonly headerCheckboxState: boolean | 'indeterminate'
  readonly headerSelectionDisabled: boolean
  readonly labels: DealCommitmentsTableLabels
  readonly onSelectVisible: () => void
}) => (
  <TableHeader className="bg-card [&_tr]:border-border/60" data-slot="commitments-table-header">
    <TableRow className="h-10 border-b border-border/60 hover:bg-card">
      <TableHead className="px-3 text-center" rowSpan={2}>
        <Checkbox
          aria-label={labels.selection.selectAllVisibleLabel}
          checked={headerCheckboxState}
          disabled={headerSelectionDisabled}
          onCheckedChange={onSelectVisible}
        />
      </TableHead>
      <WorkflowHeader label={labels.columns.investor} rowSpan={2} />
      <WorkflowHeader align="right" label={labels.columns.commitment} rowSpan={2} />
      <TableHead
        className="border-x border-border/30 px-3 text-center text-xs font-semibold uppercase text-muted-foreground"
        colSpan={3}
      >
        {labels.columns.readiness}
      </TableHead>
      <WorkflowHeader label={labels.columns.status} rowSpan={2} />
      <TableHead
        className="px-3 text-right text-xs font-semibold uppercase text-muted-foreground"
        rowSpan={2}
      >
        {labels.columns.actions}
      </TableHead>
    </TableRow>
    <TableRow className="h-9 border-b border-border/60 hover:bg-card">
      <ReadinessGroupHeader>{labels.columns.kycKyb}</ReadinessGroupHeader>
      <ReadinessGroupHeader>{labels.columns.signature}</ReadinessGroupHeader>
      <ReadinessGroupHeader>{labels.columns.wire}</ReadinessGroupHeader>
    </TableRow>
  </TableHeader>
)

const WorkflowHeader = ({
  align = 'left',
  label,
  rowSpan,
}: {
  readonly align?: 'left' | 'right'
  readonly label: string
  readonly rowSpan: number
}) => (
  <TableHead
    className={cn(
      'px-3 text-xs font-semibold uppercase text-muted-foreground',
      align === 'right' && 'text-right',
    )}
    rowSpan={rowSpan}
  >
    {label}
  </TableHead>
)

const ReadinessGroupHeader = ({ children }: { readonly children: ReactNode }) => (
  <TableHead
    className="border-l border-border/25 px-3 text-xs font-semibold uppercase text-muted-foreground first:border-l-0"
    data-slot="readiness-group-header"
  >
    {children}
  </TableHead>
)
