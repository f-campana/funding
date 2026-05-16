import type { ComponentProps } from 'react'

import { cn } from '#lib/utils'

export type CardProps = ComponentProps<'div'>

export const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      'flex flex-col gap-6 rounded-lg border border-border bg-card py-6 text-card-foreground shadow-card',
      className,
    )}
    data-slot="card"
    {...props}
  />
)

export type CardHeaderProps = ComponentProps<'div'>

export const CardHeader = ({ className, ...props }: CardHeaderProps) => (
  <div
    className={cn('grid auto-rows-min grid-rows-[auto_auto] gap-1.5 px-6', className)}
    data-slot="card-header"
    {...props}
  />
)

export type CardTitleProps = ComponentProps<'h3'>

export const CardTitle = ({ className, ...props }: CardTitleProps) => (
  <h3 className={cn('font-semibold leading-none', className)} data-slot="card-title" {...props} />
)

export type CardDescriptionProps = ComponentProps<'p'>

export const CardDescription = ({ className, ...props }: CardDescriptionProps) => (
  <p
    className={cn('text-sm text-muted-foreground', className)}
    data-slot="card-description"
    {...props}
  />
)

export type CardContentProps = ComponentProps<'div'>

export const CardContent = ({ className, ...props }: CardContentProps) => (
  <div className={cn('px-6', className)} data-slot="card-content" {...props} />
)

export type CardFooterProps = ComponentProps<'div'>

export const CardFooter = ({ className, ...props }: CardFooterProps) => (
  <div
    className={cn('flex items-center gap-2 px-6', className)}
    data-slot="card-footer"
    {...props}
  />
)
