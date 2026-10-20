import type { Project } from '@buildwithclerk/registry'
import Phaser from 'phaser'
import { type CityEvents, CityScene } from './CityScene'
import { buildCityMap } from './citymap'

export type GameHandle = {
  setFrozen: (frozen: boolean) => void
  goTo: (slug: string) => void
  destroy: () => void
}

export function createGame(
  parent: HTMLElement,
  projects: Project[],
  options: CityEvents & { avatar: number; startAt?: string | null },
): GameHandle {
  const map = buildCityMap(projects)
  const scene = new CityScene({ map, ...options })
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    pixelArt: true,
    backgroundColor: '#131316',
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [scene],
    input: { keyboard: true, touch: true },
    audio: { noAudio: true },
    banner: false,
  })
  return {
    setFrozen: (frozen) => scene.setFrozen(frozen),
    goTo: (slug) => scene.goTo(slug),
    destroy: () => game.destroy(true),
  }
}
