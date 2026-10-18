// content/ → Map of generated files, plus helpers to write them or compare
// them with what's on disk.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { loadContent } from './content.mjs';
import { homePage, workPage, gamesPage, aboutPage, projectPage, sitemap, projectUrl } from './templates.mjs';

// Hand-written pages outside the generator that still belong in the sitemap.
const EXTRA_SITEMAP = ['/posts/', '/welcome-to-my-site/'];

export function buildSite({ contentDir, assetRoot }) {
  const content = loadContent(contentDir, { assetRoot });
  const { projects } = content;
  const out = new Map();

  out.set('index.html', homePage(content));
  out.set('work/index.html', workPage(content));
  out.set('games/index.html', gamesPage(content));
  out.set('about/index.html', aboutPage(content));
  for (const p of projects) out.set(`projects/${p.slug}/index.html`, projectPage(p));
  out.set('sitemap.xml', sitemap(['/', '/work/', '/games/', '/about/', ...projects.map(projectUrl), ...EXTRA_SITEMAP]));
  return out;
}

const norm = (s) => s.replace(/\r\n/g, '\n');

// Generated project pages no longer backed by a content file.
function staleProjectDirs(outRoot, map) {
  const dir = path.join(outRoot, 'projects');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !map.has(`projects/${d.name}/index.html`))
    .map((d) => `projects/${d.name}/`);
}

// Writes only files whose content changed; removes stale project pages.
export function writeSite(outRoot, map) {
  const written = [];
  for (const [rel, html] of map) {
    const file = path.join(outRoot, rel);
    if (existsSync(file) && norm(readFileSync(file, 'utf8')) === html) continue;
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, html);
    written.push(rel);
  }
  for (const stale of staleProjectDirs(outRoot, map)) {
    rmSync(path.join(outRoot, stale), { recursive: true, force: true });
    written.push(`${stale} (removed)`);
  }
  return written;
}

// Paths whose file on disk is missing, differs (ignoring CRLF), or is stale.
export function diffSite(outRoot, map) {
  const diffs = [];
  for (const [rel, html] of map) {
    const file = path.join(outRoot, rel);
    if (!existsSync(file) || norm(readFileSync(file, 'utf8')) !== html) diffs.push(rel);
  }
  return [...diffs, ...staleProjectDirs(outRoot, map)];
}
