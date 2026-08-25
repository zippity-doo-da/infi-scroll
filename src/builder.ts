import './builder.css';
import { strToU8, zipSync } from 'fflate';
import type { AssetPack, ChunkTemplate, EntityDefinition, WorldTemplate } from './engine/contracts/world';
import { BUILDER_PREVIEW_STORAGE_KEY, BUILDER_PREVIEW_WORLD_ID, type BuilderPreviewPayload } from './engine/core/BuilderPreview';

type Direction = 'left' | 'static' | 'right';
type Step = 'style' | 'layers' | 'world' | 'traffic';
type RouteDistance = 'near' | 'mid' | 'far';
interface LayerState { id: string; name: string; role: string; src: string; file: string; direction: Direction; parallax: number; height: number; y: number; opacity: number; seamless: boolean; opaque: boolean }
interface TrafficLane { id: string; name: string; vehicle: string; src: string; direction: 'left' | 'right'; speed: number; maxActive: number; y: number; zone: 'ground' | 'sky'; distance: RouteDistance }
interface ArchitectureAsset { id: string; name: string; src: string; file: string }
interface BuilderState {
  step: Step; selectedLayer: string; packId: string; worldName: string; profile: string; flow: 'left' | 'right';
  styleGuideFile?: string; styleGuideSrc?: string; previewPlaying: boolean; chunkMode: 'authored' | 'procedural' | 'hybrid';
  groundY: number; doorHeight: number; humanHeight: number; layers: LayerState[]; architecture: string[]; architectureAssets: ArchitectureAsset[]; traffic: TrafficLane[];
}
interface BuilderProjectFile { kind: 'infi-scroll-builder-project'; version: 2; state: BuilderState }
interface ImportedBuilderProject { kind?: string; version?: number; state?: Partial<BuilderState> }

const ROOT = '/assets/silhouette-fantasy-city/v1';
const builtInArchitecture: ArchitectureAsset[] = [
  'guildhall', 'dancer-inn', 'apothecary', 'bakery', 'workshop', 'townhouse', 'celestial-temple', 'merchant-house', 'civic-archive', 'fortified-gate',
].map((id) => ({ id, name: id.split('-').map((part) => part[0]!.toUpperCase() + part.slice(1)).join(' '), src: `${ROOT}/runtime/${id}.png`, file: `${id}.png` }));

const initialState: BuilderState = {
  step: 'layers', selectedLayer: 'street', packId: 'silhouette-fantasy-city', worldName: 'Silhouette Fantasy City', profile: 'silhouette-screensaver', flow: 'left', previewPlaying: true, chunkMode: 'authored', styleGuideFile: 'master-panorama-style-guide-v4.png', styleGuideSrc: `${ROOT}/master-panorama-style-guide-v4.png`,
  groundY: 78, doorHeight: 135, humanHeight: 100,
  layers: [
    { id: 'sky', name: 'Sky', role: 'sky', src: `${ROOT}/runtime/sky-seamless.png`, file: 'sky.png', direction: 'static', parallax: .015, height: 100, y: 50, opacity: 100, seamless: true, opaque: true },
    { id: 'far-city', name: 'Far city', role: 'mid-background', src: `${ROOT}/runtime/mid-seamless.png`, file: 'city.png', direction: 'left', parallax: .09, height: 62, y: 48, opacity: 88, seamless: true, opaque: false },
    { id: 'street', name: 'Street', role: 'street', src: `${ROOT}/runtime/street-seamless.png`, file: 'street.png', direction: 'left', parallax: 1, height: 29, y: 85, opacity: 100, seamless: true, opaque: true },
  ],
  architecture: builtInArchitecture.map((asset) => asset.id), architectureAssets: [],
  traffic: [
    { id: 'far-lane', name: 'Far lane', vehicle: 'Carriage', src: `${ROOT}/runtime/carriage-roll.png`, direction: 'right', speed: 40, maxActive: 1, y: 84, zone: 'ground', distance: 'mid' },
    { id: 'near-lane', name: 'Near lane', vehicle: 'Wagon', src: `${ROOT}/runtime/wagon-roll.png`, direction: 'left', speed: 48, maxActive: 1, y: 93, zone: 'ground', distance: 'near' },
  ],
};

const EVENTION_ROOT = '/assets/evention-typographic/v1';
const eventionState: BuilderState = {
  step: 'layers', selectedLayer: 'evention-word', packId: 'evention-typographic', worldName: 'Evention Typographic', profile: 'typographic-screensaver', flow: 'left', previewPlaying: true, chunkMode: 'authored', styleGuideFile: 'master-panorama-style-guide.svg', styleGuideSrc: `${EVENTION_ROOT}/master-panorama-style-guide.svg`,
  groundY: 92, doorHeight: 135, humanHeight: 100,
  layers: [
    { id: 'black-field', name: 'Black field', role: 'sky', src: `${EVENTION_ROOT}/runtime/black-field.svg`, file: 'black-field.svg', direction: 'static', parallax: 0, height: 100, y: 50, opacity: 100, seamless: true, opaque: true },
    { id: 'trust-deep', name: 'Trust messaging · deep', role: 'far-background', src: `${EVENTION_ROOT}/runtime/trust-deep.svg`, file: 'trust-deep.svg', direction: 'left', parallax: .02, height: 100, y: 50, opacity: 100, seamless: true, opaque: false },
    { id: 'products-far', name: 'Products · far', role: 'far-background', src: `${EVENTION_ROOT}/runtime/products-far.svg`, file: 'products-far.svg', direction: 'left', parallax: .08, height: 100, y: 50, opacity: 100, seamless: true, opaque: false },
    { id: 'systems', name: 'Connected systems', role: 'far-background', src: `${EVENTION_ROOT}/runtime/systems-layer.svg`, file: 'systems-layer.svg', direction: 'left', parallax: .18, height: 100, y: 50, opacity: 100, seamless: true, opaque: false },
    { id: 'products-mid', name: 'Products · middle', role: 'mid-background', src: `${EVENTION_ROOT}/runtime/products-mid.svg`, file: 'products-mid.svg', direction: 'left', parallax: .34, height: 100, y: 50, opacity: 100, seamless: true, opaque: false },
    { id: 'outcomes', name: 'Outcomes · near', role: 'mid-background', src: `${EVENTION_ROOT}/runtime/outcomes-layer.svg`, file: 'outcomes-layer.svg', direction: 'left', parallax: .56, height: 100, y: 50, opacity: 100, seamless: true, opaque: false },
    { id: 'evention-word', name: 'Evention wordmark', role: 'foreground', src: `${EVENTION_ROOT}/runtime/evention-word.svg`, file: 'evention-word.svg', direction: 'left', parallax: 1, height: 100, y: 50, opacity: 100, seamless: true, opaque: false },
  ],
  architecture: [], architectureAssets: [],
  traffic: [],
};

const EVENTION_COLOR_ROOT = '/assets/evention-typographic-color/v1';
const eventionColorState: BuilderState = {
  ...structuredClone(eventionState),
  packId: 'evention-typographic-color',
  worldName: 'Evention Typographic Color',
  styleGuideFile: 'master-panorama-style-guide.svg',
  styleGuideSrc: `${EVENTION_COLOR_ROOT}/master-panorama-style-guide.svg`,
  layers: eventionState.layers.flatMap((layer) => {
    const colored = { ...layer, src: layer.src.replace(EVENTION_ROOT, EVENTION_COLOR_ROOT) };
    return layer.id === 'evention-word'
      ? [{ id: 'evention-mark', name: 'Evention E swatch', role: 'foreground', src: `${EVENTION_COLOR_ROOT}/runtime/evention-mark.svg`, file: 'evention-mark.svg', direction: 'left' as const, parallax: .72, height: 100, y: 50, opacity: 100, seamless: true, opaque: false }, colored]
      : [colored];
  }),
};

const requestedPreset = new URLSearchParams(window.location.search).get('preset');
const builderDefaultState = requestedPreset === 'evention-typographic-color'
  ? eventionColorState
  : requestedPreset === 'evention-typographic' ? eventionState : initialState;
