import type { ChunkTemplate, WorldTemplate } from '../../../engine/contracts/world';

const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;
const GROUND_Y = HEIGHT - 232;
const STREET_CENTER_Y = HEIGHT - 130;

const rows: Array<[string, number, string, Array<[string, number]>]> = [
  ['fortified-gate', 540, 'sfc-fortified-gate', [['sfc-street-lamp', 72], ['sfc-person-guard', 438]]],
  ['guildhall', 378, 'sfc-guildhall', [['sfc-tree', 42], ['sfc-person-scholar', 345]]],
  ['dancer-inn', 226, 'sfc-dancer-inn', [['sfc-street-lamp', 18]]],
  ['apothecary', 244, 'sfc-apothecary', [['sfc-person-traveler', 222]]],
  ['bakery', 335, 'sfc-bakery', [['sfc-market-stall', 42], ['sfc-street-lamp', 314]]],
  ['workshop', 395, 'sfc-workshop', [['sfc-person-merchant', 34], ['sfc-tree', 374]]],
  ['townhouse', 179, 'sfc-townhouse', [['sfc-tree', 160]]],
  ['celestial-temple', 429, 'sfc-celestial-temple', [['sfc-street-lamp', 30], ['sfc-fountain', 398]]],
  ['merchant-house', 280, 'sfc-merchant-house', [['sfc-street-lamp', 258]]],
  ['civic-archive', 552, 'sfc-civic-archive', [['sfc-tree', 38], ['sfc-fountain', 520]]],
];

const chunks: ChunkTemplate[] = rows.map(([id, width, building, extras]) => ({
  id: `sfc-${id}-chunk`, width, tags: ['architecture'],
  objects: [
    { entity: building, x: width / 2, y: GROUND_Y },
    ...extras.map(([entity, x]) => ({ entity, x, y: GROUND_Y })),
  ],
}));

const grounded = (id: string, asset = id, depth = 8, scale = 1) => ({ id, asset, depth, scale, anchor: { x: 0.5, y: 1 }, components: { tags: ['grounded'] } });

