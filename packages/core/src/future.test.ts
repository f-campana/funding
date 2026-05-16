import { describe, expect, it, vi } from 'vitest'

import { type CancelFn, Future } from './future'

const settle = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

const noop = (): void => undefined

describe('Future constructors', () => {
  it('is lazy and starts only when get is called', () => {
    const resolve = vi.fn()
    let starts = 0
    const future = Future.make<number>((runResolve) => {
      starts += 1
      runResolve(42)
      return noop
    })

    expect(starts).toBe(0)
    const cancel = future.get(resolve)

    expect(starts).toBe(1)
    expect(resolve).toHaveBeenCalledWith(42)
    cancel()
  })

  it('lifts a resolved value while remaining lazy', () => {
    const resolve = vi.fn()
    const future = Future.value(7)

    expect(resolve).not.toHaveBeenCalled()
    future.get(resolve)

    expect(resolve).toHaveBeenCalledWith(7)
  })

  it('converts a resolved promise to Ok', async () => {
    const resolve = vi.fn()
    Future.fromPromise(() => Promise.resolve(7)).get(resolve)

    await settle()

    expect(resolve).toHaveBeenCalledWith(expect.objectContaining({ _tag: 'Ok', value: 7 }))
  })

  it('converts a rejected Error promise to Error', async () => {
    const resolve = vi.fn()
    const error = new Error('network')
    Future.fromPromise<number>(() => Promise.reject(error)).get(resolve)

    await settle()

    expect(resolve).toHaveBeenCalledWith(expect.objectContaining({ _tag: 'Error', error }))
  })

  it('converts a rejected non-Error promise to Error', async () => {
    const resolve = vi.fn()
    Future.fromPromise<number>(() => Promise.reject('network')).get(resolve)

    await settle()

    const result = resolve.mock.calls[0]?.[0]
    expect(result).toMatchObject({ _tag: 'Error' })
    expect(result.error).toBeInstanceOf(Error)
    expect(result.error.message).toBe('network')
  })

  it('converts a synchronously thrown promise factory error to Error', () => {
    const resolve = vi.fn()
    const error = new Error('sync failure')

    Future.fromPromise<number>(() => {
      throw error
    }).get(resolve)

    expect(resolve).toHaveBeenCalledWith(expect.objectContaining({ _tag: 'Error', error }))
  })
})

describe('Future.map and Future.flatMap', () => {
  it('maps resolved values', () => {
    const resolve = vi.fn()
    Future.value(3)
      .map((value) => value * 2)
      .get(resolve)

    expect(resolve).toHaveBeenCalledWith(6)
  })

  it('chains futures with flatMap', () => {
    const resolve = vi.fn()
    Future.value(3)
      .flatMap((value) => Future.value(value * 2))
      .get(resolve)

    expect(resolve).toHaveBeenCalledWith(6)
  })

  it('cancels the outer future before flatMap starts the inner future', async () => {
    const resolve = vi.fn()
    const outerCancel = vi.fn()
    const mapper = vi.fn((value: number) => Future.value(value * 2))
    let outerResolve: ((value: number) => void) | undefined
    const future = Future.make<number>((runResolve) => {
      outerResolve = runResolve
      return outerCancel
    }).flatMap(mapper)

    const cancel = future.get(resolve)
    cancel()
    outerResolve?.(3)

    await settle()

    expect(outerCancel).toHaveBeenCalledOnce()
    expect(mapper).not.toHaveBeenCalled()
    expect(resolve).not.toHaveBeenCalled()
  })

  it('cancels an inner future after flatMap starts it', async () => {
    const resolve = vi.fn()
    const innerCancel = vi.fn()
    let innerResolve: ((value: number) => void) | undefined
    const future = Future.value(3).flatMap(() => {
      return Future.make<number>((runResolve) => {
        innerResolve = runResolve
        return innerCancel
      })
    })

    const cancel = future.get(resolve)
    cancel()
    innerResolve?.(6)

    await settle()

    expect(innerCancel).toHaveBeenCalledOnce()
    expect(resolve).not.toHaveBeenCalled()
  })
})

describe('Future cancellation contract', () => {
  it('does not call resolve after cancel', async () => {
    const resolve = vi.fn()
    const innerCancel = vi.fn()
    let outerResolve: ((value: number) => void) | undefined
    const future = Future.make<number>((runResolve) => {
      outerResolve = runResolve
      return innerCancel
    })

    const cancel = future.get(resolve)
    cancel()
    outerResolve?.(42)

    await settle()

    expect(resolve).not.toHaveBeenCalled()
    expect(innerCancel).toHaveBeenCalledOnce()
  })

  it('treats cancel after resolution as a no-op', () => {
    const resolve = vi.fn()
    const innerCancel = vi.fn()
    const future = Future.make<number>((runResolve) => {
      runResolve(42)
      return innerCancel
    })

    const cancel = future.get(resolve)

    expect(resolve).toHaveBeenCalledWith(42)
    expect(() => cancel()).not.toThrow()
    expect(innerCancel).not.toHaveBeenCalled()
  })

  it('makes cancel idempotent', () => {
    const resolve = vi.fn()
    const innerCancel = vi.fn()
    const future = Future.make<number>(() => innerCancel)
    const cancel = future.get(resolve)

    expect(() => {
      cancel()
      cancel()
      cancel()
    }).not.toThrow()
    expect(innerCancel).toHaveBeenCalledOnce()
    expect(resolve).not.toHaveBeenCalled()
  })

  it('resolves at most once', () => {
    const resolve = vi.fn()
    const future = Future.make<number>((runResolve) => {
      runResolve(1)
      runResolve(2)
      return noop
    })

    future.get(resolve)

    expect(resolve).toHaveBeenCalledOnce()
    expect(resolve).toHaveBeenCalledWith(1)
  })

  it('prevents promise resolution callbacks after cancel', async () => {
    const resolve = vi.fn()
    let promiseResolve: ((value: number) => void) | undefined
    const promise = new Promise<number>((runResolve) => {
      promiseResolve = runResolve
    })
    const cancel = Future.fromPromise(() => promise).get(resolve)

    cancel()
    promiseResolve?.(9)

    await settle()

    expect(resolve).not.toHaveBeenCalled()
  })
})

describe('CancelFn', () => {
  it('is the function returned by get', () => {
    const cancel: CancelFn = Future.value(1).get(noop)

    expect(typeof cancel).toBe('function')
  })
})
