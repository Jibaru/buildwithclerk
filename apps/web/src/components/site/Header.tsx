import { Show, UserButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { LinkButton } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Link } from '@/i18n/navigation'
import { REPO_URL } from '@/lib/constants'
import { LocaleSwitcher } from './LocaleSwitcher'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const navLink =
  'rounded-md px-2.5 py-1 text-sm font-medium text-gray-700 transition hover:text-gray-950 dark:text-gray-300 dark:hover:text-white'

/** clerk.com's floating pill header: white, hairline ring, multi-layer shadow, inside the container. */
export function Header() {
  const t = useTranslations('nav')
  return (
    <header className="sticky top-0 z-40 pt-3">
      <Container>
        <div className="flex h-12 min-w-0 items-center justify-between gap-3 rounded-xl bg-white/90 px-3 shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_12px_-2px_rgba(34,42,53,0.08),0_0_0_0.5px_rgba(19,19,22,0.12)] backdrop-blur-md sm:px-4 dark:bg-gray-900/90 dark:shadow-[0_1px_1px_rgba(0,0,0,0.3),0_0_0_0.5px_rgba(255,255,255,0.12)]">
          <Link
            href="/"
            className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-purple-500"
          >
            <Logo className="whitespace-nowrap" />
          </Link>
          <nav className="flex min-w-0 items-center gap-0.5 sm:gap-1">
            <Link href="/#projects" className={`${navLink} hidden sm:inline`}>
              {t('projects')}
            </Link>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className={`${navLink} hidden sm:inline`}>
              {t('github')}
            </a>
            <LocaleSwitcher />
            <ThemeToggle />
            <Show
              when="signed-in"
              fallback={
                <Link href="/sign-in" className={`${navLink} ml-1`}>
                  {t('signIn')}
                </Link>
              }
            >
              <div className="ml-1 flex size-[1.875rem] items-center justify-center">
                <UserButton />
              </div>
            </Show>
            <LinkButton href="/city" variant="primary" className="ml-1 max-sm:hidden">
              {t('city')}
            </LinkButton>
          </nav>
        </div>
      </Container>
    </header>
  )
}
