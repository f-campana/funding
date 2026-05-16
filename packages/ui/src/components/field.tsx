import type { ComponentProps } from 'react'

import { cn } from '#lib/utils'

export type FieldGroupProps = ComponentProps<'div'>

export const FieldGroup = ({ className, ...props }: FieldGroupProps) => (
  <div className={cn('flex flex-col gap-6', className)} data-slot="field-group" {...props} />
)

export type FieldSetProps = ComponentProps<'fieldset'>

export const FieldSet = ({ className, ...props }: FieldSetProps) => (
  <fieldset className={cn('flex flex-col gap-6', className)} data-slot="field-set" {...props} />
)

export type FieldLegendProps = ComponentProps<'legend'>

export const FieldLegend = ({ className, ...props }: FieldLegendProps) => (
  <legend className={cn('font-medium', className)} data-slot="field-legend" {...props} />
)

export type FieldProps = ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical'
}

export const Field = ({ className, orientation = 'vertical', ...props }: FieldProps) => (
  <div
    className={cn(
      'group/field flex flex-col gap-2 data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-start data-[orientation=horizontal]:gap-4',
      className,
    )}
    data-orientation={orientation}
    data-slot="field"
    {...props}
  />
)

export type FieldContentProps = ComponentProps<'div'>

export const FieldContent = ({ className, ...props }: FieldContentProps) => (
  <div className={cn('flex flex-col gap-1.5', className)} data-slot="field-content" {...props} />
)

export type FieldLabelProps = ComponentProps<'label'>

export const FieldLabel = ({ className, ...props }: FieldLabelProps) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: consumers provide htmlFor or wrap a control.
  <label
    className={cn(
      'flex items-center gap-2 text-sm font-medium leading-none group-data-[disabled=true]/field:pointer-events-none group-data-[disabled=true]/field:opacity-50',
      className,
    )}
    data-slot="field-label"
    {...props}
  />
)

export type FieldTitleProps = ComponentProps<'div'>

export const FieldTitle = ({ className, ...props }: FieldTitleProps) => (
  <div
    className={cn('text-sm font-medium leading-none', className)}
    data-slot="field-title"
    {...props}
  />
)

export type FieldDescriptionProps = ComponentProps<'p'>

export const FieldDescription = ({ className, ...props }: FieldDescriptionProps) => (
  <p
    className={cn('text-sm text-muted-foreground', className)}
    data-slot="field-description"
    {...props}
  />
)

export type FieldErrorProps = ComponentProps<'p'>

export const FieldError = ({ className, ...props }: FieldErrorProps) => (
  <p className={cn('text-sm text-destructive', className)} data-slot="field-error" {...props} />
)
