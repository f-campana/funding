import { euroCentsFromMinorUnits } from '@repo/domain'

import { MoneyDisplay } from '../money'
import { StoryGrid, StorySection } from '../stories/story-layout'
import { MetricCard } from './metric-card'

const meta = {
  component: MetricCard,
  title: 'Kit/MetricCard',
}

export default meta

export const DashboardMetrics = {
  render: () => (
    <StorySection
      description="Compact financial summaries composed from generic cards."
      title="Metrics"
    >
      <StoryGrid>
        <MetricCard
          description="Signed commitments and received wires."
          emphasis="primary"
          label="Committed capital"
          trend="75% target"
          value={<MoneyDisplay amount={euroCentsFromMinorUnits(1_875_000_00n)} />}
        />
        <MetricCard
          description="Active SPV lifecycle stage."
          label="SPV status"
          value="Collecting"
        />
        <MetricCard
          description="Investors with active commitments."
          label="Investor count"
          value="42"
        />
      </StoryGrid>
    </StorySection>
  ),
}
