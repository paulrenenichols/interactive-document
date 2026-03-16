# Progress: 02 — Catalog inputs (material-ui-remaining-catalog)

Phase 02 of the material-ui-remaining-catalog milestone. Implemented input components for `libs/material-ui`.

## Completed

- **Checkbox** — Standard and indeterminate; optional label. Theme tokens, `.dark`, story.
- **Switch** — Toggle with optional label. Theme tokens, `.dark`, story.
- **Radio** / **RadioGroup** — Radio with optional label; RadioGroup for name/value/onChange and row/column layout. Theme tokens, `.dark`, stories.
- **Slider** — Single thumb or range; value label display; min/max/step. Theme tokens, `.dark`, stories.
- **Select** — Dropdown using Popover; options array, label, placeholder, renderValue. Theme tokens, `.dark`, stories.
- **NumberField** — Numeric input with optional stepper (increment/decrement). Theme tokens, `.dark`, stories.
- **ButtonGroup** — Wraps buttons; horizontal/vertical; connected style. Stories.
- **ToggleButton** / **ToggleButtonGroup** — On/off button; exclusive or multiple selection via context. Theme tokens, `.dark`, stories.
- **Rating** — Star rating; max, precision (0.5 or 1), readOnly. Theme tokens (warning color), `.dark`, stories.
- **Autocomplete** — Combobox: TextField + filter + Popover list; freeSolo optional. Theme tokens, `.dark`, stories.
- **FAB** — Floating action button; size (small/medium/large), variant (surface/primary/secondary/tertiary), extended. Theme tokens, `.dark`, stories.

All components are exported from `libs/material-ui/src/index.ts` and documented in `libs/material-ui/README.md`. Each has a Storybook story.

## References

- Phase plan: [02-catalog-inputs](../../milestones/active/material-ui-remaining-catalog/phase-plans/02-catalog-inputs.md).
- Feature set: [remaining-material-ui-catalog](../../planning/explorations/completed/material-ui-remaining-catalog/feature-sets/remaining-material-ui-catalog.md).
