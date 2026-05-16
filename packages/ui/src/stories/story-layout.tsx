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
  description?: string
  title: string
}

export const StorySection = ({ children, className, description, title }: StorySectionProps) => (
  <section className={cn('flex flex-col gap-3', className)}>
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
    {children}
  </section>
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
