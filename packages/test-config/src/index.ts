import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

type PackageConfigOptions = {
  setupFiles?: string[]
}

const coverage = {
  provider: 'v8' as const,
  reporter: ['text', 'lcov'] as ['text', 'lcov'],
  reportsDirectory: 'coverage',
}

const sharedSetupPath = new URL('./setup.ts', import.meta.url).pathname

export const defineNodePackageConfig = (options: PackageConfigOptions = {}) =>
  defineConfig({
    test: {
      coverage,
      environment: 'node',
      globals: false,
      setupFiles: options.setupFiles ?? [],
    },
  })

export const defineReactPackageConfig = (options: PackageConfigOptions = {}) =>
  defineConfig({
    plugins: [react()],
    test: {
      coverage,
      environment: 'jsdom',
      globals: false,
      setupFiles: [sharedSetupPath, ...(options.setupFiles ?? [])],
    },
  })
