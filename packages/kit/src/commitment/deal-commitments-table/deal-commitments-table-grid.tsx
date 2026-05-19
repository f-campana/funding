'use client'

import { cn, Table, TableBody } from '@repo/ui'
import type { ComponentProps, ComponentPropsWithoutRef } from 'react'

import { useDealCommitmentsTableContext } from './deal-commitments-table.context'
import type { DealCommitmentsTableModelProps } from './deal-commitments-table.types'
import { CommitmentsTableBody } from './deal-commitments-table-body'
import { CommitmentsTableColgroup, CommitmentsTableHeader } from './deal-commitments-table-header'

export const DealCommitmentsTableGridRoot = ({
  children,
  className,
  ...divProps
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn('max-w-full overflow-x-auto overscroll-x-contain', className)}
    data-overflow-contained="true"
    data-slot="commitments-table-scroll"
    {...divProps}
  >
    {children}
  </div>
)

export const DealCommitmentsTableTable = ({
  children,
  className,
  ...tableProps
}: ComponentProps<typeof Table>) => {
  const { title } = useDealCommitmentsTableContext()

  return (
    <Table
      aria-label={title}
      className={cn('min-w-[61.75rem] table-fixed', className)}
      {...tableProps}
    >
      {children}
    </Table>
  )
}

export const DealCommitmentsTableColumnGroup = CommitmentsTableColgroup

export const DealCommitmentsTableHeader = () => {
  const { labels, model, onSelectVisible } = useDealCommitmentsTableContext()

  return (
    <CommitmentsTableHeader
      headerCheckboxState={model?.headerCheckboxState ?? false}
      headerSelectionDisabled={!model || model.selectableVisibleRowIds.length === 0}
      labels={labels}
      onSelectVisible={onSelectVisible}
    />
  )
}

export const DealCommitmentsTableBody = () => {
  const { controls, labels, model, onRowOpen, onRowSelect, renderRowAction, state } =
    useDealCommitmentsTableContext()

  return (
    <TableBody>
      <CommitmentsTableBody
        labels={labels}
        model={model}
        onRowOpen={onRowOpen}
        onRowSelect={onRowSelect}
        renderRowAction={renderRowAction}
        selectedRowIds={controls.selectedRowIds}
        state={state}
      />
    </TableBody>
  )
}

export const DealCommitmentsTableGrid = () => (
  <DealCommitmentsTableGridRoot>
    <DealCommitmentsTableTable>
      <DealCommitmentsTableColumnGroup />
      <DealCommitmentsTableHeader />
      <DealCommitmentsTableBody />
    </DealCommitmentsTableTable>
  </DealCommitmentsTableGridRoot>
)

export const DealCommitmentsTableModel = ({ children }: DealCommitmentsTableModelProps) => {
  const {
    controls,
    disabled,
    labels,
    model,
    onRowOpen,
    onRowSelect,
    onSelectVisible,
    renderRowAction,
    state,
  } = useDealCommitmentsTableContext()

  return (
    <>
      {children({
        controls,
        disabled,
        labels,
        model,
        onRowOpen,
        onRowSelect,
        onSelectVisible,
        renderRowAction,
        state,
      })}
    </>
  )
}
