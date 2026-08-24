import type { ScheduledEvent } from '../contracts/world';
import type { SeededRandom } from '../core/SeededRandom';

export class EventScheduler {
  private readonly lastRun = new Map<string, number>();
  private readonly nextAttempt = new Map<string, number>();
  private readonly pending = new Map<string, ScheduledEvent>();
  private readonly deferredUntil = new Map<string, number>();
  private acceptedCount = 0;
  private deferredCount = 0;
  constructor(private readonly events: ScheduledEvent[], private readonly random: SeededRandom) {}

  dueEvents(totalHours: number, hour: number): ScheduledEvent[] {
    const due: ScheduledEvent[] = [];
    for (const event of this.events) {
      const dueByTime = !event.atHours || (hour >= event.atHours.min && hour <= event.atHours.max);
      const pending = this.pending.get(event.id);
      if (pending) {
        if (dueByTime && totalHours >= (this.deferredUntil.get(event.id) ?? -Infinity)) due.push(pending);
        continue;
      }
      const last = this.lastRun.get(event.id) ?? -Infinity;
      const interval = event.everyWorldHours ?? event.cooldownWorldHours ?? 1;
      if (!dueByTime || totalHours < (this.nextAttempt.get(event.id) ?? -Infinity) || totalHours - last < interval) continue;
      if (!this.random.chance(event.chance ?? 1)) {
        this.nextAttempt.set(event.id, totalHours + interval);
        continue;
      }
      this.pending.set(event.id, event);
      due.push(event);
    }
    return due;
  }

  accept(events: readonly ScheduledEvent[], totalHours: number): void {
    for (const event of events) {
      this.pending.delete(event.id);
      this.deferredUntil.delete(event.id);
      this.nextAttempt.delete(event.id);
      this.lastRun.set(event.id, totalHours);
      this.acceptedCount += 1;
    }
  }

  defer(events: readonly ScheduledEvent[], totalHours: number, retryWorldHours = 0.02): void {
    for (const event of events) {
      if (this.pending.has(event.id)) {
        this.deferredUntil.set(event.id, totalHours + retryWorldHours);
        this.deferredCount += 1;
      }
    }
  }

  snapshot(): { pending: number; accepted: number; deferred: number } {
    return { pending: this.pending.size, accepted: this.acceptedCount, deferred: this.deferredCount };
  }
}
