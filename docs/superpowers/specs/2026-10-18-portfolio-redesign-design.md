# Portfolio Redesign — Design

Date: 2026-10-18
Site: donkey0319.github.io (plain static HTML/CSS/JS on GitHub Pages, no build step)

## Intent

The site is Victor Lu's portfolio for technical artist roles. Visitors (recruiters, art
leads) should come away remembering **the tech art work Victor has made**. The site must
feel smooth, easy to read and focused — everything that isn't the work gets out of its way.

Today the home page leads with a large profile photo and a bio paragraph, work is split
across "Games" and "Artwork" pages, and project pages bury what Victor personally did (on
game pages the "Work" section is the last thing on the page). The redesign fixes all three.

Reference Victor pointed to: https://jiaxinhe.framer.website/ — what Victor liked was
specifically (1) **big categories on the home page** that guide where to go, and (2)
**sections revealing as you scroll**. Not its black-and-white palette.

## Goals

- Work is the first thing on the home page, immediately under a short intro.
- One unified list of all projects (games + tech art pieces), navigable by category.
- Each project card and page says plainly what Victor did and with which tools.
- Calm, readable typography; smooth, light motion.
- Resume always reachable and always the latest version.

## Non-goals

- Rewriting Victor's project write-ups. Text is reused as-is; only reordered and restyled.
- The blog (`/posts/`, `/welcome-to-my-site/`) — not linked from nav, left alone.
- A build system, framework, or CMS.

## Anti-goals (would be a failure even if it "works")

- Decoration competing with the work (heavy gradients, glows, busy backgrounds).
- Motion that feels slow or delays reading/scrolling. Reveals must be quick and subtle,
  and disabled under `prefers-reduced-motion`.
- A broken resume link after Victor uploads a new resume.
- Breaking existing inbound links (`/games/...`, `/artwork/...` detail URLs).

## Decided by Victor

### Visual style
- **Dark theme stays**, with **orange `#d97757` as the single accent**. Existing palette:
  background `#141413`, text `#faf9f5`, mid gray `#b0aea5`, light gray `#e8e6dc`.
- **One clean sans-serif** for everything (replacing Lora serif body + Poppins headings).

### Home page (`/`) — becomes the Work page
Top to bottom:
1. **Nav**: `Victor Lu` (home link) · Work · About · Resume · social icons
   (Email, LinkedIn, ArtStation, GitHub — same targets as today).
2. **Intro**: a friendly short greeting + one line, e.g. "Hi, I'm Victor." / "A technical
   artist building shaders, rendering and technical animation for games."
3. **Big category tiles** (2×2 on desktop): **Shaders · Rendering · Tech Anim · Games**,
   each a large image tile with the category name. **Clicking a tile filters the project
   grid below** and scrolls to it. Clicking the active tile again (or a clear "All" / ×
   control) resets to all projects. The tiles *are* the filter — no separate chip row.
4. **Project grid — two cards per row** (one per row on phones). Each card:
   thumbnail (looping muted video where one exists, else image) · category label (small,
   orange, uppercase) · title · one-line "what I did" · tool tags.
5. Sections **fade/slide up subtly as they scroll into view**.

### Project pages — single column, same template for games and tech art pieces
1. "← All work" link back to home grid.
2. Category label + title.
3. Hero media, full column width (best video/GIF; gameplay video for games).
4. **Facts strip**: Role · Tools · Team · Year.
5. **"What I did"** — 1–3 sentences with an orange left rule. On game pages this is the
   existing "Work" section's content, moved to the top (the remaining media from that
   section can stay in the breakdown).
6. Breakdown: existing sections (headings, paragraphs, media full width with captions).

### Resume
- Rename `assets/resume/Victor_Lu Resume.pdf` → `assets/resume/Victor_Lu_Resume.pdf`
  (fixed name, no space). Nav "Resume" links there, opening in a new tab.
- Update workflow: Victor overwrites that same filename and pushes. Document this in
  README. (GitHub Pages caches ~10 min; acceptable.)
- Do not add a `?v=` cache-buster that would need manual edits.

## Builder's calls (made by Claude, Victor can override)

- **Replace the Minimal Mistakes theme** on redesigned pages with one new hand-written
  stylesheet (CSS custom properties for the palette). `theme.css`, `main.min.js` stay in
  the repo only for the untouched blog pages. `site.css` is superseded.
- **Font**: a single Google Fonts sans-serif (e.g. Inter or DM Sans), 2–3 weights.
  Font Awesome stays for social icons, pinned to an exact version instead of `@latest`.
