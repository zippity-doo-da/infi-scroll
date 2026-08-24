import Phaser from 'phaser';
import type { ParticleState } from '../systems/ParticleBatch';
import type { CapabilityRuntime } from '../systems/CapabilityRuntime';
import type { PerspectiveProjector } from '../systems/PerspectiveProjector';
import { ObjectPool } from '../systems/ObjectPool';

export class ParticleRenderer {
  private readonly views = new Map<string, Map<ParticleState, Phaser.GameObjects.Image>>();
  private readonly pools = new Map<string, ObjectPool<Phaser.GameObjects.Image>>();
  private readonly allocated = new Set<Phaser.GameObjects.Image>();
  private readonly previouslyLeased = new WeakSet<Phaser.GameObjects.Image>();
  private resolveAsset: (asset: string) => string = (asset) => asset;
  private tint = 0xffffff;
  private reuseCount = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly runtime: CapabilityRuntime,
    private readonly projector: PerspectiveProjector,
  ) {}

  setEnvironment(resolveAsset: (asset: string) => string, tint: number): void {
    this.resolveAsset = resolveAsset;
    this.tint = tint;
    for (const [emitterId, emitterViews] of this.views) {
      const emitter = this.runtime.particles.get(emitterId);
      if (!emitter) continue;
      const asset = this.resolveAsset(emitter.definition.asset);
      emitterViews.forEach((view) => view.setTexture(asset).setTint(this.tint));
    }
  }

  sync(options: { suspendOffscreen?: boolean; sleepMargin?: number } = {}): void {
    for (const [emitterId, emitter] of this.runtime.particles) {
      const emitterViews = this.views.get(emitterId) ?? new Map<ParticleState, Phaser.GameObjects.Image>();
      this.views.set(emitterId, emitterViews);
      const pool = this.poolFor(emitterId);
      const active = new Set(emitter.values());
      for (const particle of active) {
        const existingView = emitterViews.get(particle);
        const view = existingView ?? pool.acquire();
        if (!view) continue;
        if (!existingView) {
          if (this.previouslyLeased.has(view)) this.reuseCount += 1;
          this.previouslyLeased.add(view);
        }
        emitterViews.set(particle, view);
        const projected = this.projector.project(particle.position);
        const margin = options.sleepMargin ?? 0;
        const offscreen = !projected.visible
          || projected.x < -margin || projected.x > this.scene.scale.width + margin
          || projected.y < -margin || projected.y > this.scene.scale.height + margin;
        if (options.suspendOffscreen && offscreen) {
          view.setActive(false).setVisible(false);
          continue;
        }
        const remaining = Math.max(0, 1 - particle.ageMs / particle.lifetimeMs);
        view.setTexture(this.resolveAsset(emitter.definition.asset)).setActive(true).setPosition(projected.x, projected.y)
          .setScale(particle.scale * projected.scale)
          .setAlpha(particle.opacity * remaining)
          .setDepth(500 + particle.position.z / 10)
          .setTint(this.tint)
          .setVisible(projected.visible);
      }
      for (const [particle, view] of emitterViews) {
        if (active.has(particle)) continue;
        pool.release(view); emitterViews.delete(particle);
      }
    }
  }

  private poolFor(emitterId: string): ObjectPool<Phaser.GameObjects.Image> {
    const existing = this.pools.get(emitterId);
    if (existing) return existing;
    const emitter = this.runtime.particles.get(emitterId)!;
    const pool = new ObjectPool(
      () => {
        const view = this.scene.add.image(0, 0, this.resolveAsset(emitter.definition.asset)).setScrollFactor(0).setActive(false).setVisible(false);
        this.allocated.add(view);
        return view;
      },
      Math.min(16, emitter.definition.maxParticles),
      emitter.definition.maxParticles,
      (view) => { view.setActive(false).setVisible(false); },
    );
    this.pools.set(emitterId, pool);
    return pool;
  }

  snapshot(): { active: number; available: number; allocated: number; reused: number } {
    let active = 0; let available = 0;
    this.pools.forEach((pool) => { active += pool.activeCount; available += pool.availableCount; });
    return { active, available, allocated: this.allocated.size, reused: this.reuseCount };
  }

  destroy(): void {
    this.allocated.forEach((view) => view.destroy());
    this.allocated.clear();
    this.views.clear();
    this.pools.clear();
  }
}
