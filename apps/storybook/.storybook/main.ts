import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  stories: [
    '../../../packages/ui/src/**/*.stories.@(ts|tsx)',
    '../../../packages/kit/src/**/*.stories.@(ts|tsx)',
  ],
}

export default config
