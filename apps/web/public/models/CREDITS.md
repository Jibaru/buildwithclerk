# Model credits

- **clerk_van.glb**: "Clerk Van" by Jibaru (https://github.com/Jibaru/clerk-van), built on
  "Ford Transit With Light Bar" by circlegent (Sketchfab), licensed CC BY 4.0.
  Livery: Clerk brand assets. Rigged pivots: doors, wheels, steering, lights. Compressed here
  with gltf-transform (meshopt + WebP).
- **kits/**: low-poly models from Kenney (https://kenney.nl), all CC0 1.0: Castle Kit,
  City Kit (Commercial, Suburban, Industrial), Fantasy Town Kit, Pirate Kit, Space Kit,
  Racing Kit, Graveyard Kit, Train Kit, Tower Defense Kit, Watercraft Kit, Car Kit,
  Holiday Kit, Nature Kit, Retro Urban Kit, Mini Market, Survival Kit. Only the files the
  places use are shipped; `apps/web/scripts/copy-kits.ts` regenerates this folder.

# Texture credits (public/textures)

- **alps_field/alps_field_2k.hdr**: "Alps Field" HDRI by Poly Haven (https://polyhaven.com/a/alps_field), CC0. Sky, image-based lighting and fog colour.
- **asphalt_02/**: "Asphalt 02" by Poly Haven (https://polyhaven.com/a/asphalt_02), CC0. Road surface (diffuse, normal, ARM), downscaled to 512 px.
- **Grass005/**, **Ground037/**, **Rock051/**: ambientCG (https://ambientcg.com), CC0. Terrain splat sets (Color, NormalGL, Roughness), downscaled to 512 px.
- **Gravel023/**: ambientCG (https://ambientcg.com/view?id=Gravel023), CC0. Road shoulders and driveways, downscaled to 512 px.
- **real/**: photoscanned plants and rocks from Poly Haven (CC0): fern_02, grass_medium_01/02,
  dandelion_01, nettle_plant, flower_heliophila, rock_07, rock_09, stone_01, boulder_01,
  namaqualand_boulder_02/04/06, dead_tree_trunk, fir_sapling. Decimated with gltf-transform
  `simplify` and compressed with meshopt + WebP for the web.
- **Trees**: generated at runtime with ez-tree by Dan Greenheck (MIT), bark and leaf textures
  bundled with the library.
