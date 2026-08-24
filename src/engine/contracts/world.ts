import type {
  EnvironmentEffectDefinition,
  MotionPathDefinition,
  OffscreenPolicyDefinition,
  ParticleEmitterDefinition,
  PerformanceBudgetDefinition,
  PoolDefinition,
  SequenceDefinition,
  StateMachineDefinition,
  WorldPathFollowerDefinition,
} from './capabilities';

export type Id = string;

export interface Vec2 { x: number; y: number }
export interface Range { min: number; max: number }
export type TrafficZone = 'ground' | 'sky';
export type RouteDistance = 'near' | 'mid' | 'far';

export type PrimitiveAsset =
  | { kind: 'rect'; width: number; height: number; color: number; stroke?: number; radius?: number }
  | { kind: 'ellipse'; width: number; height: number; color: number; stroke?: number }
  | { kind: 'polygon'; points: number[]; color: number; stroke?: number };

export interface AssetDefinition {
  id: Id;
  source?: string;
  primitive?: PrimitiveAsset;
  frameWidth?: number;
  frameHeight?: number;
  metadata?: Record<string, unknown>;
}

export interface AssetRecipeDefinition {
  id: Id;
  asset: Id;
  role: string;
  anchor: Vec2;
  worldHeight?: number;
  animation?: Id;
  directions?: Array<'left' | 'right'>;
  angles?: Array<'high' | 'level' | 'low'>;
  tags?: string[];
}

export interface AssetPackStyleProfile {
  guide: string;
  palette: Record<string, number>;
  outline: { color: number; relativeWeight: number };
  detail: 'silhouette' | 'low' | 'medium' | 'high';
  groundAnchor: 'bottom-center';
}

export interface AssetPack {
  id: Id;
  version?: number;
  requires?: Id[];
  compatibility?: { provides: string[]; excludes?: string[] };
  assets: AssetDefinition[];
  recipes?: AssetRecipeDefinition[];
  style?: AssetPackStyleProfile;
}

export interface AnimationDefinition {
  id: Id;
  asset: Id;
  frames?: number[];
  frameRate?: number;
  repeat?: number;
  motion?: { type: 'bob' | 'sway' | 'pulse'; amount: number; durationMs: number };
}

export interface EntityDefinition {
  id: Id;
  asset: Id;
  animation?: Id;
  depth: number;
  scale?: number;
  anchor?: Vec2;
  components?: {
    pathFollower?: { path: Id; speed: Range; direction?: 1 | -1 };
    worldPathFollower?: WorldPathFollowerDefinition;
    ambientMotion?: { x?: Range; y?: Range };
    lifetime?: Range;
    tags?: string[];
  };
}

export interface PlacedObject {
  entity: Id;
  x: number;
  y: number;
  z?: number;
  scale?: number;
  depth?: number;
  tint?: number;
}

export interface SpawnRule {
  entity: Id;
  count: Range;
  area: { x: Range; y: Range };
  chance?: number;
}

export interface ChunkTemplate {
  id: Id;
  width: number;
  tags?: string[];
  weight?: number;
  background?: PlacedObject[];
  objects: PlacedObject[];
  spawns?: SpawnRule[];
  next?: Id[];
}

export type ChunkPlan =
  | { mode: 'authored'; sequence: Id[]; repeat?: boolean }
  | { mode: 'procedural'; pool: Id[]; avoidImmediateRepeat?: boolean }
  | { mode: 'hybrid'; sequence: Id[]; pool: Id[] };

export interface PathDefinition {
  id: Id;
  y: number;
  xPadding?: number;
  zone?: TrafficZone;
  distance?: RouteDistance;
}

export interface TrafficDefinition {
  id: Id;
  path: Id;
  entities: Id[];
  intervalMs: Range;
  initialDelayMs?: Range;
  maxActive: number;
  maxActivePerDirection?: number;
}

