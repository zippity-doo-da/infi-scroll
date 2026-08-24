import { describe, expect, it } from 'vitest';
import { SeededRandom } from '../../../engine/core/SeededRandom';
import { ActivityDirector } from '../../../engine/systems/ActivityDirector';
import { EnvironmentEffects } from '../../../engine/systems/EnvironmentEffects';
import { EventScheduler } from '../../../engine/systems/EventScheduler';
import { StateMachine } from '../../../engine/systems/StateMachine';
import { TriggerEngine } from '../../../engine/systems/TriggerEngine';
import { runtimeVerification } from '.';

describe('runtime verification fixture', () => {
  it('declares every integration capability the fixture is intended to exercise', () => {
    expect(runtimeVerification.environments.some((environment) => environment.assetVariants && environment.ambientTint !== undefined)).toBe(true);
    expect(runtimeVerification.weather.some((weather) => weather.particleAsset)).toBe(true);
    expect(runtimeVerification.particleEmitters?.length).toBeGreaterThan(0);
    expect(runtimeVerification.effects?.length).toBeGreaterThan(0);
    expect(runtimeVerification.sequences?.flatMap((sequence) => sequence.steps.flatMap((step) => step.actions)).some((action) => action.type === 'set-property')).toBe(true);
    expect(runtimeVerification.triggers.some((trigger) => trigger.when.type === 'event')).toBe(true);
    expect(runtimeVerification.stateMachines?.length).toBeGreaterThan(0);
    expect(runtimeVerification.events.length).toBe(2);
    expect(runtimeVerification.director).toBeDefined();
  });

  it('exercises director deferral, event triggers, state transitions, and environment effects', () => {
    const scheduler = new EventScheduler(runtimeVerification.events, new SeededRandom('fixture'));
    const director = new ActivityDirector(runtimeVerification.director);
    const due = scheduler.dueEvents(0, 20);
    const accepted = director.select(due, 0, 20, { traffic: 0, sequences: 0, particles: 0 });
    expect(accepted).toHaveLength(1);
    scheduler.accept(accepted, 0);
    scheduler.defer(due.filter((event) => !accepted.includes(event)), 0, 0.02);
    const retry = scheduler.dueEvents(0.3, 20.3);
    expect(retry).toHaveLength(1);
    expect(director.select(retry, 0.3, 20.3, { traffic: 0, sequences: 0, particles: 0 })).toHaveLength(1);

    const trigger = new TriggerEngine(runtimeVerification.triggers);
    expect(trigger.evaluate({ event: 'verification-director-retry' })).toContainEqual({ type: 'start-sequence', sequence: 'verification-followup' });
    const machine = new StateMachine(runtimeVerification.stateMachines![0]!);
    expect(machine.send('verification-pulse').actions.some((action) => action.type === 'set-property')).toBe(true);
    const effects = new EnvironmentEffects(runtimeVerification.effects!);
    effects.setEnvironment('verification-alert');
    expect(effects.active().map((effect) => effect.id)).toContain('verification-sparks');
  });
});
