import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { loadKitModel } from './kits'
import { ROAD_W, type Track } from './track'
import type { Stop } from './trackWorld'

/**
 * Dense, deterministic vegetation for the landscape around the loop. Every model becomes one
 * InstancedMesh per sub-mesh, so thousands of trees cost a few dozen draw calls.
 */

const N = 'nature-kit'
const kit = (m: string) => `${N}/${m}`

const TREES = [
  'tree_default',
  'tree_oak',
  'tree_detailed',
  'tree_fat',
  'tree_tall',
  'tree_thin',
  'tree_simple',
  'tree_cone',
  'tree_plateau',
  'tree_small',
  'tree_blocks',
  'tree_default_fall',
  'tree_oak_fall',
  'tree_detailed_fall',
].map(kit)

const PINES = [
  'tree_pineTallA_detailed',
  'tree_pineTallB_detailed',
  'tree_pineTallC_detailed',
  'tree_pineRoundA',
  'tree_pineRoundC',
  'tree_pineDefaultA',
  'tree_pineDefaultB',
  'tree_pineGroundA',
  'tree_pineSmallA',
].map(kit)

const GRASS = [
  'grass',
  'grass_large',
  'grass_leafs',
  'grass_leafsLarge',
  'plant_flatShort',
  'plant_flatTall',
].map(kit)
const FLOWERS = [
  'flower_redA',
  'flower_redB',
  'flower_yellowA',
  'flower_yellowB',
  'flower_purpleA',
  'flower_purpleB',
  'flower_purpleC',
  'flower_yellowC',
].map(kit)
const BUSHES = [
  'plant_bush',
  'plant_bushLarge',
  'plant_bushDetailed',
  'plant_bushSmall',
  'plant_bushTriangle',
  'plant_bushLargeTriangle',
].map(kit)
const ROCKS = [
  'rock_largeA',
  'rock_largeB',
  'rock_largeC',
  'rock_largeD',
  'rock_tallA',
  'rock_tallB',
  'rock_tallC',
  'rock_tallD',
  'rock_tallE',
].map(kit)
const PEBBLES = [
  'rock_smallA',
  'rock_smallB',
  'rock_smallC',
  'rock_smallD',
  'rock_smallE',
  'stone_smallA',
  'stone_smallB',
  'stone_smallTopA',
].map(kit)
const STONES = [
  'stone_largeA',
  'stone_largeB',
  'stone_largeC',
  'stone_tallA',
  'stone_tallB',
  'stone_tallD',
].map(kit)
const DEBRIS = [
  'stump_old',
  'stump_round',
  'stump_roundDetailed',
  'stump_square',
  'log',
  'log_large',
  'log_stack',
  'mushroom_red',
  'mushroom_redGroup',
  'mushroom_tan',
  'mushroom_tanGroup',
].map(kit)

export const VEGETATION_MODELS: string[] = [
  ...TREES,
  ...PINES,
  ...GRASS,
  ...FLOWERS,
  ...BUSHES,
  ...ROCKS,
  ...PEBBLES,
  ...STONES,
  ...DEBRIS,
]

/** Sampling area around the track, in metres. */
const EXTENT = 650
const PLACE_CLEAR = 46
const DRIVEWAY_CLEAR = 6
const ROAD_CLEAR = ROAD_W / 2 + 3

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Category = { models: string[]; matrices: THREE.Matrix4[][]; shadow: boolean }

function category(models: string[], shadow: boolean): Category {
  return { models, matrices: models.map(() => []), shadow }
}

function pick<T>(list: T[], rand: () => number): { item: T; index: number } {
  const index = Math.min(list.length - 1, Math.floor(rand() * list.length))
  return { item: list[index] as T, index }
}

/** Point-to-segment distance in XZ. */
function segmentDistance(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const abx = bx - ax
  const abz = bz - az
  const len2 = abx * abx + abz * abz || 1
  const t = THREE.MathUtils.clamp(((px - ax) * abx + (pz - az) * abz) / len2, 0, 1)
  return Math.hypot(px - (ax + abx * t), pz - (az + abz * t))
}

/**
 * Coarse grid of "distance to road centreline" so 20k+ samples do not each walk 600 points.
 * Cells are 8 m; the lookup takes the min over the cell's own stored distance (computed once).
 */
