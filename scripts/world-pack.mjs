#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repository = path.resolve(import.meta.dirname, '..');
const generatedDirectory = path.join(repository, 'src/content/generated');
const command = process.argv[2];
const suppliedDirectory = process.argv[3];

const fail = (message) => { console.error(`ERROR: ${message}`); process.exitCode = 1; };
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const identifier = (value) => value.replace(/[^a-zA-Z0-9]+(.)/g, (_, letter) => letter.toUpperCase()).replace(/^[^a-zA-Z_]/, '_$&');

function pngSize(file) {
  const header = fs.readFileSync(file).subarray(0, 24);
  if (header.toString('ascii', 1, 4) !== 'PNG') throw new Error(`${file} is not a PNG`);
  return [header.readUInt32BE(16), header.readUInt32BE(20)];
}

function load(directory) {
  const absolute = path.resolve(directory);
  return {
    directory: absolute,
    packFile: path.join(absolute, 'pack.json'),
    worldFile: path.join(absolute, 'world.json'),
    pack: readJson(path.join(absolute, 'pack.json')),
    world: readJson(path.join(absolute, 'world.json')),
  };
}

function validate(input, preparedRoot) {
  const { directory, pack, world } = input;
  const errors = [], warnings = [];
  const error = (message) => errors.push(message);
  const warn = (message) => warnings.push(message);
  if (pack.schemaVersion !== 1) error('pack.schemaVersion must be 1');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pack.id ?? '')) error('pack.id must be lowercase kebab-case');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(world.id ?? '')) error('world.id must be lowercase kebab-case');
  if (!pack.style?.guide) error('pack.style.guide is required');
  else if (!fs.existsSync(path.resolve(directory, pack.style.guide))) error(`missing style guide: ${pack.style.guide}`);
  if ((Object.keys(pack.style?.palette ?? {}).length) > 8) error('style palette exceeds 8 colors');
  const outline = pack.style?.outline?.relativeWeight;
  if (outline == null || outline < 0.004 || outline > 0.018) error('outline.relativeWeight must be between 0.004 and 0.018');

  const assetIds = new Set();
  for (const asset of pack.assets ?? []) {
    if (assetIds.has(asset.id)) error(`duplicate asset id: ${asset.id}`);
    assetIds.add(asset.id);
    const source = path.resolve(directory, pack.sourceRoot ?? 'assets', asset.file);
    if (!fs.existsSync(source)) error(`missing source asset '${asset.id}': ${source}`);
    if (asset.role?.includes('background') && !asset.prepare?.seamWidth && !asset.opaque) error(`background '${asset.id}' must be opaque or declare prepare.seamWidth`);
    if (asset.prepare?.frames > 1 && (!asset.prepare.cellWidth || !asset.prepare.cellHeight)) error(`strip '${asset.id}' needs cellWidth and cellHeight`);
    if (preparedRoot) {
      const output = path.join(preparedRoot, asset.output ?? asset.file);
      if (!fs.existsSync(output)) error(`prepared asset missing: ${output}`);
      else {
        const [width, height] = pngSize(output);
        if (width > 4096 || height > 4096) warn(`asset '${asset.id}' is ${width}x${height}; consider a smaller runtime texture`);
      }
    }
  }

  const recipes = pack.recipes ?? [];
  const architectureAssets = new Set(recipes.filter((recipe) => recipe.tags?.includes('architecture')).map((recipe) => recipe.asset));
  if (architectureAssets.size < 8) error(`only ${architectureAssets.size} architecture variants; minimum is 8`);
  for (const recipe of recipes) {
    if (!assetIds.has(recipe.asset)) error(`recipe '${recipe.id}' references unknown asset '${recipe.asset}'`);
    if (recipe.tags?.includes('grounded') && (recipe.anchor?.x !== 0.5 || recipe.anchor?.y !== 1)) error(`grounded recipe '${recipe.id}' must use bottom-center anchor`);
    if (recipe.role === 'inhabitant' && recipe.worldHeight && Math.abs(recipe.worldHeight - 100) > 15) error(`inhabitant '${recipe.id}' worldHeight must be 85–115`);
  }

  if (world.designProfile === 'silhouette-screensaver') {
    if ((world.backgrounds?.length ?? 0) < 3 || world.backgrounds.length > 4) error('silhouette-screensaver requires 3–4 background bands');
    const paths = new Map((world.paths ?? []).map((route) => [route.id, route]));
    const traffic = (world.traffic ?? []).reduce((total, rule) => total + rule.maxActive, 0);
    const roadTraffic = (world.traffic ?? []).reduce((total, rule) => total + (paths.get(rule.path)?.zone === 'ground' ? rule.maxActive : 0), 0);
    const skyTraffic = (world.traffic ?? []).reduce((total, rule) => total + (paths.get(rule.path)?.zone === 'sky' ? rule.maxActive : 0), 0);
    if (traffic > 5) error(`traffic allows ${traffic} simultaneous movers; maximum is 5`);
    if (roadTraffic > 2) error(`road traffic allows ${roadTraffic} simultaneous movers; maximum is 2`);
    if (skyTraffic > 3) error(`sky traffic allows ${skyTraffic} simultaneous movers; maximum is 3`);
    for (const route of world.paths ?? []) {
      if (!['ground', 'sky'].includes(route.zone)) error(`path '${route.id}' must define zone as ground or sky`);
      if (!['near', 'mid', 'far'].includes(route.distance)) error(`path '${route.id}' must define distance as near, mid, or far`);
    }
    for (const rule of world.traffic ?? []) if (rule.intervalMs.min < 7000) error(`traffic '${rule.id}' interval must be at least 7000ms`);
  }

  const entities = new Map((world.entities ?? []).map((entity) => [entity.id, entity]));
  const chunks = new Map((world.chunks ?? []).map((chunk) => [chunk.id, chunk]));
  for (const entity of entities.values()) {
    if (!assetIds.has(entity.asset)) error(`entity '${entity.id}' references unknown asset '${entity.asset}'`);
    if (entity.components?.tags?.includes('grounded') && (entity.anchor?.x !== 0.5 || entity.anchor?.y !== 1)) error(`grounded entity '${entity.id}' must use bottom-center anchor`);
  }
  for (const chunk of chunks.values()) for (const object of [...(chunk.background ?? []), ...(chunk.objects ?? [])]) if (!entities.has(object.entity)) error(`chunk '${chunk.id}' references unknown entity '${object.entity}'`);
  const sequence = world.chunkPlan?.sequence ?? [];
  for (const id of sequence) if (!chunks.has(id)) error(`chunk plan references unknown chunk '${id}'`);

  if (world.chunkPlan?.mode === 'authored' && world.chunkPlan.repeat && sequence.length) {
    const cycleWidth = sequence.reduce((sum, id) => sum + (chunks.get(id)?.width ?? 0), 0);
    if (cycleWidth < 1920) warn(`authored cycle is only ${cycleWidth}px; architecture may repeat within one 1920px screen`);
    const positions = [];
    let cursor = 0;
    for (const id of [...sequence, ...sequence]) {
      const chunk = chunks.get(id);
      for (const object of chunk?.objects ?? []) {
        const entity = entities.get(object.entity);
        if (entity && architectureAssets.has(entity.asset)) positions.push({ asset: entity.asset, x: cursor + object.x });
      }
      cursor += chunk?.width ?? 0;
    }
    for (let left = 0; left < positions.length; left += 1) for (let right = left + 1; right < positions.length; right += 1) {
      if (positions[left].asset === positions[right].asset && positions[right].x - positions[left].x < 1920) error(`architecture '${positions[left].asset}' can repeat within one 1920px screen`);
    }
  }

  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

