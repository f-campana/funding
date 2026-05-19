import { render, screen } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import type {
  DefaultLegendContentProps,
  LegendPayload,
  TooltipContentProps,
  TooltipPayloadEntry,
  TooltipValueType,
} from 'recharts'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { axe } from '../test/axe'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartLegendContentRoot,
  ChartLegendIndicator,
  ChartLegendItem,
  ChartLegendLabel,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipContentRoot,
  ChartTooltipItems,
  ChartTooltipLabel,
} from './chart'

const CHART_ID_PATTERN = /^chart-/
const DARK_THEME = 'dark'
const CHART_RECT = {
  bottom: 200,
  height: 200,
  left: 0,
  right: 320,
  toJSON: () => ({ height: 200, width: 320 }),
  top: 0,
  width: 320,
  x: 0,
  y: 0,
} as DOMRect

class ResizeObserverMock {
  observe() {
    return undefined
  }

  unobserve() {
    return undefined
  }

  disconnect() {
    return undefined
  }
}

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--chart-2)',
  },
  visitors: {
    label: 'Total visitors',
  },
  themed: {
    label: 'Themed',
    theme: {
      light: 'var(--chart-3)',
      [DARK_THEME]: 'var(--chart-4)',
    },
  },
} satisfies ChartConfig

const tooltipPayload = [
  {
    color: 'var(--color-desktop)',
    dataKey: 'value',
    graphicalItemId: 'desktop',
    name: 'desktop',
    payload: {
      category: 'desktop',
      fill: 'var(--color-desktop)',
      metric: 'visitors',
    },
    value: 120,
  },
  {
    color: 'var(--color-mobile)',
    dataKey: 'value',
    graphicalItemId: 'mobile',
    name: 'mobile',
    payload: {
      category: 'mobile',
      fill: 'var(--color-mobile)',
      metric: 'visitors',
    },
    value: 80,
  },
] satisfies ReadonlyArray<TooltipPayloadEntry>

const legendPayload = [
  {
    color: 'var(--color-desktop)',
    dataKey: 'desktop',
    value: 'desktop',
  },
  {
    color: 'var(--color-mobile)',
    dataKey: 'mobile',
    value: 'mobile',
  },
] satisfies ReadonlyArray<LegendPayload>

const renderWithChart = (children: ReactNode, config: ChartConfig = chartConfig) =>
  render(
    <ChartContainer className="h-48 custom-chart" config={config}>
      {children}
    </ChartContainer>,
  )

type TooltipElement = ReactElement<{
  readonly content?: (props: TooltipContentProps<TooltipValueType, string | number>) => ReactNode
}>

type LegendElement = ReactElement<{
  readonly content?: (props: DefaultLegendContentProps) => ReactNode
}>

const getTooltipContentRenderer = () => {
  const element = ChartTooltip({ content: <ChartTooltipContent /> }) as TooltipElement

  if (!element.props.content) {
    throw new Error('ChartTooltip did not provide a content renderer.')
  }

  return element.props.content
}

const getLegendContentRenderer = () => {
  const element = ChartLegend({ content: <ChartLegendContent /> }) as LegendElement

  if (!element.props.content) {
    throw new Error('ChartLegend did not provide a content renderer.')
  }

  return element.props.content
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(CHART_RECT)
})

