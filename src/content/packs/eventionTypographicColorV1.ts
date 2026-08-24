import type { AssetPack } from '../../engine/contracts/world';

const ROOT = '/assets/evention-typographic-color/v1';

export const eventionTypographicColorV1Pack: AssetPack = {
  id: 'evention-typographic-color-v1',
  version: 1,
  compatibility: { provides: ['typographic', 'brand', 'evention-color', 'screensaver'] },
  style: {
    guide: `${ROOT}/master-panorama-style-guide.svg`,
    palette: { black: 0x020203, navy: 0x001451, green: 0x54e577 },
    outline: { color: 0x54e577, relativeWeight: 0.006 },
    detail: 'low',
    groundAnchor: 'bottom-center',
  },
  assets: [
    { id: 'evention-color-black-field', source: `${ROOT}/runtime/black-field.svg`, metadata: { role: 'backdrop', opaque: true, seamlessWidth: 1920, bakedMovingObjects: false } },
    { id: 'evention-color-trust-deep', source: `${ROOT}/runtime/trust-deep.svg`, metadata: { role: 'deep-message-typography', seamlessWidth: 1920, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'evention-color-products-far', source: `${ROOT}/runtime/products-far.svg`, metadata: { role: 'far-typography', seamlessWidth: 1920, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'evention-color-systems-layer', source: `${ROOT}/runtime/systems-layer.svg`, metadata: { role: 'systems-typography', seamlessWidth: 1920, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'evention-color-products-mid', source: `${ROOT}/runtime/products-mid.svg`, metadata: { role: 'mid-typography', seamlessWidth: 1920, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'evention-color-outcomes-layer', source: `${ROOT}/runtime/outcomes-layer.svg`, metadata: { role: 'outcomes-typography', seamlessWidth: 1920, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'evention-color-mark', source: `${ROOT}/runtime/evention-mark.svg`, metadata: { role: 'brand-mark', transparent: true, seamlessWidth: 1920, bakedMovingObjects: false } },
    { id: 'evention-color-word', source: `${ROOT}/runtime/evention-word.svg`, metadata: { role: 'hero-typography', transparent: true, seamlessWidth: 1920, bakedMovingObjects: false } },
  ],
  recipes: [],
};