function printReport(report) {
  report.warnings.forEach((message) => console.warn(`WARN: ${message}`));
  report.errors.forEach((message) => console.error(`ERROR: ${message}`));
  if (!report.errors.length) console.log(`VALID: ${report.warnings.length} warning(s)`);
  return !report.errors.length;
}

function prepareAsset(input, asset, output) {
  const source = path.resolve(input.directory, input.pack.sourceRoot ?? 'assets', asset.file);
  const options = asset.prepare ?? {};
  const args = [path.join(repository, 'scripts/prepare-pack-asset.py'), source, output];
  if (options.trim) args.push('--trim');
  if (options.width) args.push('--width', String(options.width));
  if (options.height) args.push('--height', String(options.height));
  if (options.maxSize) args.push('--max-size', String(options.maxSize));
  if (options.crop) args.push('--crop', options.crop.join(','));
  if (options.cleanEdge) args.push('--clean-edge', String(options.cleanEdge));
  if (options.seamWidth) args.push('--seam-width', String(options.seamWidth));
  if (options.frames) args.push('--frames', String(options.frames));
  if (options.cellWidth) args.push('--cell-width', String(options.cellWidth));
  if (options.cellHeight) args.push('--cell-height', String(options.cellHeight));
  execFileSync('python3', args, { stdio: 'inherit' });
}

