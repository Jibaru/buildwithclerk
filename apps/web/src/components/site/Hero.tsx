import { useTranslations } from 'next-intl'
import { LinkButton } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { BrowserFrame } from './BrowserFrame'
import { CitySkyline } from './CitySkyline'
import { Glow } from './Glow'

export function Hero() {
  const t = useTranslations('hero')
  return (
    <section className="relative isolate overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="dot-grid absolute inset-0 -z-20 [mask-image:radial-gradient(80%_60%_at_50%_0%,black,transparent)]" />
      <Container className="flex flex-col gap-12 lg:gap-16">
        <div className="flex flex-col gap-5 lg:max-w-3xl">
          <p className="text-sm font-medium text-purple-500">{t('eyebrow')}</p>
          <h1 className="text-4xl font-bold tracking-tight text-balance text-gray-950 sm:text-5xl lg:text-6xl dark:text-white">
            {t('headline')}
          </h1>
          <p className="max-w-2xl text-lg text-balance text-gray-600 dark:text-gray-400">
            {t('subheadline')}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <LinkButton href="/city" variant="primary" size="lg">
              {t('enterCity')}
            </LinkButton>
            <LinkButton href="/#projects" variant="secondary" size="lg">
              {t('browse')}
            </LinkButton>
          </div>
        </div>

        <div className="relative isolate">
          <Glow className="-inset-x-32 -inset-y-24 blur-3xl" />
          <BrowserFrame url="buildwithclerk.com/city">
            <div className="relative aspect-[16/7] bg-gray-950">
              <CitySkyline className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-linear-to-t from-gray-950 to-transparent p-4 sm:p-6">
                <p className="max-w-md font-mono text-2xs text-gray-400 sm:text-xs">{t('cityHint')}</p>
                <span className="tag-1 hidden rounded-md bg-white/10 px-2 py-1 text-purple-300 ring-[0.5px] ring-white/15 sm:inline">
                  M3
                </span>
              </div>
            </div>
          </BrowserFrame>
        </div>
      </Container>
    </section>
  )
}
