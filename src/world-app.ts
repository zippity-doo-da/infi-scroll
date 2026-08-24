import Phaser from 'phaser';
import './style.css';
import { registerContent } from './content/registerContent';
import { loadWorld } from './engine/core/WorldLoader';
import { WorldScene } from './engine/runtime/WorldScene';
import type { RuntimeTelemetrySnapshot } from './engine/runtime/RuntimeTelemetry';

registerContent();
const loaded = loadWorld();
const params = new URLSearchParams(window.location.search);
const builderPreview = params.get('builder') === '1';
const telemetryEnabled = params.get('telemetry') === '1';
let telemetryOutput: HTMLOutputElement | undefined;
const publishTelemetry = telemetryEnabled ? (snapshot: RuntimeTelemetrySnapshot) => {
  telemetryOutput ??= Object.assign(document.createElement('output'), {
    id: 'runtime-telemetry', ariaLabel: 'Runtime telemetry',
  });
  telemetryOutput.style.cssText = 'position:fixed;left:-10000px;top:0;width:1px;height:1px;overflow:hidden';
  if (!telemetryOutput.isConnected) document.body.append(telemetryOutput);
  telemetryOutput.value = JSON.stringify(snapshot);
} : undefined;

new Phaser.Game({
  type: builderPreview ? Phaser.CANVAS : Phaser.AUTO,
  parent: 'world',
  width: builderPreview ? 1920 : window.innerWidth,
  height: builderPreview ? 1080 : window.innerHeight,
  backgroundColor: loaded.template.palette.sky,
  scene: [new WorldScene(loaded, publishTelemetry)],
  render: loaded.designProfile.render,
  scale: { mode: builderPreview ? Phaser.Scale.FIT : Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
});
