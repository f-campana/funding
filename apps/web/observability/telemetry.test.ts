import { describe, expect, it } from 'vitest'

import {
  createRouteInteractionTelemetryEvent,
  sanitizeTelemetryRoute,
  type TelemetryEvent,
} from './telemetry-events'
import { createConsoleTelemetryTransport } from './telemetry-transport'
import { mapWebVitalMetricToTelemetryEvent } from './web-vitals'

const timestamp = '2026-05-19T12:00:00.000Z'

describe('frontend telemetry event shaping', () => {
  it('maps a Web Vitals metric to a privacy-safe telemetry event', () => {
    expect(
      mapWebVitalMetricToTelemetryEvent(
        {
          id: 'v4-123',
          name: 'LCP',
          navigationType: 'navigate',
          rating: 'needs-improvement',
          value: 2450,
        },
        '/deals/northstar-energy/overview?investorEmail=closing@example.com',
        timestamp,
      ),
    ).toEqual({
      id: 'v4-123',
      name: 'LCP',
      navigationType: 'navigate',
      rating: 'needs-improvement',
      route: '/deals/[dealId]/overview',
      timestamp,
      type: 'web_vital',
      value: 2450,
    })
  })

  it('ignores unexpected Web Vitals metric names and invalid values', () => {
    expect(
      mapWebVitalMetricToTelemetryEvent(
        {
          name: 'CUSTOM_METRIC',
          value: 1,
        },
        '/',
        timestamp,
      ),
    ).toBeNull()
    expect(
      mapWebVitalMetricToTelemetryEvent(
        {
          name: 'CLS',
          value: Number.NaN,
        },
        '/',
        timestamp,
      ),
    ).toBeNull()
  })

  it('sanitizes route paths to stable route patterns', () => {
    expect(sanitizeTelemetryRoute('/')).toBe('/')
    expect(sanitizeTelemetryRoute('/deals/northstar-energy')).toBe('/deals/[dealId]')
    expect(sanitizeTelemetryRoute('/deals/northstar-energy/commitments')).toBe(
      '/deals/[dealId]/commitments',
    )
    expect(sanitizeTelemetryRoute('/deals/northstar-energy/private-note')).toBe(
      '/deals/[dealId]/[segment]',
    )
    expect(sanitizeTelemetryRoute('/investors/closing@example.com')).toBe('/[route]')
  })

  it('does not emit console telemetry when disabled', () => {
    const calls: Array<[string, TelemetryEvent]> = []
    const transport = createConsoleTelemetryTransport({
      enabled: false,
      logger: (message, event) => calls.push([message, event]),
    })

    transport(sampleWebVitalEvent)

    expect(calls).toEqual([])
  })

  it('emits console telemetry only when enabled', () => {
    const calls: Array<[string, TelemetryEvent]> = []
    const transport = createConsoleTelemetryTransport({
      enabled: true,
      logger: (message, event) => calls.push([message, event]),
    })

    transport(sampleWebVitalEvent)

    expect(calls).toEqual([['[funding:telemetry]', sampleWebVitalEvent]])
  })

  it('drops sensitive route interaction metadata before transport', () => {
    const event = createRouteInteractionTelemetryEvent({
      metadata: {
        description: 'Raw operational blocker description',
        documentLabel: 'Meridian UBO declaration',
        investorEmail: 'closing@meridian.example',
        investorName: 'Meridian Ventures',
        legalEntityName: 'Meridian Ventures II LP',
        routeKind: 'commitments',
        safeCount: 2,
        surface: 'commitment_inspector',
        valueWithEmail: 'closing@meridian.example',
      },
      name: 'commitment_inspector_opened',
      route: '/deals/northstar-energy/commitments',
      timestamp,
    })

    expect(event).toEqual({
      metadata: {
        routeKind: 'commitments',
        safeCount: 2,
        surface: 'commitment_inspector',
      },
      name: 'commitment_inspector_opened',
      route: '/deals/[dealId]/commitments',
      timestamp,
      type: 'route_interaction',
    })
    expect(JSON.stringify(event)).not.toContain('closing@meridian.example')
    expect(JSON.stringify(event)).not.toContain('Meridian Ventures')
    expect(JSON.stringify(event)).not.toContain('Raw operational blocker description')
  })
})

const sampleWebVitalEvent = {
  name: 'CLS',
  route: '/deals/[dealId]/overview',
  timestamp,
  type: 'web_vital',
  value: 0.02,
} satisfies TelemetryEvent
