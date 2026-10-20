import type { Locale, Project } from '@buildwithclerk/registry'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { Link } from '@/i18n/navigation'
import { PlatformIcon } from './PlatformIcon'
import { StatusBadge } from './StatusBadge'

export function ProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const t = useTranslations('gallery')
  const hero = project.features.find((f) => f.id === project.heroFeature)
  return (
    <Card className="group relative flex flex-col overflow-hidden transition duration-300 ease-out-cubic hover:-translate-y-0.5">
      <Link
        href={`/p/${project.slug}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
      >
        <span className="sr-only">{project.title}</span>
      </Link>
      <div className="dot-grid relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-850">
        <div className="absolute inset-0 bg-linear-to-t from-white/60 to-transparent dark:from-gray-900/80" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          {project.platforms.map((p) => (
            <span
              key={p}
              title={t(`platforms.${p}`)}
              className="rounded-md bg-white/80 p-1 dark:bg-gray-950/60"
            >
              <PlatformIcon platform={p} />
            </span>
          ))}
        </div>
        <StatusBadge
          status={project.status}
          className="absolute top-3 right-3 bg-white/80 dark:bg-gray-950/60"
        />
        <span
          className="absolute bottom-3 left-3 font-mono text-5xl font-medium tracking-tight text-gray-950/10 transition duration-300 group-hover:text-purple-500/30 dark:text-white/10"
          aria-hidden
        >
          {String(project.number).padStart(2, '0')}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {hero ? <Tag className="text-purple-600 dark:text-purple-300">{hero.name[locale]}</Tag> : null}
        <h3 className="text-lg font-semibold tracking-tight text-gray-950 dark:text-white">
          {project.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{project.tagline[locale]}</p>
        <div className="mt-auto flex items-center gap-4 pt-2 text-sm font-medium">
          {project.links.demo ? (
            <span className="text-purple-600 dark:text-purple-300">{t('liveDemo')} →</span>
          ) : (
            <span className="text-gray-500">{t('comingSoon')}</span>
          )}
          <span className="text-gray-600 dark:text-gray-400">{t('code')}</span>
        </div>
      </div>
    </Card>
  )
}
