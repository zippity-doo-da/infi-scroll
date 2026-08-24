import type { Id, Range } from './world';

export interface WorldPoint3 { x: number; y: number; z: number }

interface BaseMotionPath { id: Id; durationMs?: number; closed?: boolean }

export type MotionPathDefinition =
  | (BaseMotionPath & { type: 'linear' | 'waypoint'; points: WorldPoint3[] })
  | (BaseMotionPath & { type: 'catmull-rom'; points: WorldPoint3[]; tension?: number })
  | (BaseMotionPath & { type: 'bezier'; points: readonly [WorldPoint3, WorldPoint3, WorldPoint3, WorldPoint3] })
  | (BaseMotionPath & { type: 'ballistic'; origin: WorldPoint3; velocity: WorldPoint3; gravity: WorldPoint3 })
  | (BaseMotionPath & { type: 'orbit'; center: WorldPoint3; radius: WorldPoint3; startAngle?: number; revolutions?: number })
  | (BaseMotionPath & { type: 'stationary'; point: WorldPoint3 });

export interface WorldPathFollowerDefinition {
  path: Id;
  durationMs?: number;
  delayMs?: number;
  loop?: boolean;
  pingPong?: boolean;
  orientToTangent?: boolean;
  cameraRelative?: boolean;
  startProgress?: number;
}

export type SequenceActionDefinition =
  | { type: 'wait'; durationMs: number }
  | { type: 'start-sequence'; sequence: Id }
  | { type: 'spawn'; entity: Id; count?: number; at?: WorldPoint3; as?: Id }
  | { type: 'despawn'; target: Id }
  | { type: 'play-animation'; target: Id; animation: Id }
  | { type: 'follow-path'; target: Id; follower: WorldPathFollowerDefinition }
  | { type: 'set-state'; machine: Id; state: Id; target?: Id }
  | { type: 'set-environment'; state: Id }
  | { type: 'set-weather'; weather: Id | null }
  | { type: 'set-property'; target: Id; property: string; value: string | number | boolean }
  | { type: 'emit-particles'; effect: Id; at?: WorldPoint3; count?: number }
  | { type: 'emit'; event: Id; payload?: Record<string, unknown> };

export interface SequenceStepDefinition {
  afterMs?: number;
  actions: SequenceActionDefinition[];
}

export interface SequenceDefinition {
  id: Id;
  steps: SequenceStepDefinition[];
  loop?: boolean;
  cooldownMs?: number;
}

export interface StateTransitionDefinition {
  from: Id | '*';
  to: Id;
  event: Id;
  actions?: SequenceActionDefinition[];
}

export interface StateMachineDefinition {
  id: Id;
  initial: Id;
  states: Id[];
  transitions: StateTransitionDefinition[];
}

export interface ParticleEmitterDefinition {
  id: Id;
  asset: Id;
  maxParticles: number;
  ratePerSecond?: number;
  lifetimeMs: Range;
  velocity?: { x: Range; y: Range; z: Range };
  acceleration?: WorldPoint3;
  opacity?: Range;
  scale?: Range;
  batched?: boolean;
}

export interface EnvironmentEffectDefinition {
  id: Id;
  type: 'fog-band' | 'clouds' | 'water-shimmer' | 'smoke' | 'precipitation' | 'dust' | 'fire' | 'sparks' | 'particles' | 'lightning-flash' | 'custom';
  emitter?: Id;
  enabledIn?: Id[];
  density?: number;
  shader?: Id;
  shared?: boolean;
  metadata?: Record<string, unknown>;
}

export interface OffscreenPolicyDefinition {
  sleepMargin: number;
  suspendAnimation: boolean;
  suspendParticles: boolean;
  keepLogicalTime: boolean;
}

export interface PoolDefinition {
  id: Id;
  entity: Id;
  initialSize: number;
  maxSize: number;
}

export interface PerformanceBudgetDefinition {
  targetFps: number;
  maxDrawCalls?: number;
  maxTriangles?: number;
  maxTextureMemoryMb?: number;
  maxActiveEntities?: number;
  targetResolutions: Array<[number, number]>;
}

export interface PerformanceSnapshot {
  fps: number;
  drawCalls: number;
  triangles: number;
  textures: number;
  textureMemoryMb?: number;
  activeEntities: number;
  activeAnimatedEntities: number;
  activeParticles: number;
  activeChunks: number;
}
