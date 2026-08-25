# Infinite Illustrated World Engine

A data-driven Phaser engine for seamless, horizontally scrolling illustrated worlds. Rendering, recycling, traffic, environment, triggers, scheduling, seeded randomness, and performance management stay in the engine; each world's scenery and behavior live in content packs and configuration.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/` to choose a world and seed. Direct links also work:

`http://127.0.0.1:5173/?world=silhouette-fantasy-city&seed=12345`

Append `&debug=1` to expose the developer-only chunk-boundary overlay.

## Visual builder

Open `http://127.0.0.1:5173/builder.html` or choose **Open Builder** from the world selector.

1. Load a reference world.
2. Adjust its style, layers, world composition, and traffic while the real Phaser runtime previews the result.
3. Validate scale, seams, repetition, traffic, and performance limits.
4. Export the project.

The bottom action rail provides three outputs:

- **Project files** downloads `builder-project.json`, `pack.json`, and `world.json`. Uploaded layer, style-guide, and architecture images are embedded in the builder project and survive import/export.
- **Scroller ZIP** produces a no-build static site containing `index.html`, `styles.css`, `scroller.js`, configuration, and copied assets. It can be opened locally or published on any static host without Phaser or this repository.
- **Install world** is available while running the Vite development server. It writes the authored pack under `authoring/packs`, prepares its assets, registers it with the engine, and opens the installed world.

The builder intentionally covers the common visual-authoring workflow. Advanced triggers, paths, sequences, environments, and rare events remain configuration-driven.

## Create and install an asset pack from the command line

```bash
npm run pack:new -- my-world
# Add my-world/style-guide.png and source artwork under my-world/assets, then edit both JSON files.
npm run pack:validate -- my-world
npm run pack:install -- my-world
```

Open `http://127.0.0.1:5173/?world=my-world&seed=12345&calibrate=1` to inspect ground anchors, canonical human/door scale, traffic lanes, and background seams. Installation prepares the images and generates content registration; engine code does not need to change.

The complete format and design rules are in [docs/asset-pack-authoring.md](docs/asset-pack-authoring.md). The JSON schema is [schemas/world-pack.schema.json](schemas/world-pack.schema.json).

## Architecture

- `src/engine/contracts`: generic data contracts (`Entity`, `Chunk`, `Action`, `Trigger`, environment, traffic, assets).
- `src/engine/core`: registries, pack composition, validation, loading, and seeded randomness.
- `src/engine/systems`: renderer-independent clock, chunk selection, events, triggers, and actions.
- `src/engine/runtime`: the disposable Phaser view, camera, parallax, recycling, input, and performance boundary.
- `src/content/packs`: reusable assets. Later themes can depend on and override compatible packs.
- `src/content/worlds`: world templates and their authored/procedural chunk plans.

## Add a world

1. Create a scaffold with `npm run pack:new -- <world-id>`.
2. Supply assets and define the pack and world in JSON.
3. Validate and install with `npm run pack:install -- <directory>`.
4. Load it with `?world=<world-id>&seed=<seed>`.

No render-loop, camera, scheduler, trigger, or chunk-lifecycle changes should be required.

Worlds may opt into continuous movement with `camera.autoScrollSpeed`; keyboard, wheel, and drag input remain generic engine behavior.

## Included worlds

- `silhouette-fantasy-city` — flagship authored fantasy world with environmental and rare-event integration.
- `fantasy-city` — original fantasy-city pack.
- `fifth-element-city` — vertical retro-futurist traffic world.
- `coruscant-city` — layered aerial-metropolis world.
- `evention-typographic` and `evention-typographic-color` — typographic parallax compositions.
- `evention-chicago` — Chicago river composition.
- `runtime-verification` — compact integration fixture and executable engine specification.
