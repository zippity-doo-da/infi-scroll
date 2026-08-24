export class SeededRandom {
  private state: number;

  constructor(seed: number | string) {
    const text = String(seed);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
    this.state = hash >>> 0 || 1;
  }

  next(): number {
    let x = this.state;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this.state = x >>> 0;
    return this.state / 4294967296;
  }

  between(min: number, max: number): number { return min + (max - min) * this.next(); }
  int(min: number, max: number): number { return Math.floor(this.between(min, max + 1)); }
  pick<T>(items: readonly T[]): T { return items[Math.floor(this.next() * items.length)]!; }
  chance(probability: number): boolean { return this.next() < probability; }
}
