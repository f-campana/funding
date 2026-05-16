import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const packageRoot = new URL('..', import.meta.url).pathname
const scriptPath = new URL('./check-kit-contract.mjs', import.meta.url).pathname
const checkedRoots = [join(packageRoot, 'src'), join(packageRoot, 'scripts')]
const checkedExtensions = new Set(['.css', '.ts', '.tsx', '.mjs'])

const forbiddenPatterns = [
  { label: 'React.forwardRef', pattern: /React\.forwardRef/ },
  { label: 'forwardRef(', pattern: /\bforwardRef\s*\(/ },
  { label: 'imported forwardRef', pattern: /import\s+(?:type\s+)?\{[^}]*\bforwardRef\b/ },
  { label: '.displayName =', pattern: /\.displayName\s*=/ },
  { label: 'data-testid', pattern: /data-testid/ },
  { label: 'dangerouslySetInnerHTML', pattern: /dangerouslySetInnerHTML/ },
  { label: 'next-intl import', pattern: /from\s+['"]next-intl(?:\/[^'"]*)?['"]/ },
  {
    label: 'next/navigation import',
    pattern: /from\s+['"]next\/navigation['"]/,
  },
  {
    label: 'app import',
    pattern: /from\s+['"](?:@\/[^'"]*|(?:\.\.\/)*apps\/[^'"]*|@repo\/web(?:\/[^'"]*)?)['"]/,
  },
  {
    label: 'server/database import',
    pattern:
      /from\s+['"][^'"]*(?:\/server\/|\/database\/|\/db\/|\/prisma\/|server\/db|server\/database|prisma)[^'"]*['"]/,
  },
  {
    label: 'tRPC import',
    pattern: /from\s+['"][^'"]*(?:trpc|tRPC)[^'"]*['"]/,
  },
  { label: 'raw hex color', pattern: /#[0-9a-fA-F]{3,8}\b/ },
  { label: 'raw oklch color', pattern: /\boklch\(/ },
  {
    label: 'hardcoded Tailwind color utility',
    pattern:
      /\b(?:bg|border|decoration|divide|fill|from|outline|placeholder|ring|shadow|stroke|text|to|via)-(?:amber|blue|brown|cyan|emerald|fuchsia|gray|green|indigo|lime|neutral|orange|pink|purple|red|rose|sky|slate|stone|teal|violet|yellow|zinc)-\d{2,3}\b/,
  },
  { label: 'manual dark mode override', pattern: /\bdark:/ },
  { label: 'space-x/space-y layout utility', pattern: /\bspace-[xy]-/ },
]

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name)

      if (fullPath === scriptPath) {
        return []
      }

      if (entry.isDirectory()) {
        return walk(fullPath)
      }

      return checkedExtensions.has(extname(entry.name)) ? [fullPath] : []
    }),
  )

  return files.flat()
}

const files = (await Promise.all(checkedRoots.map((root) => walk(root)))).flat()
const violations = []

for (const filePath of files) {
  const contents = await readFile(filePath, 'utf8')

  for (const rule of forbiddenPatterns) {
    if (rule.pattern.test(contents)) {
      violations.push(`${relative(packageRoot, filePath)}: ${rule.label}`)
    }
  }
}

if (violations.length > 0) {
  process.stderr.write(`Kit contract failed:\n${violations.join('\n')}\n`)
  process.exitCode = 1
}
