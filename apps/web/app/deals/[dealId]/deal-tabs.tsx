'use client'

import { cn } from '@repo/ui/lib/utils'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

export type DealTab = {
  readonly href: string
  readonly label: string
  readonly segment: string
}

type DealTabsProps = {
  readonly ariaLabel: string
  readonly tabs: readonly DealTab[]
}

export function DealTabs({ ariaLabel, tabs }: DealTabsProps) {
  const selectedSegment = useSelectedLayoutSegment()

  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab) => {
        const isActive = selectedSegment === tab.segment

        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive ? 'border-primary text-foreground' : null,
            )}
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
