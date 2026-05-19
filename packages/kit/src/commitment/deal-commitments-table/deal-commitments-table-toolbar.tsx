'use client'

import { Button, cn, Input } from '@repo/ui'
import { Download, Search } from 'lucide-react'
import type { ComponentProps, ComponentPropsWithoutRef, ReactNode } from 'react'

import { useDealCommitmentsTableContext } from './deal-commitments-table.context'
import { filterOptions, toggleFilterId } from './deal-commitments-table.model'

type DealCommitmentsTableToolbarButtonProps = {
  readonly disabled?: boolean | undefined
  readonly icon: ReactNode
} & Omit<ComponentProps<typeof Button>, 'disabled'>

export const DealCommitmentsTableToolbarRoot = ({
  children,
  className,
  ...headerProps
}: ComponentPropsWithoutRef<'header'>) => (
  <header
    className={cn('flex flex-col gap-3 border-b border-border/60 px-4 py-4 xl:px-5', className)}
    data-slot="commitments-table-toolbar"
    {...headerProps}
  >
    {children}
  </header>
)

export const DealCommitmentsTableToolbarHeading = () => {
  const { subtitle, title } = useDealCommitmentsTableContext()

  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold leading-tight text-foreground">{title}</h2>
      <p className="text-sm leading-5 text-muted-foreground">{subtitle}</p>
    </div>
  )
}

export const DealCommitmentsTableToolbarControls = ({
  children,
  className,
  ...divProps
}: ComponentPropsWithoutRef<'div'>) => {
  const { title } = useDealCommitmentsTableContext()

  return (
    <div aria-label={title} className={cn('grid gap-2.5', className)} role="toolbar" {...divProps}>
      {children}
    </div>
  )
}

export const DealCommitmentsTableToolbarPrimaryRow = ({
  children,
  className,
  ...divProps
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-wrap items-center gap-2 xl:flex-nowrap', className)} {...divProps}>
    {children}
  </div>
)

export const DealCommitmentsTableSearch = () => {
  const { controls, disabled, model, onSearchChange, toolbar } = useDealCommitmentsTableContext()

  return (
    <div className="relative w-full sm:w-[15rem]">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        aria-label={toolbar.searchPlaceholder}
        className="h-9 rounded-lg bg-background pl-9 text-sm"
        disabled={disabled && !model?.hasSourceRows}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        placeholder={toolbar.searchPlaceholder}
        value={controls.searchValue}
      />
    </div>
  )
}

export const DealCommitmentsTableToolbarActions = ({
  children,
  className,
  ...divProps
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-wrap items-center gap-2 xl:ml-auto', className)} {...divProps}>
    {children}
  </div>
)

export const DealCommitmentsTableSelectedCount = () => {
  const { model, toolbar } = useDealCommitmentsTableContext()
  const selectedCount = model?.selectedVisibleRowIds.length ?? 0

  return selectedCount > 0 ? (
    <span
      className="rounded-full border border-status-info-border bg-status-info-muted px-2.5 py-0.5 text-status-info text-xs font-semibold"
      data-slot="commitments-selected-count"
    >
      {selectedCount} {toolbar.selectedLabel}
    </span>
  ) : null
}

export const DealCommitmentsTableExportButton = () => {
  const { exportAction, model } = useDealCommitmentsTableContext()
  const selectedCount = model?.selectedVisibleRowIds.length ?? 0
  const exportLabel = exportAction
    ? selectedCount > 0
      ? exportAction.exportSelectedLabel
      : exportAction.exportVisibleLabel
    : undefined

  return exportAction && exportLabel ? (
    <DealCommitmentsTableToolbarButton
      className={selectedCount > 0 ? 'w-44' : 'w-36'}
      disabled={exportAction.disabled}
      icon={<Download />}
      onClick={exportAction.onExport}
    >
      {exportLabel}
    </DealCommitmentsTableToolbarButton>
  ) : null
}

export const DealCommitmentsTableFilters = () => {
  const { controls, disabled, labels, onFilterChange, toolbar } = useDealCommitmentsTableContext()

  return (
    <fieldset
      className="flex flex-wrap items-center gap-1.5"
      data-slot="commitments-workflow-filters"
    >
      <legend className="sr-only">{toolbar.workflowFiltersLabel}</legend>
      {filterOptions.map((option) => {
        const active = controls.activeFilterIds.includes(option.id)
        const label = labels.filters[option.id]

        return (
          <Button
            aria-pressed={active}
            className={cn(
              'h-7 rounded-full px-2.5 text-xs font-medium',
              active
                ? 'border-status-info-border bg-status-info-muted text-status-info hover:bg-status-info-muted'
                : 'bg-background/70 text-muted-foreground hover:bg-muted/70 hover:text-foreground',
            )}
            disabled={disabled}
            key={option.id}
            onClick={() => onFilterChange(toggleFilterId(controls.activeFilterIds, option.id))}
            size="sm"
            variant="outline"
          >
            {label}
          </Button>
        )
      })}
    </fieldset>
  )
}

export const DealCommitmentsTableToolbarButton = ({
  children,
  className,
  disabled,
  icon,
  ...buttonProps
}: DealCommitmentsTableToolbarButtonProps) => (
  <Button
    className={cn('h-9 justify-start rounded-lg bg-background/70 px-3 text-sm', className)}
    disabled={disabled}
    variant="outline"
    {...buttonProps}
  >
    <span
      className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-4"
      data-icon="inline-start"
    >
      {icon}
    </span>
    <span className="min-w-0 truncate">{children}</span>
  </Button>
)

export const DealCommitmentsTableToolbar = () => (
  <DealCommitmentsTableToolbarRoot>
    <DealCommitmentsTableToolbarHeading />
    <DealCommitmentsTableToolbarControls>
      <DealCommitmentsTableToolbarPrimaryRow>
        <DealCommitmentsTableSearch />
        <DealCommitmentsTableToolbarActions>
          <DealCommitmentsTableSelectedCount />
          <DealCommitmentsTableExportButton />
        </DealCommitmentsTableToolbarActions>
      </DealCommitmentsTableToolbarPrimaryRow>
      <DealCommitmentsTableFilters />
    </DealCommitmentsTableToolbarControls>
  </DealCommitmentsTableToolbarRoot>
)
