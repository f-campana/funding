'use client'

import type { ComponentProps, ComponentType, CSSProperties, ReactElement, ReactNode } from 'react'
import { cloneElement, createContext, isValidElement, useContext, useId } from 'react'
import type {
  DefaultLegendContentProps,
  LegendPayload,
  TooltipContentProps,
  TooltipPayloadEntry,
  TooltipValueType,
} from 'recharts'
import * as RechartsPrimitive from 'recharts'

import { cn } from '#lib/utils'

const INITIAL_DIMENSION = { height: 200, width: 320 } as const
const CHART_THEMES = ['light', 'dark'] as const

type ChartTheme = (typeof CHART_THEMES)[number]
type TooltipNameType = number | string
type TooltipPayload = ReadonlyArray<TooltipPayloadEntry>
type TooltipFormatter = (
  value: TooltipValueType,
  name: TooltipNameType,
  item: TooltipPayloadEntry,
  index: number,
  payload: TooltipPayload,
) => ReactNode | [ReactNode, ReactNode]
type TooltipLabelFormatter = (label: ReactNode, payload: TooltipPayload) => ReactNode
type IndicatorStyle = CSSProperties & {
  readonly '--chart-indicator-color'?: string | undefined
}

export type ChartConfig = Record<
  string,
  {
    readonly label?: ReactNode
    readonly icon?: ComponentType
    readonly color?: string
    readonly theme?: Partial<Record<ChartTheme, string>>
  }
>

type ChartContextValue = {
  readonly config: ChartConfig
}

const ChartContext = createContext<ChartContextValue | null>(null)

const useChart = () => useContext(ChartContext) ?? { config: {} }

const normalizeChartId = (value: string) => value.replace(/[^A-Za-z0-9_-]/g, '')

const normalizeColorKey = (value: string) => value.replace(/[^A-Za-z0-9_-]/g, '-')

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getRecordString = (value: unknown, key: string) => {
  if (!isRecord(value)) {
    return undefined
  }

  const recordValue = value[key]

  return typeof recordValue === 'string' ? recordValue : undefined
}

const getPayloadConfigFromPayload = (config: ChartConfig, payload: unknown, key: string) => {
  if (!isRecord(payload)) {
    return config[key]
  }

  const nestedPayload = isRecord(payload.payload) ? payload.payload : undefined
  const payloadValue = getRecordString(payload, key) ?? getRecordString(nestedPayload, key)
  const configKey = payloadValue ?? key

  return config[configKey] ?? config[key]
}

const getPayloadColor = (payload: unknown, fallback: string | undefined) =>
  getRecordString(payload, 'fill') ?? fallback

const stringifyValue = (value: TooltipValueType) => {
  if (Array.isArray(value)) {
    return value.join(' - ')
  }

  return typeof value === 'number' ? value.toLocaleString() : String(value)
}

const getStyleRules = (id: string, config: ChartConfig) => {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.color ?? itemConfig.theme,
  )

  if (!colorConfig.length) {
    return undefined
  }

  const baseVariables = colorConfig
    .map(([key, itemConfig]) => {
      const color = itemConfig.theme?.light ?? itemConfig.color

      return color ? `  --color-${normalizeColorKey(key)}: ${color};` : undefined
    })
    .filter((rule): rule is string => Boolean(rule))

  const darkVariables = colorConfig
    .map(([key, itemConfig]) => {
      const color = itemConfig.theme?.dark

      return color ? `  --color-${normalizeColorKey(key)}: ${color};` : undefined
    })
    .filter((rule): rule is string => Boolean(rule))

  const rules = []

  if (baseVariables.length) {
    rules.push(`[data-chart="${id}"] {\n${baseVariables.join('\n')}\n}`)
  }

  if (darkVariables.length) {
    const darkSelector = [
      `[data-chart="${id}"].dark`,
      `.dark [data-chart="${id}"]`,
      `[data-chart="${id}"][data-theme="dark"]`,
      `[data-theme="dark"] [data-chart="${id}"]`,
    ].join(', ')

    rules.push(`${darkSelector} {\n${darkVariables.join('\n')}\n}`)
  }

  return rules.length ? rules.join('\n') : undefined
}

export type ChartStyleProps = {
  readonly id: string
  readonly config: ChartConfig
}

