# Infinite Illustrated World Engine

A data-driven, horizontally scrolling 2D world engine. The repository ships one content template, `fantasy-city`, but the runtime contains no fantasy-specific systems.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/?world=fantasy-city&seed=12345`.

Append `&debug=1` to expose the developer-only chunk-boundary overlay.

## Create and install an asset pack

Open the visual builder at `http://127.0.0.1:5173/builder.html`, or use the command-line workflow below.

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
