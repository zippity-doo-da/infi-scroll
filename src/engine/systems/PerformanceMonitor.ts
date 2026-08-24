import type { PerformanceBudgetDefinition, PerformanceSnapshot } from '../contracts/capabilities';

export type PerformanceCounts = Omit<PerformanceSnapshot, 'fps'>;

export class PerformanceMonitor {
  private elapsedMs = 0;
  private frames = 0;
  private measuredFps = 0;

  frame(deltaMs: number): void {
    this.elapsedMs += deltaMs;
    this.frames += 1;
    if (this.elapsedMs >= 500) {
      this.measuredFps = this.frames * 1000 / this.elapsedMs;
      this.elapsedMs = 0;
      this.frames = 0;
    }
  }

  snapshot(counts: PerformanceCounts): PerformanceSnapshot { return { fps: this.measuredFps, ...counts }; }

  violations(snapshot: PerformanceSnapshot, budget: PerformanceBudgetDefinition): string[] {
    const violations: string[] = [];
    if (snapshot.fps > 0 && snapshot.fps < budget.targetFps * 0.9) violations.push('fps');
    if (budget.maxDrawCalls !== undefined && snapshot.drawCalls > budget.maxDrawCalls) violations.push('drawCalls');
    if (budget.maxTriangles !== undefined && snapshot.triangles > budget.maxTriangles) violations.push('triangles');
    if (budget.maxTextureMemoryMb !== undefined && (snapshot.textureMemoryMb ?? 0) > budget.maxTextureMemoryMb) violations.push('textureMemory');
    if (budget.maxActiveEntities !== undefined && snapshot.activeEntities > budget.maxActiveEntities) violations.push('entities');
    return violations;
  }
}
