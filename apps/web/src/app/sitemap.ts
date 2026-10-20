import { registry } from '@buildwithclerk/registry'
import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const prefix = (locale: string) => (locale === routing.defaultLocale ? '' : `/${locale}`)
  const entries: MetadataRoute.Sitemap = []
  for (const locale of routing.locales) {
    entries.push({ url: `${SITE_URL}${prefix(locale)}`, changeFrequency: 'weekly', priority: 1 })
    entries.push({ url: `${SITE_URL}${prefix(locale)}/city`, changeFrequency: 'monthly', priority: 0.6 })
    for (const p of registry) {
      entries.push({
        url: `${SITE_URL}${prefix(locale)}/p/${p.slug}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }
  return entries
}
