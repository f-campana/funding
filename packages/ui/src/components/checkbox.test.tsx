import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../test/axe'

import { Checkbox } from './checkbox'
import { Field, FieldError, FieldLabel } from './field'

describe('Checkbox', () => {
  it('associates labels with controls and exposes stable slots', () => {
    const { container } = render(
      <Field>
        <Checkbox id="updates" />
        <FieldLabel htmlFor="updates">Updates</FieldLabel>
      </Field>,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Updates' })

    expect(checkbox).toHaveAttribute('data-slot', 'checkbox')
    expect(checkbox).toHaveAttribute('data-state', 'unchecked')
    expect(checkbox).toHaveClass('cursor-pointer')
    expect(container.querySelector('[data-slot="checkbox-indicator"]')).not.toBeInTheDocument()
  })

  it('supports checked and disabled states', () => {
    const { container } = render(
      <Field>
        <Checkbox defaultChecked disabled id="records" />
        <FieldLabel htmlFor="records">Records</FieldLabel>
      </Field>,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Records' })

    expect(checkbox).toBeDisabled()
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
    expect(checkbox).toHaveAttribute('data-state', 'checked')
    expect(checkbox).toHaveClass('disabled:cursor-not-allowed')
    expect(container.querySelector('[data-slot="checkbox-indicator"]')).toBeInTheDocument()
  })

  it('supports indeterminate state', () => {
    const { container } = render(
      <Field>
        <Checkbox checked="indeterminate" id="some-records" />
        <FieldLabel htmlFor="some-records">Some records</FieldLabel>
      </Field>,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Some records' })

    expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    expect(checkbox).toHaveAttribute('data-state', 'indeterminate')
    expect(container.querySelector('[data-slot="checkbox-indicator"]')).toBeInTheDocument()
  })

  it('forwards invalid state and custom classes', () => {
    render(
      <Field data-invalid="true">
        <Checkbox aria-describedby="agree-error" aria-invalid className="min-w-4" id="agree" />
        <FieldLabel htmlFor="agree">Agree</FieldLabel>
        <FieldError id="agree-error">Required.</FieldError>
      </Field>,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Agree' })

    expect(checkbox).toHaveAttribute('aria-invalid', 'true')
    expect(checkbox).toHaveAttribute('aria-describedby', 'agree-error')
    expect(checkbox).toHaveClass('min-w-4')
  })

  it('calls checked change handlers', () => {
    const onCheckedChange = vi.fn()

    render(
      <Field>
        <Checkbox id="select" onCheckedChange={onCheckedChange} />
        <FieldLabel htmlFor="select">Select row</FieldLabel>
      </Field>,
    )

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select row' }))

    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('has no accessibility violations in a representative field', async () => {
    const { container } = render(
      <Field>
        <Checkbox id="terms" />
        <FieldLabel htmlFor="terms">Terms</FieldLabel>
      </Field>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
