import type { AssetPack } from '../../engine/contracts/world';

export const fantasyCorePack: AssetPack = {
  id: 'fantasy-core',
  requires: ['shared-nature'],
  compatibility: { provides: ['fantasy', 'preindustrial-traffic'] },
  assets: [
    { id: 'townsperson', primitive: { kind: 'ellipse', width: 22, height: 44, color: 0x8f4f55, stroke: 0x2b2032 } },
    { id: 'wagon', primitive: { kind: 'rect', width: 72, height: 32, color: 0x795036, stroke: 0x332129, radius: 7 } },
    { id: 'lantern', primitive: { kind: 'ellipse', width: 18, height: 28, color: 0xffcf6b, stroke: 0x5a3440 } },
    { id: 'banner', primitive: { kind: 'polygon', points: [0, 0, 30, 0, 25, 70, 14, 58, 3, 70], color: 0x9d3f54, stroke: 0x4d2639 } },
    { id: 'smoke', primitive: { kind: 'ellipse', width: 44, height: 62, color: 0xa69bab } },
  ],
};
