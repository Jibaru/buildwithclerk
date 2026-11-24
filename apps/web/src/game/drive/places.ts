/**
 * One composed place per project, built from Kenney CC0 kits. Coordinates are metres in the
 * place's local frame: +z faces the road, +x is to the right when looking from the road.
 * `s` is the per-piece scale from kit units to metres (kits were authored at different sizes).
 */
export type Piece = { m: string; x?: number; y?: number; z?: number; rot?: number; s: number }
export type Place = { pieces: Piece[]; water?: { x: number; z: number; r: number } }

const C = 'castle-kit'
const CC = 'city-kit-commercial'
const CS = 'city-kit-suburban'
const CI = 'city-kit-industrial'
const F = 'fantasy-town-kit'
const P = 'pirate-kit'
const SP = 'space-kit'
const R = 'racing-kit'
const G = 'graveyard-kit'
const TR = 'train-kit'
const TD = 'tower-defense-kit'
const W = 'watercraft-kit'
const CAR = 'car-kit'
const H = 'holiday-kit'
const N = 'nature-kit'
const RU = 'retro-urban-kit'
const MM = 'mini-market'
const SV = 'survival-kit'

const p = (kit: string, model: string, s: number, x = 0, z = 0, rot = 0, y = 0): Piece => ({
  m: `${kit}/${model}`,
  s,
  x,
  z,
  rot,
  y,
})

/** Four-storey square tower from the castle kit, stacked by piece height (1.01 u each). */
function castleTower(x: number, z: number, s: number): Piece[] {
  return [
    p(C, 'tower-square-base', s, x, z),
    p(C, 'tower-square-mid', s, x, z, 0, 1.01 * s),
    p(C, 'tower-square-mid-windows', s, x, z, 0, 2.02 * s),
    p(C, 'tower-square-top-roof-high', s, x, z, 0, 3.03 * s),
    p(C, 'flag', s, x, z, 0, 4.3 * s),
  ]
}

function tdTower(x: number, z: number, s: number): Piece[] {
  return [
    p(TD, 'tower-round-base', s, x, z),
    p(TD, 'tower-round-bottom-a', s, x, z, 0, 0.21 * s),
    p(TD, 'tower-round-build-a', s, x, z, 0, 0.81 * s),
    p(TD, 'tower-round-build-a', s, x, z, 0, 1.81 * s),
    p(C, 'flag', s * 0.9, x, z, 0, 2.81 * s),
  ]
}

