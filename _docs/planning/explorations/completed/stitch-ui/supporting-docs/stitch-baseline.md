# Stitch baseline decisions — Interactive Document

**Stitch project ID:** `5312792385999048975` — title in Stitch: **Interactive Document** (formerly tied to “Enterprise Clean” naming in some screens).

## Canonical layout reference (light vs dark)

- **Primary layout / IA reference:** **Light** Stitch exports (`Structure & Logic` design system, `LIGHT` color mode).
- **Rationale:** Core app surfaces (editor, auth, presentation, inspector) read clearest as editorial “precision” layouts in light; they pair with the light design system’s surface hierarchy and typography rules. Dark exports are **not** treated as alternate layouts—they differ structurally from light in places.
- **Dark mode in-product:** Implement as **token and elevation behavior** from `Enterprise Midnight` (`DARK`) + app `.dark` CSS variables, preserving **one** information architecture derived from the light canonical frames.

## Borrow-from-other rule

Where a **dark** screen contains a clearer label, spacing cue, or micro-pattern, capture it as a **bullet in the feature-set spec**, not as a second source of truth for grid/section layout.

## Design systems (Stitch assets)

Two distinct systems are vendored under `stitch-reference/design-systems/`:

| Asset | Display name | Mode | Role in exploration |
|--------|----------------|------|---------------------|
| `assets/5f390537afc848a5bfbb4d1b9e2db319` | Structure & Logic | LIGHT | Canonical **rules + tokens** for light surfaces; aligns with light screen HTML. |
| `assets/49c7f87088fb4385a90ab547b9d465e7` | Enterprise Midnight | DARK | Target **dark palette / surfaces / glow** language; aligns with dark screen HTML. |

**Note:** MCP `list_design_systems` did not return DTCG `designTokens` strings at capture time; snapshots are `theme-*.json`, narrative `design-md-*.md`, and `list-design-systems.snapshot.json`. Regenerate with `_build_snapshot.py` after editing embedded specs or by re-pulling from Stitch.

## PRD screen

The **Enterprise Clean Presentation Builder - PRD** artifact is **requirements / narrative**, not a routable app UI. Treat as supporting input to milestones; do not chase pixel parity in the product shell.

## Regenerating reference files

- **Screens:** `supporting-docs/stitch-reference/_download-screens.sh` (refresh URLs from Stitch MCP `list_screens` if exports expire).
- **Design system markdown + snapshot:** `design-systems/_build_snapshot.py` (edit embedded `DARK_MD` / `LIGHT_MD` or replace generation with a fresh MCP JSON export).
