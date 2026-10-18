// Local preview server: serves the site, rebuilds when content/, tools/ or
// assets/ change, and reloads open browser tabs.
//
// Each rebuild runs `site.mjs build` in a fresh child process, so edits to the
// templates in tools/ take effect without restarting the server.
import http from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync, statSync, createReadStream, readFileSync, watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site.mjs');
const RELOAD = `<script>new EventSource('/__reload').onmessage = function () { location.reload(); };</script>`;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf', '.woff2': 'font/woff2',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function errorPage(message) {
  return `<!doctype html><meta charset="utf-8"><title>Build error</title>
<body style="background:#141413;color:#faf9f5;font:16px/1.6 system-ui,sans-serif;padding:48px 24px;max-width:760px;margin:auto">
<h1 style="color:#d97757;font-size:22px">The site couldn't be rebuilt</h1>
<pre style="white-space:pre-wrap;background:#1c1c1a;border:1px solid #2a2a28;border-radius:8px;padding:16px">${esc(message)}</pre>
<p style="color:#b0aea5">Fix the file and save — this page reloads by itself.</p>${RELOAD}</body>`;
}

function runBuild(root, assetRoot) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [CLI, 'build', '--root', root, '--assets', assetRoot]);
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('close', (code) => resolve({ ok: code === 0, out: out.trim() }));
  });
}

// URL path → file under root, falling back to assetRoot (for test sites without assets/).
function resolveFile(roots, urlPath) {
  const rel = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  for (const base of roots) {
    let file = path.join(base, rel);
    if (!file.startsWith(base)) return null; // no ../ escapes
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (existsSync(file) && statSync(file).isFile()) return file;
  }
  return null;
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    const tryPort = (p) => {
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE' && p !== 0 && p < port + 20) tryPort(p + 1);
        else reject(err);
      });
      server.listen(p, '127.0.0.1', () => resolve(server.address().port));
    };
    tryPort(port);
  });
}

export async function createDevServer({ root, assetRoot = root, port = 8000, quiet = false }) {
  const log = quiet ? () => {} : (...a) => console.log(...a);
  const clients = new Set();
  let lastError = null;

  async function rebuild() {
    const r = await runBuild(root, assetRoot);
    lastError = r.ok ? null : r.out;
    log(r.ok ? `✓ ${r.out.split('\n')[0]}` : `✗ ${r.out}`);
    for (const res of clients) res.write('data: reload\n\n');
  }

  await rebuild();

  const roots = [...new Set([path.resolve(root), path.resolve(assetRoot)])];
  const server = http.createServer((req, res) => {
    if (req.url === '/__reload') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.write(': connected\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    let file;
    try {
      file = resolveFile(roots, req.url);
    } catch {
      // A malformed %-escape must not take the whole preview down.
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Bad address');
    }
    const isHtml = !file || file.endsWith('.html');
    if (lastError && isHtml) {
      res.writeHead(200, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-store' });
      return res.end(errorPage(lastError));
    }
    if (!file) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    if (file.endsWith('.html')) {
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      return res.end(readFileSync(file, 'utf8').replace('</body>', `${RELOAD}\n</body>`));
    }
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    createReadStream(file).pipe(res);
  });

  const actualPort = await listen(server, port);

  // Debounced: editors often write a file more than once per save.
  let timer = null;
  let running = Promise.resolve();
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      running = running.then(rebuild);
    }, 150);
  };
  const watchers = ['content', 'tools', 'assets']
    .map((d) => path.join(root, d))
    .filter((d) => existsSync(d))
    .map((d) => watch(d, { recursive: true }, schedule));

  return {
    url: `http://localhost:${actualPort}`,
    async close() {
      clearTimeout(timer);
      watchers.forEach((w) => w.close());
      for (const res of clients) res.end();
      await running;
      await new Promise((r) => server.close(r));
    },
  };
}
