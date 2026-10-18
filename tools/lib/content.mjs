// Loads and validates the markdown content in content/:
//   content/site.md              site-wide settings + About text
//   content/projects/<slug>.md   one file per project
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

export class ContentError extends Error {
  constructor(file, field, problem) {
    super(`${file}: ${field}: ${problem}`);
    this.name = 'ContentError';
    this.file = file;
    this.field = field;
  }
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TYPES = ['work', 'game'];
const ASSET_FIELDS = ['thumbnail', 'preview', 'hero', 'hero_poster', 'highlight_image', 'highlight_video'];

// Splits "---\n<yaml>\n---\n<body>" (LF or CRLF). Throws a plain Error on bad YAML;
// callers wrap it with the file name.
export function parseFrontMatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(text);
  if (!m) return { data: {}, body: text };
  const data = parseYaml(m[1]) ?? {};
  return { data, body: text.slice(m[0].length) };
}

function readFile(file, label) {
  let parsed;
  try {
    parsed = parseFrontMatter(readFileSync(file, 'utf8'));
  } catch (err) {
    throw new ContentError(label, 'front matter', `invalid YAML — ${err.message.split('\n')[0]}`);
  }
  if (typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
    throw new ContentError(label, 'front matter', 'must be a list of "field: value" lines');
  }
  return parsed;
}

const str = (v) => (v === undefined || v === null ? '' : String(v)).trim();

function list(label, field, v) {
  if (v === undefined || v === null || v === '') return [];
  if (!Array.isArray(v)) throw new ContentError(label, field, 'must be a list, e.g. [one, two]');
  return v.map((x) => str(x)).filter(Boolean);
}

function checkAsset(label, field, value, assetRoot) {
  if (!value || /^https?:\/\//.test(value)) return;
  if (!value.startsWith('/')) throw new ContentError(label, field, `"${value}" should start with / (e.g. /assets/…)`);
  const full = path.join(assetRoot, decodeURI(value));
  if (!existsSync(full) || !statSync(full).isFile()) throw new ContentError(label, field, `file not found: ${value}`);
}

function loadSite(contentDir) {
  const label = 'content/site.md';
  const file = path.join(contentDir, 'site.md');
  if (!existsSync(file)) throw new ContentError(label, 'file', 'missing');
  const { data, body } = readFile(file, label);

  const rawFilters = data.filters ?? {};
  if (typeof rawFilters !== 'object' || Array.isArray(rawFilters)) {
    throw new ContentError(label, 'filters', 'must be "key: Label" lines');
  }
  const filters = Object.entries(rawFilters).map(([key, value]) => {
    if (!SLUG.test(key)) throw new ContentError(label, 'filters', `key "${key}" must be lowercase letters, numbers and dashes`);
    return { key, label: str(value) || key };
  });

  return {
    filters,
    highlights: list(label, 'highlights', data.highlights),
    titleRole: str(data.title_role) || 'Technical Artist',
    aboutMarkdown: body.trim(),
  };
}

function loadProject(file, name, site, assetRoot) {
  const slug = name.replace(/\.md$/, '');
  const label = `content/projects/${name}`;
  if (!SLUG.test(slug)) {
    throw new ContentError(label, 'slug', 'file name must be lowercase letters, numbers and dashes, e.g. my-new-piece.md');
  }
  const { data: d, body } = readFile(file, label);

  const title = str(d.title);
  if (!title) throw new ContentError(label, 'title', 'required');

  const type = str(d.type) || 'work';
  if (!TYPES.includes(type)) throw new ContentError(label, 'type', `must be one of: ${TYPES.join(', ')}`);

  const categories = list(label, 'categories', d.categories);
  const known = site.filters.map((f) => f.key);
  for (const c of categories) {
    if (!known.includes(c)) {
      throw new ContentError(label, 'categories', `unknown filter "${c}" — add it under filters: in content/site.md (known: ${known.join(', ')})`);
    }
  }

  for (const f of ASSET_FIELDS) checkAsset(label, f, str(d[f]), assetRoot);

  const facts = d.facts ?? {};
  if (typeof facts !== 'object' || Array.isArray(facts)) throw new ContentError(label, 'facts', 'must be "Name: value" lines');

  const links = (Array.isArray(d.links) ? d.links : d.links ? [d.links] : []).map((l) => {
    if (!Array.isArray(l) || l.length !== 2) throw new ContentError(label, 'links', 'each link must look like [Link text, https://…]');
    return { text: str(l[0]), url: str(l[1]) };
  });

  const order = d.order === undefined ? 999 : Number(d.order);
  if (Number.isNaN(order)) throw new ContentError(label, 'order', 'must be a number');

  const summary = str(d.summary);
  const opt = (v) => str(v) || undefined;
  return {
    slug,
    source: label,
    title,
    type,
    label: str(d.label) || (type === 'game' ? 'Games' : ''),
    categories,
    tags: list(label, 'tags', d.tags),
    summary,
    description: str(d.description) || summary || title,
    thumbnail: str(d.thumbnail),
    preview: opt(d.preview),
    hero: str(d.hero),
    heroPoster: opt(d.hero_poster),
    heroCaption: opt(d.hero_caption),
    facts: Object.entries(facts).map(([k, v]) => [k, str(v)]).filter(([, v]) => v),
    links,
    order,
    whatIDid: opt(d.what_i_did),
    highlightImage: opt(d.highlight_image),
    highlightVideo: opt(d.highlight_video),
    body: body.replace(/\r\n/g, '\n'),
  };
}

export function loadContent(contentDir, { assetRoot }) {
  const site = loadSite(contentDir);
  const dir = path.join(contentDir, 'projects');
  const names = existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith('.md')).sort() : [];
  const projects = names
    .map((n) => loadProject(path.join(dir, n), n, site, assetRoot))
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));

  const slugs = new Set(projects.map((p) => p.slug));
  for (const h of site.highlights) {
    if (!slugs.has(h)) throw new ContentError('content/site.md', 'highlights', `no project named "${h}" (looked for content/projects/${h}.md)`);
  }
  return { site, projects };
}
