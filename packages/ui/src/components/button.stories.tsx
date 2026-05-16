import { StoryRow, StorySection, StoryStack } from '../stories/story-layout'
import { Button } from './button'

const meta = {
  component: Button,
  title: 'UI/Button',
}

export default meta

export const Variants = {
  render: () => (
    <StoryStack>
      <StorySection
        description="Each variant keeps color choices on semantic tokens."
        title="Variants"
      >
        <StoryRow>
          <Button>Continue</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="link">Link</Button>
        </StoryRow>
      </StorySection>
    </StoryStack>
  ),
}

export const Sizes = {
  render: () => (
    <StorySection description="Icon buttons need an accessible label." title="Sizes">
      <StoryRow>
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">Large</Button>
        <Button aria-label="Add item" size="icon">
          +
        </Button>
      </StoryRow>
    </StorySection>
  ),
}

export const Disabled = {
  render: () => <Button disabled>Unavailable</Button>,
}
