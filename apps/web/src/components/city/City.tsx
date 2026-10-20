'use client'

import type { Locale, Project } from '@buildwithclerk/registry'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameHandle } from '@/game/createGame'
import { CityHud } from './CityHud'
import { CityIndex } from './CityIndex'
import { ProjectPanel } from './ProjectPanel'

const AVATARS = [23, 104, 185, 266, 347, 428]

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
  const game = useRef<GameHandle | null>(null)
  const [ready, setReady] = useState(false)
  const [near, setNear] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(initialSlug)
  const [indexOpen, setIndexOpen] = useState(false)

  // The game is created once; projects and the deep link are read at mount only.
  const mountArgs = useRef({ projects, initialSlug })

  useEffect(() => {
    let handle: GameHandle | null = null
    let cancelled = false
    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)] as number
    const { projects: initialProjects, initialSlug: startAt } = mountArgs.current
    import('@/game/createGame').then(({ createGame }) => {
      if (cancelled || !host.current) return
      handle = createGame(host.current, initialProjects, {
        avatar,
        startAt,
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
    game.current?.goTo(slug)
  }, [])

  const project = open ? (projects.find((p) => p.slug === open) ?? null) : null
  const nearTitle = near ? (projects.find((p) => p.slug === near)?.title ?? null) : null

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-gray-950">
      <div ref={host} className="absolute inset-0 [&>canvas]:block" />
      <CityHud
        total={projects.length}
        ready={ready}
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
