import { type Locale, registry } from '@buildwithclerk/registry'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { City } from '@/components/city/City'
import { Link } from '@/i18n/navigation'

/**
 * The landing is the city: one viewport, no scroll. The project list below the canvas is
 * visually hidden and exists for crawlers, screen readers and the no-JS case.
 */
export default async function HomePage({ params, searchParams }: PageProps<'/[locale]'>) {
  const { locale } = await params
  const { at } = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations('site')
  const initial = typeof at === 'string' && registry.some((p) => p.slug === at) ? at : null

  return (
    <>
      <h1 className="sr-only">
        {t('name')}: {t('tagline')}
      </h1>
      <City projects={registry} locale={locale as Locale} initialSlug={initial} />
      <nav className="sr-only" aria-label="Projects">
        <ul>
          {registry.map((p) => (
            <li key={p.slug}>
              <Link href={`/p/${p.slug}`}>
                {p.title}: {p.tagline[locale as Locale]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