export interface EnvironmentState {
  id: Id;
  sky: [number, number];
  ambientTint?: number;
  overlay?: { color: number; alpha: number };
  assetVariants?: Record<Id, Id>;
}

export interface WorldClockDefinition {
  startHour: number;
  realSecondsPerWorldHour: number;
  loopHours?: number;
}

export interface WeatherDefinition {
  id: Id;
  availableIn?: Id[];
  particleAsset?: Id;
  density?: number;
  velocity?: Vec2;
  tint?: number;
}

export type ActionDefinition =
  | { type: 'spawn'; entity: Id; count?: number; area?: { x: Range; y: Range } }
  | { type: 'start-sequence'; sequence: Id }
  | { type: 'set-environment'; state: Id }
  | { type: 'set-weather'; weather: Id | null }
  | { type: 'emit'; event: Id; payload?: Record<string, unknown> };

export interface ScheduledEvent {
  id: Id;
  atHours?: Range;
  everyWorldHours?: number;
  chance?: number;
  cooldownWorldHours?: number;
  actions: ActionDefinition[];
  rare?: boolean;
}

export interface TriggerDefinition {
  id: Id;
  when:
    | { type: 'camera-enters-chunk'; chunk: Id }
    | { type: 'world-hour'; hours: Range }
    | { type: 'event'; event: Id };
  once?: boolean;
  actions: ActionDefinition[];
}

export interface BackgroundLayer {
  id: Id;
  asset: Id;
  depth: number;
  parallax: number;
  y: number;
  spacing: number;
  offsetX?: number;
  scale?: Range;
  height?: number;
  opacity?: number;
}

export interface CompositionRulesDefinition {
  chunks?: {
    minimumRepeatGap?: number;
    excludedAdjacency?: Array<{ beforeTag: Id; afterTag: Id }>;
  };
  entities?: {
    minimumSpacing?: Array<{ tag: Id; distance: number }>;
    maxVisible?: Array<{ tag: Id; count: number }>;
    exclusions?: Array<{ tag: Id; withTag: Id }>;
  };
}

export interface ActivityDirectorDefinition {
  maxActivity: number;
  trafficCost?: number;
  sequenceCost?: number;
  particlesPerActivity?: number;
  rareEventSpacingWorldHours?: number;
  quietPeriods?: Array<{ hours: Range; maxActivity: number }>;
  eventCosts?: Record<Id, number>;
  conflicts?: Id[][];
}

export interface WorldTemplate {
  id: Id;
  name: string;
  version: number;
  designProfile: Id;
  layout: { id: Id; tags: string[]; groundY: number; chunkHeight: number };
  camera?: { autoScrollSpeed?: number; inputSpeed?: number };
  themes: Id[];
  assetPacks: Id[];
  palette: Record<string, number>;
  backgrounds: BackgroundLayer[];
  entities: EntityDefinition[];
  animations: AnimationDefinition[];
  chunks: ChunkTemplate[];
  chunkPlan: ChunkPlan;
  paths: PathDefinition[];
  traffic: TrafficDefinition[];
  clock: WorldClockDefinition;
  environments: EnvironmentState[];
  initialEnvironment: Id;
  weather: WeatherDefinition[];
  initialWeather?: Id;
  events: ScheduledEvent[];
  triggers: TriggerDefinition[];
  audio?: { ambience?: Id; music?: Id; cues?: Record<Id, Id> };
  motionPaths?: MotionPathDefinition[];
  sequences?: SequenceDefinition[];
  stateMachines?: StateMachineDefinition[];
  particleEmitters?: ParticleEmitterDefinition[];
  effects?: EnvironmentEffectDefinition[];
  pools?: PoolDefinition[];
  offscreen?: OffscreenPolicyDefinition;
  performanceBudget?: PerformanceBudgetDefinition;
  compositionRules?: CompositionRulesDefinition;
  director?: ActivityDirectorDefinition;
  metadata?: Record<string, unknown>;
}
