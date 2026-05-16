import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '../test/axe'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from './field'
import { Input } from './input'

describe('Field primitives', () => {
  it('renders labeled controls, descriptions, errors, and slot contracts', () => {
    render(
      <FieldGroup>
        <Field data-invalid="true">
          <FieldLabel htmlFor="code">Code</FieldLabel>
          <Input aria-describedby="code-description code-error" aria-invalid id="code" />
          <FieldDescription id="code-description">Use the current code.</FieldDescription>
          <FieldError id="code-error">Enter a valid code.</FieldError>
        </Field>
      </FieldGroup>,
    )

    const field = screen.getByLabelText('Code').closest('[data-slot="field"]')

    expect(field).toHaveAttribute('data-invalid', 'true')
    expect(screen.getByText('Use the current code.')).toHaveAttribute(
      'data-slot',
      'field-description',
    )
    expect(screen.getByText('Enter a valid code.')).toHaveAttribute('data-slot', 'field-error')
  })

  it('preserves accessible fieldset grouping semantics', () => {
    render(
      <FieldSet>
        <FieldLegend>Preferences</FieldLegend>
        <Field orientation="horizontal">
          <input id="updates" type="checkbox" />
          <FieldContent>
            <FieldLabel htmlFor="updates">Updates</FieldLabel>
            <FieldDescription>Receive updates.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldSet>,
    )

    const group = screen.getByRole('group', { name: 'Preferences' })

    expect(group).toHaveAttribute('data-slot', 'field-set')
    expect(screen.getByLabelText('Updates')).toHaveAttribute('type', 'checkbox')
    expect(screen.getByLabelText('Updates').closest('[data-slot="field"]')).toHaveAttribute(
      'data-orientation',
      'horizontal',
    )
  })

  it('renders non-control field titles', () => {
    render(
      <Field>
        <FieldTitle>Status</FieldTitle>
        <FieldDescription>Shown without a form control.</FieldDescription>
      </Field>,
    )

    expect(screen.getByText('Status')).toHaveAttribute('data-slot', 'field-title')
  })

  it('has no accessibility violations in invalid and grouped states', async () => {
    const { container } = render(
      <FieldSet>
        <FieldLegend>Details</FieldLegend>
        <Field data-invalid="true">
          <FieldLabel htmlFor="detail">Detail</FieldLabel>
          <Input aria-describedby="detail-error" aria-invalid id="detail" />
          <FieldError id="detail-error">Enter a detail.</FieldError>
        </Field>
      </FieldSet>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
