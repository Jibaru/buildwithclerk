import { useTranslations } from 'next-intl'
import { LinkButton } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CitySkyline } from './CitySkyline'
import { BrandGlow } from './Glow'

/** The dark band clerk.com uses for its bento, here as the invitation into the city. */
export function CityBand() {
  const t = useTranslations('cityBand')
  return (
    <section className="relative isolate overflow-hidden bg-gray-950 py-24 text-white sm:py-32">
      <CitySkyline className="absolute inset-x-0 bottom-0 -z-20 h-full w-full opacity-60" />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-gray-950 via-gray-950/70 to-gray-950/20" />
      <BrandGlow className="top-1/2 left-1/2 h-64 w-[40rem] -translate-x-1/2 -translate-y-1/2" />
      <Container className="flex flex-col items-center gap-5 text-center">
        <p className="text-sm font-medium text-purple-400">{t('eyebrow')}</p>
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {t('title')}
        </h2>
        <p className="max-w-xl text-balance text-gray-400">{t('body')}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <LinkButton href="/city" variant="primary" size="lg">
            {t('cta')}
          </LinkButton>
          <LinkButton
            href="/sign-in"
            variant="secondary"
            size="lg"
            className="bg-white/10 text-white shadow-none ring-[0.5px] ring-white/15 hover:bg-white/15"
          >
            {t('secondary')}
          </LinkButton>
        </div>
      </Container>
    </section>
  )
}
