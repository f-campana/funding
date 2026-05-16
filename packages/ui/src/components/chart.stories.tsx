import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import { StoryGrid, StorySection, StoryStack } from '../stories/story-layout'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from './chart'

const monthlyData = [
  { desktop: 186, mobile: 80, month: 'January' },
  { desktop: 305, mobile: 200, month: 'February' },
  { desktop: 237, mobile: 120, month: 'March' },
  { desktop: 73, mobile: 190, month: 'April' },
  { desktop: 209, mobile: 130, month: 'May' },
  { desktop: 214, mobile: 140, month: 'June' },
]

const trendData = [
  { month: 'January', revenue: 120, visitors: 220 },
  { month: 'February', revenue: 180, visitors: 260 },
  { month: 'March', revenue: 150, visitors: 310 },
  { month: 'April', revenue: 230, visitors: 340 },
  { month: 'May', revenue: 280, visitors: 390 },
  { month: 'June', revenue: 320, visitors: 430 },
]

const stackedData = [
  { alpha: 40, beta: 24, gamma: 20, month: 'January' },
  { alpha: 32, beta: 30, gamma: 26, month: 'February' },
  { alpha: 48, beta: 28, gamma: 22, month: 'March' },
  { alpha: 38, beta: 34, gamma: 30, month: 'April' },
  { alpha: 52, beta: 38, gamma: 28, month: 'May' },
  { alpha: 58, beta: 42, gamma: 34, month: 'June' },
]

const monthlyConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

const trendConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-3)',
  },
  visitors: {
    label: 'Visitors',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig

const stackedConfig = {
  alpha: {
    label: 'Alpha',
    color: 'var(--chart-1)',
  },
  beta: {
    label: 'Beta',
    color: 'var(--chart-2)',
  },
  gamma: {
    label: 'Gamma',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig

const meta = {
  component: ChartContainer,
  title: 'UI/Chart',
}

export default meta

export const BarChartWithTooltip = {
  render: () => (
    <StorySection title="Bar chart with tooltip">
      <ChartContainer className="h-72 w-full" config={monthlyConfig}>
        <BarChart accessibilityLayer data={monthlyData}>
          <CartesianGrid vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="month"
            tickFormatter={(value: string) => value.slice(0, 3)}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis axisLine={false} tickLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
        </BarChart>
      </ChartContainer>
    </StorySection>
  ),
}

export const LineChartWithLegend = {
  render: () => (
    <StorySection title="Line chart with legend">
      <ChartContainer className="h-72 w-full" config={trendConfig}>
        <LineChart accessibilityLayer data={trendData}>
          <CartesianGrid vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="month"
            tickFormatter={(value: string) => value.slice(0, 3)}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis axisLine={false} tickLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="revenue"
            dot={false}
            stroke="var(--color-revenue)"
            strokeWidth={2}
            type="monotone"
          />
          <Line
            dataKey="visitors"
            dot={false}
            stroke="var(--color-visitors)"
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ChartContainer>
    </StorySection>
  ),
}

export const AreaChartStacked = {
  render: () => (
    <StorySection title="Stacked area chart">
      <ChartContainer className="min-h-72 w-full" config={stackedConfig}>
        <AreaChart accessibilityLayer data={stackedData}>
          <CartesianGrid vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="month"
            tickFormatter={(value: string) => value.slice(0, 3)}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis axisLine={false} tickLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            dataKey="alpha"
            fill="var(--color-alpha)"
            fillOpacity={0.5}
            stackId="a"
            stroke="var(--color-alpha)"
            type="monotone"
          />
          <Area
            dataKey="beta"
            fill="var(--color-beta)"
            fillOpacity={0.5}
            stackId="a"
            stroke="var(--color-beta)"
            type="monotone"
          />
          <Area
            dataKey="gamma"
            fill="var(--color-gamma)"
            fillOpacity={0.5}
            stackId="a"
            stroke="var(--color-gamma)"
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </StorySection>
  ),
}

export const TooltipVariants = {
  render: () => (
    <StoryStack>
      <StoryGrid>
        <ChartContainer className="h-44 w-full" config={monthlyConfig}>
          <BarChart accessibilityLayer data={monthlyData.slice(0, 3)}>
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          </BarChart>
        </ChartContainer>
        <ChartContainer className="h-44 w-full" config={monthlyConfig}>
          <LineChart accessibilityLayer data={monthlyData.slice(0, 3)}>
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Line
              dataKey="mobile"
              dot={false}
              stroke="var(--color-mobile)"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ChartContainer>
      </StoryGrid>
      <ChartContainer className="h-52 w-full" config={trendConfig}>
        <LineChart accessibilityLayer data={trendData}>
          <ChartTooltip content={<ChartTooltipContent hideLabel indicator="dashed" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="revenue"
            dot={false}
            stroke="var(--color-revenue)"
            strokeWidth={2}
            type="monotone"
          />
          <Line
            dataKey="visitors"
            dot={false}
            stroke="var(--color-visitors)"
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ChartContainer>
    </StoryStack>
  ),
}
