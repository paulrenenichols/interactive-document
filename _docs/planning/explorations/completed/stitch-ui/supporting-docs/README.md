# Supporting docs — Interactive Document (Stitch UI)

## Index

| Doc | Purpose |
|-----|---------|
| [stitch-baseline.md](stitch-baseline.md) | Canonical light vs dark rules, design-system pairing, PRD handling |
| [stitch-screen-inventory.md](stitch-screen-inventory.md) | Every Stitch screen, logical grouping, canonical row |
| [tailwind-mui-alignment.md](tailwind-mui-alignment.md) | Stitch tokens vs `libs/material-ui` Tailwind theme + MUI strategy |

## Vendored Stitch reference (`stitch-reference/`)

- **`reference-manifest.json`** — Screen IDs, variant, relative paths to HTML + screenshots.
- **`html/*.html`** — Stitch `htmlCode` exports (regenerate via `_download-screens.sh`).
- **`screenshots/*.jpg`** — Thumbnails from `screenshot.downloadUrl` where present.
- **`design-systems/`** — `theme-*.json`, `design-md-*.md`, `design-system-manifest.json`, `list-design-systems.snapshot.json`, `_build_snapshot.py`.

**Stitch MCP:** `projectId` **5312792385999048975**.

## Scripts

| Script | When to use |
|--------|-------------|
| `stitch-reference/_download-screens.sh` | After URL rot or new screens; update ROWS heredoc with fresh `list_screens` URLs |
| `stitch-reference/design-systems/_build_snapshot.py` | After editing embedded design narratives or swapping in new MCP JSON workflow |
