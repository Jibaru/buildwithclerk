import type { Locale, Project } from '@buildwithclerk/registry'
import { useTranslations } from 'next-intl'
import { PlatformIcon } from '@/components/gallery/PlatformIcon'
import { StatusBadge } from '@/components/gallery/StatusBadge'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { cn } from '@/lib/cn'

/**
 * Everything the registry knows about a project, laid out once and reused by the city panel
 * (dark, compact) and the full page (light, wide). MDX content is added only by the page.
 */
export function ProjectDetails({
  project,
  locale,
  tone = 'light',
}: {
  project: Project
  locale: Locale
  tone?: 'light' | 'dark'
}) {
  const t = useTranslations('project')
  const tg = useTranslations('gallery')
  const dark = tone === 'dark'
  const muted = dark ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'
  const strong = dark ? 'text-white' : 'text-gray-950 dark:text-white'
  const card = dark
    ? 'rounded-xl bg-white/5 p-4 ring-[0.5px] ring-white/10 ring-inset'
    : 'rounded-xl bg-white p-4 shadow-card ring-[0.5px] ring-gray-950/10 dark:bg-gray-900 dark:ring-white/10'
  const degit = `npx degit jibaru/buildwithclerk/${project.links.path} ${project.slug}\ncd ${project.slug}\ncp .env.example .env\npnpm install && pnpm dev`

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <StatusBadge status={project.status} />
        {project.platforms.map((p) => (
          <span key={p} className={cn('flex items-center gap-1', muted)}>
            <PlatformIcon platform={p} /> {tg(`platforms.${p}`)}
          </span>
        ))}
      </div>

      <p className={cn('text-base leading-7', dark ? 'text-gray-200' : 'text-gray-700 dark:text-gray-300')}>
        {project.description[locale]}
      </p>

      {project.status === 'planned' ? (
        <p
          className={cn(
            'rounded-lg px-3 py-2 text-sm',
            dark
              ? 'bg-white/5 text-gray-400'
              : 'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400',
          )}
        >
          {project.milestone ? t('plannedNotice', { milestone: project.milestone }) : t('backlogNotice')}
        </p>
      ) : null}

      <section className="flex flex-col gap-3">
        <h3 className={cn('text-sm font-semibold', strong)}>{t('whatItShows')}</h3>
        <ul className="flex flex-col gap-2">
          {project.features.map((f) => (
            <li key={f.id} className={cn(card, 'flex items-center justify-between gap-3')}>
              <span className={cn('text-sm', strong)}>
                {f.name[locale]}
                {f.id === project.heroFeature ? (
                  <span className="tag-1 ml-2 text-purple-500 dark:text-purple-300">{t('heroFeature')}</span>
                ) : null}
              </span>
              <a
                href={f.docs}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-xs text-purple-500 hover:underline dark:text-purple-300"
              >
                {t('readDocs')} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className={cn('text-sm font-semibold', strong)}>{t('stack')}</h3>
        <ul className="flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <li
              key={s}
              className={cn(
                'rounded-md px-2 py-0.5 font-mono text-xs',
                dark
                  ? 'bg-white/10 text-gray-200'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
              )}
            >
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className={cn('text-sm font-semibold', strong)}>{t('runLocally')}</h3>
        <p className={cn('text-sm', muted)}>{t('runLocallyHint')}</p>
        <CodeBlock code={degit} label="terminal" />
      </section>
    </div>
  )
}
