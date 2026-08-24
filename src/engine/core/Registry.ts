import type { AssetPack, WorldTemplate } from '../contracts/world';
import type { DesignProfile } from '../contracts/design';

export class Registry<T extends { id: string }> {
  private readonly values = new Map<string, T>();
  register(value: T): void {
    if (this.values.has(value.id)) throw new Error(`Duplicate registration: ${value.id}`);
    this.values.set(value.id, value);
  }
  get(id: string): T {
    const value = this.values.get(id);
    if (!value) throw new Error(`Unknown registration: ${id}`);
    return value;
  }
  has(id: string): boolean { return this.values.has(id); }
  ids(): string[] { return [...this.values.keys()]; }
}

export const worldRegistry = new Registry<WorldTemplate>();
export const assetPackRegistry = new Registry<AssetPack>();
export const designProfileRegistry = new Registry<DesignProfile>();
