import * as THREE from 'three'

/** Road width in metres. The van is 2.5 m wide. */
export const ROAD_W = 10
export const SHOULDER_W = 1.2
export const DRIVEWAY_W = 5

/**
 * One closed loop. Waypoints are hand-placed so the drive has straights for speed and a few
 * sweeping bends, with room on both sides for the places. About 1,150 m around, so twenty-nine
 * places sit roughly 40 m apart along the road (80 m between neighbours on the same side).
 */
const LOOP_SCALE = 1.65
export const WAYPOINTS: Array<[number, number]> = (
  [
    [0, 0],
    [60, -6],
    [120, 10],
    [170, 50],
    [180, 110],
    [150, 160],
    [90, 185],
    [20, 180],
    [-40, 150],
    [-70, 100],
    [-60, 40],
    [-30, 10],
  ] as Array<[number, number]>
).map(([x, z]) => [x * LOOP_SCALE, z * LOOP_SCALE])

export class Track {
  readonly curve: THREE.CatmullRomCurve3
  readonly length: number
  private readonly samples: THREE.Vector3[]
  private readonly tangents: THREE.Vector3[]

  constructor() {
    this.curve = new THREE.CatmullRomCurve3(
      WAYPOINTS.map(([x, z]) => new THREE.Vector3(x, 0, z)),
      true,
      'catmullrom',
      0.5,
    )
    this.length = this.curve.getLength()
    const n = 600
    this.samples = this.curve.getSpacedPoints(n)
    this.tangents = this.samples.map((_, i) =>
      this.curve
        .getTangentAt(i / n)
        .setY(0)
        .normalize(),
    )
  }

  /** Point and tangent at arc-length ratio u ∈ [0, 1). */
  at(u: number): { point: THREE.Vector3; tangent: THREE.Vector3; normal: THREE.Vector3 } {
    const t = ((u % 1) + 1) % 1
    const point = this.curve.getPointAt(t).setY(0)
    const tangent = this.curve.getTangentAt(t).setY(0).normalize()
    // Left-hand normal (pointing to the left of travel direction).
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x)
    return { point, tangent, normal }
  }

  /** Closest sample to a world position: distance from the centreline and its ratio. */
  nearest(p: THREE.Vector3): { distance: number; u: number; tangent: THREE.Vector3 } {
    let best = 0
    let bestD = Number.POSITIVE_INFINITY
    for (let i = 0; i < this.samples.length; i++) {
      const s = this.samples[i] as THREE.Vector3
      const d = (s.x - p.x) ** 2 + (s.z - p.z) ** 2
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    return {
      distance: Math.sqrt(bestD),
      u: best / this.samples.length,
      tangent: this.tangents[best] as THREE.Vector3,
    }
  }

  /** A ribbon mesh along the loop with UVs that run along its length (v) and across (u). */
  buildRibbon(width: number, y: number, segments = 600): THREE.BufferGeometry {
    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []
    let dist = 0
    let prev: THREE.Vector3 | null = null
    for (let i = 0; i <= segments; i++) {
      const { point, normal } = this.at(i / segments)
      if (prev) dist += point.distanceTo(prev)
      prev = point
      const l = point.clone().addScaledVector(normal, width / 2)
      const r = point.clone().addScaledVector(normal, -width / 2)
      positions.push(l.x, y, l.z, r.x, y, r.z)
      uvs.push(0, dist, 1, dist)
      if (i < segments) {
        const a = i * 2
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }
}

/** Asphalt with edge lines and a dashed centre line; tiled along the road's v axis. */
export function makeRoadTexture(): THREE.CanvasTexture {
  const w = 256
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.fillStyle = '#26262e'
  ctx.fillRect(0, 0, w, h)
  // Subtle grain.
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.08)'
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
  }
  // Edge lines.
  ctx.fillStyle = '#eeeef0'
  ctx.fillRect(10, 0, 5, h)
  ctx.fillRect(w - 15, 0, 5, h)
  // Dashed centre line (one dash per tile).
  ctx.fillStyle = '#f5f0c8'
  ctx.fillRect(w / 2 - 3, 24, 6, 120)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  // One texture tile every 12 m of road.
  tex.repeat.set(1, 1 / 12)
  return tex
}
