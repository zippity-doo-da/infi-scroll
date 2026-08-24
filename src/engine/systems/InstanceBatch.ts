import type { WorldPoint3 } from '../contracts/capabilities';

export interface InstanceTransform {
  position: WorldPoint3;
  rotation?: WorldPoint3;
  scale?: WorldPoint3;
  opacity?: number;
  variant?: number;
}

export class InstanceBatch {
  private readonly instances = new Map<string, InstanceTransform>();
  private revision = 0;

  constructor(readonly asset: string, readonly material?: string) {}

  set(id: string, transform: InstanceTransform): void { this.instances.set(id, transform); this.revision += 1; }
  delete(id: string): boolean { const removed = this.instances.delete(id); if (removed) this.revision += 1; return removed; }
  clear(): void { if (this.instances.size) { this.instances.clear(); this.revision += 1; } }
  entries(): ReadonlyArray<readonly [string, InstanceTransform]> { return [...this.instances.entries()]; }
  get size(): number { return this.instances.size; }
  get version(): number { return this.revision; }
}

export class InstanceBatchRegistry {
  private readonly batches = new Map<string, InstanceBatch>();

  get(asset: string, material?: string): InstanceBatch {
    const key = `${asset}::${material ?? 'default'}`;
    let batch = this.batches.get(key);
    if (!batch) { batch = new InstanceBatch(asset, material); this.batches.set(key, batch); }
    return batch;
  }

  values(): readonly InstanceBatch[] { return [...this.batches.values()]; }
}
