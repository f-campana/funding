import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import { MetricCard } from './metric-card'

describe('MetricCard', () => {
  it('renders a labeled value with optional description and trend', () => {
    const { container } = render(
      <MetricCard
        description="Updated from received wires."
        label="Committed capital"
        trend="+12%"
        value="€1,250,000.00"
      />,
    )

    expect(container.querySelector('[data-slot="metric-card"]')).toBeInTheDocument()
    expect(screen.getByText('Committed capital')).toBeInTheDocument()
    expect(screen.getByText('€1,250,000.00')).toBeInTheDocument()
    expect(screen.getByText('+12%')).toBeInTheDocument()
    expect(screen.getByText('Updated from received wires.')).toBeInTheDocument()
  })

  it('supports a minimal metric without optional copy', () => {
    const { container } = render(<MetricCard label="Investors" value="42" />)

    expect(container.querySelector('[data-slot="metric-card"]')).toHaveAttribute(
      'data-emphasis',
      'standard',
    )
    expect(screen.getByText('Investors')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.queryByText('+12%')).not.toBeInTheDocument()
  })

  it('supports primary emphasis for the operating metric', () => {
    const { container } = render(<MetricCard emphasis="primary" label="Committed" value="75%" />)

    expect(container.querySelector('[data-slot="metric-card"]')).toHaveAttribute(
      'data-emphasis',
      'primary',
    )
    expect(screen.getByText('75%')).toHaveClass('text-[clamp(1.5rem,2vw,1.75rem)]')
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(
      <MetricCard description="All signed commitments." label="Investors" value="42" />,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
