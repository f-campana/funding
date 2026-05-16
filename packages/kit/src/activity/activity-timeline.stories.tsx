import { StoryGrid, StorySection } from '../stories/story-layout'
import { ActivityTimeline, type ActivityTimelineItem } from './activity-timeline'

const meta = {
  component: ActivityTimeline,
  title: 'Kit/ActivityTimeline',
}

export default meta

const items: readonly ActivityTimelineItem[] = [
  {
    description: 'Belair Capital completed its subscription bulletin.',
    id: 'signed-belair',
    label: 'Subscription package signed',
    timestamp: '8 May 2026, 10:40',
    tone: 'success',
  },
  {
    description: 'Wire confirmation matched Camille Moreau to the SPV account.',
    id: 'wire-camille',
    label: 'Wire received',
    timestamp: '8 May 2026, 09:15',
    tone: 'success',
  },
  {
    description: 'A proof of address refresh is required before signing.',
    id: 'kyc-elise',
    label: 'KYC evidence requested',
    timestamp: '7 May 2026, 16:20',
    tone: 'warning',
  },
]

export const ReviewStates = {
  render: () => (
    <StorySection
      description="Compact operational feed for recent closing work."
      title="Activity timeline"
    >
      <StoryGrid className="xl:grid-cols-2">
        <ActivityTimeline
          emptyLabel="No recent activity."
          items={items}
          title="Activity timeline"
        />
        <ActivityTimeline emptyLabel="No recent activity." items={[]} title="Activity timeline" />
      </StoryGrid>
    </StorySection>
  ),
}
