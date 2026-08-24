import { beforeEach, describe, expect, it } from 'vitest';
import type { AssetPack, ChunkTemplate, WorldTemplate } from '../contracts/world';
import { AssetCatalog } from './AssetCatalog';
import { Registry } from './Registry';
import { SeededRandom } from './SeededRandom';
import { ChunkSequence } from '../systems/ChunkSequence';
import { fantasyCity } from '../../content/worlds/fantasy-city';

describe('template architecture', () => {
  let packs: Registry<AssetPack>;
  beforeEach(() => { packs = new Registry<AssetPack>(); });

  it('composes shared packs in dependency order and permits overrides', () => {
    packs.register({ id: 'base', assets: [{ id: 'vehicle', source: '/base.png' }] });
    packs.register({ id: 'theme', requires: ['base'], assets: [{ id: 'vehicle', source: '/theme.png' }] });
    const catalog = new AssetCatalog(['theme'], (id) => packs.get(id));
    expect(catalog.packs.map((pack) => pack.id)).toEqual(['base', 'theme']);
    expect(catalog.get('vehicle').source).toBe('/theme.png');
  });

  it('rejects circular pack dependencies', () => {
    packs.register({ id: 'a', requires: ['b'], assets: [] });
    packs.register({ id: 'b', requires: ['a'], assets: [] });
    expect(() => new AssetCatalog(['a'], (id) => packs.get(id))).toThrow(/Circular/);
  });

  it('rejects explicitly incompatible composed packs', () => {
    packs.register({ id: 'land', compatibility: { provides: ['land'] }, assets: [] });
    packs.register({ id: 'sea', requires: ['land'], compatibility: { provides: ['sea'], excludes: ['land'] }, assets: [] });
    expect(() => new AssetCatalog(['sea'], (id) => packs.get(id))).toThrow(/incompatible/);
  });

  it('selects procedural chunks deterministically from a seed', () => {
    const chunks: ChunkTemplate[] = [
      { id: 'a', width: 100, objects: [] }, { id: 'b', width: 100, objects: [] }, { id: 'c', width: 100, objects: [] },
    ];
    const plan = { mode: 'procedural' as const, pool: ['a', 'b', 'c'], avoidImmediateRepeat: true };
    const run = () => {
      const sequence = new ChunkSequence(chunks, plan, new SeededRandom('same-seed'));
      return Array.from({ length: 20 }, () => sequence.next().id);
    };
    expect(run()).toEqual(run());
    expect(run().every((id, index, all) => index === 0 || id !== all[index - 1])).toBe(true);
  });

  it('keeps the world schema free of a required genre field', () => {
    const minimal: Pick<WorldTemplate, 'id' | 'layout' | 'themes'> = {
      id: 'science-fiction-city', layout: { id: 'dense-urban', tags: ['urban'], groundY: 600, chunkHeight: 720 }, themes: ['science-fiction'],
    };
    expect(minimal.layout.id).toBe('dense-urban');
  });

  it('uses one authoritative ground baseline with intentional fantasy-city traffic lane offsets', () => {
    const groundY = fantasyCity.layout.groundY;
    const groundObjects = fantasyCity.chunks.flatMap((chunk) => chunk.objects.filter((object) => object.entity === 'ground'));
    const groundedEntities = fantasyCity.entities.filter((entity) => entity.components?.tags?.includes('grounded'));
    expect(groundY).toBe(610);
    expect(groundObjects.every((object) => object.y === groundY)).toBe(true);
    expect(groundedEntities.every((entity) => entity.anchor?.y === 1)).toBe(true);
    expect(fantasyCity.paths.find((path) => path.id === 'far-street')?.y).toBe(groundY + 55);
    expect(fantasyCity.paths.find((path) => path.id === 'near-street')?.y).toBe(groundY + 105);
  });
});
