'use client'

import * as SheetPrimitive from '@radix-ui/react-dialog'
import type { ComponentProps } from 'react'

import { cn } from '#lib/utils'

import { Button } from './button'

type SheetSide = 'top' | 'right' | 'bottom' | 'left'

const sheetSideClasses: Record<SheetSide, string> = {
  bottom:
    'bottom-0 left-0 right-0 w-full max-h-[85dvh] rounded-t-lg border-t border-border data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2',
  left: 'left-0 top-0 h-full w-full max-w-md border-r border-border data-[state=closed]:slide-out-to-left-2 data-[state=open]:slide-in-from-left-2',
  right:
    'right-0 top-0 h-full w-full max-w-md border-l border-border data-[state=closed]:slide-out-to-right-2 data-[state=open]:slide-in-from-right-2',
  top: 'top-0 left-0 right-0 w-full max-h-[85dvh] rounded-b-lg border-b border-border data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
}

export const Sheet = SheetPrimitive.Root

export type SheetTriggerProps = ComponentProps<typeof SheetPrimitive.Trigger>

export const SheetTrigger = ({ className, ...props }: SheetTriggerProps) => (
  <SheetPrimitive.Trigger
    className={cn(
      'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed data-[disabled]:cursor-not-allowed',
      className,
    )}
    data-slot="sheet-trigger"
    {...props}
  />
)

export type SheetCloseProps = ComponentProps<typeof SheetPrimitive.Close>

export const SheetClose = ({ className, ...props }: SheetCloseProps) => (
  <SheetPrimitive.Close
    className={cn(
      'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed data-[disabled]:cursor-not-allowed',
      className,
    )}
    data-slot="sheet-close"
    {...props}
  />
)

export type SheetCloseButtonProps = ComponentProps<typeof Button>

export const SheetCloseButton = ({ children, className, ...props }: SheetCloseButtonProps) => (
  <SheetPrimitive.Close asChild data-slot="sheet-close">
    <Button
      aria-label="Close"
      className={cn('absolute top-4 right-4', className)}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? (
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          focusable="false"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      )}
    </Button>
  </SheetPrimitive.Close>
)

export type SheetPortalProps = ComponentProps<typeof SheetPrimitive.Portal>

export const SheetPortal = (props: SheetPortalProps) => (
  <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
)

export type SheetOverlayProps = ComponentProps<typeof SheetPrimitive.Overlay>

export const SheetOverlay = ({ className, ...props }: SheetOverlayProps) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm motion-reduce:transition-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
      className,
    )}
    data-slot="sheet-overlay"
    {...props}
  />
)

export type SheetContentProps = ComponentProps<typeof SheetPrimitive.Content> & {
  side?: SheetSide
}

export const SheetContent = ({
  children,
  className,
  side = 'right',
  ...props
}: SheetContentProps) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      className={cn(
        'fixed z-50 flex flex-col gap-4 overflow-y-auto bg-background p-6 text-foreground shadow-popover outline-none transition ease-in-out motion-reduce:transition-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
        sheetSideClasses[side],
        className,
      )}
      data-side={side}
      data-slot="sheet-content"
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
)

export type SheetHeaderProps = ComponentProps<'div'>

export const SheetHeader = ({ className, ...props }: SheetHeaderProps) => (
  <div
    className={cn('flex flex-col gap-1.5 text-left', className)}
    data-slot="sheet-header"
    {...props}
  />
)

export type SheetFooterProps = ComponentProps<'div'>

export const SheetFooter = ({ className, ...props }: SheetFooterProps) => (
  <div
    className={cn('mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
    data-slot="sheet-footer"
    {...props}
  />
)

export type SheetTitleProps = ComponentProps<typeof SheetPrimitive.Title>

export const SheetTitle = ({ className, ...props }: SheetTitleProps) => (
  <SheetPrimitive.Title
    className={cn('font-semibold text-foreground text-lg leading-none', className)}
    data-slot="sheet-title"
    {...props}
  />
)

export type SheetDescriptionProps = ComponentProps<typeof SheetPrimitive.Description>

export const SheetDescription = ({ className, ...props }: SheetDescriptionProps) => (
  <SheetPrimitive.Description
    className={cn('text-muted-foreground text-sm', className)}
    data-slot="sheet-description"
    {...props}
  />
)
