# Clerk City (Build with Clerk · World mode)

> You are a developer arriving in Clerk City. Visit every building, try the product inside, and collect its key to unlock the whole city.

| | |
| --- | --- |
| Engine | Phaser 4 (inside the Next.js 16 site at `apps/web`) |
| Platform | web: desktop browsers with keyboard/gamepad, mobile browsers with touch |
| View | 2D top-down, 16 px tiles rendered at ×3 (×2 on phones) |
| Scope | weekend-prototype sized hub, not a game with difficulty: one map, one screen per building, zero extra systems |
| References | Pokémon-style portfolio sites (walkable index), Poolsuite.net (persistent music player as identity), clerk.com (chrome, palette, motion) |

The city **is** the landing page: `/` is the map, full viewport, no scroll. There is no separate gallery grid; the accessible "All projects" list in the HUD and the per-project pages at `/p/[slug]` are the non-game twins. Everything reads the project registry (`packages/registry`).

## Core loop

Walk to a building (5–15 s). Read its door sign, press E, and a panel slides over the canvas with the project page: what it shows, key code moments, live demo, repo. Open the live demo, sign in, and the demo shows a pixel key with a short code. Come back, hand the code to the building, and it lights up: key collected, XP gained, maybe an achievement. The district's music keeps you walking to the next door.

## First 30 seconds

1. Night-time pixel city fades in from black over 0.6 s; Clerk HQ sits in the plaza under the title "Clerk City". Music is off. A HUD at the bottom shows keys `0/7`, XP `0`, and a play button for the music.
2. The player stands in front of Clerk HQ. A floating hint says "WASD or arrows to walk · E to enter" (desktop) or "Tap anywhere to walk" (touch). Moving dismisses it.
3. The nearest building (Last Run, in the Arcade district north of the plaza) has a glowing door sign. Walking into its door zone shows the prompt "E · Last Run".
4. Pressing E opens the project panel. Closing it with Esc grants the first XP (+10, "visited") with a soft chime, and the HUD counter ticks up.

## Controls

| Action | Keyboard | Gamepad | Touch |
| --- | --- | --- | --- |
| Move | WASD / arrows | left stick / d-pad | tap a tile: walk there with grid pathfinding |
| Interact / enter building | E / Enter | A | tap the building |
| Close panel | Esc | B | tap outside the panel / swipe down |
| Toggle music | M | Y | HUD button |
| Open profile (Clerk HQ) | P | start | HUD avatar |

Movement is grid-free, 8-direction, speed 96 px/s at ×1 scale (tune). Collision uses a tile layer. The camera follows with a 48×32 px deadzone (tune) and clamps to the map bounds.

## Mechanics

### Buildings and the project panel

- Each registry entry with `city.position` becomes a building: a 48×48 or 64×64 hero sprite, a door zone of 1×1 tile in front, and a door sign showing the project title and platform icon.
- Entering the door zone shows the interact prompt. E opens an HTML panel (not a Phaser scene) rendering the same component as `/p/[slug]`. The URL becomes `/city?at=<slug>` so the state is shareable; loading that URL spawns the player at the door and opens the panel.
- While the panel is open the game loop pauses and keyboard focus moves to the panel.
- Buildings for projects not yet shipped render as scaffolding with a "Coming soon" sign and cannot be entered.

### Keys

- Every live demo mounts a `<ClerkKey />` component after sign-in. It renders a pixel key and a 6-character code derived server-side: `HMAC(projectSecret, siteUserId + dayBucket)`, truncated and base32 encoded.
- The site user id is carried to the demo through the "Live demo" link (`?bwc=<opaque token>`), so the demo can compute a code for that specific visitor. Visitors who open a demo directly see a key with a code that redeems for anyone who signs in with the same email, as a fallback.
- Handing a code to a building posts to `/api/keys/redeem`; the server recomputes the HMAC and grants the key once per project per user.
- Demo users (the "Try as demo user" sign-in token path) are never granted keys.
- XP: visit a building 10, open the code tab in the panel 20, redeem a key 100 (tune).

### Achievements

- `first-key`: redeem any key.
- `district-<name>`: all shipped buildings in a district have their keys.
- `founder`: every shipped key collected. Clerk HQ's roof lights up.
- `audiophile` (secret): hear all six tracks for at least 30 s each.
- Achievements and XP are stored server-side keyed by Clerk user id. Anonymous visitors accumulate in a signed cookie; creating an account migrates the cookie state.

### Avatar

- First entry to the city picks one of 8 characters from `kenney:roguelike-characters`. Signed-in users store the choice in Clerk `publicMetadata.avatar`; anonymous users get a random one that follows them into the account they create.

## Win, fail, restart

- **Fail**: none. Nothing in the city can hurt you.
- **Win**: all shipped keys → `founder` achievement, HQ roof lights, a short fanfare, and a shareable card at `/u/<username>`.
- **Restart**: not applicable. Progress is permanent per account.

## Challenge and progression

There is no difficulty curve. Progression is the key count and the growing set of lit buildings. New projects ship as new buildings, so the city grows over time and `founder` can be lost and regained, which is intentional: the badge shows the date it was last earned.

## Game feel

