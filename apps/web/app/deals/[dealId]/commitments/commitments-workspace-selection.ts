import type { DealCommitmentsTableLifecycleState } from '@repo/kit/deal-commitments-table'

const emptySelectedRowIds: readonly string[] = []

export const getSyncedCommitmentsSelection = ({
  currentSelectedRowIds,
  state,
}: {
  readonly currentSelectedRowIds: readonly string[]
  readonly state: DealCommitmentsTableLifecycleState
}): readonly string[] => {
  if (state.kind !== 'ready') {
    return currentSelectedRowIds.length === 0 ? currentSelectedRowIds : emptySelectedRowIds
  }

  return state.selectedRowIds ?? currentSelectedRowIds
}

export const getControlledTableSelectionState = (
  state: DealCommitmentsTableLifecycleState,
  selectedRowIds: readonly string[],
): DealCommitmentsTableLifecycleState => {
  if (state.kind !== 'ready') {
    return state
  }

  return {
    ...state,
    selectedRowIds,
  }
}
