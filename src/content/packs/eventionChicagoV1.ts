import type { AssetPack } from '../../engine/contracts/world';

const ROOT = `${import.meta.env.BASE_URL}assets/evention-chicago/v1`;

export const eventionChicagoV1Pack: AssetPack = {
  id: 'evention-chicago-v1',
  version: 1,
  compatibility: { provides: ['modern-city', 'chicago', 'riverfront', 'corporate', 'standard-parallax'] },
  style: {
    guide: `${ROOT}/master-panorama-style-guide.png`,
    palette: { navy: 0x001451, green: 0x54e577, river: 0x062a58, steel: 0x253a56, limestone: 0x9b9a91, amber: 0xf0b55a },
    outline: { color: 0x07152b, relativeWeight: 0.006 },
    detail: 'medium',
    groundAnchor: 'bottom-center',
  },
  assets: [
    { id: 'echi-far-skyline', source: `${ROOT}/runtime/far-skyline.png`, metadata: { role: 'background', opaque: true, seamlessWidth: 1672, bakedMovingObjects: false } },
    { id: 'echi-loop-wacker-mid', source: `${ROOT}/runtime/loop-wacker-mid.png`, metadata: { role: 'midground', transparent: true, seamlessWidth: 1672, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'echi-brand-signage', source: `${ROOT}/runtime/brand-signage.svg`, metadata: { role: 'customer-billboards', transparent: true, seamlessWidth: 5016, bakedMovingObjects: false } },
    { id: 'echi-evention-logo', source: `${ROOT}/runtime/evention-logo.svg`, metadata: { role: 'official-brand-mark', transparent: true } },
    { id: 'echi-river-foreground', source: `${ROOT}/runtime/river-foreground-thin.png`, metadata: { role: 'foreground-river', opaque: true, seamlessWidth: 1672, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'echi-water-taxi', source: `${ROOT}/runtime/chicago-water-taxi.png`, metadata: { role: 'river-traffic', direction: 'right', transparent: true } },
    { id: 'echi-cta-pair', source: `${ROOT}/runtime/cta-5000-pair.png`, metadata: { role: 'elevated-traffic', direction: 'left', transparent: true } },
  ],
  recipes: [
    { id: 'echi-water-taxi-recipe', asset: 'echi-water-taxi', role: 'river-traffic', anchor: { x: 0.5, y: 1 }, directions: ['right'], angles: ['level'], tags: ['traffic', 'waterborne'] },
    { id: 'echi-cta-recipe', asset: 'echi-cta-pair', role: 'elevated-traffic', anchor: { x: 0.5, y: 1 }, directions: ['left'], angles: ['level'], tags: ['traffic', 'rail', 'elevated'] },
  ],
};