export const ChartStyle = ({ id, config }: ChartStyleProps) => {
  const rules = getStyleRules(id, config)

  if (!rules) {
    return null
  }

  return <style data-slot="chart-style">{rules}</style>
}

export type ChartContainerProps = ComponentProps<'div'> & {
  readonly config: ChartConfig
  readonly children: ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
  readonly initialDimension?: {
    readonly width: number
    readonly height: number
  }
}

export const ChartContainer = ({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: ChartContainerProps) => {
  const uniqueId = useId()
  const chartId = `chart-${normalizeChartId(id ?? uniqueId)}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn(
          'flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot]:stroke-border [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_line]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none',
          className,
        )}
        data-chart={chartId}
        data-slot="chart-container"
        {...props}
      >
        <ChartStyle config={config} id={chartId} />
        <RechartsPrimitive.ResponsiveContainer initialDimension={initialDimension}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const renderTooltipContent = (
  content: ComponentProps<typeof RechartsPrimitive.Tooltip>['content'] | undefined,
  props: TooltipContentProps<TooltipValueType, TooltipNameType>,
) => {
  const contentProps = getChartTooltipContentProps(props)

  if (typeof content === 'function') {
    return content(props)
  }

  if (isValidElement(content)) {
    return cloneElement(content as ReactElement<Partial<ChartTooltipContentProps>>, contentProps)
  }

  return <ChartTooltipContent {...contentProps} />
}

const getChartTooltipContentProps = (
  props: TooltipContentProps<TooltipValueType, TooltipNameType>,
): ChartTooltipContentProps => ({
  active: props.active,
  formatter: props.formatter,
  label: props.label,
  labelFormatter: props.labelFormatter,
  payload: props.payload,
})

export type ChartTooltipProps = ComponentProps<typeof RechartsPrimitive.Tooltip>

export const ChartTooltip = ({ content, ...props }: ChartTooltipProps) => (
  <RechartsPrimitive.Tooltip
    content={(tooltipProps) => (
      <div data-slot="chart-tooltip">{renderTooltipContent(content, tooltipProps)}</div>
    )}
    {...props}
  />
)

export type ChartTooltipContentProps = ComponentProps<'div'> & {
  readonly active?: boolean | undefined
  readonly payload?: TooltipPayload | undefined
  readonly label?: ReactNode | undefined
  readonly labelFormatter?: TooltipLabelFormatter | undefined
  readonly formatter?: TooltipFormatter | undefined
  readonly color?: string | undefined
  readonly hideLabel?: boolean | undefined
  readonly hideIndicator?: boolean | undefined
  readonly indicator?: 'line' | 'dot' | 'dashed' | undefined
  readonly nameKey?: string | undefined
  readonly labelKey?: string | undefined
  readonly labelClassName?: string | undefined
}

export type ChartTooltipIndicatorProps = {
  readonly color?: string | undefined
  readonly hideIndicator: boolean
  readonly icon?: ComponentType | undefined
  readonly indicator: 'line' | 'dot' | 'dashed'
  readonly nestLabel: boolean
}

export type ChartTooltipContentRootProps = ComponentProps<'div'>

export const ChartTooltipContentRoot = ({
  children,
  className,
  ...props
}: ChartTooltipContentRootProps) => (
  <div
    className={cn(
      'grid min-w-32 items-start gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground shadow-popover',
      className,
    )}
    data-slot="chart-tooltip-content"
    {...props}
  >
    {children}
  </div>
)

export type ChartTooltipLabelProps = ComponentProps<'div'>

export const ChartTooltipLabel = ({ children, className, ...props }: ChartTooltipLabelProps) => (
  <div className={cn('font-medium', className)} data-slot="chart-tooltip-label" {...props}>
    {children}
  </div>
)

export type ChartTooltipItemsProps = ComponentProps<'div'>

export const ChartTooltipItems = ({ children, className, ...props }: ChartTooltipItemsProps) => (
  <div className={cn('grid gap-1.5', className)} {...props}>
    {children}
  </div>
)

export const ChartTooltipIndicator = ({
  color,
  hideIndicator,
  icon: Icon,
  indicator,
  nestLabel,
}: ChartTooltipIndicatorProps) => {
  if (hideIndicator) {
    return null
  }

  if (Icon) {
    return <Icon />
  }

  if (!color) {
    return null
  }

  const indicatorStyle: IndicatorStyle = { '--chart-indicator-color': color }

  return (
    <div
      className={cn(
        'shrink-0 rounded-[2px] border border-[var(--chart-indicator-color)] bg-[var(--chart-indicator-color)]',
        indicator === 'dot' && 'size-2.5',
        indicator === 'line' && 'min-h-2.5 w-1',
        indicator === 'dashed' && 'w-0 border-[1.5px] border-dashed bg-transparent',
        nestLabel && indicator === 'dashed' && 'my-0.5',
      )}
      data-indicator={indicator}
      data-slot="chart-tooltip-indicator"
      style={indicatorStyle}
    />
  )
}

export type ChartTooltipItemProps = {
  readonly config: ChartConfig
  readonly formatter?: TooltipFormatter | undefined
  readonly hideIndicator: boolean
  readonly index: number
  readonly indicator: 'line' | 'dot' | 'dashed'
  readonly item: TooltipPayloadEntry
  readonly itemKey: string
  readonly nameKey?: string | undefined
  readonly nestLabel: boolean
  readonly payload: TooltipPayload
  readonly tooltipLabel: ReactNode
  readonly color?: string | undefined
}

export const ChartTooltipItem = ({
  color,
  config,
  formatter,
  hideIndicator,
  index,
  indicator,
  item,
  itemKey,
  nameKey,
  nestLabel,
  payload,
  tooltipLabel,
}: ChartTooltipItemProps) => {
  const key = `${nameKey ?? item.name ?? item.dataKey ?? 'value'}`
  const itemConfig = getPayloadConfigFromPayload(config, item, key)
  const indicatorColor = color ?? getPayloadColor(item.payload, item.color ?? item.fill)

  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground',
        indicator === 'dot' && 'items-center',
      )}
      data-slot="chart-tooltip-item"
      key={itemKey}
    >
      {formatter && item.value !== undefined && item.name !== undefined ? (
        formatter(item.value, item.name, item, index, payload)
      ) : (
        <>
          <ChartTooltipIndicator
            color={indicatorColor}
            hideIndicator={hideIndicator}
            icon={itemConfig?.icon}
            indicator={indicator}
            nestLabel={nestLabel}
          />
          <div
            className={cn(
              'flex flex-1 justify-between gap-4 leading-none',
              nestLabel ? 'items-end' : 'items-center',
            )}
          >
            <div className="grid gap-1.5">
              {nestLabel ? tooltipLabel : null}
              <span className="text-muted-foreground" data-slot="chart-tooltip-name">
                {itemConfig?.label ?? item.name}
              </span>
            </div>
            {item.value !== undefined && item.value !== null ? (
              <span className="font-mono font-medium tabular-nums" data-slot="chart-tooltip-value">
                {stringifyValue(item.value)}
              </span>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}

export const ChartTooltipContent = ({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
  ...props
}: ChartTooltipContentProps) => {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  const [firstItem] = payload
  const labelConfigKey = `${labelKey ?? firstItem?.dataKey ?? firstItem?.name ?? 'value'}`
  const labelConfig = getPayloadConfigFromPayload(config, firstItem, labelConfigKey)
  const resolvedLabel =
    !labelKey && typeof label === 'string' ? (config[label]?.label ?? label) : labelConfig?.label
  const tooltipLabel =
    hideLabel || !resolvedLabel ? null : (
      <ChartTooltipLabel className={labelClassName}>
        {labelFormatter ? labelFormatter(resolvedLabel, payload) : resolvedLabel}
      </ChartTooltipLabel>
    )
  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return (
    <ChartTooltipContentRoot className={className} {...props}>
      {!nestLabel ? tooltipLabel : null}
      <ChartTooltipItems>
        {payload
          .filter((item) => item.type !== 'none')
          .map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? 'value'}`
            const itemKey = `${item.graphicalItemId}-${key}`

            return (
              <ChartTooltipItem
                color={color}
                config={config}
                formatter={formatter}
                hideIndicator={hideIndicator}
                index={index}
                indicator={indicator}
                item={item}
                itemKey={itemKey}
                key={itemKey}
                nameKey={nameKey}
                nestLabel={nestLabel}
                payload={payload}
                tooltipLabel={tooltipLabel}
              />
            )
          })}
      </ChartTooltipItems>
    </ChartTooltipContentRoot>
  )
}

