import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const options = Object.fromEntries(process.argv.slice(2).map((entry) => {
  const [key, ...value] = entry.replace(/^--/, '').split('=');
  return [key, value.join('=') || 'true'];
}));
const minutes = Number(options.minutes ?? 60);
const sampleSeconds = Number(options['sample-seconds'] ?? 10);
const worlds = String(options.worlds ?? 'fantasy-city,fifth-element-city,runtime-verification').split(',').filter(Boolean);
const baseUrl = String(options.url ?? 'http://127.0.0.1:5173/');
const output = String(options.output ?? join(tmpdir(), `infi-scroll-soak-${Date.now()}.json`));
const chrome = String(options.chrome ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const port = Number(options.port ?? 9333);
const profile = await mkdtemp(join(tmpdir(), 'infi-scroll-soak-'));

class CdpSession {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.socket.onmessage = ({ data }) => {
      const message = JSON.parse(String(data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message)); else pending.resolve(message.result);
    };
  }
  async ready() {
    if (this.socket.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => { this.socket.onopen = resolve; this.socket.onerror = reject; });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
  close() { this.socket.close(); }
}

const child = spawn(chrome, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
  '--enable-precise-memory-info', '--mute-audio', 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
let chromeErrors = '';
child.stderr.on('data', (chunk) => { chromeErrors += String(chunk); });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitForChrome() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) return; } catch { /* retry */ }
    await sleep(100);
  }
  throw new Error('Chrome DevTools endpoint did not start');
}

function summarize(samples) {
  const first = samples[0]; const last = samples.at(-1);
  const maximum = (read) => Math.max(...samples.map(read));
  return {
    samples: samples.length,
    elapsedMinutes: (last.elapsedMs - first.elapsedMs) / 60000,
    fps: { min: Math.min(...samples.map((sample) => sample.fps)), average: samples.reduce((sum, sample) => sum + sample.fps, 0) / samples.length },
    activeChunks: { min: Math.min(...samples.map((sample) => sample.activeChunks)), max: maximum((sample) => sample.activeChunks) },
    renderObjects: { first: first.renderObjects, last: last.renderObjects, max: maximum((sample) => sample.renderObjects) },
    activeParticles: { max: maximum((sample) => sample.activeParticles) },
    particleViews: { allocatedMax: maximum((sample) => sample.particleViews.allocated), reused: last.particleViews.reused },
    scheduler: { pendingMax: maximum((sample) => sample.scheduler.pending), accepted: last.scheduler.accepted, deferred: last.scheduler.deferred },
    director: { activeEventsMax: maximum((sample) => sample.director.activeEvents), intensityMax: maximum((sample) => sample.director.intensity) },
    textures: { first: first.textures, last: last.textures, max: maximum((sample) => sample.textures) },
    textureMemoryMb: { first: first.textureMemoryMb, last: last.textureMemoryMb, max: maximum((sample) => sample.textureMemoryMb) },
    heapUsedMb: first.heapUsedMb === undefined ? undefined : { first: first.heapUsedMb, last: last.heapUsedMb, max: maximum((sample) => sample.heapUsedMb ?? 0) },
    poolSizes: Object.fromEntries(Object.keys(last.pools).map((entity) => [entity, {
      first: first.pools[entity]?.size ?? 0, last: last.pools[entity]?.size ?? 0, max: maximum((sample) => sample.pools[entity]?.size ?? 0),
    }])),
  };
}

function canaryFailures(samples) {
  if (samples[0]?.worldId !== 'runtime-verification') return [];
  const last = samples.at(-1); const seen = (event) => samples.some((sample) => (sample.emittedEvents[event] ?? 0) > 0);
  return [
    [last.scheduler.deferred > 0 && last.scheduler.accepted > 1, 'event was deferred and later accepted'],
    [samples.some((sample) => sample.environmentVariantApplications > 0), 'environment changed a texture variant'],
    [samples.some((sample) => sample.propertyOverrideObserved), 'property override beat projected presentation'],
    [last.particleViews.reused > 0, 'particle view was reused'],
    [seen('verification-state-active') && seen('verification-observed'), 'state-machine and event triggers executed'],
  ].flatMap(([pass, label]) => pass ? [] : [label]);
}

const sessions = [];
const samples = Object.fromEntries(worlds.map((world) => [world, []]));
try {
  await waitForChrome();
  for (const world of worlds) {
    const url = new URL(baseUrl); url.searchParams.set('world', world); url.searchParams.set('seed', 'soak'); url.searchParams.set('telemetry', '1');
    const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url.toString())}`, { method: 'PUT' })).json();
    const session = new CdpSession(target.webSocketDebuggerUrl); await session.ready(); await session.send('Runtime.enable');
    sessions.push({ world, session });
  }
  const deadline = Date.now() + minutes * 60000;
  while (Date.now() < deadline) {
    for (const { world, session } of sessions) {
      const raw = await session.evaluate("document.querySelector('#runtime-telemetry')?.value ?? ''");
      if (raw) samples[world].push(JSON.parse(raw));
    }
    process.stdout.write(`\r${new Date().toISOString()}  ${Object.entries(samples).map(([world, values]) => `${world}:${values.length}`).join('  ')}`);
    await sleep(sampleSeconds * 1000);
  }
  const report = {
    startedAt: new Date(Date.now() - minutes * 60000).toISOString(), finishedAt: new Date().toISOString(), requestedMinutes: minutes, sampleSeconds,
    worlds: Object.fromEntries(worlds.map((world) => [world, { summary: summarize(samples[world]), canaryFailures: canaryFailures(samples[world]), samples: samples[world] }])),
  };
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`\nSoak report: ${output}\n`);
  if (Object.values(report.worlds).some((world) => world.canaryFailures.length)) process.exitCode = 1;
} finally {
  sessions.forEach(({ session }) => session.close());
  child.kill('SIGTERM');
  await rm(profile, { recursive: true, force: true });
  if (child.exitCode && child.exitCode !== 0) process.stderr.write(chromeErrors);
}
