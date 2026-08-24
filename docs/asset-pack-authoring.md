# Asset-pack authoring

New worlds are content. They do not require edits to the renderer, camera, chunk recycler, scheduler, trigger engine, traffic system, or animation runtime.

## Fast path

```bash
npm run pack:new -- my-world
# Add my-world/style-guide.png and source PNGs under my-world/assets, then edit its two JSON files.
npm run pack:validate -- my-world
npm run pack:install -- my-world
npm run dev
```

Open `http://127.0.0.1:5173/?world=my-world&seed=12345&calibrate=1`. Remove `&calibrate=1` for the presentation view.

`pack:install` prepares PNGs, copies the style guide and runtime assets, writes a generated TypeScript content module, and rebuilds the generated registry. Handwritten engine registration is not required.

## Minimum silhouette screensaver pack

- One approved master panorama used as the reference for every asset.
- Three or four background bands: opaque sky, one or two transparent scenery bands, and ground/street.
- At least eight unique architecture assets.
- Canonical people at 100 world pixels tall; 85–115 is accepted.
- Doors designed around 135 world pixels tall.
- Bottom-center anchors for everything that touches the ground.
- At most five simultaneous traffic movers: two road movers and three sky movers, with at most one per direction per route.
- Every route declares `zone` (`ground` or `sky`) and `distance` (`near`, `mid`, or `far`). Distance consistently controls scale, depth, contrast, apparent speed, and spawn frequency.
- Traffic spawn intervals of at least seven seconds.
- Local animation at 4–8 fps. Six fps is the default.
- No vehicles, people, bats, or other moving objects baked into backdrops.
- An authored cycle wider than 1920px, with no architecture duplicate within any 1920px window.

## Image preparation

Each asset's `prepare` block can apply:

- `trim`: crop transparent padding.
- `width`, `height`, or `maxSize`: normalize runtime scale while preserving aspect ratio when only one dimension is supplied.
- `crop: [x, y, width, height]`: isolate a useful band before other processing.
- `cleanEdge`: contract alpha to remove generated light fringes.
- `seamWidth`: reconcile left and right edges for horizontal tiling.
- `frames`, `cellWidth`, `cellHeight`: split a horizontal source strip, apply one shared scale, bottom-center every frame, and assemble a stable runtime spritesheet.

The image preparation script requires Python 3 and Pillow. It never modifies source artwork.

## Calibration view

- Gold: shared building/sidewalk ground line.
- Green: traffic and ambient motion paths.
- Pink: background repeat boundaries.
- Blue: canonical 100px human ruler.
- Violet: canonical 135px doorway ruler.

Use this view to correct manifests and source preparation settings. Do not compensate for bad source scale with unrelated engine changes.

## Files produced by installation

- `public/assets/<pack-id>/v<version>/style-guide.png`
- `public/assets/<pack-id>/v<version>/runtime/*`
- `src/content/generated/<world-id>.ts`
- `src/content/generated/index.ts`

Generated files can be committed. Re-running installation is deterministic for the same source images and manifests.

## Validation failures

Installation stops before registration when it finds missing assets, duplicate IDs, invalid anchors, missing style guides, too few architecture variants, invalid animation cells, excessive traffic, missing entity/chunk references, or architecture that repeats inside a 1920px view. Large textures and short authored cycles are reported as warnings.
