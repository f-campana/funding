'use client'

import { createContext, useContext } from 'react'

import type { getCommitmentTableModel, getReadyControls } from './deal-commitments-table.model'
import type {
  CommitmentInvestorRow,
  CommitmentTableFilterId,
  DealCommitmentsTableContentProps,
} from './deal-commitments-table.types'

export type DealCommitmentsTableExportAction =
  | {
      readonly disabled: boolean
      readonly exportSelectedLabel: string
      readonly exportVisibleLabel: string
      readonly onExport: () => void
    }
  | undefined

export type DealCommitmentsTableContextValue = {
  readonly controls: ReturnType<typeof getReadyControls>
  readonly disabled: boolean
  readonly exportAction: DealCommitmentsTableExportAction
  readonly footer: DealCommitmentsTableContentProps['footer']
  readonly labels: DealCommitmentsTableContentProps['labels']
  readonly model: ReturnType<typeof getCommitmentTableModel> | undefined
  readonly onDetailOpenChange: (open: boolean) => void
  readonly onFilterChange: (filterIds: readonly CommitmentTableFilterId[]) => void
  readonly onPageChange: (page: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
  readonly onRowOpen: (row: CommitmentInvestorRow) => void
  readonly onRowSelect: (row: CommitmentInvestorRow) => void
  readonly onSearchChange: (value: string) => void
  readonly onSelectVisible: () => void
  readonly renderRowAction: DealCommitmentsTableContentProps['renderRowAction']
  readonly state: DealCommitmentsTableContentProps['state']
  readonly subtitle: DealCommitmentsTableContentProps['subtitle']
  readonly title: DealCommitmentsTableContentProps['title']
  readonly toolbar: DealCommitmentsTableContentProps['toolbar']
}

export const DealCommitmentsTableContext = createContext<
  DealCommitmentsTableContextValue | undefined
>(undefined)

export const useDealCommitmentsTableContext = () => {
  const context = useContext(DealCommitmentsTableContext)

  if (!context) {
    throw new Error('DealCommitmentsTable compound parts must be rendered inside Content.')
  }

  return context
}
