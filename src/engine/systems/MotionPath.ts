import { CatmullRomCurve3, CubicBezierCurve3, LineCurve3, Vector3 } from 'three';
import type { MotionPathDefinition, WorldPoint3 } from '../contracts/capabilities';

export interface PathSample {
  position: WorldPoint3;
  tangent: WorldPoint3;
}

const vector = (point: WorldPoint3) => new Vector3(point.x, point.y, point.z);
const point = (value: Vector3): WorldPoint3 => ({ x: value.x, y: value.y, z: value.z });
const normalizedProgress = (value: number) => Math.min(1, Math.max(0, value));

export class MotionPath {
  constructor(readonly definition: MotionPathDefinition) { this.validate(); }

  sample(progress: number): PathSample {
    const t = normalizedProgress(progress);
    const { definition } = this;
    if (definition.type === 'stationary') return { position: definition.point, tangent: { x: 0, y: 0, z: 0 } };
    if (definition.type === 'ballistic') {
      const seconds = t * (definition.durationMs ?? 1000) / 1000;
      const position = {
        x: definition.origin.x + definition.velocity.x * seconds + 0.5 * definition.gravity.x * seconds ** 2,
        y: definition.origin.y + definition.velocity.y * seconds + 0.5 * definition.gravity.y * seconds ** 2,
        z: definition.origin.z + definition.velocity.z * seconds + 0.5 * definition.gravity.z * seconds ** 2,
      };
      return { position, tangent: {
        x: definition.velocity.x + definition.gravity.x * seconds,
        y: definition.velocity.y + definition.gravity.y * seconds,
        z: definition.velocity.z + definition.gravity.z * seconds,
      } };
    }
    if (definition.type === 'orbit') {
      const angle = (definition.startAngle ?? 0) + t * (definition.revolutions ?? 1) * Math.PI * 2;
      const position = {
        x: definition.center.x + Math.cos(angle) * definition.radius.x,
        y: definition.center.y + Math.sin(angle) * definition.radius.y,
        z: definition.center.z + Math.sin(angle) * definition.radius.z,
      };
      return { position, tangent: {
        x: -Math.sin(angle) * definition.radius.x,
        y: Math.cos(angle) * definition.radius.y,
        z: Math.cos(angle) * definition.radius.z,
      } };
    }
    if (definition.type === 'waypoint') return this.sampleWaypoints(t);

    const points = definition.points.map(vector);
    const curve = definition.type === 'linear'
      ? new LineCurve3(points[0]!, points.at(-1)!)
      : definition.type === 'catmull-rom'
        ? new CatmullRomCurve3(points, definition.closed, 'catmullrom', definition.tension ?? 0.5)
        : new CubicBezierCurve3(points[0]!, points[1]!, points[2]!, points[3]!);
    return { position: point(curve.getPoint(t)), tangent: point(curve.getTangent(t).normalize()) };
  }

  private sampleWaypoints(t: number): PathSample {
    const points = this.definition.type === 'waypoint' ? this.definition.points : [];
    const segmentCount = points.length - 1;
    const scaled = t * segmentCount;
    const index = Math.min(segmentCount - 1, Math.floor(scaled));
    const local = t === 1 ? 1 : scaled - index;
    const curve = new LineCurve3(vector(points[index]!), vector(points[index + 1]!));
    return { position: point(curve.getPoint(local)), tangent: point(curve.getTangent(local).normalize()) };
  }

  private validate(): void {
    const { definition } = this;
    if ('points' in definition) {
      const minimum = definition.type === 'bezier' ? 4 : 2;
      if (definition.points.length < minimum) throw new Error(`Path '${definition.id}' requires at least ${minimum} points`);
    }
    if ((definition.durationMs ?? 1) <= 0) throw new Error(`Path '${definition.id}' duration must be positive`);
  }
}

export interface FollowerSample extends PathSample { progress: number; completed: boolean }

export class WorldPathFollower {
  private elapsedMs: number;
  private direction = 1;

  constructor(
    readonly path: MotionPath,
    private readonly options: { durationMs?: number; delayMs?: number; loop?: boolean; pingPong?: boolean; startProgress?: number } = {},
  ) {
    const duration = this.durationMs;
    this.elapsedMs = (options.startProgress ?? 0) * duration - (options.delayMs ?? 0);
  }

  update(deltaMs: number): FollowerSample {
    const duration = this.durationMs;
    this.elapsedMs += deltaMs * this.direction;
    let completed = false;
    if (this.elapsedMs >= duration) {
      completed = !this.options.loop;
      if (this.options.pingPong) { this.elapsedMs = duration; this.direction = -1; }
      else if (this.options.loop) this.elapsedMs %= duration;
      else this.elapsedMs = duration;
    } else if (this.elapsedMs < 0 && this.direction < 0) {
      if (this.options.pingPong) { this.elapsedMs = 0; this.direction = 1; }
      else this.elapsedMs = 0;
    }
    const progress = normalizedProgress(this.elapsedMs / duration);
    return { ...this.path.sample(progress), progress, completed };
  }

  get durationMs(): number { return this.options.durationMs ?? this.path.definition.durationMs ?? 1000; }
}