class RoadDistanceGrid {
  private readonly cell = 8
  private readonly cols: number
  private readonly rows: number
  private readonly minX: number
  private readonly minZ: number
  private readonly data: Float32Array

  constructor(track: Track) {
    this.minX = -EXTENT
    this.minZ = -EXTENT
    this.cols = Math.ceil((EXTENT * 2) / this.cell) + 1
    this.rows = this.cols
    this.data = new Float32Array(this.cols * this.rows)
    const p = new THREE.Vector3()
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        p.set(this.minX + c * this.cell, 0, this.minZ + r * this.cell)
        this.data[r * this.cols + c] = track.nearest(p).distance
      }
    }
  }

  /** Bilinear read; good enough for a 3 m clearance band once combined with the exact check. */
  at(x: number, z: number): number {
    const fx = (x - this.minX) / this.cell
    const fz = (z - this.minZ) / this.cell
    const c0 = THREE.MathUtils.clamp(Math.floor(fx), 0, this.cols - 2)
    const r0 = THREE.MathUtils.clamp(Math.floor(fz), 0, this.rows - 2)
    const tx = THREE.MathUtils.clamp(fx - c0, 0, 1)
    const tz = THREE.MathUtils.clamp(fz - r0, 0, 1)
    const d00 = this.data[r0 * this.cols + c0] ?? 0
    const d10 = this.data[r0 * this.cols + c0 + 1] ?? 0
    const d01 = this.data[(r0 + 1) * this.cols + c0] ?? 0
    const d11 = this.data[(r0 + 1) * this.cols + c0 + 1] ?? 0
    return (d00 * (1 - tx) + d10 * tx) * (1 - tz) + (d01 * (1 - tx) + d11 * tx) * tz
  }
}

export type VegetationPlan = Record<
  'trees' | 'pines' | 'grass' | 'flowers' | 'bushes' | 'rocks' | 'pebbles' | 'stones' | 'debris',
  Category
>

