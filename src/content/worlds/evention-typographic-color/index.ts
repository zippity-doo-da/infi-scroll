import type { WorldTemplate } from '../../../engine/contracts/world';

const WIDTH = 1920;
const HEIGHT = 1080;
const VIEW_SCALE = Math.min(1, window.innerWidth / WIDTH);
const VIEW_SPAN = WIDTH * VIEW_SCALE;
const VIEW_Y = window.innerHeight / 2;
const backgroundScale = { min: VIEW_SCALE, max: VIEW_SCALE };
const BACKDROP_SPAN = Math.max(1, VIEW_SPAN - 2);

export const eventionTypographicColor: WorldTemplate = {
  id: 'evention-typographic-color',
  name: 'Evention Typographic Color',
  version: 1,
  designProfile: 'typographic-screensaver',
  layout: { id: 'typographic-field', tags: ['typographic', 'brand', 'abstract'], groundY: HEIGHT, chunkHeight: HEIGHT },
  camera: { autoScrollSpeed: 32, inputSpeed: 340 },
  themes: ['evention', 'brand-color', 'typographic'],
  assetPacks: ['evention-typographic-color-v1'],
  palette: { sky: 0x020203, navy: 0x001451, green: 0x54e577 },
  backgrounds: [
    { id: 'evention-color-field', asset: 'evention-color-black-field', depth: -120, parallax: 0, y: VIEW_Y, spacing: VIEW_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-color-trust-band', asset: 'evention-color-trust-deep', depth: -105, parallax: 0.02, y: VIEW_Y, spacing: BACKDROP_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-color-products-far-band', asset: 'evention-color-products-far', depth: -90, parallax: 0.08, y: VIEW_Y, spacing: BACKDROP_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-color-systems-band', asset: 'evention-color-systems-layer', depth: -70, parallax: 0.18, y: VIEW_Y, spacing: BACKDROP_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-color-products-mid-band', asset: 'evention-color-products-mid', depth: -50, parallax: 0.34, y: VIEW_Y, spacing: BACKDROP_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-color-outcomes-band', asset: 'evention-color-outcomes-layer', depth: -20, parallax: 0.56, y: VIEW_Y, spacing: BACKDROP_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-color-mark-band', asset: 'evention-color-mark', depth: 0, parallax: 0.72, y: VIEW_Y, spacing: BACKDROP_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-color-hero-word', asset: 'evention-color-word', depth: 10, parallax: 1, y: VIEW_Y, spacing: VIEW_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
  ],
  entities: [],
  animations: [],
  chunks: [{ id: 'evention-color-word-cycle', width: VIEW_SPAN, tags: ['typographic', 'authored-word'], objects: [] }],
  chunkPlan: { mode: 'authored', sequence: ['evention-color-word-cycle'], repeat: true },
  paths: [],
  traffic: [],
  clock: { startHour: 0, realSecondsPerWorldHour: 3600, loopHours: 24 },
  environments: [{ id: 'brand-color', sky: [0x020203, 0x020203], ambientTint: 0xffffff }],
  initialEnvironment: 'brand-color',
  weather: [{ id: 'clear' }],
  initialWeather: 'clear',
  events: [],
  triggers: [],
  offscreen: { sleepMargin: 160, suspendAnimation: true, suspendParticles: true, keepLogicalTime: true },
  performanceBudget: { targetFps: 60, maxDrawCalls: 20, maxTriangles: 1000, maxTextureMemoryMb: 64, maxActiveEntities: 8, targetResolutions: [[1920, 1080], [2560, 1440], [3840, 2160]] },
  metadata: {
    description: 'An Evention green-and-navy counterpart to the monochrome typographic scroll.',
    styleGuide: '/assets/evention-typographic-color/v1/master-panorama-style-guide.svg',
    brandReference: 'https://eventionllc.com/',
  },
};
