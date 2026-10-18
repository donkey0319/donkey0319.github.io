# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio's home, project, and About pages around a single filterable work grid with a calm dark design.

**Architecture:** Hand-written static HTML pages sharing one new stylesheet (`assets/css/style.css`) and two small scripts. `work-filter.js` handles the category tiles and grid filtering; `site.js` handles scroll reveal, pausing offscreen videos, and the back link. Pure logic in both scripts is exported for Node tests; DOM wiring runs only in the browser. Header and footer markup is copied verbatim into every page (no build step).

**Tech Stack:** HTML, CSS (custom properties), vanilla JS, Google Fonts (Inter), Font Awesome 6.5.2, Node 26 `node:test` for checks (no npm dependencies).

**Spec:** `docs/superpowers/specs/2026-10-18-portfolio-redesign-design.md`

## Global Constraints

- Palette tokens on `:root`: `--bg #141413`, `--text #faf9f5`, `--muted #b0aea5`, `--line #2a2a28`, `--accent #d97757`. Orange is the only accent.
- One font: Inter 400/500/600 from Google Fonts, for everything.
- Font Awesome is pinned to `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css`, never `@latest`.
- Redesigned pages load `/assets/css/style.css` only. They never load `theme.css`, `site.css`, `main.min.js`, or `page-fade.js`. The blog (`posts/`, `welcome-to-my-site/`) stays untouched.
- Resume lives at `/assets/resume/Victor_Lu_Resume.pdf`. The nav link is exactly `<a href="/assets/resume/Victor_Lu_Resume.pdf" target="_blank" rel="noopener">Resume</a>`.
- Category keys and labels: `shaders` → "Shaders", `rendering` → "Rendering", `techanim` → "Tech Anim", `games` → "Games". Hashes use the key, e.g. `/#techanim`.
- Never invent facts. Unknown Role/Team/Year/tools are omitted. Missing "what I did" text renders nothing and leaves `<!-- TODO(victor): what I did -->` in the source.
- Victor's write-ups are reused verbatim; only reordered.
- Motion: reveal uses opacity plus a 12px translate, ≤300ms, once per element, and is disabled under `prefers-reduced-motion`. Content is visible when JS is off.
- Keep the existing `@view-transition { navigation: auto; }` 0.12s crossfade (copy into style.css).
- Phone width: 16px side gutter, no horizontal scroll, single-column cards.
- Detail page URLs don't change.

### Shared markup (copy verbatim into every redesigned page)

`<head>`: charset, viewport, `<title>{Page} · Victor Lu</title>`, description/og/canonical metas carried over from the old page, the inline `document.documentElement.classList.add('js')` script, Google Fonts preconnect + Inter link, Font Awesome link, `style.css`.

Header:
```html
<header class="site-header">
  <nav class="nav container">
    <a class="nav__brand" href="/">Victor Lu</a>
    <ul class="nav__links">
      <li><a href="/">Work</a></li>
      <li><a href="/about/">About</a></li>
      <li><a href="/assets/resume/Victor_Lu_Resume.pdf" target="_blank" rel="noopener">Resume</a></li>
    </ul>
    <ul class="nav__social"><!-- Email mailto:vclu@andrew.cmu.edu, LinkedIn, ArtStation, GitHub: same URLs, aria-labels and icons as the current index.html --></ul>
  </nav>
</header>
```
Footer: `<footer class="site-footer container">` with the same four social icons and `© 2026 Victor Lu`. Scripts at end of body: `/assets/js/site.js` on all pages, plus `/assets/js/work-filter.js` on home only.

## Review Focus

1. **JS disabled or failing**: every card, tile and section must still be visible. Reveal only hides elements under `html.js`. (Test in Task 1.)
2. **Arriving with a hash** (`/#games` from the old `/games/` redirect, or a shared link): the filter applies on load. An unknown hash shows everything. (Tests in Task 2.)
3. **Back link when the visitor didn't come from home** (direct link, search engine): "← All work" must go to `/`, not `history.back()` off the site. (Test in Task 1.)
4. **Phone width (375px)**: nav wraps cleanly, tiles stay 2×2, cards go to one column, nothing overflows. Checked manually in Task 6.
5. **Many autoplaying card videos**: they pause when offscreen so scrolling stays smooth. Muted/playsinline is enforced by a test in Task 3.

---

### Task 1: Foundation: stylesheet, site.js, resume, test harness

