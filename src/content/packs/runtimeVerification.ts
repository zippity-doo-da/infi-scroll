import type { AssetPack } from '../../engine/contracts/world';

export const runtimeVerificationPack: AssetPack = {
  id: 'runtime-verification-pack',
  version: 1,
  compatibility: { provides: ['runtime-verification'] },
  style: {
    guide: 'generated-runtime-verification-primitives',
    palette: { night: 0x10172d, alert: 0x51284f, cyan: 0x67e8f9, amber: 0xfbbf24 },
    outline: { color: 0x080b16, relativeWeight: 0.01 },
    detail: 'low',
    groundAnchor: 'bottom-center',
  },
  assets: [
    { id: 'verify-backdrop', primitive: { kind: 'rect', width: 960, height: 540, color: 0x17213d } },
    { id: 'verify-backdrop-alert', primitive: { kind: 'rect', width: 960, height: 540, color: 0x51284f } },
    { id: 'verify-platform', primitive: { kind: 'rect', width: 960, height: 90, color: 0x111827 } },
    { id: 'verify-probe', primitive: { kind: 'ellipse', width: 80, height: 80, color: 0x67e8f9, stroke: 0x083344 } },
    { id: 'verify-probe-alert', primitive: { kind: 'ellipse', width: 80, height: 80, color: 0xfbbf24, stroke: 0x78350f } },
    { id: 'verify-particle', primitive: { kind: 'ellipse', width: 10, height: 10, color: 0xa5f3fc } },
    { id: 'verify-particle-alert', primitive: { kind: 'ellipse', width: 10, height: 10, color: 0xfde68a } },
    { id: 'verify-rain', primitive: { kind: 'rect', width: 3, height: 18, color: 0x93c5fd } },
  ],
};
