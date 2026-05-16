import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'

import { Field, FieldError, FieldLabel } from './field'
import { Input } from './input'

describe('Input', () => {
  it('associates labels with controls and exposes a stable slot', () => {
    render(
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input id="name" name="name" placeholder="Enter name" />
      </Field>,
    )

    const input = screen.getByLabelText('Name')

    expect(input).toHaveAttribute('data-slot', 'input')
    expect(input).toHaveAttribute('name', 'name')
    expect(input).toHaveAttribute('placeholder', 'Enter name')
  })

  it('forwards invalid and disabled native props', () => {
    render(
      <Field data-invalid="true">
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input aria-describedby="email-error" aria-invalid disabled id="email" />
        <FieldError id="email-error">Enter a value.</FieldError>
      </Field>,
    )

    const input = screen.getByLabelText('Email')

    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-error')
  })

  it('merges custom classes with base classes', () => {
    render(<Input aria-label="Reference" className="min-w-24" />)

    expect(screen.getByLabelText('Reference')).toHaveClass('min-w-24')
  })

  it('has no accessibility violations in a representative field', async () => {
    const { container } = render(
      <Field>
        <FieldLabel htmlFor="reference">Reference</FieldLabel>
        <Input id="reference" />
      </Field>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
