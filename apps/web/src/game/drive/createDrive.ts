import type { Project } from '@buildwithclerk/registry'
import * as THREE from 'three'
import { ROAD_W } from './track'
import { buildTrackWorld, type Stop } from './trackWorld'
import { loadVan, VanController } from './van'

export type DriveEvents = {
  onProgress: (ratio: number) => void
  onReady: () => void
  onNear: (slug: string | null) => void
  onEnter: (slug: string) => void
}

export type DriveHandle = {
  setFrozen: (frozen: boolean) => void
  goTo: (slug: string) => void
  driveTo: (slug: string) => void
  destroy: () => void
}

const PAD_RADIUS = 7
const VAN_RADIUS = 2.6
const OFFROAD_MAX = 9

type Autopilot = { stop: Stop; phase: 'road' | 'driveway' }

/**
 * The 3D landing: one loop of road through a lime diorama, a detailed place per project on
 * alternating sides, and the Clerk Van seen from a chase camera. Drive with WASD, tap a place
 * and the van drives there by road, press E at a pad to open the project.
 */
export function createDrive(
  parent: HTMLElement,
  projects: Project[],
  events: DriveEvents & { startAt?: string | null },
): DriveHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.touchAction = 'none'
  parent.appendChild(renderer.domElement)

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 600)

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8ff66, 0.9))
  const sun = new THREE.DirectionalLight(0xffffff, 2.4)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  const sc = sun.shadow.camera
  sc.left = -90
  sc.right = 90
  sc.top = 90
  sc.bottom = -90
  sc.near = 1
  sc.far = 260
  sun.shadow.bias = -0.0006
  sun.shadow.normalBias = 0.04
  scene.add(sun, sun.target)
  const fill = new THREE.DirectionalLight(0xffffff, 0.8)
  fill.position.set(-30, 20, -20)
  scene.add(fill)

  const world = buildTrackWorld(scene, projects)
  const { track } = world

  // State.
  let van: VanController | null = null
  let frozen = false
  let near: Stop | null = null
  let autopilot: Autopilot | null = null
  const keys = new Set<string>()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const camPos = new THREE.Vector3()
  const camLook = new THREE.Vector3()
  const tmp = new THREE.Vector3()
  let disposed = false
  let narrow = false

  const start = track.at(0)
  const spawn = start.point.clone()
  const spawnHeading = Math.atan2(start.tangent.x, start.tangent.z)
  camera.position.copy(spawn).add(new THREE.Vector3(0, 8, -14))
  camera.lookAt(spawn)

  const resize = () => {
    const w = parent.clientWidth || 1
    const h = parent.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    narrow = w < 640
  }
  const ro = new ResizeObserver(resize)
  ro.observe(parent)
  resize()

  const onKeyDown = (e: KeyboardEvent) => {
    if (frozen) return
    const k = e.key.toLowerCase()
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
      e.preventDefault()
      keys.add(k)
      autopilot = null
    }
    if ((k === 'e' || k === 'enter') && near) events.onEnter(near.slug)
  }
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase())
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  let downAt = 0
  let downX = 0
  let downY = 0
  const onPointerDown = (e: PointerEvent) => {
    downAt = performance.now()
    downX = e.clientX
    downY = e.clientY
  }
  const onPointerUp = (e: PointerEvent) => {
    if (frozen || !van) return
    if (performance.now() - downAt > 400 || Math.hypot(e.clientX - downX, e.clientY - downY) > 12) return
    pointer.set((e.offsetX / parent.clientWidth) * 2 - 1, -(e.offsetY / parent.clientHeight) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(world.pickables, true)
    const stop = hits.map((h) => findStop(h.object)).find(Boolean)
    if (stop) {
      driveTo(stop.slug)
      return
    }
    // Tapping the road or grass: drive toward the nearest stop in that direction.
    const groundHit = raycaster.intersectObject(world.ground)[0]
    if (groundHit) {
      const target = track.nearest(groundHit.point)
      const nearest = world.stops.reduce((best, s) => (arc(s.u, target.u) < arc(best.u, target.u) ? s : best))
      driveTo(nearest.slug)
    }
  }
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointerup', onPointerUp)

  function findStop(object: THREE.Object3D): Stop | null {
    let o: THREE.Object3D | null = object
    while (o) {
      const slug = o.userData?.slug as string | undefined
      if (slug) return world.stops.find((s) => s.slug === slug) ?? null
      o = o.parent
    }
    return null
  }

  /** Shortest signed arc from a to b on the loop, in track ratio. */
  function arcSigned(a: number, b: number) {
    let d = b - a
    d -= Math.round(d)
    return d
  }
  function arc(a: number, b: number) {
    return Math.abs(arcSigned(a, b))
  }

  function nearestStop(position: THREE.Vector3): Stop | null {
    let best: Stop | null = null
    let bestD = PAD_RADIUS
    for (const s of world.stops) {
      const d = Math.hypot(s.pad.x - position.x, s.pad.z - position.z)
      if (d < bestD) {
        bestD = d
        best = s
      }
    }
    return best
  }

  /** Keep the van out of the places with a circle-vs-box push; slow it on grass. */
  function collide(position: THREE.Vector3) {
    for (const s of world.stops) {
      const box = s.box
      if (!box) continue
      const cx = THREE.MathUtils.clamp(position.x, box.min.x, box.max.x)
      const cz = THREE.MathUtils.clamp(position.z, box.min.z, box.max.z)
      const dx = position.x - cx
      const dz = position.z - cz
      const d = Math.hypot(dx, dz)
      if (d < VAN_RADIUS) {
        if (d < 1e-4) {
          position.copy(s.pad)
        } else {
          const push = (VAN_RADIUS - d) / d
          position.x += dx * push
          position.z += dz * push
        }
        if (van) van.speed *= 0.2
      }
    }
    const limit = 420
    position.x = THREE.MathUtils.clamp(position.x, -limit, limit)
    position.z = THREE.MathUtils.clamp(position.z, -limit, limit)
  }

  function driveTo(slug: string) {
    const stop = world.stops.find((s) => s.slug === slug)
    if (!stop || !van) return
    autopilot = { stop, phase: 'road' }
  }

  function goTo(slug: string, enter = true) {
    const stop = world.stops.find((s) => s.slug === slug)
    if (!stop || !van) return
    autopilot = null
    const heading = Math.atan2(stop.inward.x, stop.inward.z)
    van.teleport(stop.pad.clone(), heading)
    tmp.set(Math.sin(heading), 0, Math.cos(heading))
    camera.position
      .copy(stop.pad)
      .addScaledVector(tmp, -14)
      .add(new THREE.Vector3(0, 8, 0))
    near = stop
    events.onNear(stop.slug)
    if (enter) events.onEnter(slug)
  }

  const timer = new THREE.Timer()
  let raf = 0
  const tick = () => {
    if (disposed) return
    raf = requestAnimationFrame(tick)
    timer.update()
    const dt = Math.min(timer.getDelta(), 0.05)

    if (van) {
      let throttle = 0
      let steer = 0
      let brake = false
      if (!frozen) {
        if (keys.has('w') || keys.has('arrowup')) throttle += 1
        if (keys.has('s') || keys.has('arrowdown')) throttle -= 1
        if (keys.has('a') || keys.has('arrowleft')) steer += 1
        if (keys.has('d') || keys.has('arrowright')) steer -= 1
        if (keys.has(' ')) brake = true
        if (autopilot) {
          const ap = autopilot
          const here = track.nearest(van.position)
          const remaining = arcSigned(here.u, ap.stop.u)
          let target: THREE.Vector3
          let cruise = 1
          if (ap.phase === 'road' && Math.abs(remaining) > 0.012) {
            // Follow the road toward the stop, looking 16 m ahead in the shorter direction.
            const dir = Math.sign(remaining) || 1
            const lookU = here.u + (dir * 16) / track.length
            target = track.at(lookU).point
            cruise = Math.abs(remaining) < 0.05 ? 0.55 : 1
          } else {
            ap.phase = 'driveway'
            target = ap.stop.pad
            cruise = 0.4
          }
          const dx = target.x - van.position.x
          const dz = target.z - van.position.z
          const dist = Math.hypot(dx, dz)
          let diff = Math.atan2(dx, dz) - van.heading
          diff = Math.atan2(Math.sin(diff), Math.cos(diff))
          if (ap.phase === 'driveway' && dist < 2.5) {
            brake = true
            if (Math.abs(van.speed) < 0.6) {
              autopilot = null
              if (nearestStop(van.position)?.slug === ap.stop.slug) events.onEnter(ap.stop.slug)
            }
          } else {
            steer = THREE.MathUtils.clamp(diff * 1.8, -1, 1)
            if (Math.abs(diff) > 1.3) cruise = 0.3
            throttle = van.speed < van.maxSpeed * cruise ? 1 : 0
            if (van.speed > van.maxSpeed * cruise + 2) brake = true
          }
        }
      } else {
        brake = true
      }

      const steerScale = THREE.MathUtils.clamp(Math.abs(van.speed) / 3, 0.2, 1)
      van.update(dt, throttle, steer * steerScale * Math.sign(van.speed || 1), brake)

      // Grass is slow.
      const onRoad = track.nearest(van.position).distance < ROAD_W / 2 + 1.5
      const vanPos = van.position
      const onDriveway = world.stops.some((s) => distToDriveway(s, vanPos) < 4)
      if (!onRoad && !onDriveway && van.speed > OFFROAD_MAX)
        van.speed = THREE.MathUtils.damp(van.speed, OFFROAD_MAX, 6, dt)

      collide(van.position)
      van.rig.root.position.copy(van.position)

      const n = nearestStop(van.position)
      if (n?.slug !== near?.slug) {
        near = n
        events.onNear(n?.slug ?? null)
      }

      // Chase camera: behind and above, looking past the van, eased so turns feel smooth.
      const fwd = van.forwardDir
      const back = narrow ? 17 : 14
      const up = narrow ? 9 : 7
      camPos.copy(van.position).addScaledVector(fwd, -back).setY(up)
      camLook.copy(van.position).addScaledVector(fwd, 10).setY(1.8)
      camera.position.x = THREE.MathUtils.damp(camera.position.x, camPos.x, 5, dt)
      camera.position.y = THREE.MathUtils.damp(camera.position.y, camPos.y, 5, dt)
      camera.position.z = THREE.MathUtils.damp(camera.position.z, camPos.z, 5, dt)
      camera.lookAt(camLook)
      const targetFov = 50 + Math.abs(van.speed) * 0.5
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 4, dt)
      camera.updateProjectionMatrix()

      sun.position.set(van.position.x + 50, 90, van.position.z + 40)
      sun.target.position.set(van.position.x, 0, van.position.z)
    }

    world.env.update(dt, camera.position)
    renderer.render(scene, camera)
  }

  function distToDriveway(s: Stop, p: THREE.Vector3) {
    // Segment from the road edge to the pad.
    const { point } = track.at(s.u)
    const a = point.clone().addScaledVector(s.inward, ROAD_W / 2)
    const b = s.pad
    const abx = b.x - a.x
    const abz = b.z - a.z
    const t = THREE.MathUtils.clamp(((p.x - a.x) * abx + (p.z - a.z) * abz) / (abx * abx + abz * abz), 0, 1)
    return Math.hypot(p.x - (a.x + abx * t), p.z - (a.z + abz * t))
  }

  loadVan(events.onProgress)
    .then((rig) => {
      if (disposed) return
      scene.add(rig.root)
      rig.setHeadlights(true)
      van = new VanController(rig)
      van.teleport(spawn, spawnHeading)
      van.update(0, 0, 0, true)
      // Snap the camera behind the van once instead of easing in from the spawn framing.
      tmp.set(Math.sin(spawnHeading), 0, Math.cos(spawnHeading))
      camera.position.copy(spawn).addScaledVector(tmp, -14).setY(7)
      if (events.startAt) goTo(events.startAt, false)
      return world.ready
    })
    .catch((err) => console.error('Clerk Van failed to load', err))
    .finally(() => {
      if (!disposed) events.onReady()
    })

  tick()

  return {
    setFrozen: (f) => {
      frozen = f
      if (f) {
        keys.clear()
        autopilot = null
      }
    },
    goTo: (slug) => goTo(slug, true),
    driveTo,
    destroy: () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      world.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
