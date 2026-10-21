'use client'

import { Show, UserButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from '@/components/site/LocaleSwitcher'
import { KeyMark, Logo } from '@/components/site/Logo'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { REPO_URL } from '@/lib/constants'

const pill =
  'pointer-events-auto flex h-9 items-center gap-2 rounded-lg bg-gray-950/80 px-3 text-sm text-white ring-[0.5px] ring-white/15 backdrop-blur-md'

export function CityHud({
  total,
  ready,
  progress,
  nearTitle,
  indexOpen,
  onToggleIndex,
}: {
  total: number
  ready: boolean
  progress: number
  nearTitle: string | null
  indexOpen: boolean
  onToggleIndex: () => void
}) {
  const t = useTranslations('hud')
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className={pill}>
          <Logo className="text-white" />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleIndex}
            aria-pressed={indexOpen}
            className={cn(pill, 'hover:bg-gray-900/90')}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M2 3.5h10M2 7h10M2 10.5h10" />
            </svg>
            <span className="hidden sm:inline">{t('index')}</span>
          </button>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(pill, 'hidden hover:bg-gray-900/90 md:flex')}
          >
            GitHub
          </a>
          <div className={pill}>
            <LocaleSwitcher className="text-gray-300 hover:bg-white/10 hover:text-white" />
            <Show
              when="signed-in"
              fallback={
                <Link href="/sign-in" className="font-medium text-purple-300 hover:text-white">
                  {t('signIn')}
                </Link>
              }
            >
              <UserButton />
            </Show>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className={cn(pill, 'h-auto flex-col items-start gap-0.5 py-2')}>
          <span className="flex items-center gap-2 font-mono text-xs">
            <KeyMark className="text-purple-400" />
            <span>0 / {total}</span>
          </span>
          <span className="text-xs text-gray-400">
            {ready
              ? nearTitle
                ? t('near', { title: nearTitle })
                : t('hint')
              : t('loading', { percent: Math.round(progress * 100) })}
          </span>
        </div>
        <div className={cn(pill, 'hidden sm:flex')}>
          <span className="text-xs text-gray-400">{t('controls')}</span>
        </div>
      </div>
    </div>
  )
}