**Files:**
- Create: `assets/css/style.css`, `assets/js/site.js`, `tests/helpers.mjs`, `tests/site.test.mjs`
- Move: `assets/resume/Victor_Lu Resume.pdf` → `assets/resume/Victor_Lu_Resume.pdf` (file is untracked; plain `mv`, then `git add`)

**Interfaces:**
- Produces: `tests/helpers.mjs` exports `ROOT` (repo root path), `read(relPath): string`, `localRefs(html): string[]` (all root-relative `href|src|poster` values, with query/hash stripped and links to `/assets/resume/...` included), `resolves(ref): boolean` (true if `ref` maps to an existing file, with `/x/` → `x/index.html`), `REDESIGNED: string[]` (home, about, the 4 artwork and 6 game detail pages; later tasks add to the assertions, not to this list).
- Produces: `assets/js/site.js` exports (CommonJS, only when `module` exists) `shouldUseHistoryBack(referrer: string, origin: string): boolean`. True only when the referrer's origin equals `origin` and its pathname is `/`.
- Produces CSS classes used by later tasks: `.container`, `.container--narrow` (max ~760px), `.site-header`, `.nav*`, `.site-footer`, `.reveal`, `.tiles`, `.tile`, `.tile.is-active`, `.grid`, `.card`, `.card__media`, `.card__kind`, `.card__title`, `.card__what`, `.tags`, `.project`, `.back`, `.project__kind`, `.project__hero`, `.facts`, `.what-i-did`, `.caption`, `.is-hidden`.

- [ ] **Step 1: Write failing tests in `tests/site.test.mjs`**
  - `resume exists at fixed name`: `existsSync(ROOT/assets/resume/Victor_Lu_Resume.pdf)` and no other PDF in that folder.
  - `reveal never hides content without JS`: `style.css` matches `/html\.js\s+\.reveal/` and has no rule whose selector is a bare `.reveal` setting `opacity: 0`.
  - `reduced motion disables reveal`: `style.css` contains `prefers-reduced-motion` within a block that references `.reveal`.
  - `shouldUseHistoryBack`: `('https://donkey0319.github.io/#games','https://donkey0319.github.io')` → true; `('https://donkey0319.github.io/','https://donkey0319.github.io')` → true; `('https://www.google.com/','https://donkey0319.github.io')` → false; `('','https://donkey0319.github.io')` → false; `('https://donkey0319.github.io/games/4-kungfu-penguin/','https://donkey0319.github.io')` → false.
  - Use `createRequire(import.meta.url)` to load `assets/js/site.js`.

- [ ] **Step 2: Run `node --test tests/` and expect FAIL** (missing files).

- [ ] **Step 3: Move the resume; write `style.css` and `site.js`**
  - The CSS covers the tokens, base type (Inter, 17px body, line-height 1.6, generous spacing), header and footer, plus every class listed above. Grid: 2 columns ≥720px, else 1. Tiles: 2×2 grid with an image filling the tile (`object-fit: cover`, dimmed) and a label bottom-left; `.is-active` gets the accent border. Cards have a 16:9 media box. Hover is subtle (border tint, image scale ≤1.03). `.is-hidden { display: none; }`. Reveal: `html.js .reveal { opacity: 0; transform: translateY(12px); transition: … 280ms }` and `html.js .reveal.is-visible { opacity: 1; transform: none }`; under reduced motion both are plain visible with no transition. Copy the view-transition rules from `site.css`.
  - `site.js`, browser only: an IntersectionObserver adds `.is-visible` to `.reveal` once and then unobserves (without IO support, add it to all). A second IntersectionObserver pauses `video[autoplay]` when offscreen and plays it when visible. On `.back` click, if `shouldUseHistoryBack(document.referrer, location.origin)`, call `preventDefault()` and `history.back()`.

- [ ] **Step 4: Run `node --test tests/` and expect PASS.**

- [ ] **Step 5: Commit**: `git add assets/css/style.css assets/js/site.js tests/ assets/resume/` then `git commit -m "Add redesign stylesheet, site script, resume at fixed path"`.

### Task 2: Work filter logic

**Files:**
- Create: `assets/js/work-filter.js`, `tests/work-filter.test.mjs`

