/**
 * @vitest-environment jsdom
 */

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { WebVitalsMetricInput } from './web-vitals'
import { WebVitalsReporter } from './web-vitals-reporter'

type ReportWebVitalsCallback = (metric: WebVitalsMetricInput) => void

const mockState = vi.hoisted(() => ({
  currentPathname: '/deals/northstar-energy/overview' as string | null,
  emitTelemetryEvent: vi.fn(),
  reportWebVitalsCallbacks: new Set<ReportWebVitalsCallback>(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => mockState.currentPathname,
}))

vi.mock('next/web-vitals', () => ({
  useReportWebVitals: (callback: ReportWebVitalsCallback) => {
    mockState.reportWebVitalsCallbacks.add(callback)
  },
}))

vi.mock('./telemetry-transport', () => ({
  emitTelemetryEvent: mockState.emitTelemetryEvent,
}))

const reactActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean
}

reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true

describe('WebVitalsReporter', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    mockState.currentPathname = '/deals/northstar-energy/overview'
    mockState.reportWebVitalsCallbacks.clear()
    vi.clearAllMocks()
  })

  it('keeps one Web Vitals callback registered while reporting the latest pathname', () => {
    act(() => {
      root.render(createElement(WebVitalsReporter))
    })

    expect(mockState.reportWebVitalsCallbacks.size).toBe(1)

    mockState.currentPathname = '/deals/northstar-energy/commitments'

    act(() => {
      root.render(createElement(WebVitalsReporter))
    })

    expect(mockState.reportWebVitalsCallbacks.size).toBe(1)

    const [reportMetric] = mockState.reportWebVitalsCallbacks

    if (!reportMetric) {
      throw new Error('Expected Web Vitals callback to be registered.')
    }

    reportMetric({
      id: 'v4-commitments-lcp',
      name: 'LCP',
      navigationType: 'navigate',
      rating: 'good',
      value: 1240,
    })

    expect(mockState.emitTelemetryEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'v4-commitments-lcp',
        name: 'LCP',
        route: '/deals/[dealId]/commitments',
        type: 'web_vital',
      }),
    )
  })
})
