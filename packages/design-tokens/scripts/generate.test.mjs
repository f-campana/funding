import { describe, expect, it } from 'vitest'

import { baseTokenSpecs, semanticColorTokens, validateTokenSourceShape } from './generate.mjs'

const token = (value = 'oklch(0.5 0.1 120)') => ({ $type: 'color', $value: value })

const buildValidSource = () => {
  const color = Object.fromEntries(semanticColorTokens.map((tokenName) => [tokenName, token()]))
  const source = {
    $schemaVersion: 'funding.design-tokens.v1',
    meta: {
      description: 'Test token source.',
      name: 'Test Tokens',
    },
    themes: {
      light: { color },
      dark: { color },
    },
  }

  for (const { path, type } of baseTokenSpecs) {
    let current = source

    for (const segment of path.slice(0, -1)) {
      current[segment] ??= {}
      current = current[segment]
    }

    current[path.at(-1)] = { $type: type, $value: '1rem' }
  }

  return source
}

describe('token source shape validation', () => {
  it('accepts the canonical token source shape', () => {
    expect(validateTokenSourceShape(buildValidSource())).toEqual([])
  })

  it('rejects missing theme color records before generation', () => {
    const source = buildValidSource()
    source.themes.dark.color = undefined

    expect(validateTokenSourceShape(source)).toContain(
      'Token source themes.dark.color must be an object.',
    )
  })

  it('rejects token entries without string values', () => {
    const source = buildValidSource()
    source.themes.light.color.background = { $value: 42 }

    expect(validateTokenSourceShape(source)).toContain(
      'Token source themes.light.color.background must contain a string $value.',
    )
  })

  it('rejects missing source metadata and schema version drift', () => {
    const source = buildValidSource()
    source.$schemaVersion = 'funding.design-tokens.v2'
    source.meta.name = ' '

    expect(validateTokenSourceShape(source)).toEqual(
      expect.arrayContaining([
        'Token source $schemaVersion must be funding.design-tokens.v1.',
        'Token source meta.name must be a non-empty string.',
      ]),
    )
  })

  it('rejects color tokens with missing type or invalid OKLCH values', () => {
    const source = buildValidSource()
    source.themes.light.color.background = { $type: 'dimension', $value: 'red' }

    expect(validateTokenSourceShape(source)).toEqual(
      expect.arrayContaining([
        'Token source themes.light.color.background $type must be color.',
        'Token source themes.light.color.background $value must be an oklch() color value.',
      ]),
    )
  })

  it('rejects base tokens with the wrong type', () => {
    const source = buildValidSource()
    source.radius.base = { $type: 'color', $value: '0.5rem' }

    expect(validateTokenSourceShape(source)).toContain(
      'Token source radius.base $type must be dimension.',
    )
  })
})
