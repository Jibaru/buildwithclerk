'use client'

import type { District, Locale, Project } from '@buildwithclerk/registry'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'

const ORDER: District[] = ['plaza', 'arcade', 'terminal', 'downtown', 'market', 'broadcast']

/** The whole catalog as a list: the accessible, crawlable twin of the map. */
export function CityIndex({
  projects,
  locale,
  open,
  onPick,
  onClose,
}: {
  projects: Project[]
  locale: Locale
  open: boolean
  onPick: (slug: string) => void
  onClose: () => void
}) {
  const t = useTranslations('hud')
  const tg = useTranslations('gallery')
  return (
    <nav
      aria-label={t('index')}
      className={cn(
        'absolute inset-y-0 left-0 z-40 flex w-[20rem] max-w-[90vw] flex-col bg-gray-900/95 text-white ring-[0.5px] ring-white/15 backdrop-blur-md transition duration-300 ease-out-cubic',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
      aria-hidden={!open}
    >
      <div className="hairline-b flex items-center justify-between p-4">
        <h2 className="text-sm font-semibold">{t('index')}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-xs text-gray-400 hover:text-white"
          tabIndex={open ? 0 : -1}
        >
          {t('close')}
        </button>
      </div>
      <ol className="flex-1 overflow-y-auto p-2">
        {ORDER.map((district) => {
          const items = projects.filter((p) => p.city.district === district)
          if (!items.length) return null
          return (
            <li key={district} className="mb-3">
              <p className="tag-1 px-2 py-1 text-purple-300">{tg(`districts.${district}`)}</p>
              <ul>
                {items.map((p) => (
                  <li key={p.slug}>
                    <button
                      type="button"
                      onClick={() => onPick(p.slug)}
                      tabIndex={open ? 0 : -1}
                      className="flex w-full items-baseline gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/5"
                    >
                      <span className="font-mono text-xs text-gray-500">
                        {String(p.number).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-medium">{p.title}</span>
                      <span
                        className={cn(
                          'ml-auto size-1.5 shrink-0 rounded-full',
                          p.status === 'planned' ? 'bg-gray-600' : 'bg-green-500',
                        )}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
      <p className="hairline-t p-4 text-xs text-gray-500">
        {t('indexHint', { locale: locale.toUpperCase() })}
      </p>
    </nav>
  )
}
