import Phaser from 'phaser'
import { type Building, buildingAt, type CityMap, PLAZA, SPAWN } from './citymap'
import { findPath, nearestOpen, type Point } from './pathfinding'
import { characterFrames, DIRECTIONS, type Direction, SHEET_URL, T, TILE, WALLS } from './tiles'

export type CityEvents = {
  onReady: () => void
  onNear: (slug: string | null) => void
  onEnter: (slug: string) => void
}

export type CitySceneOptions = CityEvents & {
  map: CityMap
  avatar: number
  startAt?: string | null
}

const SPEED = 96
const PURPLE = 0x6c47ff
const LAMP = 0xffc98a
const NIGHT = 0x8b82d6

/**
 * Clerk City. One scene: the tilemap drawn from `buildCityMap`, a player, night lighting,
 * door signs, keyboard + tap-to-walk, and three events out to React (ready, near, enter).
 */
export class CityScene extends Phaser.Scene {
  private readonly opts: CitySceneOptions
  private player!: Phaser.Physics.Arcade.Sprite
  private keys!: Record<
    'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd' | 'e' | 'enter',
    Phaser.Input.Keyboard.Key
  >
  private facing: Direction = 'down'
  private path: Point[] = []
  private pathTarget: Building | null = null
  private near: Building | null = null
  private frozen = false
  private prompt!: Phaser.GameObjects.Text

  constructor(opts: CitySceneOptions) {
    super('city')
    this.opts = opts
  }

  preload() {
    this.load.spritesheet('urban', SHEET_URL, { frameWidth: TILE, frameHeight: TILE })
  }

