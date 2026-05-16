import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

describe('Card primitives', () => {
  it('renders card composition with stable slots', () => {
    render(
      <Card aria-label="Summary card" className="min-w-80">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Important details.</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Actions</CardFooter>
      </Card>,
    )

    expect(screen.getByLabelText('Summary card')).toHaveAttribute('data-slot', 'card')
    expect(screen.getByLabelText('Summary card')).toHaveClass('min-w-80')
    expect(screen.getByRole('heading', { name: 'Summary' })).toHaveAttribute(
      'data-slot',
      'card-title',
    )
    expect(screen.getByText('Important details.')).toHaveAttribute('data-slot', 'card-description')
    expect(screen.getByText('Content')).toHaveAttribute('data-slot', 'card-content')
    expect(screen.getByText('Actions')).toHaveAttribute('data-slot', 'card-footer')
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Important details.</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
