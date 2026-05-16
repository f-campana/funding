import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'

import { Separator } from './separator'

describe('Separator', () => {
  it('renders a semantic separator when decorative is false', () => {
    render(<Separator decorative={false} />)

    const separator = screen.getByRole('separator')

    expect(separator).toHaveAttribute('data-slot', 'separator')
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('supports vertical orientation', () => {
    render(<Separator decorative={false} orientation="vertical" />)

    const separator = screen.getByRole('separator')

    expect(separator).toHaveAttribute('data-orientation', 'vertical')
    expect(separator).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(<Separator decorative={false} />)

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
