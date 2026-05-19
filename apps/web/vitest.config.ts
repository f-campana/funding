import { fileURLToPath } from 'node:url'
import { defineNodePackageConfig } from '@repo/test-config'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  defineNodePackageConfig(),
  defineConfig({
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
        'server-only': fileURLToPath(new URL('./tests/server-only.ts', import.meta.url)),
      },
    },
    test: {
      include: [
        'app/**/*.test.{ts,tsx}',
        'observability/**/*.test.{ts,tsx}',
        'scripts/**/*.test.{js,mjs,ts}',
        'server/**/*.test.{ts,tsx}',
      ],
    },
  }),
)
