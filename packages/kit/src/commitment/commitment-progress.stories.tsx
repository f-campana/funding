import { euroCentsFromMinorUnits } from '@repo/domain'

import { StoryGrid, StorySection } from '../stories/story-layout'
import { CommitmentProgress } from './commitment-progress'

const meta = {
  component: CommitmentProgress,
  title: 'Kit/CommitmentProgress',
}

export default meta

const labels = {
  committed: 'Committed',
  investors: 'Investors',
  remaining: 'Remaining',
  target: 'Target',
  title: 'Commitment progress',
  velocity: '7 day movement',
}

export const ProgressStates = {
  render: () => (
    <StorySection
      description="Radial progress clamps display state while keeping exact money rendering."
      title="Progress"
    >
      <StoryGrid>
        <CommitmentProgress
          committedAmount={euroCentsFromMinorUnits(1_875_000_00n)}
          investorCount={42}
          labels={labels}
          remainingAmount={euroCentsFromMinorUnits(625_000_00n)}
          targetAmount={euroCentsFromMinorUnits(2_500_000_00n)}
          velocity="+3 records"
        />
        <CommitmentProgress
          committedAmount={euroCentsFromMinorUnits(2_750_000_00n)}
          investorCount={58}
          labels={labels}
          targetAmount={euroCentsFromMinorUnits(2_500_000_00n)}
        />
        <CommitmentProgress
          committedAmount={euroCentsFromMinorUnits(0n)}
          investorCount={0}
          labels={labels}
          targetAmount={euroCentsFromMinorUnits(0n)}
        />
      </StoryGrid>
    </StorySection>
  ),
}