  create() {
    const { map: city } = this.opts
    const worldW = city.width * TILE
    const worldH = city.height * TILE

    const tilemap = this.make.tilemap({
      tileWidth: TILE,
      tileHeight: TILE,
      width: city.width,
      height: city.height,
    })
    const tileset = tilemap.addTilesetImage('urban', 'urban', TILE, TILE, 0, 0)
    if (!tileset) throw new Error('tileset missing')

    const ground = tilemap.createBlankLayer('ground', tileset)
    const props = tilemap.createBlankLayer('props', tileset)
    const walls = tilemap.createBlankLayer('walls', tileset)
    const solid = tilemap.createBlankLayer('solid', tileset)
    if (!ground || !props || !walls || !solid) throw new Error('layers missing')
    ground.putTilesAt(city.ground, 0, 0)
    props.putTilesAt(city.props, 0, 0).setDepth(5)
    walls.setDepth(6)

    for (const b of city.buildings) this.drawBuilding(walls, b)

    // One invisible layer carries every collision: buildings, water, trees, lamps, edges.
    solid.putTilesAt(
      city.blocked.map((row) => row.map((blocked) => (blocked ? T.pavement : -1))),
      0,
      0,
    )
    solid.setVisible(false)
    solid.setCollisionByExclusion([-1])

    // Night: multiply the whole world with a soft purple, then add light back with radial glows.
    this.add
      .rectangle(0, 0, worldW, worldH, NIGHT)
      .setOrigin(0)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
      .setDepth(50)
    this.makeGlowTexture()
    for (const lamp of city.lamps) this.glow(lamp.x * TILE + 8, lamp.y * TILE - 4, 2.2, LAMP, 0.5)
    for (const b of city.buildings) {
      if (b.status === 'planned') continue
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
        [2, 1],
      ] as const) {
        this.glow(b.x * TILE + dx * TILE + 8, b.y * TILE + dy * TILE + 8, 1.1, PURPLE, 0.8)
      }
      this.glow(b.door.x * TILE + 8, b.door.y * TILE, 1.8, PURPLE, 0.45)
    }
    // Plaza hedges.
    for (let i = PLAZA.x + 1; i < PLAZA.x + PLAZA.w - 1; i++) {
      if (city.blocked[PLAZA.y]?.[i] || city.ground[PLAZA.y]?.[i] === T.road) continue
      if (i >= 30 && i <= 33) continue
      props.putTileAt(T.hedge[1], i, PLAZA.y)
      props.putTileAt(T.hedge[1], i, PLAZA.y + PLAZA.h - 1)
    }

    // Door signs.
    for (const b of city.buildings) {
      this.add
        .text(b.x * TILE + (b.w * TILE) / 2, b.y * TILE - 3, b.title, {
          fontFamily: 'ui-monospace, Menlo, monospace',
          fontSize: '7px',
          color: b.status === 'planned' ? '#9394a1' : '#ffffff',
          backgroundColor: 'rgba(19,19,22,0.85)',
          padding: { x: 3, y: 2 },
          resolution: 6,
        })
        .setOrigin(0.5, 1)
        .setDepth(60)
    }

    // Player.
    const base = this.opts.avatar
    for (const dir of DIRECTIONS) {
      const f = characterFrames(base, dir)
      this.anims.create({
        key: `walk-${dir}`,
        frames: f.walk.map((frame) => ({ key: 'urban', frame })),
        frameRate: 8,
        repeat: -1,
      })
    }
    this.player = this.physics.add.sprite(
      SPAWN.x * TILE + 8,
      SPAWN.y * TILE + 8,
      'urban',
      characterFrames(base, 'down').idle,
    )
    this.player.setDepth(10)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setSize(10, 8).setOffset(3, 8)
    this.physics.add.collider(this.player, solid)
    this.physics.world.setBounds(0, 0, worldW, worldH)

    // Prompt above the player.
    this.prompt = this.add
      .text(0, 0, '', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '7px',
        color: '#ffffff',
        backgroundColor: '#6c47ff',
        padding: { x: 4, y: 2 },
        resolution: 6,
      })
      .setOrigin(0.5, 1)
      .setDepth(61)
      .setVisible(false)

    // Camera.
    const cam = this.cameras.main
    cam.setBounds(0, 0, worldW, worldH)
    cam.setZoom(this.zoomFor(this.scale.width))
    cam.startFollow(this.player, true, 0.12, 0.12)
    cam.setDeadzone(48, 32)
    cam.fadeIn(600, 19, 19, 22)
    this.scale.on('resize', (size: Phaser.Structs.Size) => cam.setZoom(this.zoomFor(size.width)))

    // Input.
    const kb = this.input.keyboard
    if (kb) {
      this.keys = kb.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.UP,
        down: Phaser.Input.Keyboard.KeyCodes.DOWN,
        left: Phaser.Input.Keyboard.KeyCodes.LEFT,
        right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        e: Phaser.Input.Keyboard.KeyCodes.E,
        enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      }) as CityScene['keys']
      kb.on('keydown-E', () => this.tryEnter())
      kb.on('keydown-ENTER', () => this.tryEnter())
    }
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.frozen) return
      const world = cam.getWorldPoint(pointer.x, pointer.y)
      this.walkTo({ x: Math.floor(world.x / TILE), y: Math.floor(world.y / TILE) })
    })

    if (this.opts.startAt) this.goTo(this.opts.startAt, false)
    this.opts.onReady()
  }

  update() {
    if (this.frozen) {
      this.player.setVelocity(0)
      this.player.anims.stop()
      return
    }
    const body = this.player.body as Phaser.Physics.Arcade.Body
    let vx = 0
    let vy = 0
    const k = this.keys
    if (k) {
      if (k.left.isDown || k.a.isDown) vx -= 1
      if (k.right.isDown || k.d.isDown) vx += 1
      if (k.up.isDown || k.w.isDown) vy -= 1
      if (k.down.isDown || k.s.isDown) vy += 1
    }
    if (vx !== 0 || vy !== 0) {
      this.path = []
      this.pathTarget = null
    } else if (this.path.length) {
      const next = this.path[0] as Point
      const tx = next.x * TILE + 8
      const ty = next.y * TILE + 8
      const dx = tx - this.player.x
      const dy = ty - this.player.y
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
        this.path.shift()
        if (!this.path.length && this.pathTarget) {
          const target = this.pathTarget
          this.pathTarget = null
          this.player.setPosition(tx, ty)
          this.updateNear()
          if (this.near?.slug === target.slug) this.tryEnter()
        }
      } else {
        vx = Math.abs(dx) > 1 ? Math.sign(dx) : 0
        vy = Math.abs(dy) > 1 ? Math.sign(dy) : 0
      }
    }

    const len = Math.hypot(vx, vy) || 1
    body.setVelocity((vx / len) * SPEED, (vy / len) * SPEED)

    if (vx !== 0 || vy !== 0) {
      this.facing = Math.abs(vx) >= Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : vy < 0 ? 'up' : 'down'
      this.player.anims.play(`walk-${this.facing}`, true)
    } else {
      this.player.anims.stop()
      this.player.setFrame(characterFrames(this.opts.avatar, this.facing).idle)
    }

    this.updateNear()
    this.prompt.setPosition(this.player.x, this.player.y - 12)
  }

  /** Freeze while a panel is open: no movement, no taps. */
  setFrozen(frozen: boolean) {
    this.frozen = frozen
    if (frozen) {
      this.path = []
      this.pathTarget = null
    }
  }

  /** Jump to a building's door (deep links) and optionally open it. */
  goTo(slug: string, enter = true) {
    const b = this.opts.map.buildings.find((x) => x.slug === slug)
    if (!b) return
    this.path = []
    this.pathTarget = null
    this.player.setPosition(b.door.x * TILE + 8, b.door.y * TILE + 8)
    this.facing = 'up'
    this.cameras.main.centerOn(this.player.x, this.player.y)
    this.updateNear()
    if (enter) this.opts.onEnter(slug)
  }

  private walkTo(tile: Point) {
    const { map } = this.opts
    const building = buildingAt(map, tile)
    const goal = building ? building.door : nearestOpen(map.blocked, tile)
    if (!goal) return
    const from = { x: Math.floor(this.player.x / TILE), y: Math.floor(this.player.y / TILE) }
    const path = findPath(map.blocked, from, goal, 20000)
    if (!path) return
    this.path = path
    this.pathTarget = building ?? null
  }

  private updateNear() {
    const px = Math.floor(this.player.x / TILE)
    const py = Math.floor(this.player.y / TILE)
    const near =
      this.opts.map.buildings.find((b) => Math.abs(b.door.x - px) + Math.abs(b.door.y - py) <= 1) ?? null
    if (near?.slug !== this.near?.slug) {
      this.near = near
      this.opts.onNear(near?.slug ?? null)
      this.prompt.setVisible(Boolean(near))
      if (near) this.prompt.setText(this.sys.game.device.input.touch ? near.title : `E · ${near.title}`)
    }
  }

  private tryEnter() {
    if (this.frozen || !this.near) return
    this.opts.onEnter(this.near.slug)
  }

  private drawBuilding(layer: Phaser.Tilemaps.TilemapLayer, b: Building) {
    const set = WALLS[b.wall]
    const tiles: number[][] = [
      [set[0][0], T.windowBeige, set[0][2]],
      [T.windowBeige, set[1][1], T.windowBeige],
      [set[2][0], T.doorOrange, set[2][2]],
    ]
    layer.putTilesAt(tiles, b.x, b.y)
    const tint = b.slug === 'build-with-clerk' ? 0xd7d4ff : b.status === 'planned' ? 0x8f90a0 : 0xffffff
    for (let j = 0; j < b.h; j++) {
      for (let i = 0; i < b.w; i++) {
        const tile = layer.getTileAt(b.x + i, b.y + j)
        if (tile) tile.tint = tint
      }
    }
  }

  private zoomFor(width: number) {
    return width < 640 ? 2 : 3
  }

  /** A 32 px radial falloff drawn once; every light is this texture tinted and scaled. */
  private makeGlowTexture() {
    if (this.textures.exists('glow')) return
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    const steps = 10
    for (let i = steps; i >= 1; i--) {
      const t = i / steps
      g.fillStyle(0xffffff, (1 - t) ** 1.6 * 0.5)
      g.fillCircle(16, 16, 16 * t)
    }
    g.generateTexture('glow', 32, 32)
    g.destroy()
  }

  private glow(x: number, y: number, scale: number, color: number, alpha: number) {
    return this.add
      .image(x, y, 'glow')
      .setTint(color)
      .setAlpha(alpha)
      .setScale(scale)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(51)
  }
}
