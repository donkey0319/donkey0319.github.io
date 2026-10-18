# donkey0319.github.io

Victor Lu's portfolio. Every page is **generated from markdown in `content/`** by
`tools/site.mjs`, and served as plain static files by GitHub Pages (`.nojekyll` disables
Jekyll — nothing is built on GitHub).

## Quick start

```
npm install        # once, downloads the two small markdown libraries
npm run dev        # preview at http://localhost:8000 — rebuilds and reloads on every save
```

Edit anything in `content/`, save, and the browser refreshes. If something in a file is
wrong (a typo in the settings block, an image path that doesn't exist, an unknown filter),
the browser shows exactly which file and setting to fix.

When you're happy:

```
npm run build && npm test     # regenerate everything + run the checks
git add -A && git commit      # commit the markdown AND the generated HTML together
git push
```

`npm test` fails if the generated HTML is out of date with the markdown, so you can't
push a stale page by accident.

## Where things live

```
content/site.md                  Filters, home highlights, title line, About text (shown on Home)
content/projects/<name>.md       One file per project: settings + full write-up

tools/site.mjs                   The tool (dev / build / check / new)
tools/lib/                       Content loader, markdown renderer, page templates, build
tools/templates/new-project.md   What `npm run new` starts you with

assets/css/style.css             All styles (colors are the --tokens at the top)
assets/js/                       Browser scripts: reveal, filters, home title screen
assets/images, assets/videos     Media
assets/resume/Victor_Lu_Resume.pdf

── Generated — don't edit, your changes would be overwritten ──
index.html, work/, games/index.html          the three main pages
projects/<name>/                              one page per project
sitemap.xml

posts/, welcome-to-my-site/      Old blog (hand-written, not linked from the nav)
tests/                           Checks run by npm test
```

Every generated file starts with a comment naming the markdown it came from.

## Add a project

```
npm run new -- my-new-piece
```

This creates `content/projects/my-new-piece.md` with every setting listed and explained.
Fill in what you know, delete what you don't, write the breakdown under the settings
block. With `npm run dev` running, the page appears at `/projects/my-new-piece/` and on
the Work page as soon as you save. Put its images and videos under `assets/`.

The file name is the address, so use lowercase letters, numbers and dashes.

To remove a project, delete its markdown file and run `npm run build` — its page goes away.

## Project settings

The block between the `---` lines at the top of each project file:

| Setting | What it does |
|---|---|
| `title` | Project name (required) |
| `type` | `work` for individual pieces, `game` to also list it on the Games page |
| `label` | Small orange word above the title, e.g. `Shaders`, `Games` |
| `categories` | Work-page filters it appears under, e.g. `[shaders, environment]` — keys from `content/site.md` |
| `tags` | Grey tool pills on the card, e.g. `[UE5, HLSL, Houdini]` |
| `summary` | One line under the card title — what you did |
| `description` | Text for search engines and link previews (defaults to `summary`) |
| `thumbnail` | Card image |
| `preview` | Optional muted looping video on the card (`thumbnail` is its still) |
| `order` | Position in the lists, lower first |
| `hero` | Big media at the top of the page: image, `.mp4`, or YouTube link |
| `hero_poster` | Still shown before a hero video plays |
| `hero_caption` | Caption under the hero |
| `hero_loop` | `true` = hero video autoplays muted on loop instead of showing controls |
| `facts` | The facts strip, one `Name: value` per line (e.g. `Role: Solo`, `Year: 2026`) |
| `links` | Buttons under the facts, e.g. `- [Play on itch.io →, https://…]` |
| `what_i_did` | The "What I did" box (use `|` and indent for several lines/paragraphs) |
| `highlight_image`, `highlight_video` | Only for home highlights — override the tile image/background (default to `thumbnail`/`preview`) |

Leave a setting empty or delete it and that part simply isn't shown.

## Writing the breakdown

Plain markdown: `## Heading`, `### Smaller heading`, paragraphs, **bold**, *italic*,
`[links](https://…)`, lists. Media:

| Write | You get |
|---|---|
| `![Alt text](/assets/images/x/shot.png)` | Full-width image |
| `*Caption*` on the line right after an image | Caption under that image |
| `![Caption](/assets/videos/x/clip.mp4)` | Video with controls; the text becomes its caption |
| `![Caption](/assets/videos/x/clip.mp4 "loop")` | Muted looping video (no controls) |
| `![Caption](/assets/videos/x/clip.mp4 "loop poster=/assets/images/x/still.jpg")` | …with a still shown before it plays |
| `![](https://www.youtube.com/watch?v=VIDEO_ID)` | YouTube player |

Use `![](…)` (empty text) for a video with no caption.

## Site settings — `content/site.md`

```yaml
filters:                 # Work-page filter buttons, in order ("All" is automatic)
  shaders: Shaders
  techanim: Technical Animation
  environment: Environment Design
highlights:              # Home level-select tiles, in order (project file names)
  - cafebabe-pekora
  - painterly-shader
  - a-gentelmans-dispute
  - decent-farewell
title_role: Technical Artist
```

- **Add a filter:** add a line like `vfx: VFX`, then add `vfx` to the `categories` of the
  projects that belong under it.
- **Rename a filter:** change the text after the colon.
- **Remove a filter:** delete the line and remove its key from projects' `categories`
  (the tool tells you which files still use it).
- **Change the home highlights:** edit the list (four looks best: 4 across, 2×2 on phones).
- **About text:** everything below the second `---`. It appears on the Home page between
  your name and the Highlights, with your photo and contact links. `**bold**` shows in orange.

## Update your resume

Replace `assets/resume/Victor_Lu_Resume.pdf` with the new PDF **using exactly the same
file name**, then commit and push. GitHub Pages caches files for about 10 minutes; a hard
refresh shows the new one immediately.

## Still to fill in

Ramu Cinematic, A Decent Farewell and Ginger Air have no `summary` / `what_i_did` yet —
open their files in `content/projects/` and fill those in.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Preview + rebuild on save + auto-reload (`-- --port 3000` for another port) |
| `npm run build` | Regenerate all pages once |
| `npm run check` | List generated files that are out of date |
| `npm run new -- <name>` | Start a new project file |
| `npm test` | Run all checks (includes `check`) |
