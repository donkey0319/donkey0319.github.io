import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ROOT, read, localRefs, resolves, CONVERTED, REDESIGNED } from './helpers.mjs';

const require = createRequire(import.meta.url);

test('resume exists at fixed name', () => {
  const dir = path.join(ROOT, 'assets/resume');
  assert.ok(existsSync(path.join(dir, 'Victor_Lu_Resume.pdf')));
  const pdfs = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'));
  assert.deepEqual(pdfs, ['Victor_Lu_Resume.pdf']);
});

test('reveal never hides content without JS', () => {
  const css = read('assets/css/style.css');
  assert.match(css, /html\.js\s+\.reveal/);
  // No rule whose whole selector is a bare `.reveal` may set opacity: 0.
  const bare = /(^|[}\s,])\.reveal\s*\{[^}]*opacity:\s*0/m;
  const rules = css.replace(/html\.js\s+\.reveal/g, 'X');
  assert.doesNotMatch(rules, bare);
});

test('reduced motion disables reveal', () => {
  const css = read('assets/css/style.css');
  const block = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/g) || [];
  assert.ok(block.some((b) => b.includes('.reveal')));
});

test('shouldUseHistoryBack only for same-origin home referrers', () => {
  const { shouldUseHistoryBack } = require('../assets/js/site.js');
  const o = 'https://donkey0319.github.io';
  assert.equal(shouldUseHistoryBack('https://donkey0319.github.io/#games', o), true);
  assert.equal(shouldUseHistoryBack('https://donkey0319.github.io/', o), true);
  assert.equal(shouldUseHistoryBack('https://www.google.com/', o), false);
  assert.equal(shouldUseHistoryBack('', o), false);
  assert.equal(shouldUseHistoryBack('https://donkey0319.github.io/games/4-kungfu-penguin/', o), false);
});

// ---------------------------------------------------------------------------
// Pages

const RESUME_LINK = '<a href="/assets/resume/Victor_Lu_Resume.pdf" target="_blank" rel="noopener">Resume</a>';
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

test('home has 10 cards with valid categories', () => {
  const { CATEGORIES } = require('../assets/js/work-filter.js');
  const html = read('index.html');
  const cats = [...html.matchAll(/class="card[^"]*"[^>]*data-categories="([^"]*)"/g)].map((m) => m[1]);
  assert.equal(cats.length, 10);
  for (const token of cats.join(' ').split(/\s+/)) assert.ok(CATEGORIES.includes(token), token);
});

test('every category has a tile and at least one card', () => {
  const { CATEGORIES } = require('../assets/js/work-filter.js');
  const html = read('index.html');
  const tiles = [...html.matchAll(/data-filter="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(tiles, CATEGORIES);
  for (const c of CATEGORIES) assert.match(html, new RegExp(`data-categories="[^"]*\\b${c}\\b`));
});

test('card videos are muted and inline', () => {
  const videos = read('index.html').match(/<video\b[^>]*>/g) || [];
  assert.ok(videos.length > 0);
  for (const v of videos) {
    assert.match(v, /\bmuted\b/);
    assert.match(v, /\bplaysinline\b/);
  }
});

for (const page of CONVERTED) {
  test(`${page}: uses only the new stylesheet and shared nav`, () => {
    const html = read(page);
    assert.ok(html.includes('/assets/css/style.css'));
    assert.ok(html.includes('/assets/js/site.js'));
    for (const old of ['theme.css', 'site.css', 'main.min.js', 'page-fade.js', 'fontawesome-free@latest']) {
      assert.ok(!html.includes(old), `still references ${old}`);
    }
    assert.ok(html.includes(RESUME_LINK));
  });

  test(`${page}: no broken local references`, () => {
    const broken = localRefs(read(page)).filter((r) => !resolves(r));
    assert.deepEqual(broken, []);
  });

  test(`${page}: no visible TODO text`, () => {
    assert.doesNotMatch(stripComments(read(page)), /TODO/);
  });
}

for (const page of CONVERTED.filter((p) => /^(artwork|games)\//.test(p))) {
  test(`${page}: follows the project template`, () => {
    const html = read(page);
    assert.match(html, /<a class="back" href="\/">/);
    assert.match(html, /<p class="project__kind">(Shaders|Rendering|Tech Anim|Games)<\/p>/);
    assert.match(html, /<div class="project__hero">/);
    assert.ok(html.includes('class="what-i-did"') || html.includes('TODO(victor): what I did'));
  });
}

for (const page of CONVERTED.filter((p) => p.startsWith('games/'))) {
  test(`${page}: no empty Work heading`, () => {
    assert.doesNotMatch(read(page), /<h2[^>]*>\s*Work\s*<\/h2>\s*(<\/section>|<\/div>|<\/main>|$)/);
  });
}

test('every redesigned page is converted', () => {
  assert.deepEqual([...CONVERTED].sort(), [...REDESIGNED].sort());
});

test('old grid pages redirect into the home grid', () => {
  assert.match(read('games/index.html'), /http-equiv="refresh" content="0; url=\/#games"/);
  assert.match(read('artwork/index.html'), /http-equiv="refresh" content="0; url=\/"/);
});

test('sitemap lists About and drops the old grids', () => {
  const xml = read('sitemap.xml');
  assert.ok(xml.includes('<loc>https://donkey0319.github.io/about/</loc>'));
  assert.ok(!xml.includes('<loc>https://donkey0319.github.io/games/</loc>'));
  assert.ok(!xml.includes('<loc>https://donkey0319.github.io/artwork/</loc>'));
});
