'use client'

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import type { ComponentProps } from 'react'

import { cn } from '#lib/utils'

export const DropdownMenu = DropdownMenuPrimitive.Root

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export const DropdownMenuGroup = DropdownMenuPrimitive.Group

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

export const DropdownMenuSub = DropdownMenuPrimitive.Sub

export const DropdownMenuSubTrigger = DropdownMenuPrimitive.SubTrigger

export const DropdownMenuSubContent = DropdownMenuPrimitive.SubContent

export type DropdownMenuContentProps = ComponentProps<typeof DropdownMenuPrimitive.Content>

export const DropdownMenuContent = ({
  align = 'start',
  className,
  sideOffset = 6,
  ...props
}: DropdownMenuContentProps) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      align={align}
      className={cn(
        'z-50 min-w-48 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none motion-reduce:transition-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
        className,
      )}
      data-slot="dropdown-menu-content"
      sideOffset={sideOffset}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
)

export type DropdownMenuItemProps = ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: 'default' | 'destructive'
}

export const DropdownMenuItem = ({
  className,
  inset = false,
  variant = 'default',
  ...props
}: DropdownMenuItemProps) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors motion-reduce:transition-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      variant === 'destructive' &&
        'text-destructive focus:bg-destructive/10 focus:text-destructive',
      className,
    )}
    data-slot="dropdown-menu-item"
    data-variant={variant}
    {...props}
  />
)

export type DropdownMenuCheckboxItemProps = ComponentProps<
  typeof DropdownMenuPrimitive.CheckboxItem
>

export const DropdownMenuCheckboxItem = ({
  children,
  className,
  checked,
  ...props
}: DropdownMenuCheckboxItemProps) => (
  <DropdownMenuPrimitive.CheckboxItem
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none transition-colors motion-reduce:transition-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    data-slot="dropdown-menu-checkbox-item"
    {...(checked !== undefined ? { checked } : {})}
    {...props}
  >
    <span className="absolute left-2 flex size-4 items-center justify-center" aria-hidden="true">
      <DropdownMenuPrimitive.ItemIndicator>
        <svg
          aria-hidden="true"
          className="size-3"
          fill="none"
          focusable="false"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 16 16"
        >
          <path d="m3.75 8.25 2.5 2.5 6-6" />
        </svg>
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
)

export type DropdownMenuRadioItemProps = ComponentProps<typeof DropdownMenuPrimitive.RadioItem>

export const DropdownMenuRadioItem = ({
  children,
  className,
  ...props
}: DropdownMenuRadioItemProps) => (
  <DropdownMenuPrimitive.RadioItem
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none transition-colors motion-reduce:transition-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    data-slot="dropdown-menu-radio-item"
    {...props}
  >
    <span className="absolute left-2 flex size-4 items-center justify-center" aria-hidden="true">
      <DropdownMenuPrimitive.ItemIndicator>
        <span className="size-1.5 rounded-full bg-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
)

export type DropdownMenuLabelProps = ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}

export const DropdownMenuLabel = ({
  className,
  inset = false,
  ...props
}: DropdownMenuLabelProps) => (
  <DropdownMenuPrimitive.Label
    className={cn(
      'px-2 py-1.5 font-medium text-muted-foreground text-xs',
      inset && 'pl-8',
      className,
    )}
    data-slot="dropdown-menu-label"
    {...props}
  />
)

export type DropdownMenuSeparatorProps = ComponentProps<typeof DropdownMenuPrimitive.Separator>

export const DropdownMenuSeparator = ({ className, ...props }: DropdownMenuSeparatorProps) => (
  <DropdownMenuPrimitive.Separator
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    data-slot="dropdown-menu-separator"
    {...props}
  />
)
