import { describe, expect, it } from 'vitest'
import type { DealOperationalCenterDTO } from '@/server/deals'

import { getDealOperationalCenter } from '../../../server/deals'
import { mapDealCommitmentInspectorProps } from './deal-commitment-inspector-adapter'
import { mapDealCommitmentsTableViewModel } from './deal-commitments-table-adapter'
import { mapDealOperationalOverviewProps } from './deal-operational-overview-adapter'
import { mapDealProgressPanelProps } from './deal-progress-panel-adapter'

describe('Northstar capital and reconciliation semantics adapters', () => {
  it('labels matched aggregate capital as matched funds, not finance-accepted capital', () => {
    const props = mapDealOperationalOverviewProps(getNorthstarData())

    if (props.state.kind !== 'ready') {
      throw new Error(`Expected ready overview state, received ${props.state.kind}`)
    }

    expect(props.state.capital.headlineLabel).toBe('€300,000 unmatched received')
    expect(props.state.capital.matchedLabel).toBe('€3,650,000 matched funds')
    expect(props.state.capital.progress.label).toBe(
      '92% of received capital matched; finance acceptance pending',
    )
    expect(props.state.capital.metrics).toContainEqual(
      expect.objectContaining({
        description: 'Finance still needs to match received wires.',
        label: 'Matched funds',
        tone: 'danger',
        value: '€3,650,000',
      }),
    )
    expect(props.state.capital.headlineLabel).not.toBe('Received capital matched')
  })

  it('shows the progress panel composition as a gross committed breakdown', () => {
    const props = mapDealProgressPanelProps(getNorthstarData(), () => undefined)

    if (props.state.kind !== 'ready') {
      throw new Error(`Expected ready progress panel state, received ${props.state.kind}`)
    }

    expect(props.labels.capitalBreakdownLabel).toBe('Gross committed breakdown')
    expect(props.labels.capitalCompositionLabel).toBe('Gross committed composition')
    expect(props.state.capital.progress.label).toBe('Gross committed / target')
    expect(props.state.capital.breakdown).toContainEqual(
      expect.objectContaining({
        amountLabel: '€4,700,000',
        label: 'Net investable after fees',
      }),
    )
    expect(props.state.capital.details).toContainEqual(
      expect.objectContaining({
        description: 'Finance still needs to match received wires.',
        label: 'Matched funds',
        value: '€3,650,000',
      }),
    )
  })

  it('does not turn matched-only investor wires into reconciliation success', () => {
    const table = mapDealCommitmentsTableViewModel(getNorthstarData())

    if (table.state.kind !== 'ready') {
      throw new Error(`Expected ready commitments table state, received ${table.state.kind}`)
    }

    const julien = table.state.rows.find((row) => row.id === 'inv-julien-moreau')
    const alba = table.state.rows.find((row) => row.id === 'inv-alba')

    expect(julien?.readiness.reconciliation).toMatchObject({
      detail: 'Commitment: Wire matched | Wire: Matched',
      value: 'Matched, finance pending',
      variant: 'reconciling',
    })
    expect(julien?.status.label).toBe('In progress')
    expect(alba?.readiness.reconciliation).toMatchObject({
      detail: 'Commitment: Reconciled | Wire: Reconciled',
      value: 'Finance accepted',
      variant: 'reconciled',
    })
  })

  it('uses the same matched-pending wording in the commitment inspector', () => {
    const data = getNorthstarData()
    const props = mapDealCommitmentInspectorProps(data, 'inv-julien-moreau')

    if (props.state.kind !== 'ready') {
      throw new Error(`Expected ready inspector state, received ${props.state.kind}`)
    }

    expect(props.state.investor.status.label).toBe('Needs attention')
    expect(props.state.readiness.reconciliation).toMatchObject({
      detail: 'Commitment: Wire matched | Wire: Matched',
      tone: 'info',
      value: 'Matched, finance pending',
    })
    expect(props.state.nextAction).toBe('Review finance reconciliation before closing review.')
  })
})

const getNorthstarData = (): DealOperationalCenterDTO => {
  const result = getDealOperationalCenter({ dealId: 'northstar-energy' })

  if (result.isError()) {
    throw new Error(`Expected Northstar fixture, received ${result.error._tag}`)
  }

  return result.value
}
