import * as THREE from 'three'
import type { Track } from './track'

/**
 * The landscape around the road: a displaced terrain with rolling hills and a ring of
 * mountains, a gradient sky dome, drifting low-poly clouds, and fog that matches the horizon.
 * The road corridor is kept perfectly flat so the track, driveways and places sit on it.
 */
export type Environment = {
  /** Height of the terrain at world x,z. Exactly 0 anywhere within FLAT_RADIUS of the road centreline. */
  heightAt: (x: number, z: number) => number
  /** The terrain mesh (for raycasting taps). */
  terrain: THREE.Mesh
  /** Advance clouds etc. */
  update: (dt: number, cameraPosition: THREE.Vector3) => void
  dispose: () => void
}

export const FLAT_RADIUS = 72

const BLEND_WIDTH = 40
const TERRAIN_SIZE = 1600
const TERRAIN_SEGMENTS = 220
const MOUNTAIN_START = 260
const SKY_RADIUS = 900
const FOG_NEAR = 220
const FOG_FAR = 700

const SKY_ZENITH = '#4d9cf0'
const SKY_MID = '#cfe6ff'
const SKY_HORIZON = '#eef3f6'

const GRASS = new THREE.Color('#5fb33a')
const GRASS_DRY = new THREE.Color('#a6b83c')
const ROCK = new THREE.Color('#7a7368')
const ROCK_DARK = new THREE.Color('#5c5650')
const SNOW = new THREE.Color('#f4f7fa')

// --------------------------------------------------------------------------- noise

/** Deterministic hash → [0, 1). */
function hash2(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t)
}

/** Value noise in [0, 1] with smooth interpolation. */
function valueNoise(x: number, y: number): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = smooth(x - x0)
  const fy = smooth(y - y0)
  const a = hash2(x0, y0)
  const b = hash2(x0 + 1, y0)
  const c = hash2(x0, y0 + 1)
  const d = hash2(x0 + 1, y0 + 1)
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
}

/** Fractal value noise in [0, 1]. */
function fbm(x: number, y: number, octaves: number, lacunarity = 2, gain = 0.5): number {
  let amp = 1
  let freq = 1
  let sum = 0
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq) * amp
    norm += amp
    amp *= gain
    freq *= lacunarity
  }
  return sum / norm
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

// --------------------------------------------------------------------------- height field

type HeightField = {
  /** Height from a precomputed grid of road distances (bilinear). */
  at: (x: number, z: number) => number
  centre: THREE.Vector2
}

/**
 * Builds the height function. The distance to the road is sampled once on a coarse grid
 * (Track.nearest loops 600 samples, so it is not something to call per vertex, let alone
 * per frame) and bilinearly interpolated afterwards.
 */
function buildHeightField(track: Track): HeightField {
  const pts = track.curve.points
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minZ = Number.POSITIVE_INFINITY
  let maxZ = Number.NEGATIVE_INFINITY
  for (const p of pts) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minZ = Math.min(minZ, p.z)
    maxZ = Math.max(maxZ, p.z)
  }
  const centre = new THREE.Vector2((minX + maxX) / 2, (minZ + maxZ) / 2)

  // Road-distance grid: 8 m cells over the whole terrain.
  const cell = 8
  const n = Math.ceil(TERRAIN_SIZE / cell) + 1
  const half = TERRAIN_SIZE / 2
  const dist = new Float32Array(n * n)
  const probe = new THREE.Vector3()
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      probe.set(centre.x - half + i * cell, 0, centre.y - half + j * cell)
      dist[j * n + i] = track.nearest(probe).distance
    }
  }

  const roadDistance = (x: number, z: number): number => {
    const gx = THREE.MathUtils.clamp((x - (centre.x - half)) / cell, 0, n - 1.0001)
    const gz = THREE.MathUtils.clamp((z - (centre.y - half)) / cell, 0, n - 1.0001)
    const i0 = Math.floor(gx)
    const j0 = Math.floor(gz)
    const fx = gx - i0
    const fz = gz - j0
    const i1 = Math.min(i0 + 1, n - 1)
    const j1 = Math.min(j0 + 1, n - 1)
    const a = dist[j0 * n + i0] ?? 0
    const b = dist[j0 * n + i1] ?? 0
    const c = dist[j1 * n + i0] ?? 0
    const d = dist[j1 * n + i1] ?? 0
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz
  }

  const at = (x: number, z: number): number => {
    const d = roadDistance(x, z)
    if (d < FLAT_RADIUS) return 0
    const rise = smoothstep(FLAT_RADIUS, FLAT_RADIUS + BLEND_WIDTH, d)

    // Rolling hills: 4–18 m, low frequency with a touch of detail.
    const hillNoise = fbm(x * 0.006 + 13.7, z * 0.006 + 71.3, 4)
    const hills = 4 + 14 * hillNoise

    // Mountains: a ring that starts ~260 m from the road and peaks toward the terrain edge.
    const ring = smoothstep(MOUNTAIN_START, MOUNTAIN_START + 260, d)
    const ridge = 1 - Math.abs(2 * fbm(x * 0.0028 + 3.1, z * 0.0028 + 9.4, 5, 2.1, 0.55) - 1)
    const peaks = fbm(x * 0.0045 + 101, z * 0.0045 + 47, 3)
    const mountain = ring * (60 + 80 * (0.55 * ridge + 0.45 * peaks))

    return rise * (hills + mountain)
  }

  return { at, centre }
}

