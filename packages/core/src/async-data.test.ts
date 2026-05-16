import * as fc from 'fast-check'
import { describe, expect, it, vi } from 'vitest'

import { AsyncData, type AsyncData as AsyncDataType } from './async-data'

type PlainAsyncData<T> =
  | {
      readonly _tag: 'NotAsked'
    }
  | {
      readonly _tag: 'Loading'
    }
  | {
      readonly _tag: 'Done'
      readonly value: T
    }

const plainAsyncData = <T>(data: AsyncDataType<T>): PlainAsyncData<T> => {
  return data.match<PlainAsyncData<T>>({
    NotAsked: () => ({ _tag: 'NotAsked' as const }),
    Loading: () => ({ _tag: 'Loading' as const }),
    Done: (value) => ({ _tag: 'Done' as const, value }),
  })
}

const asyncDataArbitrary: fc.Arbitrary<AsyncDataType<number>> = fc.oneof(
  fc.constant(AsyncData.NotAsked<number>()),
  fc.constant(AsyncData.Loading<number>()),
  fc.integer().map((value) => AsyncData.Done(value)),
)

describe('AsyncData constructors', () => {
  it('creates all variants', () => {
    expect(plainAsyncData(AsyncData.NotAsked<number>())).toEqual({ _tag: 'NotAsked' })
    expect(plainAsyncData(AsyncData.Loading<number>())).toEqual({ _tag: 'Loading' })
    expect(plainAsyncData(AsyncData.Done(42))).toEqual({ _tag: 'Done', value: 42 })
  })
})

describe('AsyncData.map', () => {
  it('transforms Done values', () => {
    expect(plainAsyncData(AsyncData.Done(5).map((value) => value * 2))).toEqual({
      _tag: 'Done',
      value: 10,
    })
  })

  it('propagates NotAsked and Loading without calling the mapper', () => {
    const mapper = vi.fn((value: number) => value * 2)

    expect(plainAsyncData(AsyncData.NotAsked<number>().map(mapper))).toEqual({
      _tag: 'NotAsked',
    })
    expect(plainAsyncData(AsyncData.Loading<number>().map(mapper))).toEqual({
      _tag: 'Loading',
    })
    expect(mapper).not.toHaveBeenCalled()
  })
})

describe('AsyncData.flatMap', () => {
  it('chains Done values', () => {
    const result = AsyncData.Done(5).flatMap((value) => AsyncData.Done(value * 2))

    expect(plainAsyncData(result)).toEqual({ _tag: 'Done', value: 10 })
  })

  it('can return non-Done states from Done', () => {
    expect(plainAsyncData(AsyncData.Done(5).flatMap(() => AsyncData.Loading<number>()))).toEqual({
      _tag: 'Loading',
    })
  })

  it('propagates NotAsked and Loading without calling the mapper', () => {
    const mapper = vi.fn((value: number) => AsyncData.Done(value * 2))

    expect(plainAsyncData(AsyncData.NotAsked<number>().flatMap(mapper))).toEqual({
      _tag: 'NotAsked',
    })
    expect(plainAsyncData(AsyncData.Loading<number>().flatMap(mapper))).toEqual({
      _tag: 'Loading',
    })
    expect(mapper).not.toHaveBeenCalled()
  })
})

describe('AsyncData.match and predicates', () => {
  it('matches all variants', () => {
    const cases = {
      NotAsked: () => 'not asked',
      Loading: () => 'loading',
      Done: (value: number) => `done ${value}`,
    }

    expect(AsyncData.NotAsked<number>().match(cases)).toBe('not asked')
    expect(AsyncData.Loading<number>().match(cases)).toBe('loading')
    expect(AsyncData.Done(4).match(cases)).toBe('done 4')
  })

  it('narrows all variants at runtime', () => {
    const notAsked = AsyncData.NotAsked<number>()
    const loading = AsyncData.Loading<number>()
    const done = AsyncData.Done(1)

    expect(notAsked.isNotAsked()).toBe(true)
    expect(notAsked.isLoading()).toBe(false)
    expect(notAsked.isDone()).toBe(false)

    expect(loading.isLoading()).toBe(true)
    expect(loading.isNotAsked()).toBe(false)
    expect(loading.isDone()).toBe(false)

    expect(done.isDone()).toBe(true)
    expect(done.isNotAsked()).toBe(false)
    expect(done.isLoading()).toBe(false)
    if (done.isDone()) {
      expect(done.value).toBe(1)
    }
  })
})

describe('AsyncData.all', () => {
  it('returns Done tuple when every input is Done', () => {
    expect(plainAsyncData(AsyncData.all(AsyncData.Done(1), AsyncData.Done('a')))).toEqual({
      _tag: 'Done',
      value: [1, 'a'],
    })
  })

  it('supports variadic tuples', () => {
    expect(
      plainAsyncData(AsyncData.all(AsyncData.Done(1), AsyncData.Done('a'), AsyncData.Done(true))),
    ).toEqual({
      _tag: 'Done',
      value: [1, 'a', true],
    })
  })

  it('returns Loading when any input is Loading', () => {
    expect(plainAsyncData(AsyncData.all(AsyncData.Done(1), AsyncData.Loading<string>()))).toEqual({
      _tag: 'Loading',
    })
    expect(
      plainAsyncData(AsyncData.all(AsyncData.Loading<number>(), AsyncData.NotAsked<string>())),
    ).toEqual({
      _tag: 'Loading',
    })
  })

  it('returns NotAsked when no input is Loading and at least one is NotAsked', () => {
    expect(plainAsyncData(AsyncData.all(AsyncData.Done(1), AsyncData.NotAsked<string>()))).toEqual({
      _tag: 'NotAsked',
    })
  })
})

describe('AsyncData Functor laws', () => {
  it('identity: asyncData.map(id) equals asyncData', () => {
    fc.assert(
      fc.property(asyncDataArbitrary, (data) => {
        expect(plainAsyncData(data.map((value) => value))).toEqual(plainAsyncData(data))
      }),
    )
  })

  it('composition: asyncData.map(f).map(g) equals asyncData.map(g after f)', () => {
    const f = (value: number): number => value * 2
    const g = (value: number): number => value + 1

    fc.assert(
      fc.property(asyncDataArbitrary, (data) => {
        const left = data.map(f).map(g)
        const right = data.map((value) => g(f(value)))

        expect(plainAsyncData(left)).toEqual(plainAsyncData(right))
      }),
    )
  })
})

describe('AsyncData.all property', () => {
  it('uses Loading, NotAsked, Done priority for combined states', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          asyncDataArbitrary,
          asyncDataArbitrary,
          fc.array(asyncDataArbitrary, { maxLength: 3 }),
        ),
        ([first, second, rest]) => {
          const items = [first, second, ...rest]
          const result = AsyncData.all(first, second, ...rest)

          if (items.some((item) => item.isLoading())) {
            expect(plainAsyncData(result)).toEqual({ _tag: 'Loading' })
            return
          }

          if (items.some((item) => item.isNotAsked())) {
            expect(plainAsyncData(result)).toEqual({ _tag: 'NotAsked' })
            return
          }

          expect(plainAsyncData(result)).toEqual({
            _tag: 'Done',
            value: items.map((item) => (item.isDone() ? item.value : undefined)),
          })
        },
      ),
    )
  })
})
