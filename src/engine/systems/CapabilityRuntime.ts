import type { ParticleState } from './ParticleBatch';
import type { SequenceActionDefinition, WorldPathFollowerDefinition } from '../contracts/capabilities';
import type { WorldTemplate } from '../contracts/world';
import type { SeededRandom } from '../core/SeededRandom';
import { MotionPath, WorldPathFollower } from './MotionPath';
import { ParticleBatch } from './ParticleBatch';
import { SequenceRunner } from './SequenceRunner';
import { StateMachine } from './StateMachine';
import { EnvironmentEffects } from './EnvironmentEffects';
import { PropertyState } from './PropertyState';

export class CapabilityRuntime {
  readonly paths: Map<string, MotionPath>;
  readonly sequences: Map<string, SequenceRunner>;
  readonly states: Map<string, StateMachine>;
  readonly particles: Map<string, ParticleBatch>;
  readonly effects: EnvironmentEffects;
  readonly properties = new PropertyState();

  constructor(template: WorldTemplate, random: SeededRandom, dispatch: (action: SequenceActionDefinition) => void) {
    this.paths = new Map((template.motionPaths ?? []).map((definition) => [definition.id, new MotionPath(definition)]));
    this.sequences = new Map((template.sequences ?? []).map((definition) => [definition.id, new SequenceRunner(definition, dispatch)]));
    this.states = new Map((template.stateMachines ?? []).map((definition) => [definition.id, new StateMachine(definition)]));
    this.particles = new Map((template.particleEmitters ?? []).map((definition) => [definition.id, new ParticleBatch(definition, random)]));
    this.effects = new EnvironmentEffects(template.effects ?? []);
  }

  update(deltaMs: number, nowMs: number, particleDelta?: (particle: ParticleState, deltaMs: number) => number): void {
    this.sequences.forEach((sequence) => sequence.update(deltaMs, nowMs));
    this.particles.forEach((batch) => batch.update(deltaMs, particleDelta));
  }

  startSequence(id: string, nowMs = 0): boolean {
    const sequence = this.sequences.get(id);
    if (!sequence) throw new Error(`Unknown sequence '${id}'`);
    return sequence.start(nowMs);
  }

  sendStateEvent(machineId: string, event: string): SequenceActionDefinition[] {
    const machine = this.states.get(machineId);
    if (!machine) throw new Error(`Unknown state machine '${machineId}'`);
    return machine.send(event).actions;
  }

  broadcastStateEvent(event: string): SequenceActionDefinition[] {
    return [...this.states.values()].flatMap((machine) => machine.send(event).actions);
  }

  setState(machineId: string, state: string): void {
    const machine = this.states.get(machineId);
    if (!machine) throw new Error(`Unknown state machine '${machineId}'`);
    machine.set(state);
  }

  createFollower(definition: WorldPathFollowerDefinition): WorldPathFollower {
    const path = this.paths.get(definition.path);
    if (!path) throw new Error(`Unknown motion path '${definition.path}'`);
    return new WorldPathFollower(path, definition);
  }

  get activeParticleCount(): number {
    let count = 0;
    this.particles.forEach((batch) => { count += batch.activeCount; });
    return count;
  }

  get activeSequenceCount(): number {
    return [...this.sequences.values()].filter((sequence) => sequence.active).length;
  }
}
