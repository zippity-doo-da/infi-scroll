import type { WorldTemplate } from '../../../engine/contracts/world';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const TILE_WIDTH = 1672 * 1.15;

export const fifthElementCity: WorldTemplate = {
  id: 'fifth-element-city',
  name: 'Fifth Element City',
  version: 1,
  designProfile: 'illustrated-cinematic',
  layout: { id: 'vertical-city-canyon', tags: ['vertical', 'aerial', 'top-down'], groundY: HEIGHT, chunkHeight: HEIGHT },
  camera: { autoScrollSpeed: 14, inputSpeed: 280 },
  themes: ['retro-futurist', 'industrial', 'night'],
  assetPacks: ['vertical-element-v1'],
  palette: { sky: 0x11191a, ground: 0x11191a, highlight: 0xf19a39 },
  backgrounds: [
    { id: 'vertical-canyon-panorama', asset: 'vertical-city-canyon', depth: -200, parallax: 1, y: HEIGHT / 2, spacing: TILE_WIDTH, scale: { min: 1.15, max: 1.15 } },
  ],
  entities: [
    { id: 'vertical-taxi', asset: 'vertical-flying-taxi', depth: 60, scale: 0.2, anchor: { x: 0.5, y: 0.5 }, components: { tags: ['airborne', 'traffic', 'perspective'] } },
    { id: 'vertical-deco-taxi', asset: 'vertical-deco-taxi', depth: 62, scale: 0.34, anchor: { x: 0.5, y: 0.5 }, components: { tags: ['airborne', 'traffic', 'perspective', 'streamline-moderne'] } },
    { id: 'vertical-van', asset: 'vertical-delivery-van', depth: 58, scale: 0.18, anchor: { x: 0.5, y: 0.5 }, components: { tags: ['airborne', 'traffic', 'perspective'] } },
    { id: 'vertical-patrol', asset: 'vertical-patrol-cruiser', depth: 61, scale: 0.31, anchor: { x: 0.5, y: 0.5 }, components: { tags: ['airborne', 'traffic', 'perspective', 'civic'] } },
    { id: 'vertical-coupe', asset: 'vertical-civilian-coupe', depth: 60, scale: 0.3, anchor: { x: 0.5, y: 0.5 }, components: { tags: ['airborne', 'traffic', 'perspective', 'civilian'] } },
    { id: 'vertical-shuttle', asset: 'vertical-transit-shuttle', depth: 59, scale: 0.27, anchor: { x: 0.5, y: 0.5 }, components: { tags: ['airborne', 'traffic', 'perspective', 'public-transit'] } },
  ],
  animations: [],
  chunks: [{ id: 'vertical-canyon', width: TILE_WIDTH, tags: ['canyon'], objects: [] }],
  chunkPlan: { mode: 'authored', sequence: ['vertical-canyon'], repeat: true },
  paths: [],
  traffic: [],
  motionPaths: [
    { id: 'descent-east', type: 'bezier', durationMs: 8200, points: [
      { x: -180, y: HEIGHT * 0.12, z: -760 }, { x: WIDTH * 0.25, y: HEIGHT * 0.18, z: -480 },
      { x: WIDTH * 0.7, y: HEIGHT * 0.62, z: 80 }, { x: WIDTH + 180, y: HEIGHT * 0.9, z: 520 },
    ] },
    { id: 'ascent-west', type: 'bezier', durationMs: 10400, points: [
      { x: WIDTH + 180, y: HEIGHT * 0.88, z: 460 }, { x: WIDTH * 0.72, y: HEIGHT * 0.65, z: 90 },
      { x: WIDTH * 0.3, y: HEIGHT * 0.28, z: -520 }, { x: -180, y: HEIGHT * 0.15, z: -820 },
    ] },
    { id: 'far-cross-east', type: 'bezier', durationMs: 13200, points: [
      { x: -140, y: HEIGHT * 0.27, z: -980 }, { x: WIDTH * 0.3, y: HEIGHT * 0.22, z: -850 },
      { x: WIDTH * 0.68, y: HEIGHT * 0.34, z: -720 }, { x: WIDTH + 140, y: HEIGHT * 0.3, z: -900 },
    ] },
    { id: 'mid-cross-west', type: 'bezier', durationMs: 9600, points: [
      { x: WIDTH + 160, y: HEIGHT * 0.46, z: -360 }, { x: WIDTH * 0.7, y: HEIGHT * 0.38, z: -240 },
      { x: WIDTH * 0.28, y: HEIGHT * 0.54, z: -120 }, { x: -160, y: HEIGHT * 0.49, z: -300 },
    ] },
    { id: 'near-sweep-east', type: 'bezier', durationMs: 7200, points: [
      { x: -220, y: HEIGHT * 0.72, z: 180 }, { x: WIDTH * 0.3, y: HEIGHT * 0.58, z: 260 },
      { x: WIDTH * 0.72, y: HEIGHT * 0.78, z: 420 }, { x: WIDTH + 220, y: HEIGHT * 0.68, z: 360 },
    ] },
    { id: 'deep-drop', type: 'bezier', durationMs: 11800, points: [
      { x: WIDTH * 0.6, y: -120, z: -820 }, { x: WIDTH * 0.52, y: HEIGHT * 0.2, z: -620 },
      { x: WIDTH * 0.43, y: HEIGHT * 0.7, z: -120 }, { x: WIDTH * 0.35, y: HEIGHT + 140, z: 240 },
    ] },
  ],
  sequences: [
    { id: 'traffic-descent-east', loop: true, steps: [{ afterMs: 400, actions: [
      { type: 'spawn', entity: 'vertical-deco-taxi', as: 'taxi-descent' },
      { type: 'follow-path', target: 'taxi-descent', follower: { path: 'descent-east', durationMs: 8200, orientToTangent: true, cameraRelative: true } },
      { type: 'wait', durationMs: 11300 },
    ] }] },
    { id: 'traffic-ascent-west', loop: true, steps: [{ afterMs: 1700, actions: [
      { type: 'spawn', entity: 'vertical-van', as: 'van-ascent' },
      { type: 'follow-path', target: 'van-ascent', follower: { path: 'ascent-west', durationMs: 10400, orientToTangent: true, cameraRelative: true } },
      { type: 'wait', durationMs: 13700 },
    ] }] },
    { id: 'traffic-far-east', loop: true, steps: [{ afterMs: 900, actions: [
      { type: 'spawn', entity: 'vertical-taxi', as: 'taxi-far' },
      { type: 'follow-path', target: 'taxi-far', follower: { path: 'far-cross-east', durationMs: 13200, orientToTangent: true, cameraRelative: true } },
      { type: 'wait', durationMs: 15900 },
    ] }] },
    { id: 'traffic-mid-west', loop: true, steps: [{ afterMs: 2600, actions: [
      { type: 'spawn', entity: 'vertical-van', as: 'van-mid' },
      { type: 'follow-path', target: 'van-mid', follower: { path: 'mid-cross-west', durationMs: 9600, orientToTangent: true, cameraRelative: true } },
      { type: 'wait', durationMs: 12100 },
    ] }] },
    { id: 'traffic-near-east', loop: true, steps: [{ afterMs: 4100, actions: [
      { type: 'spawn', entity: 'vertical-deco-taxi', as: 'taxi-near' },
      { type: 'follow-path', target: 'taxi-near', follower: { path: 'near-sweep-east', durationMs: 7200, orientToTangent: true, cameraRelative: true } },
      { type: 'wait', durationMs: 14600 },
    ] }] },
    { id: 'traffic-deep-drop', loop: true, steps: [{ afterMs: 3200, actions: [
      { type: 'spawn', entity: 'vertical-van', as: 'van-drop' },
      { type: 'follow-path', target: 'van-drop', follower: { path: 'deep-drop', durationMs: 11800, orientToTangent: true, cameraRelative: true } },
      { type: 'wait', durationMs: 17300 },
    ] }] },
    { id: 'traffic-descent-east-secondary', loop: true, steps: [{ afterMs: 2900, actions: [
      { type: 'spawn', entity: 'vertical-patrol', as: 'van-descent-secondary' },
      { type: 'follow-path', target: 'van-descent-secondary', follower: { path: 'descent-east', durationMs: 9700, orientToTangent: true, cameraRelative: true } },
      { type: 'wait', durationMs: 14800 },
    ] }] },
    { id: 'traffic-ascent-west-secondary', loop: true, steps: [{ afterMs: 5300, actions: [
      { type: 'spawn', entity: 'vertical-coupe', as: 'taxi-ascent-secondary' },
      { type: 'follow-path', target: 'taxi-ascent-secondary', follower: { path: 'ascent-west', durationMs: 11800, orientToTangent: true, cameraRelative: true } },
      { type: 'wait', durationMs: 16100 },
    ] }] },
    { id: 'traffic-far-east-secondary', loop: true, steps: [{ afterMs: 4400, actions: [
      { type: 'spawn', entity: 'vertical-shuttle', as: 'van-far-secondary' },
      { type: 'follow-path', target: 'van-far-secondary', follower: { path: 'far-cross-east', durationMs: 10900, orientToTangent: true, cameraRelative: true } },
      { type: 'wait', durationMs: 13800 },
    ] }] },
    { id: 'traffic-mid-west-secondary', loop: true, steps: [{ afterMs: 6500, actions: [
      { type: 'spawn', entity: 'vertical-deco-taxi', as: 'deco-mid-secondary' },
      { type: 'follow-path', target: 'deco-mid-secondary', follower: { path: 'mid-cross-west', durationMs: 8300, orientToTangent: true, cameraRelative: true } },
      { type: 'wait', durationMs: 11700 },
    ] }] },
    { id: 'traffic-near-east-secondary', loop: true, steps: [{ afterMs: 7600, actions: [
      { type: 'spawn', entity: 'vertical-coupe', as: 'van-near-secondary' },
      { type: 'follow-path', target: 'van-near-secondary', follower: { path: 'near-sweep-east', durationMs: 9100, orientToTangent: true, cameraRelative: true } },
      { type: 'wait', durationMs: 15500 },
    ] }] },
    { id: 'traffic-deep-drop-secondary', loop: true, steps: [{ afterMs: 8200, actions: [
      { type: 'spawn', entity: 'vertical-patrol', as: 'taxi-drop-secondary' },
      { type: 'follow-path', target: 'taxi-drop-secondary', follower: { path: 'deep-drop', durationMs: 13200, orientToTangent: true, cameraRelative: true } },
      { type: 'wait', durationMs: 19300 },
    ] }] },
  ],
  clock: { startHour: 23, realSecondsPerWorldHour: 60, loopHours: 24 },
  environments: [{ id: 'industrial-night', sky: [0x11191a, 0x2a1c20], ambientTint: 0xffffff }],
  initialEnvironment: 'industrial-night',
  weather: [{ id: 'clear' }],
  initialWeather: 'clear',
  events: [],
  triggers: [{ id: 'start-vertical-traffic', when: { type: 'camera-enters-chunk', chunk: 'vertical-canyon' }, once: true, actions: [
    { type: 'start-sequence', sequence: 'traffic-descent-east' },
    { type: 'start-sequence', sequence: 'traffic-ascent-west' },
    { type: 'start-sequence', sequence: 'traffic-far-east' },
    { type: 'start-sequence', sequence: 'traffic-mid-west' },
    { type: 'start-sequence', sequence: 'traffic-near-east' },
    { type: 'start-sequence', sequence: 'traffic-deep-drop' },
    { type: 'start-sequence', sequence: 'traffic-descent-east-secondary' },
    { type: 'start-sequence', sequence: 'traffic-ascent-west-secondary' },
    { type: 'start-sequence', sequence: 'traffic-far-east-secondary' },
    { type: 'start-sequence', sequence: 'traffic-mid-west-secondary' },
    { type: 'start-sequence', sequence: 'traffic-near-east-secondary' },
    { type: 'start-sequence', sequence: 'traffic-deep-drop-secondary' },
  ] }],
  offscreen: { sleepMargin: 160, suspendAnimation: true, suspendParticles: true, keepLogicalTime: true },
  performanceBudget: { targetFps: 60, maxDrawCalls: 120, maxTriangles: 6000, maxTextureMemoryMb: 256, maxActiveEntities: 80, targetResolutions: [[1920, 1080], [2560, 1440]] },
  metadata: { description: 'Top-down retro-futurist vertical traffic canyon proof of concept.', styleGuide: '/assets/vertical-element/v1/master-panorama-style-guide-v2-no-vehicles.png' },
};
