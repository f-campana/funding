import {
  sanitizeTelemetryRoute,
  type WebVitalName,
  type WebVitalRating,
  type WebVitalTelemetryEvent,
} from './telemetry-events'

export type WebVitalsMetricInput = {
  readonly name: string
  readonly value: number
  readonly rating?: string
  readonly id?: string
  readonly navigationType?: string
}

const webVitalNames = new Set<WebVitalName>(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'])
const webVitalRatings = new Set<WebVitalRating>(['good', 'needs-improvement', 'poor'])

export const mapWebVitalMetricToTelemetryEvent = (
  metric: WebVitalsMetricInput,
  route: string,
  timestamp = new Date().toISOString(),
): WebVitalTelemetryEvent | null => {
  if (!isWebVitalName(metric.name) || !Number.isFinite(metric.value)) {
    return null
  }

  return {
    type: 'web_vital',
    name: metric.name,
    value: metric.value,
    ...(isWebVitalRating(metric.rating) ? { rating: metric.rating } : {}),
    ...(metric.id ? { id: metric.id } : {}),
    ...(metric.navigationType ? { navigationType: metric.navigationType } : {}),
    route: sanitizeTelemetryRoute(route),
    timestamp,
  }
}

const isWebVitalName = (name: string): name is WebVitalName =>
  webVitalNames.has(name as WebVitalName)

const isWebVitalRating = (rating: string | undefined): rating is WebVitalRating =>
  rating !== undefined && webVitalRatings.has(rating as WebVitalRating)
