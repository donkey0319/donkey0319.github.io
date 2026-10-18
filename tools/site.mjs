#!/usr/bin/env node
// Victor Lu's site tool.
//
//   node tools/site.mjs dev [--port 8000]   preview at localhost, rebuild + reload on save
//   node tools/site.mjs build               regenerate all pages from content/
//   node tools/site.mjs check               fail if generated pages are out of date
//   node tools/site.mjs new <slug>          start content/projects/<slug>.md
//
// --root <dir> and --assets <dir> point at another site folder (used by tests).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSite, writeSite, diffSite } from './lib/build.mjs';
import { ContentError } from './lib/content.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) opts[a.slice(2)] = argv[++i];
    else opts._.push(a);
  }
  return opts;
}

function build(root, assetRoot) {
  return buildSite({ contentDir: path.join(root, 'content'), assetRoot });
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const [command, arg] = opts._;
  const root = path.resolve(opts.root ?? REPO);
  const assetRoot = path.resolve(opts.assets ?? root);

  try {
    switch (command) {
      case 'build': {
        const written = writeSite(root, build(root, assetRoot));
        console.log(written.length ? `Updated ${written.length} file(s):\n  ${written.join('\n  ')}` : 'Everything is up to date.');
        break;
      }
      case 'check': {
        const diffs = diffSite(root, build(root, assetRoot));
        if (diffs.length) fail(`These generated files are out of date — run: npm run build\n  ${diffs.join('\n  ')}`);
        console.log('Generated pages are up to date.');
        break;
      }
      case 'new': {
        if (!arg || !SLUG.test(arg)) fail('Usage: node tools/site.mjs new my-new-piece  (lowercase letters, numbers and dashes)');
        const file = path.join(root, 'content/projects', `${arg}.md`);
        if (existsSync(file)) fail(`${path.relative(root, file)} already exists.`);
        const title = arg.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
        const template = readFileSync(path.join(REPO, 'tools/templates/new-project.md'), 'utf8');
        mkdirSync(path.dirname(file), { recursive: true });
        writeFileSync(file, template.replaceAll('{{title}}', title).replaceAll('{{slug}}', arg));
        console.log(`Created content/projects/${arg}.md — fill it in, then run: npm run build (or keep npm run dev open).`);
        break;
      }
      case 'dev': {
        const { createDevServer } = await import('./lib/dev.mjs');
        const server = await createDevServer({ root, assetRoot, port: Number(opts.port ?? 8000) });
        console.log(`Preview: ${server.url}  (Ctrl+C to stop)`);
        break;
      }
      default:
        fail('Commands: dev, build, check, new <slug>');
    }
  } catch (err) {
    if (err instanceof ContentError) fail(err.message);
    throw err;
  }
}

main();
