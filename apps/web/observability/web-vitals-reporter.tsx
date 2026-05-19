'use client'

import { usePathname } from 'next/navigation'
import { useReportWebVitals } from 'next/web-vitals'
import { useCallback } from 'react'

import { emitTelemetryEvent } from './telemetry-transport'
import { mapWebVitalMetricToTelemetryEvent, type WebVitalsMetricInput } from './web-vitals'

export function WebVitalsReporter() {
  const pathname = usePathname()

  const reportMetric = useCallback(
    (metric: WebVitalsMetricInput) => {
      const event = mapWebVitalMetricToTelemetryEvent(metric, pathname ?? '/')

      if (event) {
        emitTelemetryEvent(event)
      }
    },
    [pathname],
  )

  useReportWebVitals(reportMetric)

  return null
}
