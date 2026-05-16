import { StorySection } from '../stories/story-layout'
import { Button } from './button'
import { VisuallyHidden } from './visually-hidden'

const meta = {
  component: VisuallyHidden,
  title: 'UI/VisuallyHidden',
}

export default meta

export const Label = {
  render: () => (
    <StorySection
      description="Icon-only controls still need an accessible name."
      title="Hidden label"
    >
      <Button size="icon">
        <span aria-hidden>?</span>
        <VisuallyHidden>Help</VisuallyHidden>
      </Button>
    </StorySection>
  ),
}
