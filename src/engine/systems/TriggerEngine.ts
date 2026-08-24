import type { ActionDefinition, TriggerDefinition } from '../contracts/world';

export class TriggerEngine {
  private readonly completed = new Set<string>();
  private readonly activeConditions = new Set<string>();
  constructor(private readonly triggers: TriggerDefinition[]) {}
  evaluate(input: { chunk?: string; hour?: number; event?: string }): ActionDefinition[] {
    return this.triggers.flatMap((trigger) => {
      if (trigger.once && this.completed.has(trigger.id)) return [];
      const when = trigger.when;
      const supplied = when.type === 'camera-enters-chunk' ? input.chunk !== undefined
        : when.type === 'world-hour' ? input.hour !== undefined
          : input.event !== undefined;
      if (!supplied) return [];
      const matches = when.type === 'camera-enters-chunk' ? when.chunk === input.chunk
        : when.type === 'world-hour' ? input.hour! >= when.hours.min && input.hour! <= when.hours.max
          : when.event === input.event;
      if (when.type === 'world-hour') {
        if (!matches) { this.activeConditions.delete(trigger.id); return []; }
        if (this.activeConditions.has(trigger.id)) return [];
        this.activeConditions.add(trigger.id);
      }
      if (!matches) return [];
      if (trigger.once) this.completed.add(trigger.id);
      return trigger.actions;
    });
  }
}
