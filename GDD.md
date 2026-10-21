# Clerk Drive (Build with Clerk · the landing)

> You drive the Clerk Van around one loop of road. Every place along the road is a product built with Clerk: park at its pad, step in, and take its key.

| | |
| --- | --- |
| Engine | Three.js r186 inside the Next.js 16 site at `apps/web` (no physics engine; arcade bicycle model) |
| Platform | web: desktop with keyboard, phones with tap-to-drive |
| View | third-person chase camera behind the van (Crazy Taxi / GTA III style), FOV 50 widening with speed |
| Scope | a hub, not a racing game: one loop, sixteen places, zero failure states |
| References | the Clerk Van viewer (lime ground, soft sun, ACES), Crazy Taxi (chase cam, pick-ups), Kenney kits (toy diorama look) |

The landing page **is** the drive: `/` is the canvas, full viewport, no scroll. "All projects" in the HUD lists every place and the van drives there by road. `/p/[slug]` is the full page and `/?at=slug` parks you at a place with its panel open. Everything reads the project registry.

## Core loop

Walk to a building (5–15 s). Read its door sign, press E, and a panel slides over the canvas with the project page: what it shows, key code moments, live demo, repo. Open the live demo, sign in, and the demo shows a pixel key with a short code. Come back, hand the code to the building, and it lights up: key collected, XP gained, maybe an achievement. The district's music keeps you walking to the next door.

## First 30 seconds

1. Night-time pixel city fades in from black over 0.6 s; Clerk HQ sits in the plaza under the title "Clerk City". Music is off. A HUD at the bottom shows keys `0/7`, XP `0`, and a play button for the music.
2. The player stands in front of Clerk HQ. A floating hint says "WASD or arrows to walk · E to enter" (desktop) or "Tap anywhere to walk" (touch). Moving dismisses it.
3. The nearest building (Last Run, in the Arcade district north of the plaza) has a glowing door sign. Walking into its door zone shows the prompt "E · Last Run".
4. Pressing E opens the project panel. Closing it with Esc grants the first XP (+10, "visited") with a soft chime, and the HUD counter ticks up.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Accelerate / reverse | W / S or ↑ / ↓ | tap a place or the road: the van drives there by road |
| Steer | A / D or ← / → | automatic while driving to a tap target |
| Brake | Space | automatic at the pad |
| Enter the place | E / Enter at a pad | the van opens the place on arrival |
| Close panel | Esc | tap outside / swipe down |

Arcade car: 9 m/s² accel, 16 m/s top speed on asphalt and 9 m/s on grass, 32° max steer with a 3.75 m wheelbase bicycle model, steering authority scaled by speed so the van never spins in place. Wheels roll and the front pivots steer using the model's `Wheel_*` and `Steer_*` nodes.

## Mechanics

### Places and the project panel

- The track is a closed Catmull-Rom loop (~700 m). Place *i* sits at arc ratio `(i+0.5)/16`, alternating left and right, 34 m from the centreline, with a 5 m driveway to a purple parking pad 15 m out. Planned projects get a gray pad and desaturated models.
- Each place is composed from Kenney kit pieces in `apps/web/src/game/drive/places.ts` (castle with four towers for Last Run, a lighthouse on the rocks for Uptime Pages, an antenna station for Relay, a pit lane for relay CLI, a crypt behind iron fences for Vault, a harbour with a cargo ship for Exodus, a mansion for Concierge, and so on). A floating sign names it.
- Within 7 m of a pad the HUD shows "Press E to enter". E opens the HTML panel with the project; the URL becomes `/?at=<slug>`; the van freezes while the panel is open.
- The van cannot drive through a place: a circle-versus-box push keeps it outside each place's footprint.

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

### The van

- `public/models/clerk_van.glb`: the Clerk Van (Ford Transit with the Clerk livery), compressed from 14 MB to 2.75 MB with meshopt and WebP. Headlights on, doors closed. Door clips exist in the model for later (open the sliding door at a pad).

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

- **Style**: toy diorama. Flat lime ground `#7cff00` (the Clerk Van viewer's background), textured asphalt loop with white edge lines and a dashed centre line, Kenney low-poly kits for every place, the detailed van as the only high-poly object.
- **Light**: one warm sun (2.4) with 2048² shadows following the van, a sky/ground hemisphere light, a soft fill. ACES tone mapping, exposure 1. Lime fog from 160 m hides the edge of the world.
- **Readability**: the road is the only dark surface, so it always reads. Purple appears only on pads, the HUD and the van. Signs are white-on-gray-950 sprites that always face the camera.
- **UI / HUD**: clerk.com-style dark pills: logo top-left; All projects, GitHub, language and sign-in top-right; keys counter plus the contextual hint bottom-left; controls bottom-right. Project panel slides from the right (bottom sheet on phones).

## Audio

- **Music**: six original loops of about 90 s generated with Suno, off by default, remembered per device. Plaza: main theme, warm synth. Arcade: synthwave with chiptune leads. Downtown: lofi jazz. Market: lofi with Latin percussion. Broadcast: dreamy synth pads. Terminal: minimal techno. Crossfade 1.5 s on district change.
- **SFX** (synthesized with `game-assets/scripts/sfx.mjs`): `step-a`, `step-b`, `prompt-show`, `panel-open`, `panel-close`, `xp-tick`, `key-redeem`, `achievement`, `founder-fanfare`, `ui-hover`, `ui-click`.

## Assets

| Key | Description | Source | Status |
| --- | --- | --- | --- |
| clerk_van | The van, rigged pivots, 139k tris | jibaru/clerk-van (CC BY 4.0 base model) | done |
| kits/* | 133 low-poly pieces across 18 Kenney kits, copied by `scripts/copy-kits.ts` | kenney:* (CC0) | done |
| road texture | Asphalt with lines, drawn on a canvas at runtime | procedural | done |
| signs | Canvas sprites per place | procedural | done |
| music-* | Six loops, see Audio | generate (Suno) | todo |
| sfx-* | Engine loop, horn, pad chime, panel open/close, key | synthesize | todo |

Credits ship in `apps/web/public/models/CREDITS.md`.

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
- 2026-10-21: rebuilt in 3D as Clerk Drive: the Clerk Van on a single road loop with one detailed Kenney-kit place per project, chase camera, tap-to-drive autopilot. The Phaser city and the tile map are gone.
- 2026-10-19: the city became the landing page itself (no gallery grid). Map generated procedurally from the registry (`apps/web/src/game/citymap.ts`): plaza + fountain, six 2-tile roads, pavement, BFS-paved paths to every door, lamps and trees. Buildings are 3×3 wall sets from kenney:rpg-urban-pack with a door and three windows; planned projects render gray. Player avatars come from the same pack (6 characters, 4 directions, 3 frames). M1 and M3 merged accordingly.
