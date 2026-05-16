import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => ({
  locale: 'fr-FR',
  messages: (await import('../messages/fr-FR.json')).default,
}))
