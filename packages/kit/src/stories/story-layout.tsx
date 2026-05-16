import { cn } from '@repo/ui'
import type { ReactNode } from 'react'

export type StoryStackProps = {
  readonly children: ReactNode
  readonly className?: string
}

export const StoryStack = ({ children, className }: StoryStackProps) => (
  <div className={cn('flex w-full max-w-5xl flex-col gap-6', className)}>{children}</div>
)

export type StorySectionProps = {
  readonly children: ReactNode
  readonly className?: string
  readonly description?: string
  readonly title: string
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
  readonly children: ReactNode
  readonly className?: string
}

export const StoryGrid = ({ children, className }: StoryGridProps) => (
  <div className={cn('grid gap-4 md:grid-cols-2 xl:grid-cols-3', className)}>{children}</div>
)

export type StoryRowProps = {
  readonly children: ReactNode
  readonly className?: string
}

export const StoryRow = ({ children, className }: StoryRowProps) => (
  <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>
)
