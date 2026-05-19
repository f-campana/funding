import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const statsPath = join(process.cwd(), '.next/diagnostics/route-bundle-stats.json')

const formatKib = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`

export const parseRouteBundleStats = (statsText) => {
  let stats

  try {
    stats = JSON.parse(statsText)
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown parse error'
    throw new Error(`Route bundle diagnostics JSON is invalid: ${detail}`)
  }

  return validateRouteBundleStats(stats)
}

export const validateRouteBundleStats = (stats) => {
  if (!Array.isArray(stats)) {
    throw new Error('Route bundle diagnostics JSON must be an array.')
  }

  return stats.map((route, index) => validateRouteBundleStat(route, index))
}

const validateRouteBundleStat = (route, index) => {
  const label = `Route bundle diagnostics entry ${index}`

  if (typeof route !== 'object' || route === null || Array.isArray(route)) {
    throw new Error(`${label} must be an object.`)
  }

  if (typeof route.route !== 'string' || route.route.length === 0) {
    throw new Error(`${label} must contain a non-empty route string.`)
  }

  if (
    typeof route.firstLoadUncompressedJsBytes !== 'number' ||
    !Number.isFinite(route.firstLoadUncompressedJsBytes) ||
    !Number.isInteger(route.firstLoadUncompressedJsBytes) ||
    route.firstLoadUncompressedJsBytes < 0
  ) {
    throw new Error(`${label} must contain a non-negative firstLoadUncompressedJsBytes integer.`)
  }

  if (
    route.firstLoadChunkPaths !== undefined &&
    (!Array.isArray(route.firstLoadChunkPaths) ||
      route.firstLoadChunkPaths.some((chunkPath) => typeof chunkPath !== 'string'))
  ) {
    throw new Error(`${label} firstLoadChunkPaths must be an array of strings when present.`)
  }

  return route
}

export const buildRouteBundleReport = (routeStats) => {
  const lines = ['Route bundle first-load JS', 'route\tbytes\tkib\tchunks']

  for (const route of routeStats) {
    const bytes = route.firstLoadUncompressedJsBytes
    const chunks = route.firstLoadChunkPaths?.length ?? 0

    lines.push(`${route.route}\t${bytes}\t${formatKib(bytes)}\t${chunks}`)
  }

  return `${lines.join('\n')}\n`
}

export const readRouteBundleStats = (path = statsPath) =>
  parseRouteBundleStats(readFileSync(path, 'utf8'))

export const main = () => {
  const routeStats = readRouteBundleStats()
  process.stdout.write(buildRouteBundleReport(routeStats))
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  try {
    main()
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.error(detail)
    process.exitCode = 1
  }
}
