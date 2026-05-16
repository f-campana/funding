import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@repo/ui'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { pageSizeOptions } from './deal-commitments-table.model'
import type {
  CommitmentTableModel,
  DealCommitmentsTableLifecycleState,
  DealCommitmentsTableProps,
} from './deal-commitments-table.types'

export const CommitmentsTableFooter = ({
  footer,
  model,
  onPageChange,
  onPageSizeChange,
  stateKind,
}: {
  readonly footer: DealCommitmentsTableProps['footer']
  readonly model: CommitmentTableModel | undefined
  readonly onPageChange: (page: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
  readonly stateKind: DealCommitmentsTableLifecycleState['kind']
}) => {
  const footerLabels = getFooterLabels(footer, model, stateKind)

  return (
    <footer
      className="flex flex-col gap-3 border-t border-border/60 px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between xl:px-7"
      data-slot="commitments-table-footer"
    >
      <div className="flex flex-wrap items-center gap-4">
        <FooterMetric>{footerLabels.investorsLabel}</FooterMetric>
        <FooterMetric>{footerLabels.totalCommittedLabel}</FooterMetric>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-8 gap-1.5 px-2 text-muted-foreground text-xs"
              disabled={!model}
              variant="ghost"
            >
              {footerLabels.rowsPerPageLabel}
              <ChevronDown aria-hidden="true" className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuRadioGroup
              onValueChange={(value) => onPageSizeChange(Number(value))}
              value={String(model?.pageSize ?? pageSizeOptions[0])}
            >
              {pageSizeOptions.map((pageSize) => (
                <DropdownMenuRadioItem key={pageSize} value={String(pageSize)}>
                  {pageSize} rows
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <FooterMetric>{footerLabels.rangeLabel}</FooterMetric>
        <Button
          aria-label="Previous page"
          className="size-8"
          disabled={!model || model.page <= 1}
          onClick={() => model && onPageChange(model.page - 1)}
          size="icon"
          variant="ghost"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Button>
        <Button
          aria-label="Next page"
          className="size-8"
          disabled={!model || model.page >= model.pageCount}
          onClick={() => model && onPageChange(model.page + 1)}
          size="icon"
          variant="ghost"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </footer>
  )
}

const getFooterLabels = (
  footer: DealCommitmentsTableProps['footer'],
  model: CommitmentTableModel | undefined,
  stateKind: DealCommitmentsTableLifecycleState['kind'],
) => {
  if (!model || stateKind !== 'ready') {
    return footer
  }

  const start = model.totalRows === 0 ? 0 : (model.page - 1) * model.pageSize + 1
  const end = model.totalRows === 0 ? 0 : Math.min(model.page * model.pageSize, model.totalRows)

  return {
    investorsLabel: `${model.totalRows} ${model.totalRows === 1 ? 'investor' : 'investors'}`,
    rangeLabel: `${start}–${end} of ${model.totalRows}`,
    rowsPerPageLabel: `Rows per page ${model.pageSize}`,
    totalCommittedLabel: model.totalRows === 0 ? 'Total committed $0' : footer.totalCommittedLabel,
  }
}

const FooterMetric = ({ children }: { readonly children: ReactNode }) => (
  <span className="font-medium text-muted-foreground">{children}</span>
)
