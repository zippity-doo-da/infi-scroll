import type { AssetDefinition, AssetPack } from '../contracts/world';

export class AssetCatalog {
  private readonly assets = new Map<string, AssetDefinition>();
  readonly packs: AssetPack[];

  constructor(packIds: string[], resolve: (id: string) => AssetPack) {
    const ordered: AssetPack[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const add = (id: string) => {
      if (visiting.has(id)) throw new Error(`Circular asset pack dependency: ${id}`);
      if (visited.has(id)) return;
      visiting.add(id);
      const pack = resolve(id);
      pack.requires?.forEach(add);
      visiting.delete(id); visited.add(id); ordered.push(pack);
    };
    packIds.forEach(add);
    this.packs = ordered;
    const provided = new Set(ordered.flatMap((pack) => pack.compatibility?.provides ?? []));
    for (const pack of ordered) {
      const conflict = pack.compatibility?.excludes?.find((tag) => provided.has(tag));
      if (conflict) throw new Error(`Asset pack '${pack.id}' is incompatible with '${conflict}' content`);
    }
    for (const pack of ordered) for (const asset of pack.assets) this.assets.set(asset.id, asset);
  }

  get(id: string): AssetDefinition {
    const asset = this.assets.get(id);
    if (!asset) throw new Error(`Asset '${id}' is not provided by the template's packs`);
    return asset;
  }
  all(): AssetDefinition[] { return [...this.assets.values()]; }
}
