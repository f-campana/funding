import type { ErrorResult, OkResult } from '@repo/core'
import { describe, expect, it } from 'vitest'

import { getDealOperationsData, normalizeDealId } from './data'

type TestResult<Value, ErrorValue> = OkResult<Value, ErrorValue> | ErrorResult<Value, ErrorValue>

describe('deal route data params', () => {
  it('accepts the Northstar deal slug', () => {
    expect(expectOkValue(normalizeDealId('northstar-energy'))).toBe('northstar-energy')
  })

  it('trims route params before service loading', () => {
    expect(expectOkValue(normalizeDealId('  northstar-energy  '))).toBe('northstar-energy')
    expect(expectOkValue(getDealOperationsData('  northstar-energy  '))).toMatchObject({
      deal: { slug: 'northstar-energy' },
    })
  })

  it('rejects empty route params', () => {
    expectErrorTag(normalizeDealId('   '), 'InvalidDealRouteParam')
  })

  it('rejects invalid slug-shaped route params', () => {
    expectErrorTag(normalizeDealId('Northstar Energy'), 'InvalidDealRouteParam')
    expectErrorTag(getDealOperationsData('Northstar Energy'), 'InvalidDealRouteParam')
  })

  it('propagates unsupported deals as typed route data errors', () => {
    expectErrorTag(getDealOperationsData('unknown-deal'), 'UnsupportedDeal')
  })
})

const expectOkValue = <Value, ErrorValue>(result: TestResult<Value, ErrorValue>): Value => {
  expect(result.isOk()).toBe(true)

  if (result.isError()) {
    throw new Error('Expected Ok result')
  }

  return result.value
}

const expectErrorTag = <Value, ErrorValue extends { readonly _tag: string }>(
  result: TestResult<Value, ErrorValue>,
  tag: ErrorValue['_tag'],
): void => {
  expect(result.isError()).toBe(true)

  if (result.isOk()) {
    throw new Error('Expected Error result')
  }

  expect(result.error._tag).toBe(tag)
}
