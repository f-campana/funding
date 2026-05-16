import { euroCentsFromMinorUnits } from '@repo/domain'

import { StoryGrid, StorySection } from '../stories/story-layout'
import { TicketDistribution, type TicketDistributionSegment } from './ticket-distribution'

const meta = {
  component: TicketDistribution,
  title: 'Kit/TicketDistribution',
}

export default meta

const segments: readonly TicketDistributionSegment[] = [
  {
    amount: euroCentsFromMinorUnits(1_275_000_00n),
    id: 'large',
    investorCount: 2,
    label: '500k plus tickets',
    percentageBasisPoints: 6800,
  },
  {
    amount: euroCentsFromMinorUnits(525_000_00n),
    id: 'core',
    investorCount: 3,
    label: '100k to 499k tickets',
    percentageBasisPoints: 2800,
  },
  {
    amount: euroCentsFromMinorUnits(75_000_00n),
    id: 'small',
    investorCount: 1,
    label: 'Under 100k tickets',
    percentageBasisPoints: 400,
  },
]

export const ReviewStates = {
  render: () => (
    <StorySection
      description="Chart-backed operating context for ticket concentration."
      title="Ticket distribution"
    >
      <StoryGrid className="xl:grid-cols-2">
        <TicketDistribution
          amountLabel="Amount"
          emptyLabel="No committed tickets yet."
          investorCountLabel={(count) => `${count} ${count === 1 ? 'investor' : 'investors'}`}
          percentageLabel="Share"
          segments={segments}
          title="Ticket distribution"
        />
        <TicketDistribution
          emptyLabel="No committed tickets yet."
          segments={[]}
          title="Ticket distribution"
        />
      </StoryGrid>
    </StorySection>
  ),
}
