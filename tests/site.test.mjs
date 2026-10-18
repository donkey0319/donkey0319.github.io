import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ROOT, read, localRefs, resolves, REDESIGNED, LISTINGS, PROJECTS } from './helpers.mjs';
import { buildSite, diffSite } from '../tools/lib/build.mjs';

const require = createRequire(import.meta.url);

const NAV = ['/', '/work/', '/games/'];
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');
const navOf = (html) => (html.match(/<ul class="nav__links">([\s\S]*?)<\/ul>/) || [])[1] || '';
const cardsOf = (html) =>
  [...html.matchAll(/<article class="card[^"]*"([^>]*)>[\s\S]*?href="([^"]*)"/g)].map((m) => ({
    categories: ((m[1].match(/data-categories="([^"]*)"/) || [])[1] || '').split(/\s+/).filter(Boolean),
    href: m[2],
  }));

// ---------------------------------------------------------------------------
// Assets and scripts

test('resume exists at fixed name', () => {
  const dir = path.join(ROOT, 'assets/resume');
  assert.ok(existsSync(path.join(dir, 'Victor_Lu_Resume.pdf')));
  const pdfs = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'));
  assert.deepEqual(pdfs, ['Victor_Lu_Resume.pdf']);
});

test('reveal never hides content without JS', () => {
  const css = read('assets/css/style.css');
  assert.match(css, /html\.js\s+\.reveal/);
  const bare = /(^|[}\s,])\.reveal\s*\{[^}]*opacity:\s*0/m;
  assert.doesNotMatch(css.replace(/html\.js\s+\.reveal/g, 'X'), bare);
});

test('reduced motion disables reveal', () => {
  const css = read('assets/css/style.css');
  const block = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/g) || [];
  assert.ok(block.some((b) => b.includes('.reveal')));
});

test('back link steps back only to a listing page on this site', () => {
  const { shouldUseHistoryBack } = require('../assets/js/site.js');
  const o = 'https://donkey0319.github.io';
  assert.equal(shouldUseHistoryBack('https://donkey0319.github.io/work/#shaders', o, 2), true);
  assert.equal(shouldUseHistoryBack('https://donkey0319.github.io/games/', o, 2), true);
  assert.equal(shouldUseHistoryBack('https://donkey0319.github.io/', o, 2), true);
  assert.equal(shouldUseHistoryBack('https://donkey0319.github.io/work/', o, 1), false);
  assert.equal(shouldUseHistoryBack('https://www.google.com/', o, 2), false);
  assert.equal(shouldUseHistoryBack('', o, 2), false);
  assert.equal(shouldUseHistoryBack('https://donkey0319.github.io/games/4-kungfu-penguin/', o, 2), false);
});

test('site.js marks itself as running', () => {
  assert.match(read('assets/js/site.js'), /window\.__siteReady\s*=\s*true/);
});

// ---------------------------------------------------------------------------
// Every page

