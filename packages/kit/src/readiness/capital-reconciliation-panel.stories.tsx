import {
  type CapitalReconciliationInput,
  reconciliationFixtures,
  summarizeCapitalReconciliation,
} from '@repo/domain/reconciliation'

import { StorySection } from '../stories/story-layout'
import { CapitalReconciliationPanel } from './capital-reconciliation-panel'

const meta = {
  component: CapitalReconciliationPanel,
  title: 'Kit/Readiness/CapitalReconciliationPanel',
}

export default meta

const labels = {
  committed: 'Committed',
  description: 'Committed, signed, received, and matched capital remain separate.',
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

const summaryFor = (input: CapitalReconciliationInput) => {
  const result = summarizeCapitalReconciliation(input)

  if (result.isError()) {
    throw new Error(result.error._tag)
  }

  return result.value
}

const renderPanel = (input: CapitalReconciliationInput) => (
  <CapitalReconciliationPanel labels={labels} summary={summaryFor(input)} />
)

export const OnTrack = {
  render: () => (
    <StorySection title="On-track reconciliation">
      {renderPanel(reconciliationFixtures.onTrack)}
    </StorySection>
  ),
}

export const UnmatchedFunds = {
  render: () => (
    <StorySection title="Unmatched funds">
      {renderPanel(reconciliationFixtures.blockedUnmatchedFunds)}
    </StorySection>
  ),
}

export const OverTarget = {
  render: () => (
    <StorySection title="Over target">
      {renderPanel(reconciliationFixtures.overTarget)}
    </StorySection>
  ),
}

export const NotStarted = {
  render: () => (
    <StorySection title="Not started">
      {renderPanel(reconciliationFixtures.notStarted)}
    </StorySection>
  ),
}
