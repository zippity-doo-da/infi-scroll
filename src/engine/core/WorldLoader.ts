import type { WorldTemplate } from '../contracts/world';
import type { DesignProfile } from '../contracts/design';
import { AssetCatalog } from './AssetCatalog';
import { validateDesignProfile } from './DesignProfileValidator';
import { assetPackRegistry, designProfileRegistry, worldRegistry } from './Registry';
import { BUILDER_PREVIEW_WORLD_ID, readBuilderPreview } from './BuilderPreview';

export interface LoadedWorld { template: WorldTemplate; designProfile: DesignProfile; assets: AssetCatalog; seed: string }

export function loadWorld(search = window.location.search): LoadedWorld {
  const params = new URLSearchParams(search);
  const requested = params.get('world') ?? 'fantasy-city';
  const seed = params.get('seed') ?? String(Date.now());
  if (requested === BUILDER_PREVIEW_WORLD_ID) {
    const preview = readBuilderPreview();
    const designProfile = designProfileRegistry.get(preview.world.designProfile);
    const assets = new AssetCatalog(preview.world.assetPacks, (id) => {
      if (id !== preview.pack.id) throw new Error(`Unknown builder preview pack '${id}'`);
      return preview.pack;
    });
    validateTemplate(preview.world, assets);
    const findings = validateDesignProfile(preview.world, assets, designProfile);
    if (findings.length) console.warn(`Builder preview findings:\n${findings.map((finding) => `[${finding.rule}] ${finding.message}`).join('\n')}`);
    return { template: preview.world, designProfile, assets, seed };
  }
  const template = worldRegistry.get(requested);
  const designProfile = designProfileRegistry.get(params.get('profile') ?? template.designProfile);
  const assets = new AssetCatalog(template.assetPacks, (id) => assetPackRegistry.get(id));
  validateTemplate(template, assets);
  const findings = validateDesignProfile(template, assets, designProfile);
  if (findings.length > 0) {
    const summary = findings.map((finding) => `[${finding.rule}] ${finding.message}`).join('\n');
    if (designProfile.enforcement === 'strict') throw new Error(`World '${template.id}' violates design profile '${designProfile.id}':\n${summary}`);
    console.warn(`World '${template.id}' design-profile findings:\n${summary}`);
  }
  return { template, designProfile, assets, seed };
}

function validateTemplate(template: WorldTemplate, assets: AssetCatalog): void {
  const ids = <T extends { id: string }>(items: T[]) => new Set(items.map((item) => item.id));
  const entityIds = ids(template.entities); const chunkIds = ids(template.chunks);
  const environmentIds = ids(template.environments); const pathIds = ids(template.paths);
  const motionPathIds = ids(template.motionPaths ?? []); const sequenceIds = ids(template.sequences ?? []);
  const emitterIds = ids(template.particleEmitters ?? []); const effectIds = ids(template.effects ?? []);
  template.entities.forEach((entity) => { assets.get(entity.asset); });
  template.entities.forEach((entity) => {
    const path = entity.components?.worldPathFollower?.path;
    if (path && !motionPathIds.has(path)) throw new Error(`Entity '${entity.id}' references unknown motion path '${path}'`);
  });
  template.chunks.forEach((chunk) => chunk.objects.forEach((object) => {
    if (!entityIds.has(object.entity)) throw new Error(`Chunk '${chunk.id}' references unknown entity '${object.entity}'`);
  }));
  const planned = template.chunkPlan.mode === 'procedural'
    ? template.chunkPlan.pool
    : template.chunkPlan.mode === 'authored' ? template.chunkPlan.sequence : [...template.chunkPlan.sequence, ...template.chunkPlan.pool];
  planned.forEach((id) => { if (!chunkIds.has(id)) throw new Error(`Unknown planned chunk '${id}'`); });
  template.traffic.forEach((traffic) => { if (!pathIds.has(traffic.path)) throw new Error(`Unknown path '${traffic.path}'`); });
  template.particleEmitters?.forEach((emitter) => { assets.get(emitter.asset); });
  template.environments.forEach((environment) => {
    Object.entries(environment.assetVariants ?? {}).forEach(([source, variant]) => {
      assets.get(source); assets.get(variant);
    });
  });
  template.pools?.forEach((pool) => {
    if (!entityIds.has(pool.entity)) throw new Error(`Pool '${pool.id}' references unknown entity '${pool.entity}'`);
    if (pool.initialSize < 0 || pool.maxSize < pool.initialSize) throw new Error(`Pool '${pool.id}' has invalid size limits`);
  });
  const composition = template.compositionRules;
  if ((composition?.chunks?.minimumRepeatGap ?? 0) < 0) throw new Error('Composition minimumRepeatGap cannot be negative');
  composition?.entities?.minimumSpacing?.forEach((rule) => {
    if (rule.distance < 0) throw new Error(`Composition spacing for '${rule.tag}' cannot be negative`);
  });
  composition?.entities?.maxVisible?.forEach((rule) => {
    if (rule.count < 0) throw new Error(`Composition visibility limit for '${rule.tag}' cannot be negative`);
  });
  if (template.director && template.director.maxActivity < 0) throw new Error('Director maxActivity cannot be negative');
  template.director?.quietPeriods?.forEach((period) => {
    if (period.maxActivity < 0) throw new Error('Director quiet-period activity cannot be negative');
  });
  template.effects?.forEach((effect) => {
    if (effect.emitter && !emitterIds.has(effect.emitter)) throw new Error(`Effect '${effect.id}' references unknown emitter '${effect.emitter}'`);
  });
  template.sequences?.forEach((sequence) => sequence.steps.flatMap((step) => step.actions).forEach((action) => {
    if (action.type === 'follow-path' && !motionPathIds.has(action.follower.path)) throw new Error(`Sequence '${sequence.id}' references unknown motion path '${action.follower.path}'`);
    if (action.type === 'start-sequence' && !sequenceIds.has(action.sequence)) throw new Error(`Sequence '${sequence.id}' references unknown sequence '${action.sequence}'`);
    if (action.type === 'emit-particles' && !effectIds.has(action.effect) && !emitterIds.has(action.effect)) throw new Error(`Sequence '${sequence.id}' references unknown effect '${action.effect}'`);
  }));
  template.events.flatMap((event) => event.actions).forEach((action) => {
    if (action.type === 'start-sequence' && !sequenceIds.has(action.sequence)) throw new Error(`Event references unknown sequence '${action.sequence}'`);
  });
  if (!environmentIds.has(template.initialEnvironment)) throw new Error(`Unknown environment '${template.initialEnvironment}'`);
}
