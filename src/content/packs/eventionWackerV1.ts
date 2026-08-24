import type { AssetPack } from '../../engine/contracts/world';

const ROOT = '/assets/evention-wacker/v1/runtime';

export const eventionWackerV1Pack: AssetPack = {
  id: 'evention-wacker-v1',
  version: 1,
  compatibility: { provides: ['modern-city', 'chicago', 'riverfront', 'corporate', 'standard-parallax'] },
  style: {
    guide: '/assets/evention-wacker/v1/master-panorama-style-guide.png',
    palette: { navy: 0x001451, green: 0x54e577, stone: 0xc7bda9, steel: 0x35465f, amber: 0xe7a94b },
    outline: { color: 0x17223d, relativeWeight: 0.004 },
    detail: 'medium',
    groundAnchor: 'bottom-center',
  },
  assets: [
    { id: 'evention-far-skyline', source: `${ROOT}/far-skyline-seamless.png`, metadata: { role: 'background', seamlessWidth: 1891 } },
    { id: 'evention-mid-architecture', source: `${ROOT}/mid-architecture-seamless.png`, metadata: { role: 'midground', seamlessWidth: 2128 } },
    { id: 'evention-river-channel', source: `${ROOT}/river-channel-seamless.png`, metadata: { role: 'river', seamlessWidth: 1891 } },
    { id: 'evention-foreground-street', source: `${ROOT}/foreground-street-seamless.png`, metadata: { role: 'foreground', seamlessWidth: 2172 } },
    { id: 'evention-chicago-taxi', source: `${ROOT}/chicago-taxi-v1.png`, metadata: { role: 'street-traffic', direction: 'right' } },
    { id: 'evention-tour-boat', source: `${ROOT}/tour-boat-v1.png`, metadata: { role: 'river-traffic', direction: 'right' } },
    { id: 'evention-water-taxi', source: `${ROOT}/water-taxi-v1.png`, metadata: { role: 'river-traffic', direction: 'right' } },
    { id: 'evention-office-worker', source: `${ROOT}/office-worker-v1.png`, metadata: { role: 'pedestrian', motion: 'stationary' } },
    { id: 'evention-umbrella-pedestrian', source: `${ROOT}/umbrella-pedestrian-v1.png`, metadata: { role: 'pedestrian', motion: 'stationary' } },
    { id: 'evention-121-wacker-lobby', source: `${ROOT}/121-wacker-lobby-v1.png`, metadata: { role: 'street-architecture', groundAnchor: 'bottom-center' } },
    { id: 'evention-window-plaque', source: `${ROOT}/evention-window-plaque-v2.svg`, metadata: { role: 'window-signage' } },
    { id: 'evention-tips-window-plaque', source: `${ROOT}/tips-window-plaque-v2.svg`, metadata: { role: 'window-signage', product: 'Tips + Gratuities' } },
    { id: 'evention-recon-window-plaque', source: `${ROOT}/recon-window-plaque-v2.svg`, metadata: { role: 'window-signage', product: 'Total Recon' } },
    { id: 'evention-brand-kiosk', source: `${ROOT}/evention-kiosk.svg`, metadata: { role: 'street-fixture' } },
    { id: 'evention-tips-kiosk', source: `${ROOT}/tips-gratuities-kiosk.svg`, metadata: { role: 'street-fixture', product: 'Tips + Gratuities' } },
    { id: 'evention-recon-kiosk', source: `${ROOT}/total-recon-kiosk.svg`, metadata: { role: 'street-fixture', product: 'Total Recon' } },
  ],
  recipes: [
    { id: 'evention-street-taxi', asset: 'evention-chicago-taxi', role: 'street-traffic', anchor: { x: 0.5, y: 1 }, directions: ['right'], angles: ['level'], tags: ['traffic', 'grounded'] },
    { id: 'evention-river-tour-boat', asset: 'evention-tour-boat', role: 'river-traffic', anchor: { x: 0.5, y: 1 }, directions: ['right'], angles: ['level'], tags: ['traffic', 'waterborne'] },
    { id: 'evention-river-water-taxi', asset: 'evention-water-taxi', role: 'river-traffic', anchor: { x: 0.5, y: 1 }, directions: ['right'], angles: ['level'], tags: ['traffic', 'waterborne'] },
  ],
};
