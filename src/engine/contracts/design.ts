import type { Id, TrafficZone } from './world';

export type DesignDetailLevel = 'silhouette' | 'low' | 'medium' | 'high';

export interface DesignProfile {
  id: Id;
  name: string;
  version: number;
  intent: string;
  referenceCanvas: { width: number; height: number };
  viewing: {
    context: 'television-distance' | 'desktop' | 'cinematic';
    recognition: 'silhouette-first' | 'shape-and-detail' | 'detail-first';
  };
  visual: {
    allowedDetail: DesignDetailLevel[];
    maxPaletteColors: number;
    outlineWeight: { min: number; max: number };
    requireStyleGuide: boolean;
  };
  composition: {
    minDepthBands: number;
    maxDepthBands: number;
    requireSeamMetadata: boolean;
    requireAuthoredChunks: boolean;
    maxContinuousAnimations: number;
  };
  scale: {
    canonicalHumanHeight: number;
    canonicalDoorHeight: number;
    tolerance: number;
    groundedAnchor: { x: number; y: number };
  };
  motion: {
    baseline: 'world-scroll' | 'free-camera';
    localAnimation: 'intermittent' | 'continuous-allowed';
    animationFps: { min: number; max: number };
    maxSimultaneousTraffic: number;
    maxSimultaneousTrafficByZone?: Partial<Record<TrafficZone, number>>;
    minTrafficIntervalMs: number;
  };
  assets: {
    forbidBakedMovingObjects: boolean;
    requireRecipes: boolean;
    minimumArchitectureVariants: number;
  };
  render: { antialias: boolean; pixelArt: boolean };
  enforcement: 'strict' | 'advisory';
}

export interface DesignProfileFinding {
  rule: string;
  message: string;
}
