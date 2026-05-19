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
  readonly header?: ReactNode
  readonly description?: string
  readonly title?: string
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
  readonly children: ReactNode
  readonly className?: string
}

export const StorySectionHeader = ({ children, className }: StorySectionHeaderProps) => (
  <div className={cn('flex flex-col gap-1', className)}>{children}</div>
)

export type StorySectionTitleProps = {
  readonly children: ReactNode
  readonly className?: string
}

export const StorySectionTitle = ({ children, className }: StorySectionTitleProps) => (
  <h2 className={cn('text-sm font-medium text-foreground', className)}>{children}</h2>
)

export type StorySectionDescriptionProps = {
  readonly children: ReactNode
  readonly className?: string
}

export const StorySectionDescription = ({ children, className }: StorySectionDescriptionProps) => (
  <p className={cn('max-w-2xl text-sm text-muted-foreground', className)}>{children}</p>
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