afterAll(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ChartContainer', () => {
  it('renders children with stable slot data and merged classes', () => {
    const { container } = renderWithChart(<div>Chart content</div>)

    const chart = container.querySelector('[data-slot="chart-container"]')

    expect(screen.getByText('Chart content')).toBeInTheDocument()
    expect(chart).toHaveAttribute('data-chart')
    expect(chart).toHaveClass('custom-chart')
  })

  it('emits scoped CSS variables for color and theme config values', () => {
    const { container } = renderWithChart(<div>Chart content</div>)

    const chart = container.querySelector('[data-slot="chart-container"]')
    const chartId = chart?.getAttribute('data-chart')
    const style = container.querySelector('style[data-slot="chart-style"]')

    expect(chartId).toMatch(CHART_ID_PATTERN)
    expect(style?.textContent).toContain(`[data-chart="${chartId}"]`)
    expect(style?.textContent).toContain('--color-desktop: var(--chart-1);')
    expect(style?.textContent).toContain('--color-themed: var(--chart-3);')
    expect(style?.textContent).toContain('--color-themed: var(--chart-4);')
    expect(style?.textContent).toContain('[data-theme="dark"]')
  })

  it('skips style output when no configured colors exist', () => {
    const { container } = renderWithChart(<div>Chart content</div>, {
      value: {
        label: 'Value',
      },
    })

    expect(container.querySelector('style[data-slot="chart-style"]')).not.toBeInTheDocument()
  })

  it('has no accessibility violations with a simple chart', async () => {
    const { container } = render(
      <ChartContainer className="h-48" config={chartConfig}>
        <BarChart accessibilityLayer data={[{ desktop: 120, month: 'Jan' }]}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <Bar dataKey="desktop" fill="var(--color-desktop)" />
        </BarChart>
      </ChartContainer>,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})

describe('ChartTooltipContent', () => {
  it('renders the ChartTooltip wrapper slot', () => {
    const renderContent = getTooltipContentRenderer()
    const { container } = renderWithChart(
      renderContent({
        accessibilityLayer: true,
        active: true,
        activeIndex: '0',
        coordinate: undefined,
        label: 'visitors',
        payload: tooltipPayload,
      }),
    )

    expect(container.querySelector('[data-slot="chart-tooltip"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="chart-tooltip-content"]')).toBeInTheDocument()
  })

  it('throws a targeted error when rendered outside ChartContainer', () => {
    expect(() =>
      render(<ChartTooltipContent active payload={tooltipPayload} />),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Chart components must be rendered inside ChartContainer.]`,
    )
  })

  it('renders label and payload names from chart config', () => {
    renderWithChart(
      <ChartTooltipContent active labelKey="metric" nameKey="category" payload={tooltipPayload} />,
    )

    expect(screen.getByText('Total visitors')).toBeInTheDocument()
    expect(screen.getByText('Desktop')).toBeInTheDocument()
    expect(screen.getByText('Mobile')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
  })

  it('supports composing tooltip content from public subparts', () => {
    const { container } = renderWithChart(
      <ChartTooltipContentRoot>
        <ChartTooltipLabel>Custom tooltip</ChartTooltipLabel>
        <ChartTooltipItems>
          <span>Custom item</span>
        </ChartTooltipItems>
      </ChartTooltipContentRoot>,
    )

    expect(container.querySelector('[data-slot="chart-tooltip-content"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="chart-tooltip-label"]')).toHaveTextContent(
      'Custom tooltip',
    )
    expect(screen.getByText('Custom item')).toBeInTheDocument()
  })

  it('supports hidden label and hidden indicator options', () => {
    const { container } = renderWithChart(
      <ChartTooltipContent
        active
        hideIndicator
        hideLabel
        labelKey="metric"
        nameKey="category"
        payload={tooltipPayload}
      />,
    )

    expect(screen.queryByText('Total visitors')).not.toBeInTheDocument()
    expect(container.querySelector('[data-slot="chart-tooltip-indicator"]')).not.toBeInTheDocument()
  })

  it.each(['dot', 'line', 'dashed'] as const)('renders %s indicator structure', (indicator) => {
    const { container } = renderWithChart(
      <ChartTooltipContent
        active
        indicator={indicator}
        nameKey="category"
        payload={tooltipPayload.slice(0, 1)}
      />,
    )

    expect(container.querySelector('[data-slot="chart-tooltip-content"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="chart-tooltip-indicator"]')).toHaveAttribute(
      'data-indicator',
      indicator,
    )
  })

  it('renders safely for an empty payload', () => {
    const { container } = renderWithChart(<ChartTooltipContent active payload={[]} />)

    expect(container.querySelector('[data-slot="chart-tooltip-content"]')).not.toBeInTheDocument()
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = renderWithChart(
      <ChartTooltipContent active labelKey="metric" nameKey="category" payload={tooltipPayload} />,
    )

    expect((await axe(container)).violations).toHaveLength(0)
  })
})

describe('ChartLegendContent', () => {
  it('renders the ChartLegend wrapper slot', () => {
    const renderContent = getLegendContentRenderer()
    const { container } = renderWithChart(
      renderContent({
        payload: legendPayload,
        verticalAlign: 'bottom',
      }),
    )

    expect(container.querySelector('[data-slot="chart-legend"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="chart-legend-content"]')).toBeInTheDocument()
  })

  it('throws a targeted error when rendered outside ChartContainer', () => {
    expect(() =>
      render(<ChartLegendContent payload={legendPayload} />),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Chart components must be rendered inside ChartContainer.]`,
    )
  })

  it('renders configured labels with stable slots', () => {
    const { container } = renderWithChart(<ChartLegendContent payload={legendPayload} />)

    expect(screen.getByText('Desktop')).toBeInTheDocument()
    expect(screen.getByText('Mobile')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="chart-legend-content"]')).toBeInTheDocument()
  })

  it('supports composing legend content from public subparts', () => {
    const { container } = renderWithChart(
      <ChartLegendContentRoot>
        <ChartLegendItem>
          <ChartLegendIndicator />
          <ChartLegendLabel>Custom legend</ChartLegendLabel>
        </ChartLegendItem>
      </ChartLegendContentRoot>,
    )

    expect(container.querySelector('[data-slot="chart-legend-content"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="chart-legend-item"]')).toBeInTheDocument()
    expect(screen.getByText('Custom legend')).toBeInTheDocument()
  })

  it('honors nameKey when provided', () => {
    const keyedPayload = [
      {
        color: 'var(--color-mobile)',
        dataKey: 'value',
        payload: { category: 'mobile' },
        value: 'raw',
      },
    ] satisfies ReadonlyArray<LegendPayload>

    renderWithChart(<ChartLegendContent nameKey="category" payload={keyedPayload} />)

    expect(screen.getByText('Mobile')).toBeInTheDocument()
    expect(screen.queryByText('raw')).not.toBeInTheDocument()
  })

  it('renders safely for an empty payload', () => {
    const { container } = renderWithChart(<ChartLegendContent payload={[]} />)

    expect(container.querySelector('[data-slot="chart-legend-content"]')).not.toBeInTheDocument()
  })

  it('has no accessibility violations in a representative state', async () => {
    const { container } = renderWithChart(<ChartLegendContent payload={legendPayload} />)

    expect((await axe(container)).violations).toHaveLength(0)
  })
})
