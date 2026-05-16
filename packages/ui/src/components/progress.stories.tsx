import { StoryStack } from '../stories/story-layout'
import { Progress } from './progress'

const meta = {
  component: Progress,
  title: 'UI/Progress',
}

export default meta

export const Default = {
  render: () => (
    <StoryStack className="w-80">
      <Progress aria-label="Loading progress" value={48} />
    </StoryStack>
  ),
}

export const Complete = {
  render: () => (
    <StoryStack className="w-80">
      <Progress aria-label="Complete progress" value={100} />
    </StoryStack>
  ),
}
