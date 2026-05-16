import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const sourceRoot = new URL('../src', import.meta.url).pathname
const checkedExtensions = new Set(['.css', '.ts', '.tsx'])
const forbiddenPatterns = [
  { label: 'React.forwardRef', pattern: /React\.forwardRef/ },
  { label: 'forwardRef(', pattern: /\bforwardRef\s*\(/ },
  { label: 'imported forwardRef', pattern: /import\s+(?:type\s+)?\{[^}]*\bforwardRef\b/ },
  { label: '.displayName =', pattern: /\.displayName\s*=/ },
  { label: 'data-testid', pattern: /data-testid/ },
  { label: 'dangerouslySetInnerHTML', pattern: /dangerouslySetInnerHTML/ },
  {
    label: 'icon library import',
    pattern:
      /from\s+['"](?:lucide-react|@radix-ui\/react-icons|@tabler\/icons-react|@heroicons\/react(?:\/[^'"]*)?|phosphor-react|react-icons(?:\/[^'"]*)?)['"]/,
  },
  {
    label: 'forbidden package boundary import',
    pattern:
      /from\s+['"](?:@repo\/domain|@repo\/kit|next-intl|@\/[^'"]*|(?:\.\.\/)*apps\/[^'"]*)['"]/,
  },
  {
    label: 'hardcoded Google Fonts import',
    pattern: /(?:fonts\.googleapis\.com|fonts\.gstatic\.com)/,
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

      if (entry.isDirectory()) {
        return walk(fullPath)
      }

      return checkedExtensions.has(extname(entry.name)) ? [fullPath] : []
    }),
  )

  return files.flat()
}

const files = await walk(sourceRoot)
const violations = []

for (const filePath of files) {
  const contents = await readFile(filePath, 'utf8')

  for (const rule of forbiddenPatterns) {
    if (rule.pattern.test(contents)) {
      violations.push(`${filePath}: ${rule.label}`)
    }
  }
}

if (violations.length > 0) {
  process.stderr.write(`UI style contract failed:\n${violations.join('\n')}\n`)
  process.exitCode = 1
}
