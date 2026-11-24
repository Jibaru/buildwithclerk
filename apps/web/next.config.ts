import path from 'node:path'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const config: NextConfig = {
  reactStrictMode: true,
  // The Docker image runs the traced standalone server from the monorepo root.
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  transpilePackages: ['@buildwithclerk/registry', '@buildwithclerk/ui'],
  // project.mdx files live next to the example code, outside this app.
  outputFileTracingIncludes: {
    '/p/[slug]': ['../../examples/*/project.mdx'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default withNextIntl(config)
