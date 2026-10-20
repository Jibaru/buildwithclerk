import { getProject, type Locale, registry } from '@buildwithclerk/registry'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { PlatformIcon } from '@/components/gallery/PlatformIcon'
import { StatusBadge } from '@/components/gallery/StatusBadge'
import { ExternalLinkButton, LinkButton } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CodeBlock } from '@/components/ui/CodeBlock'
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
  const degit = `npx degit jibaru/buildwithclerk/${project.links.path} ${project.slug}\ncd ${project.slug}\ncp .env.example .env\npnpm install && pnpm dev`

  return (
    <article>
      <section className="hairline-b bg-white py-14 dark:bg-gray-900/40">
        <Container className="flex flex-col gap-6">
          <LinkButton href="/#projects" variant="ghost" size="sm" className="-ml-2 self-start">
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
          {project.status === 'planned' ? (
            <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600 ring-[0.5px] ring-gray-950/10 dark:bg-gray-900 dark:text-gray-400 dark:ring-white/10">
              {project.milestone ? t('plannedNotice', { milestone: project.milestone }) : t('backlogNotice')}
            </p>
          ) : null}
        </Container>
      </section>

      <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-12">
          <section className="flex flex-col gap-4">
            <p className="text-lg text-gray-700 dark:text-gray-300">{project.description[locale]}</p>
          </section>

          {content ? (
            <section className="prose prose-gray max-w-none dark:prose-invert">
              <MDXRemote source={content.body} />
            </section>
          ) : null}

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
              {t('whatItShows')}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {project.features.map((f) => (
                <li key={f.id}>
                  <Card className="flex h-full flex-col gap-2 p-4">
                    <span className="font-medium text-gray-950 dark:text-white">
                      {f.name[locale]}
                      {f.id === project.heroFeature ? (
                        <Tag className="ml-2 text-purple-600 dark:text-purple-300">{t('heroFeature')}</Tag>
                      ) : null}
                    </span>
                    <a
                      href={f.docs}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-purple-600 hover:underline dark:text-purple-300"
                    >
                      {t('readDocs')} ↗
                    </a>
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
              {t('runLocally')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{t('runLocallyHint')}</p>
            <CodeBlock code={degit} label="terminal" />
            <p className="text-sm text-gray-500">{t('envHint')}</p>
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1">
              <Tag>{t('stack')}</Tag>
              <ul className="flex flex-wrap gap-2 pt-1">
                {project.stack.map((s) => (
                  <li
                    key={s}
                    className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-1">
              <Tag>{t('inTheCity')}</Tag>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('districtOf', { district: tg(`districts.${project.city.district}`) })}
              </p>
              <p className="font-mono text-xs text-gray-500">
                x{project.city.position.x} · y{project.city.position.y}
              </p>
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
