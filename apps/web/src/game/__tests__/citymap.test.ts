import { registry } from '@buildwithclerk/registry'
import { describe, expect, it } from 'vitest'
import { buildCityMap, MAP_H, MAP_W, PLAZA, ROADS, SPAWN } from '../citymap'
import { findPath } from '../pathfinding'

const map = buildCityMap(registry)

describe('city map', () => {
  it('places every project as a building inside the map', () => {
    expect(map.buildings).toHaveLength(registry.length)
    for (const b of map.buildings) {
      expect(b.x).toBeGreaterThan(0)
      expect(b.y).toBeGreaterThan(0)
      expect(b.x + b.w).toBeLessThan(MAP_W)
      expect(b.y + b.h).toBeLessThan(MAP_H)
    }
  })

  it('keeps buildings off roads and apart from each other', () => {
    const cells = new Map<string, string>()
    for (const b of map.buildings) {
      for (let j = b.y; j < b.y + b.h; j++) {
        for (let i = b.x; i < b.x + b.w; i++) {
          const key = `${i},${j}`
          expect(cells.get(key), `${b.slug} overlaps ${cells.get(key)} at ${key}`).toBeUndefined()
          cells.set(key, b.slug)
          const onRoad = ROADS.some(([x, y, w, h]) => i >= x && i < x + w && j >= y && j < y + h)
          expect(onRoad, `${b.slug} sits on a road at ${key}`).toBe(false)
          const inPlaza =
            b.slug !== 'build-with-clerk' &&
            i >= PLAZA.x &&
            i < PLAZA.x + PLAZA.w &&
            j >= PLAZA.y &&
            j < PLAZA.y + PLAZA.h
          expect(inPlaza, `${b.slug} sits in the plaza at ${key}`).toBe(false)
        }
      }
    }
  })

  it('lets the player walk from the spawn to every door', () => {
    expect(map.blocked[SPAWN.y]?.[SPAWN.x]).toBe(false)
    for (const b of map.buildings) {
      expect(map.blocked[b.door.y]?.[b.door.x], `${b.slug} door is blocked`).toBe(false)
      const path = findPath(map.blocked, SPAWN, b.door, 20000)
      expect(path, `${b.slug} unreachable`).not.toBeNull()
    }
  })

  it('is deterministic', () => {
    const again = buildCityMap(registry)
    expect(again.props).toEqual(map.props)
    expect(again.lamps).toEqual(map.lamps)
  })
})
