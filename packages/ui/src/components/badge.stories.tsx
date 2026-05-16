import { StoryRow, StorySection } from '../stories/story-layout'
import { Badge } from './badge'

const meta = {
  component: Badge,
  title: 'UI/Badge',
}

export default meta

export const Variants = {
  render: () => (
    <StorySection description="Badges are compact metadata, not action buttons." title="Variants">
      <StoryRow>
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </StoryRow>
    </StorySection>
  ),
}

export const Link = {
  render: () => (
    <Badge asChild variant="outline">
      <a href="/">Open</a>
    </Badge>
  ),
}
