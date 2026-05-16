import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { axe } from '../test/axe'
import { ActivityTimeline, type ActivityTimelineItem } from './activity-timeline'

const items: readonly ActivityTimelineItem[] = [
  {
    description: 'Wire matched to the SPV account.',
    id: 'wire',
    label: 'Wire received',
    timestamp: '8 May 2026, 09:15',
    tone: 'success',
  },
  {
    description: 'Proof of address needs a refresh.',
    id: 'kyc',
    label: 'KYC evidence requested',
    timestamp: '7 May 2026, 16:20',
    tone: 'warning',
  },
]

describe('ActivityTimeline', () => {
  it('renders timeline items with tone state and timestamps', () => {
    const { container } = render(<ActivityTimeline items={items} title="Activity timeline" />)

    expect(container.querySelector('[data-slot="activity-timeline"]')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Activity timeline' })).toBeInTheDocument()
    expect(screen.getByText('Wire received')).toBeInTheDocument()
    expect(screen.getByText('8 May 2026, 09:15')).toBeInTheDocument()
    expect(screen.getByText('Proof of address needs a refresh.')).toBeInTheDocument()
    expect(screen.getByText('KYC evidence requested').closest('li')).toHaveAttribute(
      'data-tone',
      'warning',
    )
  })

  it('renders an empty state safely', () => {
    const { container } = render(
      <ActivityTimeline emptyLabel="No recent activity." items={[]} title="Activity timeline" />,
    )

    expect(screen.getByText('No recent activity.')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="activity-timeline-item"]')).not.toBeInTheDocument()
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(<ActivityTimeline items={items} title="Activity timeline" />)

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
