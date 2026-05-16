import type { ComponentProps } from 'react'

import { cn } from '#lib/utils'

export type TableProps = ComponentProps<'table'>

export const Table = ({ className, ...props }: TableProps) => (
  <div className="relative w-full overflow-x-auto" data-slot="table-container">
    <table
      className={cn('w-full caption-bottom text-sm', className)}
      data-slot="table"
      {...props}
    />
  </div>
)

export type TableHeaderProps = ComponentProps<'thead'>

export const TableHeader = ({ className, ...props }: TableHeaderProps) => (
  <thead className={cn('[&_tr]:border-b', className)} data-slot="table-header" {...props} />
)

export type TableBodyProps = ComponentProps<'tbody'>

export const TableBody = ({ className, ...props }: TableBodyProps) => (
  <tbody
    className={cn('[&_tr:last-child]:border-0', className)}
    data-slot="table-body"
    {...props}
  />
)

export type TableFooterProps = ComponentProps<'tfoot'>

export const TableFooter = ({ className, ...props }: TableFooterProps) => (
  <tfoot
    className={cn('border-t bg-muted font-medium [&>tr]:last:border-b-0', className)}
    data-slot="table-footer"
    {...props}
  />
)

export type TableRowProps = ComponentProps<'tr'>

export const TableRow = ({ className, ...props }: TableRowProps) => (
  <tr
    className={cn(
      'border-b transition-colors hover:bg-muted data-[state=selected]:bg-muted',
      className,
    )}
    data-slot="table-row"
    {...props}
  />
)

export type TableHeadProps = ComponentProps<'th'>

export const TableHead = ({ className, ...props }: TableHeadProps) => (
  <th
    className={cn(
      'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground',
      className,
    )}
    data-slot="table-head"
    {...props}
  />
)

export type TableCellProps = ComponentProps<'td'>

export const TableCell = ({ className, ...props }: TableCellProps) => (
  <td
    className={cn('p-2 align-middle whitespace-nowrap', className)}
    data-slot="table-cell"
    {...props}
  />
)

export type TableCaptionProps = ComponentProps<'caption'>

export const TableCaption = ({ className, ...props }: TableCaptionProps) => (
  <caption
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    data-slot="table-caption"
    {...props}
  />
)
