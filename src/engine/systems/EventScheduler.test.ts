import { describe, expect, it } from 'vitest';
import type { ScheduledEvent } from '../contracts/world';
import { SeededRandom } from '../core/SeededRandom';
import { ActivityDirector } from './ActivityDirector';
import { EventScheduler } from './EventScheduler';

const event: ScheduledEvent = {
  id: 'rare-visitor', everyWorldHours: 2, cooldownWorldHours: 2, actions: [{ type: 'emit', event: 'arrived' }],
};

describe('scheduler and director acceptance', () => {
  it('does not consume cooldown until a due event is accepted', () => {
    const scheduler = new EventScheduler([event], new SeededRandom('scheduler'));
    const first = scheduler.dueEvents(2, 2);
    expect(first).toEqual([event]);
    scheduler.defer(first, 2, 0.1);
    expect(scheduler.snapshot()).toMatchObject({ pending: 1, accepted: 0, deferred: 1 });
    expect(scheduler.dueEvents(2.05, 2.05)).toEqual([]);
    expect(scheduler.dueEvents(2.1, 2.1)).toEqual([event]);
    scheduler.accept(first, 2.1);
    expect(scheduler.snapshot()).toMatchObject({ pending: 0, accepted: 1 });
    expect(scheduler.dueEvents(3, 3)).toEqual([]);
    expect(scheduler.dueEvents(4.11, 4.11)).toEqual([event]);
  });

  it('keeps director-rejected events pending for a later retry', () => {
    const scheduler = new EventScheduler([event], new SeededRandom('director'));
    const director = new ActivityDirector({ maxActivity: 0 });
    const due = scheduler.dueEvents(2, 2);
    const accepted = director.select(due, 2, 2, { traffic: 0, sequences: 0, particles: 0 });
    scheduler.accept(accepted, 2);
    scheduler.defer(due.filter((candidate) => !accepted.includes(candidate)), 2, 0.05);
    expect(accepted).toEqual([]);
    expect(scheduler.dueEvents(2.05, 2.05)).toEqual([event]);
  });
});
