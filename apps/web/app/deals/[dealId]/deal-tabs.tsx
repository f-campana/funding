'use client'

import { cn } from '@repo/ui/lib/utils'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import type { ComponentPropsWithoutRef } from 'react'

export type DealTab = {
  readonly href: string
  readonly label: string
  readonly segment: string
}

type DealTabsProps = {
  readonly ariaLabel: string
  readonly tabs: readonly DealTab[]
}

export const DealTabsRoot = ({ className, ...props }: ComponentPropsWithoutRef<'nav'>) => (
  <nav className={cn('flex flex-wrap gap-1 border-b border-border', className)} {...props} />
)

export const DealTabLink = ({
  children,
  className,
  segment,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { readonly segment: string }) => {
  const selectedSegment = useSelectedLayoutSegment()
  const isActive = selectedSegment === segment

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive ? 'border-primary text-foreground' : null,
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  )
}

const DealTabsView = ({ ariaLabel, tabs }: DealTabsProps) => (
  <DealTabsRoot aria-label={ariaLabel}>
    {tabs.map((tab) => (
      <DealTabLink href={tab.href} key={tab.href} segment={tab.segment}>
        {tab.label}
      </DealTabLink>
    ))}
  </DealTabsRoot>
)

export const DealTabs = Object.assign(DealTabsView, {
  Link: DealTabLink,
  Root: DealTabsRoot,
})
