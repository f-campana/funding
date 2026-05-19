'use client'

import { useDealCommitmentsTableContext } from './deal-commitments-table.context'
import type { DealCommitmentsTableDetailProps } from './deal-commitments-table.types'

export const DealCommitmentsTableDetail = ({ children }: DealCommitmentsTableDetailProps) => {
  const { model, onDetailOpenChange, state } = useDealCommitmentsTableContext()
  const rowId = model?.drawerOpenRowId
  const row = state.kind === 'ready' ? state.rows.find((item) => item.id === rowId) : undefined

  return <>{children({ onOpenChange: onDetailOpenChange, open: row !== undefined, row, rowId })}</>
}