// --------------------------------------------------------------------------- grass texture

function makeGrassTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const img = ctx.createImageData(size, size)
  const data = img.data
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Tileable by sampling noise on a torus of integer period.
      const u = x / size
      const v = y / size
      const period = 8
      const nx = Math.cos(u * Math.PI * 2) * period
      const ny = Math.sin(u * Math.PI * 2) * period
      const nz = Math.cos(v * Math.PI * 2) * period
      const nw = Math.sin(v * Math.PI * 2) * period
      const blotch = fbm(nx + nz * 0.37 + 50, ny + nw * 0.37 + 50, 3)
      const fine = valueNoise((nx + nw) * 4 + 200, (ny + nz) * 4 + 200)
      // Multiply map: around 1.0 with blotches a little darker or lighter.
      const l = 0.82 + blotch * 0.3 + (fine - 0.5) * 0.12
      const i = (y * size + x) * 4
      data[i] = Math.round(255 * THREE.MathUtils.clamp(l * 0.97, 0, 1))
      data[i + 1] = Math.round(255 * THREE.MathUtils.clamp(l, 0, 1))
      data[i + 2] = Math.round(255 * THREE.MathUtils.clamp(l * 0.9, 0, 1))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  // UVs span the whole terrain once; one tile every 12 m.
  tex.repeat.set(TERRAIN_SIZE / 12, TERRAIN_SIZE / 12)
  return tex
}

// --------------------------------------------------------------------------- terrain

function buildTerrain(field: HeightField): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const count = pos.count
  const colors = new Float32Array(count * 3)
  const c = new THREE.Color()
  const tint = new THREE.Color()

  for (let i = 0; i < count; i++) {
    const x = pos.getX(i) + field.centre.x
    const z = pos.getZ(i) + field.centre.y
    const h = field.at(x, z)
    pos.setXYZ(i, x, h, z)
  }
  geo.computeVertexNormals()
  const nrm = geo.getAttribute('normal') as THREE.BufferAttribute

  for (let i = 0; i < count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const h = pos.getY(i)
    const slope = 1 - nrm.getY(i) // 0 flat … 1 vertical

    // Grass with gentle variation, dry patches where the noise says so.
    const variation = fbm(x * 0.02 + 7, z * 0.02 + 3, 3)
    c.copy(GRASS)
    tint.copy(GRASS).offsetHSL(0, 0, (variation - 0.5) * 0.08)
    c.copy(tint)
    const dry = smoothstep(0.58, 0.8, fbm(x * 0.008 + 91, z * 0.008 + 17, 3))
    c.lerp(GRASS_DRY, dry * 0.7)

    // Rock on slopes and up high, darker in the crevices.
    const rocky = Math.max(smoothstep(0.22, 0.5, slope), smoothstep(45, 90, h))
    tint.copy(ROCK).lerp(ROCK_DARK, smoothstep(0.4, 0.8, slope))
    c.lerp(tint, rocky)

    // Snow on the peaks, except on the steepest faces.
    const snow = smoothstep(104, 122, h) * (1 - smoothstep(0.45, 0.75, slope))
    c.lerp(SNOW, snow)

    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeBoundingSphere()

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    map: makeGrassTexture(),
    roughness: 1,
    metalness: 0,
  })
  const mesh = new THREE.Mesh(geo, material)
  mesh.name = 'terrain'
  mesh.receiveShadow = true
  // Sits just under the road's y=0 so the flat corridor never z-fights with the ribbons.
  mesh.position.y = -0.05
  return mesh
}

// --------------------------------------------------------------------------- sky

