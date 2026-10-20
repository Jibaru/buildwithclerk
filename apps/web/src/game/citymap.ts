import type { District, Project } from '@buildwithclerk/registry'
import { findPath, type Point } from './pathfinding'
import { T, type WallSet } from './tiles'

export const MAP_W = 64
export const MAP_H = 40

/** Plaza: pavement with Clerk HQ and a fountain. Spawn in front of HQ. */
export const PLAZA = { x: 24, y: 13, w: 16, h: 12 }
export const FOUNTAIN = { x: 35, y: 17 }
export const SPAWN: Point = { x: 31, y: 22 }

/** Roads are 2 tiles wide. [x, y, w, h] in tiles. */
export const ROADS: Array<[number, number, number, number]> = [
  [31, 0, 2, 13], // north
  [31, 25, 2, 15], // south
  [40, 20, 24, 2], // east
  [0, 20, 24, 2], // west
  [33, 9, 31, 2], // north-east connector (Terminal)
  [14, 34, 37, 2], // south cross street (Market)
]

export const DISTRICT_WALLS: Record<District, WallSet> = {
  plaza: 'orangeDark',
  arcade: 'red',
  downtown: 'redDark',
  market: 'orange',
  broadcast: 'orangeDark',
  terminal: 'red',
}

export const BUILDING_W = 3
export const BUILDING_H = 3

export type Building = {
  slug: string
  title: string
  district: District
  status: Project['status']
  x: number
  y: number
  w: number
  h: number
  /** Tile in front of the door. Standing here lets you enter. */
  door: Point
  wall: WallSet
}

export type Lamp = Point
export type Tree = Point & { tile: number }

export type CityMap = {
  width: number
  height: number
  ground: number[][]
  props: number[][]
  /** true = cannot walk here. */
  blocked: boolean[][]
  buildings: Building[]
  lamps: Lamp[]
  trees: Tree[]
}

function grid<Tv>(fill: Tv): Tv[][] {
  return Array.from({ length: MAP_H }, () => Array.from({ length: MAP_W }, () => fill))
}

function inRect(p: Point, r: { x: number; y: number; w: number; h: number }) {
  return p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h
}

/** Deterministic PRNG so the city is identical on every visit. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Builds the whole city from the registry. Pure: no Phaser, so it runs in tests and could
 * run on the server to draw a static preview.
 */
