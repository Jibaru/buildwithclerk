import { z } from 'zod'

export const LOCALES = ['en', 'es'] as const
export type Locale = (typeof LOCALES)[number]

/** A string that exists in every supported locale. */
export const localized = z.object({ en: z.string().min(1), es: z.string().min(1) })
export type Localized = z.infer<typeof localized>

export const DISTRICTS = ['plaza', 'arcade', 'downtown', 'market', 'broadcast', 'terminal'] as const
export const districtSchema = z.enum(DISTRICTS)
export type District = z.infer<typeof districtSchema>

export const PLATFORMS = [
  'web',
  'mobile',
  'desktop',
  'tv',
  'cli',
  'backend',
  'extension',
  'bot',
  'agent',
] as const
export const platformSchema = z.enum(PLATFORMS)
export type Platform = z.infer<typeof platformSchema>

export const STATUSES = ['live', 'building', 'planned'] as const
export const statusSchema = z.enum(STATUSES)
export type Status = z.infer<typeof statusSchema>

/** One Clerk feature the project demonstrates, with a link to its doc. */
export const featureSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: localized,
  docs: z.url(),
})
export type Feature = z.infer<typeof featureSchema>

export const citySchema = z.object({
  district: districtSchema,
  /** Tile coordinates of the building's top-left corner on the 64×40 map. */
  position: z.object({ x: z.number().int().min(0).max(63), y: z.number().int().min(0).max(39) }),
  /** Sprite key from the GDD asset table, e.g. `building-lastrun`. */
  sprite: z.string().regex(/^building-[a-z0-9-]+$/),
})

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** Catalog number from docs/CATALOG.md. 0 is the site itself. */
  number: z.number().int().min(0),
  title: z.string().min(1),
  tagline: localized,
  description: localized,
  status: statusSchema,
  /** Which v1 slot it fills, or null if backlog. */
  milestone: z.string().nullable(),
  platforms: z.array(platformSchema).min(1),
  stack: z.array(z.string().min(1)).min(1),
  /** The one feature in the headline. Must also appear in `features`. */
  heroFeature: z.string(),
  features: z.array(featureSchema).min(1),
  links: z.object({
    demo: z.url().nullable(),
    repo: z.url(),
    /** True when the repository is private: the code button is hidden and no clone command is shown. */
    repoPrivate: z.boolean().optional(),
    /**
     * Path inside the monorepo, e.g. `examples/last-run`. `apps/web` for the site.
     * `null` for products that live in their own repository.
     */
    path: z.string().nullable(),
  }),
  city: citySchema,
})

export type Project = z.infer<typeof projectSchema>

export const registrySchema = z.array(projectSchema).superRefine((projects, ctx) => {
  const slugs = new Set<string>()
  const numbers = new Set<number>()
  const positions = new Set<string>()
  projects.forEach((p, i) => {
    if (slugs.has(p.slug))
      ctx.addIssue({ code: 'custom', path: [i, 'slug'], message: `duplicate slug ${p.slug}` })
    slugs.add(p.slug)
    if (numbers.has(p.number))
      ctx.addIssue({ code: 'custom', path: [i, 'number'], message: `duplicate number ${p.number}` })
    numbers.add(p.number)
    const pos = `${p.city.position.x},${p.city.position.y}`
    if (positions.has(pos))
      ctx.addIssue({ code: 'custom', path: [i, 'city', 'position'], message: `two buildings at ${pos}` })
    positions.add(pos)
    if (!p.features.some((f) => f.id === p.heroFeature))
      ctx.addIssue({
        code: 'custom',
        path: [i, 'heroFeature'],
        message: `heroFeature "${p.heroFeature}" is not in features`,
      })
  })
})