/** Decides where everything goes. Pure and deterministic; no models are loaded. */
export function planVegetation(
  track: Track,
  stops: Stop[],
  heightAt: (x: number, z: number) => number,
): VegetationPlan {
  const rand = mulberry32(2026)
  const roadGrid = new RoadDistanceGrid(track)
  const probe = new THREE.Vector3()

  const driveways = stops.map((s) => {
    const { point } = track.at(s.u)
    const a = point.clone().addScaledVector(s.inward, ROAD_W / 2)
    return { ax: a.x, az: a.z, bx: s.pad.x, bz: s.pad.z }
  })

  const trees = category(TREES, true)
  const pines = category(PINES, true)
  const grass = category(GRASS, false)
  const flowers = category(FLOWERS, false)
  const bushes = category(BUSHES, false)
  const rocks = category(ROCKS, true)
  const pebbles = category(PEBBLES, false)
  const stones = category(STONES, true)
  const debris = category(DEBRIS, false)

  /** Returns the road distance, or -1 when the spot is unusable. */
  const clearance = (x: number, z: number, placeClear = PLACE_CLEAR): number => {
    if (Math.abs(x) > EXTENT || Math.abs(z) > EXTENT) return -1
    const coarse = roadGrid.at(x, z)
    if (coarse < ROAD_CLEAR + 10) {
      probe.set(x, 0, z)
      if (track.nearest(probe).distance < ROAD_CLEAR) return -1
    }
    for (const s of stops) {
      if (Math.hypot(s.anchor.x - x, s.anchor.z - z) < placeClear) return -1
    }
    for (const d of driveways) {
      if (segmentDistance(x, z, d.ax, d.az, d.bx, d.bz) < DRIVEWAY_CLEAR) return -1
    }
    return coarse
  }

  const slopeAt = (x: number, z: number): number => {
    const dx = heightAt(x + 1.5, z) - heightAt(x - 1.5, z)
    const dz = heightAt(x, z + 1.5) - heightAt(x, z - 1.5)
    return Math.hypot(dx, dz) / 3
  }

  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const pos = new THREE.Vector3()
  const scl = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)

  const place = (cat: Category, x: number, z: number, scale: number, tilt = 0) => {
    const { index } = pick(cat.models, rand)
    const yaw = rand() * Math.PI * 2
    q.setFromAxisAngle(up, yaw)
    if (tilt > 0) {
      const t = new THREE.Quaternion().setFromEuler(
        new THREE.Euler((rand() - 0.5) * tilt, 0, (rand() - 0.5) * tilt),
      )
      q.multiply(t)
    }
    pos.set(x, heightAt(x, z), z)
    scl.setScalar(scale)
    m.compose(pos, q, scl)
    ;(cat.matrices[index] as THREE.Matrix4[]).push(m.clone())
  }

  // --- Sampling. Each pass draws candidates uniformly and keeps the ones its zone wants. -------
  const total = 26000
  for (let i = 0; i < total; i++) {
    const x = (rand() * 2 - 1) * EXTENT
    const z = (rand() * 2 - 1) * EXTENT
    const road = clearance(x, z)
    if (road < 0) continue
    const h = heightAt(x, z)
    if (h > 105) continue
    const slope = slopeAt(x, z)
    if (slope > 1.2) continue

    if (road < 60) {
      // Pretty belt: groves, bushes, a few rocks and debris. Grass and flowers come from a denser pass.
      const r = rand()
      if (r < 0.1) place(trees, x, z, 7 + rand() * 4)
      else if (r < 0.18) place(bushes, x, z, 3 + rand() * 2.5)
      else if (r < 0.21) place(rocks, x, z, 2 + rand() * 2, 0.1)
      else if (r < 0.25) place(debris, x, z, 3 + rand() * 2)
      continue
    }

    if (h > 60) {
      // Bare mountain sides: rock and stone, a rare pine on gentler slopes.
      const r = rand()
      if (r < 0.3) place(rocks, x, z, 4 + rand() * 4, 0.25)
      else if (r < 0.5) place(stones, x, z, 3 + rand() * 4, 0.25)
      else if (r < 0.56 && slope < 0.5) place(pines, x, z, 6 + rand() * 3)
      continue
    }

    if (h > 20) {
      // Hills: pine belts with rocks between them.
      const r = rand()
      if (r < 0.55) place(pines, x, z, 8 + rand() * 5)
      else if (r < 0.62) place(rocks, x, z, 2.5 + rand() * 3, 0.15)
      else if (r < 0.7) place(stones, x, z, 2 + rand() * 2, 0.15)
      continue
    }

    if (road < 250) {
      // Thick forest.
      const r = rand()
      if (r < 0.5) place(trees, x, z, 8 + rand() * 5)
      else if (r < 0.6) place(pines, x, z, 8 + rand() * 4)
      else if (r < 0.68) place(bushes, x, z, 3 + rand() * 3)
      else if (r < 0.72) place(debris, x, z, 3 + rand() * 3)
      continue
    }

    // Far fields: lighter forest fading out so the horizon keeps depth without a wall of trees.
    const r = rand()
    if (r < 0.16) place(trees, x, z, 9 + rand() * 4)
    else if (r < 0.21) place(pines, x, z, 9 + rand() * 4)
    else if (r < 0.24) place(rocks, x, z, 3 + rand() * 4, 0.15)
  }

  // --- Dense grass and flowers inside the belt next to the road. -------------------------------
  const beltSamples = 30000
  for (let i = 0; i < beltSamples; i++) {
    // Sample by track position so the belt follows the road exactly.
    const u = rand()
    const side = rand() < 0.5 ? -1 : 1
    const dist = ROAD_CLEAR + 3 + rand() * rand() * 55
    const { point, normal } = track.at(u)
    const x = point.x + normal.x * side * dist + (rand() - 0.5) * 4
    const z = point.z + normal.z * side * dist + (rand() - 0.5) * 4
    // Grass may come closer to the places than trees; the lead's footprints are small.
    if (clearance(x, z, 30) < 0) continue
    if (heightAt(x, z) > 60) continue
    const r = rand()
    if (r < 0.6) place(grass, x, z, 1.2 + rand() * 1.2)
    else if (r < 0.9) place(flowers, x, z, 1 + rand() * 1)
    else if (r < 0.925) place(pebbles, x, z, 1 + rand() * 1, 0.3)
  }

  // --- Rock clusters: a few seeds, several rocks around each. -------------------------------
  for (let c = 0; c < 70; c++) {
    const cx = (rand() * 2 - 1) * EXTENT
    const cz = (rand() * 2 - 1) * EXTENT
    if (clearance(cx, cz) < 15) continue
    const count = 3 + Math.floor(rand() * 5)
    for (let k = 0; k < count; k++) {
      const x = cx + (rand() - 0.5) * 14
      const z = cz + (rand() - 0.5) * 14
      if (clearance(x, z) < 0 || heightAt(x, z) > 105) continue
      place(rand() < 0.6 ? rocks : stones, x, z, 2.5 + rand() * 5, 0.3)
    }
  }

  return { trees, pines, grass, flowers, bushes, rocks, pebbles, stones, debris }
}

