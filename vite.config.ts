import { defineConfig } from 'vite';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const repository = __dirname;
const authoringRoot = resolve(repository, 'authoring/packs');
const reservedWorldIds = new Set(['silhouette-fantasy-city', 'fantasy-city', 'fifth-element-city', 'coruscant-city', 'evention-typographic', 'evention-typographic-color', 'evention-chicago', 'evention-wacker', 'runtime-verification']);

function localWorldInstaller() {
  return {
    name: 'infi-scroll-local-world-installer',
    configureServer(server: any) {
      server.middlewares.use('/__infi-scroll/install', (request: any, response: any) => {
        if (request.method !== 'POST') { response.statusCode = 405; response.end(JSON.stringify({ error: 'POST required.' })); return; }
        let body = '';
        request.on('data', (chunk: Buffer) => {
          body += chunk;
          if (body.length > 80 * 1024 * 1024) request.destroy(new Error('Installation payload is too large.'));
        });
        request.on('end', () => {
          response.setHeader('content-type', 'application/json');
          try {
            const payload = JSON.parse(body);
            const id = payload.world?.id;
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id ?? '')) throw new Error('World id must be lowercase kebab-case.');
            if (reservedWorldIds.has(id)) throw new Error('Choose a new world id; built-in worlds cannot be replaced by the builder.');
            const destination = join(authoringRoot, id);
            if (!destination.startsWith(`${authoringRoot}/`)) throw new Error('Invalid installation target.');
            const overwrite = new URL(request.url ?? '/', 'http://localhost').searchParams.get('overwrite') === '1';
            if (existsSync(destination) && !overwrite) { response.statusCode = 409; response.end(JSON.stringify({ error: 'This local pack already exists.' })); return; }
            if (existsSync(destination)) rmSync(destination, { recursive: true, force: true });
            mkdirSync(destination, { recursive: true });
            writeFileSync(join(destination, 'pack.json'), JSON.stringify(payload.pack, null, 2));
            writeFileSync(join(destination, 'world.json'), JSON.stringify(payload.world, null, 2));
            writeFileSync(join(destination, 'builder-project.json'), JSON.stringify(payload.project, null, 2));
            for (const file of payload.files ?? []) {
              if (typeof file.path !== 'string' || file.path.startsWith('/') || file.path.includes('..')) throw new Error('Invalid asset path.');
              const match = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/s.exec(file.dataUrl ?? '');
              if (!match) throw new Error(`Asset ${file.path} is not portable.`);
              const target = join(destination, file.path);
              mkdirSync(dirname(target), { recursive: true });
              writeFileSync(target, Buffer.from(match[2], 'base64'));
            }
            execFileSync(process.execPath, [resolve(repository, 'scripts/world-pack.mjs'), 'install', destination], { cwd: repository, stdio: 'pipe' });
            response.end(JSON.stringify({ ok: true, url: `/?world=${encodeURIComponent(id)}&seed=12345` }));
          } catch (error) {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Installation failed.' }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [localWorldInstaller()],
  server: { host: '127.0.0.1', port: 5173 },
  build: { target: 'es2022', rollupOptions: { input: { world: resolve(__dirname, 'index.html'), builder: resolve(__dirname, 'builder.html') } } },
});
