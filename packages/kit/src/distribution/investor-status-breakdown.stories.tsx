import { StoryGrid, StorySection } from '../stories/story-layout'
import {
  InvestorStatusBreakdown,
  type InvestorStatusBreakdownItem,
} from './investor-status-breakdown'

const meta = {
  component: InvestorStatusBreakdown,
  title: 'Kit/InvestorStatusBreakdown',
}

export default meta

const items: readonly InvestorStatusBreakdownItem[] = [
  {
    count: 2,
    id: 'ready',
    label: 'Signed or wired',
    percentageBasisPoints: 3334,
  },
  {
    count: 1,
    id: 'kyc',
    label: 'KYC pending',
    percentageBasisPoints: 1667,
  },
  {
    count: 1,
    id: 'committed',
    label: 'Committed',
    percentageBasisPoints: 1667,
  },
  {
    count: 2,
    id: 'outreach',
    label: 'Reviewing or invited',
    percentageBasisPoints: 3332,
  },
]

export const ReviewStates = {
  render: () => (
    <StorySection
      description="Compact status mix for closing blockers and ready investors."
      title="Investor status"
    >
      <StoryGrid className="xl:grid-cols-2">
        <InvestorStatusBreakdown
          countLabel={(count) => `${count} ${count === 1 ? 'investor' : 'investors'}`}
          emptyLabel="No investor statuses yet."
          items={items}
          percentageLabel="Share"
          title="Investor status"
        />
        <InvestorStatusBreakdown
          emptyLabel="No investor statuses yet."
          items={[]}
          title="Investor status"
        />
      </StoryGrid>
    </StorySection>
  ),
}
