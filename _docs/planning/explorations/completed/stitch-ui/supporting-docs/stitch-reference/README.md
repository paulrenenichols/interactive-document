# stitch-reference (Stitch exports)

Offline copies of Stitch **Interactive Document** (`projectId` **5312792385999048975**).

- **`html/`** — Stitch-generated HTML/CSS (not production code).
- **`screenshots/`** — Raster previews (`.jpg`).
- **`design-systems/`** — Light/dark theme JSON, design markdown, MCP-shaped `list-design-systems.snapshot.json`.
- **`reference-manifest.json`** — Joins screen IDs to local files.
- **`_download-screens.sh`** — Curl helper; refresh URLs from `list_screens` when downloads fail.

Regenerate design markdown + JSON snapshot after narrative edits:

```bash
cd design-systems && python3 _build_snapshot.py
```
