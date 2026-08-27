import Phaser from 'phaser';
import type { ActionDefinition, EntityDefinition, EnvironmentState, PlacedObject, RouteDistance, WorldTemplate } from '../contracts/world';
import type { SequenceActionDefinition } from '../contracts/capabilities';
import type { ParticleState } from '../systems/ParticleBatch';
import type { LoadedWorld } from '../core/WorldLoader';
import { SeededRandom } from '../core/SeededRandom';
import { ActionBus } from '../systems/ActionBus';
import { ChunkSequence } from '../systems/ChunkSequence';
import { EventScheduler } from '../systems/EventScheduler';
import { TriggerEngine } from '../systems/TriggerEngine';
import { WorldClock } from '../systems/WorldClock';
import { PerformanceMonitor } from '../systems/PerformanceMonitor';
import { CapabilityRuntime } from '../systems/CapabilityRuntime';
import { PerspectiveProjector } from '../systems/PerspectiveProjector';
import type { WorldPathFollower } from '../systems/MotionPath';
import { ObjectPool } from '../systems/ObjectPool';
import { ParticleRenderer } from './ParticleRenderer';
import { CompositionRules } from '../systems/CompositionRules';
import { ActivityDirector } from '../systems/ActivityDirector';
import { OffscreenController } from '../systems/OffscreenController';
import type { RuntimeTelemetrySnapshot } from './RuntimeTelemetry';

interface ChunkView { id: string; start: number; end: number; objects: Phaser.GameObjects.GameObject[]; sleeping?: boolean }
type EntityView = Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
interface MovingView { object: EntityView; velocityX: number; velocityY?: number; expiresAt?: number; trafficId?: string; pathId?: string; entityId?: string }

const routeDistancePresentation: Record<RouteDistance, { scale: number; depth: number; alpha: number; speed: number; interval: number }> = {
  near: { scale: 1, depth: 0, alpha: 1, speed: 1, interval: 1 },
  mid: { scale: 0.72, depth: -20, alpha: 0.86, speed: 0.78, interval: 1.25 },
  far: { scale: 0.48, depth: -50, alpha: 0.68, speed: 0.58, interval: 1.6 },
};
interface WorldMovingView {
  id: string;
  entityId: string;
  object: EntityView;
  follower?: WorldPathFollower;
  position: { x: number; y: number; z: number };
  baseScale: number;
  baseDepth: number;
  orientToTangent?: boolean;
  cameraRelative?: boolean;
}

export class WorldScene extends Phaser.Scene {
  private readonly random: SeededRandom;
  private readonly template: WorldTemplate;
  private readonly clock: WorldClock;
  private readonly scheduler: EventScheduler;
  private readonly triggers: TriggerEngine;
  private readonly actions = new ActionBus();
  private sequence: ChunkSequence;
  private chunks: ChunkView[] = [];
  private movers: MovingView[] = [];
  private moverPool = new Map<string, EntityView[]>();
  private entityPools = new Map<string, ObjectPool<EntityView>>();
  private entityViews = new Set<EntityView>();
  private viewEntities = new WeakMap<EntityView, string>();
  private authoredTints = new WeakMap<EntityView, number>();
  private worldMovers = new Map<string, WorldMovingView>();
  private backgroundObjects: { layer: WorldTemplate['backgrounds'][number]; images: Phaser.GameObjects.Image[] }[] = [];
  private trafficDue = new Map<string, number>();
  private entities: Map<string, EntityDefinition>;
  private sky?: Phaser.GameObjects.Graphics;
  private overlay?: Phaser.GameObjects.Rectangle;
  private activeEnvironment?: string;
  private activeWeather?: string;
  private dragStart?: { pointerX: number; cameraX: number };
  private currentChunk?: string;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private debug = new URLSearchParams(window.location.search).get('debug') === '1';
  private calibrate = new URLSearchParams(window.location.search).get('calibrate') === '1';
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private debugText?: Phaser.GameObjects.Text;
  private readonly performance = new PerformanceMonitor();
  private readonly capabilities: CapabilityRuntime;
  private readonly composition: CompositionRules;
  private readonly director: ActivityDirector;
  private readonly projector = new PerspectiveProjector(window.innerWidth, window.innerHeight);
  private readonly particleRenderer: ParticleRenderer;
  private readonly offscreen?: OffscreenController;
  private readonly effectEmissionRemainder = new Map<string, number>();
  private effectFlash?: Phaser.GameObjects.Rectangle;
  private nextWorldInstance = 0;
  private elapsedMs = 0;
  private telemetryDueMs = 0;
  private environmentChanges = 0;
  private environmentVariantApplications = 0;
  private readonly emittedEvents = new Map<string, number>();
  private propertyOverrideObserved = false;

  constructor(private readonly loaded: LoadedWorld, private readonly telemetrySink?: (snapshot: RuntimeTelemetrySnapshot) => void) {
    super('world');
    this.template = loaded.template;
    this.random = new SeededRandom(loaded.seed);
    this.clock = new WorldClock(this.template.clock);
    this.scheduler = new EventScheduler(this.template.events, this.random);
    this.triggers = new TriggerEngine(this.template.triggers);
    this.sequence = new ChunkSequence(this.template.chunks, this.template.chunkPlan, this.random, this.template.compositionRules?.chunks);
    this.entities = new Map(this.template.entities.map((entity) => [entity.id, entity]));
    this.capabilities = new CapabilityRuntime(this.template, this.random, (action) => this.executeCapability(action));
    this.composition = new CompositionRules(this.template.compositionRules);
    this.director = new ActivityDirector(this.template.director);
    this.particleRenderer = new ParticleRenderer(this, this.capabilities, this.projector);
    this.offscreen = this.template.offscreen ? new OffscreenController(this.template.offscreen) : undefined;
  }

