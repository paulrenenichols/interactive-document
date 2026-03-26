# Marketing / landing

## User goal

Communicate product value, establish trust, and drive sign-up or sign-in for the presentation builder.

## Canonical reference

- **Layout / IA:** **Landing Page** (light) — `html/landing-page-310c0949.html`, `screenshots/landing-page-310c0949.jpg`.
- **Dark:** `landing-page-dark-f3070218.*` — use for **palette, glow, section tone**; layout may diverge (longer page). Do not implement two different marketing IAs in production.

## MUI mapping (draft)

- **Hero:** `Typography` variants + `Button` / `Link`; optional `Container` + `Grid` for responsive columns.
- **Nav bar:** `AppBar` + `Toolbar` + icon buttons; align with light design system “no harsh borders” (surface shifts).
- **Footer:** `Box` / `Stack` + muted `Typography`.

## Tailwind / tokens (draft)

- Map Stitch surface levels to `--color-bg-primary`, `--color-bg-secondary`, `--color-text-*`, `--color-accent-*`.
- Light design system forbids 1px section borders — prefer `bg-*` stepped surfaces per [design-md-5f390537afc848a5bfbb4d1b9e2db319-light.md](../supporting-docs/stitch-reference/design-systems/design-md-5f390537afc848a5bfbb4d1b9e2db319-light.md).

## Dark mode

- After light structure is fixed, map hero/footer to `.dark` variables; borrow **Obsidian** copy only where product wants it (see dark HTML).

## Open questions

- Single marketing IA: trim dark-only sections or merge into one scroll story?
