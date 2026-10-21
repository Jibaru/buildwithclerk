import type { Project } from '@buildwithclerk/registry'
import * as THREE from 'three'
import { buildEnvironment, type Environment } from './environment'
import { buildPlace, loadKitModel } from './kits'
import { PLACES, ROADSIDE_MODELS } from './places'
import { DRIVEWAY_W, makeRoadTexture, ROAD_W, SHOULDER_W, Track } from './track'
import { scatterVegetation } from './vegetation'

export const COLORS = {
  lime: 0x7cff00,
  limeDark: 0x6ae000,
  pavement: 0xeeeef0,
  driveway: 0xd9d9de,
  purple: 0x6c47ff,
  grayDark: 0x747686,
  water: 0x00aee3,
  white: 0xffffff,
} as const

/** Distance from the road centreline to a place's anchor, and to its parking pad. */
const PLACE_OFFSET = 34
const PAD_OFFSET = 15

export type Stop = {
  slug: string
  title: string
  status: Project['status']
  /** Arc-length ratio along the track where the driveway leaves the road. */
  u: number
  anchor: THREE.Vector3
  /** Where the van parks to enter. */
  pad: THREE.Vector3
  /** Direction from the road toward the place (unit, XZ). */
  inward: THREE.Vector3
  /** Rotation of the place group so its local +z faces the road. */
  rotY: number
  group: THREE.Group
  /** World-space footprint for collisions, set once the models load. */
  box: THREE.Box3 | null
  sign: THREE.Sprite
}

export type World = {
  track: Track
  stops: Stop[]
  /** The terrain, for raycasting taps. */
  ground: THREE.Mesh
  env: Environment
  pickables: THREE.Object3D[]
  /** Resolves when every place has its models; decor keeps streaming after. */
  ready: Promise<void>
  dispose: () => void
}

function mat(color: number, roughness = 0.95): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 })
}

export function buildTrackWorld(scene: THREE.Scene, projects: Project[]): World {
  const track = new Track()
  const root = new THREE.Group()
  root.name = 'world'
  scene.add(root)

  // Terrain, sky, clouds and fog. Flat within FLAT_RADIUS of the road, hills and mountains beyond.
  const env = buildEnvironment(scene, track)

  // Road: a pale shoulder under a textured asphalt ribbon.
  const shoulder = new THREE.Mesh(track.buildRibbon(ROAD_W + SHOULDER_W * 2, 0.02), mat(COLORS.pavement, 1))
  shoulder.receiveShadow = true
  root.add(shoulder)
  const roadMat = new THREE.MeshStandardMaterial({ map: makeRoadTexture(), roughness: 0.95, metalness: 0 })
  const road = new THREE.Mesh(track.buildRibbon(ROAD_W, 0.04), roadMat)
  road.receiveShadow = true
  root.add(road)

  // Places, one per project, alternating sides of the road.
  const stops: Stop[] = []
  const pickables: THREE.Object3D[] = []
  const count = projects.length
  const loads: Promise<void>[] = []
  projects.forEach((project, i) => {
    const u = (i + 0.5) / count
    const { point, normal } = track.at(u)
    const side = i % 2 === 0 ? 1 : -1
    const inward = normal.clone().multiplyScalar(side)
    const anchor = point.clone().addScaledVector(inward, PLACE_OFFSET)
    const pad = point.clone().addScaledVector(inward, PAD_OFFSET)
    // Local +z must point from the anchor back toward the road.
    const toRoad = inward.clone().negate()
    const rotY = Math.atan2(toRoad.x, toRoad.z)

    const group = new THREE.Group()
    group.name = `place:${project.slug}`
    group.userData.slug = project.slug
    group.position.copy(anchor)
    group.rotation.y = rotY
    root.add(group)
    pickables.push(group)

    // Driveway from the road edge to just past the pad.
    const from = point.clone().addScaledVector(inward, ROAD_W / 2 - 0.5)
    const to = point.clone().addScaledVector(inward, PAD_OFFSET + 6)
    const length = from.distanceTo(to)
    const drive = new THREE.Mesh(new THREE.PlaneGeometry(DRIVEWAY_W, length), mat(COLORS.driveway, 1))
    drive.rotation.x = -Math.PI / 2
    drive.rotation.z = -Math.atan2(inward.x, inward.z)
    drive.position.copy(from).add(to).multiplyScalar(0.5).setY(0.03)
    drive.receiveShadow = true
    root.add(drive)

    // Parking pad.
    const planned = project.status === 'planned'
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(3.6, 4.4, 48),
      mat(planned ? COLORS.grayDark : COLORS.purple, 1),
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.copy(pad).setY(0.05)
    root.add(ring)

    // Optional water patch for harbours.
    const spec = PLACES[project.slug]
    if (spec?.water) {
      const w = new THREE.Mesh(new THREE.CircleGeometry(spec.water.r, 48), mat(COLORS.water, 0.3))
      w.rotation.x = -Math.PI / 2
      w.position.set(spec.water.x, 0.02, spec.water.z)
      group.add(w)
    }

    const sign = makeSign(project.title, planned)
    sign.position.set(0, 14, 0)
    group.add(sign)

    const stop: Stop = {
      slug: project.slug,
      title: project.title,
      status: project.status,
      u,
      anchor,
      pad,
      inward,
      rotY,
      group,
      box: null,
      sign,
    }
    stops.push(stop)

    if (spec) {
      loads.push(
        buildPlace({
          scale: 1,
          pieces: spec.pieces.map((p) => ({
            model: `${p.m}.glb`,
            x: p.x,
            y: p.y,
            z: p.z,
            rot: p.rot,
            scale: p.s,
          })),
        }).then((models) => {
          if (planned) {
            models.traverse((o) => {
              if (o instanceof THREE.Mesh && o.material instanceof THREE.MeshStandardMaterial) {
                o.material = o.material.clone()
                o.material.color.lerp(new THREE.Color(0x9394a1), 0.55)
              }
            })
          }
          group.add(models)
          const box = new THREE.Box3().setFromObject(models)
          stop.box = box
          sign.position.y = Math.min(box.max.y - anchor.y, 40) + 4
        }),
      )
    }
  })

  const ready = Promise.all(loads).then(() => undefined)

  // Lamps and vegetation stream in after the places.
  ready
    .then(() => placeLamps(root, track, stops))
    .then(() => scatterVegetation(root, track, stops, env.heightAt))
    .catch((err) => console.error('vegetation failed', err))

  return {
    track,
    stops,
    ground: env.terrain,
    env,
    pickables,
    ready,
    dispose: () => {
      root.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose()
      })
      scene.remove(root)
      env.dispose()
    },
  }
}

