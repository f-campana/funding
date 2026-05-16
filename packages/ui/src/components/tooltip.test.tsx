import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'

import { Button } from './button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

describe('Tooltip', () => {
  it('reveals content on keyboard focus and exposes stable slots', async () => {
    const user = userEvent.setup()

    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Details</Button>
          </TooltipTrigger>
          <TooltipContent>Full record label</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    await user.tab()

    expect(screen.getByRole('tooltip')).toHaveTextContent('Full record label')
    expect(document.querySelector('[data-slot="tooltip-content"]')).toBeInTheDocument()
  })

  it('has no accessibility violations in a representative composition', async () => {
    const { container } = render(
      <TooltipProvider delayDuration={0}>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button>Details</Button>
          </TooltipTrigger>
          <TooltipContent>Full record label</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
