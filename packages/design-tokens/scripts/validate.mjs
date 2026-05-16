import { readdir, readFile } from 'node:fs/promises'

import {
  baseTokenSpecs,
  buildTokensCss,
  buildTokensTs,
  cssUrl,
  getTokenValue,
  readinessColorTokens,
  readTokenSource,
  semanticColorTokens,
  shadcnColorTokens,
  statusColorTokens,
  tsUrl,
} from './generate.mjs'

const contrastPairs = [
  ['background', 'foreground', 7],
  ['card', 'card-foreground', 7],
  ['popover', 'popover-foreground', 7],
  ['primary', 'primary-foreground', 4.5],
  ['secondary', 'secondary-foreground', 4.5],
  ['muted', 'muted-foreground', 4.5],
  ['accent', 'accent-foreground', 4.5],
  ['destructive', 'destructive-foreground', 4.5],
  ['sidebar', 'sidebar-foreground', 7],
  ['sidebar-primary', 'sidebar-primary-foreground', 4.5],
  ['sidebar-accent', 'sidebar-accent-foreground', 4.5],
  ['status-success', 'status-success-foreground', 4.5],
  ['status-attention', 'status-attention-foreground', 4.5],
  ['status-danger', 'status-danger-foreground', 4.5],
  ['status-info', 'status-info-foreground', 4.5],
  ['status-pending', 'status-pending-foreground', 4.5],
  ['readiness-ready', 'readiness-ready-foreground', 4.5],
  ['readiness-attention', 'readiness-attention-foreground', 4.5],
  ['readiness-blocked', 'readiness-blocked-foreground', 4.5],
  ['readiness-not-started', 'readiness-not-started-foreground', 4.5],
]

const readinessAliasMap = {
  'readiness-ready': 'status-success',
  'readiness-attention': 'status-attention',
  'readiness-blocked': 'status-danger',
  'readiness-not-started': 'status-pending',
}

const readinessAliasSuffixes = ['', '-foreground', '-muted', '-border']

const srcUrl = new URL('../src/', import.meta.url)
const oklchPattern =
  /^oklch\(\s*(-?\d*\.?\d+%?)\s+(-?\d*\.?\d+)\s+(-?\d*\.?\d+)(?:deg)?(?:\s*\/\s*[^)]+)?\s*\)$/

const validateRequiredTokens = (source, errors) => {
  for (const themeName of ['light', 'dark']) {
    for (const tokenName of semanticColorTokens) {
      validateTokenPath(source, ['themes', themeName, 'color', tokenName], errors)
    }
  }

  for (const baseSpec of baseTokenSpecs) {
    validateTokenPath(source, baseSpec.path, errors)
  }
}

const validateReadinessAlias = (source, themeName, readinessBase, statusBase, suffix, errors) => {
  const readinessToken = `${readinessBase}${suffix}`
  const statusToken = `${statusBase}${suffix}`
  let readinessValue
  let statusValue

  try {
    readinessValue = getTokenValue(source, ['themes', themeName, 'color', readinessToken])
    statusValue = getTokenValue(source, ['themes', themeName, 'color', statusToken])
  } catch (error) {
    errors.push(
      error instanceof Error
        ? error.message
        : `Invalid readiness alias path for ${readinessToken}.`,
    )
    return
  }

  if (readinessValue !== statusValue) {
    errors.push(`${themeName} ${readinessToken} must match ${statusToken}.`)
  }
}

const validateReadinessAliases = (source, errors) => {
  for (const themeName of ['light', 'dark']) {
    for (const [readinessBase, statusBase] of Object.entries(readinessAliasMap)) {
      for (const suffix of readinessAliasSuffixes) {
        validateReadinessAlias(source, themeName, readinessBase, statusBase, suffix, errors)
      }
    }
  }
}

const validateTokenListCompleteness = (errors) => {
  for (const tokenName of statusColorTokens) {
    if (!semanticColorTokens.includes(tokenName)) {
      errors.push(`${tokenName} is missing from semanticColorTokens.`)
    }
  }

  for (const tokenName of readinessColorTokens) {
    if (!semanticColorTokens.includes(tokenName)) {
      errors.push(`${tokenName} is missing from semanticColorTokens.`)
    }
  }

  for (const tokenName of shadcnColorTokens) {
    if (!semanticColorTokens.includes(tokenName)) {
      errors.push(`${tokenName} is missing from semanticColorTokens.`)
    }
  }
}

const validateTokenPath = (source, path, errors) => {
  try {
    getTokenValue(source, path)
  } catch (error) {
    errors.push(error instanceof Error ? error.message : `Invalid token path: ${path.join('.')}`)
  }
}

const readGeneratedFile = async (fileUrl, label, errors) => {
  try {
    return await readFile(fileUrl, 'utf8')
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown error'
    errors.push(`Unable to read ${label}: ${detail}`)
    return undefined
  }
}

