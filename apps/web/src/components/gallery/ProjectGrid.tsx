import { getGalleryProjects, type Locale } from '@buildwithclerk/registry'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { ProjectCard } from './ProjectCard'

export function ProjectGrid({ locale }: { locale: Locale }) {
  const t = useTranslations('gallery')
  const projects = getGalleryProjects()
  return (
    <section id="projects" className="scroll-mt-24 bg-white py-20 hairline-t sm:py-28 dark:bg-gray-950">
      <Container>
        <div className="mb-12 flex flex-col gap-3">
          <p className="text-sm font-medium text-purple-500">{t('title')}</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-gray-950 sm:text-4xl dark:text-white">
            {t('subtitle', { count: projects.length })}
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} locale={locale} />
          ))}
        </div>
      </Container>
    </section>
  )
}