function generateIndex() {
  fs.mkdirSync(generatedDirectory, { recursive: true });
  const modules = fs.readdirSync(generatedDirectory).filter((file) => file.endsWith('.ts') && file !== 'index.ts').sort();
  const imports = modules.map((file, index) => `import { generatedPack as pack${index}, generatedWorld as world${index} } from './${file.slice(0, -3)}';`).join('\n');
  const indexes = modules.map((_, index) => index);
  fs.writeFileSync(path.join(generatedDirectory, 'index.ts'), `${imports}\nimport type { AssetPack, WorldTemplate } from '../../engine/contracts/world';\n\nexport const generatedPacks: AssetPack[] = [${indexes.map((index) => `pack${index}`).join(', ')}];\nexport const generatedWorlds: WorldTemplate[] = [${indexes.map((index) => `world${index}`).join(', ')}];\n`);
}

function install(input) {
  const initial = validate(input);
  if (!printReport(initial)) return false;
  const publicRelative = `assets/${input.pack.id}/v${input.pack.version}`;
  const publicRoot = path.join(repository, 'public', publicRelative);
  const runtimeRoot = path.join(publicRoot, 'runtime');
  fs.mkdirSync(runtimeRoot, { recursive: true });
  const guideSource = path.resolve(input.directory, input.pack.style.guide);
  fs.copyFileSync(guideSource, path.join(publicRoot, 'style-guide.png'));
  for (const asset of input.pack.assets) prepareAsset(input, asset, path.join(runtimeRoot, asset.output ?? asset.file));
  const post = validate(input, runtimeRoot);
  if (!printReport(post)) return false;

  const pack = {
    id: input.pack.id, version: input.pack.version, requires: input.pack.requires,
    compatibility: input.pack.compatibility,
    style: { ...input.pack.style, guide: `/${publicRelative}/style-guide.png` },
    assets: input.pack.assets.map((asset) => {
      const output = asset.output ?? asset.file;
      const prepared = path.join(runtimeRoot, output);
      const [width, height] = pngSize(prepared);
      return {
        id: asset.id, source: `/${publicRelative}/runtime/${output}`,
        ...(asset.prepare?.frames > 1 ? { frameWidth: asset.prepare.cellWidth, frameHeight: asset.prepare.cellHeight } : {}),
        metadata: { role: asset.role, bakedMovingObjects: false, ...(asset.opaque ? { opaque: true } : {}), ...(asset.prepare?.seamWidth ? { seamlessWidth: width, overlapPx: 2 } : {}), ...(asset.metadata ?? {}) },
      };
    }),
    recipes: input.pack.recipes,
  };
  const world = structuredClone(input.world);
  world.assetPacks = (world.assetPacks ?? ['$PACK']).map((id) => id === '$PACK' ? input.pack.id : id);
  const moduleName = identifier(world.id);
  fs.mkdirSync(generatedDirectory, { recursive: true });
  fs.writeFileSync(path.join(generatedDirectory, `${world.id}.ts`), `import type { AssetPack, WorldTemplate } from '../../engine/contracts/world';\n\nexport const generatedPack: AssetPack = ${JSON.stringify(pack, null, 2)};\n\nexport const generatedWorld: WorldTemplate = ${JSON.stringify(world, null, 2)};\n\nexport const generatedId = '${moduleName}';\n`);
  generateIndex();
  console.log(`INSTALLED: ${world.id}`);
  console.log(`PREVIEW: http://127.0.0.1:5173/?world=${world.id}&seed=12345&calibrate=1`);
  return true;
}

function create(id) {
  if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) return fail('new requires a lowercase kebab-case id');
  const destination = path.resolve(process.cwd(), id);
  if (fs.existsSync(destination)) return fail(`destination already exists: ${destination}`);
  fs.cpSync(path.join(repository, 'authoring/starter-pack'), destination, { recursive: true });
  for (const file of ['pack.json', 'world.json', 'README.md']) {
    const target = path.join(destination, file);
    fs.writeFileSync(target, fs.readFileSync(target, 'utf8').replaceAll('__WORLD_ID__', id).replaceAll('__WORLD_NAME__', id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')));
  }
  console.log(`CREATED: ${destination}`);
}

if (command === 'new') create(suppliedDirectory);
else if (command === 'validate' && suppliedDirectory) process.exitCode = printReport(validate(load(suppliedDirectory))) ? 0 : 1;
else if (command === 'install' && suppliedDirectory) process.exitCode = install(load(suppliedDirectory)) ? 0 : 1;
else {
  console.log('Usage:');
  console.log('  npm run pack:new -- my-world');
  console.log('  npm run pack:validate -- authoring/packs/my-world');
  console.log('  npm run pack:install -- authoring/packs/my-world');
}
