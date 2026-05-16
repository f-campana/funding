import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import { DealTermsPanel } from './deal-terms-panel'

describe('DealTermsPanel', () => {
  it('renders title, labels, values, and optional descriptions exactly as provided', () => {
    const { container } = render(
      <DealTermsPanel
        terms={[
          {
            description: 'Subscription through a dedicated vehicle.',
            id: 'instrument',
            label: 'Instrument',
            value: 'SPV subscription',
          },
          {
            id: 'carry',
            label: 'Carried interest',
            value: '10%',
          },
        ]}
        title="Deal terms"
      />,
    )

    expect(container.querySelector('[data-slot="deal-terms-panel"]')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Deal terms' })).toBeInTheDocument()
    expect(screen.getByText('Instrument')).toBeInTheDocument()
    expect(screen.getByText('SPV subscription')).toBeInTheDocument()
    expect(screen.getByText('Subscription through a dedicated vehicle.')).toBeInTheDocument()
    expect(screen.getByText('Carried interest')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
  })

  it('renders no rows for an empty term array', () => {
    const { container } = render(<DealTermsPanel terms={[]} title="Deal terms" />)

    expect(screen.getByRole('heading', { name: 'Deal terms' })).toBeInTheDocument()
    expect(container.querySelectorAll('dt')).toHaveLength(0)
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(
      <DealTermsPanel
        terms={[{ id: 'instrument', label: 'Instrument', value: 'SPV subscription' }]}
        title="Deal terms"
      />,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
