import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import { DealDashboardDemo } from './deal-dashboard-demo'

describe('DealDashboardDemo', () => {
  it('renders the composed dashboard surface', () => {
    const { container } = render(<DealDashboardDemo />)

    expect(container.querySelector('[data-slot="deal-dashboard-demo"]')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Northstar Energy SPV' })).toBeInTheDocument()
    expect(container.querySelector('[data-slot="closing-readiness-summary"]')).toHaveAttribute(
      'data-state',
      'blocked',
    )
    expect(screen.getByRole('heading', { name: 'Close is blocked' })).toBeInTheDocument()
    expect(screen.getByText('KYC evidence blocks signing')).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="capital-reconciliation-panel"]'),
    ).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Commitment progress' })).toBeInTheDocument()
    expect(container.querySelector('[data-slot="spv-state-tracker"]')).toHaveAttribute(
      'data-variant',
      'compact',
    )
    expect(container.querySelector('[data-slot="ticket-distribution"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="investor-status-breakdown"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="activity-timeline"]')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="investor-row"]')).toHaveLength(6)
  })

  it('keeps the KPI strip separate from right rail modules', () => {
    const { container } = render(<DealDashboardDemo />)
    const dashboard = container.querySelector('[data-slot="deal-dashboard-demo"]')
    const layout = container.querySelector('[data-slot="deal-dashboard-layout"]')
    const main = container.querySelector('[data-slot="deal-dashboard-main"]')
    const metricCards = container.querySelectorAll('[data-slot="metric-card"]')

    expect(container.querySelectorAll('[data-slot="closing-blocker-item"]')).toHaveLength(3)
    expect(layout).toHaveClass('items-start')
    expect(main).toHaveClass('content-start')
    expect(dashboard?.querySelector('[data-slot="spv-lifecycle-panel"]')).toBeInTheDocument()
    expect(metricCards).toHaveLength(0)
    const rail = container.querySelector('[data-slot="spv-lifecycle-panel"]')?.closest('aside')

    expect(rail).not.toBeNull()
    expect(rail).toHaveClass('grid')
    expect(rail).toHaveClass('content-start')
  })

  it('keeps narrow secondary context collapsed behind disclosure sections', () => {
    const { container } = render(<DealDashboardDemo />)
    const mobileSecondary = container.querySelector('[data-slot="deal-dashboard-mobile-secondary"]')
    const secondarySections = mobileSecondary?.querySelectorAll('details')

    expect(mobileSecondary).toHaveClass('grid')
    expect(mobileSecondary).toHaveClass('gap-3')
    expect(secondarySections).toHaveLength(5)
    for (const section of secondarySections ?? []) {
      expect(section).not.toHaveAttribute('open')
    }
    expect(screen.getByRole('heading', { name: 'Investor commitments' })).toBeInTheDocument()
    expect(screen.getByText('KYC evidence blocks signing')).toBeInTheDocument()
  })

  it('reveals secondary mobile context only after disclosure is opened', async () => {
    const user = userEvent.setup()
    const { container } = render(<DealDashboardDemo />)
    const mobileSecondary = container.querySelector('[data-slot="deal-dashboard-mobile-secondary"]')
    const spvSection = Array.from(mobileSecondary?.querySelectorAll('details') ?? []).find(
      (section) => section.querySelector('summary')?.textContent === 'SPV lifecycle',
    )
    const spvSummary = spvSection?.querySelector('summary')

    expect(spvSection).not.toHaveAttribute('open')
    expect(spvSection?.querySelector('[data-slot="spv-state-tracker"]')).not.toBeInTheDocument()

    await user.click(spvSummary as HTMLElement)

    expect(spvSection).toHaveAttribute('open')
    expect(spvSection?.querySelector('[data-slot="spv-state-tracker"]')).toBeInTheDocument()
  })

  it('has no obvious accessibility violations', async () => {
    const { container } = render(<DealDashboardDemo />)

    expect((await axe(container)).violations).toHaveLength(0)
  })

  it('renders ready and attention dashboard states for review stories', () => {
    const { container, rerender } = render(<DealDashboardDemo readinessState="ready" />)

    expect(container.querySelector('[data-slot="closing-readiness-summary"]')).toHaveAttribute(
      'data-state',
      'ready',
    )
    expect(screen.getByText('No blockers for the next close.')).toBeInTheDocument()

    rerender(<DealDashboardDemo readinessState="attention" />)

    expect(container.querySelector('[data-slot="closing-readiness-summary"]')).toHaveAttribute(
      'data-state',
      'attention',
    )
    expect(screen.getByText('Signed investor has not funded')).toBeInTheDocument()
  })
})
