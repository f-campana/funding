import { defineNodePackageConfig } from '@repo/test-config'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  defineNodePackageConfig(),
  defineConfig({
    test: {
      include: ['server/**/*.test.ts'],
    },
  }),
)
