'use client'

import { cn } from '@repo/ui/lib/utils'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export type DealAppShellNavItem = {
  readonly href: string
  readonly label: string
  readonly segment: string
  readonly glyph: 'overview' | 'commitments' | 'documents'
}

type DealAppShellBaseProps = {
  readonly children: ReactNode
  readonly header: ReactNode
  readonly leftRail: ReactNode
  readonly rail: ReactNode
}

type DealAppShellProps = DealAppShellBaseProps

export function DealAppShell({ children, header, leftRail, rail }: DealAppShellProps) {
  return (
    <main className="min-h-screen bg-muted/25" data-slot="deal-app-shell">
      <div className="grid min-h-screen md:grid-cols-[4.5rem_minmax(0,1fr)]">
        {leftRail}

        <div className="min-w-0 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
          <section className="mx-auto grid w-full max-w-[92rem] gap-4">
            {header}
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="order-1 min-w-0">{children}</div>
              <div className="order-2">{rail}</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export const DealAppShellLeftRail = ({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<'aside'>) => (
  <aside
    className={cn(
      'border-b border-border bg-background/95 px-3 py-3 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:px-2',
      className,
    )}
    data-slot="deal-left-rail"
    {...props}
  >
    <div className="flex items-center gap-3 md:grid md:h-full md:grid-rows-[auto_1fr_auto] md:gap-6">
      {children}
    </div>
  </aside>
)

export const DealAppShellLogo = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Link>) => (
  <Link
    className={cn(
      'flex size-10 shrink-0 items-center justify-center rounded-md border border-foreground/10 bg-foreground text-sm font-semibold text-background shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className,
    )}
    {...props}
  />
)

export const DealAppShellNav = ({ className, ...props }: ComponentPropsWithoutRef<'nav'>) => (
  <nav className={cn('flex min-w-0 gap-1 md:grid md:content-start', className)} {...props} />
)

export const DealAppShellNavLink = ({
  children,
  className,
  label,
  segment,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & {
  readonly label: string
  readonly segment: string
}) => {
  const selectedSegment = useSelectedLayoutSegment()
  const isActive = selectedSegment === segment

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      className={cn(
        'flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-primary text-primary-foreground shadow-card hover:bg-primary hover:text-primary-foreground'
          : null,
        className,
      )}
      data-active={isActive ? 'true' : 'false'}
      title={label}
      {...props}
    >
      {children}
    </Link>
  )
}

export const DealAppShellVersionBadge = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn(
      'ml-auto hidden size-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground md:flex md:self-end',
      className,
    )}
    {...props}
  />
)

export const DealAppShellNavGlyph = ({
  glyph,
}: {
  readonly glyph: DealAppShellNavItem['glyph']
}) => {
  if (glyph === 'commitments') {
    return (
      <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
        <path
          d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
      </svg>
    )
  }

  if (glyph === 'documents') {
    return (
      <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
        <path
          d="M4 2.5h5l3 3v8H4z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M9 2.7v3h3M6 8.5h4M6 11h3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path
        d="M3 7.5 8 3l5 4.5v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path d="M6.5 13.5V10h3v3.5" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}
