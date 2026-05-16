import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'

import { Progress } from './progress'

describe('Progress', () => {
  it('renders an accessible progressbar with stable slots', () => {
    const { container } = render(<Progress aria-label="Loading" value={40} />)

    const progress = screen.getByRole('progressbar', { name: 'Loading' })

    expect(progress).toHaveAttribute('data-slot', 'progress')
    expect(progress).toHaveAttribute('aria-valuenow', '40')
    expect(progress).toHaveAttribute('aria-valuemax', '100')
    expect(container.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({
      transform: 'translateX(-60%)',
    })
  })

  it('clamps values to the supported range', () => {
    const { container } = render(<Progress aria-label="Clamped" value={150} />)

    expect(screen.getByRole('progressbar', { name: 'Clamped' })).toHaveAttribute(
      'aria-valuenow',
      '100',
    )
    expect(container.querySelector('[data-slot="progress-indicator"]')).toHaveStyle({
      transform: 'translateX(-0%)',
    })
  })

  it('supports indeterminate progress', () => {
    render(<Progress aria-label="Waiting" value={null} />)

    expect(screen.getByRole('progressbar', { name: 'Waiting' })).not.toHaveAttribute(
      'aria-valuenow',
    )
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(<Progress aria-label="Loading" value={40} />)

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
