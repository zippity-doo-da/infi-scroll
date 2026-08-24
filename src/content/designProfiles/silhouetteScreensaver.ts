import type { DesignProfile } from '../../engine/contracts/design';

export const silhouetteScreensaver: DesignProfile = {
  id: 'silhouette-screensaver',
  name: 'Silhouette Screensaver',
  version: 1,
  intent: 'Across-room illustrated scrolling worlds where recognition comes from silhouette before detail.',
  referenceCanvas: { width: 1920, height: 1080 },
  viewing: { context: 'television-distance', recognition: 'silhouette-first' },
  visual: {
    allowedDetail: ['silhouette', 'low', 'medium'],
    maxPaletteColors: 8,
    outlineWeight: { min: 0.004, max: 0.018 },
    requireStyleGuide: true,
  },
  composition: {
    minDepthBands: 3,
    maxDepthBands: 4,
    requireSeamMetadata: true,
    requireAuthoredChunks: true,
    maxContinuousAnimations: 4,
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
    maxSimultaneousTraffic: 5,
    maxSimultaneousTrafficByZone: { ground: 2, sky: 3 },
    minTrafficIntervalMs: 7000,
  },
  assets: {
    forbidBakedMovingObjects: true,
    requireRecipes: true,
    minimumArchitectureVariants: 8,
  },
  render: { antialias: true, pixelArt: false },
  enforcement: 'strict',
};
