import { Show, UserButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { LinkButton } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Link } from '@/i18n/navigation'
import { REPO_URL } from '@/lib/constants'
import { LocaleSwitcher } from './LocaleSwitcher'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const t = useTranslations('nav')
  return (
    <header className="sticky top-0 z-40 bg-gray-50/80 backdrop-blur-md hairline-b dark:bg-gray-950/80">
      <Container className="flex h-14 min-w-0 items-center justify-between gap-3">
        <Link
          href="/"
          className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-purple-500"
        >
          <Logo className="whitespace-nowrap" />
        </Link>
        <nav className="flex min-w-0 items-center gap-0.5 text-sm sm:gap-1">
          <Link
            href="/#projects"
            className="hidden rounded-md px-3 py-1 text-gray-700 hover:text-gray-950 sm:inline dark:text-gray-300 dark:hover:text-white"
          >
            {t('projects')}
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-md px-3 py-1 text-gray-700 hover:text-gray-950 sm:inline dark:text-gray-300 dark:hover:text-white"
          >
            {t('github')}
          </a>
          <LocaleSwitcher />
          <ThemeToggle />
          <Show
            when="signed-in"
            fallback={
              <LinkButton href="/sign-in" variant="secondary" className="ml-1">
                {t('signIn')}
              </LinkButton>
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
      </Container>
    </header>
  )
}
