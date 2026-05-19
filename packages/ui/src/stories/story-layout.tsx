import type { ReactNode } from 'react'

import { cn } from '../lib/utils'

export type StoryStackProps = {
  children: ReactNode
  className?: string
}

export const StoryStack = ({ children, className }: StoryStackProps) => (
  <div className={cn('flex w-full max-w-3xl flex-col gap-6', className)}>{children}</div>
)

export type StorySectionProps = {
  children: ReactNode
  className?: string
  header?: ReactNode
  description?: string
  title?: string
}

export const StorySection = ({
  children,
  className,
  description,
  header,
  title,
}: StorySectionProps) => (
  <section className={cn('flex flex-col gap-3', className)}>
    {header ?? (
      <StorySectionHeader>
        {title ? <StorySectionTitle>{title}</StorySectionTitle> : null}
        {description ? <StorySectionDescription>{description}</StorySectionDescription> : null}
      </StorySectionHeader>
    )}
    {children}
  </section>
)

export type StorySectionHeaderProps = {
  children: ReactNode
  className?: string
}

export const StorySectionHeader = ({ children, className }: StorySectionHeaderProps) => (
  <div className={cn('flex flex-col gap-1', className)}>{children}</div>
)

export type StorySectionTitleProps = {
  children: ReactNode
  className?: string
}

export const StorySectionTitle = ({ children, className }: StorySectionTitleProps) => (
  <h2 className={cn('text-sm font-medium text-foreground', className)}>{children}</h2>
)

export type StorySectionDescriptionProps = {
  children: ReactNode
  className?: string
}

export const StorySectionDescription = ({ children, className }: StorySectionDescriptionProps) => (
  <p className={cn('max-w-2xl text-sm text-muted-foreground', className)}>{children}</p>
)

export type StoryGridProps = {
  children: ReactNode
  className?: string
}

export const StoryGrid = ({ children, className }: StoryGridProps) => (
  <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>{children}</div>
)

export type StoryRowProps = {
  children: ReactNode
  className?: string
}

export const StoryRow = ({ children, className }: StoryRowProps) => (
  <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>
)