- **Category mapping** (a project may carry more than one; derived from existing tags):
  - Cafebabe Pekora / "Anime Shading Model" (UE5, engine customization, rendering,
    shader) → Rendering, Shaders
  - Painterly Shader (UE5 post-process, Substance) → Shaders
  - Ramu Cinematic (UE5 shader, modeling, rigging, animation) → Tech Anim
  - Blender Mocap Addon (Blender, Python) → Tech Anim
  - All 6 games → Games
- **Tile images**: Shaders = painterly, Rendering = Pekora face shadow, Tech Anim = mocap,
  Games = Kung-Fu Penguin. Static posters, not video, to keep the top of the page light.
- **Card order**: tech art pieces first (Pekora, Painterly, Ramu, Mocap), then games in
  current order. 
- **Card "what I did" lines for games**: condensed from each game page's "Work" section
  (Victor's own words, shortened). Artwork cards condense the page's opening sentence.
- **Missing "what I did" content (decided by Victor: leave blank, Victor adds later)**:
  Granny's Gift, A Decent Farewell and Ginger Air have empty "Work" sections; Ramu
  Cinematic has no descriptive opening. For these, the card line, the "What I did" block,
  and any unknown facts render nothing (no empty box, no placeholder text) — the template
  must look complete without them. Leave a clearly marked HTML comment
  (`<!-- TODO(victor): what I did -->`) where the text goes, and document in README how
  to fill it in on both the card and the project page.
- **Tool tags**: from existing `#tags` on artwork pages; for games, from tools named on
  the page (e.g. Unity, XBox Adaptive Controller). Don't invent tools not on the page.
- **Facts strip unknowns** (Year, Team, sometimes Role): left as visible-in-source
  `TODO` placeholders hidden from render (or omitted) — never invented. List them for
  Victor to fill in.
- **About page** (`/about/`): the existing profile photo and Background paragraph, plus
  contact links. Short. `/` no longer shows the photo.
- **Old grid URLs**: `/games/` redirects to `/#games`; `/artwork/` redirects to `/`
  unfiltered (its pieces span three categories). Meta refresh + JS.
  Detail page URLs stay exactly where they are.
- **Filter state in the URL hash** (`/#rendering`) so a filtered view is linkable and the
  back link from a project can return to it.
- **Scroll reveal**: `IntersectionObserver`, opacity + ~12px translate, ≤300ms, run once
  per element; content visible by default if JS fails.
- **Page transitions**: keep the existing quick view-transition crossfade; drop the JS
  fade fallback if it complicates things.
- **Shared header/footer**: still duplicated per page (no build step), README updated.
- **Footer**: minimal — social icons + "© 2026 Victor Lu". Drop the RSS "Follow" row.
- `sitemap.xml` updated (add `/about/`).

## Constraints

- GitHub Pages, static files only, root-relative paths, previewed with
  `python -m http.server 8000`.
- Must work well at phone width (single column cards, tiles stay 2×2 or stack).
- Autoplaying card videos must stay `muted playsinline` and lazy-ish (consider pausing
  offscreen) so the grid scrolls smoothly.

## Left to the builder

Exact spacing scale, type sizes, hover states, breakpoints, file/JS structure, the
choice between Inter and DM Sans, and precise intro wording within the spirit above.

## Revision 2026-10-18: two categories

Victor replaced the four category tiles with two: **Work** (individual art pieces —
the four `artwork/` projects, hash `#work`) and **Games** (games Victor participated in,
hash `#games`). Cards keep their discipline label (Rendering / Shaders / Tech Anim) as
the small kind line. The grid heading became "Projects" (section id `projects`) so no
element id collides with a category hash, and `/artwork/` now redirects to `/#work`.

## Revision 2026-10-18 (b): Home / Work / Games / About

Supersedes the home-page and category sections above.

- **Nav:** Home · Work · Games · About (+ social icons). Resume moved to the home
  title menu and the About page.
- **Home `/`:** one-screen "level select" title — VICTOR LU / Technical Artist over a
  dimmed looping background, menu row (All Work · Games · About · Resume), and four
  highlight tiles (Anime Shading Model, Painterly Shader, A Gentlemen's Dispute,
  A Decent Farewell). Hover swaps the background; click opens the project. 2×2 on phones.
  Old `/#games` and `/#work` links forward to the new pages.
- **Work `/work/`:** all projects; filters All · Shaders · Technical Animation ·
  Environment Design, read from the page's buttons (adding a button adds a filter).
  Labels: Shaders — Anime Shading Model, Painterly, Ramu; Technical Animation — Ramu,
  Mocap, Kung-Fu Penguin; Environment Design — Painterly, A Gentlemen's Dispute,
  Mask.exe, A Decent Farewell, Ginger Air.
- **Games `/games/`:** the five games, no filters.
- **Granny's Gift** removed from the site (page, cards, sitemap); images kept in assets.
- Project back links go to `/work/`; `/artwork/` redirects to `/work/`.
