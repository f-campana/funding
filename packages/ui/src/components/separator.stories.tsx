import { StorySection } from '../stories/story-layout'
import { Separator } from './separator'

const meta = {
  component: Separator,
  title: 'UI/Separator',
}

export default meta

export const Horizontal = {
  render: () => (
    <StorySection
      description="Use non-decorative separators when they convey structure."
      title="Horizontal"
    >
      <div className="flex w-80 flex-col gap-4">
        <p>Section one</p>
        <Separator decorative={false} />
        <p>Section two</p>
      </div>
    </StorySection>
  ),
}

export const Vertical = {
  render: () => (
    <div className="flex h-12 items-center gap-4">
      <span>Left</span>
      <Separator decorative={false} orientation="vertical" />
      <span>Right</span>
    </div>
  ),
}