export function buildCityMap(projects: Project[]): CityMap {
  const ground = grid<number>(T.grass)
  const props = grid<number>(T.empty)
  const blocked = grid<boolean>(false)
  const isRoad = grid<boolean>(false)
  const isPaved = grid<boolean>(false)

  // Roads, then one tile of pavement around every road.
  for (const [x, y, w, h] of ROADS) {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) {
        const row = ground[j]
        const roadRow = isRoad[j]
        if (!row || !roadRow) continue
        row[i] = T.road
        roadRow[i] = true
      }
    }
  }
  for (let j = 0; j < MAP_H; j++) {
    for (let i = 0; i < MAP_W; i++) {
      if (isRoad[j]?.[i]) continue
      const nearRoad = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => isRoad[j + (dy as number)]?.[i + (dx as number)])
      if (nearRoad) {
        ;(ground[j] as number[])[i] = T.pavement
        ;(isPaved[j] as boolean[])[i] = true
      }
    }
  }

  // Plaza.
  for (let j = PLAZA.y; j < PLAZA.y + PLAZA.h; j++) {
    for (let i = PLAZA.x; i < PLAZA.x + PLAZA.w; i++) {
      ;(ground[j] as number[])[i] = T.pavement
      ;(isPaved[j] as boolean[])[i] = true
    }
  }
  const water = [
    [T.water.tl, T.water.t, T.water.tr],
    [T.water.l, T.water.c, T.water.r],
    [T.water.bl, T.water.b, T.water.br],
  ]
  water.forEach((row, dy) => {
    row.forEach((tile, dx) => {
      ;(ground[FOUNTAIN.y + dy] as number[])[FOUNTAIN.x + dx] = tile
      ;(blocked[FOUNTAIN.y + dy] as boolean[])[FOUNTAIN.x + dx] = true
    })
  })

  // Buildings.
  const buildings: Building[] = projects.map((p) => ({
    slug: p.slug,
    title: p.title,
    district: p.city.district,
    status: p.status,
    x: p.city.position.x,
    y: p.city.position.y,
    w: BUILDING_W,
    h: BUILDING_H,
    door: { x: p.city.position.x + 1, y: p.city.position.y + BUILDING_H },
    wall: DISTRICT_WALLS[p.city.district],
  }))
  for (const b of buildings) {
    for (let j = b.y; j < b.y + b.h; j++) {
      for (let i = b.x; i < b.x + b.w; i++) {
        ;(blocked[j] as boolean[])[i] = true
      }
    }
  }

  // Pave a path from each door to the nearest road or plaza, around anything solid.
  for (const b of buildings) {
    const path = findPath(blocked, b.door, (p) => isPaved[p.y]?.[p.x] === true || isRoad[p.y]?.[p.x] === true)
    const tiles = [b.door, ...(path ?? [])]
    for (const p of tiles) {
      if (isRoad[p.y]?.[p.x]) continue
      ;(ground[p.y] as number[])[p.x] = T.pavement
      ;(isPaved[p.y] as boolean[])[p.x] = true
    }
  }

  // Lamps on pavement beside roads, every 6 tiles, never on a door tile.
  const lamps: Lamp[] = []
  const doorTiles = new Set(buildings.map((b) => `${b.door.x},${b.door.y}`))
  for (const [x, y, w, h] of ROADS) {
    const horizontal = w > h
    if (horizontal) {
      for (let i = x + 2; i < x + w - 1; i += 6) {
        const p = { x: i, y: y - 1 }
        if (
          isPaved[p.y]?.[p.x] &&
          !blocked[p.y]?.[p.x] &&
          !doorTiles.has(`${p.x},${p.y}`) &&
          !inRect(p, PLAZA)
        )
          lamps.push(p)
      }
    } else {
      for (let j = y + 2; j < y + h - 1; j += 6) {
        const p = { x: x - 1, y: j }
        if (
          isPaved[p.y]?.[p.x] &&
          !blocked[p.y]?.[p.x] &&
          !doorTiles.has(`${p.x},${p.y}`) &&
          !inRect(p, PLAZA)
        )
          lamps.push(p)
      }
    }
  }
  for (const l of lamps) {
    ;(blocked[l.y] as boolean[])[l.x] = true
    ;(props[l.y] as number[])[l.x] = T.lampPole
    if (l.y > 0 && (props[l.y - 1] as number[])[l.x] === T.empty)
      (props[l.y - 1] as number[])[l.x] = T.lampHead
  }

  // Trees and bushes on open grass, away from paved tiles and buildings.
  const rand = mulberry32(2026)
  const trees: Tree[] = []
  const clear = (i: number, j: number) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = i + dx
        const y = j + dy
        if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false
        if (isPaved[y]?.[x] || isRoad[y]?.[x] || blocked[y]?.[x] || (props[y] as number[])[x] !== T.empty)
          return false
      }
    }
    return true
  }
  for (let j = 1; j < MAP_H - 1; j++) {
    for (let i = 1; i < MAP_W - 1; i++) {
      if (!clear(i, j)) continue
      const roll = rand()
      if (roll < 0.11) {
        const palette = j < MAP_H / 2 ? T.treeTeal : T.treeOrange
        const tile = palette[Math.floor(rand() * palette.length)] as number
        trees.push({ x: i, y: j, tile })
        ;(props[j] as number[])[i] = tile
        ;(blocked[j] as boolean[])[i] = true
      } else if (roll < 0.15) {
        const tile = T.bush[Math.floor(rand() * T.bush.length)] as number
        ;(props[j] as number[])[i] = tile
      }
    }
  }

  // Map edge is solid so the player never leaves the world.
  for (let j = 0; j < MAP_H; j++) {
    ;(blocked[j] as boolean[])[0] = true
    ;(blocked[j] as boolean[])[MAP_W - 1] = true
  }
  for (let i = 0; i < MAP_W; i++) {
    ;(blocked[0] as boolean[])[i] = true
    ;(blocked[MAP_H - 1] as boolean[])[i] = true
  }

  return { width: MAP_W, height: MAP_H, ground, props, blocked, buildings, lamps, trees }
}

export function buildingAt(map: CityMap, p: Point): Building | undefined {
  return map.buildings.find((b) => inRect(p, b))
}
