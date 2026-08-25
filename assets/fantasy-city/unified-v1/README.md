# Fantasy City Unified V1

`master-panorama-style-guide.png` is the authoritative visual reference for this pack. Every active source asset was generated from scratch with that image supplied as its only visual reference.

- `sources/` preserves full-resolution generations and alpha-cleaned derivatives.
- `runtime/` contains normalized, anchored shipping assets.
- `approval-preview.jpg` shows the layers and representative assets at runtime scale.
- `archive/pre-guide/` preserves excluded experiments; nothing there is registered or rendered.

New assets must match the panorama's palette, outline weight, material treatment, detail density, night lighting, and shared bottom-center ground anchor. Runtime behavior and reuse are defined by typed recipes in `src/content/packs/fantasyCityUnifiedV1.ts`.
