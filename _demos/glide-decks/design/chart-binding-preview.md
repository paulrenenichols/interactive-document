# Chart binding preview vs design modal

`ChartBindingPreview` renders in two contexts:

1. **Binding shape preview** — e.g. Chart Series Binding panel: **`designVisual` is omitted**. The goal is a compact thumbnail that shows **data shape and bindings**, not final chart styling.
2. **Design authoring** — e.g. Chart Design Appearance modal: **`designVisual` is passed**. This is the **canonical** place to edit margins, axes, titles, and colors; the preview should match what users configure.

Discriminator: `designVisual != null` ⇒ design authoring; otherwise ⇒ binding shape preview.

## Display principles

### Margins

Minimize the Recharts **`margin`** (outer plot inset) in the **binding shape preview** so the fixed preview viewport devotes as much area as possible to the plot. Indexed charts use `computeIndexedPlotMargin` with a compact base margin; category, bar, line, and pie charts use the same compact margin instead of the wider defaults used for authoring.

### Axis and tick strokes

- **Binding shape preview:** axis lines (when the axis is hidden in visual terms) and tick strokes use **Border / Divider** — `tokens.colorBorder` (`#D1D9E6`), aligned with [design-guidelines.md](design-guidelines.md) §1.2.
- **Design authoring:** axis and tick strokes follow **`designVisual`**; defaults use **`tokens.colorChartLines`** (`#A5AEBD`) from `createDefaultAxisVisual`, per the same guidelines table.

### Axis titles

With no `designVisual`, axis title labels are not shown (existing behavior). The design modal supplies labels via `designVisual`.

### Point and line weight

In the binding preview only, Cartesian geometry is **lighter**: a shorter X-axis band height, narrower bubble Z range, smaller scatter points (custom shape), and reduced line stroke width on line charts and line_2d scatter connectors. The design modal keeps **full-weight** strokes and default scatter sizing for accurate editing.

## Reference

See **Section 1.2** in [design-guidelines.md](design-guidelines.md) for the Border/Divider vs Chart lines roles.
