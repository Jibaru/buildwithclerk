import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { CLERK_DOCS_URL, REPO_URL } from '@/lib/constants'
import { Logo } from './Logo'

export function Footer() {
  const t = useTranslations('footer')
  return (
    <footer className="hairline-t mt-24 py-10 text-sm text-gray-600 dark:text-gray-400">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p>{t('built')}</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <a
              className="hover:text-gray-950 dark:hover:text-white"
              href={CLERK_DOCS_URL}
              target="_blank"
              rel="noreferrer"
            >
              {t('docs')}
            </a>
          </li>
          <li>
            <a
              className="hover:text-gray-950 dark:hover:text-white"
              href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
              target="_blank"
              rel="noreferrer"
            >
              {t('contribute')}
            </a>
          </li>
          <li>
            <a
              className="hover:text-gray-950 dark:hover:text-white"
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </li>
        </ul>
      </Container>
    </footer>
  )
}
