/**
 * Typed copies of the tokens in tokens.css for use in JS (Phaser tints, motion configs, OG images).
 * CSS is the source of truth for the browser; this file is for places CSS variables cannot reach.
 */

export const colors = {
  purple: {
    50: '#f4f2ff',
    100: '#eae8ff',
    200: '#d7d4ff',
    300: '#bab1ff',
    400: '#9785ff',
    500: '#6c47ff',
    600: '#6430f7',
    700: '#561ee3',
    800: '#4818bf',
    950: '#230b6a',
  },
  gray: {
    25: '#fafafb',
    50: '#f7f7f8',
    100: '#eeeef0',
    150: '#e3e3e7',
    200: '#d9d9de',
    300: '#b7b8c2',
    400: '#9394a1',
    500: '#747686',
    600: '#5e5f6e',
    700: '#42434d',
    750: '#373840',
    800: '#2f3037',
    850: '#27272d',
    900: '#212126',
    950: '#131316',
  },
  sky: { 500: '#00aee3' },
  green: { 500: '#22c543' },
  red: { 500: '#ef4444' },
  orange: { 500: '#f36b16' },
  white: '#ffffff',
  black: '#000000',
} as const

/** The six-colour palette the city is lit with. See GDD.md → Art direction. */
export const city = {
  sky: colors.gray[950],
  tint: colors.purple[950],
  light: colors.purple[500],
  sign: colors.sky[500],
  text: colors.gray[200],
  collected: colors.green[500],
} as const

/** Cubic-bezier easings as motion/react expects them. Mirrors clerk/clerk src/lib/easings.ts. */
export const easings = {
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeOutQuint: [0.22, 1, 0.36, 1],
  swiftOut: [0.175, 0.885, 0.32, 1.1],
} as const satisfies Record<string, readonly [number, number, number, number]>

export const durations = {
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
} as const

/** Bounce-free spring, Clerk's default for layout motion. */
export const spring = { type: 'spring', bounce: 0, duration: 0.4 } as const

/** Phaser wants numeric tints. */
export function hexToNumber(hex: string): number {
  return Number.parseInt(hex.replace('#', ''), 16)
}
