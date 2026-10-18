import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function read(relPath) {
  return readFileSync(path.join(ROOT, relPath), 'utf8');
}

// Root-relative href/src/poster values (site-internal links and media),
// with any query string or hash stripped.
export function localRefs(html) {
  const refs = [];
  const re = /\b(?:href|src|poster)="(\/[^"]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[1].startsWith('//')) continue;
    refs.push(m[1].split(/[?#]/)[0]);
  }
  return refs;
}

export function resolves(ref) {
  let rel = decodeURI(ref).replace(/^\//, '');
  let full = path.join(ROOT, rel);
  if (rel === '' || rel.endsWith('/')) full = path.join(full, 'index.html');
  return existsSync(full) && statSync(full).isFile();
}

export const REDESIGNED = [
  'index.html',
  'about/index.html',
  'artwork/1-cafebabe-pekora/index.html',
  'artwork/2-painterly-shader/index.html',
  'artwork/3-ramu-cinematic/index.html',
  'artwork/4-mocap-addon/index.html',
  'games/1-grannys-gift/index.html',
  'games/2-a-gentelmans-dispute/index.html',
  'games/3-decent-farewell/index.html',
  'games/4-kungfu-penguin/index.html',
  'games/5-ginger-air/index.html',
  'games/6-mask-exe/index.html',
];

// Pages converted so far; grows task by task until it equals REDESIGNED.
export const CONVERTED = ['index.html', 'about/index.html', ...REDESIGNED.filter((p) => p.startsWith('artwork/'))];
