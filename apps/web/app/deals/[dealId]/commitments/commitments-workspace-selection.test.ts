import type { DealCommitmentsTableLifecycleState } from '@repo/kit/deal-commitments-table'
import { describe, expect, it } from 'vitest'

import {
  getControlledTableSelectionState,
  getSyncedCommitmentsSelection,
} from './commitments-workspace-selection'

type ReadyCommitmentsState = Extract<DealCommitmentsTableLifecycleState, { readonly kind: 'ready' }>

const readyTableState = (
  state: Partial<Omit<ReadyCommitmentsState, 'kind'>> = {},
): ReadyCommitmentsState => ({
  kind: 'ready',
  rows: [],
  ...state,
})

describe('commitments workspace table selection synchronization', () => {
  it('uses selected row ids from the latest ready table state when provided', () => {
    const nextSelectedRowIds = ['inv-alba']

    expect(
      getSyncedCommitmentsSelection({
        currentSelectedRowIds: ['inv-julien-moreau'],
        state: readyTableState({ selectedRowIds: nextSelectedRowIds }),
      }),
    ).toBe(nextSelectedRowIds)
  })

  it('keeps local selected row ids when ready table state leaves selection uncontrolled', () => {
    const currentSelectedRowIds = ['inv-julien-moreau']

    expect(
      getSyncedCommitmentsSelection({
        currentSelectedRowIds,
        state: readyTableState(),
      }),
    ).toBe(currentSelectedRowIds)
  })

  it('clears selected row ids when the table leaves the ready lifecycle', () => {
    expect(
      getSyncedCommitmentsSelection({
        currentSelectedRowIds: ['inv-julien-moreau'],
        state: { kind: 'loading' },
      }),
    ).toEqual([])
  })

  it('injects the synchronized selection only into ready table state', () => {
    expect(getControlledTableSelectionState(readyTableState(), ['inv-alba'])).toMatchObject({
      kind: 'ready',
      selectedRowIds: ['inv-alba'],
    })
    expect(getControlledTableSelectionState({ kind: 'loading' }, ['inv-alba'])).toEqual({
      kind: 'loading',
    })
  })
})