/** Lamp posts along the road, kept clear of every driveway. */
async function placeLamps(root: THREE.Group, track: Track, stops: Stop[]) {
  const lamp = await loadKitModel(`${ROADSIDE_MODELS.lamp}.glb`).catch(() => null)
  if (!lamp) return
  const clearOf = (u: number, side: number) =>
    stops.some(
      (s) =>
        Math.abs(((u - s.u + 1.5) % 1) - 0.5) < 0.022 && Math.sign(s.inward.dot(track.at(u).normal)) === side,
    )
  const lamps = 28
  for (let i = 0; i < lamps; i++) {
    const u = i / lamps
    const side = i % 2 === 0 ? 1 : -1
    if (clearOf(u, side)) continue
    const { point, normal } = track.at(u)
    const m = lamp.clone(true)
    m.scale.setScalar(11)
    m.position.copy(point).addScaledVector(normal, side * (ROAD_W / 2 + 2.2))
    m.rotation.y = Math.atan2(-normal.x * side, -normal.z * side)
    root.add(m)
  }
}

function makeSign(text: string, muted: boolean): THREE.Sprite {
  const scale = 4
  const font = `600 ${22 * scale}px Inter, ui-sans-serif, system-ui, sans-serif`
  const measure = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D
  measure.font = font
  const textW = measure.measureText(text).width
  const padX = 24 * scale
  const w = Math.ceil(textW + padX * 2)
  const h = 56 * scale
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.fillStyle = muted ? 'rgba(116,118,134,0.95)' : 'rgba(19,19,22,0.96)'
  ctx.beginPath()
  ctx.roundRect(0, 0, w, h, 14 * scale)
  ctx.fill()
  ctx.font = font
  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(text, w / 2, h / 2 + 1 * scale)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(material)
  const metresPerPx = 3.2 / h
  sprite.scale.set(w * metresPerPx, h * metresPerPx, 1)
  sprite.renderOrder = 10
  return sprite
}