const storageKey = requestedPreset ? `infi-scroll-builder:${requestedPreset}` : 'infi-scroll-builder';
const presetOptions = [
  { id: 'silhouette-fantasy-city', name: 'Silhouette Fantasy City' },
  { id: 'evention-typographic', name: 'Evention Typographic' },
  { id: 'evention-typographic-color', name: 'Evention Typographic Color' },
];

function architectureCatalog(source = state): ArchitectureAsset[] {
  return [...new Map([...builtInArchitecture, ...(source.architectureAssets ?? [])].map((asset) => [asset.id, asset])).values()];
}

function restore(): BuilderState {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as Partial<BuilderState> | null;
    if (!saved) return structuredClone(builderDefaultState);
    const defaults = new Map(builderDefaultState.layers.map((layer) => [layer.id, layer]));
    const layers = (saved.layers ?? builderDefaultState.layers).flatMap((layer) => {
      if (!layer.src.startsWith('blob:')) return [layer];
      const fallback = defaults.get(layer.id);
      return fallback ? [{ ...layer, src: fallback.src, file: fallback.file }] : [];
    }).map((layer) => ({ ...layer, y: layer.y ?? defaults.get(layer.id)?.y ?? 50 }));
    const traffic = (saved.traffic ?? builderDefaultState.traffic).map((lane) => {
      const restoredLane = lane.src.startsWith('blob:') ? (builderDefaultState.traffic.find((fallback) => fallback.id === lane.id) ?? lane) : lane;
      const zone = restoredLane.zone ?? (restoredLane.vehicle === 'Bat' || restoredLane.y < 65 ? 'sky' : 'ground');
      return { ...restoredLane, zone, distance: restoredLane.distance ?? (zone === 'sky' ? 'far' : restoredLane.id.includes('far') ? 'mid' : 'near') } as TrafficLane;
    });
    const architectureAssets = saved.architectureAssets ?? [];
    const knownArchitecture = new Set([...builtInArchitecture, ...architectureAssets].map((asset) => asset.id));
    const restored = { ...structuredClone(builderDefaultState), ...saved, layers, traffic, architectureAssets, architecture: (saved.architecture ?? builderDefaultState.architecture).filter((id) => knownArchitecture.has(id)) };
    if (!restored.layers.some((layer) => layer.id === restored.selectedLayer)) restored.selectedLayer = restored.layers.at(-1)?.id ?? 'street';
    return restored;
  } catch { return structuredClone(builderDefaultState); }
}

let state = restore();
if (state.flow === 'right') state.flow = 'left';
state.traffic.forEach((lane) => { lane.src = vehicleSource(lane.vehicle); });
const app = document.querySelector<HTMLElement>('#builder-app')!;

const icons = {
  style: '<svg viewBox="0 0 24 24"><path d="M4 20c3 0 5-1.5 5-4.5 0-1.4 1.1-2.5 2.5-2.5H13l7-7-2-2-7 7v1.5C7.5 12.5 4 15 4 20Z"/></svg>',
  layers: '<svg viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5 9-5Zm-7.5 9L12 16l7.5-4M4.5 16 12 20l7.5-4"/></svg>',
  world: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
  traffic: '<svg viewBox="0 0 24 24"><path d="M4 15h16l-2-6H7l-3 6Zm2 0v3m12-3v3M8 12h8M6 18h.01M18 18h.01"/></svg>',
};

let saveTimer = 0;
let previewTimer = 0;
function save(): void {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { showToast('Settings saved, but uploaded images are too large to persist.', 'warn'); }
  }, 80);
}
function escape(value: string): string { return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!); }

function distancePresentation(distance: RouteDistance) {
  return distance === 'far'
    ? { scale: .48, alpha: .68, speed: .58, depth: 3 }
    : distance === 'mid'
      ? { scale: .72, alpha: .86, speed: .78, depth: 4 }
      : { scale: 1, alpha: 1, speed: 1, depth: 5 };
}

function layerDuration(parallax: number): number {
  return Math.min(300, Math.max(8, Math.round(12 / Math.max(0.02, parallax))));
}

