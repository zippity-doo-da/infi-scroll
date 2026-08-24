import type { AssetPack, WorldTemplate } from '../contracts/world';

export const BUILDER_PREVIEW_WORLD_ID = '__builder-preview';
export const BUILDER_PREVIEW_STORAGE_KEY = 'infi-scroll:builder-preview';

export interface BuilderPreviewPayload {
  pack: AssetPack;
  world: WorldTemplate;
}

export function readBuilderPreview(): BuilderPreviewPayload {
  const source = localStorage.getItem(BUILDER_PREVIEW_STORAGE_KEY);
  if (!source) throw new Error('The builder preview has not published a world yet.');
  const payload = JSON.parse(source) as BuilderPreviewPayload;
  if (payload.world.id !== BUILDER_PREVIEW_WORLD_ID) throw new Error('Invalid builder preview world.');
  if (!payload.world.assetPacks.includes(payload.pack.id)) throw new Error('Builder preview pack does not match its world.');
  return payload;
}
