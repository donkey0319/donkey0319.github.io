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
  'work/index.html',
  'games/index.html',
  'about/index.html',
  'projects/cafebabe-pekora/index.html',
  'projects/painterly-shader/index.html',
  'projects/ramu-cinematic/index.html',
  'projects/mocap-addon/index.html',
  'projects/a-gentelmans-dispute/index.html',
  'projects/decent-farewell/index.html',
  'projects/kungfu-penguin/index.html',
  'projects/ginger-air/index.html',
  'projects/mask-exe/index.html',
];

// Listing pages and the nav link each one marks as current.
export const LISTINGS = { 'index.html': '/', 'work/index.html': '/work/', 'games/index.html': '/games/', 'about/index.html': '/about/' };

export const PROJECTS = REDESIGNED.filter((p) => p.startsWith('projects/'));
