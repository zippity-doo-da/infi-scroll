export interface RuntimeTelemetrySnapshot {
  worldId: string;
  elapsedMs: number;
  cameraX: number;
  fps: number;
  renderObjects: number;
  textures: number;
  textureMemoryMb: number;
  activeChunks: number;
  sleepingChunks: number;
  activeMovers: number;
  activeWorldMovers: number;
  activeSequences: number;
  activeParticles: number;
  pools: Record<string, { active: number; available: number; size: number }>;
  particleViews: { active: number; available: number; allocated: number; reused: number };
  scheduler: { pending: number; accepted: number; deferred: number };
  director: { intensity: number; activeEvents: number };
  environment?: string;
  weather?: string;
  environmentChanges: number;
  environmentVariantApplications: number;
  emittedEvents: Record<string, number>;
  propertyOverrideObserved: boolean;
  backgroundAssets: string[];
  boundWorldMovers: Array<{
    id: string;
    bindings: Record<string, string | number | boolean>;
    actual: { x: number; y: number; scaleX: number; scaleY: number; depth: number; visible: boolean; angle: number };
  }>;
  heapUsedMb?: number;
}
