import type { DesignProfile } from '../../engine/contracts/design';

export const illustratedCinematic: DesignProfile = {
  id: 'illustrated-cinematic',
  name: 'Illustrated Cinematic',
  version: 1,
  intent: 'Denser close-view illustrated worlds with freer depth, detail and traffic.',
  referenceCanvas: { width: 1920, height: 1080 },
  viewing: { context: 'cinematic', recognition: 'shape-and-detail' },
  visual: {
    allowedDetail: ['low', 'medium', 'high'],
    maxPaletteColors: 24,
    outlineWeight: { min: 0, max: 0.03 },
    requireStyleGuide: true,
  },
  composition: {
    minDepthBands: 1,
    maxDepthBands: 10,
    requireSeamMetadata: false,
    requireAuthoredChunks: false,
    maxContinuousAnimations: 20,
  },
  scale: {
    canonicalHumanHeight: 100,
    canonicalDoorHeight: 135,
    tolerance: 0.3,
    groundedAnchor: { x: 0.5, y: 1 },
  },
  motion: {
    baseline: 'world-scroll',
    localAnimation: 'continuous-allowed',
    animationFps: { min: 1, max: 24 },
    maxSimultaneousTraffic: 40,
    minTrafficIntervalMs: 0,
  },
  assets: {
    forbidBakedMovingObjects: false,
    requireRecipes: false,
    minimumArchitectureVariants: 1,
  },
  render: { antialias: true, pixelArt: false },
  enforcement: 'advisory',
};
