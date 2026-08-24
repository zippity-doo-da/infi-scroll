import { PerspectiveCamera, Vector3 } from 'three';
import type { WorldPoint3 } from '../contracts/capabilities';

export interface ProjectedPoint {
  x: number;
  y: number;
  scale: number;
  depth: number;
  visible: boolean;
}

export class PerspectiveProjector {
  readonly camera = new PerspectiveCamera();
  private width = 1;
  private height = 1;
  private cameraX = 0;

  constructor(width: number, height: number, readonly fov = 45) { this.resize(width, height); }

  resize(width: number, height: number): void {
    if (width === this.width && height === this.height) return;
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.camera.fov = this.fov;
    this.camera.aspect = this.width / this.height;
    this.camera.near = 1;
    this.camera.far = 10000;
    this.camera.updateProjectionMatrix();
    this.setCameraX(this.cameraX);
  }

  setCameraX(x: number): void {
    this.cameraX = x;
    const distance = (this.height / 2) / Math.tan(this.fov * Math.PI / 360);
    const centerX = x + this.width / 2;
    const centerY = -this.height / 2;
    this.camera.position.set(centerX, centerY, distance);
    this.camera.lookAt(centerX, centerY, 0);
    this.camera.updateMatrixWorld();
  }

  project(world: WorldPoint3): ProjectedPoint {
    const source = new Vector3(world.x, -world.y, world.z);
    const unit = new Vector3(world.x + 1, -world.y, world.z);
    source.project(this.camera);
    unit.project(this.camera);
    return {
      x: (source.x + 1) * this.width / 2,
      y: (1 - source.y) * this.height / 2,
      scale: Math.abs(unit.x - source.x) * this.width / 2,
      depth: source.z,
      visible: source.z >= -1 && source.z <= 1 && Math.abs(source.x) <= 1.2 && Math.abs(source.y) <= 1.2,
    };
  }
}
