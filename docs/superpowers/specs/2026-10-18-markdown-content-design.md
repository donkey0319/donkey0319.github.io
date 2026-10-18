# Markdown Content System — Design

Date: 2026-10-18
Builds on: `2026-10-18-portfolio-redesign-design.md` (current site on branch `redesign`)

## Intent

Victor wants to manage the whole portfolio — every project's tags, categories,
descriptions **and full write-up** — by editing markdown, and to add new projects without
touching HTML. When the markdown changes, the HTML must follow automatically while he works
locally.

Today every page is hand-written HTML: card info is duplicated between `work/index.html`
and `games/index.html`, labels live in attributes, and adding a project means copying a page
and editing four files plus tests. That is the pain this removes.

## Goals

- One markdown file per project in `content/`, holding all of that project's data and its
  full write-up (paragraphs, headings, images, videos, YouTube embeds, captions).
- One `content/site.md` for site-wide settings: filter list, home highlights, About text.
- A local tool: one command starts a preview server, rebuilds HTML on every save in
  `content/`, and reloads the browser.
- Adding a project = one command (or copying one file) + writing markdown.
- All project pages live in one folder: `/projects/<slug>/`.
- The generated site looks and behaves exactly like the current `redesign` branch
  (same CSS, JS, layout, filters, title screen) — this is a change of *how pages are made*,
  not a redesign.

## Non-goals

- Publishing via GitHub Actions (decided: building happens locally; Victor commits
  markdown + generated HTML together, as now).
- A graphical admin UI.
- Changing the visual design, or rewriting Victor's text.
- The old blog (`posts/`, `welcome-to-my-site/`) — untouched.

## Anti-goals

- Hand edits to generated HTML silently overwritten with no warning → every generated file
  carries a "generated from content/… — edit that instead" comment at the top.
- Pushing HTML that is out of date with the markdown → the check suite fails when the
  committed HTML doesn't match a fresh build.
- Broken inbound links: every old URL (`/artwork/<x>/`, `/games/<x>/` for projects,
  `/artwork/`) keeps working via redirect.
- A markdown format so custom it needs a manual to write. Plain markdown should just work;
  the few extras (video, caption, embed) must be guessable.

## Decided by Victor

- Full write-ups live in markdown (not only card metadata).
- One file per project in `content/` + `content/site.md` (instead of one big file).
- Local build with a watch/preview command (not GitHub-side building).
- All project pages in one folder: `/projects/<slug>/`, old URLs redirect.

## Content format (builder's call, Victor can override)

### Project file: `content/projects/<slug>.md`

The file name is the slug and the URL: `content/projects/painterly-shader.md` →
`/projects/painterly-shader/`.

```markdown
---
title: Painterly Shader
type: work            # work | game  — games also appear on the Games page
label: Shaders        # small orange word above the title
categories: [shaders, environment]   # Work-page filter keys (from site.md)
tags: [UE5, Post-processing, Shader, Substance Painter, Substance Designer]
summary: Post-processing, custom normal maps and painterly textures for a painted look.
description: "#UE5 #Postprocessing #Shader #Substance Painter #Substance Designer"  # meta/SEO; defaults to summary
thumbnail: /assets/images/painterly/painterly.png        # card image
preview: /assets/videos/...mp4                           # optional looping card video
hero: /assets/images/painterly/painterly.png             # image, .mp4, or YouTube URL
hero_caption: optional caption under the hero
facts:
  Tools: UE5, Substance Painter, Substance Designer
  Role: Solo
links:
  - [Play on itch.io →, https://…]
order: 2              # position in Work/Games lists (lower first)
what_i_did: |
  This visual effect is implemented through postprocessing, custom normal maps,
  and painterly-like textures.
---

### Postprocessing
This is implemented through a anisotrophic kuwahara filter, …

![Adjustable kernel size of the kuwahara filter](/assets/videos/painterly/painterly.mp4)
```

- Missing optional fields simply don't render (no facts → no facts strip; no `what_i_did` →
  nothing, plus the existing `TODO(victor)` comment in the HTML so it stays findable).
