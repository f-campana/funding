import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'

import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('renders a loading placeholder with stable slot data', () => {
    const { container } = render(<Skeleton className="h-4 w-32" />)

    const skeleton = container.querySelector('[data-slot="skeleton"]')

    expect(skeleton).toHaveAttribute('data-slot', 'skeleton')
    expect(skeleton).toHaveClass('h-4')
    expect(skeleton).toHaveClass('w-32')
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(<Skeleton className="h-4 w-32" />)

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