export async function scatterVegetation(
  root: THREE.Group,
  track: Track,
  stops: Stop[],
  heightAt: (x: number, z: number) => number,
): Promise<void> {
  const plan = planVegetation(track, stops, heightAt)
  await Promise.all(Object.values(plan).map((cat) => instanceCategory(root, cat)))
}

/** Loads each model of a category once and emits one InstancedMesh per sub-mesh. */
async function instanceCategory(root: THREE.Group, cat: Category): Promise<void> {
  await Promise.all(
    cat.models.map(async (path, i) => {
      const matrices = cat.matrices[i] ?? []
      if (!matrices.length) return
      let group: THREE.Group
      try {
        group = await loadKitModel(`${path}.glb`)
      } catch {
        return
      }
      instanceGroup(root, group, matrices, cat.shadow)
    }),
  )
}

const sharedFlat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 })

/**
 * Instances a loaded model. Kenney nature pieces are several flat-coloured primitives (trunk,
 * leaves...); those get their material colour baked into a vertex colour attribute and are merged
 * into one geometry sharing one material, so the whole model is a single InstancedMesh. Textured
 * primitives, if any, are instanced on their own.
 */
export function instanceGroup(
  root: THREE.Group,
  group: THREE.Group,
  matrices: THREE.Matrix4[],
  castShadow: boolean,
): THREE.InstancedMesh[] {
  group.updateMatrixWorld(true)
  const inverseRoot = group.matrixWorld.clone().invert()
  const out: THREE.InstancedMesh[] = []
  const flat: THREE.BufferGeometry[] = []
  const textured: { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[] }[] = []
  const local = new THREE.Matrix4()

  group.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return
    local.multiplyMatrices(inverseRoot, o.matrixWorld)
    const geometry = (o.geometry as THREE.BufferGeometry).clone().applyMatrix4(local)
    const material = Array.isArray(o.material) ? o.material[0] : o.material
    const standard = material instanceof THREE.MeshStandardMaterial ? material : null
    if (standard && !standard.map && !Array.isArray(o.material)) {
      const count = geometry.getAttribute('position').count
      const colors = new Float32Array(count * 3)
      const c = standard.color
      for (let i = 0; i < count; i++) {
        colors[i * 3] = c.r
        colors[i * 3 + 1] = c.g
        colors[i * 3 + 2] = c.b
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      // Keep only what the shared material reads, so every piece can be merged.
      for (const name of Object.keys(geometry.attributes)) {
        if (name !== 'position' && name !== 'normal' && name !== 'color') geometry.deleteAttribute(name)
      }
      if (!geometry.getAttribute('normal')) geometry.computeVertexNormals()
      flat.push(geometry.index ? geometry.toNonIndexed() : geometry)
    } else {
      textured.push({ geometry, material: o.material })
    }
  })

  const emit = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material | THREE.Material[],
    name: string,
  ) => {
    const mesh = new THREE.InstancedMesh(geometry, material, matrices.length)
    for (let k = 0; k < matrices.length; k++) mesh.setMatrixAt(k, matrices[k] as THREE.Matrix4)
    mesh.instanceMatrix.needsUpdate = true
    mesh.castShadow = castShadow
    mesh.receiveShadow = true
    mesh.frustumCulled = false
    mesh.name = name
    root.add(mesh)
    out.push(mesh)
  }

  if (flat.length) {
    const merged = flat.length === 1 ? (flat[0] as THREE.BufferGeometry) : mergeGeometries(flat, false)
    if (merged) emit(merged, sharedFlat, `veg:${group.name || 'model'}`)
  }
  for (const t of textured) emit(t.geometry, t.material, `veg:${group.name || 'model'}:textured`)
  return out
}
