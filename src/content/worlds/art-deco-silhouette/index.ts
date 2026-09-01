import type { WorldTemplate } from '../../../engine/contracts/world';
import { generatedWorld as artDecoCity } from '../../generated/art-deco-city';

const foregroundTints: Record<string, number> = {
  'adc-movie-palace': 0x6d6577,
  'adc-department-store': 0x596f73,
  'adc-bank': 0x83808b,
  'adc-jazz-club': 0x654c59,
  'adc-hotel': 0x58717a,
  'adc-apartments': 0x776758,
  'adc-terminal': 0x77828d,
  'adc-civic-hall': 0x6d7582,
  'adc-street-lamp': 0xe2c891,
  'adc-newsstand': 0x627b72,
  'adc-woman': 0x756270,
  'adc-man': 0x626979,
};

export const artDecoSilhouette: WorldTemplate = {
  ...artDecoCity,
  id: 'art-deco-silhouette',
  name: 'Art Deco Silhouette',
  themes: ['art-deco', 'late-1920s', 'silhouette', 'night'],
  camera: { ...artDecoCity.camera, autoScrollSpeed: 20 },
  chunks: artDecoCity.chunks.map((chunk) => ({
    ...chunk,
    objects: chunk.objects.map((object) => ({
      ...object,
      tint: foregroundTints[object.entity] ?? 0x727b8d,
    })),
  })),
  backgrounds: artDecoCity.backgrounds.map((layer) => ({
    ...layer,
    tint: layer.id === 'adc-night-sky'
      ? 0xffffff
      : layer.id === 'adc-distant-city'
        ? 0x8995b0
        : 0x4c566c,
  })),
  environments: [
    {
      id: 'silhouette-night',
      sky: [0x162348, 0x59698f],
      ambientTint: 0xc1c7d6,
      overlay: { color: 0x02040b, alpha: 0.02 },
    },
    {
      id: 'deep-night',
      sky: [0x0c1634, 0x3f4d74],
      ambientTint: 0x9ca5bb,
      overlay: { color: 0x000107, alpha: 0.05 },
    },
  ],
  initialEnvironment: 'silhouette-night',
  clock: { ...artDecoCity.clock, startHour: 23, realSecondsPerWorldHour: 90 },
  metadata: {
    ...artDecoCity.metadata,
    description: 'A near-black 1920s Art Deco skyline where architecture, traffic, and rare rooftop figures read primarily as silhouettes.',
  },
};
