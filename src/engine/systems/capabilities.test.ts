import { describe, expect, it } from 'vitest';
import { SeededRandom } from '../core/SeededRandom';
import { MotionPath, WorldPathFollower } from './MotionPath';
import { ObjectPool } from './ObjectPool';
import { OffscreenController } from './OffscreenController';
import { ParticleBatch } from './ParticleBatch';
import { PerspectiveProjector } from './PerspectiveProjector';
import { SequenceRunner } from './SequenceRunner';
import { StateMachine } from './StateMachine';

describe('world-space capabilities', () => {
  it('samples reusable 3D curves and changes depth across a path', () => {
    const path = new MotionPath({
      id: 'flight', type: 'catmull-rom', durationMs: 2000,
      points: [{ x: 0, y: 600, z: 120 }, { x: 200, y: 300, z: 20 }, { x: 500, y: 100, z: -300 }],
    });
    expect(path.sample(0).position).toMatchObject({ x: 0, y: 600, z: 120 });
    expect(path.sample(1).position).toMatchObject({ x: 500, y: 100, z: -300 });
    expect(path.sample(0.5).tangent.z).toBeLessThan(0);
  });

  it('supports linear, waypoint, bezier, ballistic, orbit, and stationary paths', () => {
    const definitions = [
      { id: 'linear', type: 'linear' as const, points: [{ x: 0, y: 0, z: 0 }, { x: 10, y: 10, z: 10 }] },
      { id: 'waypoint', type: 'waypoint' as const, points: [{ x: 0, y: 0, z: 0 }, { x: 5, y: 8, z: 2 }, { x: 10, y: 0, z: 4 }] },
      { id: 'bezier', type: 'bezier' as const, points: [{ x: 0, y: 0, z: 0 }, { x: 2, y: 5, z: 1 }, { x: 8, y: 5, z: 3 }, { x: 10, y: 0, z: 4 }] as const },
      { id: 'ballistic', type: 'ballistic' as const, durationMs: 1000, origin: { x: 0, y: 0, z: 0 }, velocity: { x: 10, y: -10, z: -5 }, gravity: { x: 0, y: 20, z: 0 } },
      { id: 'orbit', type: 'orbit' as const, center: { x: 0, y: 0, z: 0 }, radius: { x: 10, y: 5, z: 2 } },
      { id: 'stationary', type: 'stationary' as const, point: { x: 3, y: 4, z: 5 } },
    ];
    definitions.forEach((definition) => expect(new MotionPath(definition).sample(0.5).position).toBeDefined());
  });

  it('advances followers deterministically without renderer state', () => {
    const follower = new WorldPathFollower(new MotionPath({ id: 'line', type: 'linear', durationMs: 1000, points: [{ x: 0, y: 0, z: 0 }, { x: 100, y: 0, z: -100 }] }));
    expect(follower.update(500).position).toMatchObject({ x: 50, y: 0, z: -50 });
    expect(follower.update(500).completed).toBe(true);
  });

  it('uses camera projection for natural perspective scale', () => {
    const projector = new PerspectiveProjector(1280, 720);
    const distant = projector.project({ x: 640, y: 360, z: -300 });
    const near = projector.project({ x: 640, y: 360, z: 200 });
    expect(near.scale).toBeGreaterThan(distant.scale);
    expect(near.depth).toBeLessThan(distant.depth);
  });
});

describe('lightweight runtime systems', () => {
  it('runs authored sequences with waits and reusable actions', () => {
    const events: string[] = [];
    const runner = new SequenceRunner({ id: 'event', steps: [{ actions: [
      { type: 'emit', event: 'start' }, { type: 'wait', durationMs: 100 }, { type: 'emit', event: 'finish' },
    ] }] }, (action) => { if (action.type === 'emit') events.push(action.event); });
    runner.start(); runner.update(0); expect(events).toEqual(['start']);
    runner.update(99); expect(events).toEqual(['start']);
    runner.update(1); expect(events).toEqual(['start', 'finish']);
  });

  it('transitions generic state machines and returns actions', () => {
    const machine = new StateMachine({ id: 'door', initial: 'closed', states: ['closed', 'open'], transitions: [
      { from: 'closed', to: 'open', event: 'toggle', actions: [{ type: 'emit', event: 'opened' }] },
    ] });
    expect(machine.send('toggle')).toMatchObject({ changed: true, state: 'open' });
  });

  it('pools reusable objects and caps allocations', () => {
    const pool = new ObjectPool(() => ({ value: 0 }), 1, 2, (item) => { item.value = 0; });
    const first = pool.acquire()!; const second = pool.acquire()!;
    expect(pool.acquire()).toBeUndefined();
    first.value = 4; pool.release(first);
    expect(pool.acquire()?.value).toBe(0);
    expect(pool.activeCount).toBe(2);
    pool.release(second);
  });

  it('sleeps distant visuals while preserving configured logical time', () => {
    const controller = new OffscreenController({ sleepMargin: 50, suspendAnimation: true, suspendParticles: true, keepLogicalTime: true });
    const sleeping = controller.isSleeping({ left: 500, right: 600, top: 0, bottom: 100 }, { left: 0, right: 300, top: 0, bottom: 200 });
    expect(sleeping).toBe(true);
    expect(controller.logicalDelta(16, sleeping)).toBe(16);
  });

  it('batches and recycles particles within a strict cap', () => {
    const batch = new ParticleBatch({ id: 'sparks', asset: 'spark', maxParticles: 2, lifetimeMs: { min: 100, max: 100 }, batched: true }, new SeededRandom('particles'));
    expect(batch.emit({ x: 0, y: 0, z: 0 }, 5)).toBe(2);
    batch.update(100);
    expect(batch.activeCount).toBe(0);
    expect(batch.emit({ x: 0, y: 0, z: 0 }, 2)).toBe(2);
  });

  it('can suspend offscreen particle logical time', () => {
    const batch = new ParticleBatch({ id: 'fog', asset: 'fog', maxParticles: 1, lifetimeMs: { min: 100, max: 100 } }, new SeededRandom('suspend'));
    batch.emit({ x: 1000, y: 0, z: 0 });
    batch.update(100, () => 0);
    expect(batch.activeCount).toBe(1);
    batch.update(100);
    expect(batch.activeCount).toBe(0);
  });
});
