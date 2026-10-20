import { describe, expect, it } from 'vitest'
import { features, getGalleryProjects, getProject, registry } from '../index'

describe('registry', () => {
  it('validates and has the site as project 0', () => {
    expect(getProject('build-with-clerk')?.number).toBe(0)
  })

  it('has one building per project with unique positions', () => {
    const positions = registry.map((p) => `${p.city.position.x},${p.city.position.y}`)
    expect(new Set(positions).size).toBe(registry.length)
  })

  it('puts every hero feature in the features list', () => {
    for (const p of registry) {
      expect(p.features.map((f) => f.id)).toContain(p.heroFeature)
      expect(features).toHaveProperty(p.heroFeature)
    }
  })

  it('leaves the site out of the gallery', () => {
    expect(getGalleryProjects().some((p) => p.number === 0)).toBe(false)
  })
})
