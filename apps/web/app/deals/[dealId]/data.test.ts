import { describe, expect, it } from 'vitest'

import { getDealOperationsData, normalizeDealId } from './data'

describe('deal route data params', () => {
  it('accepts the Northstar deal slug', () => {
    expect(normalizeDealId('northstar-energy')).toBe('northstar-energy')
  })

  it('trims route params before service loading', () => {
    expect(normalizeDealId('  northstar-energy  ')).toBe('northstar-energy')
    expect(getDealOperationsData('  northstar-energy  ')?.deal.slug).toBe('northstar-energy')
  })

  it('rejects empty route params', () => {
    expect(normalizeDealId('   ')).toBeNull()
  })

  it('rejects invalid slug-shaped route params', () => {
    expect(normalizeDealId('Northstar Energy')).toBeNull()
    expect(getDealOperationsData('Northstar Energy')).toBeNull()
  })
})
