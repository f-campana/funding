import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'

import { Button } from './button'

describe('Button', () => {
  it('renders an accessible button with stable slot data', () => {
    render(<Button>Continue</Button>)

    const button = screen.getByRole('button', { name: 'Continue' })

    expect(button).toHaveAttribute('data-slot', 'button')
    expect(button).toHaveAttribute('data-variant', 'default')
    expect(button).toHaveAttribute('data-size', 'default')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('forwards native props and merges custom classes', () => {
    render(
      <Button
        aria-label="Save"
        className="min-w-24"
        disabled
        name="intent"
        size="lg"
        variant="outline"
      />,
    )

    const button = screen.getByRole('button', { name: 'Save' })

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('name', 'intent')
    expect(button).toHaveAttribute('data-size', 'lg')
    expect(button).toHaveAttribute('data-variant', 'outline')
    expect(button).toHaveClass('min-w-24')
  })

  it('supports rendering through asChild', () => {
    render(
      <Button asChild>
        <a href="/next">Next</a>
      </Button>,
    )

    const link = screen.getByRole('link', { name: 'Next' })

    expect(link).toHaveAttribute('data-slot', 'button')
    expect(link).toHaveAttribute('href', '/next')
    expect(link).not.toHaveAttribute('type')
  })

  it('covers public variants and icon size', () => {
    render(
      <div>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button aria-label="Icon" size="icon" />
      </div>,
    )

    expect(screen.getByRole('button', { name: 'Secondary' })).toHaveAttribute(
      'data-variant',
      'secondary',
    )
    expect(screen.getByRole('button', { name: 'Destructive' })).toHaveAttribute(
      'data-variant',
      'destructive',
    )
    expect(screen.getByRole('button', { name: 'Ghost' })).toHaveAttribute('data-variant', 'ghost')
    expect(screen.getByRole('button', { name: 'Link' })).toHaveAttribute('data-variant', 'link')
    expect(screen.getByRole('button', { name: 'Icon' })).toHaveAttribute('data-size', 'icon')
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(<Button>Continue</Button>)

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
