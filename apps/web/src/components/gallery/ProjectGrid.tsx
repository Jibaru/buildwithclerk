import { getGalleryProjects, type Locale } from '@buildwithclerk/registry'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { ProjectCard } from './ProjectCard'

export function ProjectGrid({ locale }: { locale: Locale }) {
  const t = useTranslations('gallery')
  const projects = getGalleryProjects()
  return (
    <section id="projects" className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <div className="mb-10 flex flex-col gap-2">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
            {t('title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{t('subtitle', { count: projects.length })}</p>
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
