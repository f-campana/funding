'use client'

import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@repo/ui'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { useDealCommitmentsTableContext } from './deal-commitments-table.context'
import { pageSizeOptions } from './deal-commitments-table.model'

export const DealCommitmentsTableFooterRoot = ({
  children,
  className,
  ...footerProps
}: ComponentPropsWithoutRef<'footer'>) => (
  <footer
    className={cn(
      'flex flex-col gap-3 border-t border-border/60 px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between xl:px-7',
      className,
    )}
    data-slot="commitments-table-footer"
    {...footerProps}
  >
    {children}
  </footer>
)

export const DealCommitmentsTableFooterMetrics = ({
  children,
  className,
  ...divProps
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-wrap items-center gap-4', className)} {...divProps}>
    {children}
  </div>
)

export const DealCommitmentsTableFooterControls = ({
  children,
  className,
  ...divProps
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-wrap items-center gap-2', className)} {...divProps}>
    {children}
  </div>
)

export const DealCommitmentsTableFooterMetric = ({
  children,
}: {
  readonly children: ReactNode
}) => <span className="font-medium text-muted-foreground">{children}</span>

export const DealCommitmentsTableInvestorCount = () => {
  const footerLabels = useDealCommitmentsTableFooterLabels()

  return (
    <DealCommitmentsTableFooterMetric>
      {footerLabels.investorsLabel}
    </DealCommitmentsTableFooterMetric>
  )
}

export const DealCommitmentsTableTotalCommitted = () => {
  const footerLabels = useDealCommitmentsTableFooterLabels()

  return (
    <DealCommitmentsTableFooterMetric>
      {footerLabels.totalCommittedLabel}
    </DealCommitmentsTableFooterMetric>
  )
}

export const DealCommitmentsTableRange = () => {
  const footerLabels = useDealCommitmentsTableFooterLabels()

  return (
    <DealCommitmentsTableFooterMetric>{footerLabels.rangeLabel}</DealCommitmentsTableFooterMetric>
  )
}

export const DealCommitmentsTablePageSizeSelect = () => {
  const { labels, model, onPageSizeChange } = useDealCommitmentsTableContext()
  const footerLabels = useDealCommitmentsTableFooterLabels()

  return (
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
              {labels.footer.rowsPerPageOptionLabel(pageSize)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const DealCommitmentsTablePreviousPageButton = () => {
  const { labels, model, onPageChange } = useDealCommitmentsTableContext()

  return (
    <Button
      aria-label={labels.footer.previousPageLabel}
      className="size-8"
      disabled={!model || model.page <= 1}
      onClick={() => model && onPageChange(model.page - 1)}
      size="icon"
      variant="ghost"
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
    </Button>
  )
}

export const DealCommitmentsTableNextPageButton = () => {
  const { labels, model, onPageChange } = useDealCommitmentsTableContext()

  return (
    <Button
      aria-label={labels.footer.nextPageLabel}
      className="size-8"
      disabled={!model || model.page >= model.pageCount}
      onClick={() => model && onPageChange(model.page + 1)}
      size="icon"
      variant="ghost"
    >
      <ChevronRight aria-hidden="true" className="size-4" />
    </Button>
  )
}

export const DealCommitmentsTableFooter = () => (
  <DealCommitmentsTableFooterRoot>
    <DealCommitmentsTableFooterMetrics>
      <DealCommitmentsTableInvestorCount />
      <DealCommitmentsTableTotalCommitted />
    </DealCommitmentsTableFooterMetrics>
    <DealCommitmentsTableFooterControls>
      <DealCommitmentsTablePageSizeSelect />
      <DealCommitmentsTableRange />
      <DealCommitmentsTablePreviousPageButton />
      <DealCommitmentsTableNextPageButton />
    </DealCommitmentsTableFooterControls>
  </DealCommitmentsTableFooterRoot>
)

const useDealCommitmentsTableFooterLabels = () => {
  const { footer, labels, model, state } = useDealCommitmentsTableContext()

  if (!model || state.kind !== 'ready') {
    return footer
  }

  const start = model.totalRows === 0 ? 0 : (model.page - 1) * model.pageSize + 1
  const end = model.totalRows === 0 ? 0 : Math.min(model.page * model.pageSize, model.totalRows)

  return {
    investorsLabel: labels.footer.investorsLabel(model.totalRows),
    rangeLabel: labels.footer.rangeLabel(start, end, model.totalRows),
    rowsPerPageLabel: labels.footer.rowsPerPageLabel(model.pageSize),
    totalCommittedLabel:
      model.totalRows === 0 ? labels.footer.emptyTotalCommittedLabel : footer.totalCommittedLabel,
  }
}
