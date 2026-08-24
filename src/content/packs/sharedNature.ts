import type { AssetPack } from '../../engine/contracts/world';

export const sharedNaturePack: AssetPack = {
  id: 'shared-nature',
  compatibility: { provides: ['nature', 'temperate'] },
  assets: [
    { id: 'sky-cloud', primitive: { kind: 'ellipse', width: 180, height: 48, color: 0xf4d9cf } },
    { id: 'sky-moon', primitive: { kind: 'ellipse', width: 92, height: 92, color: 0xf3d7aa } },
    { id: 'sky-star', primitive: { kind: 'ellipse', width: 7, height: 7, color: 0xffedc9 } },
    { id: 'distant-hill', primitive: { kind: 'ellipse', width: 720, height: 300, color: 0x5d496f } },
    { id: 'tree-crown', primitive: { kind: 'ellipse', width: 86, height: 122, color: 0x304b42 } },
    { id: 'tree-trunk', primitive: { kind: 'rect', width: 18, height: 70, color: 0x563a35, radius: 6 } },
    { id: 'bird', primitive: { kind: 'polygon', points: [0, 8, 12, 0, 24, 8, 36, 0, 48, 8, 24, 14], color: 0x271f32 } },
  ],
};