function previewAssetId(kind: string, id: string): string {
  return `builder-${kind}-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function createPreviewPayload(): BuilderPreviewPayload {
  const packId = 'builder-preview-pack';
  const groundY = Math.round(1080 * state.groundY / 100);
  const architectureAssets = architectureCatalog().filter((asset) => state.architecture.includes(asset.id));
  const trafficAssets = [...new Map(state.traffic.map((lane) => [lane.vehicle, lane])).values()];
  const assets: AssetPack['assets'] = [
    ...state.layers.map((layer) => ({
      id: previewAssetId('layer', layer.id), source: layer.src,
      metadata: { role: layer.role, opaque: layer.opaque, seamlessWidth: 1920, bakedMovingObjects: false },
    })),
    ...architectureAssets.map((asset) => ({ id: previewAssetId('architecture', asset.id), source: asset.src, metadata: { role: 'architecture' } })),
    ...trafficAssets.map((lane) => ({
      id: previewAssetId('traffic', lane.vehicle), source: lane.src,
      frameWidth: lane.vehicle === 'Bat' ? 128 : 256, frameHeight: lane.vehicle === 'Bat' ? 128 : 256,
      metadata: { role: lane.zone === 'sky' ? 'ambient-flight' : 'vehicle', frames: lane.vehicle === 'Bat' ? 4 : 6 },
    })),
  ];
  const pack: AssetPack = {
    id: packId, version: 1, compatibility: { provides: ['builder-preview'] }, assets,
    style: {
      guide: state.styleGuideFile ?? 'builder-style-guide',
      palette: { sky: 0x0d1030, violet: 0x261a4c, amber: 0xffa62b, ink: 0x090914 },
      outline: { color: 0x090914, relativeWeight: 0.012 },
      detail: state.profile === 'silhouette-screensaver' ? 'medium' : 'high', groundAnchor: 'bottom-center',
    },
    recipes: architectureAssets.map((asset) => ({ id: `recipe-${asset.id}`, asset: previewAssetId('architecture', asset.id), role: 'building', anchor: { x: 0.5, y: 1 }, tags: ['architecture', 'grounded'] })),
  };
  const entities: EntityDefinition[] = [
    ...architectureAssets.map((asset) => ({ id: `building-${asset.id}`, asset: previewAssetId('architecture', asset.id), depth: 8, anchor: { x: 0.5, y: 1 }, components: { tags: ['grounded'] } })),
    ...state.traffic.map((lane) => ({
      id: `traffic-${lane.id}`, asset: previewAssetId('traffic', lane.vehicle), animation: `animation-${lane.id}`,
      depth: lane.zone === 'sky' ? 12 : lane.distance === 'near' ? 40 : 30,
      scale: lane.zone === 'sky' ? 0.62 : lane.distance === 'near' ? 0.8 : 0.68,
      anchor: { x: 0.5, y: lane.zone === 'sky' ? 0.5 : 1 },
      components: { pathFollower: { path: `path-${lane.id}`, speed: { min: Math.max(10, lane.speed - 6), max: lane.speed + 6 }, direction: lane.direction === 'left' ? -1 as const : 1 as const }, tags: [lane.zone === 'sky' ? 'airborne' : 'grounded', 'traffic'] },
    })),
  ];
  const chunks: ChunkTemplate[] = architectureAssets.length
    ? architectureAssets.map((asset) => ({ id: `chunk-${asset.id}`, width: 430, tags: ['architecture'], objects: [{ entity: `building-${asset.id}`, x: 215, y: groundY }] }))
    : [{ id: 'empty-composition', width: 1920, objects: [] }];
  const chunkIds = chunks.map((chunk) => chunk.id);
  const chunkPlan: WorldTemplate['chunkPlan'] = state.chunkMode === 'procedural'
    ? { mode: 'procedural', pool: chunkIds, avoidImmediateRepeat: true }
    : state.chunkMode === 'hybrid' && chunks.length > 3
      ? { mode: 'hybrid', sequence: chunkIds.slice(0, 3), pool: chunkIds.slice(3) }
      : { mode: 'authored', sequence: chunkIds, repeat: true };
  const world: WorldTemplate = {
    id: BUILDER_PREVIEW_WORLD_ID, name: state.worldName, version: 1, designProfile: state.profile,
    layout: { id: 'builder-composition', tags: ['builder-preview'], groundY, chunkHeight: 1080 },
    camera: { autoScrollSpeed: state.previewPlaying ? 28 : 0, inputSpeed: 340 }, themes: [], assetPacks: [packId],
    palette: pack.style!.palette,
    backgrounds: state.layers.map((layer, index) => ({
      id: layer.id, asset: previewAssetId('layer', layer.id), depth: -900 + index * 100,
      parallax: layer.direction === 'static' ? 0 : layer.direction === 'right' ? -layer.parallax : layer.parallax,
      y: Math.round(1080 * layer.y / 100), spacing: 1920, height: Math.round(1080 * layer.height / 100), opacity: layer.opacity / 100,
    })),
    entities,
    animations: state.traffic.map((lane) => {
      const frameCount = lane.vehicle === 'Bat' ? 4 : 6;
      const frames = Array.from({ length: frameCount }, (_, index) => index);
      return { id: `animation-${lane.id}`, asset: previewAssetId('traffic', lane.vehicle), frames: lane.direction === 'left' ? frames : frames.reverse(), frameRate: 6, repeat: -1 };
    }),
    chunks, chunkPlan,
    paths: state.traffic.map((lane) => ({ id: `path-${lane.id}`, y: Math.round(1080 * lane.y / 100), xPadding: 160, zone: lane.zone, distance: lane.distance })),
    traffic: state.traffic.map((lane) => ({ id: `traffic-${lane.id}`, path: `path-${lane.id}`, entities: [`traffic-${lane.id}`], intervalMs: { min: 9000, max: 14000 }, initialDelayMs: { min: 200, max: 900 }, maxActive: lane.maxActive, maxActivePerDirection: 1 })),
    clock: { startHour: 21, realSecondsPerWorldHour: 60, loopHours: 24 },
    environments: [{ id: 'default', sky: [0x0d1030, 0x2a1a4c], ambientTint: 0xffffff }], initialEnvironment: 'default',
    weather: [{ id: 'clear' }], initialWeather: 'clear', events: [], triggers: [],
    pools: state.traffic.map((lane) => ({ id: `pool-${lane.id}`, entity: `traffic-${lane.id}`, initialSize: Math.min(1, lane.maxActive), maxSize: lane.maxActive })),
    offscreen: { sleepMargin: 240, suspendAnimation: true, suspendParticles: true, keepLogicalTime: true },
    compositionRules: {
      chunks: { minimumRepeatGap: state.chunkMode === 'authored' ? 0 : Math.min(3, Math.max(0, chunks.length - 1)) },
      entities: { minimumSpacing: [{ tag: 'traffic', distance: 260 }], maxVisible: [{ tag: 'traffic', count: Math.max(1, state.traffic.reduce((sum, lane) => sum + lane.maxActive, 0)) }] },
    },
    director: { maxActivity: Math.max(1, state.traffic.reduce((sum, lane) => sum + lane.maxActive, 0)), trafficCost: 1, sequenceCost: 2, particlesPerActivity: 20, rareEventSpacingWorldHours: 4 },
    performanceBudget: { targetFps: 60, maxDrawCalls: 180, maxTriangles: 8000, maxTextureMemoryMb: 256, maxActiveEntities: 120, targetResolutions: [[1920, 1080]] },
  };
  return { pack, world };
}

function publishBuilderPreview(reload = true): void {
  localStorage.setItem(BUILDER_PREVIEW_STORAGE_KEY, JSON.stringify(createPreviewPayload()));
  if (!reload) return;
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(() => {
    const frame = document.querySelector<HTMLIFrameElement>('#runtime-preview');
    frame?.contentWindow?.location.reload();
  }, 140);
}

function render(): void {
  publishBuilderPreview(false);
  const selected = state.layers.find((layer) => layer.id === state.selectedLayer) ?? state.layers[0]!;
  app.innerHTML = `
    <div class="builder-shell">
      <header class="topbar">
        <a class="brand" href="/" aria-label="Return to world selector"><span class="brand-mark">⌂</span><span>World Pack Builder</span></a>
        <div class="top-actions">
          <label class="preset-title"><span>Load</span><select id="builder-preset" aria-label="Load reference world">${presetOptions.map((preset) => `<option value="${preset.id}" ${(requestedPreset ?? 'silhouette-fantasy-city') === preset.id ? 'selected' : ''}>${preset.name}</option>`).join('')}</select></label>
          <label class="pack-title"><span>Pack</span><input id="pack-id" value="${escape(state.packId)}" aria-label="Pack identifier"></label>
          <label class="quiet-button import-button"><input id="import-project" type="file" accept="application/json,.json"><span>Import</span></label>
          <button class="quiet-button" id="preview-toggle">${state.previewPlaying ? 'Pause preview' : 'Play preview'}</button>
          <button class="quiet-button" id="reset-draft">Reset draft</button>
          <button class="primary-button compact" id="validate-top">Validate</button>
        </div>
      </header>

      <aside class="workflow" aria-label="Builder workflow">
        ${(['style', 'layers', 'world', 'traffic'] as Step[]).map((step, index) => `<button class="workflow-step ${state.step === step ? 'active' : ''}" data-step="${step}"><span class="step-number">${index + 1}</span>${icons[step]}<span>${step[0]!.toUpperCase() + step.slice(1)}</span></button>`).join('')}
      </aside>

      <section class="workspace">
        <div class="canvas-frame">
          <div class="world-canvas flow-${state.flow} ${state.previewPlaying ? '' : 'paused'}" id="world-canvas">
            <iframe id="runtime-preview" title="Actual Phaser world preview" src="/index.html?world=${BUILDER_PREVIEW_WORLD_ID}&seed=12345&builder=1&calibrate=1"></iframe>
            <nav class="layer-rail" aria-label="Scene layers">${state.layers.map((layer) => `<button data-select-layer="${layer.id}" class="${layer.id === state.selectedLayer ? 'active' : ''}"><i></i>${escape(layer.name)}</button>`).join('')}</nav>
          </div>
        </div>
        <div class="asset-tray">
          ${state.profile === 'typographic-screensaver'
            ? `<div class="tray-title"><span>Typographic layers</span><small>${state.layers.length} loaded · no architecture required</small></div><div class="asset-strip">${state.layers.map((layer) => `<button class="asset-thumb ${layer.id === state.selectedLayer ? 'selected' : ''}" data-select-layer="${layer.id}" title="${escape(layer.name)}"><img src="${escape(layer.src)}" alt=""><span>${escape(layer.name)}</span></button>`).join('')}</div>`
            : `<div class="tray-title"><span>Architecture</span><small>${state.architecture.length} selected · minimum 8</small></div><div class="asset-strip">${architectureCatalog().map((asset) => `<button class="asset-thumb ${state.architecture.includes(asset.id) ? 'selected' : ''}" data-architecture="${asset.id}" title="${escape(asset.name)}"><img src="${escape(asset.src)}" alt=""><span>${escape(asset.name)}</span></button>`).join('')}<label class="asset-thumb add-asset"><input type="file" accept="image/png,image/webp,image/svg+xml" id="architecture-file"><span class="plus">+</span><span>Add asset</span></label></div>`}
        </div>
      </section>

      <aside class="inspector">
        ${inspectorMarkup(selected)}
      </aside>

      <section class="validation-rail">
        <button class="rail-heading" id="validate-bottom"><span>Validate</span><small>Run all design-profile checks</small></button>
        <div class="checks" id="checks">${validationMarkup()}</div>
        <div class="export-actions">
          <button class="export-button" id="export-pack">Project files</button>
          <button class="export-button" id="export-scroller">Scroller ZIP</button>
          <button class="install-button" id="install-world">Install world</button>
        </div>
      </section>
      <div class="builder-toast" id="builder-toast" role="status"></div>
    </div>`;
  bindEvents();
}

function inspectorMarkup(selected: LayerState): string {
  if (state.step === 'style') return `
    <div class="inspector-heading"><span>Style rules</span><strong>${escape(state.worldName)}</strong></div>
    <label class="field"><span>World name</span><input id="world-name" value="${escape(state.worldName)}"></label>
    <label class="field"><span>Design profile</span><select id="profile"><option value="silhouette-screensaver" ${state.profile === 'silhouette-screensaver' ? 'selected' : ''}>Roku-style silhouette</option><option value="typographic-screensaver" ${state.profile === 'typographic-screensaver' ? 'selected' : ''}>Typographic screensaver</option><option value="illustrated-cinematic" ${state.profile === 'illustrated-cinematic' ? 'selected' : ''}>Illustrated cinematic</option></select></label>
    <label class="upload-box"><input type="file" id="style-guide" accept="image/png,image/jpeg,image/webp,image/svg+xml"><span>Master panorama</span><strong>${state.styleGuideFile ? escape(state.styleGuideFile) : 'Drop or choose style guide'}</strong><small>Every asset should reference this image.</small></label>
    <div class="rule-summary"><span>Palette</span><div class="swatches"><i></i><i></i><i></i><i></i><i></i></div><small>5 of 8 colors</small></div>
    <div class="inspector-note">The selected profile controls allowable detail, scale, traffic, animation rate, and background depth.</div>`;
  if (state.step === 'world') return `
    <div class="inspector-heading"><span>World composition</span><strong>${state.chunkMode === 'authored' ? 'Authored sequence' : state.chunkMode === 'procedural' ? 'Controlled procedural' : 'Hybrid'}</strong></div>
    <label class="field"><span>World flow</span><span class="segmented"><button data-flow="left" class="active">← Forward scroll</button></span></label>
    ${rangeField('ground-y', 'Ground line', state.groundY, 55, 88, '%')}
    ${rangeField('human-height', 'Human height', state.humanHeight, 85, 115, 'px')}
    ${rangeField('door-height', 'Door height', state.doorHeight, 115, 155, 'px')}
    <div class="field"><span>Chunk recipe</span><select id="chunk-mode"><option value="authored" ${state.chunkMode === 'authored' ? 'selected' : ''}>Authored sequence</option><option value="procedural" ${state.chunkMode === 'procedural' ? 'selected' : ''}>Controlled procedural</option><option value="hybrid" ${state.chunkMode === 'hybrid' ? 'selected' : ''}>Hybrid</option></select></div>
    <div class="inspector-note">Buildings share one ground line. The validator prevents an architecture duplicate inside one 1920px viewport.</div>`;
  if (state.step === 'traffic') return `
    <div class="inspector-heading"><span>Traffic routes</span><strong>${state.traffic.length} active lanes</strong></div>
    ${state.traffic.map((lane) => `<div class="lane-editor"><div><strong>${lane.name}</strong><button class="remove-lane" data-remove-lane="${lane.id}" aria-label="Remove ${lane.name}">×</button></div><label class="field"><span>Vehicle</span><select data-lane-vehicle="${lane.id}"><option ${lane.vehicle === 'Wagon' ? 'selected' : ''}>Wagon</option><option ${lane.vehicle === 'Carriage' ? 'selected' : ''}>Carriage</option><option ${lane.vehicle === 'Bat' ? 'selected' : ''}>Bat</option></select></label><label class="field"><span>Route type</span><select data-lane-zone="${lane.id}"><option value="ground" ${lane.zone === 'ground' ? 'selected' : ''}>Road</option><option value="sky" ${lane.zone === 'sky' ? 'selected' : ''}>Sky</option></select></label><label class="field"><span>Distance</span><select data-lane-distance="${lane.id}"><option value="near" ${lane.distance === 'near' ? 'selected' : ''}>Near</option><option value="mid" ${lane.distance === 'mid' ? 'selected' : ''}>Middle</option><option value="far" ${lane.distance === 'far' ? 'selected' : ''}>Far</option></select></label><label class="field"><span>Direction</span><span class="segmented mini"><button data-lane-direction="${lane.id}:left" class="${lane.direction === 'left' ? 'active' : ''}">←</button><button data-lane-direction="${lane.id}:right" class="${lane.direction === 'right' ? 'active' : ''}">→</button></span></label>${rangeField(`speed-${lane.id}`, 'Base speed', lane.speed, 20, 100, '')}${rangeField(`lane-y-${lane.id}`, lane.zone === 'sky' ? 'Altitude' : 'Track height', lane.y, lane.zone === 'sky' ? 10 : 68, lane.zone === 'sky' ? 68 : 96, '%')}<label class="field inline"><span>On screen</span><input data-lane-max="${lane.id}" type="number" min="0" max="1" value="${lane.maxActive}"></label></div>`).join('')}
    <div class="route-actions"><button class="secondary-button" data-add-route="ground">+ Road lane</button><button class="secondary-button" data-add-route="sky">+ Sky route</button></div>
    <div class="inspector-note">Profile limits: 2 road movers and 3 sky movers. Distance automatically controls scale, depth, contrast, apparent speed, and frequency.</div>`;
  return `
    <div class="inspector-heading"><span>Selected layer</span><strong>${escape(selected.name)}</strong></div>
    <div class="asset-picker"><img src="${escape(selected.src)}" alt=""><label><input type="file" id="layer-file" accept="image/png,image/webp,image/svg+xml"><span>Replace asset</span><small>PNG, WebP or SVG</small></label></div>
    <label class="field"><span>Role</span><select id="layer-role"><option value="sky" ${selected.role === 'sky' ? 'selected' : ''}>Sky</option><option value="far-background" ${selected.role === 'far-background' ? 'selected' : ''}>Far backdrop</option><option value="mid-background" ${selected.role === 'mid-background' ? 'selected' : ''}>Secondary backdrop</option><option value="street" ${selected.role === 'street' ? 'selected' : ''}>Street / ground</option><option value="foreground" ${selected.role === 'foreground' ? 'selected' : ''}>Foreground</option></select></label>
    <label class="field"><span>Direction</span><span class="segmented"><button data-direction="left" class="${selected.direction === 'left' ? 'active' : ''}">←</button><button data-direction="static" class="${selected.direction === 'static' ? 'active' : ''}">•</button><button data-direction="right" class="${selected.direction === 'right' ? 'active' : ''}">→</button></span></label>
    ${rangeField('layer-parallax', 'Parallax', Math.round(selected.parallax * 100), 0, 100, '%')}
    ${rangeField('layer-y', 'Vertical position', selected.y, 0, 100, '%')}
    ${rangeField('layer-height', 'Height', selected.height, 10, 100, '%')}
    ${rangeField('layer-opacity', 'Opacity', selected.opacity, 10, 100, '%')}
    <label class="toggle-field"><span><strong>Seamless</strong><small>Blend and validate both edges</small></span><input id="layer-seamless" type="checkbox" ${selected.seamless ? 'checked' : ''}><i></i></label>
    <button class="secondary-button" id="add-layer">+ Add backdrop layer</button>
    <div class="layer-actions"><button id="layer-up">↑ Move</button><button id="layer-down">↓ Move</button><button id="remove-layer" ${state.layers.length <= 3 ? 'disabled' : ''}>Remove</button></div>`;
}

function rangeField(id: string, label: string, value: number, min: number, max: number, suffix: string): string {
  return `<label class="field range-field"><span>${label}</span><input id="${id}" type="range" min="${min}" max="${max}" value="${value}"><output>${value}${suffix}</output></label>`;
}

function checks() {
  const totalTraffic = state.traffic.reduce((sum, lane) => sum + lane.maxActive, 0);
  const roadTraffic = state.traffic.filter((lane) => lane.zone === 'ground').reduce((sum, lane) => sum + lane.maxActive, 0);
  const skyTraffic = state.traffic.filter((lane) => lane.zone === 'sky').reduce((sum, lane) => sum + lane.maxActive, 0);
  if (state.profile === 'typographic-screensaver') return [
    { name: 'Scale', pass: true, text: 'Typographic layers use the 1920×1080 reference canvas.' },
    { name: 'Seams', pass: state.layers.every((layer) => layer.seamless || layer.opaque), text: 'Every text band has a repeat rule.' },
    { name: 'Repetition', pass: state.layers.some((layer) => layer.role === 'foreground'), text: 'A foreground hero wordmark is present.' },
    { name: 'Traffic', pass: state.traffic.length === 0, text: 'Typographic preset contains no entity traffic.' },
    { name: 'Performance', pass: state.layers.length <= 8, text: `${state.layers.length}/8 typographic layers.` },
  ];
  return [
    { name: 'Scale', pass: state.humanHeight >= 85 && state.humanHeight <= 115 && state.doorHeight >= 115 && state.doorHeight <= 155, text: 'Human, doorway and ground anchors agree.' },
    { name: 'Seams', pass: state.layers.every((layer) => layer.seamless || layer.opaque), text: 'Backdrop edges have repeat rules.' },
    { name: 'Repetition', pass: state.architecture.length >= 8, text: `${state.architecture.length} unique architecture assets selected.` },
    { name: 'Traffic', pass: totalTraffic <= 5 && roadTraffic <= 2 && skyTraffic <= 3 && state.traffic.every((lane) => lane.maxActive <= 1), text: `${roadTraffic}/2 road and ${skyTraffic}/3 sky movers.` },
    { name: 'Performance', pass: state.layers.length <= 4 && state.architecture.length <= 12, text: `${state.layers.length} layers and ${state.architecture.length} architecture assets.` },
  ];
}

function validationMarkup(): string {
  const steps: Step[] = ['world', 'layers', 'world', 'traffic', 'layers'];
  return checks().map((check, index) => `<button class="check ${check.pass ? 'pass' : 'fail'}" data-check-step="${steps[index]}"><span><strong>${check.name}</strong><small>${check.text}</small></span><i>${check.pass ? '✓' : '!'}</i></button>`).join('');
}

function bindRange(id: string, update: (value: number) => void): void {
  const input = document.querySelector<HTMLInputElement>(`#${id}`);
  if (!input) return;
  const output = input.nextElementSibling as HTMLOutputElement | null;
  const suffix = output?.textContent?.replace(/[\d.-]/g, '') ?? '';
  input.addEventListener('input', () => {
    update(Number(input.value));
    if (output) output.value = `${input.value}${suffix}`;
    syncPreview(); updateValidation(); save();
  });
}

