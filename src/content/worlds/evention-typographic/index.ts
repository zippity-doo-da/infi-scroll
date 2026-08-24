import type { WorldTemplate } from '../../../engine/contracts/world';

const WIDTH = 1920;
const HEIGHT = 1080;
const VIEW_SCALE = Math.min(1, window.innerWidth / WIDTH);
const VIEW_SPAN = WIDTH * VIEW_SCALE;
const VIEW_Y = window.innerHeight / 2;
const backgroundScale = { min: VIEW_SCALE, max: VIEW_SCALE };
const BACKDROP_SPAN = Math.max(1, VIEW_SPAN - 2);

export const eventionTypographic: WorldTemplate = {
  id: 'evention-typographic',
  name: 'Evention Typographic',
  version: 1,
  designProfile: 'typographic-screensaver',
  layout: { id: 'typographic-field', tags: ['typographic', 'brand', 'abstract'], groundY: HEIGHT, chunkHeight: HEIGHT },
  camera: { autoScrollSpeed: 32, inputSpeed: 340 },
  themes: ['evention', 'monochrome', 'typographic'],
  assetPacks: ['evention-typographic-v1'],
  palette: { sky: 0x020203, white: 0xffffff, charcoal: 0x101114 },
  backgrounds: [
    { id: 'evention-field', asset: 'evention-black-field', depth: -120, parallax: 0, y: VIEW_Y, spacing: VIEW_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-trust-deep-band', asset: 'evention-trust-deep', depth: -105, parallax: 0.02, y: VIEW_Y, spacing: BACKDROP_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-products-far-band', asset: 'evention-products-far', depth: -90, parallax: 0.08, y: VIEW_Y, spacing: BACKDROP_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-systems-band', asset: 'evention-systems-layer', depth: -70, parallax: 0.18, y: VIEW_Y, spacing: BACKDROP_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-products-mid-band', asset: 'evention-products-mid', depth: -50, parallax: 0.34, y: VIEW_Y, spacing: BACKDROP_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-outcomes-band', asset: 'evention-outcomes-layer', depth: -20, parallax: 0.56, y: VIEW_Y, spacing: BACKDROP_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
    { id: 'evention-hero-word', asset: 'evention-word', depth: 10, parallax: 1, y: VIEW_Y, spacing: VIEW_SPAN, offsetX: VIEW_SPAN / 2, scale: backgroundScale },
  ],
  entities: [],
  animations: [],
  chunks: [{
    id: 'evention-word-cycle',
    width: VIEW_SPAN,
    tags: ['typographic', 'authored-word'],
    objects: [],
  }],
  chunkPlan: { mode: 'authored', sequence: ['evention-word-cycle'], repeat: true },
  paths: [],
  traffic: [],
  clock: { startHour: 0, realSecondsPerWorldHour: 3600, loopHours: 24 },
  environments: [{ id: 'monochrome', sky: [0x020203, 0x020203], ambientTint: 0xffffff }],
  initialEnvironment: 'monochrome',
  weather: [{ id: 'clear' }],
  initialWeather: 'clear',
  events: [],
  triggers: [],
  offscreen: { sleepMargin: 160, suspendAnimation: true, suspendParticles: true, keepLogicalTime: true },
  performanceBudget: { targetFps: 60, maxDrawCalls: 20, maxTriangles: 1000, maxTextureMemoryMb: 64, maxActiveEntities: 8, targetResolutions: [[1920, 1080], [2560, 1440], [3840, 2160]] },
  metadata: {
    description: 'A monochrome Evention typographic scroll using a transparent, properly kerned word asset and six independently moving message, product, system, and outcome bands.',
    styleGuide: '/assets/evention-typographic/v1/master-panorama-style-guide.svg',
    brandReference: 'https://eventionllc.com/',
  },
};
