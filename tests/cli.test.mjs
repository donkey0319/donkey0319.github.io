import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ROOT } from './helpers.mjs';
import { createDevServer } from '../tools/lib/dev.mjs';

const CLI = path.join(ROOT, 'tools/site.mjs');

// A throwaway site: fixture content, real repo assets.
function tempSite() {
  const dir = mkdtempSync(path.join(tmpdir(), 'site-'));
  cpSync(path.join(ROOT, 'tests/fixtures/content'), path.join(dir, 'content'), { recursive: true });
  return dir;
}

function run(dir, ...args) {
  const r = spawnSync(process.execPath, [CLI, ...args, '--root', dir, '--assets', ROOT], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout + r.stderr };
}

async function eventually(check, ms = 8000) {
  const end = Date.now() + ms;
  let last;
  while (Date.now() < end) {
    try {
      if (await check()) return;
    } catch (err) {
      last = err;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw last ?? new Error('condition never became true');
}

test('build then check passes', () => {
  const dir = tempSite();
  assert.equal(run(dir, 'build').code, 0);
  assert.ok(existsSync(path.join(dir, 'projects/alpha/index.html')));
  assert.equal(run(dir, 'check').code, 0);
});

test('check fails on a hand edit and names the file; build restores it', () => {
  const dir = tempSite();
  run(dir, 'build');
  const file = path.join(dir, 'work/index.html');
  writeFileSync(file, readFileSync(file, 'utf8').replace('<h1>Work</h1>', '<h1>Edited</h1>'));
  const r = run(dir, 'check');
  assert.equal(r.code, 1);
  assert.match(r.out, /work\/index\.html/);
  assert.equal(run(dir, 'build').code, 0);
  assert.equal(run(dir, 'check').code, 0);
});

test('check ignores Windows line endings', () => {
  const dir = tempSite();
  run(dir, 'build');
  const file = path.join(dir, 'index.html');
  writeFileSync(file, readFileSync(file, 'utf8').replace(/\n/g, '\r\n'));
  assert.equal(run(dir, 'check').code, 0);
});

test('check notices a page whose markdown was deleted', () => {
  const dir = tempSite();
  run(dir, 'build');
  rmSync(path.join(dir, 'content/projects/beta-game.md'));
  const r = run(dir, 'check');
  assert.equal(r.code, 1);
  assert.match(r.out, /projects\/beta-game\//);
});

test('new creates a project that builds right away', () => {
  const dir = tempSite();
  const r = run(dir, 'new', 'my-piece');
  assert.equal(r.code, 0, r.out);
  const md = readFileSync(path.join(dir, 'content/projects/my-piece.md'), 'utf8');
  assert.match(md, /^title: My Piece$/m);
  const b = run(dir, 'build');
  assert.equal(b.code, 0, b.out);
  assert.ok(existsSync(path.join(dir, 'projects/my-piece/index.html')));
  assert.equal(run(dir, 'new', 'my-piece').code, 1);
  assert.equal(run(dir, 'new', 'Bad Name').code, 1);
});

test('bad content exits 1 and names the file and field', () => {
  const dir = tempSite();
  const md = path.join(dir, 'content/projects/alpha.md');
  writeFileSync(md, readFileSync(md, 'utf8').replace('[shaders, environment]', '[vfx]'));
  const r = run(dir, 'build');
  assert.equal(r.code, 1);
  assert.match(r.out, /content\/projects\/alpha\.md: categories: unknown filter "vfx"/);
});

test('dev serves pages with live reload and survives a bad save', async () => {
  const dir = tempSite();
  const server = await createDevServer({ root: dir, assetRoot: ROOT, port: 0, quiet: true });
  try {
    const get = async (p) => (await fetch(server.url + p)).text();
    assert.match(await get('/'), /\/__reload/);
    assert.match(await get('/projects/alpha/'), /Alpha Piece/);
    assert.ok((await fetch(server.url + '/assets/css/style.css')).ok, 'serves repo assets');

    const md = path.join(dir, 'content/projects/alpha.md');
    const good = readFileSync(md, 'utf8');
    writeFileSync(md, good.replace('tags: [UE5, Shader]', 'tags: [UE5, Shader'));
    await eventually(async () => /invalid YAML/.test(await get('/')));

    writeFileSync(md, good.replace('Alpha Piece', 'Alpha Renamed'));
    await eventually(async () => /Alpha Renamed/.test(await get('/projects/alpha/')));
    assert.doesNotMatch(await get('/'), /invalid YAML/);

    assert.doesNotMatch(readFileSync(path.join(dir, 'index.html'), 'utf8'), /__reload/);
  } finally {
    await server.close();
  }
});

test('dev survives a malformed address', async () => {
  const dir = tempSite();
  const server = await createDevServer({ root: dir, assetRoot: ROOT, port: 0, quiet: true });
  try {
    const bad = await fetch(server.url + '/%E0%A4%A');
    assert.equal(bad.status, 400);
    assert.equal((await fetch(server.url + '/')).status, 200);
  } finally {
    await server.close();
  }
});