**Interfaces:**
- Produces (CommonJS export when `module` exists): `CATEGORIES = ['shaders','rendering','techanim','games']`; `parseHash(hash: string): string|null`; `matches(categoriesAttr: string, filter: string|null): boolean`; `toggle(current: string|null, clicked: string): string|null`.
- Browser wiring (home only): the elements are `.tile[data-filter]` buttons and `.card[data-categories]`. A tile click computes `toggle`, sets `.is-hidden` on cards that don't match, toggles `.tile.is-active` and `aria-pressed`, writes the hash with `history.replaceState` (`/` when null), and smooth-scrolls to `#work`, instant under reduced motion. The `#work-reset` button (shown only while a filter is active) sets null. On load and on `hashchange`, apply `parseHash(location.hash)` without scrolling. Hidden cards also need `.is-visible` so they reveal when shown again.

- [ ] **Step 1: Write failing tests**
  - `parseHash('#rendering') === 'rendering'`, `parseHash('#games') === 'games'`, `parseHash('#bogus') === null`, `parseHash('') === null`, `parseHash('#') === null`, `parseHash('#GAMES') === 'games'`.
  - `matches('rendering shaders','shaders') === true`, `matches('games','shaders') === false`, `matches('games', null) === true`, `matches('techanim','tech') === false`.
  - `toggle(null,'games') === 'games'`, `toggle('games','games') === null`, `toggle('games','shaders') === 'shaders'`.

- [ ] **Step 2: Run `node --test tests/work-filter.test.mjs` and expect FAIL.**
- [ ] **Step 3: Implement `work-filter.js`.**
- [ ] **Step 4: Run it again and expect PASS.**
- [ ] **Step 5: Commit**: `git commit -m "Add work grid filter logic"`.

### Task 3: Home page

**Files:**
- Modify (full rewrite of body): `index.html`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: shared markup, the CSS classes from Task 1, the `work-filter.js` DOM contract from Task 2.

Structure: header, then `<main>` with:
1. Intro `.container .reveal`: `<h1>Hi, I'm Victor.</h1>` and `<p>A technical artist building shaders, rendering and technical animation for games.</p>`.
2. `.tiles .reveal`: four `<button class="tile" data-filter="KEY" aria-pressed="false">` with `<img>` + label. Images: shaders `/assets/images/painterly/painterly.png`, rendering `/assets/images/pekora/faceshadow-poster.jpg`, techanim `/assets/images/mocap/mocap-poster.jpg`, games `/assets/images/kungfupenguin/penguin1-teaser.jpg`.
3. `<section id="work">` with a heading row ("Work", plus `<button id="work-reset" class="is-hidden">Show all</button>`) and a `.grid` of 10 cards in this order. Each card is `<article class="card reveal" data-categories="…">` wrapping one `<a>` to the detail page. `.card__kind` shows the first category's label. Videos are `autoplay muted loop playsinline preload="metadata"` with a poster. Images use `loading="lazy"`.

| # | Title | URL | categories | media | what I did | tags |
|---|---|---|---|---|---|---|
| 1 | Anime Shading Model | /artwork/1-cafebabe-pekora/ | rendering shaders | video /assets/videos/pekora/faceshadow-teaser.mp4, poster /assets/images/pekora/faceshadow-poster.jpg | A UE5 shading model that reacts to ambient light while keeping an unlit, anime look. | UE5, Engine Customization, Rendering, Shader |
| 2 | Painterly Shader | /artwork/2-painterly-shader/ | shaders | img /assets/images/painterly/painterly.png | Post-processing, custom normal maps and painterly textures for a painted look. | UE5, Post-processing, Shader, Substance Painter, Substance Designer |
| 3 | Ramu Cinematic | /artwork/3-ramu-cinematic/ | techanim | video /assets/videos/ramu/ramu-teaser.mp4, poster /assets/images/ramu/ramu-poster.jpg | TODO comment | UE5, Shader, Character Modeling, Character Animation, Rigging |
| 4 | Blender Motion Capture Addon | /artwork/4-mocap-addon/ | techanim | video /assets/videos/mocap/mocap-teaser.mp4, poster /assets/images/mocap/mocap-poster.jpg | A Blender addon that uses pose-estimation AI to drive a humanoid model. | Blender, Python, Technical Animation |
| 5 | Granny's Gift | /games/1-grannys-gift/ | games | img /assets/images/grannygift/grannygift_1-teaser.jpg | TODO comment | Unity, Xbox Adaptive Controller |
| 6 | A Gentlemen's Dispute | /games/2-a-gentelmans-dispute/ | games | img /assets/images/AGD/AGD_thumbnail.png | Contract artist building map assets. | (none) |
| 7 | A Decent Farewell | /games/3-decent-farewell/ | games | img /assets/images/decentfarewell/farewell-teaser.jpg | TODO comment | VR |
| 8 | Kung-Fu Penguin | /games/4-kungfu-penguin/ | games | img /assets/images/kungfupenguin/penguin1-teaser.jpg | Modeled, rigged and animated the penguin. | Jam-O-Drum |
| 9 | Ginger Air | /games/5-ginger-air/ | games | img /assets/images/gingerair/ginger-teaser.jpg | TODO comment | (none) |
| 10 | Mask.exe | /games/6-mask-exe/ | games | img /assets/images/maskexe/mask-teaser.jpg | 3D modeling, texturing, lighting and post-processing for the final scene, plus audio scripting and camera work. | (none) |

