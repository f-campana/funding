import { StorySection } from '../stories/story-layout'
import { Skeleton } from './skeleton'

const meta = {
  component: Skeleton,
  title: 'UI/Skeleton',
}

export default meta

export const Default = {
  render: () => (
    <StorySection
      description="Skeletons should mimic the shape of pending content."
      title="Loading"
    >
      <div className="flex w-80 flex-col gap-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-full" />
      </div>
    </StorySection>
  ),
}
