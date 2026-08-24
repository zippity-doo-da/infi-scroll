import type { AssetPack } from '../../engine/contracts/world';

const ROOT = '/assets/evention-typographic/v1';

export const eventionTypographicV1Pack: AssetPack = {
  id: 'evention-typographic-v1',
  version: 1,
  compatibility: { provides: ['typographic', 'brand', 'monochrome', 'screensaver'] },
  style: {
    guide: `${ROOT}/master-panorama-style-guide.svg`,
    palette: { black: 0x020203, white: 0xffffff, charcoal: 0x101114 },
    outline: { color: 0xffffff, relativeWeight: 0.006 },
    detail: 'low',
    groundAnchor: 'bottom-center',
  },
  assets: [
    { id: 'evention-black-field', source: `${ROOT}/runtime/black-field.svg`, metadata: { role: 'backdrop', opaque: true, seamlessWidth: 1920, bakedMovingObjects: false } },
    { id: 'evention-trust-deep', source: `${ROOT}/runtime/trust-deep.svg`, metadata: { role: 'deep-message-typography', seamlessWidth: 1920, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'evention-products-far', source: `${ROOT}/runtime/products-far.svg`, metadata: { role: 'far-typography', seamlessWidth: 1920, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'evention-systems-layer', source: `${ROOT}/runtime/systems-layer.svg`, metadata: { role: 'systems-typography', seamlessWidth: 1920, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'evention-products-mid', source: `${ROOT}/runtime/products-mid.svg`, metadata: { role: 'mid-typography', seamlessWidth: 1920, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'evention-outcomes-layer', source: `${ROOT}/runtime/outcomes-layer.svg`, metadata: { role: 'outcomes-typography', seamlessWidth: 1920, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'evention-word', source: `${ROOT}/runtime/evention-word.svg`, metadata: { role: 'hero-typography', transparent: true, seamlessWidth: 1920, bakedMovingObjects: false } },
    { id: 'evention-letter-e', source: `${ROOT}/runtime/letter-e.svg`, metadata: { role: 'brand-letter', transparent: true } },
    { id: 'evention-letter-v', source: `${ROOT}/runtime/letter-v.svg`, metadata: { role: 'brand-letter', transparent: true } },
    { id: 'evention-letter-n', source: `${ROOT}/runtime/letter-n.svg`, metadata: { role: 'brand-letter', transparent: true } },
    { id: 'evention-letter-t', source: `${ROOT}/runtime/letter-t.svg`, metadata: { role: 'brand-letter', transparent: true } },
    { id: 'evention-letter-i', source: `${ROOT}/runtime/letter-i.svg`, metadata: { role: 'brand-letter', transparent: true } },
    { id: 'evention-letter-o', source: `${ROOT}/runtime/letter-o.svg`, metadata: { role: 'brand-letter', transparent: true } },
  ],
  recipes: [
    { id: 'evention-letter-e-recipe', asset: 'evention-letter-e', role: 'brand-letter', anchor: { x: 0.5, y: 0.5 }, tags: ['transparent', 'typographic'] },
    { id: 'evention-letter-v-recipe', asset: 'evention-letter-v', role: 'brand-letter', anchor: { x: 0.5, y: 0.5 }, tags: ['transparent', 'typographic'] },
    { id: 'evention-letter-n-recipe', asset: 'evention-letter-n', role: 'brand-letter', anchor: { x: 0.5, y: 0.5 }, tags: ['transparent', 'typographic'] },
    { id: 'evention-letter-t-recipe', asset: 'evention-letter-t', role: 'brand-letter', anchor: { x: 0.5, y: 0.5 }, tags: ['transparent', 'typographic'] },
    { id: 'evention-letter-i-recipe', asset: 'evention-letter-i', role: 'brand-letter', anchor: { x: 0.5, y: 0.5 }, tags: ['transparent', 'typographic'] },
    { id: 'evention-letter-o-recipe', asset: 'evention-letter-o', role: 'brand-letter', anchor: { x: 0.5, y: 0.5 }, tags: ['transparent', 'typographic'] },
  ],
};