- `summary` empty → card shows no line (same as today's TODO cards).

### Body markdown extras

Plain markdown (headings, paragraphs, bold/italic, links, lists) renders as usual. Media:

| Write | Renders as |
|---|---|
| `![alt](/path/image.png)` | full-width image |
| `![Caption text](/path/clip.mp4)` | video with controls; the alt text becomes the caption below it |
| `![Caption text](/path/clip.mp4 "loop")` | muted looping autoplay video (like the mocap clips) |
| `![](https://www.youtube.com/watch?v=ID)` or `youtu.be/ID` | responsive YouTube embed (nocookie) |
| `*caption*` on the line right after an image | caption under that image |

### Site file: `content/site.md`

```markdown
---
filters:                       # Work page filter buttons, in order (All is automatic)
  shaders: Shaders
  techanim: Technical Animation
  environment: Environment Design
highlights:                    # home level-select tiles, in order (slugs)
  - cafebabe-pekora
  - painterly-shader
  - a-gentelmans-dispute
  - decent-farewell
title_role: Technical Artist
---

(About page text — markdown, rendered on /about/)
```

Each highlight's tile image/background come from that project's `thumbnail`/`preview`
(overridable with `highlight_image` / `highlight_video` in the project file).

## The tool: `tools/site.mjs`

| Command | Does |
|---|---|
| `node tools/site.mjs dev` | builds, serves on http://localhost:8000, watches `content/`, `tools/` templates and `assets/`, rebuilds on save, auto-reloads the open browser tab (dev-only reload script, never written into built files) |
| `node tools/site.mjs build` | one-off build of all generated HTML + `sitemap.xml` |
| `node tools/site.mjs new <slug>` | creates `content/projects/<slug>.md` from a commented template |
| `node tools/site.mjs check` | builds into memory and fails if any generated file differs from what's committed (used by the test suite) |

Build errors (bad front matter, unknown filter key, missing image path, duplicate slug)
print a clear message naming the file and field; in `dev` the server keeps running and
shows the error in the browser.

**Generated** (never hand-edited): `index.html`, `work/index.html`, `games/index.html`,
`about/index.html`, `projects/<slug>/index.html`, redirect stubs at every old project URL
and `artwork/index.html`, `sitemap.xml`.
**Hand-written** (unchanged role): `assets/css/style.css`, `assets/js/*.js`, media.

## Migration

- Convert the 9 current projects to `content/projects/*.md`, text verbatim, slugs from
  current folder names minus the number prefix: `cafebabe-pekora`, `painterly-shader`,
  `ramu-cinematic`, `mocap-addon`, `a-gentelmans-dispute`, `decent-farewell`,
  `kungfu-penguin`, `ginger-air`, `mask-exe`.
- All current values carry over: labels, categories, tags, summaries, facts, what-I-did,
  hero/captions, order (art pieces 1–4, then games in current order), the 4 highlights,
  filters, About text.
- Old `artwork/<n-slug>/` and `games/<n-slug>/` folders become redirect stubs to
  `/projects/<slug>/`; `/artwork/` → `/work/`. `/games/` stays the Games listing.
- Project "← All work" links go to `/work/` (unchanged).
- Generated output should be visually identical to the current branch; verify with
  before/after screenshots of home, work, games, one art page, one game page.

## Constraints

- Static GitHub Pages from repo root, no build on GitHub. Node is available (v26);
  Python is available for nothing in particular.
- Keep dependencies minimal. Builder's call: small pinned npm packages for markdown
  (`marked`) and front matter/YAML (`yaml`) via a `package.json`, with `node_modules/`
  git-ignored; or zero-dependency if the builder judges a small parser sufficient.
- Existing test suite moves to testing generated output + parser/renderer units, plus the
  "committed HTML is up to date" check.
- README rewritten around the markdown workflow: add a project, change tags/labels,
  change filters/highlights, the media syntax table, the commands.

## Further builder's calls (from the review)

- **Video posters:** optional `hero_poster` field, and in body media an optional
  `poster=/path.jpg` in the title, e.g. `![Caption](/clip.mp4 "loop poster=/clip-poster.jpg")`.
- **About text:** `**bold**` in `site.md` renders with the orange accent class, matching
  today's About page; photo and contact list stay in the About template.
- **`check`** compares a fresh build against the working tree (not git HEAD), with line
  endings normalized, so it passes right after `build`, before committing.
- **Tests** move to the new `/projects/<slug>/` URLs.
- **Sitemap** keeps the `posts/` and `welcome-to-my-site/` entries.
- **Kung-Fu Penguin** uses the GIF clips currently in the working tree (the old MP4s are
  deleted there).

## Left to the builder

Template mechanism (JS template functions vs. template files), file layout under
`tools/`, exact error formatting, watch debouncing, dev-server port fallback, front matter
field names beyond those above where clearer ones fit.
