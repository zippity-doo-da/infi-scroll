import type { AssetPack } from '../../engine/contracts/world';

const ROOT = '/assets/silhouette-fantasy-city/v1/runtime';
const architecture = [
  ['guildhall', 'guildhall.png'], ['dancer-inn', 'dancer-inn.png'], ['apothecary', 'apothecary.png'],
  ['bakery', 'bakery.png'], ['workshop', 'workshop.png'], ['townhouse', 'townhouse.png'],
  ['celestial-temple', 'celestial-temple.png'], ['merchant-house', 'merchant-house.png'],
  ['civic-archive', 'civic-archive.png'], ['fortified-gate', 'fortified-gate.png'],
] as const;

export const silhouetteFantasyCityV1Pack: AssetPack = {
  id: 'silhouette-fantasy-city-v1',
  version: 1,
  compatibility: { provides: ['fantasy', 'urban', 'walled-city', 'night', 'silhouette'] },
  style: {
    guide: '/assets/silhouette-fantasy-city/v1/master-panorama-style-guide-v4.png',
    palette: { midnight: 0x0d1030, violet: 0x261a4c, plum: 0x4a2357, brick: 0x6d2d3d, amber: 0xffa62b, gold: 0xffcf62, slate: 0x30273f, ink: 0x090914 },
    outline: { color: 0x090914, relativeWeight: 0.012 },
    detail: 'medium',
    groundAnchor: 'bottom-center',
  },
  assets: [
    { id: 'sfc-sky', source: `${ROOT}/sky-seamless.png`, metadata: { role: 'sky', opaque: true, seamlessWidth: 1672, bakedMovingObjects: false } },
    { id: 'sfc-mid-city', source: `${ROOT}/mid-seamless.png`, metadata: { role: 'mid-background', seamlessWidth: 2079, overlapPx: 2, bakedMovingObjects: false } },
    { id: 'sfc-street', source: `${ROOT}/street-seamless.png`, metadata: { role: 'street', opaque: true, seamlessWidth: 1672, tileSize: [1672, 260], bakedMovingObjects: false } },
    ...architecture.map(([id, file]) => ({ id: `sfc-${id}`, source: `${ROOT}/${file}`, metadata: { role: 'architecture' } })),
    { id: 'sfc-person-merchant', source: `${ROOT}/person-merchant.png`, metadata: { role: 'inhabitant' } },
    { id: 'sfc-person-guard', source: `${ROOT}/person-guard.png`, metadata: { role: 'inhabitant' } },
    { id: 'sfc-person-scholar', source: `${ROOT}/person-scholar.png`, metadata: { role: 'inhabitant' } },
    { id: 'sfc-person-traveler', source: `${ROOT}/person-traveler.png`, metadata: { role: 'inhabitant' } },
    { id: 'sfc-street-lamp', source: `${ROOT}/street-lamp.png`, metadata: { role: 'street-prop' } },
    { id: 'sfc-market-stall', source: `${ROOT}/market-stall.png`, metadata: { role: 'street-prop' } },
    { id: 'sfc-tree', source: `${ROOT}/tree.png`, metadata: { role: 'vegetation' } },
    { id: 'sfc-fountain', source: `${ROOT}/fountain.png`, metadata: { role: 'street-prop' } },
    { id: 'sfc-wagon-roll', source: `${ROOT}/wagon-roll.png`, frameWidth: 256, frameHeight: 256, metadata: { role: 'vehicle', frames: 6 } },
    { id: 'sfc-carriage-roll', source: `${ROOT}/carriage-roll.png`, frameWidth: 256, frameHeight: 256, metadata: { role: 'vehicle', frames: 6 } },
    { id: 'sfc-bat-flight', source: `${ROOT}/bat-flight.png`, frameWidth: 128, frameHeight: 128, metadata: { role: 'ambient-flight', frames: 4 } },
    { id: 'sfc-rain-drop', primitive: { kind: 'rect', width: 2, height: 14, color: 0xa9b4dc }, metadata: { role: 'weather-particle' } },
    { id: 'sfc-magic-spark', primitive: { kind: 'ellipse', width: 8, height: 8, color: 0xffcf62 }, metadata: { role: 'effect-particle' } },
  ],
  recipes: [
    ...architecture.map(([id]) => ({ id: `recipe-${id}`, asset: `sfc-${id}`, role: id === 'fortified-gate' ? 'landmark' : 'building', anchor: { x: 0.5, y: 1 }, tags: ['architecture', 'grounded'] })),
    { id: 'recipe-merchant', asset: 'sfc-person-merchant', role: 'inhabitant', anchor: { x: 0.5, y: 1 }, worldHeight: 96, tags: ['grounded', 'stationary'] },
    { id: 'recipe-guard', asset: 'sfc-person-guard', role: 'inhabitant', anchor: { x: 0.5, y: 1 }, worldHeight: 96, tags: ['grounded', 'stationary'] },
    { id: 'recipe-scholar', asset: 'sfc-person-scholar', role: 'inhabitant', anchor: { x: 0.5, y: 1 }, worldHeight: 96, tags: ['grounded', 'stationary'] },
    { id: 'recipe-traveler', asset: 'sfc-person-traveler', role: 'inhabitant', anchor: { x: 0.5, y: 1 }, worldHeight: 96, tags: ['grounded', 'stationary'] },
    { id: 'recipe-wagon', asset: 'sfc-wagon-roll', role: 'traffic', anchor: { x: 0.5, y: 1 }, animation: 'sfc-wagon-left', directions: ['left'], tags: ['grounded', 'street', 'near-lane'] },
    { id: 'recipe-carriage', asset: 'sfc-carriage-roll', role: 'traffic', anchor: { x: 0.5, y: 1 }, animation: 'sfc-carriage-right', directions: ['right'], tags: ['grounded', 'street', 'far-lane'] },
    { id: 'recipe-bat', asset: 'sfc-bat-flight', role: 'ambient-traffic', anchor: { x: 0.5, y: 0.5 }, animation: 'sfc-bat-fly', directions: ['left', 'right'], angles: ['high', 'level'], tags: ['airborne'] },
  ],
};
