import { useTranslations } from 'next-intl'
import { LinkButton } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export default function NotFound() {
  const t = useTranslations('notFound')
  return (
    <Container className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-6xl font-medium text-gray-300 dark:text-gray-700">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="text-gray-600 dark:text-gray-400">{t('body')}</p>
      <LinkButton href="/" variant="secondary">
        {t('home')}
      </LinkButton>
    </Container>
  )
}
