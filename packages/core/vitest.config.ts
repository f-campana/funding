import { defineNodePackageConfig } from '@repo/test-config'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  defineNodePackageConfig(),
  defineConfig({
    test: {
      coverage: {
        exclude: [
          'src/**/*.test.ts',
          'src/**/*.test-types.ts',
          'src/index.ts',
          'src/adapters/index.ts',
        ],
        include: ['src/**/*.ts'],
        thresholds: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
      include: ['src/**/*.test.ts'],
    },
  }),
)
