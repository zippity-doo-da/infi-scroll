import type { ChunkPlan, ChunkTemplate, CompositionRulesDefinition } from '../contracts/world';
import { SeededRandom } from '../core/SeededRandom';

export class ChunkSequence {
  private index = 0;
  private previous?: string;
  private readonly history: string[] = [];
  private readonly byId: Map<string, ChunkTemplate>;
  constructor(chunks: ChunkTemplate[], private readonly plan: ChunkPlan, private readonly random: SeededRandom, private readonly rules?: CompositionRulesDefinition['chunks']) {
    this.byId = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  }
  next(): ChunkTemplate {
    let id: string;
    if (this.plan.mode === 'authored') {
      const max = this.plan.sequence.length;
      id = this.plan.sequence[this.plan.repeat === false ? Math.min(this.index, max - 1) : this.index % max]!;
    } else if (this.plan.mode === 'hybrid' && this.index < this.plan.sequence.length) {
      id = this.plan.sequence[this.index]!;
    } else {
      const pool = this.plan.mode === 'procedural' ? this.plan.pool : this.plan.pool;
      const eligible = pool.filter((candidate) => this.isEligible(candidate));
      const choices = eligible.length ? eligible : pool;
      const weighted = choices.flatMap((candidate) => Array(Math.max(1, Math.round(this.byId.get(candidate)?.weight ?? 1))).fill(candidate));
      id = this.random.pick(weighted);
      if (this.plan.mode === 'procedural' && this.plan.avoidImmediateRepeat && pool.length > 1 && id === this.previous) {
        id = pool[(pool.indexOf(id) + 1 + this.random.int(0, pool.length - 2)) % pool.length]!;
      }
    }
    this.index += 1; this.previous = id; this.history.push(id);
    const historyLimit = Math.max(1, (this.rules?.minimumRepeatGap ?? 0) + 1);
    if (this.history.length > historyLimit) this.history.splice(0, this.history.length - historyLimit);
    const chunk = this.byId.get(id);
    if (!chunk) throw new Error(`Unknown chunk '${id}'`);
    return chunk;
  }

  private isEligible(id: string): boolean {
    const gap = this.rules?.minimumRepeatGap ?? 0;
    if (gap > 0 && this.history.slice(-gap).includes(id)) return false;
    const previous = this.previous ? this.byId.get(this.previous) : undefined;
    const candidate = this.byId.get(id);
    if (!previous || !candidate) return true;
    return !(this.rules?.excludedAdjacency ?? []).some((rule) => previous.tags?.includes(rule.beforeTag) && candidate.tags?.includes(rule.afterTag));
  }
}
