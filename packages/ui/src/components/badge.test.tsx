import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'

import { Badge } from './badge'

describe('Badge', () => {
  it('renders content with stable slot and variant data', () => {
    render(<Badge variant="secondary">Ready</Badge>)

    const badge = screen.getByText('Ready')

    expect(badge).toHaveAttribute('data-slot', 'badge')
    expect(badge).toHaveAttribute('data-variant', 'secondary')
  })

  it('covers public variants', () => {
    render(
      <div>
        <Badge>Default</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>,
    )

    expect(screen.getByText('Default')).toHaveAttribute('data-variant', 'default')
    expect(screen.getByText('Outline')).toHaveAttribute('data-variant', 'outline')
    expect(screen.getByText('Destructive')).toHaveAttribute('data-variant', 'destructive')
  })

  it('supports asChild composition', () => {
    render(
      <Badge asChild variant="outline">
        <a href="/open">Open</a>
      </Badge>,
    )

    const link = screen.getByRole('link', { name: 'Open' })

    expect(link).toHaveAttribute('data-slot', 'badge')
    expect(link).toHaveAttribute('href', '/open')
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(<Badge>Ready</Badge>)

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
