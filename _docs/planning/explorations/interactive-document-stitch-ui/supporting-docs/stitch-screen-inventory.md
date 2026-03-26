# Stitch screen inventory — Interactive Document

All rows: **desktop** exports from Stitch MCP `list_screens` (`projectId` `5312792385999048975`). Paths are relative to `supporting-docs/stitch-reference/` (see `reference-manifest.json`).

| Title | Screen ID | Variant | Logical group | Canonical for layout? | Mismatch notes |
|--------|------------|---------|---------------|------------------------|---------------|
| Landing Page | `310c0949…` | light | Marketing | Yes (light canon) | Dark landing is longer / different section stack — compare HTML side by side. |
| Landing Page (Dark) | `f3070218…` | dark | Marketing | No (tokens only) | IA differs from light; use for dark palette / copy ideas only. |
| Authentication | `e75e0dc0…` | light | Auth | Yes | Dark auth uses Obsidian / slate framing; structure may diverge. |
| Authentication (Dark) | `322e3192…` | dark | Auth | No | See dark design system / `.dark` mapping. |
| Editor Canvas | `6f568556…` | light | Editor | Yes | Dark editor layout differs (panels, density). |
| Editor Canvas (Dark) | `ccfc48b5…` | dark | Editor | No | Token reference + borrow list items only. |
| Presentation Mode | `54f081aa…` | light | Presenter | Yes | |
| Presentation Mode (Dark) | `8b471b8a…` | dark | Presenter | No | |
| Data Properties Panel | `67f3b994…` | light | Data binding | Yes | |
| Data Properties Panel (Dark Mode) | `701738ba…` | dark | Data binding | No | |
| Updated Data Properties Panel | `04272151…` | light | Data binding | TBD | Treat as **evolution** of inspector; reconcile with canonical “Data Properties Panel” before implementation. |
| Enterprise Clean Presentation Builder - PRD | `654261a0…` | document | PRD | N/A | HTML doc / spec, not app chrome. |

**Theme pairing**

- Light screens ↔ **Structure & Logic** (`theme-5f390537afc848a5bfbb4d1b9e2db319.json`, `design-md-5f390537afc848a5bfbb4d1b9e2db319-light.md`).
- Dark screens ↔ **Enterprise Midnight** (`theme-49c7f87088fb4385a90ab547b9d465e7.json`, `design-md-49c7f87088fb4385a90ab547b9d465e7-dark.md`).
