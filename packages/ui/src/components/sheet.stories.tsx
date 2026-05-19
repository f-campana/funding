import { StoryRow, StorySection, StoryStack } from '../stories/story-layout'
import { Button } from './button'
import {
  Sheet,
  SheetClose,
  SheetCloseButton,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'

const meta = {
  component: SheetContent,
  title: 'UI/Sheet',
}

export default meta

const SheetExample = ({ side = 'right' }: { side?: 'top' | 'right' | 'bottom' | 'left' }) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline">Open {side}</Button>
    </SheetTrigger>
    <SheetContent side={side}>
      <SheetHeader>
        <SheetTitle>Panel details</SheetTitle>
        <SheetDescription>Review the current context and choose the next action.</SheetDescription>
      </SheetHeader>
      <SheetCloseButton />
      <dl className="grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-medium">Ready for review</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Updated</dt>
          <dd className="font-medium">Today</dd>
        </div>
      </dl>
      <SheetFooter>
        <SheetClose asChild>
          <Button variant="outline">Cancel</Button>
        </SheetClose>
        <SheetClose asChild>
          <Button>Done</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)

export const Right = {
  render: () => (
    <StorySection description="Default side placement uses a right-side panel." title="Right">
      <SheetExample />
    </StorySection>
  ),
}

export const Sides = {
  render: () => (
    <StoryStack>
      <StorySection description="Each side uses the same accessible primitive." title="Sides">
        <StoryRow>
          <SheetExample side="top" />
          <SheetExample side="right" />
          <SheetExample side="bottom" />
          <SheetExample side="left" />
        </StoryRow>
      </StorySection>
    </StoryStack>
  ),
}
