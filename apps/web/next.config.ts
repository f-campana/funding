import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  transpilePackages: [
    '@repo/core',
    '@repo/domain',
    '@repo/kit',
    '@repo/ui',
    '@repo/tailwind-config',
  ],
}

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withNextIntl(nextConfig)
