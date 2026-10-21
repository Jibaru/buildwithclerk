/**
 * Copies only the Kenney kit models the places use (plus each kit's shared colormap) from a
 * local download of the kits into public/models/kits. Run after editing places.ts:
 *
 *   KITS_DIR=/path/to/kits/assets/models pnpm tsx scripts/copy-kits.ts
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { allModels } from '../src/game/drive/places'

const src = process.env.KITS_DIR
if (!src) throw new Error('KITS_DIR is required')
const dest = path.join(process.cwd(), 'public', 'models', 'kits')
const missing: string[] = []
const kits = new Set<string>()
let copied = 0

for (const ref of allModels()) {
  const [kit, model] = ref.split('/') as [string, string]
  const kitDir = path.join(src, `kenney-${kit}`, 'Models')
  const format = ['GLB format', 'GLTF format'].find((f) => existsSync(path.join(kitDir, f)))
  if (!format) {
    missing.push(ref)
    continue
  }
  const from = path.join(kitDir, format, `${model}.glb`)
  if (!existsSync(from)) {
    missing.push(ref)
    continue
  }
  const toDir = path.join(dest, kit)
  mkdirSync(toDir, { recursive: true })
  copyFileSync(from, path.join(toDir, `${model}.glb`))
  copied++
  const textures = path.join(kitDir, format, 'Textures')
  if (existsSync(textures) && !kits.has(kit)) {
    mkdirSync(path.join(toDir, 'Textures'), { recursive: true })
    for (const f of readdirSync(textures))
      copyFileSync(path.join(textures, f), path.join(toDir, 'Textures', f))
  }
  kits.add(kit)
}

console.warn(`copied ${copied} models from ${kits.size} kits`)
if (missing.length) {
  console.warn(`MISSING (${missing.length}):\n  ${missing.join('\n  ')}`)
  process.exitCode = 1
}
