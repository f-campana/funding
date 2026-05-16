import { Button } from './button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

const meta = {
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'UI/Tooltip',
}

export default meta

export const Default = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover or focus</Button>
        </TooltipTrigger>
        <TooltipContent>Additional context</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}
