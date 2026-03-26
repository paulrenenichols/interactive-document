# Data properties / inspector

## User goal

Bind slide elements to data sources, adjust properties, validate fields.

## Canonical reference

- **Light:** `html/data-properties-panel-67f3b994.html`, `screenshots/data-properties-panel-67f3b994.jpg`.
- **Dark:** `data-properties-panel-dark-mode-701738ba.*`.
- **Evolution:** `updated-data-properties-panel-04272151.*` — treat as **candidate** IA; merge with canonical panel before implementation.

## MUI mapping (draft)

- Right-rail `Drawer` or persistent `Paper` with `Tabs` / `Accordion` for sections.
- Forms: `TextField`, `Select`, `Switch`, `Slider`, `Autocomplete` as needed; dense spacing per Stitch spacing scale narrative.
- Lists without `<hr>` — use `List` + `ListItem` + vertical spacing tokens.

## Tailwind / tokens (draft)

- Panel background: `surface-container-high` analog → `--color-bg-secondary` / stepped surface vars.
- Labels: `text-text-secondary` / `text-text-muted` per hierarchy.

## Open questions

- Which variant (baseline vs “updated”) becomes **single** inspector for milestone?