const renderLegendContent = (
  content: ComponentProps<typeof RechartsPrimitive.Legend>['content'] | undefined,
  props: DefaultLegendContentProps,
) => {
  const contentProps = getChartLegendContentProps(props)

  if (typeof content === 'function') {
    return content(props)
  }

  if (isValidElement(content)) {
    return cloneElement(content as ReactElement<Partial<ChartLegendContentProps>>, contentProps)
  }

  return <ChartLegendContent {...contentProps} />
}

const getChartLegendContentProps = (props: DefaultLegendContentProps): ChartLegendContentProps => ({
  payload: props.payload,
  verticalAlign: props.verticalAlign,
})

export type ChartLegendProps = ComponentProps<typeof RechartsPrimitive.Legend>

export const ChartLegend = ({ content, ...props }: ChartLegendProps) => (
  <RechartsPrimitive.Legend
    content={(legendProps) => (
      <div data-slot="chart-legend">{renderLegendContent(content, legendProps)}</div>
    )}
    {...props}
  />
)

export type ChartLegendContentProps = ComponentProps<'div'> & {
  readonly hideIcon?: boolean | undefined
  readonly nameKey?: string | undefined
  readonly payload?: ReadonlyArray<LegendPayload> | undefined
  readonly verticalAlign?: DefaultLegendContentProps['verticalAlign'] | undefined
}