for (const page of REDESIGNED) {
  test(`${page}: uses only the new stylesheet`, () => {
    const html = read(page);
    assert.ok(html.includes('/assets/css/style.css'));
    assert.ok(html.includes('/assets/js/site.js'));
    for (const old of ['theme.css', 'site.css', 'main.min.js', 'page-fade.js', 'fontawesome-free@latest']) {
      assert.ok(!html.includes(old), `still references ${old}`);
    }
  });

  test(`${page}: nav is Home, Work, Games`, () => {
    const hrefs = [...navOf(read(page)).matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
    assert.deepEqual(hrefs, NAV);
  });

  test(`${page}: no broken local references`, () => {
    assert.deepEqual(localRefs(read(page)).filter((r) => !resolves(r)), []);
  });

  test(`${page}: no visible TODO text`, () => {
    assert.doesNotMatch(stripComments(read(page)), /TODO/);
  });

  test(`${page}: reveal falls back to visible if site.js never runs`, () => {
    const html = read(page);
    assert.match(html, /window\.__siteReady/);
    assert.match(html, /classList\.remove\('js'\)/);
  });

  test(`${page}: never mentions Granny's Gift`, () => {
    assert.doesNotMatch(read(page), /grann/i);
  });
}

for (const [page, current] of Object.entries(LISTINGS)) {
  test(`${page}: nav marks ${current} as current`, () => {
    const marked = [...navOf(read(page)).matchAll(/href="([^"]*)" aria-current="page"/g)].map((m) => m[1]);
    assert.deepEqual(marked, [current]);
  });
}

test('resume is reachable from Home', () => {
  for (const page of ['index.html']) {
    assert.match(read(page), /<a href="\/assets\/resume\/Victor_Lu_Resume\.pdf" target="_blank" rel="noopener">(<i [^>]*><\/i>)?Resume<\/a>/, page);
  }
});

// ---------------------------------------------------------------------------
// Home: level-select title screen

test('home highlights are the four chosen pieces, in order', () => {
  const html = stripComments(read('index.html'));
  const hrefs = [...html.matchAll(/<a class="level[^"]*"[^>]*href="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, [
    '/projects/cafebabe-pekora/',
    '/projects/painterly-shader/',
    '/projects/a-gentelmans-dispute/',
    '/projects/decent-farewell/',
  ]);
});

test('every highlight names a background poster', () => {
  const tiles = stripComments(read('index.html')).match(/<a class="level[^"]*"[^>]*>/g) || [];
  assert.equal(tiles.length, 4);
  for (const t of tiles) assert.match(t, /data-poster="\/[^"]+"/);
});

test('home title video is muted, inline and looping', () => {
  const videos = read('index.html').match(/<video\b[^>]*>/g) || [];
  assert.ok(videos.length > 0);
  for (const v of videos) for (const attr of ['muted', 'playsinline', 'loop']) assert.match(v, new RegExp(`\\b${attr}\\b`));
});

test('old home hashes forward to the new pages', () => {
  const html = read('index.html');
  assert.match(html, /'#games':\s*'\/games\/'/);
  assert.match(html, /'#work':\s*'\/work\/'/);
});

// ---------------------------------------------------------------------------
// Work page: all projects + filters

const LABELS = {
  '/projects/cafebabe-pekora/': ['shaders'],
  '/projects/painterly-shader/': ['shaders', 'environment'],
  '/projects/ramu-cinematic/': ['shaders', 'techanim'],
  '/projects/mocap-addon/': ['techanim'],
  '/projects/a-gentelmans-dispute/': ['environment'],
  '/projects/decent-farewell/': ['environment'],
  '/projects/kungfu-penguin/': ['techanim'],
  '/projects/ginger-air/': ['environment'],
  '/projects/mask-exe/': ['environment'],
};

test('work page lists every project with its labels', () => {
  const cards = cardsOf(read('work/index.html'));
  assert.deepEqual(
    Object.fromEntries(cards.map((c) => [c.href, [...c.categories].sort()])),
    Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [k, [...v].sort()])),
  );
});

