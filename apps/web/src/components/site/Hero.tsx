import { useTranslations } from 'next-intl'
import { LinkButton } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Tag } from '@/components/ui/Tag'
import { CitySkyline } from './CitySkyline'

export function Hero() {
  const t = useTranslations('hero')
  return (
    <section className="relative isolate overflow-hidden bg-gray-950 text-white">
      <CitySkyline className="absolute inset-x-0 bottom-0 -z-10 h-full w-full" />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-gray-950/90 via-gray-950/40 to-transparent" />
      <Container className="flex min-h-[32rem] flex-col items-center justify-center gap-6 py-24 text-center sm:min-h-[36rem]">
        <Tag className="animate-fade-in text-purple-300 motion-reduce:animate-none">{t('eyebrow')}</Tag>
        <h1 className="animate-letter-reveal motion-reduce:animate-none text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {t('headline')}
        </h1>
        <p className="max-w-2xl text-balance text-gray-300 sm:text-lg">{t('subheadline')}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <LinkButton
            href="/#projects"
            variant="neutral"
            size="lg"
            className="bg-white text-gray-950 ring-white"
          >
            {t('browse')}
          </LinkButton>
          <LinkButton href="/city" variant="primary" size="lg">
            {t('enterCity')}
          </LinkButton>
        </div>
        <p className="font-mono text-xs text-gray-400">{t('cityHint')}</p>
      </Container>
    </section>
  )
}
