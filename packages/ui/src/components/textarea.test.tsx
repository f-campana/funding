import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'

import { Field, FieldError, FieldLabel } from './field'
import { Textarea } from './textarea'

describe('Textarea', () => {
  it('renders a labeled multiline control with stable slot data', () => {
    render(
      <Field>
        <FieldLabel htmlFor="notes">Notes</FieldLabel>
        <Textarea id="notes" name="notes" placeholder="Add notes" rows={4} />
      </Field>,
    )

    const textarea = screen.getByLabelText('Notes')

    expect(textarea).toHaveAttribute('data-slot', 'textarea')
    expect(textarea).toHaveAttribute('name', 'notes')
    expect(textarea).toHaveAttribute('rows', '4')
    expect(textarea).toHaveAttribute('placeholder', 'Add notes')
  })

  it('supports invalid and disabled native states', () => {
    render(
      <Field data-invalid="true">
        <FieldLabel htmlFor="message">Message</FieldLabel>
        <Textarea aria-describedby="message-error" aria-invalid disabled id="message" />
        <FieldError id="message-error">Enter a message.</FieldError>
      </Field>,
    )

    const textarea = screen.getByLabelText('Message')

    expect(textarea).toBeDisabled()
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveAttribute('aria-describedby', 'message-error')
  })

  it('has no accessibility violations in a representative field', async () => {
    const { container } = render(
      <Field>
        <FieldLabel htmlFor="summary">Summary</FieldLabel>
        <Textarea id="summary" />
      </Field>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
