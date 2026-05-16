import '@repo/tailwind-config/shared-styles.css'

import type { Preview } from '@storybook/nextjs-vite'

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === 'dark' ? 'dark' : 'light'
      const locale = typeof context.globals.locale === 'string' ? context.globals.locale : 'fr-FR'

      document.documentElement.classList.toggle('dark', theme === 'dark')
      document.documentElement.dataset.theme = theme
      document.documentElement.lang = locale

      return Story()
    },
  ],
  globalTypes: {
    locale: {
      defaultValue: 'fr-FR',
      description: 'Preview locale',
      name: 'Locale',
      toolbar: {
        icon: 'globe',
        items: [
          { title: 'Français', value: 'fr-FR' },
          { title: 'English', value: 'en-US' },
        ],
      },
    },
    theme: {
      defaultValue: 'light',
      description: 'Preview theme',
      name: 'Theme',
      toolbar: {
        icon: 'mirror',
        items: [
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
      },
    },
  },
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['UI'],
      },
    },
  },
}

export default preview
