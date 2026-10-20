import { registry } from './index'

// Import alone validates. Print a short table so `pnpm registry:check` has visible output.
for (const p of registry) {
  const marker = p.milestone ? '★' : ' '
  console.warn(
    `${marker} ${String(p.number).padStart(2)}  ${p.slug.padEnd(18)} ${p.status.padEnd(9)} ${p.city.district}`,
  )
}
console.warn(`\n${registry.length} projects valid.`)
