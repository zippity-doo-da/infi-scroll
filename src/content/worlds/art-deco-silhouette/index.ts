import type { WorldTemplate } from '../../../engine/contracts/world';
import { generatedWorld as artDecoCity } from '../../generated/art-deco-city';

export const artDecoSilhouette: WorldTemplate = {
  ...artDecoCity,
  id: 'art-deco-silhouette',
  name: 'Art Deco Silhouette',
  themes: ['art-deco', 'late-1920s', 'silhouette', 'night'],
  camera: { ...artDecoCity.camera, autoScrollSpeed: 20 },
  backgrounds: artDecoCity.backgrounds.map((layer) => ({
    ...layer,
    tint: layer.id === 'adc-night-sky'
      ? 0x8290b8
      : layer.id === 'adc-distant-city'
        ? 0x465374
        : 0x161b2c,
  })),
  environments: [
    {
      id: 'silhouette-night',
      sky: [0x080d20, 0x273156],
      ambientTint: 0x20283d,
      overlay: { color: 0x02040b, alpha: 0.12 },
    },
    {
      id: 'deep-night',
      sky: [0x030611, 0x141a32],
      ambientTint: 0x141a2b,
      overlay: { color: 0x000107, alpha: 0.22 },
    },
  ],
  initialEnvironment: 'silhouette-night',
  clock: { ...artDecoCity.clock, startHour: 23, realSecondsPerWorldHour: 90 },
  metadata: {
    ...artDecoCity.metadata,
    description: 'A near-black 1920s Art Deco skyline where architecture, traffic, and rare rooftop figures read primarily as silhouettes.',
  },
};