export const PLACES: Record<string, Place> = {
  // Clerk HQ: a skyscraper flanked by two smaller blocks, taxis out front.
  'build-with-clerk': {
    pieces: [
      p(CC, 'building-skyscraper-a', 12, 0, -6),
      p(CC, 'building-h', 12, -15, 0),
      p(CC, 'building-c', 12, 14, 0),
      p(CC, 'detail-awning-wide', 12, 0, 2.4, 0, 0),
      p(RU, 'tree-park-large', 6, -24, 8),
      p(RU, 'tree-park-large', 6, 24, 8),
      p(RU, 'tree-park-large', 5, -22, -12),
      p(RU, 'tree-park-large', 5, 22, -12),
      p(R, 'lightPostModern', 12, -8, 10, 180),
      p(R, 'lightPostModern', 12, 8, 10, 180),
      p(CAR, 'taxi', 1.7, -10, 12, 90, 0.5),
      p(CAR, 'sedan', 1.7, 10, 12, -90, 0.5),
      p(RU, 'detail-bench', 6, -5, 9, 0),
      p(RU, 'detail-bench', 6, 5, 9, 0),
    ],
  },
  // Last Run: a castle with four towers, walls, a gate and a catapult parked outside.
  'last-run': {
    pieces: [
      ...castleTower(-10, -10, 5),
      ...castleTower(10, -10, 5),
      ...castleTower(-10, 10, 5),
      ...castleTower(10, 10, 5),
      // Back wall and side walls (each segment is 5 m).
      p(C, 'wall', 5, -5, -10),
      p(C, 'wall', 5, 0, -10),
      p(C, 'wall', 5, 5, -10),
      p(C, 'wall', 5, -10, -5, 90),
      p(C, 'wall', 5, -10, 0, 90),
      p(C, 'wall', 5, -10, 5, 90),
      p(C, 'wall', 5, 10, -5, 90),
      p(C, 'wall', 5, 10, 0, 90),
      p(C, 'wall', 5, 10, 5, 90),
      // Front wall with the gate in the middle.
      p(C, 'wall', 5, -5, 10),
      p(C, 'wall', 5, 5, 10),
      p(C, 'wall-doorway', 5, 0, 10),
      p(C, 'wall-doorway', 5, 0, 10, 180),
      // Keep in the middle.
      p(C, 'tower-base', 7, 0, -2),
      p(C, 'tower-slant-roof', 7, 0, -2, 0, 1.31 * 7),
      p(C, 'flag-banner-long', 6, -4, 12, 90),
      p(C, 'flag-banner-long', 6, 4, 12, 90),
      p(C, 'siege-catapult', 4, 18, 8, -30),
      p(C, 'rocks-large', 5, -20, 4),
      p(C, 'tree-large', 5, -20, -8),
      p(C, 'tree-large', 5, 20, -8),
      p(C, 'tree-large', 4, 22, 14),
    ],
  },
  // Couch Code: a suburban house with a comically large dish on the roof.
  'couch-code': {
    pieces: [
      p(CS, 'building-type-u', 10, 0, -2),
      p(SP, 'satelliteDish_detailed', 6, 3, -4, 20, 10.5),
      p(CS, 'driveway-long', 10, 7, 6),
      p(CAR, 'sedan', 1.7, 7, 7, 0, 0.5),
      p(CS, 'fence-low', 10, -8, 5),
      p(CS, 'fence-3x3', 10, -12, -4),
      p(CS, 'tree-large', 10, -11, 6),
      p(CS, 'tree-large', 10, 12, -6),
      p(CS, 'planter', 10, -3, 5),
      p(CS, 'planter', 10, 3, 5),
      p(N, 'flower_redA', 6, -5, 7),
      p(N, 'flower_yellowA', 6, 5, 7),
      p(H, 'bench', 3, -6, 8, 0),
    ],
  },
  // Postal Chess: a small plaza with a fountain, benches and lanterns.
  'postal-chess': {
    pieces: [
      p(F, 'fountain-round-detail', 4, 0, 0),
      p(F, 'stall-bench', 4, -6, 0, 0),
      p(F, 'stall-bench', 4, 6, 0, 180),
      p(F, 'stall-bench', 4, 0, -6, 90),
      p(F, 'stall-bench', 4, 0, 6, -90),
      p(F, 'lantern', 4, -7, -7),
      p(F, 'lantern', 4, 7, -7),
      p(F, 'lantern', 4, -7, 7),
      p(F, 'lantern', 4, 7, 7),
      p(F, 'tree-high', 4, -12, -4),
      p(F, 'tree-high', 4, 12, -4),
      p(F, 'tree', 4, -12, 6),
      p(F, 'tree', 4, 12, 6),
      p(F, 'cart', 4, -9, 2, 30),
      p(C, 'flag', 5, -4, -9),
      p(C, 'flag', 5, 4, -9),
      p(F, 'hedge', 4, -2, -10, 90),
      p(F, 'hedge', 4, 2, -10, 90),
    ],
  },
  // Uptime Pages: a lighthouse on the rocks with a dock and palms.
  'uptime-pages': {
    water: { x: 12, z: 2, r: 12 },
    pieces: [
      p(P, 'patch-sand', 1.6, -2, 0),
      p(P, 'tower-complete-large', 1.6, -2, -4),
      p(P, 'flag-high', 1.6, -2, -4, 0, 16.3),
      p(P, 'rocks-a', 1.6, -10, -2),
      p(P, 'rocks-b', 1.6, 6, -10),
      p(P, 'palm-detailed-straight', 1.6, -9, 6),
      p(P, 'palm-bend', 1.6, 4, -11, 40),
      p(P, 'palm-detailed-bend', 1.6, -12, -9, 200),
      p(P, 'structure-platform-dock', 1.6, 6, 4, 90),
      p(P, 'structure-platform-dock', 1.6, 10, 4, 90),
      p(P, 'boat-row-large', 1.6, 14, 8, 20, 0.2),
      p(P, 'barrel', 1.2, 4, 7),
      p(P, 'crate', 1.2, 2.5, 7),
    ],
  },
  // Relay: an antenna station with hangars and dishes.
  relay: {
    pieces: [
      p(SP, 'platform_large', 5, 0, -4),
      p(SP, 'hangar_smallA', 5, 0, -4),
      p(SP, 'satelliteDish_large', 8, -11, -2, 30),
      p(SP, 'satelliteDish_detailed', 6, 11, -2, -30),
      p(SP, 'machine_generatorLarge', 5, -6, 6),
      p(SP, 'machine_generator', 5, -2, 7),
      p(SP, 'craft_speederA', 4, 11, 7, -20),
      p(SP, 'astronautA', 3, 5, 7, 160, 1.2),
      p(SP, 'turret_single', 5, -14, 7),
      p(SP, 'turret_single', 5, 14, 7),
      p(SP, 'barrels_rail', 5, 7, 2),
      p(SP, 'rock_crystals', 5, -14, -10),
      p(SP, 'rock_crystals', 4, 15, -10),
    ],
  },
  // Till: a market with three stalls, crates and a fruit display.
  till: {
    pieces: [
      p(F, 'stall-red', 4, -6, -1),
      p(F, 'stall-green', 4, 0, -1),
      p(F, 'stall-red', 4, 6, -1),
      p(F, 'cart', 4, 11, 3, 40),
      p(MM, 'display-fruit', 4, -3, 4),
      p(MM, 'display-fruit', 4, 3, 4),
      p(MM, 'shopping-cart', 4, 8, 6, 120),
      p(P, 'crate', 1.5, -10, 2),
      p(P, 'crate', 1.5, -10, 4),
      p(P, 'barrel', 1.5, -11, 6),
      p(P, 'barrel', 1.5, -9, 6),
      p(F, 'lantern', 4, -9, 7),
      p(F, 'lantern', 4, 9, 7),
      p(F, 'tree', 4, -12, -8),
      p(F, 'tree', 4, 12, -8),
      p(F, 'hedge', 4, -6, -7, 90),
      p(F, 'hedge', 4, 0, -7, 90),
      p(F, 'hedge', 4, 6, -7, 90),
    ],
  },
  // Frequency: a radio station with a dish on the roof and a big billboard.
  frequency: {
    pieces: [
      p(CC, 'building-k', 9, 0, -4),
      p(SP, 'satelliteDish_large', 7, -5, -4, 20, 13.3),
      p(SP, 'satelliteDish_detailed', 4, 6, -6, -40, 13.3),
      p(R, 'billboard', 8, 12, 2, 0),
      p(CC, 'detail-awning-wide', 9, 0, 0.3),
      p(R, 'lightPostModern', 12, -9, 8, 180),
      p(R, 'lightPostModern', 12, 9, 8, 180),
      p(RU, 'tree-park-large', 6, -14, 4),
      p(RU, 'detail-dumpster-closed', 6, 10, -9, 90),
      p(CAR, 'van', 1.7, -8, 11, 60, 0.5),
    ],
  },
  // Margin: a café with parasols on the terrace.
  margin: {
    pieces: [
      p(CS, 'building-type-s', 10, 0, -3),
      p(CC, 'detail-parasol-a', 10, -5, 5),
      p(CC, 'detail-parasol-b', 10, 0, 6),
      p(CC, 'detail-parasol-a', 10, 5, 5),
      p(H, 'bench', 3, -5, 7, 0),
      p(H, 'bench', 3, 5, 7, 0),
      p(CS, 'planter', 10, -8, 3),
      p(CS, 'planter', 10, 8, 3),
      p(CS, 'fence-low', 10, -11, -2, 90),
      p(CS, 'tree-large', 10, -12, 6),
      p(CS, 'tree-large', 10, 12, 6),
      p(N, 'flower_purpleA', 6, -9, 8),
      p(N, 'flower_redA', 6, 9, 8),
    ],
  },
  // relay CLI: a pit lane with two garages, race cars and cones.
  'relay-cli': {
    pieces: [
      p(R, 'pitsGarageClosed', 12, -12, 2),
      p(R, 'pitsGarageClosed', 12, 0, 2),
      p(R, 'pitsOffice', 12, 12, 2),
      p(R, 'raceCarRed', 9, -6, 9, 180),
      p(R, 'raceCarGreen', 9, 5, 9, 180),
      p(R, 'flagCheckers', 9, -14, 9),
      p(R, 'flagCheckers', 9, 16, 9),
      p(R, 'pylon', 9, -2, 12),
      p(R, 'pylon', 9, 1, 12),
      p(R, 'pylon', 9, 4, 12),
      p(R, 'barrierRed', 9, -16, 12, 90),
      p(R, 'barrierRed', 9, 18, 12, 90),
      p(R, 'lightPostModern', 12, -18, 4, 180),
      p(R, 'lightPostModern', 12, 20, 4, 180),
      p(R, 'tentLong', 10, 4, -10),
    ],
  },
  // Snips: an industrial workshop with containers and a water tower.
  snips: {
    pieces: [
      p(CI, 'building-g', 9, 0, -4),
      p(CI, 'chimney-medium', 9, 6, -9),
      p(CI, 'shipping-container-a', 2.5, -12, 4, 15),
      p(CI, 'shipping-container-b', 2.5, -12, 4, 15, 3.2),
      p(CI, 'shipping-container-c', 2.5, -13, 10, -10),
      p(CI, 'water-tower', 9, 13, -6),
      p(CI, 'solar-panel-landscape-group', 9, -13, -10),
      p(CI, 'detail-tank', 9, 12, 5),
      p(RU, 'detail-dumpster-open', 6, 7, 7, 30),
      p(RU, 'pallet', 6, -4, 8),
    ],
  },
  // Clip: a train stop with a diesel and three wagons.
  clip: {
    pieces: [
      ...[-25, -15, -5, 5, 15, 25].map((x) => p(TR, 'railroad-straight', 2.5, x - 5, -6, 90)),
      p(TR, 'train-diesel-a', 2.5, -12, -6, 90, 0.9),
      p(TR, 'train-carriage-box', 2.5, -4, -6, 90, 0.9),
      p(TR, 'train-carriage-container-blue', 2.5, 4, -6, 90, 0.9),
      p(TR, 'train-carriage-flatbed', 2.5, 12, -6, 90, 0.9),
      p(P, 'structure-platform', 1.6, -6, 0),
      p(P, 'structure-platform', 1.6, -2, 0),
      p(P, 'structure-platform', 1.6, 2, 0),
      p(P, 'structure-platform', 1.6, 6, 0),
      p(H, 'bench', 3, -4, 1.6, 180, 1.5),
      p(H, 'bench', 3, 4, 1.6, 180, 1.5),
      p(F, 'lantern', 4, -8, 1.5, 0, 1.5),
      p(F, 'lantern', 4, 8, 1.5, 0, 1.5),
      p(SV, 'signpost', 8, 10, 5),
      p(N, 'tree_pineTallA_detailed', 6, -18, 4),
      p(N, 'tree_pineTallA_detailed', 6, 18, 4),
    ],
  },
  // Linker: two towers joined by a bridge.
  linker: {
    pieces: [
      ...tdTower(-10, -2, 5),
      ...tdTower(10, -2, 5),
      p(C, 'bridge-straight', 5, -5, -2, 90),
      p(C, 'bridge-straight', 5, 0, -2, 90),
      p(C, 'bridge-straight', 5, 5, -2, 90),
      p(TD, 'detail-tree-large', 5, -16, 5),
      p(TD, 'detail-tree-large', 5, 16, 5),
      p(TD, 'detail-tree-large', 4, -4, 6),
      p(TD, 'detail-rocks-large', 5, 5, 7),
      p(TD, 'detail-crystal-large', 5, 0, -9),
    ],
  },
  // Concierge: a mansion with a fountain, hedges and two SUVs.
  concierge: {
    pieces: [
      p(CS, 'building-type-u', 14, 0, -6),
      p(F, 'fountain-round-detail', 3, 0, 9),
      p(CS, 'fence-3x3', 14, -16, -4),
      p(CS, 'fence-3x3', 14, 16, -4),
      p(CS, 'tree-large', 14, -12, 8),
      p(CS, 'tree-large', 14, 12, 8),
      p(CS, 'tree-large', 12, -20, -12),
      p(CS, 'tree-large', 12, 20, -12),
      p(CS, 'planter', 10, -6, 2),
      p(CS, 'planter', 10, 6, 2),
      p(CAR, 'suv-luxury', 1.8, -8, 13, 20, 0.55),
      p(CAR, 'suv-luxury', 1.8, 8, 13, -20, 0.55),
      p(H, 'lantern', 3, -4, 14),
      p(H, 'lantern', 3, 4, 14),
      p(F, 'hedge', 4, -10, 4, 0),
      p(F, 'hedge', 4, 10, 4, 0),
    ],
  },
  // Vault: a stone crypt behind iron fences and lamp posts.
  vault: {
    pieces: [
      p(G, 'crypt-large', 6, 0, -3),
      p(G, 'crypt-large-roof', 6, 0, -3, 0, 6),
      ...[-9, -3, 3, 9].map((x) => p(G, 'iron-fence-border', 6, x, 8)),
      p(G, 'iron-fence-border-gate', 6, 0, 8),
      ...[2, -4].map((z) => p(G, 'iron-fence-border', 6, -12, z, 90)),
      ...[2, -4].map((z) => p(G, 'iron-fence-border', 6, 12, z, 90)),
      p(G, 'lightpost-double', 6, -7, 6),
      p(G, 'lightpost-double', 6, 7, 6),
      p(G, 'pillar-obelisk', 6, -5, 2),
      p(G, 'pillar-obelisk', 6, 5, 2),
      p(G, 'pine', 6, -10, -10),
      p(G, 'pine', 6, 10, -10),
      p(G, 'pine', 5, 0, -14),
      p(G, 'gravestone-cross', 4, -3, 4),
      p(G, 'gravestone-round', 4, 3, 4),
      p(G, 'character-keeper', 4, 6, 7, -30, 0.8),
    ],
  },
  // Exodus: a harbour with a cargo ship leaving.
  exodus: {
    water: { x: -4, z: -14, r: 24 },
    pieces: [
      p(W, 'ship-cargo-a', 1.8, -6, -14, 25),
      p(W, 'boat-tug-a', 1.8, 12, -10, -40),
      p(W, 'buoy-flag', 1.8, 8, -22),
      p(W, 'buoy-flag', 1.8, -18, -6),
      p(P, 'structure-platform-dock', 1.6, -4, 2),
      p(P, 'structure-platform-dock', 1.6, 0, 2),
      p(P, 'structure-platform-dock', 1.6, 4, 2),
      p(W, 'cargo-container-a', 1.8, 12, 6, 10),
      p(W, 'cargo-container-b', 1.8, 12, 6, 10, 2),
      p(W, 'cargo-pile-a', 1.8, -12, 6),
      p(P, 'crate', 1.3, 6, 7),
      p(P, 'barrel', 1.3, 8, 7),
      p(P, 'palm-detailed-straight', 1.6, -16, 10),
      p(P, 'palm-bend', 1.6, 16, 10, 180),
      p(SV, 'signpost', 8, -8, 9),
    ],
  },
  // Petdex: a little fair of stalls with a fountain, where the pets live.
  petdex: {
    pieces: [
      p(F, 'fountain-round-detail', 3.5, 0, 2),
      p(F, 'stall-green', 4, -9, -4, 30),
      p(F, 'stall-red', 4, 9, -4, -30),
      p(F, 'stall-green', 4, 0, -8),
      p(F, 'cart', 4, -5, 6, 60),
      p(MM, 'display-fruit', 4, 5, 6),
      p(F, 'lantern', 4, -6, 8),
      p(F, 'lantern', 4, 6, 8),
      p(F, 'hedge', 4, -12, 2, 90),
      p(F, 'hedge', 4, 12, 2, 90),
      p(F, 'tree', 4, -14, -8),
      p(F, 'tree-high', 4, 14, -8),
      p(G, 'character-keeper', 4, 3, 9, 200, 0.8),
      p(N, 'mushroom_redGroup', 6, -10, 7),
      p(N, 'flower_yellowB', 6, 10, 8),
    ],
  },
  // Humans: a downtown office block with a terrace and a park strip.
  humans: {
    pieces: [
      p(CC, 'building-k', 10, -6, -4),
      p(CC, 'building-c', 10, 8, -2),
      p(CC, 'detail-awning-wide', 10, 8, 1.8),
      p(CC, 'detail-parasol-a', 10, -8, 4),
      p(CC, 'detail-parasol-b', 10, -3, 5),
      p(CS, 'planter', 10, 2, 5),
      p(RU, 'detail-bench', 6, 6, 7),
      p(RU, 'detail-bench', 6, -6, 8),
      p(RU, 'tree-park-large', 6, -16, 4),
      p(RU, 'tree-park-large', 6, 17, 4),
      p(R, 'lightPostModern', 12, -11, 10, 180),
      p(R, 'lightPostModern', 12, 11, 10, 180),
      p(CAR, 'sedan', 1.7, 12, 11, 90, 0.5),
    ],
  },
  // Crafter Station: a real station, with a diesel at the platform and a signpost.
  'crafter-run': {
    pieces: [
      ...[-25, -15, -5, 5, 15, 25].map((x) => p(TR, 'railroad-straight', 2.5, x - 5, -8, 90)),
      p(TR, 'train-diesel-a', 2.5, 4, -8, -90, 0.9),
      p(TR, 'train-carriage-box', 2.5, -4, -8, -90, 0.9),
      p(TR, 'train-carriage-flatbed', 2.5, -12, -8, -90, 0.9),
      p(CS, 'building-type-s', 9, 0, 0),
      p(CC, 'detail-awning-wide', 9, 0, 3.5),
      p(P, 'structure-platform', 1.6, -8, -3),
      p(P, 'structure-platform', 1.6, -4, -3),
      p(P, 'structure-platform', 1.6, 0, -3),
      p(P, 'structure-platform', 1.6, 4, -3),
      p(P, 'structure-platform', 1.6, 8, -3),
      p(H, 'bench', 3, -9, 6, 0),
      p(H, 'bench', 3, 9, 6, 0),
      p(SV, 'signpost', 8, 13, 6),
      p(F, 'lantern', 4, -13, 5),
      p(F, 'lantern', 4, 6, 8),
      p(N, 'tree_oak', 6, -18, 2),
      p(N, 'tree_oak', 6, 18, -2),
      p(C, 'flag', 5, -3, 7),
      p(C, 'flag', 5, 3, 7),
    ],
  },
  // Blaze: a data centre, humming: generators, tanks, solar panels and a cooling tower.
  blaze: {
    pieces: [
      p(CI, 'building-g', 9, -3, -4),
      p(CI, 'detail-tank', 9, 10, -6),
      p(CI, 'detail-tank', 9, 14, -6),
      p(CI, 'water-tower', 9, -15, -8),
      p(CI, 'solar-panel-landscape-group', 9, 12, 4),
      p(CI, 'solar-panel-landscape-group', 9, -14, 4),
      p(SP, 'machine_generatorLarge', 5, -6, 6),
      p(SP, 'machine_generator', 5, 0, 7),
      p(SP, 'barrels_rail', 5, 5, 7),
      p(CI, 'chimney-medium', 9, 4, -9),
      p(CS, 'fence-3x3', 10, -10, 9),
      p(CS, 'fence-3x3', 10, 10, 9),
      p(R, 'lightPostModern', 12, -4, 11, 180),
      p(R, 'lightPostModern', 12, 8, 11, 180),
    ],
  },
  // Makeables: a workshop with a long tent, a cart of makes and a shop window.
  makeables: {
    pieces: [
      p(CS, 'building-type-u', 9, -4, -4),
      p(R, 'tentLong', 8, 10, 0, 90),
      p(F, 'cart', 4, 9, 7, 20),
      p(MM, 'display-fruit', 4, 2, 6),
      p(MM, 'shopping-cart', 4, -2, 8, 60),
      p(P, 'crate', 1.4, 5, 6),
      p(P, 'crate', 1.4, 5, 6, 0, 1.4),
      p(P, 'barrel', 1.4, 7, 5),
      p(CS, 'planter', 9, -10, 4),
      p(CS, 'fence-low', 9, -12, 1, 90),
      p(H, 'lantern', 3, -8, 8),
      p(H, 'lantern', 3, 14, 8),
      p(CS, 'tree-large', 9, -15, -6),
      p(F, 'tree', 4, 16, -6),
      p(N, 'flower_purpleB', 6, -6, 9),
    ],
  },
  // Clerk Anywhere: a hangar full of retro hardware: speeder, crystals, antenna, a crew member.
  'clerk-anywhere': {
    pieces: [
      p(SP, 'platform_large', 5, 0, -3),
      p(SP, 'hangar_smallA', 5, 0, -3),
      p(SP, 'satelliteDish_detailed', 6, -10, -1, 30),
      p(SP, 'craft_speederA', 4, 10, 6, 200),
      p(SP, 'astronautA', 3, -4, 7, 160, 1.2),
      p(SP, 'rock_crystals', 5, 12, -10),
      p(SP, 'rock_crystals', 4, -13, -9),
      p(SP, 'machine_generator', 5, 7, -1),
      p(SP, 'barrels_rail', 5, -8, 6),
      p(R, 'billboard', 7, 15, 2, -20),
      p(N, 'rock_largeB', 6, -16, 4),
      p(N, 'rock_tallC', 6, 16, -4),
    ],
  },
  // Clerk Van Run: the paddock. Checkered flags, a grandstand tent and the pit office.
  'clerk-van-run': {
    pieces: [
      p(R, 'pitsOffice', 12, -8, 0),
      p(R, 'tentLong', 10, 8, -6),
      p(R, 'flagCheckers', 9, -16, 8),
      p(R, 'flagCheckers', 9, 16, 8),
      p(R, 'raceCarGreen', 9, 6, 7, 160),
      p(CAR, 'van', 1.7, -2, 8, 190, 0.5),
      p(R, 'pylon', 9, -6, 11),
      p(R, 'pylon', 9, -3, 11),
      p(R, 'pylon', 9, 0, 11),
      p(R, 'barrierRed', 9, -14, 12, 90),
      p(R, 'barrierRed', 9, 14, 12, 90),
      p(R, 'billboard', 8, 16, -4, 20),
      p(R, 'lightPostModern', 12, -18, 2, 180),
      p(R, 'lightPostModern', 12, 18, 2, 180),
    ],
  },
  // C3.chat: a broadcast block, two dishes on the roof, a van outside.
  'c3-chat': {
    pieces: [
      p(CC, 'building-h', 10, 0, -4),
      p(SP, 'satelliteDish_large', 6, -4, -6, 30, 14),
      p(SP, 'satelliteDish_detailed', 4, 5, -6, -30, 14),
      p(CC, 'detail-awning-wide', 10, 0, 0.4),
      p(CC, 'detail-parasol-a', 10, -7, 5),
      p(CC, 'detail-parasol-b', 10, 7, 5),
      p(RU, 'detail-bench', 6, -4, 7),
      p(RU, 'detail-bench', 6, 4, 7),
      p(RU, 'tree-park-large', 6, -14, 4),
      p(RU, 'tree-park-large', 6, 14, 4),
      p(CAR, 'van', 1.7, 10, 11, 70, 0.5),
      p(R, 'lightPostModern', 12, -9, 10, 180),
    ],
  },
  // uploadx: a container yard behind a fence, pallets and a dumpster.
  uploadx: {
    pieces: [
      p(CI, 'shipping-container-a', 2.5, -10, -4, 0),
      p(CI, 'shipping-container-b', 2.5, -10, -4, 0, 3.2),
      p(CI, 'shipping-container-c', 2.5, -3, -6, 10),
      p(CI, 'shipping-container-a', 2.5, 6, -5, -8),
      p(CI, 'shipping-container-c', 2.5, 6, -5, -8, 3.2),
      p(CI, 'shipping-container-b', 2.5, 13, -2, 20),
      p(W, 'cargo-pile-a', 1.8, 0, 2),
      p(RU, 'pallet', 6, -6, 5),
      p(RU, 'pallet', 6, 8, 6),
      p(RU, 'detail-dumpster-open', 6, 14, 6, 30),
      p(CS, 'fence-3x3', 10, -12, 9),
      p(CS, 'fence-3x3', 10, 0, 9),
      p(CS, 'fence-3x3', 10, 12, 9),
      p(R, 'lightPostModern', 12, -16, 2, 180),
      p(R, 'lightPostModern', 12, 17, 2, 180),
    ],
  },
  // Crafter CRM: a suburban office with a driveway and two cars.
  'crafter-crm': {
    pieces: [
      p(CS, 'building-type-s', 11, -2, -4),
      p(CS, 'driveway-long', 10, 9, 5),
      p(CAR, 'sedan', 1.7, 9, 8, 0, 0.5),
      p(CAR, 'suv-luxury', 1.8, 9, 2, 0, 0.55),
      p(CS, 'fence-low', 10, -10, 5),
      p(CS, 'fence-low', 10, -14, 5),
      p(CS, 'planter', 10, -5, 6),
      p(CS, 'planter', 10, 2, 6),
      p(CS, 'tree-large', 10, -14, -6),
      p(CS, 'tree-large', 9, 15, -8),
      p(H, 'bench', 3, -8, 8, 0),
      p(F, 'hedge', 4, -4, 9, 90),
      p(F, 'hedge', 4, 2, 9, 90),
      p(N, 'flower_redB', 6, -7, 9),
    ],
  },
  // Elements: a colonnade around a fountain, each block a pillar.
  elements: {
    pieces: [
      p(F, 'fountain-round-detail', 4, 0, 0),
      ...[-9, -3, 3, 9].map((x) => p(G, 'pillar-obelisk', 6, x, -8)),
      p(G, 'pillar-obelisk', 6, -12, -2),
      p(G, 'pillar-obelisk', 6, 12, -2),
      p(G, 'pillar-obelisk', 6, -12, 5),
      p(G, 'pillar-obelisk', 6, 12, 5),
      p(F, 'hedge', 4, -6, -11, 90),
      p(F, 'hedge', 4, 0, -11, 90),
      p(F, 'hedge', 4, 6, -11, 90),
      p(H, 'bench', 3, -6, 6, 0),
      p(H, 'bench', 3, 6, 6, 0),
      p(F, 'lantern', 4, -8, 8),
      p(F, 'lantern', 4, 8, 8),
      p(F, 'tree-high', 4, -16, -4),
      p(F, 'tree-high', 4, 16, -4),
      p(N, 'flower_purpleC', 6, -3, 8),
      p(N, 'flower_purpleA', 6, 3, 8),
    ],
  },
  // Maca: a recording studio: a low house, a dish, double lamp posts, a lantern.
  maca: {
    pieces: [
      p(CS, 'building-type-u', 10, 0, -3),
      p(SP, 'satelliteDish_detailed', 4, -4, -5, -20, 10.5),
      p(CI, 'solar-panel-landscape-group', 7, 6, -10),
      p(G, 'lightpost-double', 6, -9, 6),
      p(G, 'lightpost-double', 6, 9, 6),
      p(H, 'lantern', 3, 0, 8),
      p(CS, 'planter', 10, -4, 5),
      p(CS, 'planter', 10, 4, 5),
      p(CS, 'fence-low', 10, -11, 2, 90),
      p(CS, 'tree-large', 10, -13, -7),
      p(CS, 'tree-large', 10, 13, -7),
      p(CAR, 'suv-luxury', 1.8, 10, 10, -30, 0.55),
      p(N, 'plant_bushLarge', 6, -8, 9),
      p(N, 'plant_bushLarge', 6, 8, 9),
    ],
  },
  // LaTeX API: a scriptorium. Stone walls, a slanted tower, long banners and stacked logs.
  'latex-api': {
    pieces: [
      p(C, 'tower-base', 7, 0, -4),
      p(C, 'tower-slant-roof', 7, 0, -4, 0, 1.31 * 7),
      p(C, 'wall', 5, -7.5, -4, 90),
      p(C, 'wall', 5, 7.5, -4, 90),
      p(C, 'wall', 5, -5, 1),
      p(C, 'wall-doorway', 5, 0, 1),
      p(C, 'wall', 5, 5, 1),
      p(C, 'flag-banner-long', 6, -4, 3, 90),
      p(C, 'flag-banner-long', 6, 4, 3, 90),
      p(G, 'pillar-obelisk', 6, -10, 6),
      p(G, 'pillar-obelisk', 6, 10, 6),
      p(N, 'log_stack', 6, -12, 0),
      p(N, 'log_large', 6, 12, 2),
      p(C, 'tree-large', 5, -16, -8),
      p(C, 'tree-large', 5, 16, -8),
      p(F, 'lantern', 4, -6, 7),
      p(F, 'lantern', 4, 6, 7),
    ],
  },
}

/** Trees and props scattered along the road between places, from the nature kit. */
export const ROADSIDE_MODELS = {
  trees: [
    'nature-kit/tree_default',
    'nature-kit/tree_oak',
    'nature-kit/tree_pineTallA_detailed',
    'nature-kit/tree_detailed',
    'nature-kit/tree_fat',
  ],
  rocks: [
    'nature-kit/rock_largeA',
    'nature-kit/rock_smallA',
    'nature-kit/plant_bush',
    'nature-kit/flower_redA',
    'nature-kit/mushroom_red',
    'nature-kit/log_stack',
  ],
  lamp: 'racing-kit/lightPostModern',
}

/** Every kit file referenced above and by the vegetation scatter, for the copy script and the preloader. */
export function allModels(): string[] {
  const set = new Set<string>()
  for (const place of Object.values(PLACES)) for (const piece of place.pieces) set.add(piece.m)
  for (const m of [...ROADSIDE_MODELS.trees, ...ROADSIDE_MODELS.rocks, ROADSIDE_MODELS.lamp]) set.add(m)
  return [...set].sort()
}
