import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { darkTheme, lightTheme, type SemanticColorToken, tokens } from './index'

const shadcnColorTokens = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
] as const

const statusColorTokens = [
  'status-success',
  'status-success-foreground',
  'status-success-muted',
  'status-success-border',
  'status-attention',
  'status-attention-foreground',
  'status-attention-muted',
  'status-attention-border',
  'status-danger',
  'status-danger-foreground',
  'status-danger-muted',
  'status-danger-border',
  'status-info',
  'status-info-foreground',
  'status-info-muted',
  'status-info-border',
  'status-pending',
  'status-pending-foreground',
  'status-pending-muted',
  'status-pending-border',
] as const

const commandColorTokens = [
  'command',
  'command-foreground',
  'command-muted',
  'command-border',
  'command-accent',
  'command-accent-foreground',
  'command-progress',
  'command-progress-muted',
  'command-segment-investable',
  'command-segment-entry-fees',
  'command-segment-spv-fees',
  'command-segment-neutral',
] as const

const readinessColorTokens = [
  'readiness-ready',
  'readiness-ready-foreground',
  'readiness-ready-muted',
  'readiness-ready-border',
  'readiness-attention',
  'readiness-attention-foreground',
  'readiness-attention-muted',
  'readiness-attention-border',
  'readiness-blocked',
  'readiness-blocked-foreground',
  'readiness-blocked-muted',
  'readiness-blocked-border',
  'readiness-not-started',
  'readiness-not-started-foreground',
  'readiness-not-started-muted',
  'readiness-not-started-border',
] as const

const readinessAliasPairs = [
  ['readiness-ready', 'status-success'],
  ['readiness-attention', 'status-attention'],
  ['readiness-blocked', 'status-danger'],
  ['readiness-not-started', 'status-pending'],
] as const

const generatedCss = readFileSync(new URL('../css/tokens.css', import.meta.url), 'utf8')

describe('@repo/design-tokens generated exports', () => {
  it('exposes light and dark themes', () => {
    expect(tokens.themes.light).toBe(lightTheme)
    expect(tokens.themes.dark).toBe(darkTheme)
  })

  it('exposes all canonical shadcn color tokens in the light theme', () => {
    for (const tokenName of shadcnColorTokens) {
      expect(Object.hasOwn(lightTheme.color, tokenName)).toBe(true)
    }
  })

  it('exposes all canonical shadcn color tokens in the dark theme', () => {
    for (const tokenName of shadcnColorTokens) {
      expect(Object.hasOwn(darkTheme.color, tokenName)).toBe(true)
    }
  })

  it('exposes all status color tokens in both themes', () => {
    for (const tokenName of statusColorTokens) {
      expect(Object.hasOwn(lightTheme.color, tokenName)).toBe(true)
      expect(Object.hasOwn(darkTheme.color, tokenName)).toBe(true)
    }
  })

  it('exposes all command surface color tokens in both themes', () => {
    for (const tokenName of commandColorTokens) {
      expect(Object.hasOwn(lightTheme.color, tokenName)).toBe(true)
      expect(Object.hasOwn(darkTheme.color, tokenName)).toBe(true)
    }
  })

  it('exposes all readiness color tokens in both themes', () => {
    for (const tokenName of readinessColorTokens) {
      expect(Object.hasOwn(lightTheme.color, tokenName)).toBe(true)
      expect(Object.hasOwn(darkTheme.color, tokenName)).toBe(true)
    }
  })

  it('generates CSS selectors for light and dark theme activation', () => {
    expect(generatedCss).toContain(':root')
    expect(generatedCss).toContain('[data-theme="light"]')
    expect(generatedCss).toContain('.dark')
    expect(generatedCss).toContain('[data-theme="dark"]')
  })

  it('generates representative shadcn variables', () => {
    for (const variableName of [
      '--background',
      '--foreground',
      '--primary',
      '--primary-foreground',
      '--chart-1',
      '--sidebar',
      '--radius',
    ]) {
      expect(generatedCss).toContain(variableName)
    }
  })

  it('generates representative status and readiness variables', () => {
    for (const variableName of [
      '--status-success',
      '--status-attention',
      '--status-danger',
      '--status-info',
      '--status-pending',
      '--command',
      '--command-foreground',
      '--command-muted',
      '--command-border',
      '--command-accent',
      '--command-accent-foreground',
      '--command-progress',
      '--command-progress-muted',
      '--command-segment-investable',
      '--command-segment-entry-fees',
      '--command-segment-spv-fees',
      '--command-segment-neutral',
      '--readiness-ready',
      '--readiness-attention',
      '--readiness-blocked',
      '--readiness-not-started',
    ]) {
      expect(generatedCss).toContain(variableName)
    }
  })

  it('keeps readiness aliases matched to status values in both themes', () => {
    for (const [readinessBase, statusBase] of readinessAliasPairs) {
      for (const suffix of ['', '-foreground', '-muted', '-border'] as const) {
        const readinessToken = `${readinessBase}${suffix}`
        const statusToken = `${statusBase}${suffix}`
        const readinessColorToken = readinessToken as SemanticColorToken
        const statusColorToken = statusToken as SemanticColorToken

        expect(lightTheme.color[readinessColorToken]).toEqual(lightTheme.color[statusColorToken])
        expect(darkTheme.color[readinessColorToken]).toEqual(darkTheme.color[statusColorToken])
      }
    }
  })

  it('preserves bootstrap compatibility aliases', () => {
    for (const aliasName of ['--color-bg', '--color-text', '--color-surface', '--radius-control']) {
      expect(generatedCss).toContain(aliasName)
    }
  })
})
