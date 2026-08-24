import type { WorldTemplate } from '../../../engine/contracts/world';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const FAR_SCALE = Math.max(1, HEIGHT / 831);
const MID_SCALE = Math.max(1, HEIGHT / 739);
const FORE_SCALE = Math.max(1, HEIGHT / 724);
const SIDEWALK_Y = HEIGHT - 158;
const ROAD_Y = HEIGHT - 18;
const CHUNK_WIDTH = 2360;

export const eventionWacker: WorldTemplate = {
  id: 'evention-wacker',
  name: 'Evention — Wacker & LaSalle',
  version: 1,
  designProfile: 'illustrated-cinematic',
  layout: { id: 'riverfront-office-canyon', tags: ['urban', 'riverfront', 'road', 'chicago'], groundY: ROAD_Y, chunkHeight: HEIGHT },
  camera: { autoScrollSpeed: 30, inputSpeed: 330 },
  themes: ['evention', 'chicago', 'late-afternoon', 'post-rain'],
  assetPacks: ['evention-wacker-v1'],
  palette: { sky: 0x7d94ad, ground: 0x242b35, highlight: 0x54e577 },
  backgrounds: [
    { id: 'chicago-skyline', asset: 'evention-far-skyline', depth: -120, parallax: 0.025, y: HEIGHT / 2, spacing: 1891 * FAR_SCALE, scale: { min: FAR_SCALE, max: FAR_SCALE } },
    { id: 'wacker-architecture', asset: 'evention-mid-architecture', depth: -80, parallax: 0.14, y: HEIGHT - (739 * MID_SCALE) / 2, spacing: 2128 * MID_SCALE, scale: { min: MID_SCALE, max: MID_SCALE } },
    { id: 'wacker-street', asset: 'evention-foreground-street', depth: 0, parallax: 1, y: HEIGHT - (724 * FORE_SCALE) / 2, spacing: 2172 * FORE_SCALE, scale: { min: FORE_SCALE, max: FORE_SCALE } },
  ],
  entities: [
    { id: 'wacker-lobby', asset: 'evention-121-wacker-lobby', depth: 6, scale: 1, anchor: { x: 0.5, y: 1 } },
    { id: 'evention-plaque', asset: 'evention-window-plaque', depth: 8, scale: 0.54, anchor: { x: 0.5, y: 0.5 } },
    { id: 'tips-plaque', asset: 'evention-tips-window-plaque', depth: 8, scale: 0.54, anchor: { x: 0.5, y: 0.5 } },
    { id: 'recon-plaque', asset: 'evention-recon-window-plaque', depth: 8, scale: 0.54, anchor: { x: 0.5, y: 0.5 } },
    { id: 'office-worker', asset: 'evention-office-worker', depth: 18, scale: 0.58, anchor: { x: 0.5, y: 1 }, components: { tags: ['inhabitant', 'grounded', 'stationary'] } },
    { id: 'umbrella-pedestrian', asset: 'evention-umbrella-pedestrian', depth: 18, scale: 0.58, anchor: { x: 0.5, y: 1 }, components: { tags: ['inhabitant', 'grounded', 'stationary'] } },
    { id: 'chicago-taxi', asset: 'evention-chicago-taxi', depth: 35, scale: 1, anchor: { x: 0.5, y: 1 }, components: { pathFollower: { path: 'wacker-road', speed: { min: 75, max: 105 }, direction: 1 }, tags: ['traffic', 'grounded', 'street'] } },
  ],
  animations: [],
  chunks: [
    { id: 'wacker-lasalle-corner', width: CHUNK_WIDTH, tags: ['landmark', 'office', 'riverfront'], objects: [
      { entity: 'wacker-lobby', x: 1180, y: SIDEWALK_Y },
      { entity: 'evention-plaque', x: 1010, y: SIDEWALK_Y - 90 },
      { entity: 'tips-plaque', x: 1190, y: SIDEWALK_Y - 90 },
      { entity: 'recon-plaque', x: 1370, y: SIDEWALK_Y - 90 },
      { entity: 'office-worker', x: 700, y: SIDEWALK_Y },
      { entity: 'umbrella-pedestrian', x: 1660, y: SIDEWALK_Y },
    ] },
  ],
  chunkPlan: { mode: 'authored', sequence: ['wacker-lasalle-corner'], repeat: true },
  paths: [
    { id: 'wacker-road', y: ROAD_Y, xPadding: 180 },
  ],
  traffic: [
    { id: 'wacker-taxis', path: 'wacker-road', entities: ['chicago-taxi'], intervalMs: { min: 7000, max: 11500 }, initialDelayMs: { min: 600, max: 1800 }, maxActive: 2, maxActivePerDirection: 2 },
  ],
  clock: { startHour: 18, realSecondsPerWorldHour: 90, loopHours: 24 },
  environments: [{ id: 'golden-hour', sky: [0x7790aa, 0xe8a955], ambientTint: 0xffffff }],
  initialEnvironment: 'golden-hour',
  weather: [{ id: 'clear' }, { id: 'light-rain', tint: 0xc4d4e6 }],
  initialWeather: 'clear',
  events: [],
  triggers: [],
  audio: { ambience: 'chicago-riverfront', music: 'evention-city-theme' },
  pools: [
    { id: 'chicago-taxi-pool', entity: 'chicago-taxi', initialSize: 2, maxSize: 2 },
  ],
  offscreen: { sleepMargin: 260, suspendAnimation: true, suspendParticles: true, keepLogicalTime: true },
  performanceBudget: { targetFps: 60, maxDrawCalls: 180, maxTriangles: 8000, maxTextureMemoryMb: 320, maxActiveEntities: 120, targetResolutions: [[1920, 1080], [2560, 1440]] },
  metadata: { description: 'A standard side-view parallax scroll of Evention at Wacker and LaSalle in Chicago.', styleGuide: '/assets/evention-wacker/v1/master-panorama-style-guide.png', location: '121 W Wacker Dr, Chicago, IL 60601' },
};
