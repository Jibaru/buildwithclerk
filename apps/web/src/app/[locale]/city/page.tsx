import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CitySkyline } from '@/components/site/CitySkyline'
import { LinkButton } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('city')
  return { title: t('title') }
}

// M3 replaces this with the Phaser canvas. The route exists now so every link already resolves.
export default async function CityPage({ params }: PageProps<'/[locale]/city'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('city')
  return (
    <section className="relative isolate overflow-hidden bg-gray-950 text-white">
      <CitySkyline className="absolute inset-x-0 bottom-0 -z-10 h-full w-full opacity-70" />
      <Container className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 py-24 text-center">
        <h1 className="font-mono text-3xl font-medium tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="max-w-md text-balance text-gray-300">{t('comingSoon')}</p>
        <LinkButton href="/#projects" variant="secondary">
          {t('back')}
        </LinkButton>
      </Container>
    </section>
  )
}