function vehicleSource(vehicle: string): string {
  if (vehicle === 'Carriage') return `${ROOT}/runtime/carriage-roll.png`;
  if (vehicle === 'Bat') return `${ROOT}/runtime/bat-flight.png`;
  return `${ROOT}/runtime/wagon-roll.png`;
}

function syncPreview(): void {
  publishBuilderPreview();
}

function updateValidation(): void {
  const container = document.querySelector('#checks');
  if (container) container.innerHTML = validationMarkup();
}

function showToast(message: string, tone: 'ok' | 'warn' = 'ok'): void {
  const toast = document.querySelector<HTMLElement>('#builder-toast');
  if (!toast) return;
  toast.textContent = message; toast.className = `builder-toast visible ${tone}`;
  window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

function bindEvents(): void {
  document.querySelector<HTMLSelectElement>('#builder-preset')?.addEventListener('change', (event) => {
    const preset = (event.target as HTMLSelectElement).value;
    window.location.assign(`/builder.html?preset=${encodeURIComponent(preset)}`);
  });
  document.querySelector<HTMLInputElement>('#import-project')?.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const project = JSON.parse(await file.text()) as ImportedBuilderProject;
      if (project.kind !== 'infi-scroll-builder-project' || ![1, 2].includes(project.version ?? 0) || !project.state) throw new Error('Not an Infi Scroll builder project');
      if (!Array.isArray(project.state.layers) || !Array.isArray(project.state.traffic) || !project.state.layers.length) throw new Error('Builder project is incomplete');
      state = { ...structuredClone(builderDefaultState), ...project.state, architectureAssets: project.state.architectureAssets ?? [] };
      if (!state.layers.some((layer) => layer.id === state.selectedLayer)) state.selectedLayer = state.layers[0]!.id;
      localStorage.setItem(storageKey, JSON.stringify(state));
      render();
      window.setTimeout(() => showToast(`Imported ${file.name}.`), 0);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not import project.', 'warn');
    }
  });
  document.querySelectorAll<HTMLElement>('[data-step]').forEach((button) => button.addEventListener('click', () => { state.step = button.dataset.step as Step; save(); render(); }));
  document.querySelectorAll<HTMLElement>('[data-layer-id], [data-select-layer]').forEach((layer) => layer.addEventListener('click', () => { state.selectedLayer = layer.dataset.layerId ?? layer.dataset.selectLayer!; state.step = 'layers'; save(); render(); }));
  document.querySelector<HTMLInputElement>('#pack-id')?.addEventListener('change', (event) => { state.packId = (event.target as HTMLInputElement).value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'); save(); render(); });
  document.querySelector<HTMLInputElement>('#world-name')?.addEventListener('change', (event) => { state.worldName = (event.target as HTMLInputElement).value.trim(); save(); render(); });
  document.querySelector<HTMLSelectElement>('#profile')?.addEventListener('change', (event) => { state.profile = (event.target as HTMLSelectElement).value; save(); render(); });
  document.querySelector<HTMLSelectElement>('#chunk-mode')?.addEventListener('change', (event) => { state.chunkMode = (event.target as HTMLSelectElement).value as BuilderState['chunkMode']; save(); render(); showToast('Chunk selection mode updated.'); });
  document.querySelectorAll<HTMLElement>('[data-direction]').forEach((button) => button.addEventListener('click', () => { const layer = state.layers.find((item) => item.id === state.selectedLayer); if (layer) layer.direction = button.dataset.direction as Direction; save(); render(); }));
  document.querySelector<HTMLSelectElement>('#layer-role')?.addEventListener('change', (event) => { const layer = state.layers.find((item) => item.id === state.selectedLayer); if (layer) layer.role = (event.target as HTMLSelectElement).value; save(); render(); });
  document.querySelector<HTMLInputElement>('#layer-seamless')?.addEventListener('change', (event) => { const layer = state.layers.find((item) => item.id === state.selectedLayer); if (layer) layer.seamless = (event.target as HTMLInputElement).checked; save(); render(); });
  bindRange('layer-parallax', (value) => { const layer = state.layers.find((item) => item.id === state.selectedLayer); if (layer) layer.parallax = value / 100; });
  bindRange('layer-y', (value) => { const layer = state.layers.find((item) => item.id === state.selectedLayer); if (layer) layer.y = value; });
  bindRange('layer-height', (value) => { const layer = state.layers.find((item) => item.id === state.selectedLayer); if (layer) layer.height = value; });
  bindRange('layer-opacity', (value) => { const layer = state.layers.find((item) => item.id === state.selectedLayer); if (layer) layer.opacity = value; });
  bindRange('ground-y', (value) => { state.groundY = value; }); bindRange('human-height', (value) => { state.humanHeight = value; }); bindRange('door-height', (value) => { state.doorHeight = value; });
  document.querySelectorAll<HTMLElement>('[data-flow]').forEach((button) => button.addEventListener('click', () => { state.flow = button.dataset.flow as 'left' | 'right'; save(); render(); }));
  document.querySelectorAll<HTMLElement>('[data-lane-direction]').forEach((button) => button.addEventListener('click', () => { const [id, direction] = button.dataset.laneDirection!.split(':'); const lane = state.traffic.find((item) => item.id === id); if (lane) lane.direction = direction as 'left' | 'right'; save(); render(); }));
  for (const lane of state.traffic) {
    bindRange(`speed-${lane.id}`, (value) => { lane.speed = value; });
    bindRange(`lane-y-${lane.id}`, (value) => { lane.y = value; });
  }
  document.querySelectorAll<HTMLSelectElement>('[data-lane-vehicle]').forEach((select) => select.addEventListener('change', () => { const lane = state.traffic.find((item) => item.id === select.dataset.laneVehicle); if (lane) { lane.vehicle = select.value; lane.src = vehicleSource(select.value); if (select.value === 'Bat' && lane.zone === 'ground') { lane.zone = 'sky'; lane.distance = 'far'; lane.y = 28; } } save(); render(); }));
  document.querySelectorAll<HTMLSelectElement>('[data-lane-zone]').forEach((select) => select.addEventListener('change', () => { const lane = state.traffic.find((item) => item.id === select.dataset.laneZone); if (lane) { lane.zone = select.value as TrafficLane['zone']; lane.y = lane.zone === 'sky' ? Math.min(lane.y, 48) : Math.max(lane.y, 78); } save(); render(); }));
  document.querySelectorAll<HTMLSelectElement>('[data-lane-distance]').forEach((select) => select.addEventListener('change', () => { const lane = state.traffic.find((item) => item.id === select.dataset.laneDistance); if (lane) lane.distance = select.value as RouteDistance; save(); render(); }));
  document.querySelectorAll<HTMLInputElement>('[data-lane-max]').forEach((input) => input.addEventListener('input', () => { const lane = state.traffic.find((item) => item.id === input.dataset.laneMax); if (lane) lane.maxActive = Math.max(0, Math.min(2, Number(input.value))); save(); updateValidation(); }));
  document.querySelectorAll<HTMLElement>('[data-remove-lane]').forEach((button) => button.addEventListener('click', () => { state.traffic = state.traffic.filter((lane) => lane.id !== button.dataset.removeLane); save(); render(); }));
  document.querySelectorAll<HTMLElement>('[data-architecture]').forEach((button) => button.addEventListener('click', () => { const id = button.dataset.architecture!; state.architecture = state.architecture.includes(id) ? state.architecture.filter((item) => item !== id) : [...state.architecture, id]; save(); render(); }));
  bindUpload('#layer-file', (file, url) => { const layer = state.layers.find((item) => item.id === state.selectedLayer); if (layer) { layer.src = url; layer.file = file.name; } });
  bindUpload('#style-guide', (file, url) => { state.styleGuideFile = file.name; state.styleGuideSrc = url; });
  bindUpload('#architecture-file', (file, url) => {
    const id = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const asset = { id, name: id.split('-').map((part) => part[0]!.toUpperCase() + part.slice(1)).join(' '), src: url, file: file.name };
    state.architectureAssets = [...state.architectureAssets.filter((item) => item.id !== id), asset];
    if (!state.architecture.includes(id)) state.architecture.push(id);
  });
  document.querySelector('#add-layer')?.addEventListener('click', () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png';
    input.addEventListener('change', async () => { const file = input.files?.[0]; if (!file) return; const id = `backdrop-${state.layers.length + 1}`; state.layers.push({ id, name: `Backdrop ${state.layers.length + 1}`, role: 'mid-background', src: await fileToDataUrl(file), file: file.name, direction: 'left', parallax: .15, height: 55, y: 50, opacity: 100, seamless: true, opaque: false }); state.selectedLayer = id; save(); render(); });
    input.click();
  });
  document.querySelectorAll<HTMLElement>('[data-add-route]').forEach((button) => button.addEventListener('click', () => { const zone = button.dataset.addRoute as TrafficLane['zone']; const limit = zone === 'sky' ? 3 : 2; const count = state.traffic.filter((lane) => lane.zone === zone).length; if (count >= limit) { showToast(`This profile allows ${limit} ${zone === 'sky' ? 'sky routes' : 'road lanes'}.`, 'warn'); return; } const id = `${zone}-route-${state.traffic.length + 1}`; const sky = zone === 'sky'; state.traffic.push({ id, name: sky ? `Sky route ${count + 1}` : `Road lane ${count + 1}`, vehicle: sky ? 'Bat' : 'Wagon', src: vehicleSource(sky ? 'Bat' : 'Wagon'), direction: state.traffic.length % 2 ? 'left' : 'right', speed: sky ? 62 : 44, maxActive: 1, y: sky ? 24 + count * 14 : 86 + count * 7, zone, distance: sky ? 'far' : count ? 'near' : 'mid' }); save(); render(); }));
  document.querySelector('#layer-up')?.addEventListener('click', () => moveSelectedLayer(-1));
  document.querySelector('#layer-down')?.addEventListener('click', () => moveSelectedLayer(1));
  document.querySelector('#remove-layer')?.addEventListener('click', () => { if (state.layers.length <= 3) return; const index = state.layers.findIndex((layer) => layer.id === state.selectedLayer); state.layers.splice(index, 1); state.selectedLayer = state.layers[Math.max(0, index - 1)]!.id; save(); render(); });
  document.querySelector('#preview-toggle')?.addEventListener('click', (event) => { state.previewPlaying = !state.previewPlaying; (event.currentTarget as HTMLButtonElement).textContent = state.previewPlaying ? 'Pause preview' : 'Play preview'; syncPreview(); save(); });
  document.querySelectorAll('#validate-top, #validate-bottom').forEach((button) => button.addEventListener('click', () => { updateValidation(); document.querySelector('#checks')?.classList.add('pulse'); setTimeout(() => document.querySelector('#checks')?.classList.remove('pulse'), 500); const failed = checks().filter((check) => !check.pass).length; showToast(failed ? `${failed} issue${failed === 1 ? '' : 's'} need attention.` : 'All design-profile checks pass.', failed ? 'warn' : 'ok'); }));
  document.querySelector('#checks')?.addEventListener('click', (event) => { const target = (event.target as HTMLElement).closest<HTMLElement>('[data-check-step]'); if (!target) return; state.step = target.dataset.checkStep as Step; render(); });
  document.querySelector('#export-pack')?.addEventListener('click', exportPack);
  document.querySelector('#export-scroller')?.addEventListener('click', exportScroller);
  document.querySelector('#install-world')?.addEventListener('click', installWorld);
  document.querySelector('#reset-draft')?.addEventListener('click', () => { localStorage.removeItem(storageKey); state = structuredClone(builderDefaultState); render(); window.setTimeout(() => showToast('Draft reset to the selected reference pack.'), 0); });
}

