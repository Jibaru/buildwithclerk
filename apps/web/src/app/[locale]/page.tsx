import type { Locale } from '@buildwithclerk/registry'
import { setRequestLocale } from 'next-intl/server'
import { ProjectGrid } from '@/components/gallery/ProjectGrid'
import { CityBand } from '@/components/site/CityBand'
import { Hero } from '@/components/site/Hero'

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <>
      <Hero />
      <ProjectGrid locale={locale as Locale} />
      <CityBand />
    </>
  )
}
