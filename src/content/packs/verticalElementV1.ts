import type { AssetPack } from '../../engine/contracts/world';

const ROOT = '/assets/vertical-element/v1/runtime';

export const verticalElementV1Pack: AssetPack = {
  id: 'vertical-element-v1',
  version: 1,
  compatibility: { provides: ['science-fiction', 'vertical-city', 'top-down', 'aerial-traffic'] },
  style: {
    guide: '/assets/vertical-element/v1/master-panorama-style-guide-v2-no-vehicles.png',
    palette: { shadow: 0x11191a, teal: 0x173638, amber: 0xf19a39, magenta: 0xd53b79, concrete: 0x514b47 },
    outline: { color: 0x11191a, relativeWeight: 0.008 },
    detail: 'medium',
    groundAnchor: 'bottom-center',
  },
  assets: [
    { id: 'vertical-city-canyon', source: `${ROOT}/city-canyon-no-vehicles-seamless.png`, metadata: { role: 'top-down-background', seamlessWidth: 1672, traffic: 'runtime-only' } },
    { id: 'vertical-flying-taxi', source: `${ROOT}/flying-taxi.png`, metadata: { role: 'aerial-traffic', view: 'overhead', class: 'taxi' } },
    { id: 'vertical-deco-taxi', source: `${ROOT}/deco-taxi-v1.png`, metadata: { role: 'aerial-traffic', view: 'overhead', class: 'taxi', style: 'streamline-moderne' } },
    { id: 'vertical-delivery-van', source: `${ROOT}/delivery-van.png`, metadata: { role: 'aerial-traffic', view: 'overhead', class: 'utility' } },
    { id: 'vertical-patrol-cruiser', source: `${ROOT}/patrol-cruiser-v1.png`, metadata: { role: 'aerial-traffic', view: 'overhead', class: 'civic-patrol' } },
    { id: 'vertical-civilian-coupe', source: `${ROOT}/civilian-coupe-v1.png`, metadata: { role: 'aerial-traffic', view: 'overhead', class: 'civilian' } },
    { id: 'vertical-transit-shuttle', source: `${ROOT}/transit-shuttle-v1.png`, metadata: { role: 'aerial-traffic', view: 'overhead', class: 'public-transit' } },
  ],
  recipes: [
    { id: 'overhead-flying-taxi', asset: 'vertical-flying-taxi', role: 'aerial-traffic', anchor: { x: 0.5, y: 0.5 }, directions: ['left', 'right'], angles: ['high', 'level', 'low'], tags: ['airborne', 'overhead', 'perspective'] },
    { id: 'overhead-deco-taxi', asset: 'vertical-deco-taxi', role: 'aerial-traffic', anchor: { x: 0.5, y: 0.5 }, directions: ['left', 'right'], angles: ['high', 'level', 'low'], tags: ['airborne', 'overhead', 'perspective', 'streamline-moderne'] },
    { id: 'overhead-delivery-van', asset: 'vertical-delivery-van', role: 'aerial-traffic', anchor: { x: 0.5, y: 0.5 }, directions: ['left', 'right'], angles: ['high', 'level', 'low'], tags: ['airborne', 'overhead', 'perspective'] },
    { id: 'overhead-patrol-cruiser', asset: 'vertical-patrol-cruiser', role: 'aerial-traffic', anchor: { x: 0.5, y: 0.5 }, directions: ['left', 'right'], angles: ['high', 'level', 'low'], tags: ['airborne', 'overhead', 'perspective', 'civic'] },
    { id: 'overhead-civilian-coupe', asset: 'vertical-civilian-coupe', role: 'aerial-traffic', anchor: { x: 0.5, y: 0.5 }, directions: ['left', 'right'], angles: ['high', 'level', 'low'], tags: ['airborne', 'overhead', 'perspective', 'civilian'] },
    { id: 'overhead-transit-shuttle', asset: 'vertical-transit-shuttle', role: 'aerial-traffic', anchor: { x: 0.5, y: 0.5 }, directions: ['left', 'right'], angles: ['high', 'level', 'low'], tags: ['airborne', 'overhead', 'perspective', 'public-transit'] },
  ],
};
