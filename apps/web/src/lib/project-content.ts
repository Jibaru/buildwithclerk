import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'

const frontmatterSchema = z.object({
  /** Short video or GIF shown in the hero of the project page. */
  video: z.string().optional(),
  poster: z.string().optional(),
  /** Architecture diagram, an SVG under the example's public/ folder. */
  diagram: z.string().optional(),
})

export type ProjectContent = {
  frontmatter: z.infer<typeof frontmatterSchema>
  /** MDX body for the locale, or English when the locale file is missing. */
  body: string
}

/**
 * Reads `examples/<slug>/project.mdx` (and `project.es.mdx`) from the monorepo. Returns null
 * for projects that have no code yet; the page then renders from the registry alone.
 */
export async function getProjectContent(slug: string, locale: string): Promise<ProjectContent | null> {
  const dir = path.join(process.cwd(), '..', '..', 'examples', slug)
  const candidates = locale === 'en' ? ['project.mdx'] : [`project.${locale}.mdx`, 'project.mdx']
  for (const file of candidates) {
    try {
      const raw = await readFile(path.join(dir, file), 'utf8')
      const { data, content } = matter(raw)
      return { frontmatter: frontmatterSchema.parse(data), body: content }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue
      throw error
    }
  }
  return null
}