  preload(): void {
    for (const asset of this.loaded.assets.all()) {
      if (!asset.source) continue;
      const source = asset.source.startsWith('/assets/') ? `${import.meta.env.BASE_URL}${asset.source.slice(1)}` : asset.source;
      if (asset.frameWidth && asset.frameHeight) this.load.spritesheet(asset.id, source, { frameWidth: asset.frameWidth, frameHeight: asset.frameHeight });
      else this.load.image(asset.id, source);
    }
  }

  create(): void {
    this.createPrimitiveTextures();
    this.createFrameAnimations();
    this.initializeMoverPools();
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, this.scale.height);
    this.createSky();
    this.createBackgrounds();
    this.setEnvironment(this.template.initialEnvironment);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.setWeather(this.template.initialWeather);
    this.installInput();
    this.actions.subscribe((action) => this.execute(action));
    for (const traffic of this.template.traffic) {
      if (!traffic.initialDelayMs) continue;
      this.trafficDue.set(traffic.id, this.elapsedMs + this.random.between(traffic.initialDelayMs.min, traffic.initialDelayMs.max));
    }
    this.ensureChunks();
    this.updateChunkSleep();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
      this.disposeRuntimeViews();
    });
  }

  update(_time: number, delta: number): void {
    this.elapsedMs += delta;
    this.performance.frame(delta);
    this.clock.update(delta);
    this.actions.dispatch(this.triggers.evaluate({ hour: this.clock.hour }));
    this.projector.resize(this.scale.width, this.scale.height);
    this.projector.setCameraX(this.cameras.main.scrollX);
    this.updateEnvironmentEffects(delta);
    this.capabilities.update(delta, this.time.now, (particle, particleDelta) => this.particleLogicalDelta(particle, particleDelta));
    this.updateCamera(delta);
    this.ensureChunks();
    this.updateChunkSleep();
    this.updateBackgrounds();
    this.updateWorldMotion(delta);
    this.particleRenderer.sync({ suspendOffscreen: this.template.offscreen?.suspendParticles, sleepMargin: this.template.offscreen?.sleepMargin });
    this.updateTraffic(delta);
    this.updateMovers(delta);
    this.updateWeather(delta);
    const dueEvents = this.scheduler.dueEvents(this.clock.totalHours, this.clock.hour);
    const acceptedEvents = this.director.select(dueEvents, this.clock.totalHours, this.clock.hour, this.activitySnapshot());
    this.scheduler.accept(acceptedEvents, this.clock.totalHours);
    this.scheduler.defer(dueEvents.filter((event) => !acceptedEvents.includes(event)), this.clock.totalHours);
    this.actions.dispatch(acceptedEvents.flatMap((event) => event.actions));
    this.evaluateChunkTrigger();
    if (this.telemetrySink && this.elapsedMs >= this.telemetryDueMs) {
      this.telemetryDueMs = this.elapsedMs + 1000;
      this.telemetrySink(this.collectTelemetry());
    }
    if (this.debug || this.calibrate) this.drawDebug();
  }

  private createPrimitiveTextures(): void {
    for (const asset of this.loaded.assets.all()) {
      if (!asset.primitive || this.textures.exists(asset.id)) continue;
      const shape = asset.primitive;
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(shape.color, 1);
      if (shape.stroke !== undefined) graphics.lineStyle(3, shape.stroke, 1);
      if (shape.kind === 'rect') {
        if (shape.radius) { graphics.fillRoundedRect(2, 2, shape.width - 4, shape.height - 4, shape.radius); if (shape.stroke !== undefined) graphics.strokeRoundedRect(2, 2, shape.width - 4, shape.height - 4, shape.radius); }
        else { graphics.fillRect(2, 2, shape.width - 4, shape.height - 4); if (shape.stroke !== undefined) graphics.strokeRect(2, 2, shape.width - 4, shape.height - 4); }
        graphics.generateTexture(asset.id, shape.width, shape.height);
      } else if (shape.kind === 'ellipse') {
        graphics.fillEllipse(shape.width / 2, shape.height / 2, shape.width - 4, shape.height - 4);
        if (shape.stroke !== undefined) graphics.strokeEllipse(shape.width / 2, shape.height / 2, shape.width - 4, shape.height - 4);
        graphics.generateTexture(asset.id, shape.width, shape.height);
      } else {
        const polygon = new Phaser.Geom.Polygon(shape.points);
        graphics.fillPoints(polygon.points, true);
        if (shape.stroke !== undefined) graphics.strokePoints(polygon.points, true);
        const xs = polygon.points.map((point) => point.x); const ys = polygon.points.map((point) => point.y);
        graphics.generateTexture(asset.id, Math.max(...xs) + 4, Math.max(...ys) + 4);
      }
      graphics.destroy();
    }
  }

  private createFrameAnimations(): void {
    for (const animation of this.template.animations) {
      if (!animation.frames?.length || this.anims.exists(animation.id)) continue;
      this.anims.create({ key: animation.id, frames: animation.frames.map((frame) => ({ key: animation.asset, frame })), frameRate: animation.frameRate ?? 8, repeat: animation.repeat ?? -1 });
    }
  }

  private createSky(): void {
    this.sky = this.add.graphics().setScrollFactor(0).setDepth(-1000);
    this.overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height).setOrigin(0).setScrollFactor(0).setDepth(1000);
    this.effectFlash = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff, 0).setOrigin(0).setScrollFactor(0).setDepth(990);
  }

  private paintSky(environment: EnvironmentState): void {
    this.sky?.clear();
    const bands = 24;
    const start = Phaser.Display.Color.IntegerToColor(environment.sky[0]);
    const end = Phaser.Display.Color.IntegerToColor(environment.sky[1]);
    for (let index = 0; index < bands; index += 1) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(start, end, bands - 1, index);
      this.sky?.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      this.sky?.fillRect(0, index * (this.scale.height / bands), this.scale.width, this.scale.height / bands + 1);
    }
    const overlay = environment.overlay;
    this.overlay?.setFillStyle(overlay?.color ?? 0, overlay?.alpha ?? 0);
  }

  private createBackgrounds(): void {
    for (const layer of this.template.backgrounds) {
      const images = Array.from({ length: Math.ceil(this.scale.width / layer.spacing) + 3 }, (_, index) => {
        const image = this.add.image(index * layer.spacing + (layer.offsetX ?? 0), layer.y, layer.asset).setDepth(layer.depth).setScrollFactor(0);
        const scale = this.random.between(layer.scale?.min ?? 1, layer.scale?.max ?? 1);
        image.setScale(scale).setAlpha(layer.opacity ?? 1);
        if (layer.height !== undefined) image.setDisplaySize(layer.spacing, layer.height);
        return image;
      });
      this.backgroundObjects.push({ layer, images });
    }
    this.resizeBackgrounds();
  }

  private handleResize(): void {
    this.overlay?.setSize(this.scale.width, this.scale.height);
    this.effectFlash?.setSize(this.scale.width, this.scale.height);
    if (this.activeEnvironment) {
      const environment = this.template.environments.find((candidate) => candidate.id === this.activeEnvironment);
      if (environment) this.paintSky(environment);
    }
    this.resizeBackgrounds();
  }

  private resizeBackgrounds(): void {
    if (this.template.layout.viewportFit !== 'cover') return;
    for (const group of this.backgroundObjects) {
      const source = this.textures.get(group.layer.asset).getSourceImage() as { width?: number; height?: number };
      const sourceWidth = source.width ?? 1920;
      const sourceHeight = source.height ?? 1080;
      // The panoramic field should cover the viewport, but the hero wordmark
      // must remain fully visible when the browser viewport is shorter than
      // the 16:9 reference canvas (for example with browser chrome visible).
      const isHeroTypography = group.layer.id === 'evention-hero-word';
      const scale = isHeroTypography
        ? Math.min(this.scale.width / sourceWidth, this.scale.height / sourceHeight)
        : Math.max(this.scale.width / sourceWidth, this.scale.height / sourceHeight);
      const spacing = sourceWidth * scale;
      const y = this.scale.height / 2;
      group.layer.spacing = spacing;
      group.layer.offsetX = spacing / 2;
      group.layer.y = y;
      group.layer.scale = { min: scale, max: scale };
      group.images.forEach((image, index) => image.setPosition(index * spacing + spacing / 2, y).setScale(scale));
    }
  }

  private initializeMoverPools(): void {
    for (const definition of this.template.pools ?? []) {
      if (this.entityPools.has(definition.entity)) throw new Error(`Multiple pools target entity '${definition.entity}'`);
      const pool = new ObjectPool<EntityView>(
        () => {
          const object = this.createPlaced({ entity: definition.entity, x: -10000, y: -10000 }, 0);
          object.setActive(false).setVisible(false);
          this.tweens.getTweensOf(object).forEach((tween) => tween.pause());
          if (object instanceof Phaser.GameObjects.Sprite) object.anims.pause();
          return object;
        },
        definition.initialSize,
        definition.maxSize,
        (object) => {
          object.setActive(false).setVisible(false).setFlipX(false);
          this.tweens.getTweensOf(object).forEach((tween) => tween.pause());
          if (object instanceof Phaser.GameObjects.Sprite) object.anims.pause();
        },
      );
      this.entityPools.set(definition.entity, pool);
    }
  }

  private updateBackgrounds(): void {
    const cameraX = this.cameras.main.scrollX;
    for (const group of this.backgroundObjects) {
      const span = group.images.length * group.layer.spacing;
      group.images.forEach((image, index) => {
        const raw = index * group.layer.spacing + (group.layer.offsetX ?? 0) - (cameraX * group.layer.parallax) % span;
        image.x = raw < -group.layer.spacing ? raw + span : raw;
      });
    }
  }

  private ensureChunks(): void {
    const camera = this.cameras.main;
    const target = camera.scrollX + camera.width * 2;
    let right = this.chunks.at(-1)?.end ?? 0;
    while (right < target) {
      const definition = this.sequence.next();
      const objects: Phaser.GameObjects.GameObject[] = [];
      for (const placed of [...(definition.background ?? []), ...definition.objects]) {
        if (this.canPlaceEntity(placed.entity, right + placed.x)) objects.push(this.createPlaced(placed, right));
      }
      for (const rule of definition.spawns ?? []) {
        if (this.random.chance(rule.chance ?? 1)) {
          const count = this.random.int(Math.ceil(rule.count.min), Math.floor(rule.count.max));
          for (let index = 0; index < count; index += 1) {
            const x = this.random.between(rule.area.x.min, rule.area.x.max);
            if (this.canPlaceEntity(rule.entity, right + x)) objects.push(this.createPlaced({ entity: rule.entity, x, y: this.random.between(rule.area.y.min, rule.area.y.max) }, right));
          }
        }
      }
      this.chunks.push({ id: definition.id, start: right, end: right + definition.width, objects });
      right += definition.width;
    }
    while (this.chunks.length > 3 && this.chunks[1]!.end < camera.scrollX - camera.width) {
      this.chunks.shift()?.objects.forEach((object) => object.destroy());
    }
  }

  private createPlaced(placed: PlacedObject, offsetX: number): EntityView {
    const definition = this.requireEntity(placed.entity);
    const animation = definition.animation
      ? this.template.animations.find((candidate) => candidate.id === definition.animation)
      : undefined;
    const asset = this.resolveEnvironmentAsset(definition.asset);
    const image: EntityView = animation?.frames?.length
      ? this.add.sprite(offsetX + placed.x, placed.y, asset)
      : this.add.image(offsetX + placed.x, placed.y, asset);
    image
      .setDepth(placed.depth ?? definition.depth)
      .setScale((definition.scale ?? 1) * (placed.scale ?? 1))
      .setOrigin(definition.anchor?.x ?? 0.5, definition.anchor?.y ?? 0.5);
    this.entityViews.add(image);
    this.viewEntities.set(image, definition.id);
    this.authoredTints.set(image, placed.tint ?? 0xffffff);
    image.once(Phaser.GameObjects.Events.DESTROY, () => this.entityViews.delete(image));
    this.applyEnvironmentToView(image, definition.asset);
    if (animation?.frames?.length && image instanceof Phaser.GameObjects.Sprite) image.play(animation.id);
    this.applyAnimation(image, definition);
    return image;
  }

  private applyAnimation(image: EntityView, entity: EntityDefinition): void {
    if (!entity.animation) return;
    const definition = this.template.animations.find((animation) => animation.id === entity.animation);
    if (!definition?.motion) return;
    const motion = definition.motion;
    if (motion.type === 'bob') this.tweens.add({ targets: image, y: image.y - motion.amount, duration: motion.durationMs / 2, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    if (motion.type === 'sway') this.tweens.add({ targets: image, angle: motion.amount, duration: motion.durationMs / 2, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    if (motion.type === 'pulse') this.tweens.add({ targets: image, alpha: 1 - motion.amount, duration: motion.durationMs / 2, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  private installInput(): void {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _objects: unknown[], deltaX: number, deltaY: number) => {
      this.cameras.main.scrollX = Math.max(0, this.cameras.main.scrollX + deltaX + deltaY);
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => { this.dragStart = { pointerX: pointer.x, cameraX: this.cameras.main.scrollX }; });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && this.dragStart) this.cameras.main.scrollX = Math.max(0, this.dragStart.cameraX + this.dragStart.pointerX - pointer.x);
    });
    this.input.on('pointerup', () => { this.dragStart = undefined; });
  }

  private updateCamera(delta: number): void {
    const direction = (this.cursors?.right.isDown ? 1 : 0) - (this.cursors?.left.isDown ? 1 : 0);
    const autoSpeed = this.template.camera?.autoScrollSpeed ?? 0;
    const inputSpeed = this.template.camera?.inputSpeed ?? 340;
    this.cameras.main.scrollX = Math.max(0, this.cameras.main.scrollX + (autoSpeed + direction * inputSpeed) * delta / 1000);
  }

  private updateTraffic(delta: number): void {
    const now = this.elapsedMs;
    for (const traffic of this.template.traffic) {
      const active = this.movers.filter((mover) => mover.trafficId === traffic.id).length;
      if (now < (this.trafficDue.get(traffic.id) ?? 0) || active >= traffic.maxActive) continue;
      if (!this.director.allowsTraffic(this.clock.totalHours, this.clock.hour, this.activitySnapshot())) {
        this.trafficDue.set(traffic.id, now + 500);
        continue;
      }
      const entityId = this.random.pick(traffic.entities);
      const entity = this.requireEntity(entityId);
      const path = this.template.paths.find((candidate) => candidate.id === traffic.path);
      const presentation = routeDistancePresentation[path?.distance ?? 'near'];
      const speed = entity.components?.pathFollower?.speed ?? { min: 20, max: 30 };
      const direction = entity.components?.pathFollower?.direction ?? (this.random.chance(0.5) ? 1 : -1);
      const activeInDirection = this.movers.filter((mover) => mover.pathId === traffic.path && Math.sign(mover.velocityX) === direction).length;
      if (activeInDirection >= (traffic.maxActivePerDirection ?? traffic.maxActive)) continue;
      const padding = path?.xPadding ?? 40;
      const x = direction === 1 ? this.cameras.main.scrollX - padding : this.cameras.main.scrollX + this.scale.width + padding;
      if (!this.canPlaceEntity(entityId, x)) {
        this.trafficDue.set(traffic.id, now + 500);
        continue;
      }
      const object = this.acquireMover(entityId, x, path?.y ?? this.template.layout.groundY);
      if (!object) {
        this.trafficDue.set(traffic.id, now + 500);
        continue;
      }
      object.setScale(object.scaleX * presentation.scale).setDepth(object.depth + presentation.depth).setAlpha(presentation.alpha);
      if (direction === -1) object.setFlipX(true);
      this.movers.push({ object, velocityX: direction * this.random.between(speed.min, speed.max) * presentation.speed, trafficId: traffic.id, pathId: traffic.path, entityId });
      this.trafficDue.set(traffic.id, now + this.random.between(traffic.intervalMs.min, traffic.intervalMs.max) * presentation.interval);
    }
    void delta;
  }

  private updateMovers(delta: number): void {
    const moverMargin = Math.max(200, ...this.template.paths.map((path) => (path.xPadding ?? 0) + 40));
    const minX = this.cameras.main.scrollX - moverMargin; const maxX = this.cameras.main.scrollX + this.scale.width + moverMargin;
    this.movers = this.movers.filter((mover) => {
      mover.object.x += mover.velocityX * delta / 1000;
      mover.object.y += (mover.velocityY ?? 0) * delta / 1000;
      const keep = mover.object.x >= minX && mover.object.x <= maxX && (!mover.expiresAt || mover.expiresAt > this.time.now);
      if (!keep) {
        if (mover.entityId) this.releaseMover(mover.entityId, mover.object);
        else mover.object.destroy();
      }
      return keep;
    });
  }

  private updateChunkSleep(): void {
    const policy = this.template.offscreen;
    if (!policy || !this.offscreen) return;
    const viewport = { left: this.cameras.main.scrollX, right: this.cameras.main.scrollX + this.cameras.main.width, top: 0, bottom: this.scale.height };
    for (const chunk of this.chunks) {
      const sleeping = this.offscreen.isSleeping({ left: chunk.start, right: chunk.end, top: 0, bottom: this.scale.height }, viewport);
      if (sleeping === chunk.sleeping) continue;
      chunk.sleeping = sleeping;
      for (const object of chunk.objects) {
        object.setActive(!sleeping);
        if (policy.suspendAnimation) {
          this.tweens.getTweensOf(object).forEach((tween) => sleeping ? tween.pause() : tween.resume());
          if (object instanceof Phaser.GameObjects.Sprite) sleeping ? object.anims.pause() : object.anims.resume();
        }
      }
    }
  }

  private updateWeather(delta: number): void {
    const weather = this.template.weather.find((candidate) => candidate.id === this.activeWeather);
    if (!weather?.particleAsset || !this.random.chance((weather.density ?? 0) * delta / 1000)) return;
    const object = this.add.image(this.cameras.main.scrollX + this.random.between(0, this.scale.width), this.random.between(0, this.scale.height), weather.particleAsset)
      .setDepth(900).setAlpha(0.18).setTint(weather.tint ?? 0xffffff).setScale(this.random.between(0.4, 1.2));
    this.movers.push({ object, velocityX: weather.velocity?.x ?? 0, velocityY: weather.velocity?.y ?? 0, expiresAt: this.time.now + 7000 });
  }

  private execute(action: ActionDefinition): void {
    if (action.type === 'set-environment') this.setEnvironment(action.state);
    else if (action.type === 'set-weather') this.setWeather(action.weather ?? undefined);
    else if (action.type === 'start-sequence') this.capabilities.startSequence(action.sequence, this.time.now);
    else if (action.type === 'spawn') {
      const entity = this.requireEntity(action.entity);
      const pathId = entity.components?.pathFollower?.path;
      const path = pathId ? this.template.paths.find((candidate) => candidate.id === pathId) : undefined;
      const baseline = path?.y ?? this.template.layout.groundY;
      const area = action.area ?? { x: { min: this.cameras.main.scrollX, max: this.cameras.main.scrollX + this.scale.width }, y: { min: baseline, max: baseline } };
      for (let index = 0; index < (action.count ?? 1); index += 1) {
        const speed = entity.components?.pathFollower?.speed;
        const x = this.random.between(area.x.min, area.x.max);
        if (!this.canPlaceEntity(entity.id, x)) continue;
        const object = this.acquireMover(entity.id, x, this.random.between(area.y.min, area.y.max));
        if (!object) break;
        this.movers.push({ object, velocityX: speed ? this.random.between(speed.min, speed.max) : 0, expiresAt: this.time.now + 12000, pathId, entityId: entity.id });
      }
    } else if (action.type === 'emit') this.emitWorldEvent(action.event, action.payload);
  }

  private executeCapability(action: SequenceActionDefinition): void {
    if (action.type === 'set-environment') this.setEnvironment(action.state);
    else if (action.type === 'set-weather') this.setWeather(action.weather ?? undefined);
    else if (action.type === 'start-sequence') this.capabilities.startSequence(action.sequence, this.time.now);
    else if (action.type === 'set-state') this.capabilities.setState(action.machine, action.state);
    else if (action.type === 'set-property') {
      this.capabilities.properties.set(action.target, action.property, action.value);
      this.applyProperty(action.target, action.property, action.value);
      window.dispatchEvent(new CustomEvent('world:property-change', { detail: action }));
    }
    else if (action.type === 'spawn') this.spawnWorldEntity(action.entity, action.at ?? { x: this.cameras.main.scrollX + this.scale.width / 2, y: this.template.layout.groundY, z: 0 }, action.count ?? 1, action.as);
    else if (action.type === 'follow-path') {
      const target = this.worldMovers.get(action.target);
      if (target) {
        target.follower = this.capabilities.createFollower(action.follower);
        target.orientToTangent = action.follower.orientToTangent;
        target.cameraRelative = action.follower.cameraRelative;
      }
    }
    else if (action.type === 'despawn') this.despawnWorldEntity(action.target);
    else if (action.type === 'play-animation') {
      const target = this.worldMovers.get(action.target)?.object;
      if (target instanceof Phaser.GameObjects.Sprite && this.anims.exists(action.animation)) target.play(action.animation);
    }
    else if (action.type === 'emit') this.emitWorldEvent(action.event, action.payload);
    else if (action.type === 'emit-particles') {
      const effect = this.template.effects?.find((candidate) => candidate.id === action.effect);
      if (effect && !this.capabilities.effects.isEnabled(effect.id)) return;
      const emitter = effect?.emitter ? this.capabilities.particles.get(effect.emitter) : this.capabilities.particles.get(action.effect);
      if (emitter) emitter.emit(action.at ?? { x: this.cameras.main.scrollX + this.scale.width / 2, y: this.scale.height / 2, z: 0 }, action.count ?? 1);
    } else window.dispatchEvent(new CustomEvent('world:action', { detail: action }));
  }

  private spawnWorldEntity(entityId: string, position: { x: number; y: number; z: number }, count: number, requestedId?: string): void {
    const definition = this.requireEntity(entityId);
    for (let index = 0; index < count; index += 1) {
      if (!this.canPlaceEntity(entityId, position.x)) continue;
      const id = index === 0 && requestedId ? requestedId : `${entityId}:${this.nextWorldInstance++}`;
      this.despawnWorldEntity(id);
      const object = this.createPlaced({ entity: entityId, x: 0, y: 0 }, 0).setScrollFactor(0);
      this.worldMovers.set(id, {
        id, entityId, object, position: { ...position }, baseScale: definition.scale ?? 1, baseDepth: definition.depth,
      });
      this.applyPropertySnapshot(entityId, object);
      this.applyPropertySnapshot(id, object);
    }
  }

  private despawnWorldEntity(id: string): void {
    const target = this.worldMovers.get(id);
    if (!target) return;
    target.object.destroy();
    this.worldMovers.delete(id);
  }

  private updateWorldMotion(deltaMs: number): void {
    this.projector.resize(this.scale.width, this.scale.height);
    this.projector.setCameraX(this.cameras.main.scrollX);
    for (const target of [...this.worldMovers.values()]) {
      const sample = target.follower?.update(deltaMs);
      if (sample) target.position = sample.position;
      // Motion/projection establishes the base transform. Entity bindings then instance bindings are final overrides.
      const bindings = { ...this.capabilities.properties.snapshot(target.entityId), ...this.capabilities.properties.snapshot(target.id) };
      const boundPosition = { ...target.position };
      for (const axis of ['x', 'y', 'z'] as const) if (typeof bindings[axis] === 'number') boundPosition[axis] = bindings[axis];
      const projected = this.projector.project(target.cameraRelative
        ? { ...boundPosition, x: boundPosition.x + this.cameras.main.scrollX }
        : boundPosition);
      target.object.setPosition(projected.x, projected.y).setScale(target.baseScale * projected.scale)
        .setDepth(target.baseDepth + boundPosition.z / 10).setVisible(projected.visible);
      if (sample && target.orientToTangent && bindings.angle === undefined) target.object.setAngle(Math.atan2(sample.tangent.y, sample.tangent.x) * 180 / Math.PI);
      Object.entries(bindings).forEach(([property, value]) => {
        if (property !== 'x' && property !== 'y' && property !== 'z') this.applyPropertyToView(target.object, property, value);
      });
      if ((typeof bindings.scale === 'number' && Math.abs(target.object.scaleX - bindings.scale) < 0.0001)
        || (typeof bindings.angle === 'number' && Math.abs(target.object.angle - bindings.angle) < 0.0001)) this.propertyOverrideObserved = true;
      if (sample?.completed) this.despawnWorldEntity(target.id);
    }
  }

  private setEnvironment(id: string): void {
    if (this.activeEnvironment === id) return;
    const environment = this.template.environments.find((candidate) => candidate.id === id);
    if (!environment) throw new Error(`Unknown environment '${id}'`);
    this.activeEnvironment = id; this.paintSky(environment);
    this.environmentChanges += 1;
    this.capabilities.effects.setEnvironment(id);
    this.applyEnvironmentAppearance(environment);
    const weather = this.template.weather.find((candidate) => candidate.id === this.activeWeather);
    if (weather?.availableIn?.length && !weather.availableIn.includes(id)) this.activeWeather = undefined;
  }

  private setWeather(id?: string): void {
    if (!id) { this.activeWeather = undefined; return; }
    const weather = this.template.weather.find((candidate) => candidate.id === id);
    if (!weather) throw new Error(`Unknown weather '${id}'`);
    if (weather.availableIn?.length && (!this.activeEnvironment || !weather.availableIn.includes(this.activeEnvironment))) {
      throw new Error(`Weather '${id}' is unavailable in environment '${this.activeEnvironment ?? 'unset'}'`);
    }
    this.activeWeather = id;
  }

  private evaluateChunkTrigger(): void {
    const center = this.cameras.main.scrollX + this.cameras.main.width / 2;
    const chunk = this.chunks.find((candidate) => center >= candidate.start && center < candidate.end);
    if (!chunk || chunk.id === this.currentChunk) return;
    this.currentChunk = chunk.id;
    this.actions.dispatch(this.triggers.evaluate({ chunk: chunk.id }));
  }

  private requireEntity(id: string): EntityDefinition {
    const entity = this.entities.get(id);
    if (!entity) throw new Error(`Unknown entity '${id}'`);
    return entity;
  }

  private acquireMover(entityId: string, x: number, y: number): EntityView | undefined {
    const configuredPool = this.entityPools.get(entityId);
    const pooled = configuredPool?.acquire() ?? this.moverPool.get(entityId)?.pop();
    if (configuredPool && !pooled) return undefined;
    const object = pooled ?? this.createPlaced({ entity: entityId, x, y }, 0);
    const definition = this.requireEntity(entityId);
    object.setPosition(x, y).setActive(true).setVisible(true).setFlipX(false)
      .setScale(definition.scale ?? 1).setDepth(definition.depth).setAlpha(1);
    this.tweens.getTweensOf(object).forEach((tween) => tween.resume());
    if (object instanceof Phaser.GameObjects.Sprite) {
      const animation = this.requireEntity(entityId).animation;
      if (animation && object.anims.currentAnim?.key !== animation) object.play(animation);
      else object.anims.resume();
    }
    this.applyEnvironmentToView(object, definition.asset);
    this.applyPropertySnapshot(entityId, object);
    return object;
  }

  private releaseMover(entityId: string, object: EntityView): void {
    const configuredPool = this.entityPools.get(entityId);
    if (configuredPool) {
      configuredPool.release(object);
      return;
    }
    object.setActive(false).setVisible(false);
    this.tweens.getTweensOf(object).forEach((tween) => tween.pause());
    if (object instanceof Phaser.GameObjects.Sprite) object.anims.pause();
    const pool = this.moverPool.get(entityId) ?? [];
    pool.push(object);
    this.moverPool.set(entityId, pool);
  }

  private emitWorldEvent(event: string, payload?: Record<string, unknown>): void {
    this.emittedEvents.set(event, (this.emittedEvents.get(event) ?? 0) + 1);
    this.actions.dispatch(this.triggers.evaluate({ event }));
    this.capabilities.broadcastStateEvent(event).forEach((action) => this.executeCapability(action));
    window.dispatchEvent(new CustomEvent(`world:${event}`, { detail: payload }));
  }

  private canPlaceEntity(entityId: string, x: number): boolean {
    const entity = this.requireEntity(entityId);
    const tags = entity.components?.tags ?? [];
    if (!tags.length || !this.template.compositionRules?.entities) return true;
    const neighborhood = this.scale.width;
    const existing = [...this.entityViews].flatMap((view) => {
      if (!view.active || !view.visible || Math.abs(view.x - x) > neighborhood) return [];
      const existingId = this.viewEntities.get(view);
      const definition = existingId ? this.entities.get(existingId) : undefined;
      return definition ? [{ x: view.x, tags: definition.components?.tags ?? [] }] : [];
    });
    return this.composition.canPlace({ x, tags }, existing);
  }

  private activitySnapshot(): { traffic: number; sequences: number; particles: number } {
    return {
      traffic: this.movers.filter((mover) => mover.trafficId !== undefined).length,
      sequences: this.capabilities.activeSequenceCount,
      particles: this.capabilities.activeParticleCount,
    };
  }

  private resolveEnvironmentAsset(asset: string): string {
    const environment = this.template.environments.find((candidate) => candidate.id === this.activeEnvironment);
    return environment?.assetVariants?.[asset] ?? asset;
  }

  private applyEnvironmentAppearance(environment: EnvironmentState): void {
    const tint = environment.ambientTint ?? 0xffffff;
    for (const group of this.backgroundObjects) {
      const asset = environment.assetVariants?.[group.layer.asset] ?? group.layer.asset;
      if (asset !== group.layer.asset) this.environmentVariantApplications += group.images.length;
      group.images.forEach((image) => image.setTexture(asset).setTint(tint));
    }
    for (const view of this.entityViews) {
      const entityId = this.viewEntities.get(view);
      const entity = entityId ? this.entities.get(entityId) : undefined;
      if (entity) this.applyEnvironmentToView(view, entity.asset, environment);
    }
    this.particleRenderer.setEnvironment((asset) => environment.assetVariants?.[asset] ?? asset, tint);
  }

  private applyEnvironmentToView(view: EntityView, baseAsset: string, environment?: EnvironmentState): void {
    const active = environment ?? this.template.environments.find((candidate) => candidate.id === this.activeEnvironment);
    view.setTexture(active?.assetVariants?.[baseAsset] ?? baseAsset);
    view.setTint(this.multiplyTint(this.authoredTints.get(view) ?? 0xffffff, active?.ambientTint ?? 0xffffff));
  }

  private multiplyTint(left: number, right: number): number {
    const channel = (shift: number) => Math.round(((left >> shift) & 0xff) * ((right >> shift) & 0xff) / 255);
    return (channel(16) << 16) | (channel(8) << 8) | channel(0);
  }

  private particleLogicalDelta(particle: ParticleState, deltaMs: number): number {
    const policy = this.template.offscreen;
    if (!policy?.suspendParticles || !this.offscreen) return deltaMs;
    const projected = this.projector.project(particle.position);
    const sleeping = !projected.visible || this.offscreen.isSleeping(
      { left: projected.x, right: projected.x, top: projected.y, bottom: projected.y },
      { left: 0, right: this.scale.width, top: 0, bottom: this.scale.height },
    );
    return this.offscreen.logicalDelta(deltaMs, sleeping);
  }

  private applyPropertySnapshot(target: string, view: EntityView): void {
    Object.entries(this.capabilities.properties.snapshot(target)).forEach(([property, value]) => this.applyPropertyToView(view, property, value));
  }

  private applyProperty(target: string, property: string, value: string | number | boolean): void {
    const worldTarget = this.worldMovers.get(target);
    if (worldTarget) {
      if ((property === 'x' || property === 'y' || property === 'z') && typeof value === 'number') worldTarget.position[property] = value;
      else this.applyPropertyToView(worldTarget.object, property, value);
      return;
    }
    for (const view of this.entityViews) if (this.viewEntities.get(view) === target) this.applyPropertyToView(view, property, value);
  }

  private applyPropertyToView(view: EntityView, property: string, value: string | number | boolean): void {
    if (property === 'visible' && typeof value === 'boolean') view.setVisible(value);
    else if (property === 'active' && typeof value === 'boolean') view.setActive(value);
    else if (property === 'alpha' && typeof value === 'number') view.setAlpha(value);
    else if (property === 'angle' && typeof value === 'number') view.setAngle(value);
    else if (property === 'depth' && typeof value === 'number') view.setDepth(value);
    else if (property === 'scale' && typeof value === 'number') view.setScale(value);
    else if (property === 'scaleX' && typeof value === 'number') view.setScale(value, view.scaleY);
    else if (property === 'scaleY' && typeof value === 'number') view.setScale(view.scaleX, value);
    else if (property === 'tint' && typeof value === 'number') { this.authoredTints.set(view, value); this.applyEnvironmentToView(view, this.requireEntity(this.viewEntities.get(view)!).asset); }
    else if (property === 'x' && typeof value === 'number') view.setX(value);
    else if (property === 'y' && typeof value === 'number') view.setY(value);
  }

  private updateEnvironmentEffects(deltaMs: number): void {
    const seconds = deltaMs / 1000;
    for (const effect of this.capabilities.effects.active()) {
      if (effect.type === 'lightning-flash' && this.random.chance((effect.density ?? 0.02) * seconds)) this.flashEnvironment();
      if (!effect.emitter) continue;
      const emitter = this.capabilities.particles.get(effect.emitter);
      const rate = emitter?.definition.ratePerSecond ?? 0;
      if (!emitter || rate <= 0) continue;
      const accumulated = (this.effectEmissionRemainder.get(effect.id) ?? 0) + rate * seconds * (effect.density ?? 1);
      const count = Math.floor(accumulated);
      this.effectEmissionRemainder.set(effect.id, accumulated - count);
      if (count > 0) emitter.emit(this.effectOrigin(effect.type), count);
    }
  }

  private effectOrigin(type: NonNullable<WorldTemplate['effects']>[number]['type']): { x: number; y: number; z: number } {
    const x = this.cameras.main.scrollX + this.random.between(0, this.scale.width);
    if (type === 'precipitation' || type === 'clouds' || type === 'fog-band') return { x, y: this.random.between(0, this.scale.height * 0.45), z: 0 };
    return { x, y: this.template.layout.groundY, z: 0 };
  }

  private flashEnvironment(): void {
    if (!this.effectFlash || this.effectFlash.alpha > 0.02) return;
    this.effectFlash.setAlpha(0.5);
    this.tweens.add({ targets: this.effectFlash, alpha: 0, duration: 180, ease: 'Quad.Out' });
  }

  private disposeRuntimeViews(): void {
    this.particleRenderer.destroy();
    this.entityPools.forEach((pool) => pool.releaseAll());
    this.worldMovers.forEach((target) => target.object.destroy());
    this.worldMovers.clear();
  }

  private collectTelemetry(): RuntimeTelemetrySnapshot {
    const textureMemoryMb = Object.values(this.textures.list).flatMap((texture) => texture.source)
      .reduce((bytes, source) => bytes + source.width * source.height * 4, 0) / (1024 * 1024);
    const pools: RuntimeTelemetrySnapshot['pools'] = {};
    this.entityPools.forEach((pool, entity) => { pools[entity] = { active: pool.activeCount, available: pool.availableCount, size: pool.size }; });
    const boundWorldMovers = [...this.worldMovers.values()].flatMap((target) => {
      const bindings = { ...this.capabilities.properties.snapshot(target.entityId), ...this.capabilities.properties.snapshot(target.id) };
      if (!Object.keys(bindings).length) return [];
      return [{
        id: target.id, bindings,
        actual: {
          x: target.object.x, y: target.object.y, scaleX: target.object.scaleX, scaleY: target.object.scaleY,
          depth: target.object.depth, visible: target.object.visible, angle: target.object.angle,
        },
      }];
    });
    const memory = performance as Performance & { memory?: { usedJSHeapSize: number } };
    return {
      worldId: this.template.id,
      elapsedMs: this.elapsedMs,
      cameraX: this.cameras.main.scrollX,
      fps: this.performance.snapshot({
        drawCalls: 0, triangles: 0, textures: 0, activeEntities: 0, activeAnimatedEntities: 0,
        activeParticles: 0, activeChunks: 0,
      }).fps,
      renderObjects: this.children.length,
      textures: Object.keys(this.textures.list).length,
      textureMemoryMb,
      activeChunks: this.chunks.length,
      sleepingChunks: this.chunks.filter((chunk) => chunk.sleeping).length,
      activeMovers: this.movers.length,
      activeWorldMovers: this.worldMovers.size,
      activeSequences: this.capabilities.activeSequenceCount,
      activeParticles: this.capabilities.activeParticleCount,
      pools,
      particleViews: this.particleRenderer.snapshot(),
      scheduler: this.scheduler.snapshot(),
      director: { intensity: this.director.intensity, activeEvents: this.director.activeEventCount },
      environment: this.activeEnvironment,
      weather: this.activeWeather,
      environmentChanges: this.environmentChanges,
      environmentVariantApplications: this.environmentVariantApplications,
      emittedEvents: Object.fromEntries(this.emittedEvents),
      propertyOverrideObserved: this.propertyOverrideObserved,
      backgroundAssets: [...new Set(this.backgroundObjects.flatMap((group) => group.images.map((image) => image.texture.key)))],
      boundWorldMovers,
      heapUsedMb: memory.memory ? memory.memory.usedJSHeapSize / (1024 * 1024) : undefined,
    };
  }

  private drawDebug(): void {
    this.debugGraphics ??= this.add.graphics().setDepth(999);
    this.debugGraphics.clear();
    if (this.debug) {
      this.debugGraphics.lineStyle(2, 0x63e6be, 0.7);
      this.chunks.forEach((chunk) => this.debugGraphics?.strokeRect(chunk.start, 20, chunk.end - chunk.start, this.template.layout.chunkHeight - 40));
    }
    if (this.calibrate) {
      const camera = this.cameras.main;
      const left = camera.scrollX; const right = left + camera.width;
      this.debugGraphics.lineStyle(2, 0xffd166, 0.95).lineBetween(left, this.template.layout.groundY, right, this.template.layout.groundY);
      this.debugGraphics.lineStyle(1, 0x49dcb1, 0.8);
      this.template.paths.forEach((path) => this.debugGraphics?.lineBetween(left, path.y, right, path.y));
      this.debugGraphics.lineStyle(1, 0xff6b9d, 0.55);
      for (const layer of this.template.backgrounds) {
        const offset = (layer.offsetX ?? 0) - (camera.scrollX * layer.parallax) % layer.spacing;
        for (let x = offset - layer.spacing; x < camera.width + layer.spacing; x += layer.spacing) this.debugGraphics.lineBetween(left + x, 0, left + x, camera.height);
      }
      this.debugGraphics.lineStyle(2, 0x7dd3fc, 0.9).strokeRect(left + 40, this.template.layout.groundY - 100, 34, 100);
      this.debugGraphics.lineStyle(2, 0xc4b5fd, 0.9).strokeRect(left + 86, this.template.layout.groundY - 135, 58, 135);
    }
    this.debugText ??= this.add.text(12, 12, '', {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '13px', color: '#d8fff4',
      backgroundColor: 'rgba(19, 24, 34, 0.82)', padding: { x: 10, y: 8 },
    }).setScrollFactor(0).setDepth(1100);
    const renderable = this.children.length;
    const textureMemoryMb = Object.values(this.textures.list).flatMap((texture) => texture.source)
      .reduce((bytes, source) => bytes + source.width * source.height * 4, 0) / (1024 * 1024);
    const snapshot = this.performance.snapshot({
      drawCalls: renderable,
      triangles: renderable * 2,
      textures: Object.keys(this.textures.list).length,
      textureMemoryMb,
      activeEntities: renderable,
      activeAnimatedEntities: this.tweens.getTweensOf(this.children.list).length + this.movers.filter((mover) => mover.object instanceof Phaser.GameObjects.Sprite).length,
      activeParticles: this.capabilities.activeParticleCount,
      activeChunks: this.chunks.length,
    });
    const violations = this.template.performanceBudget ? this.performance.violations(snapshot, this.template.performanceBudget) : [];
    const metrics = [
      `FPS ${snapshot.fps.toFixed(0)}`,
      `draw calls ~${snapshot.drawCalls}  triangles ~${snapshot.triangles}`,
      `textures ${snapshot.textures}  ~${snapshot.textureMemoryMb?.toFixed(1)} MB`,
      `entities ${snapshot.activeEntities}  animated ${snapshot.activeAnimatedEntities}`,
      `particles ${snapshot.activeParticles}  chunks ${snapshot.activeChunks}`,
      `activity ${Math.round(this.director.intensity * 100)}%`,
      `budget ${violations.length ? `over: ${violations.join(', ')}` : 'ok'}`,
    ];
    if (this.calibrate) metrics.push(
      `CALIBRATION  ground y=${this.template.layout.groundY}`,
      'gold ground  green paths  pink seams',
      'blue 100px human  violet 135px door',
    );
    this.debugText.setText(metrics);
  }
}