When a card has no tags, omit the `<ul class="tags">` entirely. When it has no "what I did", omit the `<p class="card__what">` and leave the TODO comment.

- [ ] **Step 1: Add failing tests**
  - `home has 10 cards with valid categories`: count `class="card` with `data-categories` = 10, and every token is in `CATEGORIES`.
  - `every category has a tile and at least one card`: four `data-filter` values equal `CATEGORIES`.
  - `card videos are muted and inline`: every `<video` in index.html contains `muted` and `playsinline`.
  - `redesigned pages use only the new stylesheet`, over `REDESIGNED` (skip files that don't exist yet with `t.skip` until Task 6, which removes the skip): it includes `/assets/css/style.css` and `/assets/js/site.js`, and does not include `theme.css`, `site.css`, `main.min.js` or `fontawesome-free@latest`. It includes the exact Resume anchor from Global Constraints.
  - `no broken local references`: for each existing `REDESIGNED` page, every `localRefs` value `resolves`.
  - `no visible TODO text`: after stripping `<!-- … -->`, the page has no `TODO`.
- [ ] **Step 2: Run `node --test tests/` and expect the home tests to FAIL.**
- [ ] **Step 3: Rewrite `index.html`** per the structure and table above (title `Victor Lu · Technical Artist`).
- [ ] **Step 4: Run `node --test tests/` and expect PASS.**
- [ ] **Step 5: Commit**: `git commit -m "Redesign home page as filterable work grid"`.

### Task 4: Artwork project pages (4)

**Files:**
- Modify: `artwork/1-cafebabe-pekora/index.html`, `artwork/2-painterly-shader/index.html`, `artwork/3-ramu-cinematic/index.html`, `artwork/4-mocap-addon/index.html`

Project template (also used in Task 5), inside `<main class="project container container--narrow">`:
`<a class="back" href="/">← All work</a>` → `<p class="project__kind">LABEL</p><h1>TITLE</h1>` → `<div class="project__hero">` (the page's first video/iframe/image, moved here) → `<dl class="facts">` with only known items, each `<div><dt>…</dt><dd>…</dd></div>`, omitting the whole `<dl>` if none are known → `<section class="what-i-did"><h2>What I did</h2><p>…</p></section>` or the TODO comment → the remaining original content in order, each top-level block wrapped with `reveal`. Existing `<p class="caption">` stays. Inline `style="text-align:center"` wrappers can go.

Per page, in addition to the template: keep the old `<title>` text pattern switched to `TITLE · Victor Lu`, and keep the old meta descriptions.
- Pekora: kind Rendering. Facts: Tools = UE5. What I did = the opening sentence, moved verbatim ("I made a shading model for Unreal Engine 5 which reacts to ambient light while maintaining an unlit shader-like appearance.").
- Painterly: kind Shaders. Facts: Tools = UE5, Substance Painter, Substance Designer. What I did = opening sentence, verbatim. Hero = `/assets/images/painterly/painterly.png`. If that image isn't already in the page body, add it as the hero; the video stays in its Postprocessing section.
- Ramu: kind Tech Anim. Facts: Tools = UE5. What I did = TODO comment. Hero = the first video.
- Mocap: kind Tech Anim. Facts: Tools = Blender, Python. What I did = opening sentence, verbatim.

- [ ] **Step 1: Confirm the existing tests cover these pages** (`REDESIGNED` includes them; they currently fail the stylesheet test). Run `node --test tests/` and expect FAIL for the 4 artwork pages.
- [ ] **Step 2: Rewrite the 4 pages.**
- [ ] **Step 3: Run `node --test tests/` and expect PASS for the artwork pages.**
- [ ] **Step 4: Commit**: `git commit -m "Move artwork pages to project template"`.

### Task 5: Game project pages (6)

**Files:**
- Modify: `games/1-grannys-gift/index.html` … `games/6-mask-exe/index.html`
- Test: `tests/site.test.mjs`

Same template as Task 4, with kind "Games" for all. The hero is the gameplay YouTube iframe inside `.project__hero` (16:9 responsive). For Mask.exe, which has no video, the hero is `/assets/images/maskexe/mask-teaser.jpg`, and its "Play on itch.io" link sits right under the facts. The "Work" section's first paragraph(s) move into What I did, verbatim. The section's media stays in the breakdown under `<h2>Work</h2>`, and that heading is dropped if the section is now empty.

Facts (known only):
- Granny's Gift: Tools = Unity, Xbox Adaptive Controller. What I did = TODO.
- A Gentlemen's Dispute: Role = Contract artist (map assets). What I did = "I was working as a contract artist for making map assets…" paragraph.
- A Decent Farewell: Platform = VR. What I did = TODO.
- Kung-Fu Penguin: Role = 3D modeling & animation, Hardware = Jam-O-Drum. What I did = its Work paragraph.
- Ginger Air: none, so no `<dl>`. What I did = TODO.
- Mask.exe: Role = 3D art & programming, Event = Global Game Jam 2026, Year = 2026. What I did = both Work paragraphs.

- [ ] **Step 1: Add a failing test** `no empty Work heading`: no game page matches `/<h2[^>]*>\s*Work\s*<\/h2>\s*(<\/section>|<\/main>|$)/`. Every game page contains `class="what-i-did"` or `TODO(victor): what I did`.
- [ ] **Step 2: Run `node --test tests/` and expect FAIL.**
- [ ] **Step 3: Rewrite the 6 pages.**
- [ ] **Step 4: Run `node --test tests/` and expect PASS.**
- [ ] **Step 5: Commit**: `git commit -m "Move game pages to project template with What I did first"`.

### Task 6: About page, redirects, sitemap, README, final check

**Files:**
- Create: `about/index.html`
- Modify: `games/index.html`, `artwork/index.html` (replace with redirect pages), `sitemap.xml`, `README.md`, `tests/site.test.mjs`

- About: shared markup, `.container--narrow`, with `/assets/images/pfp.png` (≤240px, rounded), `<h1>About</h1>`, the existing Background paragraph verbatim (highlighted terms as `<strong>` in the accent color), and a contact line with the four links plus Resume.
- Redirect pages: a minimal HTML document with `<meta http-equiv="refresh" content="0; url=/#games">` (artwork: `url=/`), `<link rel="canonical">` to the target, a `location.replace(...)` script, and a visible fallback link.
- Sitemap: add `https://donkey0319.github.io/about/`; remove `/games/` and `/artwork/`.
- README: update the Layout section (new files; `theme.css`/`site.css`/`main.min.js`/`page-fade.js` are blog-only now). Add "Adding a project" steps (card in `index.html` with `data-categories`, project page from the template), "Updating your resume" (overwrite `assets/resume/Victor_Lu_Resume.pdf`, push, allow ~10 min), "Filling in 'What I did'" (search for `TODO(victor)`, which appears in both the card and the page; replace the comment with `<p class="card__what">…</p>` and `<section class="what-i-did">…</section>`), and `node --test tests/` as the check command.

- [ ] **Step 1: Add failing tests**: the redirect pages contain `url=/#games` and `url=/` respectively; the sitemap contains `/about/` and doesn't contain `<loc>https://donkey0319.github.io/games/</loc>`; remove the Task 3 `t.skip` so every `REDESIGNED` page is required.
- [ ] **Step 2: Run `node --test tests/` and expect FAIL.**
- [ ] **Step 3: Implement the About page, redirects, sitemap and README.**
- [ ] **Step 4: Run `node --test tests/` and expect all PASS.**
- [ ] **Step 5: Manual check**: run `python -m http.server 8000`, then `curl -s -o /dev/null -w "%{http_code}"` returns 200 for `/`, `/about/`, every detail page, the resume PDF, `/games/` and `/artwork/`. Ask Victor to open the site at 375px and desktop widths and check Review Focus items 1–5 (JS off, `/#games`, the back link from a direct visit, phone layout, scrolling smoothness).
- [ ] **Step 6: Commit**: `git commit -m "Add About page, redirect old grids, update sitemap and README"`.
