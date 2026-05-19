'use client'

import { usePathname } from 'next/navigation'
import { useReportWebVitals } from 'next/web-vitals'
import { useCallback, useRef } from 'react'

import { emitTelemetryEvent } from './telemetry-transport'
import { mapWebVitalMetricToTelemetryEvent, type WebVitalsMetricInput } from './web-vitals'

export function WebVitalsReporter() {
  const pathname = usePathname()
  const pathnameRef = useRef(pathname ?? '/')

  pathnameRef.current = pathname ?? '/'

  const reportMetric = useCallback((metric: WebVitalsMetricInput) => {
    const event = mapWebVitalMetricToTelemetryEvent(metric, pathnameRef.current)

    if (event) {
      emitTelemetryEvent(event)
    }
  }, [])

  useReportWebVitals(reportMetric)

  return null
}
