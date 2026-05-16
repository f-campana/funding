import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'

import { Button } from './button'
import { VisuallyHidden } from './visually-hidden'

describe('VisuallyHidden', () => {
  it('keeps text available to accessible names while hiding it visually', () => {
    render(
      <Button size="icon">
        <span aria-hidden>?</span>
        <VisuallyHidden>Help</VisuallyHidden>
      </Button>,
    )

    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument()
    expect(screen.getByText('Help')).toHaveAttribute('data-slot', 'visually-hidden')
    expect(screen.getByText('Help')).toHaveClass('sr-only')
  })

  it('supports asChild composition', () => {
    render(
      <VisuallyHidden asChild>
        <span>Hidden label</span>
      </VisuallyHidden>,
    )

    expect(screen.getByText('Hidden label')).toHaveAttribute('data-slot', 'visually-hidden')
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(
      <Button size="icon">
        <span aria-hidden>?</span>
        <VisuallyHidden>Help</VisuallyHidden>
      </Button>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
