import type { WorldClockDefinition } from '../contracts/world';

export class WorldClock {
  private elapsedHours = 0;
  constructor(private readonly config: WorldClockDefinition) {}
  update(deltaMs: number): void { this.elapsedHours += deltaMs / 1000 / this.config.realSecondsPerWorldHour; }
  get totalHours(): number { return this.config.startHour + this.elapsedHours; }
  get hour(): number { return this.totalHours % (this.config.loopHours ?? 24); }
  format(): string {
    const hours = Math.floor(this.hour); const minutes = Math.floor((this.hour - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}