- Footstep SFX alternate left/right every 0.22 s while moving (tune); dust puff particle every 4th step.
- Door prompt pops in with a 0.2 s ease-out-cubic scale from 0.9 (Clerk's house easing).
- Panel open: slide up 24 px + fade over 0.3 s; canvas behind dims to 60 % and blurs 2 px.
- Key redeemed: 0.08 s hit-stop, building windows flash from warm to purple `#6c47ff`, 24 purple sparkle particles, camera shake 2 px for 0.15 s, chime SFX, HUD counter ticks with a spring.
- Achievement: toast slides from the top in Clerk's card style; `founder` adds a 2 s fireworks burst over HQ.
- District boundary: current track crossfades to the district track over 1.5 s; the district name letter-reveals at the top for 2 s.
- `prefers-reduced-motion`: no shake, no particles, instant panel, static hero image on `/`.

## Art direction

- **Style**: 16 px pixel art, Kenney packs, rendered at night. No recoloring of the packs; the Clerk identity comes from lighting.
- **Palette**: `#131316` sky/background (gray-950) · `#230b6a` ambient tint (purple-950) · `#6c47ff` window and lamp light (purple-500) · `#00aee3` signs and water (sky-500) · `#d9d9de` text and UI hairlines (gray-200) · `#ffffff` HUD text · `#22c543` reserved for "key collected"
- **Readability**: the player is the only sprite with a white 1 px outline. Enterable doors glow; non-enterable buildings do not. Text never sits directly on tiles, always on a translucent gray-950 plate.
- **Resolution / camera**: tilemap 64×40 tiles (1024×640 px). Canvas fills the viewport; zoom ×3 on desktop, ×2 under 640 px wide. Pixel-perfect rendering, nearest-neighbour, no sub-pixel camera positions. Night is a multiply rectangle (`#8b82d6`) over the world plus additive radial glows: purple on lit windows and doors, warm on lamps.
- **UI / HUD**: bottom bar, 56 px tall, gray-950 at 80 % with a 0.5 px top hairline: avatar + name (or "Guest"), keys `n/N` with a pixel key icon, XP, music play/pause with the track name in Söhne Mono uppercase, and "Exit city". Top-left: current district name on entry. Everything else is in the project panel.
- **Map layout**: plaza in the centre with Clerk HQ; districts in a star: Arcade north, Terminal north-east, Downtown east, Market south, Broadcast west. Each district has room for 3–4 buildings. Roads are 2 tiles wide, lit by lamps every 6 tiles.

## Audio

- **Music**: six original loops of about 90 s generated with Suno, off by default, remembered per device. Plaza: main theme, warm synth. Arcade: synthwave with chiptune leads. Downtown: lofi jazz. Market: lofi with Latin percussion. Broadcast: dreamy synth pads. Terminal: minimal techno. Crossfade 1.5 s on district change.
- **SFX** (synthesized with `game-assets/scripts/sfx.mjs`): `step-a`, `step-b`, `prompt-show`, `panel-open`, `panel-close`, `xp-tick`, `key-redeem`, `achievement`, `founder-fanfare`, `ui-hover`, `ui-click`.

## Assets

| Key | Description | Source | Status |
| --- | --- | --- | --- |
| tiles-urban | Streets, sidewalks, grass, water, walls, doors, windows, lamps, trees | kenney:rpg-urban-pack | done |
| tiles-city | Modern props, lamps, signs, vehicles | kenney:roguelike-modern-city | todo |
| characters | 6 player avatars, 4 directions × 3 frames, columns 23–26 of the sheet | kenney:rpg-urban-pack | done |
| building-hq | Clerk HQ, 64×64, lit roof variant | generate (PixelLab) or hand-drawn | todo |
| building-lastrun | Arcade hall with neon marquee, 48×48 | generate | todo |
| building-couchcode | Living-room facade with a giant TV, 48×48 | generate | todo |
| building-uptime | Glass office tower with status lights, 48×64 | generate | todo |
| building-frequency | Radio station with antenna, 48×64 | generate | todo |
| building-relay | Terminal-green workshop with cable spools, 48×48 | generate | todo |
| building-till | Corner shop with awning and till in the window, 48×48 | generate | todo |
| building-scaffold | Generic "coming soon" scaffolding, 48×48 | generate or hand-drawn | todo |
| key-pixel | The key icon, 16×16, also used by `<ClerkKey />` in demos | hand-drawn | todo |
| music-* | Six loops, see Audio | generate (Suno) | todo |
| sfx-* | Eleven effects, see Audio | synthesize | todo |

Credits land in `apps/web/public/assets/CREDITS.md` via `game-assets`.

## Milestones

1. **M1: Core verb**: the player walks on a placeholder tilemap with collision, camera follow and deadzone, keyboard and tap-to-walk. No buildings. Screenshot: a character on a grey grid.
2. **M2: Loop**: one building (Last Run) with a door zone, prompt, HTML panel open/close with URL sync, and the visit XP tick. Screenshot: panel open over the dimmed city.
3. **M3: Content**: the real 64×40 map with five districts, night lighting, all v1 buildings (shipped or scaffold), avatar picker, keys redeemable end to end against one live demo, achievements persisted.
4. **M4: Juice and ship**: six tracks with crossfade, all SFX, particles and shake, reduced-motion path, static hero fallback, gamepad, `/u/<username>` card.

## Out of scope for v1

- Other players visible in real time ("ghosts"). Planned for v2 on the Go server from Couch Code.
- Building interiors as Phaser scenes. The panel is the interior.
- Virtual d-pad on touch. Tap-to-walk only.
- Avatar customization beyond the 8 presets.
- Day/night cycle. It is always night.
- Quests or NPC dialogue.

## Changelog

- 2026-10-19: GDD created after a three-round design interview.
- 2026-10-19: the city became the landing page itself (no gallery grid). Map generated procedurally from the registry (`apps/web/src/game/citymap.ts`): plaza + fountain, six 2-tile roads, pavement, BFS-paved paths to every door, lamps and trees. Buildings are 3×3 wall sets from kenney:rpg-urban-pack with a door and three windows; planned projects render gray. Player avatars come from the same pack (6 characters, 4 directions, 3 frames). M1 and M3 merged accordingly.
