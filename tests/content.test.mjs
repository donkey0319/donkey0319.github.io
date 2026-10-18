import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ROOT } from './helpers.mjs';
import { loadContent, parseFrontMatter, ContentError } from '../tools/lib/content.mjs';

const FIXTURE = path.join(ROOT, 'tests/fixtures/content');

// A scratch copy of the fixture content we can break on purpose.
function scratch(edit) {
  const dir = mkdtempSync(path.join(tmpdir(), 'content-'));
  cpSync(FIXTURE, dir, { recursive: true });
  if (edit) edit(dir);
  return dir;
}

function rewrite(file, from, to) {
  const s = readFileSync(file, 'utf8');
  assert.ok(s.includes(from), `fixture text not found: ${from}`);
  writeFileSync(file, s.replace(from, to));
}

function expectError(dir, { file, field }) {
  assert.throws(
    () => loadContent(dir, { assetRoot: ROOT }),
    (err) => {
      assert.ok(err instanceof ContentError, `expected ContentError, got ${err}`);
      assert.equal(err.field, field);
      assert.ok(err.file.endsWith(file), `${err.file} should end with ${file}`);
      assert.ok(err.message.includes(file) && err.message.includes(field), err.message);
      return true;
    },
  );
}

test('loads site and projects', () => {
  const { site, projects } = loadContent(FIXTURE, { assetRoot: ROOT });
  assert.deepEqual(site.filters, [
    { key: 'shaders', label: 'Shaders' },
    { key: 'environment', label: 'Environment Design' },
  ]);
  assert.deepEqual(site.highlights, ['alpha']);
  assert.equal(site.titleRole, 'Technical Artist');
  assert.match(site.aboutMarkdown, /\*\*Technical Artist\*\*/);

  assert.deepEqual(projects.map((p) => p.slug), ['alpha', 'beta-game']);
  const [alpha, beta] = projects;
  assert.equal(alpha.source, 'content/projects/alpha.md');
  assert.equal(alpha.description, 'A test shader piece.');
  assert.deepEqual(alpha.facts, [['Tools', 'UE5'], ['Role', 'Solo']]);
  assert.equal(alpha.heroPoster, '/assets/images/pekora/faceshadow-poster.jpg');
  assert.equal(alpha.whatIDid.trim(), 'I built the alpha shader.');
  assert.match(alpha.body, /### First Section/);
  assert.equal(beta.type, 'game');
  assert.deepEqual(beta.tags, []);
  assert.deepEqual(beta.links, [{ text: 'Play on itch.io →', url: 'https://example.com/play' }]);
  assert.equal(beta.whatIDid, undefined);
  assert.equal(beta.summary, '');
});

test('CRLF front matter parses the same', () => {
  const text = readFileSync(path.join(FIXTURE, 'projects/alpha.md'), 'utf8');
  const lf = parseFrontMatter(text);
  const crlf = parseFrontMatter(text.replace(/\n/g, '\r\n'));
  assert.deepEqual(crlf.data, lf.data);
  assert.equal(crlf.body.replace(/\r\n/g, '\n'), lf.body);
});

test('rejects unknown category', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'projects/alpha.md'), '[shaders, environment]', '[nope]'));
  expectError(dir, { file: 'alpha.md', field: 'categories' });
});

test('rejects missing title', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'projects/alpha.md'), 'title: Alpha Piece\n', ''));
  expectError(dir, { file: 'alpha.md', field: 'title' });
});

test('rejects bad type', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'projects/alpha.md'), 'type: work', 'type: art'));
  expectError(dir, { file: 'alpha.md', field: 'type' });
});

test('rejects bad slug filename', () => {
  const dir = scratch((d) => cpSync(path.join(d, 'projects/alpha.md'), path.join(d, 'projects/Bad Name.md')));
  expectError(dir, { file: 'Bad Name.md', field: 'slug' });
});

