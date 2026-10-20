import { getProject, type Locale, registry } from '@buildwithclerk/registry'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { PlatformIcon } from '@/components/gallery/PlatformIcon'
import { StatusBadge } from '@/components/gallery/StatusBadge'
import { ProjectDetails } from '@/components/project/ProjectDetails'
import { ExternalLinkButton, LinkButton } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Tag } from '@/components/ui/Tag'
import { routing } from '@/i18n/routing'
import { REPO_URL } from '@/lib/constants'
import { getProjectContent } from '@/lib/project-content'

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => registry.map((p) => ({ locale, slug: p.slug })))
}

export async function generateMetadata({ params }: PageProps<'/[locale]/p/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return { title: project.title, description: project.tagline[locale as Locale] }
}

export default async function ProjectPage({ params }: PageProps<'/[locale]/p/[slug]'>) {
  const { locale: rawLocale, slug } = await params
  const locale = rawLocale as Locale
  setRequestLocale(locale)
  const project = getProject(slug)
  if (!project) notFound()

  const t = await getTranslations('project')
  const tg = await getTranslations('gallery')
  const content = await getProjectContent(slug, locale)
  const hero = project.features.find((f) => f.id === project.heroFeature)

  return (
    <article>
      <section className="hairline-b bg-white py-14 dark:bg-gray-900/40">
        <Container className="flex flex-col gap-6">
          <LinkButton href="/" variant="ghost" size="sm" className="-ml-2 self-start">
            ← {t('backToProjects')}
          </LinkButton>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-gray-500">{String(project.number).padStart(2, '0')}</span>
            <StatusBadge status={project.status} />
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              {project.platforms.map((p) => (
                <span key={p} className="flex items-center gap-1 text-xs">
                  <PlatformIcon platform={p} /> {tg(`platforms.${p}`)}
                </span>
              ))}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {hero ? <p className="text-sm font-medium text-purple-500">{hero.name[locale]}</p> : null}
            <h1 className="text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl dark:text-white">
              {project.title}
            </h1>
            <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">{project.tagline[locale]}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {project.links.demo ? (
              <ExternalLinkButton href={project.links.demo} size="lg">
                {tg('liveDemo')} ↗
              </ExternalLinkButton>
            ) : null}
            <ExternalLinkButton href={project.links.repo} variant="secondary" size="lg">
              {tg('code')} ↗
            </ExternalLinkButton>
          </div>
        </Container>
      </section>

      <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-12">
          {content ? (
            <section className="prose prose-gray max-w-none dark:prose-invert">
              <MDXRemote source={content.body} />
            </section>
          ) : null}
          <ProjectDetails project={project} locale={locale} />
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1">
              <Tag>{t('inTheCity')}</Tag>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('districtOf', { district: tg(`districts.${project.city.district}`) })}
              </p>
              <LinkButton
                href={`/?at=${project.slug}`}
                variant="secondary"
                size="sm"
                className="mt-2 self-start"
              >
                {t('openInCity')} →
              </LinkButton>
            </div>
            <a
              href={`${REPO_URL}/tree/main/${project.links.path}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-gray-500 hover:text-gray-950 dark:hover:text-white"
            >
              {project.links.path}
            </a>
          </Card>
        </aside>
      </Container>
    </article>
  )
}
