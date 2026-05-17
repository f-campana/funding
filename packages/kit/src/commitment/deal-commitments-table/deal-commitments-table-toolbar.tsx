import { Button, cn, Input } from '@repo/ui'
import { Download, Search } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

import { filterOptions, toggleFilterId } from './deal-commitments-table.model'
import type {
  CommitmentTableFilterId,
  CommitmentTableModel,
  DealCommitmentsTableExportToolbarLabels,
  DealCommitmentsTableLabels,
  DealCommitmentsTableProps,
  ReadyControls,
} from './deal-commitments-table.types'

export const CommitmentsTableToolbar = ({
  controls,
  disabled,
  exportAction,
  labels,
  model,
  onFilterChange,
  onSearchChange,
  subtitle,
  title,
  toolbar,
}: {
  readonly controls: ReadyControls
  readonly disabled: boolean
  readonly exportAction:
    | (Pick<
        DealCommitmentsTableExportToolbarLabels,
        'exportSelectedLabel' | 'exportVisibleLabel'
      > & {
        readonly disabled: boolean
        readonly onExport: () => void
      })
    | undefined
  readonly labels: DealCommitmentsTableLabels
  readonly model: CommitmentTableModel | undefined
  readonly onFilterChange: (filterIds: readonly CommitmentTableFilterId[]) => void
  readonly onSearchChange: (value: string) => void
  readonly subtitle: string
  readonly title: string
  readonly toolbar: DealCommitmentsTableProps['toolbar']
}) => {
  const selectedCount = model?.selectedVisibleRowIds.length ?? 0
  const exportLabel = exportAction
    ? selectedCount > 0
      ? exportAction.exportSelectedLabel
      : exportAction.exportVisibleLabel
    : undefined

  return (
    <header
      className="flex flex-col gap-3 border-b border-border/60 px-4 py-4 xl:px-5"
      data-slot="commitments-table-toolbar"
    >
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold leading-tight text-foreground">{title}</h2>
        <p className="text-sm leading-5 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid gap-2.5" role="toolbar" aria-label={title}>
        <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
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
          <div className="flex flex-wrap items-center gap-2 xl:ml-auto">
            {selectedCount > 0 ? (
              <span
                className="rounded-full border border-status-info-border bg-status-info-muted px-2.5 py-0.5 text-status-info text-xs font-semibold"
                data-slot="commitments-selected-count"
              >
                {selectedCount} {toolbar.selectedLabel}
              </span>
            ) : null}
            {exportAction && exportLabel ? (
              <ToolbarButton
                className={selectedCount > 0 ? 'w-44' : 'w-36'}
                disabled={exportAction.disabled}
                icon={<Download />}
                onClick={exportAction.onExport}
              >
                {exportLabel}
              </ToolbarButton>
            ) : null}
          </div>
        </div>
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
      </div>
    </header>
  )
}

const ToolbarButton = ({
  children,
  className,
  disabled,
  icon,
  onClick,
  ...props
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly disabled?: boolean
  readonly icon: ReactNode
  readonly onClick?: ComponentProps<typeof Button>['onClick']
} & Omit<ComponentProps<typeof Button>, 'children' | 'className' | 'disabled' | 'onClick'>) => (
  <Button
    className={cn('h-9 justify-start rounded-lg bg-background/70 px-3 text-sm', className)}
    disabled={disabled}
    onClick={onClick}
    variant="outline"
    {...props}
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
