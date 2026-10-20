import { projects } from './projects'
import { DISTRICTS, type District, type Locale, type Project, registrySchema } from './schema'

export * from './features'
export * from './schema'

/** Validated at import time so a bad entry fails the build, not the page. */
export const registry: Project[] = registrySchema.parse(projects)

export function getProject(slug: string): Project | undefined {
  return registry.find((p) => p.slug === slug)
}

export function getProjectsByDistrict(district: District): Project[] {
  return registry.filter((p) => p.city.district === district)
}

export const districts = DISTRICTS

/** Projects shown in the gallery: everything except the site itself, live first. */
export function getGalleryProjects(): Project[] {
  const order: Record<Project['status'], number> = { live: 0, building: 1, planned: 2 }
  return registry
    .filter((p) => p.number !== 0)
    .sort((a, b) => order[a.status] - order[b.status] || a.number - b.number)
}

export function t(value: { en: string; es: string }, locale: Locale): string {
  return value[locale]
}
