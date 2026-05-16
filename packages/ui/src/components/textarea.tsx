import type { ComponentProps } from 'react'

import { cn } from '#lib/utils'

export type TextareaProps = ComponentProps<'textarea'>

export const Textarea = ({ className, ...props }: TextareaProps) => (
  <textarea
    className={cn(
      'flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive md:text-sm',
      className,
    )}
    data-slot="textarea"
    {...props}
  />
)
