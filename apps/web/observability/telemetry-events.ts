export type WebVitalName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'

export type WebVitalRating = 'good' | 'needs-improvement' | 'poor'

export type TelemetryMetadataValue = string | number | boolean

export type TelemetryMetadata = Readonly<Record<string, TelemetryMetadataValue>>

export type WebVitalTelemetryEvent = {
  readonly type: 'web_vital'
  readonly name: WebVitalName
  readonly value: number
  readonly rating?: WebVitalRating
  readonly id?: string
  readonly navigationType?: string
  readonly route: string
  readonly timestamp: string
}

export type RouteInteractionTelemetryEvent = {
  readonly type: 'route_interaction'
  readonly name: 'commitment_inspector_opened' | 'commitment_inspector_closed' | 'deal_route_viewed'
  readonly route: string
  readonly timestamp: string
  readonly metadata?: TelemetryMetadata
}

export type TelemetryEvent = WebVitalTelemetryEvent | RouteInteractionTelemetryEvent

type RouteInteractionTelemetryEventInput = {
  readonly name: RouteInteractionTelemetryEvent['name']
  readonly route: string
  readonly timestamp?: string
  readonly metadata?: TelemetryMetadata
}

const knownDealRouteSegments = new Set(['about', 'commitments', 'documents', 'overview'])
const sensitiveMetadataKeyPattern =
  /(^|\.)(investorEmail|investorName|legalEntityName|document\.?label|description|blocker\.?description)$/i
const emailLikeValuePattern = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/
const maxMetadataStringLength = 80

export const sanitizeTelemetryRoute = (route: string | null | undefined): string => {
  const pathname = parsePathname(route)
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return '/'
  }

  if (segments[0] !== 'deals') {
    return '/[route]'
  }

  if (segments.length === 1) {
    return '/deals'
  }

  if (segments.length === 2) {
    return '/deals/[dealId]'
  }

  const routeSegment = segments[2] ?? ''

  if (knownDealRouteSegments.has(routeSegment)) {
    return `/deals/[dealId]/${routeSegment}`
  }

  return '/deals/[dealId]/[segment]'
}

export const sanitizeTelemetryMetadata = (
  metadata: TelemetryMetadata | undefined,
): TelemetryMetadata | undefined => {
  if (!metadata) {
    return undefined
  }

  const safeEntries = Object.entries(metadata).filter(([key, value]) =>
    isSafeMetadataEntry(key, value),
  )

  if (safeEntries.length === 0) {
    return undefined
  }

  return Object.fromEntries(safeEntries)
}

export const createRouteInteractionTelemetryEvent = ({
  name,
  route,
  timestamp = new Date().toISOString(),
  metadata,
}: RouteInteractionTelemetryEventInput): RouteInteractionTelemetryEvent => {
  const safeMetadata = sanitizeTelemetryMetadata(metadata)

  return {
    type: 'route_interaction',
    name,
    route: sanitizeTelemetryRoute(route),
    timestamp,
    ...(safeMetadata ? { metadata: safeMetadata } : {}),
  }
}

const parsePathname = (route: string | null | undefined): string => {
  const trimmedRoute = route?.trim()

  if (!trimmedRoute) {
    return '/'
  }

  try {
    return new URL(trimmedRoute, 'https://telemetry.local').pathname
  } catch {
    return '/'
  }
}

const isSafeMetadataEntry = (key: string, value: TelemetryMetadataValue): boolean => {
  if (sensitiveMetadataKeyPattern.test(key)) {
    return false
  }

  if (typeof value !== 'string') {
    return true
  }

  if (value.length > maxMetadataStringLength) {
    return false
  }

  return !emailLikeValuePattern.test(value)
}
