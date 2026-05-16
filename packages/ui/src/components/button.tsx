import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '#lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 px-4 py-2',
        icon: 'size-9',
        lg: 'h-10 px-6',
        sm: 'h-8 px-3 text-xs',
      },
      variant: {
        default: 'bg-primary text-primary-foreground hover:brightness-95',
        destructive: 'bg-destructive text-destructive-foreground hover:brightness-95',
        ghost: 'hover:bg-muted hover:text-foreground',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
        outline: 'border-border bg-background hover:bg-muted hover:text-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:brightness-95',
      },
    },
  },
)

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export const Button = ({
  'aria-disabled': ariaDisabled,
  asChild = false,
  className,
  disabled,
  onClick,
  onClickCapture,
  size = 'default',
  tabIndex,
  type = 'button',
  variant = 'default',
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : 'button'
  const disabledAsChild = asChild && disabled === true
  const handleClick: ButtonProps['onClick'] = (event) => {
    if (disabledAsChild) {
      event.preventDefault()
      return
    }

    onClick?.(event)
  }
  const handleClickCapture: ButtonProps['onClickCapture'] = (event) => {
    if (disabledAsChild) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    onClickCapture?.(event)
  }

  return (
    <Comp
      aria-disabled={disabledAsChild ? true : ariaDisabled}
      className={cn(buttonVariants({ className, size, variant }))}
      data-disabled={disabledAsChild ? '' : undefined}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      disabled={asChild ? undefined : disabled}
      onClick={handleClick}
      onClickCapture={handleClickCapture}
      tabIndex={disabledAsChild ? -1 : tabIndex}
      type={asChild ? undefined : type}
      {...props}
    />
  )
}

export { buttonVariants }
