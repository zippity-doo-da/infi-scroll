import type { DesignProfile, DesignProfileFinding } from '../contracts/design';
import type { WorldTemplate } from '../contracts/world';
import type { AssetCatalog } from './AssetCatalog';

const closeTo = (actual: number, expected: number, tolerance = 0.001) => Math.abs(actual - expected) <= tolerance;

export function validateDesignProfile(
  template: WorldTemplate,
  assets: AssetCatalog,
  profile: DesignProfile,
): DesignProfileFinding[] {
  const findings: DesignProfileFinding[] = [];
  const report = (rule: string, message: string) => findings.push({ rule, message });
  const bands = new Set(template.backgrounds.map((layer) => layer.depth)).size;

  if (bands < profile.composition.minDepthBands || bands > profile.composition.maxDepthBands) {
    report('composition.depth-bands', `${bands} background depth bands; profile permits ${profile.composition.minDepthBands}–${profile.composition.maxDepthBands}`);
  }
  if (Object.keys(template.palette).length > profile.visual.maxPaletteColors) {
    report('visual.palette', `${Object.keys(template.palette).length} world colors exceed the ${profile.visual.maxPaletteColors}-color limit`);
  }
  if (profile.composition.requireAuthoredChunks && template.chunkPlan.mode === 'procedural') {
    report('composition.authored-chunks', 'A fully procedural chunk plan is not permitted');
  }

  for (const pack of assets.packs) {
    if (profile.visual.requireStyleGuide && !pack.style?.guide) report('visual.style-guide', `Asset pack '${pack.id}' has no style guide`);
    if (pack.style) {
      if (!profile.visual.allowedDetail.includes(pack.style.detail)) report('visual.detail', `Asset pack '${pack.id}' uses disallowed '${pack.style.detail}' detail`);
      const weight = pack.style.outline.relativeWeight;
      if (weight < profile.visual.outlineWeight.min || weight > profile.visual.outlineWeight.max) {
        report('visual.outline', `Asset pack '${pack.id}' outline weight ${weight} is outside the permitted range`);
      }
      if (Object.keys(pack.style.palette).length > profile.visual.maxPaletteColors) {
        report('visual.palette', `Asset pack '${pack.id}' palette exceeds ${profile.visual.maxPaletteColors} colors`);
      }
    }
    if (profile.assets.forbidBakedMovingObjects) {
      for (const asset of pack.assets) {
        if (asset.metadata?.bakedMovingObjects === true) report('assets.baked-motion', `Asset '${asset.id}' contains baked moving objects`);
      }
    }
  }

  const backgroundAssets = template.backgrounds.map((layer) => assets.get(layer.asset));
  if (profile.composition.requireSeamMetadata) {
    for (const asset of backgroundAssets) {
      const metadata = asset.metadata ?? {};
      if (!('seamlessWidth' in metadata) && !('overlapPx' in metadata) && !('tileSize' in metadata) && metadata.opaque !== true) {
        report('composition.seams', `Background asset '${asset.id}' has no seam or tiling metadata`);
      }
    }
  }

  for (const entity of template.entities) {
    if (!entity.components?.tags?.includes('grounded')) continue;
    const anchor = entity.anchor;
    if (!anchor || !closeTo(anchor.x, profile.scale.groundedAnchor.x) || !closeTo(anchor.y, profile.scale.groundedAnchor.y)) {
      report('scale.ground-anchor', `Grounded entity '${entity.id}' must use the profile ground anchor`);
    }
  }

  for (const animation of template.animations) {
    if (animation.frameRate === undefined) continue;
    if (animation.frameRate < profile.motion.animationFps.min || animation.frameRate > profile.motion.animationFps.max) {
      report('motion.animation-fps', `Animation '${animation.id}' runs at ${animation.frameRate} fps; profile permits ${profile.motion.animationFps.min}–${profile.motion.animationFps.max}`);
    }
  }
  const continuousAnimations = template.animations.filter((animation) => animation.repeat === -1 || animation.motion !== undefined);
  if (continuousAnimations.length > profile.composition.maxContinuousAnimations) {
    report('motion.animation-count', `${continuousAnimations.length} continuous animations exceed the profile limit of ${profile.composition.maxContinuousAnimations}`);
  }

  const simultaneousTraffic = template.traffic.reduce((sum, definition) => sum + definition.maxActive, 0);
  if (simultaneousTraffic > profile.motion.maxSimultaneousTraffic) {
    report('motion.traffic-density', `Traffic allows ${simultaneousTraffic} simultaneous movers; profile permits ${profile.motion.maxSimultaneousTraffic}`);
  }
  for (const [zone, limit] of Object.entries(profile.motion.maxSimultaneousTrafficByZone ?? {})) {
    if (limit === undefined) continue;
    const zonedTraffic = template.traffic.reduce((sum, definition) => {
      const path = template.paths.find((candidate) => candidate.id === definition.path);
      return sum + (path?.zone === zone ? definition.maxActive : 0);
    }, 0);
    if (zonedTraffic > limit) report('motion.traffic-density-by-zone', `${zone} traffic allows ${zonedTraffic} simultaneous movers; profile permits ${limit}`);
  }
  for (const traffic of template.traffic) {
    if (traffic.intervalMs.min < profile.motion.minTrafficIntervalMs) {
      report('motion.traffic-frequency', `Traffic '${traffic.id}' can spawn more frequently than every ${profile.motion.minTrafficIntervalMs} ms`);
    }
  }

  if (profile.assets.requireRecipes) {
    const recipes = assets.packs.flatMap((pack) => pack.recipes ?? []);
    const architectureVariants = new Set(recipes.filter((recipe) => recipe.tags?.includes('architecture')).map((recipe) => recipe.asset)).size;
    if (architectureVariants < profile.assets.minimumArchitectureVariants) {
      report('assets.architecture-variety', `${architectureVariants} architecture recipes; profile requires at least ${profile.assets.minimumArchitectureVariants}`);
    }
  }

  const target = template.performanceBudget?.targetResolutions ?? [];
  if (!target.some(([width, height]) => width === profile.referenceCanvas.width && height === profile.referenceCanvas.height)) {
    report('render.reference-canvas', `Performance budget does not include ${profile.referenceCanvas.width}×${profile.referenceCanvas.height}`);
  }

  return findings;
}
