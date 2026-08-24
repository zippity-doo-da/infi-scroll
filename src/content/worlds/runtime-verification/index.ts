import type { WorldTemplate } from '../../../engine/contracts/world';

const WIDTH = 960;
const HEIGHT = 540;
const GROUND_Y = 450;

export const runtimeVerification: WorldTemplate = {
  id: 'runtime-verification',
  name: 'Runtime Integration Verification',
  version: 1,
  designProfile: 'illustrated-cinematic',
  layout: { id: 'verification-stage', tags: ['verification'], groundY: GROUND_Y, chunkHeight: HEIGHT },
  camera: { autoScrollSpeed: 18, inputSpeed: 260 },
  themes: ['verification'],
  assetPacks: ['runtime-verification-pack'],
  palette: { sky: 0x10172d, ground: 0x111827, accent: 0x67e8f9 },
  backgrounds: [{ id: 'verification-background', asset: 'verify-backdrop', depth: -100, parallax: 0.08, y: HEIGHT / 2, spacing: WIDTH, height: HEIGHT }],
  entities: [
    { id: 'verification-platform', asset: 'verify-platform', depth: 0, anchor: { x: 0.5, y: 1 }, components: { tags: ['grounded'] } },
    { id: 'verification-probe', asset: 'verify-probe', depth: 20, anchor: { x: 0.5, y: 0.5 }, components: { tags: ['verification-actor'] } },
  ],
  animations: [],
  chunks: [{ id: 'verification-chunk', width: WIDTH, objects: [{ entity: 'verification-platform', x: WIDTH / 2, y: GROUND_Y }] }],
  chunkPlan: { mode: 'authored', sequence: ['verification-chunk'], repeat: true },
  paths: [],
  traffic: [],
  clock: { startHour: 20, realSecondsPerWorldHour: 2, loopHours: 24 },
  environments: [
    { id: 'verification-night', sky: [0x10172d, 0x25345e], ambientTint: 0xdbeafe },
    {
      id: 'verification-alert', sky: [0x3b1739, 0x7c2d4f], ambientTint: 0xffd7a8, overlay: { color: 0x7f1d1d, alpha: 0.12 },
      assetVariants: { 'verify-backdrop': 'verify-backdrop-alert', 'verify-probe': 'verify-probe-alert', 'verify-particle': 'verify-particle-alert' },
    },
  ],
  initialEnvironment: 'verification-night',
  weather: [
    { id: 'verification-clear' },
    { id: 'verification-rain', availableIn: ['verification-alert'], particleAsset: 'verify-rain', density: 8, velocity: { x: -20, y: 180 }, tint: 0xbfdbfe },
  ],
  initialWeather: 'verification-clear',
  events: [
    { id: 'verification-cycle-event', everyWorldHours: 0.5, cooldownWorldHours: 0.25, actions: [{ type: 'start-sequence', sequence: 'verification-cycle' }] },
    { id: 'verification-deferred-event', everyWorldHours: 0.5, cooldownWorldHours: 0.25, actions: [{ type: 'emit', event: 'verification-director-retry' }] },
  ],
  triggers: [
    { id: 'verification-chunk-entry', when: { type: 'camera-enters-chunk', chunk: 'verification-chunk' }, once: true, actions: [{ type: 'emit', event: 'verification-entered' }] },
    { id: 'verification-event-trigger', when: { type: 'event', event: 'verification-director-retry' }, actions: [{ type: 'start-sequence', sequence: 'verification-followup' }] },
    { id: 'verification-state-trigger', when: { type: 'event', event: 'verification-state-active' }, actions: [{ type: 'emit', event: 'verification-observed' }] },
  ],
  motionPaths: [{ id: 'verification-flight', type: 'linear', durationMs: 1800, points: [{ x: 120, y: 300, z: -160 }, { x: 820, y: 220, z: 120 }] }],
  sequences: [
    { id: 'verification-cycle', cooldownMs: 400, steps: [
      { actions: [
        { type: 'set-environment', state: 'verification-alert' },
        { type: 'set-weather', weather: 'verification-rain' },
        { type: 'spawn', entity: 'verification-probe', at: { x: 120, y: 300, z: -160 }, as: 'verification-probe-instance' },
        { type: 'follow-path', target: 'verification-probe-instance', follower: { path: 'verification-flight', durationMs: 1800, orientToTangent: true } },
        { type: 'set-property', target: 'verification-probe-instance', property: 'scale', value: 0.72 },
        { type: 'set-property', target: 'verification-probe-instance', property: 'alpha', value: 0.82 },
        { type: 'emit-particles', effect: 'verification-sparks', at: { x: 480, y: 260, z: 0 }, count: 12 },
        { type: 'emit', event: 'verification-pulse' },
      ] },
      { afterMs: 800, actions: [
        { type: 'set-environment', state: 'verification-night' },
        { type: 'set-weather', weather: 'verification-clear' },
        { type: 'emit', event: 'verification-reset' },
      ] },
    ] },
    { id: 'verification-followup', cooldownMs: 200, steps: [{ actions: [
      { type: 'set-property', target: 'verification-probe-instance', property: 'angle', value: 18 },
      { type: 'emit-particles', effect: 'verification-sparks', at: { x: 600, y: 240, z: 60 }, count: 6 },
    ] }] },
  ],
  stateMachines: [{
    id: 'verification-machine', initial: 'idle', states: ['idle', 'active'], transitions: [
      { from: 'idle', to: 'active', event: 'verification-pulse', actions: [
        { type: 'set-property', target: 'verification-probe-instance', property: 'tint', value: 0xffffff },
        { type: 'emit', event: 'verification-state-active' },
      ] },
      { from: 'active', to: 'idle', event: 'verification-reset' },
    ],
  }],
  particleEmitters: [{
    id: 'verification-spark-emitter', asset: 'verify-particle', maxParticles: 24, lifetimeMs: { min: 500, max: 900 },
    velocity: { x: { min: -50, max: 50 }, y: { min: -80, max: -20 }, z: { min: -40, max: 40 } },
    acceleration: { x: 0, y: 70, z: 0 }, opacity: { min: 0.6, max: 1 }, scale: { min: 0.7, max: 1.3 }, batched: true,
  }],
  effects: [{ id: 'verification-sparks', type: 'sparks', emitter: 'verification-spark-emitter', enabledIn: ['verification-alert'], density: 0.4 }],
  pools: [],
  offscreen: { sleepMargin: 80, suspendAnimation: true, suspendParticles: true, keepLogicalTime: false },
  director: {
    maxActivity: 2, trafficCost: 1, sequenceCost: 1, particlesPerActivity: 12,
    eventCosts: { 'verification-cycle-event': 2, 'verification-deferred-event': 2 },
  },
  performanceBudget: { targetFps: 60, maxActiveEntities: 40, targetResolutions: [[1920, 1080]] },
  metadata: { purpose: 'Compact end-to-end runtime capability verification fixture.' },
};
