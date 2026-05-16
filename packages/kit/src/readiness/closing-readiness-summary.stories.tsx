import { euroCentsFromMinorUnits } from '@repo/domain'

import { StoryGrid, StorySection } from '../stories/story-layout'
import { type ClosingReadinessState, ClosingReadinessSummary } from './closing-readiness-summary'

const meta = {
  component: ClosingReadinessSummary,
  title: 'Kit/Readiness/ClosingReadinessSummary',
}

export default meta

const labels = {
  blockers: 'blockers',
  closingDate: 'Closing review',
  deadline: 'Deadline',
  lastUpdated: 'Last updated',
  remaining: 'Remaining',
}

const copy: Record<
  ClosingReadinessState,
  { title: string; description: string; blockers: number }
> = {
  attention: {
    blockers: 2,
    description: 'Work remains, but no critical dependency blocks the next close review.',
    title: 'Attention needed before close',
  },
  blocked: {
    blockers: 3,
    description:
      'Critical investor evidence and payment matching need review before close progress.',
    title: 'Close is blocked',
  },
  not_started: {
    blockers: 0,
    description: 'Operational data is not complete enough to assess the next close.',
    title: 'Readiness not started',
  },
  ready: {
    blockers: 0,
    description: 'No known blocker is preventing the next closing action.',
    title: 'Ready for close review',
  },
}

const renderState = (state: ClosingReadinessState) => (
  <ClosingReadinessSummary
    blockerCount={copy[state].blockers}
    closingDateLabel="24 May 2026"
    deadlineLabel="5 days"
    description={copy[state].description}
    labels={labels}
    lastUpdatedLabel="10 May 2026, 09:30"
    remainingAmount={euroCentsFromMinorUnits(state === 'ready' ? 0n : 625_000_00n)}
    state={state}
    title={copy[state].title}
  />
)

export const Ready = {
  render: () => <StorySection title="Ready">{renderState('ready')}</StorySection>,
}
export const Attention = {
  render: () => <StorySection title="Attention">{renderState('attention')}</StorySection>,
}
export const Blocked = {
  render: () => <StorySection title="Blocked">{renderState('blocked')}</StorySection>,
}
export const NotStarted = {
  render: () => <StorySection title="Not started">{renderState('not_started')}</StorySection>,
}
export const AllStates = {
  render: () => (
    <StorySection title="All readiness states">
      <StoryGrid className="xl:grid-cols-2">
        {renderState('blocked')}
        {renderState('attention')}
        {renderState('ready')}
        {renderState('not_started')}
      </StoryGrid>
    </StorySection>
  ),
}
