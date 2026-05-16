import { euroCentsFromMinorUnits } from '@repo/domain'

import { MoneyDisplay } from '../money'
import { StorySection } from '../stories/story-layout'
import { DealTermsPanel } from './deal-terms-panel'

const meta = {
  component: DealTermsPanel,
  title: 'Kit/DealTermsPanel',
}

export default meta

export const Terms = {
  render: () => (
    <StorySection
      description="A compact term/value list for deal documentation."
      title="Deal terms"
    >
      <DealTermsPanel
        terms={[
          {
            description: 'Equity round through a single dedicated vehicle.',
            id: 'instrument',
            label: 'Instrument',
            value: 'SPV subscription',
          },
          {
            id: 'minimum-ticket',
            label: 'Minimum ticket',
            value: <MoneyDisplay amount={euroCentsFromMinorUnits(50_000_00n)} />,
          },
          {
            id: 'carry',
            label: 'Carried interest',
            value: '10%',
          },
          {
            id: 'jurisdiction',
            label: 'Vehicle jurisdiction',
            value: 'Luxembourg',
          },
        ]}
        title="Deal terms"
      />
    </StorySection>
  ),
}
