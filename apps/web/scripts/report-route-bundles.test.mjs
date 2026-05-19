import { describe, expect, it } from 'vitest'

import { buildRouteBundleReport, parseRouteBundleStats } from './report-route-bundles.mjs'

const invalidJsonError = /Route bundle diagnostics JSON is invalid:/

describe('route bundle diagnostics report', () => {
  it('renders validated route diagnostics', () => {
    const stats = parseRouteBundleStats(
      JSON.stringify([
        {
          route: '/deals/[dealId]',
          firstLoadUncompressedJsBytes: 2048,
          firstLoadChunkPaths: ['static/chunks/app/deals.js'],
        },
      ]),
    )

    expect(buildRouteBundleReport(stats)).toBe(
      'Route bundle first-load JS\nroute\tbytes\tkib\tchunks\n/deals/[dealId]\t2048\t2.0 KiB\t1\n',
    )
  })

  it('rejects invalid diagnostics JSON', () => {
    expect(() => parseRouteBundleStats('{')).toThrow(invalidJsonError)
  })

  it('rejects diagnostics that are not arrays', () => {
    expect(() => parseRouteBundleStats(JSON.stringify({ route: '/' }))).toThrow(
      'Route bundle diagnostics JSON must be an array.',
    )
  })

  it('rejects entries missing first-load byte counts', () => {
    expect(() => parseRouteBundleStats(JSON.stringify([{ route: '/' }]))).toThrow(
      'Route bundle diagnostics entry 0 must contain a non-negative firstLoadUncompressedJsBytes integer.',
    )
  })

  it('rejects fractional first-load byte counts', () => {
    expect(() =>
      parseRouteBundleStats(JSON.stringify([{ route: '/', firstLoadUncompressedJsBytes: 1.5 }])),
    ).toThrow(
      'Route bundle diagnostics entry 0 must contain a non-negative firstLoadUncompressedJsBytes integer.',
    )
  })

  it('rejects non-string chunk paths', () => {
    expect(() =>
      parseRouteBundleStats(
        JSON.stringify([
          {
            route: '/',
            firstLoadUncompressedJsBytes: 1,
            firstLoadChunkPaths: [1],
          },
        ]),
      ),
    ).toThrow(
      'Route bundle diagnostics entry 0 firstLoadChunkPaths must be an array of strings when present.',
    )
  })
})
