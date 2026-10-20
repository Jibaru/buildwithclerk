import type { Locale, Project } from '@buildwithclerk/registry'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { PlatformIcon } from './PlatformIcon'
import { StatusBadge } from './StatusBadge'

export function ProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const t = useTranslations('gallery')
  const hero = project.features.find((f) => f.id === project.heroFeature)
  return (
    <article className="group relative isolate flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-[0.5px] ring-gray-950/10 transition duration-300 ease-out-cubic hover:-translate-y-0.5 hover:ring-purple-500/60 hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-purple-500)_12%,transparent),var(--bwc-shadow-card)] dark:bg-gray-900 dark:ring-white/10">
      <Link
        href={`/p/${project.slug}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
      >
        <span className="sr-only">{project.title}</span>
      </Link>

      <div className="relative aspect-[16/9] overflow-hidden bg-gray-50 dark:bg-gray-950">
        <div className="dot-grid absolute inset-0" />
        <div
          aria-hidden
          className="absolute -inset-x-8 -bottom-16 h-40 bg-[radial-gradient(50%_100%_at_50%_100%,color-mix(in_srgb,var(--color-purple-500)_35%,transparent),transparent)] opacity-70 transition duration-500 group-hover:opacity-100"
        />
        <Building seed={project.number} className="absolute inset-x-0 bottom-0 mx-auto h-[72%]" />
        <div className="absolute top-3 left-3 flex items-center gap-1 text-gray-600 dark:text-gray-400">
          {project.platforms.map((p) => (
            <span
              key={p}
              title={t(`platforms.${p}`)}
              className="rounded-md bg-white p-1 ring-[0.5px] ring-gray-950/10 dark:bg-gray-900 dark:ring-white/10"
            >
              <PlatformIcon platform={p} />
            </span>
          ))}
        </div>
        <StatusBadge status={project.status} className="absolute top-3 right-3 bg-white dark:bg-gray-900" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {hero ? <p className="text-xs font-medium text-purple-500">{hero.name[locale]}</p> : null}
        <h3 className="text-lg font-semibold tracking-tight text-gray-950 dark:text-white">
          <span className="mr-2 font-mono text-sm font-normal text-gray-400">
            {String(project.number).padStart(2, '0')}
          </span>
          {project.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{project.tagline[locale]}</p>
        <div className="mt-auto flex items-center gap-4 pt-3 text-sm font-medium">
          {project.links.demo ? (
            <span className="text-purple-500">{t('liveDemo')} →</span>
          ) : (
            <span className="text-gray-400">{t('comingSoon')}</span>
          )}
          <span className="text-gray-600 transition group-hover:text-gray-950 dark:text-gray-400 dark:group-hover:text-white">
            {t('code')}
          </span>
        </div>
      </div>
    </article>
  )
}

/** A tiny pixel building per project, deterministic from its number, lit in purple. */
function Building({ seed, className }: { seed: number; className?: string }) {
  const floors = 3 + (seed % 4)
  const cols = 2 + (seed % 2)
  const w = cols * 10 + 6
  const h = floors * 10 + 6
  const windows: React.ReactNode[] = []
  for (let r = 0; r < floors; r++) {
    for (let c = 0; c < cols; c++) {
      const on = (r * 3 + c + seed) % 4 !== 0
      windows.push(
        <rect
          key={`${r}-${c}`}
          x={4 + c * 10}
          y={4 + r * 10}
          width="6"
          height="6"
          className={on ? 'fill-purple-500' : 'fill-gray-300 dark:fill-gray-700'}
        />,
      )
    }
  }
  return (
    <svg viewBox={`0 0 ${w} ${h + 2}`} className={className} shapeRendering="crispEdges" aria-hidden>
      <rect x="0" y="2" width={w} height={h} className="fill-gray-900 dark:fill-gray-800" />
      <rect x="0" y="0" width={w} height="2" className="fill-sky-500" />
      {windows}
    </svg>
  )
}
