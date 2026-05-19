import type { TelemetryEvent } from './telemetry-events'

export type TelemetryTransport = (event: TelemetryEvent) => void

type TelemetryLogger = (message: string, event: TelemetryEvent) => void

type ConsoleTelemetryTransportOptions = {
  readonly enabled: boolean
  readonly logger?: TelemetryLogger
}

export const telemetryConsoleFlagKey = 'funding.telemetry.console'

export const noopTelemetryTransport: TelemetryTransport = () => undefined

export const createConsoleTelemetryTransport = ({
  enabled,
  logger = console.info,
}: ConsoleTelemetryTransportOptions): TelemetryTransport => {
  return (event) => {
    if (!enabled) {
      return
    }

    logger('[funding:telemetry]', event)
  }
}

export const createBrowserTelemetryTransport = (): TelemetryTransport => {
  if (process.env.NODE_ENV === 'production') {
    return noopTelemetryTransport
  }

  return createConsoleTelemetryTransport({
    enabled: isBrowserConsoleTelemetryEnabled(),
  })
}

export const emitTelemetryEvent = (
  event: TelemetryEvent,
  transport: TelemetryTransport = createBrowserTelemetryTransport(),
) => {
  transport(event)
}

const isBrowserConsoleTelemetryEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(telemetryConsoleFlagKey) === 'true'
  } catch {
    return false
  }
}