function moveSelectedLayer(direction: -1 | 1): void {
  const index = state.layers.findIndex((layer) => layer.id === state.selectedLayer);
  const destination = index + direction;
  if (index < 0 || destination < 0 || destination >= state.layers.length) return;
  [state.layers[index], state.layers[destination]] = [state.layers[destination]!, state.layers[index]!];
  save(); render();
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function bindUpload(selector: string, apply: (file: File, url: string) => void): void {
  document.querySelector<HTMLInputElement>(selector)?.addEventListener('change', async (event) => { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; apply(file, await fileToDataUrl(file)); save(); render(); });
}

function download(name: string, data: unknown): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadBlob(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}

interface ExportArtifacts { pack: Record<string, any>; world: Record<string, any>; project: BuilderProjectFile; architectureAssets: ArchitectureAsset[]; vehicleAssets: Array<[string, TrafficLane]> }

function createExportArtifacts(): ExportArtifacts | null {
  const failed = checks().filter((check) => !check.pass);
  if (failed.length) { showToast(`Fix ${failed.map((check) => check.name.toLowerCase()).join(', ')} before export.`, 'warn'); return null; }
  const totalTraffic = state.traffic.reduce((sum, lane) => sum + lane.maxActive, 0);
  const groundY = Math.round(1080 * state.groundY / 100);
  const architectureAssets = architectureCatalog().filter((asset) => state.architecture.includes(asset.id));
  const vehicleAssets = [...new Map(state.traffic.map((lane) => [lane.vehicle.toLowerCase().replace(/[^a-z0-9]+/g, '-'), lane])).entries()];
  const guideExtension = (state.styleGuideFile?.match(/\.[a-z0-9]+$/i)?.[0] ?? '.png').toLowerCase();
  const pack = {
    schemaVersion: 1, id: `${state.packId}-pack`, version: 1, sourceRoot: 'assets', compatibility: { provides: ['custom-world'] },
    style: { guide: `style-guide${guideExtension}`, palette: { sky: 0x0d1030, shadow: 0x1a1a2b, mid: 0x2a1a4c, amber: 0xffa62b }, outline: { color: 0x090914, relativeWeight: .012 }, detail: state.profile === 'silhouette-screensaver' ? 'medium' : 'high', groundAnchor: 'bottom-center' },
    assets: [
      ...state.layers.map((layer) => ({ id: `${state.packId}-${layer.id}`, file: layer.file, role: layer.role, opaque: layer.opaque, prepare: { seamWidth: layer.seamless ? 64 : 0 } })),
      ...architectureAssets.map((asset) => ({ id: `${state.packId}-${asset.id}`, file: asset.file, role: 'architecture', prepare: { trim: true, height: 420, cleanEdge: 1 } })),
      ...vehicleAssets.map(([id, lane]) => ({ id: `${state.packId}-${id}`, file: `${id}-strip.png`, role: 'vehicle', prepare: { trim: true, frames: lane.vehicle === 'Bat' ? 4 : 6, cellWidth: lane.vehicle === 'Bat' ? 128 : 256, cellHeight: lane.vehicle === 'Bat' ? 128 : 256 } })),
    ],
    recipes: [
      ...architectureAssets.map((asset) => ({ id: asset.id, asset: `${state.packId}-${asset.id}`, role: 'building', anchor: { x: .5, y: 1 }, tags: ['architecture', 'grounded'] })),
      ...vehicleAssets.map(([id]) => ({ id, asset: `${state.packId}-${id}`, role: 'traffic', anchor: { x: .5, y: 1 }, directions: ['left', 'right'], tags: ['traffic'] })),
    ],
  };
  const entities = [
    ...architectureAssets.map((asset) => ({ id: asset.id, asset: `${state.packId}-${asset.id}`, depth: 8, anchor: { x: .5, y: 1 }, components: { tags: ['grounded'] } })),
    ...state.traffic.map((lane) => { const vehicle = lane.vehicle.toLowerCase().replace(/[^a-z0-9]+/g, '-'); return { id: `${lane.id}-${vehicle}`, asset: `${state.packId}-${vehicle}`, animation: `${lane.id}-roll`, depth: lane.zone === 'sky' ? 12 : lane.id.includes('near') ? 40 : 30, scale: lane.zone === 'sky' ? .62 : lane.id.includes('near') ? .8 : .68, anchor: { x: .5, y: lane.zone === 'sky' ? .5 : 1 }, components: { pathFollower: { path: lane.id, speed: { min: Math.max(10, lane.speed - 6), max: lane.speed + 6 }, direction: lane.direction === 'left' ? -1 : 1 }, tags: [lane.zone === 'sky' ? 'airborne' : 'grounded', 'traffic'] } }; }),
  ];
  const chunks = architectureAssets.map((asset, index) => ({ id: `row-${String(index + 1).padStart(2, '0')}`, width: 430, objects: [{ entity: asset.id, x: 215, y: groundY }] }));
  const chunkPlan = state.chunkMode === 'procedural'
    ? { mode: 'procedural', pool: chunks.map((chunk) => chunk.id), avoidImmediateRepeat: true }
    : state.chunkMode === 'hybrid'
      ? { mode: 'hybrid', sequence: chunks.slice(0, 3).map((chunk) => chunk.id), pool: chunks.slice(3).map((chunk) => chunk.id) }
      : { mode: 'authored', sequence: chunks.map((chunk) => chunk.id), repeat: true };
  const world = {
    id: state.packId, name: state.worldName, version: 1, designProfile: state.profile, assetPacks: ['$PACK'], layout: { id: 'authored-world', tags: ['custom'], groundY, chunkHeight: 1080 },
    camera: { autoScrollSpeed: 28, inputSpeed: 340 }, themes: [], palette: pack.style.palette,
    backgrounds: state.layers.map((layer, index) => ({ id: layer.id, asset: `${state.packId}-${layer.id}`, depth: -120 + index * 40, parallax: layer.direction === 'static' ? 0 : layer.direction === 'right' ? -layer.parallax : layer.parallax, y: Math.round(1080 * layer.y / 100), spacing: 1920, height: Math.round(1080 * layer.height / 100), opacity: layer.opacity / 100 })),
    entities,
    animations: state.traffic.map((lane) => {
      const frames = Array.from({ length: lane.vehicle === 'Bat' ? 4 : 6 }, (_, index) => index);
      return { id: `${lane.id}-roll`, asset: `${state.packId}-${lane.vehicle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, frames: lane.direction === 'left' ? frames : frames.reverse(), frameRate: 6, repeat: -1 };
    }),
    chunks, chunkPlan,
    paths: state.traffic.map((lane) => ({ id: lane.id, y: Math.round(1080 * lane.y / 100), xPadding: 160, zone: lane.zone, distance: lane.distance })),
    traffic: state.traffic.map((lane) => ({ id: `${lane.id}-traffic`, path: lane.id, entities: [`${lane.id}-${lane.vehicle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`], intervalMs: { min: 9000, max: 14000 }, maxActive: lane.maxActive, maxActivePerDirection: 1 })),
    clock: { startHour: 21, realSecondsPerWorldHour: 60, loopHours: 24 }, environments: [{ id: 'default', sky: [0x0d1030, 0x2a1a4c] }], initialEnvironment: 'default', weather: [{ id: 'clear' }], initialWeather: 'clear', events: [], triggers: [],
    pools: state.traffic.map((lane) => ({ id: `${lane.id}-pool`, entity: `${lane.id}-${lane.vehicle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, initialSize: Math.min(1, lane.maxActive), maxSize: lane.maxActive })),
    compositionRules: { chunks: { minimumRepeatGap: state.chunkMode === 'authored' ? 0 : Math.min(3, Math.max(0, chunks.length - 1)) }, entities: { minimumSpacing: [{ tag: 'traffic', distance: 260 }], maxVisible: [{ tag: 'traffic', count: Math.max(1, totalTraffic) }] } },
    director: { maxActivity: Math.max(1, totalTraffic), trafficCost: 1, sequenceCost: 2, particlesPerActivity: 20, rareEventSpacingWorldHours: 4 },
    offscreen: { sleepMargin: 240, suspendAnimation: true, suspendParticles: true, keepLogicalTime: true },
    performanceBudget: { targetFps: 60, maxDrawCalls: 180, maxTriangles: 8000, maxTextureMemoryMb: 256, maxActiveEntities: 120, targetResolutions: [[1920, 1080]] },
  };
  const project: BuilderProjectFile = { kind: 'infi-scroll-builder-project', version: 2, state: structuredClone(state) };
  return { pack, world, project, architectureAssets, vehicleAssets };
}

function exportPack(): void {
  const artifacts = createExportArtifacts();
  if (!artifacts) return;
  const { project, pack, world } = artifacts;
  download('builder-project.json', project);
  setTimeout(() => download('pack.json', pack), 180);
  setTimeout(() => download('world.json', world), 360);
  showToast('Exported builder project, pack, and world configuration.');
}

function sourceExtension(source: string, fallback = '.png'): string {
  const clean = source.split(/[?#]/)[0] ?? source;
  return clean.match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase() ?? fallback;
}

async function sourceBytes(source: string): Promise<Uint8Array> {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not read ${source}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function sourceDataUrl(source: string): Promise<string> {
  if (source.startsWith('data:')) return source;
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not read ${source}`);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(blob);
  });
}

function standaloneCss(): string {
  return `*{box-sizing:border-box}html,body,#scroller{width:100%;height:100%;margin:0;overflow:hidden;background:#080812}#scroller{position:relative;isolation:isolate}.band{position:absolute;left:0;width:100%;transform:translateY(-50%);overflow:hidden}.band-track{display:flex;width:200%;height:100%;will-change:transform}.band img{display:block;width:50%;height:100%;object-fit:fill}.band.static .band-track{width:100%}.band.static img{width:100%}.band.left .band-track{animation:band-left var(--duration) linear infinite}.band.right .band-track{animation:band-right var(--duration) linear infinite}.architecture{position:absolute;left:0;width:200%;display:flex;align-items:end;will-change:transform;animation:architecture-left 55s linear infinite}.architecture-group{width:50%;height:100%;display:flex;align-items:end;justify-content:space-around}.architecture img{max-width:15vw;max-height:100%;object-fit:contain;object-position:bottom}.mover{position:absolute;left:-18vw;width:14vw;aspect-ratio:1;animation:move-right var(--travel) linear infinite;animation-delay:var(--delay)}.mover.left{animation-name:move-left;left:104vw}.sprite{width:100%;height:100%;background-repeat:no-repeat;background-size:var(--frames)00% 100%;animation:sprite-cycle 1s steps(var(--frames)) infinite}.mover.right .sprite{animation-direction:reverse}@keyframes band-left{to{transform:translateX(-50%)}}@keyframes band-right{from{transform:translateX(-50%)}to{transform:translateX(0)}}@keyframes architecture-left{to{transform:translateX(-50%)}}@keyframes move-right{to{left:104vw}}@keyframes move-left{to{left:-18vw}}@keyframes sprite-cycle{to{background-position:100% 0}}@media(prefers-reduced-motion:reduce){*{animation-play-state:paused!important}}`;
}

function standaloneJs(data: unknown): string {
  return `const data=${JSON.stringify(data)};{const root=document.querySelector('#scroller');data.layers.forEach((layer,index)=>{const band=document.createElement('div');band.className='band '+layer.direction;band.style.cssText='top:'+layer.y+'%;height:'+layer.height+'%;opacity:'+(layer.opacity/100)+';z-index:'+(index-20)+';--duration:'+Math.max(8,Math.round(12/Math.max(.02,layer.parallax)))+'s';const track=document.createElement('div');track.className='band-track';const copies=layer.direction==='static'?1:2;for(let i=0;i<copies;i++){const image=new Image();image.src=layer.src;image.alt='';track.append(image)}band.append(track);root.append(band)});if(data.architecture.length){const row=document.createElement('div');row.className='architecture';row.style.cssText='bottom:'+(100-data.groundY)+'%;height:48%;z-index:8';for(let groupIndex=0;groupIndex<2;groupIndex++){const group=document.createElement('div');group.className='architecture-group';data.architecture.forEach(asset=>{const image=new Image();image.src=asset.src;image.alt='';group.append(image)});row.append(group)}root.append(row)}data.traffic.forEach((lane,index)=>{if(!lane.maxActive)return;const mover=document.createElement('div');mover.className='mover '+lane.direction;mover.style.cssText='top:'+lane.y+'%;z-index:'+(lane.zone==='sky'?4:30)+';--travel:'+Math.max(8,Math.round(42*48/lane.speed))+'s;--delay:-'+(index*5)+'s';const sprite=document.createElement('div');sprite.className='sprite';sprite.style.cssText='background-image:url("'+lane.src+'");--frames:'+lane.frames;mover.append(sprite);root.append(mover)})}`;
}

async function portableSources(artifacts: ExportArtifacts) {
  const entries: Record<string, Uint8Array> = {};
  const layers = [];
  for (const layer of state.layers) {
    const path = `assets/layers/${layer.id}${sourceExtension(layer.file || layer.src)}`;
    entries[path] = await sourceBytes(layer.src);
    layers.push({ ...layer, src: path });
  }
  const architectureAssets = [];
  for (const asset of artifacts.architectureAssets) {
    const path = `assets/architecture/${asset.id}${sourceExtension(asset.file || asset.src)}`;
    entries[path] = await sourceBytes(asset.src);
    architectureAssets.push({ ...asset, src: path });
  }
  const trafficSources = new Map<string, string>();
  for (const [, lane] of artifacts.vehicleAssets) {
    const id = lane.vehicle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const path = `assets/traffic/${id}${sourceExtension(lane.src)}`;
    entries[path] = await sourceBytes(lane.src);
    trafficSources.set(lane.vehicle, path);
  }
  return {
    entries,
    data: {
      name: state.worldName, groundY: state.groundY, layers, architecture: architectureAssets,
      traffic: state.traffic.map((lane) => ({ ...lane, src: trafficSources.get(lane.vehicle), frames: lane.vehicle === 'Bat' ? 4 : 6 })),
    },
  };
}

async function exportScroller(): Promise<void> {
  const artifacts = createExportArtifacts();
  if (!artifacts) return;
  showToast('Building portable scroller…');
  try {
    const portable = await portableSources(artifacts);
    const files: Record<string, Uint8Array> = {
      ...portable.entries,
      'index.html': strToU8(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(state.worldName)}</title><link rel="stylesheet" href="styles.css"></head><body><main id="scroller" aria-label="${escape(state.worldName)}"></main><script src="scroller.js"></script></body></html>`),
      'styles.css': strToU8(standaloneCss()), 'scroller.js': strToU8(standaloneJs(portable.data)),
      'scroller-data.json': strToU8(JSON.stringify(portable.data, null, 2)),
      'pack.json': strToU8(JSON.stringify(artifacts.pack, null, 2)), 'world.json': strToU8(JSON.stringify(artifacts.world, null, 2)),
      'builder-project.json': strToU8(JSON.stringify(artifacts.project, null, 2)),
      'README.md': strToU8(`# ${state.worldName}\n\nOpen index.html in a browser or publish this folder on any static host. No build step or external dependency is required.\n`),
    };
    downloadBlob(`${state.packId}-scroller.zip`, new Blob([zipSync(files, { level: 6 })], { type: 'application/zip' }));
    showToast('Exported a standalone HTML/CSS/JavaScript scroller.');
  } catch (error) { showToast(error instanceof Error ? error.message : 'Could not build scroller.', 'warn'); }
}

async function installPayload(artifacts: ExportArtifacts) {
  const files = [];
  const guideExtension = sourceExtension(state.styleGuideFile ?? state.styleGuideSrc ?? '', '.png');
  if (state.styleGuideSrc) files.push({ path: `style-guide${guideExtension}`, dataUrl: await sourceDataUrl(state.styleGuideSrc) });
  for (const layer of state.layers) files.push({ path: `assets/${layer.file}`, dataUrl: await sourceDataUrl(layer.src) });
  for (const asset of artifacts.architectureAssets) files.push({ path: `assets/${asset.file}`, dataUrl: await sourceDataUrl(asset.src) });
  for (const [id, lane] of artifacts.vehicleAssets) files.push({ path: `assets/${id}-strip.png`, dataUrl: await sourceDataUrl(lane.src) });
  return { project: artifacts.project, pack: artifacts.pack, world: artifacts.world, files };
}

async function installWorld(): Promise<void> {
  const artifacts = createExportArtifacts();
  if (!artifacts) return;
  if (presetOptions.some((preset) => preset.id === state.packId)) { showToast('Choose a new pack identifier before installing a reference world.', 'warn'); return; }
  showToast('Preparing local installation…');
  try {
    const payload = await installPayload(artifacts);
    let response = await fetch('/__infi-scroll/install', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    if (response.status === 409 && window.confirm(`Replace the existing local pack “${state.packId}”?`)) response = await fetch('/__infi-scroll/install?overwrite=1', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json() as { ok?: boolean; error?: string; url?: string };
    if (!response.ok || !result.ok) throw new Error(result.error ?? 'Installation failed.');
    showToast('Installed and registered. Opening the world…');
    window.setTimeout(() => window.open(result.url, '_blank', 'noopener'), 650);
  } catch (error) { showToast(error instanceof Error ? error.message : 'Could not install world.', 'warn'); }
}

render();
