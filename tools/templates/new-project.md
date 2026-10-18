---
# ── Required ───────────────────────────────────────────────────────────────
title: {{title}}
type: work              # work = individual piece · game = also listed on the Games page

# ── Card + filters ─────────────────────────────────────────────────────────
label:                  # small orange word above the title, e.g. Shaders / Games
categories: []          # Work-page filters, keys from content/categories.md, e.g. [shaders, environment]
tags: []                # grey tool pills, e.g. [UE5, HLSL, Houdini]
summary:                # one line under the card title — what you did
thumbnail:              # card image, e.g. /assets/images/{{slug}}/thumb.jpg
# preview:              # optional looping card video (muted), e.g. /assets/videos/{{slug}}/teaser.mp4
order: 100              # position in the lists (lower = earlier)

# ── Project page ───────────────────────────────────────────────────────────
hero:                   # big media at the top: image, .mp4, or a YouTube link
# hero_poster:          # still shown before a hero video plays
# hero_caption:         # caption under the hero
# hero_loop: true       # hero video autoplays muted on loop instead of showing controls
# description:          # text for search engines / link previews (defaults to summary)
facts:                  # the facts strip; delete lines you don't know
  # Role: Solo
  # Tools: UE5, Houdini
  # Year: 2026
# links:
#   - [Play on itch.io →, https://example.itch.io/game]
# what_i_did: |
#   One to three sentences about your part.

# ── Home page highlight (only used if listed under highlights: in content/site.md) ─
# highlight_image:      # defaults to thumbnail
# highlight_video:      # defaults to preview
---

Write the breakdown here in plain markdown.

### A section heading

A paragraph about how you made it.

<!--
Media cheat sheet:
  ![Alt text](/assets/images/{{slug}}/shot.png)
  *Caption on the line right after an image*
  ![Caption shown under the video](/assets/videos/{{slug}}/clip.mp4)
  ![Looping clip](/assets/videos/{{slug}}/clip.mp4 "loop poster=/assets/images/{{slug}}/clip-poster.jpg")
  ![](https://www.youtube.com/watch?v=VIDEO_ID)
-->
