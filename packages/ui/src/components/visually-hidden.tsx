import { Slot } from '@radix-ui/react-slot'
import type { ComponentProps } from 'react'

import { cn } from '#lib/utils'

export type VisuallyHiddenProps = ComponentProps<'span'> & {
  asChild?: boolean
}

export const VisuallyHidden = ({ asChild = false, className, ...props }: VisuallyHiddenProps) => {
  const Comp = asChild ? Slot : 'span'

  return <Comp className={cn('sr-only', className)} data-slot="visually-hidden" {...props} />
}
