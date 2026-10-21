'use client'

import type { Locale, Project } from '@buildwithclerk/registry'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { DriveHandle } from '@/game/drive/createDrive'
import { CityHud } from './CityHud'
import { CityIndex } from './CityIndex'
import { ProjectPanel } from './ProjectPanel'

export function City({
  projects,
  locale,
  initialSlug,
}: {
  projects: Project[]
  locale: Locale
  initialSlug: string | null
}) {
  const host = useRef<HTMLDivElement>(null)
  const game = useRef<DriveHandle | null>(null)
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const [near, setNear] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(initialSlug)
  const [indexOpen, setIndexOpen] = useState(false)

  // The game is created once; projects and the deep link are read at mount only.
  const mountArgs = useRef({ projects, initialSlug })

  useEffect(() => {
    let handle: DriveHandle | null = null
    let cancelled = false
    const { projects: initialProjects, initialSlug: startAt } = mountArgs.current
    import('@/game/drive/createDrive').then(({ createDrive }) => {
      if (cancelled || !host.current) return
      handle = createDrive(host.current, initialProjects, {
        startAt,
        onProgress: setProgress,
        onReady: () => setReady(true),
        onNear: setNear,
        onEnter: (slug) => setOpen(slug),
      })
      game.current = handle
    })
    return () => {
      cancelled = true
      handle?.destroy()
      game.current = null
    }
  }, [])

  useEffect(() => {
    game.current?.setFrozen(open !== null || indexOpen)
    const url = new URL(window.location.href)
    if (open) url.searchParams.set('at', open)
    else url.searchParams.delete('at')
    window.history.replaceState(null, '', url)
  }, [open, indexOpen])

  const close = useCallback(() => setOpen(null), [])
  const pick = useCallback((slug: string) => {
    setIndexOpen(false)
    game.current?.driveTo(slug)
  }, [])

  const project = open ? (projects.find((p) => p.slug === open) ?? null) : null
  const nearTitle = near ? (projects.find((p) => p.slug === near)?.title ?? null) : null

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#7cff00]">
      <div ref={host} className="absolute inset-0 [&>canvas]:size-full" />
      <CityHud
        total={projects.length}
        ready={ready}
        progress={progress}
        nearTitle={nearTitle}
        indexOpen={indexOpen}
        onToggleIndex={() => setIndexOpen((v) => !v)}
      />
      <CityIndex
        projects={projects}
        locale={locale}
        open={indexOpen}
        onPick={pick}
        onClose={() => setIndexOpen(false)}
      />
      <ProjectPanel project={project} locale={locale} onClose={close} />
    </div>
  )
}
