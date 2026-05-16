import { type AxeCore, configureAxe } from 'vitest-axe'

type AxeRunner = (
  html: Element | string,
  additionalOptions?: AxeCore.RunOptions,
) => Promise<AxeCore.AxeResults>

export const axe: AxeRunner = configureAxe({
  rules: {
    'color-contrast': {
      enabled: false,
    },
  },
})
