export class ObjectPool<T> {
  private readonly available: T[] = [];
  private readonly active = new Set<T>();

  constructor(private readonly create: () => T, initialSize = 0, private readonly maxSize = Infinity, private readonly reset?: (value: T) => void) {
    for (let index = 0; index < initialSize; index += 1) this.available.push(this.create());
  }

  acquire(): T | undefined {
    const value = this.available.pop() ?? (this.size < this.maxSize ? this.create() : undefined);
    if (value !== undefined) this.active.add(value);
    return value;
  }

  release(value: T): boolean {
    if (!this.active.delete(value)) return false;
    this.reset?.(value);
    this.available.push(value);
    return true;
  }

  releaseAll(): void { for (const value of [...this.active]) this.release(value); }
  get activeCount(): number { return this.active.size; }
  get availableCount(): number { return this.available.length; }
  get size(): number { return this.active.size + this.available.length; }
}
