import type { DesignProfile } from '../../engine/contracts/design';

export const typographicScreensaver: DesignProfile = {
  id: 'typographic-screensaver',
  name: 'Typographic Screensaver',
  version: 1,
  intent: 'Across-room typographic worlds built from exact text, broad contrast, restrained layers, and slow continuous parallax.',
  referenceCanvas: { width: 1920, height: 1080 },
  viewing: { context: 'television-distance', recognition: 'silhouette-first' },
  visual: {
    allowedDetail: ['silhouette', 'low'],
    maxPaletteColors: 3,
    outlineWeight: { min: 0.002, max: 0.012 },
    requireStyleGuide: true,
  },
  composition: {
    minDepthBands: 3,
    maxDepthBands: 8,
    requireSeamMetadata: true,
    requireAuthoredChunks: true,
    maxContinuousAnimations: 0,
  },
  scale: {
    canonicalHumanHeight: 100,
    canonicalDoorHeight: 135,
    tolerance: 0.15,
    groundedAnchor: { x: 0.5, y: 1 },
  },
  motion: {
    baseline: 'world-scroll',
    localAnimation: 'intermittent',
    animationFps: { min: 4, max: 8 },
    maxSimultaneousTraffic: 0,
    minTrafficIntervalMs: 7000,
  },
  assets: {
    forbidBakedMovingObjects: true,
    requireRecipes: false,
    minimumArchitectureVariants: 0,
  },
  render: { antialias: true, pixelArt: false },
  enforcement: 'strict',
};
