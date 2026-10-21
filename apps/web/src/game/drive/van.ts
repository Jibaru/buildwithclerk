import * as THREE from 'three'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export const VAN_URL = '/models/clerk_van.glb'
const WHEEL_R = 0.356
const WHEELBASE = 3.75

export type VanRig = {
  root: THREE.Group
  wheels: THREE.Object3D[]
  steer: { node: THREE.Object3D; restY: number }[]
  setHeadlights: (on: boolean) => void
}

/** Loads the Clerk Van and wires the named pivots the model ships with. */
export function loadVan(onProgress: (ratio: number) => void): Promise<VanRig> {
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  return new Promise((resolve, reject) => {
    loader.load(
      VAN_URL,
      (gltf) => {
        const root = gltf.scene
        const nodes = new Map<string, THREE.Object3D>()
        const mats = new Map<string, THREE.MeshStandardMaterial>()
        root.traverse((o) => {
          if (o.name) nodes.set(o.name, o)
          if (o instanceof THREE.Mesh) {
            o.castShadow = true
            o.receiveShadow = true
            const ms = Array.isArray(o.material) ? o.material : [o.material]
            for (const m of ms) if (m instanceof THREE.MeshStandardMaterial && m.name) mats.set(m.name, m)
          }
          if (o instanceof THREE.Light) {
            o.visible = false
            o.intensity = 0
          }
        })
        const wheels = ['Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR']
          .map((n) => nodes.get(n))
          .filter(Boolean) as THREE.Object3D[]
        const steer = ['Steer_L', 'Steer_R']
          .map((n) => nodes.get(n))
          .filter(Boolean)
          .map((node) => ({ node: node as THREE.Object3D, restY: (node as THREE.Object3D).rotation.y }))
        const headLens = mats.get('Headlight_Lens')
        const tailLens = mats.get('Taillight_Lens')
        if (headLens) headLens.emissive.set(0xfff6e0)
        if (tailLens) tailLens.emissive.set(0xff1a10)
        const setHeadlights = (on: boolean) => {
          if (headLens) headLens.emissiveIntensity = on ? 2.5 : 0
          if (tailLens) tailLens.emissiveIntensity = on ? 1.5 : 0
        }
        setHeadlights(false)
        resolve({ root, wheels, steer, setHeadlights })
      },
      (ev) => {
        if (ev.total) onProgress(ev.loaded / ev.total)
      },
      (err) => reject(err instanceof Error ? err : new Error(String(err))),
    )
  })
}

/** Arcade car model: no physics engine, just speed, steering angle and a bicycle-model yaw. */
export class VanController {
  readonly position = new THREE.Vector3()
  heading = 0
  speed = 0
  steer = 0
  readonly maxSpeed = 16
  readonly maxReverse = 5
  readonly maxSteer = THREE.MathUtils.degToRad(32)
  private readonly forward = new THREE.Vector3()

  constructor(readonly rig: VanRig) {}

  /** throttle ∈ [-1, 1], steerInput ∈ [-1, 1] (positive = left). */
  update(dt: number, throttle: number, steerInput: number, brake: boolean) {
    const accel = 9
    const drag = 3
    if (brake) {
      this.speed = THREE.MathUtils.damp(this.speed, 0, 12, dt)
    } else if (throttle !== 0) {
      this.speed += throttle * accel * dt
    } else {
      this.speed = THREE.MathUtils.damp(this.speed, 0, drag, dt)
    }
    this.speed = THREE.MathUtils.clamp(this.speed, -this.maxReverse, this.maxSpeed)

    const targetSteer = steerInput * this.maxSteer
    this.steer = THREE.MathUtils.damp(this.steer, targetSteer, 10, dt)

    // Bicycle model: yaw rate depends on speed and steering angle. Reversing flips the turn.
    const yawRate = (this.speed / WHEELBASE) * Math.tan(this.steer)
    this.heading += yawRate * dt
    this.forward.set(Math.sin(this.heading), 0, Math.cos(this.heading))
    this.position.addScaledVector(this.forward, this.speed * dt)

    const { root, wheels, steer } = this.rig
    root.position.copy(this.position)
    root.rotation.y = this.heading
    const roll = (this.speed * dt) / WHEEL_R
    for (const w of wheels) w.rotation.x += roll
    for (const s of steer) s.node.rotation.y = s.restY + this.steer
  }

  teleport(position: THREE.Vector3, heading: number) {
    this.position.copy(position)
    this.heading = heading
    this.speed = 0
    this.steer = 0
    this.rig.root.position.copy(position)
    this.rig.root.rotation.y = heading
  }

  get forwardDir() {
    return this.forward
  }
}