function buildSky(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(SKY_RADIUS, 32, 16)
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      zenith: { value: new THREE.Color(SKY_ZENITH) },
      mid: { value: new THREE.Color(SKY_MID) },
      horizon: { value: new THREE.Color(SKY_HORIZON) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 zenith;
      uniform vec3 mid;
      uniform vec3 horizon;
      varying vec3 vWorld;
      void main() {
        vec3 dir = normalize(vWorld - cameraPosition);
        float y = clamp(dir.y, -0.2, 1.0);
        // Haze band near the horizon, blue above.
        float lower = smoothstep(-0.02, 0.12, y);
        float upper = smoothstep(0.12, 0.65, y);
        vec3 col = mix(horizon, mid, lower);
        col = mix(col, zenith, upper);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `,
  })
  const mesh = new THREE.Mesh(geo, material)
  mesh.name = 'sky'
  mesh.frustumCulled = false
  mesh.renderOrder = -10
  return mesh
}

// --------------------------------------------------------------------------- clouds

type CloudLayer = {
  mesh: THREE.InstancedMesh
  positions: THREE.Vector3[]
  speeds: number[]
  scales: number[]
}

/** Builds one cloud "shape" out of a few overlapping spheres, merged into a single geometry. */
function cloudShape(seed: number): THREE.BufferGeometry {
  const puffs = 3 + Math.floor(hash2(seed, 1) * 4) // 3–6
  const geos: THREE.BufferGeometry[] = []
  for (let i = 0; i < puffs; i++) {
    const r = 10 + hash2(seed, 10 + i) * 12
    const g = new THREE.SphereGeometry(r, 7, 5)
    const ox = (hash2(seed, 20 + i) - 0.5) * 42
    const oy = (hash2(seed, 30 + i) - 0.5) * 6
    const oz = (hash2(seed, 40 + i) - 0.5) * 22
    g.scale(1, 0.55, 1)
    g.translate(ox, oy, oz)
    geos.push(g)
  }
  return mergeGeometries(geos)
}

/** Minimal merge for non-indexed-compatible geometries: positions and normals only. */
function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const parts = geos.map((g) => g.toNonIndexed())
  let total = 0
  for (const p of parts) total += p.getAttribute('position').count
  const position = new Float32Array(total * 3)
  const normal = new Float32Array(total * 3)
  let offset = 0
  for (const p of parts) {
    const pa = p.getAttribute('position') as THREE.BufferAttribute
    const na = p.getAttribute('normal') as THREE.BufferAttribute
    position.set(pa.array as Float32Array, offset * 3)
    normal.set(na.array as Float32Array, offset * 3)
    offset += pa.count
    p.dispose()
  }
  for (const g of geos) g.dispose()
  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(position, 3))
  merged.setAttribute('normal', new THREE.BufferAttribute(normal, 3))
  merged.computeBoundingSphere()
  return merged
}

function buildClouds(centre: THREE.Vector2): CloudLayer[] {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.25,
    roughness: 1,
    metalness: 0,
    flatShading: true,
  })
  const variants = 4
  const perVariant = 13 // 52 clouds total
  const layers: CloudLayer[] = []
  const m = new THREE.Matrix4()
  for (let v = 0; v < variants; v++) {
    const geo = cloudShape(v + 1)
    const mesh = new THREE.InstancedMesh(geo, material, perVariant)
    mesh.name = `clouds-${v}`
    mesh.frustumCulled = false
    const positions: THREE.Vector3[] = []
    const speeds: number[] = []
    const scales: number[] = []
    for (let i = 0; i < perVariant; i++) {
      const seed = v * 100 + i
      const x = centre.x + (hash2(seed, 2) - 0.5) * 1400
      const z = centre.y + (hash2(seed, 3) - 0.5) * 1400
      const y = 90 + hash2(seed, 4) * 70
      const s = 0.8 + hash2(seed, 5) * 1.2
      positions.push(new THREE.Vector3(x, y, z))
      speeds.push(1.2 + hash2(seed, 6) * 1.8)
      scales.push(s)
      m.makeScale(s, s, s).setPosition(x, y, z)
      mesh.setMatrixAt(i, m)
    }
    mesh.instanceMatrix.needsUpdate = true
    layers.push({ mesh, positions, speeds, scales })
  }
  return layers
}

// --------------------------------------------------------------------------- public

export function buildEnvironment(scene: THREE.Scene, track: Track): Environment {
  const field = buildHeightField(track)
  const root = new THREE.Group()
  root.name = 'environment'
  scene.add(root)

  const terrain = buildTerrain(field)
  root.add(terrain)

  const sky = buildSky()
  root.add(sky)

  const clouds = buildClouds(field.centre)
  for (const layer of clouds) root.add(layer.mesh)

  const horizon = new THREE.Color(SKY_HORIZON)
  const previousBackground = scene.background
  const previousFog = scene.fog
  scene.background = horizon
  scene.fog = new THREE.Fog(horizon, FOG_NEAR, FOG_FAR)

  const matrix = new THREE.Matrix4()
  const halfSpan = 700

  const update = (dt: number, cameraPosition: THREE.Vector3) => {
    // The sky dome rides with the camera so its horizon never shows an edge.
    sky.position.set(cameraPosition.x, 0, cameraPosition.z)

    for (const layer of clouds) {
      const { mesh, positions, speeds, scales } = layer
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i]
        const speed = speeds[i]
        const s = scales[i]
        if (!p || speed === undefined || s === undefined) continue
        p.x += speed * dt
        if (p.x > field.centre.x + halfSpan) p.x -= halfSpan * 2
        matrix.makeScale(s, s, s).setPosition(p.x, p.y, p.z)
        mesh.setMatrixAt(i, matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    }
  }

  const dispose = () => {
    scene.remove(root)
    terrain.geometry.dispose()
    const tm = terrain.material as THREE.MeshStandardMaterial
    tm.map?.dispose()
    tm.dispose()
    sky.geometry.dispose()
    ;(sky.material as THREE.Material).dispose()
    for (const layer of clouds) {
      layer.mesh.geometry.dispose()
      layer.mesh.dispose()
    }
    ;(clouds[0]?.mesh.material as THREE.Material | undefined)?.dispose()
    scene.background = previousBackground
    scene.fog = previousFog
  }

  return { heightAt: field.at, terrain, update, dispose }
}
