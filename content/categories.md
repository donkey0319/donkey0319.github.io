---
# Work page categories. Each line is:   key: Display Name
#
#   key           what you write in a project's  categories: [...]  list
#                 (lowercase letters, numbers and dashes, e.g. tech-art)
#   Display Name  the text on the filter button on the Work page
#
# The buttons appear in this order, after "All" (which is automatic).
# Save, and `npm run dev` rebuilds the Work page.
categories:
  shaders: Shaders
  animation: Animation
  environment: Environment Art
---

## How to use

- **Add a category:** add a line like `vfx: VFX` above, then put `vfx` in the
  `categories:` list of each project that belongs to it, e.g.
  `categories: [shaders, vfx]` in `content/projects/my-piece.md`.
- **Rename the button:** change the text after the colon. Projects don't need
  to change.
- **Change the key:** change it here *and* in every project that uses it — the
  build lists any project still using the old key.
- **Remove a category:** delete its line and remove the key from projects.
- **Reorder the buttons:** reorder the lines.

Categories are different from **tags** (the grey pills like `UE5` or
`Environmental Art` on a card). Tags are free text written in each project's
`tags:` list and don't need to be listed here.
