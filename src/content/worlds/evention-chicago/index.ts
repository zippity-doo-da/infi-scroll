import type { WorldTemplate } from '../../../engine/contracts/world';

const SOURCE_WIDTH = 1672;
const SOURCE_HEIGHT = 941;
const HEIGHT = window.innerHeight;
const SCALE = HEIGHT / SOURCE_HEIGHT;
const SPAN = SOURCE_WIDTH * SCALE;
const SIGNAGE_SPAN = SOURCE_WIDTH * 3 * SCALE;
const RIVER_HEIGHT = 196;
const RIVER_ROUTE_Y = HEIGHT * 0.83;
const TRAIN_ROUTE_Y = HEIGHT * 0.73;

export const eventionChicago: WorldTemplate = {
  id: 'evention-chicago',
  name: 'Evention Chicago',
  version: 1,
  designProfile: 'illustrated-cinematic',
  layout: { id: 'chicago-river-canyon', tags: ['urban', 'riverfront', 'downtown', 'chicago'], groundY: HEIGHT, chunkHeight: HEIGHT },
  camera: { autoScrollSpeed: 28, inputSpeed: 330 },
  themes: ['evention', 'chicago', 'blue-hour', 'customer-city'],
  assetPacks: ['evention-chicago-v1'],
  palette: { sky: 0x0b3470, river: 0x062a58, navy: 0x001451, highlight: 0x54e577 },
  backgrounds: [
    { id: 'echi-skyline-band', asset: 'echi-far-skyline', depth: -120, parallax: 0.035, y: HEIGHT / 2, spacing: SPAN - 2, offsetX: SPAN / 2, scale: { min: SCALE, max: SCALE } },
    { id: 'echi-loop-band', asset: 'echi-loop-wacker-mid', depth: -72, parallax: 0.16, y: HEIGHT / 2, spacing: SPAN - 2, offsetX: SPAN / 2, scale: { min: SCALE, max: SCALE } },
    { id: 'echi-signage-band', asset: 'echi-brand-signage', depth: -68, parallax: 0.16, y: HEIGHT / 2, spacing: SIGNAGE_SPAN - 2, offsetX: SIGNAGE_SPAN / 2, scale: { min: SCALE, max: SCALE } },
    { id: 'echi-river-band', asset: 'echi-river-foreground', depth: -12, parallax: 0.62, y: HEIGHT - (RIVER_HEIGHT * SCALE) / 2, spacing: SPAN - 2, offsetX: SPAN / 2, scale: { min: SCALE, max: SCALE } },
  ],
  entities: [
    { id: 'echi-water-taxi-entity', asset: 'echi-water-taxi', depth: -6, scale: 0.18 * SCALE, anchor: { x: 0.5, y: 1 }, components: { pathFollower: { path: 'echi-river-route', speed: { min: 54, max: 66 }, direction: 1 }, tags: ['traffic', 'waterborne'] } },
    { id: 'echi-cta-entity', asset: 'echi-cta-pair', depth: -5, scale: 0.2 * SCALE, anchor: { x: 0.5, y: 1 }, components: { pathFollower: { path: 'echi-train-route', speed: { min: 74, max: 88 }, direction: -1 }, tags: ['traffic', 'rail', 'elevated'] } },
  ],
  animations: [],
  chunks: [{ id: 'echi-loop-cycle', width: SPAN, tags: ['downtown', 'river-canyon'], objects: [] }],
  chunkPlan: { mode: 'authored', sequence: ['echi-loop-cycle'], repeat: true },
  paths: [
    { id: 'echi-river-route', y: RIVER_ROUTE_Y, xPadding: 260, zone: 'ground', distance: 'mid' },
    { id: 'echi-train-route', y: TRAIN_ROUTE_Y, xPadding: 260, zone: 'sky', distance: 'mid' },
  ],
  traffic: [
    { id: 'echi-water-taxi-traffic', path: 'echi-river-route', entities: ['echi-water-taxi-entity'], intervalMs: { min: 12500, max: 19000 }, initialDelayMs: { min: 1800, max: 3600 }, maxActive: 1, maxActivePerDirection: 1 },
    { id: 'echi-cta-traffic', path: 'echi-train-route', entities: ['echi-cta-entity'], intervalMs: { min: 18000, max: 26000 }, initialDelayMs: { min: 5000, max: 8500 }, maxActive: 1, maxActivePerDirection: 1 },
  ],
  clock: { startHour: 19, realSecondsPerWorldHour: 120, loopHours: 24 },
  environments: [{ id: 'blue-hour', sky: [0x0b3470, 0x143a70], ambientTint: 0xffffff }],
  initialEnvironment: 'blue-hour',
  weather: [{ id: 'clear' }],
  initialWeather: 'clear',
  events: [],
  triggers: [],
  audio: { ambience: 'chicago-river-canyon', music: 'evention-city-theme' },
  pools: [
    { id: 'echi-water-taxi-pool', entity: 'echi-water-taxi-entity', initialSize: 1, maxSize: 1 },
    { id: 'echi-cta-pool', entity: 'echi-cta-entity', initialSize: 1, maxSize: 1 },
  ],
  offscreen: { sleepMargin: 280, suspendAnimation: true, suspendParticles: true, keepLogicalTime: true },
  performanceBudget: { targetFps: 60, maxDrawCalls: 100, maxTriangles: 4000, maxTextureMemoryMb: 220, maxActiveEntities: 24, targetResolutions: [[1920, 1080], [2560, 1440], [3840, 2160]] },
  metadata: {
    description: 'A fictional Evention customer city set in an unmistakable orthographic downtown Chicago river canyon.',
    styleGuide: `${import.meta.env.BASE_URL}assets/evention-chicago/v1/master-panorama-style-guide.png`,
    location: 'Fictional downtown Chicago riverfront',
  },
};