export const silhouetteFantasyCity: WorldTemplate = {
  id: 'silhouette-fantasy-city',
  name: 'Silhouette Fantasy City',
  version: 1,
  designProfile: 'silhouette-screensaver',
  layout: { id: 'walled-city', tags: ['urban', 'walled', 'street'], groundY: GROUND_Y, chunkHeight: HEIGHT },
  camera: { autoScrollSpeed: 28, inputSpeed: 340 },
  themes: ['general-fantasy', 'night', 'silhouette'],
  assetPacks: ['silhouette-fantasy-city-v1'],
  palette: { sky: 0x0d1030, city: 0x261a4c, ground: 0x17142c, amber: 0xffa62b },
  backgrounds: [
    { id: 'sfc-night-sky', asset: 'sfc-sky', depth: -120, parallax: 0.015, y: HEIGHT / 2, spacing: 1672 },
    { id: 'sfc-distant-city', asset: 'sfc-mid-city', depth: -80, parallax: 0.09, y: GROUND_Y - 231.5, spacing: 2079 },
    { id: 'sfc-continuous-street', asset: 'sfc-street', depth: 0, parallax: 1, y: STREET_CENTER_Y, spacing: 1672 },
  ],
  entities: [
    ...rows.map(([, , building]) => grounded(building)),
    grounded('sfc-person-merchant', 'sfc-person-merchant', 14), grounded('sfc-person-guard', 'sfc-person-guard', 14),
    grounded('sfc-person-scholar', 'sfc-person-scholar', 14), grounded('sfc-person-traveler', 'sfc-person-traveler', 14),
    grounded('sfc-street-lamp', 'sfc-street-lamp', 13), grounded('sfc-market-stall', 'sfc-market-stall', 13),
    grounded('sfc-tree', 'sfc-tree', 6), grounded('sfc-fountain', 'sfc-fountain', 13),
    { id: 'sfc-wagon-left', asset: 'sfc-wagon-roll', animation: 'sfc-wagon-left', depth: 40, scale: 0.82, anchor: { x: 0.5, y: 1 }, components: { pathFollower: { path: 'sfc-near-lane', speed: { min: 44, max: 52 }, direction: -1 }, tags: ['grounded', 'traffic'] } },
    { id: 'sfc-carriage-right', asset: 'sfc-carriage-roll', animation: 'sfc-carriage-right', depth: 30, scale: 0.68, anchor: { x: 0.5, y: 1 }, components: { pathFollower: { path: 'sfc-far-lane', speed: { min: 36, max: 44 }, direction: 1 }, tags: ['grounded', 'traffic'] } },
    { id: 'sfc-bat', asset: 'sfc-bat-flight', animation: 'sfc-bat-fly', depth: -20, scale: 0.62, anchor: { x: 0.5, y: 0.5 }, components: { pathFollower: { path: 'sfc-sky-route', speed: { min: 42, max: 58 } }, tags: ['traffic', 'airborne'] } },
    { id: 'sfc-bat-swoop', asset: 'sfc-bat-flight', animation: 'sfc-bat-fly', depth: -12, scale: 0.78, anchor: { x: 0.5, y: 0.5 }, components: { tags: ['airborne', 'rare-event'] } },
  ],
  animations: [
    { id: 'sfc-wagon-left', asset: 'sfc-wagon-roll', frames: [0, 1, 2, 3, 4, 5], frameRate: 6, repeat: -1 },
    { id: 'sfc-carriage-right', asset: 'sfc-carriage-roll', frames: [5, 4, 3, 2, 1, 0], frameRate: 6, repeat: -1 },
    { id: 'sfc-bat-fly', asset: 'sfc-bat-flight', frames: [0, 1, 2, 3, 2, 1], frameRate: 6, repeat: -1 },
  ],
  chunks,
  chunkPlan: { mode: 'authored', sequence: chunks.map((chunk) => chunk.id), repeat: true },
  paths: [
    { id: 'sfc-far-lane', y: GROUND_Y + 74, xPadding: 160, zone: 'ground', distance: 'mid' },
    { id: 'sfc-near-lane', y: GROUND_Y + 166, xPadding: 180, zone: 'ground', distance: 'near' },
    { id: 'sfc-sky-route', y: Math.max(130, HEIGHT * 0.22), xPadding: 100, zone: 'sky', distance: 'far' },
  ],
  traffic: [
    { id: 'sfc-far-traffic', path: 'sfc-far-lane', entities: ['sfc-carriage-right'], intervalMs: { min: 10500, max: 15000 }, initialDelayMs: { min: 800, max: 1800 }, maxActive: 1, maxActivePerDirection: 1 },
    { id: 'sfc-near-traffic', path: 'sfc-near-lane', entities: ['sfc-wagon-left'], intervalMs: { min: 9500, max: 14000 }, initialDelayMs: { min: 1800, max: 3000 }, maxActive: 1, maxActivePerDirection: 1 },
    { id: 'sfc-bats', path: 'sfc-sky-route', entities: ['sfc-bat'], intervalMs: { min: 14000, max: 22000 }, initialDelayMs: { min: 4500, max: 7000 }, maxActive: 1, maxActivePerDirection: 1 },
  ],
  clock: { startHour: 21, realSecondsPerWorldHour: 60, loopHours: 24 },
  environments: [
    { id: 'night', sky: [0x0d1030, 0x261a4c], ambientTint: 0xffffff },
    { id: 'moonlit', sky: [0x11183d, 0x382552], ambientTint: 0xdde4ff, overlay: { color: 0x8ea4df, alpha: 0.04 } },
    { id: 'storm', sky: [0x080b20, 0x211b36], ambientTint: 0xaeb6d4, overlay: { color: 0x10152c, alpha: 0.12 } },
  ],
  initialEnvironment: 'night',
  weather: [{ id: 'clear' }, { id: 'rain', availableIn: ['storm'] }],
  initialWeather: 'clear',
  events: [
    { id: 'sfc-passing-storm', everyWorldHours: 1.5, cooldownWorldHours: 0.22, chance: 0.65, actions: [{ type: 'start-sequence', sequence: 'sfc-storm-cycle' }] },
    { id: 'sfc-rare-bat-swoop', everyWorldHours: 2, cooldownWorldHours: 0.12, chance: 0.7, rare: true, actions: [{ type: 'start-sequence', sequence: 'sfc-bat-swoop' }] },
  ],
  triggers: [
    { id: 'sfc-temple-glimmer-trigger', when: { type: 'camera-enters-chunk', chunk: 'sfc-celestial-temple-chunk' }, actions: [{ type: 'start-sequence', sequence: 'sfc-temple-glimmer' }] },
    { id: 'sfc-swoop-finale-trigger', when: { type: 'event', event: 'sfc-swoop-finale' }, actions: [{ type: 'start-sequence', sequence: 'sfc-swoop-sparks' }] },
  ],
  motionPaths: [{
    id: 'sfc-bat-swoop-path', type: 'catmull-rom', durationMs: 6200, tension: 0.42,
    points: [
      { x: -120, y: Math.max(110, HEIGHT * 0.18), z: -220 },
      { x: WIDTH * 0.28, y: Math.max(150, HEIGHT * 0.28), z: -100 },
      { x: WIDTH * 0.58, y: Math.max(210, HEIGHT * 0.42), z: 90 },
      { x: WIDTH * 0.82, y: Math.max(140, HEIGHT * 0.24), z: -80 },
      { x: WIDTH + 140, y: Math.max(90, HEIGHT * 0.15), z: -240 },
    ],
  }],
  sequences: [
    { id: 'sfc-storm-cycle', cooldownMs: 30000, steps: [
      { actions: [{ type: 'set-environment', state: 'storm' }, { type: 'set-weather', weather: 'rain' }] },
      { afterMs: 12000, actions: [{ type: 'set-weather', weather: 'clear' }, { type: 'set-environment', state: 'night' }] },
    ] },
    { id: 'sfc-bat-swoop', cooldownMs: 60000, steps: [
      { actions: [
        { type: 'set-environment', state: 'moonlit' },
        { type: 'spawn', entity: 'sfc-bat-swoop', at: { x: -120, y: Math.max(110, HEIGHT * 0.18), z: -220 }, as: 'sfc-swooping-bat' },
        { type: 'follow-path', target: 'sfc-swooping-bat', follower: { path: 'sfc-bat-swoop-path', durationMs: 6200, orientToTangent: true, cameraRelative: true } },
      ] },
      { afterMs: 4700, actions: [{ type: 'emit', event: 'sfc-swoop-finale' }] },
      { afterMs: 1700, actions: [{ type: 'set-environment', state: 'night' }] },
    ] },
    { id: 'sfc-temple-glimmer', cooldownMs: 45000, steps: [{ actions: [
      { type: 'emit-particles', effect: 'sfc-magic-glimmer', at: { x: WIDTH * 0.56, y: GROUND_Y - 180, z: 20 }, count: 14 },
    ] }] },
    { id: 'sfc-swoop-sparks', cooldownMs: 30000, steps: [{ actions: [
      { type: 'emit-particles', effect: 'sfc-magic-glimmer', at: { x: WIDTH * 0.58, y: Math.max(210, HEIGHT * 0.42), z: 90 }, count: 10 },
    ] }] },
  ],
  particleEmitters: [
    {
      id: 'sfc-rain-emitter', asset: 'sfc-rain-drop', maxParticles: 96, ratePerSecond: 34,
      lifetimeMs: { min: 1900, max: 2800 }, velocity: { x: { min: -34, max: -20 }, y: { min: 250, max: 320 }, z: { min: -30, max: 30 } },
      opacity: { min: 0.18, max: 0.34 }, scale: { min: 0.7, max: 1.1 }, batched: true,
    },
    {
      id: 'sfc-glimmer-emitter', asset: 'sfc-magic-spark', maxParticles: 28,
      lifetimeMs: { min: 700, max: 1300 }, velocity: { x: { min: -38, max: 38 }, y: { min: -70, max: -20 }, z: { min: -45, max: 45 } },
      acceleration: { x: 0, y: 42, z: 0 }, opacity: { min: 0.5, max: 0.9 }, scale: { min: 0.45, max: 1 }, batched: true,
    },
  ],
  effects: [
    { id: 'sfc-rainfall', type: 'precipitation', emitter: 'sfc-rain-emitter', enabledIn: ['storm'], density: 1 },
    { id: 'sfc-magic-glimmer', type: 'sparks', emitter: 'sfc-glimmer-emitter', density: 0.35 },
  ],
  pools: [
    { id: 'sfc-wagon-pool', entity: 'sfc-wagon-left', initialSize: 1, maxSize: 1 },
    { id: 'sfc-carriage-pool', entity: 'sfc-carriage-right', initialSize: 1, maxSize: 1 },
    { id: 'sfc-bat-pool', entity: 'sfc-bat', initialSize: 1, maxSize: 1 },
  ],
  offscreen: { sleepMargin: 240, suspendAnimation: true, suspendParticles: true, keepLogicalTime: true },
  compositionRules: {
    chunks: { minimumRepeatGap: 3 },
    entities: {
      minimumSpacing: [{ tag: 'traffic', distance: 260 }],
      maxVisible: [{ tag: 'traffic', count: 3 }, { tag: 'airborne', count: 1 }],
    },
  },
  director: {
    maxActivity: 5, trafficCost: 1, sequenceCost: 2, particlesPerActivity: 20,
    rareEventSpacingWorldHours: 4,
    quietPeriods: [{ hours: { min: 2, max: 5 }, maxActivity: 2 }],
    eventCosts: { 'sfc-passing-storm': 2, 'sfc-rare-bat-swoop': 2 },
    conflicts: [['sfc-passing-storm', 'sfc-rare-bat-swoop']],
  },
  performanceBudget: { targetFps: 60, maxDrawCalls: 180, maxTriangles: 8000, maxTextureMemoryMb: 256, maxActiveEntities: 120, targetResolutions: [[1920, 1080], [2560, 1440], [3840, 2160]] },
  metadata: { description: 'A low-motion, television-distance silhouette fantasy screensaver.', styleGuide: '/assets/silhouette-fantasy-city/v1/master-panorama-style-guide-v4.png' },
};
