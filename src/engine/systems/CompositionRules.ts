import type { CompositionRulesDefinition } from '../contracts/world';

export interface CompositionCandidate {
  tags: readonly string[];
  x: number;
}

export class CompositionRules {
  constructor(private readonly definition?: CompositionRulesDefinition) {}

  canPlace(candidate: CompositionCandidate, visible: readonly CompositionCandidate[]): boolean {
    const rules = this.definition?.entities;
    if (!rules) return true;
    for (const limit of rules.maxVisible ?? []) {
      if (!candidate.tags.includes(limit.tag)) continue;
      if (visible.filter((item) => item.tags.includes(limit.tag)).length >= limit.count) return false;
    }
    for (const spacing of rules.minimumSpacing ?? []) {
      if (!candidate.tags.includes(spacing.tag)) continue;
      if (visible.some((item) => item.tags.includes(spacing.tag) && Math.abs(item.x - candidate.x) < spacing.distance)) return false;
    }
    for (const exclusion of rules.exclusions ?? []) {
      const candidateHasFirst = candidate.tags.includes(exclusion.tag);
      const candidateHasSecond = candidate.tags.includes(exclusion.withTag);
      if (candidateHasFirst && visible.some((item) => item.tags.includes(exclusion.withTag))) return false;
      if (candidateHasSecond && visible.some((item) => item.tags.includes(exclusion.tag))) return false;
    }
    return true;
  }
}
