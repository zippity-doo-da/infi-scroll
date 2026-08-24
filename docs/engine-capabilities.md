# Scrolling-world capability architecture

The capability layer is additive and renderer-independent. The existing Phaser scene remains the active renderer. Three.js currently supplies reusable curve evaluation and perspective-camera projection for true X/Y/Z motion; it does not replace the working scene.

## Ownership boundaries

Simulation owns motion progress, sequence timing, state machines, particle state, pooling policy, logical offscreen time, and deterministic randomness. Renderer adapters own sprites/planes, materials, camera binding, batching, visibility, and disposal.

Templates define paths, sequences, state machines, emitters, effects, pools, offscreen policy, and performance budgets. Engine modules contain no fantasy entities or behaviors.

## Generic systems

- `MotionPath` supports linear, waypoint, Catmull-Rom, cubic Bezier, ballistic, orbit, and stationary paths in X/Y/Z world space.
- `PerspectiveProjector` uses a Three.js `PerspectiveCamera`; apparent position and size come from camera projection rather than authored scale tricks.
- `SequenceRunner` executes small data-authored timelines from reusable actions.
- `StateMachine` and `PropertyState` support cheap visual state changes.
- `ParticleBatch`, `InstanceBatch`, and `ObjectPool` provide bounded reusable storage for repeated effects and objects.
- `OffscreenController` and runtime chunk sleeping suspend visual work while preserving logical time.
- `PerformanceMonitor` reports FPS, estimated draw calls/triangles, textures/memory, active entities/animations/particles, and chunks in `?debug=1`.

## Rendering migration boundary

World-space simulation never stores Phaser or Three.js scene objects. A future full Three.js renderer can consume the same templates, path samples, sequence actions, instance batches, and performance policies without changing content definitions or simulation systems.
