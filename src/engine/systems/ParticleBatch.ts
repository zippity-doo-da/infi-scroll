import type { ParticleEmitterDefinition, WorldPoint3 } from '../contracts/capabilities';
import type { SeededRandom } from '../core/SeededRandom';
import { ObjectPool } from './ObjectPool';

export interface ParticleState {
  position: WorldPoint3;
  velocity: WorldPoint3;
  ageMs: number;
  lifetimeMs: number;
  opacity: number;
  scale: number;
}

const zeroParticle = (): ParticleState => ({
  position: { x: 0, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, ageMs: 0, lifetimeMs: 1, opacity: 1, scale: 1,
});

export class ParticleBatch {
  private readonly pool: ObjectPool<ParticleState>;
  private readonly particles = new Set<ParticleState>();

  constructor(readonly definition: ParticleEmitterDefinition, private readonly random: SeededRandom) {
    this.pool = new ObjectPool(zeroParticle, Math.min(16, definition.maxParticles), definition.maxParticles);
  }

  emit(origin: WorldPoint3, requested = 1): number {
    let emitted = 0;
    for (let index = 0; index < requested; index += 1) {
      const particle = this.pool.acquire();
      if (!particle) break;
      const velocity = this.definition.velocity;
      particle.position = { ...origin };
      particle.velocity = {
        x: velocity ? this.random.between(velocity.x.min, velocity.x.max) : 0,
        y: velocity ? this.random.between(velocity.y.min, velocity.y.max) : 0,
        z: velocity ? this.random.between(velocity.z.min, velocity.z.max) : 0,
      };
      particle.ageMs = 0;
      particle.lifetimeMs = this.random.between(this.definition.lifetimeMs.min, this.definition.lifetimeMs.max);
      particle.opacity = this.random.between(this.definition.opacity?.min ?? 1, this.definition.opacity?.max ?? 1);
      particle.scale = this.random.between(this.definition.scale?.min ?? 1, this.definition.scale?.max ?? 1);
      this.particles.add(particle);
      emitted += 1;
    }
    return emitted;
  }

  update(deltaMs: number, logicalDelta: (particle: ParticleState, deltaMs: number) => number = (_particle, delta) => delta): void {
    const acceleration = this.definition.acceleration ?? { x: 0, y: 0, z: 0 };
    for (const particle of [...this.particles]) {
      const particleDelta = logicalDelta(particle, deltaMs);
      if (particleDelta <= 0) continue;
      const seconds = particleDelta / 1000;
      particle.ageMs += particleDelta;
      if (particle.ageMs >= particle.lifetimeMs) {
        this.particles.delete(particle);
        this.pool.release(particle);
        continue;
      }
      particle.velocity.x += acceleration.x * seconds;
      particle.velocity.y += acceleration.y * seconds;
      particle.velocity.z += acceleration.z * seconds;
      particle.position.x += particle.velocity.x * seconds;
      particle.position.y += particle.velocity.y * seconds;
      particle.position.z += particle.velocity.z * seconds;
    }
  }

  values(): readonly ParticleState[] { return [...this.particles]; }
  get activeCount(): number { return this.particles.size; }
}