test('rejects highlight to unknown slug', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'site.md'), '  - alpha', '  - ghost'));
  expectError(dir, { file: 'site.md', field: 'highlights' });
});

test('rejects missing local asset', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'projects/alpha.md'), 'thumbnail: /assets/images/painterly/painterly.png', 'thumbnail: /assets/nope.png'));
  expectError(dir, { file: 'alpha.md', field: 'thumbnail' });
});

test('rejects invalid YAML with the file name', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'projects/alpha.md'), 'tags: [UE5, Shader]', 'tags: [UE5, Shader'));
  expectError(dir, { file: 'alpha.md', field: 'front matter' });
});

test('a byte-order mark at the start of a file is ignored', () => {
  const { data } = parseFrontMatter('\uFEFF---\ntitle: X\n---\nbody');
  assert.equal(data.title, 'X');
  const dir = scratch((d) => {
    for (const f of ['site.md', 'projects/alpha.md']) {
      const p = path.join(d, f);
      writeFileSync(p, '\uFEFF' + readFileSync(p, 'utf8'));
    }
  });
  const { site, projects } = loadContent(dir, { assetRoot: ROOT });
  assert.equal(site.filters.length, 2);
  assert.equal(projects[0].title, 'Alpha Piece');
});

test('a % in an asset path is a clear error, not a crash', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'projects/alpha.md'), 'thumbnail: /assets/images/painterly/painterly.png', 'thumbnail: /assets/images/100%.png'));
  expectError(dir, { file: 'alpha.md', field: 'thumbnail' });
});

test('asset paths must match the real file name letter-for-letter', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'projects/alpha.md'), 'thumbnail: /assets/images/painterly/painterly.png', 'thumbnail: /assets/images/Painterly/painterly.PNG'));
  expectError(dir, { file: 'alpha.md', field: 'thumbnail' });
});

test('images and videos in the write-up are checked too', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'projects/alpha.md'), '![A clip](/assets/videos/painterly/painterly.mp4)', '![A clip](/assets/videos/painterly/nope.mp4)'));
  expectError(dir, { file: 'alpha.md', field: 'body' });
});

test('poster hints in the write-up are checked', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'projects/alpha.md'), '![A clip](/assets/videos/painterly/painterly.mp4)', '![A clip](/assets/videos/painterly/painterly.mp4 "loop poster=/assets/nope.jpg")'));
  expectError(dir, { file: 'alpha.md', field: 'body' });
});

test('a misspelled setting is an error that suggests the right name', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'projects/alpha.md'), 'categories: [shaders, environment]', 'catgories: [shaders, environment]'));
  expectError(dir, { file: 'alpha.md', field: 'catgories' });
  assert.throws(() => loadContent(dir, { assetRoot: ROOT }), /did you mean "categories"/);
});

test('categories come from content/categories.md, in order', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'categories.md'), '  shaders: Shaders\n', '  vfx: VFX Art\n  shaders: Shaders\n'));
  const { site } = loadContent(dir, { assetRoot: ROOT });
  assert.deepEqual(site.filters.map((f) => [f.key, f.label]), [['vfx', 'VFX Art'], ['shaders', 'Shaders'], ['environment', 'Environment Design']]);
});

test('an unknown category points to content/categories.md', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'projects/alpha.md'), '[shaders, environment]', '[vfx]'));
  assert.throws(() => loadContent(dir, { assetRoot: ROOT }), /unknown category "vfx" — add it to content\/categories\.md/);
});

test('a bad category key in categories.md is a clear error', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'categories.md'), '  shaders: Shaders', '  Shader Art: Shaders'));
  expectError(dir, { file: 'categories.md', field: 'categories' });
});

test('filters left in site.md say where they moved', () => {
  const dir = scratch((d) => rewrite(path.join(d, 'site.md'), 'highlights:', 'filters:\n  shaders: Shaders\nhighlights:'));
  assert.throws(() => loadContent(dir, { assetRoot: ROOT }), /content\/site\.md: filters: .*content\/categories\.md/);
});
