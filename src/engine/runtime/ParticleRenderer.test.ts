import { describe, expect, it } from 'vitest';
import { SeededRandom } from '../core/SeededRandom';
import { ParticleBatch } from '../systems/ParticleBatch';
import { ParticleRenderer } from './ParticleRenderer';

class FakeImage {
  active = false;
  visible = false;
  destroyed = false;
  setScrollFactor(): this { return this; }
  setActive(value: boolean): this { this.active = value; return this; }
  setVisible(value: boolean): this { this.visible = value; return this; }
  setTexture(): this { return this; }
  setPosition(): this { return this; }
  setScale(): this { return this; }
  setAlpha(): this { return this; }
  setDepth(): this { return this; }
  setTint(): this { return this; }
  destroy(): void { this.destroyed = true; }
}

describe('ParticleRenderer', () => {
  it('reuses pooled Phaser-facing views after logical particles expire', () => {
    const allocated: FakeImage[] = [];
    const scene = { add: { image: () => { const image = new FakeImage(); allocated.push(image); return image; } }, scale: { width: 960, height: 540 } };
    const batch = new ParticleBatch({ id: 'sparks', asset: 'spark', maxParticles: 2, lifetimeMs: { min: 100, max: 100 } }, new SeededRandom('renderer'));
    const runtime = { particles: new Map([['sparks', batch]]) };
    const projector = { project: () => ({ x: 100, y: 100, scale: 1, depth: 0, visible: true }) };
    const renderer = new ParticleRenderer(scene as never, runtime as never, projector as never);
    batch.emit({ x: 0, y: 0, z: 0 }); renderer.sync();
    const initialAllocations = allocated.length;
    batch.update(100); renderer.sync();
    batch.emit({ x: 0, y: 0, z: 0 }); renderer.sync();
    expect(allocated.length).toBe(initialAllocations);
    expect(renderer.snapshot().reused).toBeGreaterThan(0);
    renderer.destroy();
    expect(allocated.every((image) => image.destroyed)).toBe(true);
  });
});
