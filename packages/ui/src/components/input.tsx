import type { ComponentProps } from 'react'

import { cn } from '#lib/utils'

export type InputProps = ComponentProps<'input'>

export const Input = ({ className, type, ...props }: InputProps) => (
  <input
    className={cn(
      'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base outline-none transition-colors file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive md:text-sm',
      className,
    )}
    data-slot="input"
    type={type}
    {...props}
  />
)