test('work filters are All, Shaders, Technical Animation, Environment Design', () => {
  const html = read('work/index.html');
  const buttons = [...html.matchAll(/<button class="filter[^"]*"[^>]*data-filter="([^"]*)"[^>]*>([^<]*)</g)].map((m) => [m[1], m[2].trim()]);
  assert.deepEqual(buttons, [
    ['', 'All'],
    ['shaders', 'Shaders'],
    ['techanim', 'Technical Animation'],
    ['environment', 'Environment Design'],
  ]);
});

test('every card label has a filter button and every filter has a card', () => {
  const html = read('work/index.html');
  const filters = [...html.matchAll(/data-filter="([^"]+)"/g)].map((m) => m[1]);
  const used = new Set(cardsOf(html).flatMap((c) => c.categories));
  assert.deepEqual([...used].sort(), [...filters].sort());
});

test('no element id on the work page collides with a filter hash', () => {
  const html = read('work/index.html');
  const ids = [...html.matchAll(/\bid="([^"]*)"/g)].map((m) => m[1]);
  for (const m of html.matchAll(/data-filter="([^"]+)"/g)) assert.ok(!ids.includes(m[1]), m[1]);
});

// ---------------------------------------------------------------------------
// Games page

test('games page lists the five games', () => {
  const hrefs = cardsOf(read('games/index.html')).map((c) => c.href);
  assert.deepEqual(hrefs, [
    '/projects/a-gentelmans-dispute/',
    '/projects/decent-farewell/',
    '/projects/kungfu-penguin/',
    '/projects/ginger-air/',
    '/projects/mask-exe/',
  ]);
});

// ---------------------------------------------------------------------------
// Project pages

for (const page of PROJECTS) {
  test(`${page}: follows the project template`, () => {
    const html = read(page);
    assert.match(html, /<a class="back" href="\/work\/">/);
    assert.match(html, /<p class="project__kind">(Shaders|Rendering|Tech Anim|Games)<\/p>/);
    assert.match(html, /<div class="project__hero">/);
    assert.ok(html.includes('class="what-i-did"') || html.includes('TODO(victor): what I did'));
  });
}

for (const page of PROJECTS) {
  test(`${page}: no empty Work heading`, () => {
    assert.doesNotMatch(read(page), /<h2[^>]*>\s*Work\s*<\/h2>\s*(<\/section>|<\/div>|<\/main>|$)/);
  });
}

// ---------------------------------------------------------------------------
// Site plumbing

test("Granny's Gift page is gone", () => {
  assert.ok(!existsSync(path.join(ROOT, 'games/1-grannys-gift')));
});

test('old artwork/ folder is gone and games/ holds only the Games page', () => {
  assert.ok(!existsSync(path.join(ROOT, 'artwork')));
  assert.deepEqual(readdirSync(path.join(ROOT, 'games')), ['index.html']);
});

test('sitemap matches the new pages', () => {
  const xml = read('sitemap.xml');
  for (const p of ['/', '/work/', '/games/']) assert.ok(xml.includes(`<loc>https://donkey0319.github.io${p}</loc>`), p);
  assert.ok(!xml.includes('/about/'));
  assert.ok(!xml.includes('/artwork/</loc>'));
  assert.doesNotMatch(xml, /grann/i);
});

test('committed HTML is up to date with content/ (run: npm run build)', () => {
  assert.deepEqual(diffSite(ROOT, buildSite({ contentDir: path.join(ROOT, 'content'), assetRoot: ROOT })), []);
});

test('the About page is gone', () => {
  assert.ok(!existsSync(path.join(ROOT, 'about')));
});

test('home scenes: fades only hide content once home.js runs, respect reduced motion, no snapping', () => {
  const css = read('assets/css/style.css');
  assert.match(css, /html\.scenes \.scene \.fade/);
  assert.doesNotMatch(css.replace(/html\.scenes \.scene \.fade/g, 'X'), /(^|[}\s,])\.fade\s*\{[^}]*opacity:\s*0/m);
  const reduced = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/g) || [];
  assert.ok(reduced.some((b) => b.includes('.fade')), 'reduced motion turns fades off');
  assert.doesNotMatch(css, /scroll-snap/);
  const js = read('assets/js/home.js');
  assert.match(js, /classList\.add\('scenes'\)/);
  assert.match(js, /IntersectionObserver/);
});

test('highlights are a 2x2 grid on every screen size', () => {
  const css = read('assets/css/style.css');
  const levels = [...css.matchAll(/\.levels\s*\{([^}]*)\}/g)].map((m) => m[1]);
  assert.ok(levels.length >= 1);
  for (const rule of levels) {
    if (/grid-template-columns/.test(rule)) assert.match(rule, /grid-template-columns:\s*1fr 1fr;/);
  }
});
