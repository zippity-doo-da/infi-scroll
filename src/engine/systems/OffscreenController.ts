import type { OffscreenPolicyDefinition } from '../contracts/capabilities';

export interface Bounds2 { left: number; right: number; top: number; bottom: number }

export class OffscreenController {
  constructor(readonly policy: OffscreenPolicyDefinition) {}

  isSleeping(bounds: Bounds2, viewport: Bounds2): boolean {
    const margin = this.policy.sleepMargin;
    return bounds.right < viewport.left - margin
      || bounds.left > viewport.right + margin
      || bounds.bottom < viewport.top - margin
      || bounds.top > viewport.bottom + margin;
  }

  logicalDelta(deltaMs: number, sleeping: boolean): number {
    return sleeping && !this.policy.keepLogicalTime ? 0 : deltaMs;
  }
}
