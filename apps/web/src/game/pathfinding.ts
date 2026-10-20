export type Point = { x: number; y: number }

/**
 * Breadth-first search over a boolean grid (true = blocked). 4-connected, so paths hug
 * sidewalks the way a pedestrian would. Returns the tiles from start (exclusive) to goal
 * (inclusive), or null when unreachable. `goal` may be a predicate for "any road tile".
 */
export function findPath(
  blocked: boolean[][],
  start: Point,
  goal: Point | ((p: Point) => boolean),
  maxSteps = 5000,
): Point[] | null {
  const height = blocked.length
  const width = blocked[0]?.length ?? 0
  const isGoal = typeof goal === 'function' ? goal : (p: Point) => p.x === goal.x && p.y === goal.y
  const key = (p: Point) => p.y * width + p.x
  const cameFrom = new Map<number, number>()
  const queue: Point[] = [start]
  cameFrom.set(key(start), -1)
  let steps = 0
  while (queue.length && steps++ < maxSteps) {
    const current = queue.shift() as Point
    if (isGoal(current) && !(current.x === start.x && current.y === start.y)) {
      const path: Point[] = []
      let k = key(current)
      while (k !== key(start)) {
        path.push({ x: k % width, y: Math.floor(k / width) })
        k = cameFrom.get(k) as number
      }
      return path.reverse()
    }
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const next = { x: current.x + dx, y: current.y + dy }
      if (next.x < 0 || next.y < 0 || next.x >= width || next.y >= height) continue
      if (blocked[next.y]?.[next.x]) continue
      const nk = key(next)
      if (cameFrom.has(nk)) continue
      cameFrom.set(nk, key(current))
      queue.push(next)
    }
  }
  return null
}

/** Nearest non-blocked tile to `target` (including itself), searching in rings. */
export function nearestOpen(blocked: boolean[][], target: Point, radius = 4): Point | null {
  for (let r = 0; r <= radius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue
        const p = { x: target.x + dx, y: target.y + dy }
        if (blocked[p.y]?.[p.x] === false) return p
      }
    }
  }
  return null
}
