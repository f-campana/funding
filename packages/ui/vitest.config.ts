import { defineReactPackageConfig } from '@repo/test-config'

const setupPath = new URL('./src/test/setup.ts', import.meta.url).pathname

export default defineReactPackageConfig({
  setupFiles: [setupPath],
})
