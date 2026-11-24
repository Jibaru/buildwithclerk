'use client'

import type { Locale, Project } from '@buildwithclerk/registry'
import { easings } from '@buildwithclerk/ui'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { ProjectDetails } from '@/components/project/ProjectDetails'
import { ExternalLinkButton, LinkButton } from '@/components/ui/Button'

export function ProjectPanel({
  project,
  locale,
  onClose,
}: {
  project: Project | null
  locale: Locale
  onClose: () => void
}) {
  const t = useTranslations('hud')
  const tg = useTranslations('gallery')

  useEffect(() => {
    if (!project) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project, onClose])

  const hero = project?.features.find((f) => f.id === project.heroFeature)

  return (
    <AnimatePresence>
      {project ? (
        <>
          <motion.button
            type="button"
            aria-label={t('close')}
            className="absolute inset-0 z-30 bg-gray-950/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            className="absolute inset-x-0 bottom-0 z-40 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-2xl bg-gray-900 text-white ring-[0.5px] ring-white/15 sm:inset-y-4 sm:right-4 sm:left-auto sm:max-h-none sm:w-[26rem] sm:rounded-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: easings.easeOutCubic }}
          >
            <header className="hairline-b flex items-start justify-between gap-4 p-5">
              <div className="flex flex-col gap-1">
                {hero ? <p className="text-xs font-medium text-purple-300">{hero.name[locale]}</p> : null}
                <h2 id="panel-title" className="text-2xl font-semibold tracking-tight">
                  <span className="mr-2 font-mono text-sm font-normal text-gray-500">
                    {String(project.number).padStart(2, '0')}
                  </span>
                  {project.title}
                </h2>
                <p className="text-sm text-gray-400">{project.tagline[locale]}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('close')}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-gray-400 ring-[0.5px] ring-white/10 hover:bg-white/5 hover:text-white"
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
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
            </header>
            <div className="flex flex-wrap gap-2 px-5 pt-4">
              {project.links.demo ? (
                <ExternalLinkButton href={project.links.demo} size="base">
                  {tg('liveDemo')} ↗
                </ExternalLinkButton>
              ) : null}
              {project.links.repoPrivate ? null : (
                <ExternalLinkButton
                  href={project.links.repo}
                  variant="secondary"
                  className="bg-white/10 text-white shadow-none ring-[0.5px] ring-white/15 hover:bg-white/15"
                >
                  {tg('code')} ↗
                </ExternalLinkButton>
              )}
              <LinkButton
                href={`/p/${project.slug}`}
                variant="ghost"
                className="text-gray-300 hover:bg-white/5 hover:text-white"
              >
                {t('fullPage')} →
              </LinkButton>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <ProjectDetails project={project} locale={locale} tone="dark" />
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
