import { fileURLToPath } from 'node:url'
import { defineNodePackageConfig } from '@repo/test-config'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  defineNodePackageConfig(),
  defineConfig({
    resolve: {
      alias: {
        'server-only': fileURLToPath(new URL('./tests/server-only.ts', import.meta.url)),
      },
    },
    test: {
      include: ['app/**/*.test.ts', 'server/**/*.test.ts'],
    },
  }),
)
