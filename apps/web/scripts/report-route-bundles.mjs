import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const statsPath = join(process.cwd(), '.next/diagnostics/route-bundle-stats.json')
const routeStats = JSON.parse(readFileSync(statsPath, 'utf8'))

const formatKib = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`

process.stdout.write('Route bundle first-load JS\n')
process.stdout.write('route\tbytes\tkib\tchunks\n')

for (const route of routeStats) {
  const bytes = route.firstLoadUncompressedJsBytes
  const chunks = route.firstLoadChunkPaths?.length ?? 0

  process.stdout.write(`${route.route}\t${bytes}\t${formatKib(bytes)}\t${chunks}\n`)
}
