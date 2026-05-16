import {
  northstarCapitalSummariesByReadiness,
  northstarDealFixture,
  northstarReadinessCopyByState,
} from '../fixtures'
import { StoryGrid, StorySection } from '../stories/story-layout'
import { DealProgressCard } from './deal-progress-card'

const meta = {
  component: DealProgressCard,
  title: 'Kit/DealProgressCard',
}

export default meta

const labels = {
  committed: 'Committed',
  deadline: 'Deadline',
  lifecycle: 'Lifecycle',
  matched: 'Matched',
  nextAction: 'Next action',
  progress: 'Commitment progress',
  target: 'Target',
}

export const AwaitingWires = {
  render: () => (
    <StorySection title="Awaiting wires">
      <div className="w-full max-w-sm">
        <DealProgressCard
          committedAmount={northstarCapitalSummariesByReadiness.blocked.committedAmountCents}
          deadlineLabel={northstarReadinessCopyByState.blocked.deadline}
          labels={labels}
          lifecycleState="awaiting_wires"
          matchedAmount={northstarCapitalSummariesByReadiness.blocked.matchedAmountCents}
          nextActionLabel="Resolve critical blockers before close"
          supportingText="Persistent right-rail status for the active deal."
          targetAmount={northstarCapitalSummariesByReadiness.blocked.targetAmountCents}
          title="Deal progress"
        />
      </div>
    </StorySection>
  ),
}

export const ClosingReview = {
  render: () => (
    <StorySection title="Closing review">
      <div className="w-full max-w-sm">
        <DealProgressCard
          committedAmount={northstarCapitalSummariesByReadiness.ready.committedAmountCents}
          deadlineLabel={northstarDealFixture.closingReviewDateLabel}
          labels={labels}
          lifecycleState="closing_review"
          matchedAmount={northstarCapitalSummariesByReadiness.ready.matchedAmountCents}
          nextActionLabel="Proceed to closing review"
          targetAmount={northstarCapitalSummariesByReadiness.ready.targetAmountCents}
          title="Deal progress"
        />
      </div>
    </StorySection>
  ),
}

const lifecycleStates = [
  { nextAction: 'Complete internal review pack', state: 'draft', title: 'Draft' },
  {
    nextAction: 'Open allocations for investors',
    state: 'collecting_commitments',
    title: 'Collecting',
  },
  {
    nextAction: 'Resolve critical blockers before close',
    state: 'awaiting_wires',
    title: 'Awaiting wires',
  },
  { nextAction: 'Proceed to closing review', state: 'closing_review', title: 'Closing review' },
  { nextAction: 'Monitor portfolio onboarding', state: 'closed', title: 'Closed' },
  { nextAction: 'Record cancellation memo', state: 'cancelled', title: 'Cancelled' },
] as const

export const LifecycleStates = {
  render: () => (
    <StorySection title="Lifecycle state review">
      <StoryGrid className="xl:grid-cols-3">
        {lifecycleStates.map((item) => (
          <DealProgressCard
            committedAmount={northstarCapitalSummariesByReadiness.blocked.committedAmountCents}
            deadlineLabel={northstarReadinessCopyByState.blocked.deadline}
            key={item.state}
            labels={labels}
            lifecycleState={item.state}
            matchedAmount={northstarCapitalSummariesByReadiness.blocked.matchedAmountCents}
            nextActionLabel={item.nextAction}
            supportingText="Right-rail command state for the active deal."
            targetAmount={northstarCapitalSummariesByReadiness.blocked.targetAmountCents}
            title={item.title}
          />
        ))}
      </StoryGrid>
    </StorySection>
  ),
}
