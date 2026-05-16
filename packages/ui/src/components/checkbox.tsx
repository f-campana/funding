'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import type { ComponentProps } from 'react'

import { cn } from '#lib/utils'

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root>

export const Checkbox = ({ className, ...props }: CheckboxProps) => (
  <CheckboxPrimitive.Root
    className={cn(
      'peer group size-4 shrink-0 cursor-pointer rounded-[4px] border border-input bg-background text-primary-foreground outline-none transition-colors motion-reduce:transition-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
      className,
    )}
    data-slot="checkbox"
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className="flex items-center justify-center text-current"
      data-slot="checkbox-indicator"
    >
      <svg
        aria-hidden="true"
        className="size-3"
        fill="none"
        focusable="false"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        viewBox="0 0 16 16"
      >
        <path className="hidden group-data-[state=checked]:block" d="m3.75 8.25 2.5 2.5 6-6" />
        <path className="hidden group-data-[state=indeterminate]:block" d="M4 8h8" />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
)
