import type { SequenceActionDefinition, SequenceDefinition } from '../contracts/capabilities';

export class SequenceRunner {
  private stepIndex = 0;
  private actionIndex = 0;
  private delayMs = 0;
  private running = false;
  private completedAt = -Infinity;

  constructor(readonly definition: SequenceDefinition, private readonly dispatch: (action: SequenceActionDefinition) => void) {}

  start(nowMs = 0): boolean {
    if (this.running || nowMs - this.completedAt < (this.definition.cooldownMs ?? 0)) return false;
    this.stepIndex = 0;
    this.actionIndex = 0;
    this.delayMs = this.definition.steps[0]?.afterMs ?? 0;
    this.running = this.definition.steps.length > 0;
    return this.running;
  }

  update(deltaMs: number, nowMs = 0): void {
    if (!this.running) return;
    this.delayMs -= deltaMs;
    while (this.running && this.delayMs <= 0) {
      const step = this.definition.steps[this.stepIndex];
      if (!step) { this.finish(nowMs); break; }
      const action = step.actions[this.actionIndex++];
      if (action) {
        if (action.type === 'wait') { this.delayMs += action.durationMs; continue; }
        this.dispatch(action);
        continue;
      }
      this.stepIndex += 1;
      this.actionIndex = 0;
      const next = this.definition.steps[this.stepIndex];
      if (next) this.delayMs += next.afterMs ?? 0;
      else if (this.definition.loop) {
        this.stepIndex = 0;
        this.delayMs += this.definition.steps[0]?.afterMs ?? 0;
      } else this.finish(nowMs);
    }
  }

  get active(): boolean { return this.running; }

  private finish(nowMs: number): void { this.running = false; this.completedAt = nowMs; }
}
