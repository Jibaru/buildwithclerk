/**
 * Tile indices into kenney:rpg-urban-pack `tilemap_packed.png` (27 columns × 18 rows, 16 px, no spacing).
 * Index = row * 27 + column. Verified by eye against an annotated render of the sheet.
 */
export const TILE = 16
export const SHEET_COLUMNS = 27
export const SHEET_URL = '/assets/sprites/kenney-rpg-urban-pack/Tilemap/tilemap_packed.png'

export const T = {
  empty: -1,
  grass: 28,
  grassEdge: { tl: 0, t: 1, tr: 2, l: 27, r: 29, bl: 54, b: 55, br: 56 },
  pavement: 36,
  road: 433,
  roadDashV: 432,
  roadDashH: 461,
  water: { tl: 170, t: 171, tr: 172, l: 197, c: 198, r: 199, bl: 224, b: 225, br: 226 },
  lampHead: 162,
  lampPole: 189,
  bush: [232, 233, 237, 238],
  treeTeal: [259, 260, 286, 287],
  treeOrange: [313, 314, 340, 341],
  hedge: [328, 329, 330],
  windowBeige: 336,
  windowGray: 417,
  doorOrange: 283,
  doorGray: 256,
  shopWindow: [359, 360, 361],
  shopAwning: [386, 387, 388],
} as const

/** 3×3 wall sets: [top row, middle row, bottom row]. */
export const WALLS = {
  red: [
    [17, 18, 19],
    [44, 45, 46],
    [98, 99, 100],
  ],
  redDark: [
    [20, 21, 22],
    [47, 48, 49],
    [101, 102, 103],
  ],
  orange: [
    [125, 126, 127],
    [152, 153, 154],
    [206, 207, 208],
  ],
  orangeDark: [
    [128, 129, 130],
    [155, 156, 157],
    [209, 210, 211],
  ],
} as const
export type WallSet = keyof typeof WALLS

/**
 * Characters live in columns 23–26. Each one is a 3-row block:
 * row 0 = standing, rows 1–2 = walk frames; columns = left, down, up, right.
 */
export const CHARACTER_BASES = [23, 104, 185, 266, 347, 428] as const
export const DIRECTIONS = ['left', 'down', 'up', 'right'] as const
export type Direction = (typeof DIRECTIONS)[number]

export function characterFrames(base: number, direction: Direction): { idle: number; walk: number[] } {
  const col = DIRECTIONS.indexOf(direction)
  const idle = base + col
  return { idle, walk: [base + SHEET_COLUMNS + col, idle, base + SHEET_COLUMNS * 2 + col, idle] }
}