export type ChartLegendContentRootProps = ComponentProps<'div'> & {
  readonly verticalAlign?: DefaultLegendContentProps['verticalAlign'] | undefined
}

export const ChartLegendContentRoot = ({
  children,
  className,
  verticalAlign = 'bottom',
  ...props
}: ChartLegendContentRootProps) => (
  <div
    className={cn(
      'flex items-center justify-center gap-4',
      verticalAlign === 'top' ? 'pb-3' : 'pt-3',
      className,
    )}
    data-slot="chart-legend-content"
    {...props}
  >
    {children}
  </div>
)

export type ChartLegendItemProps = ComponentProps<'div'>

export const ChartLegendItem = ({ children, className, ...props }: ChartLegendItemProps) => (
  <div
    className={cn(
      'flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-muted-foreground',
      className,
    )}
    data-slot="chart-legend-item"
    {...props}
  >
    {children}
  </div>
)

export type ChartLegendIndicatorProps = ComponentProps<'div'>

export const ChartLegendIndicator = ({ className, ...props }: ChartLegendIndicatorProps) => (
  <div
    className={cn('size-2 shrink-0 rounded-[2px] bg-[var(--chart-indicator-color)]', className)}
    data-slot="chart-legend-indicator"
    {...props}
  />
)

export type ChartLegendLabelProps = ComponentProps<'span'>

export const ChartLegendLabel = ({ children, ...props }: ChartLegendLabelProps) => (
  <span data-slot="chart-legend-label" {...props}>
    {children}
  </span>
)

export const ChartLegendContent = ({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
  ...props
}: ChartLegendContentProps) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <ChartLegendContentRoot className={className} verticalAlign={verticalAlign} {...props}>
      {payload
        .filter((item) => item.type !== 'none')
        .map((item) => {
          const key = `${nameKey ?? item.dataKey ?? 'value'}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const Icon = itemConfig?.icon
          const indicatorColor = item.color
          const indicatorStyle: IndicatorStyle = indicatorColor
            ? { '--chart-indicator-color': indicatorColor }
            : {}

          return (
            <ChartLegendItem key={String(item.dataKey ?? item.value ?? key)}>
              {Icon && !hideIcon ? (
                <Icon />
              ) : (
                !hideIcon && indicatorColor && <ChartLegendIndicator style={indicatorStyle} />
              )}
              <ChartLegendLabel>{itemConfig?.label ?? item.value}</ChartLegendLabel>
            </ChartLegendItem>
          )
        })}
    </ChartLegendContentRoot>
  )
}

export type { LegendPayload, TooltipPayloadEntry }
