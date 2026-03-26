# Design systems (Stitch exports)

| File | Description |
|------|-------------|
| `design-system-manifest.json` | Asset ids, paths, fetch notes |
| `theme-5f390537afc848a5bfbb4d1b9e2db319.json` | **Structure & Logic** (LIGHT) — `namedColors`, fonts, radii |
| `theme-49c7f87088fb4385a90ab547b9d465e7.json` | **Enterprise Midnight** (DARK) |
| `design-md-*-light.md` / `design-md-*-dark.md` | Narrative spec (sourced from Stitch MCP text) |
| `list-design-systems.snapshot.json` | MCP-shaped bundle for tooling / diff |
| `_build_snapshot.py` | Regenerates snapshot + `design-md-*.md` from embedded narratives |

DTCG `designTokens` strings were **not** returned by `list_design_systems` at capture time; use theme JSON + markdown for reference.