const validateGeneratedOutput = async (source, errors) => {
  const [actualCss, actualTs] = await Promise.all([
    readGeneratedFile(cssUrl, 'css/tokens.css', errors),
    readGeneratedFile(tsUrl, 'src/tokens.generated.ts', errors),
  ])

  if (actualCss !== undefined && actualCss !== buildTokensCss(source)) {
    errors.push('Generated css/tokens.css is stale. Run pnpm --filter @repo/design-tokens build.')
  }

  if (actualTs !== undefined && actualTs !== buildTokensTs(source)) {
    errors.push(
      'Generated src/tokens.generated.ts is stale. Run pnpm --filter @repo/design-tokens build.',
    )
  }
}

const listFiles = async (dirUrl) => {
  const entries = await readdir(dirUrl, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryUrl = new URL(entry.name, dirUrl)

    if (entry.isDirectory()) {
      files.push(...(await listFiles(new URL(`${entry.name}/`, dirUrl))))
    } else {
      files.push(entryUrl)
    }
  }

  return files
}

const validatePlaceholderRemoval = async (errors) => {
  const sourceFiles = await listFiles(srcUrl)

  for (const sourceFile of sourceFiles) {
    const sourceText = await readFile(sourceFile, 'utf8')

    if (sourceText.includes('placeholderTokens')) {
      errors.push(`placeholderTokens still appears in ${sourceFile.pathname}`)
    }
  }
}

const parseOklch = (value) => {
  const match = value.match(oklchPattern)

  if (!match) {
    throw new Error(`Expected oklch() color value, received ${value}`)
  }

  const lightness = parseComponent(match[1], 'lightness')
  const chroma = parseComponent(match[2], 'chroma')
  const hue = parseComponent(match[3], 'hue')
  const normalizedLightness = match[1].endsWith('%') ? lightness / 100 : lightness

  return {
    lightness: normalizedLightness,
    chroma,
    hueDegrees: hue,
  }
}

const parseComponent = (component, label) => {
  const normalized = component.endsWith('%') ? component.slice(0, -1) : component
  const value = Number(normalized)

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid OKLCH ${label}: ${component}`)
  }

  return value
}

const clampUnit = (value) => Math.min(1, Math.max(0, value))

const oklchToLinearSrgb = (value) => {
  const { lightness, chroma, hueDegrees } = parseOklch(value)
  const hueRadians = (hueDegrees * Math.PI) / 180
  const okLabA = chroma * Math.cos(hueRadians)
  const okLabB = chroma * Math.sin(hueRadians)
  const long = lightness + 0.3963377774 * okLabA + 0.2158037573 * okLabB
  const medium = lightness - 0.1055613458 * okLabA - 0.0638541728 * okLabB
  const short = lightness - 0.0894841775 * okLabA - 1.291485548 * okLabB
  const longCubed = long ** 3
  const mediumCubed = medium ** 3
  const shortCubed = short ** 3

  return [
    clampUnit(4.0767416621 * longCubed - 3.3077115913 * mediumCubed + 0.2309699292 * shortCubed),
    clampUnit(-1.2684380046 * longCubed + 2.6097574011 * mediumCubed - 0.3413193965 * shortCubed),
    clampUnit(-0.0041960863 * longCubed - 0.7034186147 * mediumCubed + 1.707614701 * shortCubed),
  ]
}

const relativeLuminance = (value) => {
  const [red, green, blue] = oklchToLinearSrgb(value)
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

const wcagContrast = (background, foreground) => {
  const backgroundLuminance = relativeLuminance(background)
  const foregroundLuminance = relativeLuminance(foreground)
  const lighter = Math.max(backgroundLuminance, foregroundLuminance)
  const darker = Math.min(backgroundLuminance, foregroundLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

const validateContrast = (source, errors) => {
  for (const themeName of ['light', 'dark']) {
    for (const [backgroundToken, foregroundToken, threshold] of contrastPairs) {
      const background = getTokenValue(source, ['themes', themeName, 'color', backgroundToken])
      const foreground = getTokenValue(source, ['themes', themeName, 'color', foregroundToken])
      const contrast = wcagContrast(background, foreground)

      if (contrast < threshold) {
        errors.push(
          `${themeName} ${backgroundToken}/${foregroundToken} contrast ${contrast.toFixed(
            2,
          )} is below ${threshold}.`,
        )
      }
    }
  }
}

const main = async () => {
  const errors = []
  const source = await readTokenSource()

  validateTokenListCompleteness(errors)
  validateRequiredTokens(source, errors)
  await validateGeneratedOutput(source, errors)
  await validatePlaceholderRemoval(errors)
  validateContrast(source, errors)
  validateReadinessAliases(source, errors)

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error)
    }

    process.exitCode = 1
    return
  }

  console.info('Design token validation passed.')
}

await main()
