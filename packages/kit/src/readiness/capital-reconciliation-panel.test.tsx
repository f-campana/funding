import {
  type CapitalReconciliationInput,
  reconciliationFixtures,
  summarizeCapitalReconciliation,
} from '@repo/domain/reconciliation'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import { CapitalReconciliationPanel } from './capital-reconciliation-panel'

const labels = {
  committed: 'Committed',
  description: 'Capital by operational stage.',
  matched: 'Matched',
  overTarget: 'Over target',
  received: 'Received',
  remaining: 'Remaining',
  signed: 'Signed',
  target: 'Target',
  title: 'Capital reconciliation',
  unfunded: 'Unfunded committed',
  unmatched: 'Unmatched received',
}

const remainingAmountPattern = /625\s?000,00/
const unmatchedAmountPattern = /125\s?000,00/
const unfundedAmountPattern = /1\s?125\s?000,00/
const overTargetAmountPattern = /250\s?000,00/
const zeroAmountPattern = /0,00/

const summaryFor = (input: CapitalReconciliationInput) => {
  const result = summarizeCapitalReconciliation(input)

  if (result.isError()) {
    throw new Error(result.error._tag)
  }

  return result.value
}

describe('CapitalReconciliationPanel', () => {
  it('renders committed, signed, received, matched, and remaining capital', () => {
    render(
      <CapitalReconciliationPanel
        labels={labels}
        summary={summaryFor(reconciliationFixtures.onTrack)}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Capital reconciliation' })).toBeInTheDocument()
    expect(screen.getByText('Committed')).toBeInTheDocument()
    expect(screen.getByText('Signed')).toBeInTheDocument()
    expect(screen.getByText('Received')).toBeInTheDocument()
    expect(screen.getByText('Matched')).toBeInTheDocument()
    expect(screen.getByText('Remaining')).toBeInTheDocument()
    expect(screen.getByText(remainingAmountPattern)).toBeInTheDocument()
  })

  it('renders unmatched and unfunded capital from the domain summary', () => {
    render(
      <CapitalReconciliationPanel
        labels={labels}
        summary={summaryFor(reconciliationFixtures.blockedUnmatchedFunds)}
      />,
    )

    expect(screen.getByText('Unmatched received')).toBeInTheDocument()
    expect(screen.getAllByText(unmatchedAmountPattern).length).toBeGreaterThan(0)
    expect(screen.getByText('Unfunded committed')).toBeInTheDocument()
    expect(screen.getByText(unfundedAmountPattern)).toBeInTheDocument()
  })

  it('renders over-target and not-started cases', () => {
    const { rerender } = render(
      <CapitalReconciliationPanel
        labels={labels}
        summary={summaryFor(reconciliationFixtures.overTarget)}
      />,
    )

    expect(screen.getByText('Over target')).toBeInTheDocument()
    expect(screen.getAllByText(overTargetAmountPattern).length).toBeGreaterThan(0)

    rerender(
      <CapitalReconciliationPanel
        labels={labels}
        summary={summaryFor(reconciliationFixtures.notStarted)}
      />,
    )

    expect(screen.getAllByText(zeroAmountPattern).length).toBeGreaterThan(0)
  })

  it('has no obvious accessibility violations', async () => {
    const { container } = render(
      <CapitalReconciliationPanel
        labels={labels}
        summary={summaryFor(reconciliationFixtures.onTrack)}
      />,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
