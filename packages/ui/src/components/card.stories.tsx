import { StorySection } from '../stories/story-layout'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

const meta = {
  component: Card,
  title: 'UI/Card',
}

export default meta

export const Default = {
  render: () => (
    <StorySection
      description="Cards frame repeated items, tools, and summaries."
      title="Composition"
    >
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>A compact container for related content.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Use cards for repeated items or framed tools.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Continue</Button>
          <Button size="sm" variant="outline">
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </StorySection>
  ),
}
