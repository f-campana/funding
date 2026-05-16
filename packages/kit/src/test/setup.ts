import '@repo/test-config/setup'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

const chartRect = {
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

Object.defineProperty(window, 'scrollTo', {
  value: () => undefined,
  writable: true,
})

vi.stubGlobal('ResizeObserver', ResizeObserverMock)
vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(chartRect)

afterEach(() => {
  cleanup()
})
