import type { ActivityDirectorDefinition, ScheduledEvent } from '../contracts/world';

export interface ActivitySnapshot {
  traffic: number;
  sequences: number;
  particles: number;
}

export class ActivityDirector {
  private readonly activeEvents = new Map<string, number>();
  private lastRareEvent = -Infinity;
  private lastIntensity = 0;

  constructor(private readonly definition?: ActivityDirectorDefinition) {}

  select(events: readonly ScheduledEvent[], totalHours: number, hour: number, activity: ActivitySnapshot): ScheduledEvent[] {
    if (!this.definition) return [...events];
    for (const [id, until] of this.activeEvents) if (until <= totalHours) this.activeEvents.delete(id);
    const limit = this.activityLimit(hour);
    let used = this.cost(activity);
    const selected: ScheduledEvent[] = [];
    for (const event of events) {
      const cost = this.definition.eventCosts?.[event.id] ?? 1;
      if (used + cost > limit || this.conflicts(event.id)) continue;
      if (event.rare && totalHours - this.lastRareEvent < (this.definition.rareEventSpacingWorldHours ?? 1)) continue;
      selected.push(event); used += cost;
      if (event.rare) this.lastRareEvent = totalHours;
      this.activeEvents.set(event.id, totalHours + (event.cooldownWorldHours ?? event.everyWorldHours ?? 0.25));
    }
    this.lastIntensity = limit > 0 ? Math.min(1, used / limit) : 0;
    return selected;
  }

  allowsTraffic(totalHours: number, hour: number, activity: ActivitySnapshot): boolean {
    void totalHours;
    if (!this.definition) return true;
    const limit = this.activityLimit(hour);
    const used = this.cost(activity);
    this.lastIntensity = limit > 0 ? Math.min(1, used / limit) : 0;
    return used + (this.definition.trafficCost ?? 1) <= limit;
  }

  get intensity(): number { return this.lastIntensity; }
  get activeEventCount(): number { return this.activeEvents.size; }

  private activityLimit(hour: number): number {
    const quiet = this.definition?.quietPeriods?.find((period) => this.inRange(hour, period.hours));
    return quiet?.maxActivity ?? this.definition?.maxActivity ?? Infinity;
  }

  private cost(activity: ActivitySnapshot): number {
    if (!this.definition) return 0;
    return activity.traffic * (this.definition.trafficCost ?? 1)
      + activity.sequences * (this.definition.sequenceCost ?? 2)
      + activity.particles / (this.definition.particlesPerActivity ?? 20);
  }

  private conflicts(event: string): boolean {
    return (this.definition?.conflicts ?? []).some((group) => group.includes(event) && group.some((id) => id !== event && this.activeEvents.has(id)));
  }

  private inRange(value: number, range: { min: number; max: number }): boolean {
    return range.min <= range.max ? value >= range.min && value <= range.max : value >= range.min || value <= range.max;
  }
}
