# Slide Deck Spec

## 1. Purpose

This document defines the data model, schema, and UX contracts for the **Living Document** slide layer of the platform. It covers slides, slide layouts, themes, and the placed elements that appear on them: text boxes (placeholders), shapes, and chart placements.

The design target is a **lightweight PowerPoint clone** that is immediately legible to management consultants. Consultants work in a well-understood visual grammar: title + content layouts, tight bullet hierarchies, branded color palettes, and a strict separation between "the master slide" (theme) and "the layout" (per-slide template). This spec mirrors that mental model.

It **extends** the SQLite persistence sketch in [§9 of the semantic series and chart authoring spec](../taxonomy-and-data-covenants/semantic-series-charting-spec.md). The **canonical full text** of that document is always [`taxonomy-and-data-covenants/semantic-series-charting-spec.md`](../taxonomy-and-data-covenants/semantic-series-charting-spec.md); [`design/semantic-series-charting-spec.md`](../design/semantic-series-charting-spec.md) is a short stub that points there so code comments can use a stable `design/` path.

---

## 1.1 Relationship to the semantic series spec

- **Authoritative for slide deck authoring:** Where this document conflicts with the minimal `slides` / `slide_elements` sketch in semantic [§5.6 Placement schema](../taxonomy-and-data-covenants/semantic-series-charting-spec.md) and [§9](../taxonomy-and-data-covenants/semantic-series-charting-spec.md), **this spec wins** for themes, layouts, rich text, images, tables, and typed `spec_json` payloads.
- **Mapping from minimal §5.6 rows to slide-deck types:**

| Semantic §5.6 | Slide deck (this document) |
|---|---|
| `element_type: "text"` | `text_box` with `TextBoxSpec` in `spec_json` (not a bare `text_content` column once rich text exists) |
| `element_type: "chart"` | `chart` with `ChartPlacementSpec` in `spec_json`; `chart_id` on the logical row (see §9) |
| `element_type: "shape"` | `shape` with `ShapeSpec` in `spec_json` |

A transitional implementation may keep a plain `text_content` column only for migration; the target shape is always `spec_json`-backed content as defined here.

---

## 1.2 Preview Mode (in-app presentation view)

**Preview Mode** is an in-application, PowerPoint-style **presentation view** of the slide deck. It is the closest analogue to a **published** reader experience: a standalone web document with a snapshot of bound data, read-only slide content, and no authoring affordances.

**Chrome**

- Only the **application top bar** (global shell: document title, view menu, save/load, and exit preview) plus the **slide canvas** and the **slide navigation footer** (previous/next, slide index, dot indicators).
- The Data Model / Slide Deck toggle strip, slide mode bar, insertion toolbar, and slide right panel are **hidden**.
- The navigation footer does **not** include an **add slide** control (that remains authoring-only).

**Controls**

- Navigate with the footer, **arrow keys** (including Home/End), and **Escape** to leave Preview Mode.
- **Exit preview** is also available from the top bar. Switching away from Authoring View (e.g. to Loose Components) exits preview automatically.
- Users cannot edit text, move elements, or open authoring panels while preview is active.

**Charts (Recharts) and interaction surfaces**

- On the **slide authoring canvas**, chart placements use `ChartBindingPreview` with **`interactionSurface: "slideAuthoring"`** (default): pointer events to the plot are **blocked** so selection, drag, and text edit do not conflict with the chart. Tooltips and other reader interactions are **off** there by design.
- In **Preview Mode**, the same chart renders with **`interactionSurface: "readerPreview"`**: pointer events reach the chart, Recharts **tooltips** are enabled, and future reader features (filters, slicers, drill-through, legend actions) attach to this surface. The eventual **published** standalone deck should match this reader behavior.
- Chart binding panels and the chart design modal keep their own interaction rules (e.g. axis label editing in design); those are separate from slide authoring vs reader preview.

For chart data binding and series semantics, the semantic series spec remains authoritative; see [semantic-series-charting-spec.md](semantic-series-charting-spec.md). Preview Mode is a **consumption** shell for slides and charts as defined here.

---

## 2. Object hierarchy

The inheritance chain mirrors PowerPoint's three-tier model and should be communicated clearly to users:

```
Theme
  └── Slide Layout  (inherits theme; adds layout-specific placeholders and shapes)
        └── Slide    (inherits layout; adds content-specific element instances)
```

- **Theme** — document-wide branding: colors, fonts, bullet styles, canvas size, and master background shapes.
- **Slide Layout** — a named template (e.g. "Title Slide", "Two Column", "Section Divider"). Never placed directly; only applied to slides.
- **Slide** — a concrete page in the deck. Has a layout, inherits the theme, and holds its own placed elements.

Visual rendering priority (front to back):

1. Slide content elements (topmost)
2. Layout placeholders and shapes
3. Theme background shapes and watermarks (bottommost)

§14.1 lists the **implementation paint order** (back to front—the order a renderer composites layers). It describes the same stacking as this list; use §14.1 when implementing draw calls.

---

## 3. Coordinate system and units

All `x`, `y`, `width`, `height` values are stored in **EMU (English Metric Units)**, matching PowerPoint's internal model.

```
1 inch  = 914,400 EMU
1 point = 12,700 EMU
```

Default slide canvas for a standard widescreen deck:

```
width:  12,192,000 EMU  (13.33 inches)
height:  6,858,000 EMU  (7.5 inches)
```

This matches PowerPoint's default widescreen (16:9) canvas. The canvas dimensions are stored on the document, not on individual slides, but slides may declare a local override for non-standard sizes (e.g. a square infographic page).

---

## 4. Theme

A **theme** is a document-scoped branding asset. It defines the baseline visual language for all slides. It is analogous to PowerPoint's Slide Master.

### 4.0 Theme cardinality (v1)

- **One theme per document** for v1: the `documents` row holds `default_theme_id` (FK to `themes.id`). Every `slide_layouts` row for that document references the **same** `theme_id`.
- **Per-slide theme override** (e.g. `slides.theme_override_id`) is **not** in scope for v1; switching visual theme for part of a deck would require product-specific design later.
- **Multiple themes per document** (consulting deck vs appendix theme) is deferred unless explicitly prioritized.

### 4.1 Theme schema

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Durable handle |
| `document_id` | uuid | Document scope |
| `name` | text | User-facing label, unique within document |
| `color_palette` | `ThemeColorPalette` | See §4.2 |
| `font_config` | `ThemeFontConfig` | See §4.3 |
| `bullet_config` | `BulletConfig[]` | Up to 4 levels; see §4.4 |
| `background_fill` | `FillSpec` | Slide background; see §4.5 |
| `master_elements` | `ThemeElement[]` | Shapes/text always rendered on every slide; see §4.6 |
| `default_new_slide_layout_id` | uuid \| null | Layout used when the user adds a slide in slide authoring (`+ Add slide`). Must resolve to a row in `slide_layouts` for the same document; if missing or stale, implementations fall back to the first available layout. |
| `created_at` | datetime | |
| `updated_at` | datetime | |

### 4.2 Color palette

Stores 10 named slots following the PowerPoint convention. The platform's brand palette from the design system (§1.1 of design-guidelines) should map to these slots.

| Slot | Role | Default mapping |
|---|---|---|
| `accent_1` | Primary action color | `--color-primary` `#E8472A` |
| `accent_2` | Secondary / supporting | `--color-secondary` `#3F6080` |
| `accent_3` | Warning | `--color-warning` `#FFC13A` |
| `accent_4` | Success | `--color-success` `#3A8A28` |
| `accent_5` | Selection / light | `--color-selection` `#B8C8E8` |
| `accent_6` | Danger | `--color-danger` `#BC3020` |
| `dark_1` | Primary text / chrome | `--color-chrome` `#0D1526` |
| `dark_2` | Secondary text | `--color-secondary` `#3F6080` |
| `light_1` | Slide background | `#F4F5F7` |
| `light_2` | Panel / card surface | `#FFFFFF` |

Slides and elements reference palette slots by name (e.g. `"accent_1"`) rather than hardcoded hex values. This lets a theme swap cascade automatically to all placed elements.

```ts
interface ThemeColorPalette {
  accent_1: string;   // hex
  accent_2: string;
  accent_3: string;
  accent_4: string;
  accent_5: string;
  accent_6: string;
  dark_1: string;
  dark_2: string;
  light_1: string;
  light_2: string;
}
```

### 4.3 Font configuration

```ts
interface ThemeFontConfig {
  heading_family: string;       // e.g. "Poppins"
  heading_weight: number;       // e.g. 700
  body_family: string;          // e.g. "Poppins"
  body_weight: number;          // e.g. 400
  monospace_family: string;     // e.g. "JetBrains Mono"
}
```

The platform uses Poppins throughout (per design-guidelines §2.1). Third-party themes may specify alternate font families; the platform should load them from Google Fonts with `display=swap`.

### 4.4 Bullet configuration

Up to 4 levels of bullet hierarchy. Each level independently specifies its character, indent, and size.

```ts
type BulletShape = "disc" | "circle" | "square" | "dash" | "arrow" | "check" | "none" | "custom";

interface BulletLevel {
  level: 1 | 2 | 3 | 4;
  shape: BulletShape;
  custom_char?: string;           // required when shape = "custom"
  color?: string;                 // palette slot name or hex; defaults to body text color
  size_pt: number;                // bullet character size in points
  indent_emu: number;             // left indent of list content from the **text box content edge** (after padding); implementations may derive this from rem at theme load time
  hanging_emu: number;            // minimum marker-column width (EMU); renderers widen for wide glyphs/`n.` then add gap to body text
  space_before_pt: number;        // space before paragraph in points
  space_after_pt: number;
  font_size_pt: number;           // text size at this level
  font_bold: boolean;
  font_italic: boolean;
}

type BulletConfig = BulletLevel[];
```

**Indent vs slide edge:** For slide text boxes, bullet/list horizontal layout is measured from the **inner content box** of the text element (inside padding), not from the slide canvas edge. Theme `indent_emu` values are stored in EMU but may be authored from **rem** (see product defaults below). **`indent_emu` applies only when `ParagraphStyle.list_style` is `bullet` or `numbered`**; for `list_style: none`, renderers use no list gutter (`paragraphPaddingLeftPx`).

**Product default (Precision Ledger / app baseline):** Unordered list glyphs and left offsets from the text box content edge:

| Level | Unordered glyph | Content start offset |
|---|---|---|
| 1 | Filled disc (`disc`) | `4.5rem` |
| 2 | Em dash (`dash`) | `5.75rem` |
| 3 | Hollow circle (`circle`) | `7rem` |
| 4 | Hollow square (`square`) | `8.25rem` |

Offsets are large enough for the list marker column (`listMarkerGutterPx`: marker width heuristic + `0.5rem` gap) including wide numbered markers (e.g. `100.`) at each level’s `font_size_pt`.

Implementations convert rem → px → EMU using the root font size (typically 16px) and §3’s px/EMU relationship. **Maximum list hierarchy** is four levels: `ParagraphStyle.indent_level` is `0 | 1 | 2 | 3` and selects theme `bullet_config` levels **1–4** (`indent_level + 1`). Values outside this range must be clamped in authoring.

Legacy consulting-style reference (inch-based) may still appear in older themes:

| Level | Shape | Indent | Font size |
|---|---|---|---|
| 1 | `dash` | 0.5 in | 18pt |
| 2 | `disc` | 0.75 in | 16pt |
| 3 | `circle` | 1.0 in | 14pt |
| 4 | `square` | 1.25 in | 13pt |

### 4.5 Fill spec

Used for slide backgrounds, shape fills, and table cells.

```ts
type FillKind = "solid" | "gradient" | "image" | "none";

interface FillSpec {
  kind: FillKind;
  color?: string;                  // palette slot or hex; for solid
  gradient?: GradientSpec;         // for gradient
  image_asset_id?: string;         // for image fills
  opacity?: number;                // 0–1
}

interface GradientSpec {
  angle_deg: number;
  stops: { offset: number; color: string }[];
}
```

### 4.6 Master (theme-level) elements

Theme master elements appear on every slide, behind layout and slide content. They are typically background shapes, logo placements, or watermarks.

```ts
interface ThemeElement {
  id: string;
  element_type: "shape" | "text_box" | "image" | "placeholder";
  x: number;           // EMU
  y: number;
  width: number;
  height: number;
  z_index: number;
  locked: boolean;     // if true, slide authors cannot select or move it
  placeholder_role?: PlaceholderRole; // only for element_type = "placeholder"
  spec: ShapeSpec | TextBoxSpec | ImageSpec;   // TextBoxSpec for placeholder / text_box
}
```

---

## 5. Slide Layout

A **slide layout** is a named template applied to one or more slides. It is analogous to PowerPoint's Slide Layout tier (below Slide Master, above individual slides).

Layouts cannot be placed in the document directly. They are selected when a slide is created or changed.

### 5.1 Layout schema

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Durable handle |
| `document_id` | uuid | |
| `theme_id` | uuid | The theme this layout belongs to |
| `name` | text | User-facing name, e.g. "Title Slide", "Title + Content", "Two Column", "Blank", "Section Divider" |
| `description` | text nullable | Optional tooltip shown in layout picker |
| `thumbnail_asset_id` | string nullable | Rendered preview image |
| `elements` | `LayoutElement[]` | Shapes and placeholders defined in this layout |
| `background_fill_override` | `FillSpec` nullable | Overrides theme background for slides using this layout |
| `created_at` | datetime | |
| `updated_at` | datetime | |

### 5.2 Layout elements

Layout elements are shapes, image regions, or **placeholders** (editable text regions that become populated when a slide uses this layout).

```ts
type LayoutElementKind = "shape" | "placeholder" | "image";

interface LayoutElement {
  id: string;                        // stable within layout
  element_type: LayoutElementKind;
  x: number;                         // EMU
  y: number;
  width: number;
  height: number;
  z_index: number;
  placeholder_role?: PlaceholderRole; // only for element_type = "placeholder"
  spec: ShapeSpec | PlaceholderSpec | ImageSpec;
}

type PlaceholderRole =
  | "title"
  | "subtitle"
  | "body"
  | "footer"
  | "slide_number"
  | "date"
  | "chart"
  | "custom";
```

`placeholder_role` is used by the slide editor to auto-populate content (e.g. the `slide_number` placeholder is always rendered with the current slide's position).

### 5.3 Recommended built-in layouts

Every document should ship with at least these named layouts:

| Name | Description |
|---|---|
| **Title Slide** | Large centered title, subtitle below. Used as deck cover. |
| **Title + Content** | Top-anchored title placeholder; large body placeholder below. Workhorse layout. |
| **Two Column** | Title at top; two equal-width body columns below. |
| **Section Divider** | Full-width bold title centered vertically; minimal chrome. Used between sections. |
| **Blank** | No placeholders; canvas is fully open. |
| **Title Only** | Title placeholder; remainder of canvas is open for free-placed elements. |
| **Big Number** | Oversized KPI value placeholder with a supporting label placeholder. |

---

## 6. Slide

A **slide** is a concrete page in the deck. It holds an ordered set of placed elements: text boxes, shapes, chart placements, and images.

### 6.1 Slide schema

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Durable handle |
| `document_id` | uuid | |
| `layout_id` | uuid | Applied layout; FK to `slide_layouts` |
| `order_index` | integer | 1-based position in the deck |
| `name` | text nullable | Optional user-supplied slide name; shown in slide panel |
| `notes` | text nullable | Speaker notes; plain text in v1 |
| `thumbnail_asset_id` | string nullable | Cached preview image |
| `elements` | `SlideElement[]` | All placed elements on this slide |
| `suppressed_layout_placeholder_ids` | `string[]` | Layout placeholder ids removed on this slide instance |
| `suppressed_theme_placeholder_ids` | `string[]` | Theme master placeholder ids removed on this slide instance |
| `background_fill_override` | `FillSpec` nullable | Per-slide background override (overrides layout and theme) |
| `hidden` | boolean | If true, slide is excluded from published output |
| `created_at` | datetime | |
| `updated_at` | datetime | |

`order_index` is 1-based and must be unique within a document. Reordering slides updates these values for all affected slides. The platform should treat `order_index` as the authoritative deck sequence and maintain it without gaps.

### 6.2 Slide elements

Every element placed on a slide shares a common base shape, with a discriminated `spec` for type-specific properties.

```ts
type SlideElementKind = "text_box" | "shape" | "chart" | "image" | "table";

interface SlideElement {
  id: string;                      // UUID string
  slide_id: string;                // UUID string
  element_type: SlideElementKind;

  // Layout box (all in EMU)
  x: number;
  y: number;
  width: number;
  height: number;
  rotation_deg: number;           // clockwise rotation in degrees; 0 = no rotation

  z_index: number;                // stacking order; higher = in front
  locked: boolean;                // if true, cannot be selected or moved in editor
  hidden: boolean;                // if true, excluded from render and export

  // Links to layout placeholder (if this element was created from one)
  layout_element_id?: string;     // nullable; ties this element to a layout placeholder slot
  // Links to theme master placeholder (if this element was created from one)
  theme_element_id?: string;      // nullable; ties this element to a theme master placeholder slot

  // Type-specific content
  spec: TextBoxSpec | ShapeSpec | ChartPlacementSpec | ImageSpec | TableSpec;

  created_at: datetime;
  updated_at: datetime;
}
```

---

## 7. Placeholder and text box

A **text box** is the primary content element. When placed via a layout, it is called a **placeholder**. The distinction is authoring-time only: both share the same `TextBoxSpec`.

### 7.1 TextBoxSpec

```ts
interface TextBoxSpec {
  // Content
  paragraphs: TextParagraph[];

  // Box styling
  fill: FillSpec;
  border: BorderSpec | null;
  padding: EdgeInsets;            // inner padding in EMU

  // Text fitting
  auto_fit: "none" | "shrink_text" | "resize_box";
  word_wrap: boolean;

  // Vertical alignment within the box
  vertical_align: "top" | "middle" | "bottom";

  // Placeholder metadata (populated by layout role)
  placeholder_role?: PlaceholderRole;
  placeholder_hint?: string;      // Ghost text shown when empty, e.g. "Click to add title"
  default_style: TextRunStyle;    // Default style applied when user starts typing into an empty placeholder
  /** When `single_line`, authoring uses one paragraph; Enter may commit or end editing instead of inserting a new paragraph. When `multi_paragraph` (default for body content), Enter inserts a new paragraph. */
  paragraph_editing?: "single_line" | "multi_paragraph";
}
```

### 7.2 Text paragraphs and runs

Text content is stored as a list of paragraphs, each containing one or more styled runs. This mirrors the OOXML paragraph/run model that Office users will recognize.

**Soft line breaks:** A **paragraph** boundary is always a separate `TextParagraph` object. A **soft line break** within the same paragraph is represented by a newline character (`\n`) inside a run’s `text` (or across adjacent runs with the same style). Serializers and exporters must **not** treat in-run `\n` as a new paragraph—only `TextParagraph` boundaries are paragraphs. Plain-text import paths that split only on `\n` cannot represent soft breaks; those flows may collapse to one paragraph per line.

**`indent_level` and bullets:** `indent_level` `0`…`3` maps to theme `bullet_config` entries with `level` `1`…`4`. No more than **four** hierarchy levels are supported; authoring UIs must clamp indent changes to `0`–`3`.

```ts
interface TextParagraph {
  id: string;
  runs: TextRun[];
  paragraph_style: ParagraphStyle;
}

interface TextRun {
  id: string;
  text: string;
  style: TextRunStyle;            // Overrides; falls back to paragraph_style defaults
  special?: SpecialRunKind;       // See §7.3
}

interface TextRunStyle {
  font_family?: string;           // overrides theme if set
  font_size_pt?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;                 // palette slot or hex
  highlight_color?: string;       // palette slot or hex; null = no highlight
  baseline?: "normal" | "super" | "sub";
  link_url?: string;              // if set, run is a hyperlink
}

interface ParagraphStyle {
  alignment: "left" | "center" | "right" | "justify";
  indent_level: 0 | 1 | 2 | 3;   // maps to theme bullet_config levels 1–4 (indent_level + 1); max four levels
  space_before_pt: number;
  space_after_pt: number;
  line_spacing: number;           // multiplier; 1.0 = single, 1.5 = 1.5x, etc.
  bullet_override?: BulletLevel;  // if set, overrides theme bullet for this paragraph only
  list_style: "none" | "bullet" | "numbered";
  numbered_start?: number;        // starting number for numbered lists
}
```

### 7.2.1 Authoring UX (slide text)

In **multi-paragraph** text boxes (`paragraph_editing` omitted or `multi_paragraph`):

- **Enter** inserts a new `TextParagraph` after the caret.
- **Shift+Enter** inserts a soft line break (`\n` inside the current run) without creating a new paragraph.

In the **Design** panel, font and color controls apply to the **current text selection** in the active editor when the selection is non-empty; when the caret has **no range** (collapsed selection), the same controls apply to the **whole text box** (including default style where appropriate). **List style** (none / bulleted / numbered) and **increase indent** / **decrease indent** follow the same rule: they affect selected paragraphs, or all paragraphs when there is no selection.

### 7.2.2 Shift + resize (slide canvas)

When resizing a **text box** or **shape** on the slide authoring canvas via selection handles, holding **Shift** constrains width:height to the element’s **bounding box at the start of the drag** (after any prior stretch or skew), not a template “original” aspect. The implementation reads **`pointermove`’s `shiftKey`** on each move so Shift can be pressed or released mid-gesture.

**Chart placements** on the slide: corner resize already preserves a fixed aspect ratio from the drag start (and optionally the chart design’s locked ratio); Shift does not introduce a separate mode there. See [`design/shift-resize-aspect.md`](../design/shift-resize-aspect.md) for chart design modal behavior and shared code paths.

### 7.3 Special run kinds

Certain runs are dynamic — their rendered text is computed at display time, not stored as a literal string.

```ts
type SpecialRunKind =
  | "slide_number"         // current slide's order_index
  | "total_slides"         // total number of non-hidden slides in the deck
  | "slide_number_of_total" // composite: "12 / 20"
  | "date_auto"            // current date, updated on render
  | "date_fixed"           // date fixed at time of authoring
  | "document_title"       // document display name
  | "section_title";       // title of the nearest preceding Section Divider slide
```

In the Glide Decks authoring app, `document_title` resolves to the **document name** from the app chrome (the same string stored as `app.documentTitle` in the **project snapshot** JSON produced by Save state, alongside the data model and slide deck). Older dev exports only contained a top-level `documentTitle` field; full snapshots use the `app` object. It is not a static literal: renaming the document in the UI updates every slide footer or text run that uses this special run.

The `text` field on a run with `special` set is used as a **fallback** for export contexts that do not support dynamic fields (e.g. PDF export). The rendering layer should populate it at export time.

Display format examples for `slide_number` and `total_slides`:

| Desired output | Runs |
|---|---|
| `12 / 20` | `[{special: "slide_number_of_total"}]` |
| `Slide 12` | `[{text: "Slide "}, {special: "slide_number"}]` |
| `Page 7 of 17` | `[{text: "Page "}, {special: "slide_number"}, {text: " of "}, {special: "total_slides"}]` |

---

## 8. Shapes

Shapes are non-text elements used for dividers, backgrounds, callouts, connectors, and decorative frames.

```ts
type ShapeKind =
  | "rectangle"
  | "rounded_rectangle"
  | "circle"
  | "ellipse"
  | "line"
  | "arrow"
  | "triangle"
  | "parallelogram"
  | "diamond"
  | "custom_polygon";  // future; stores path data

interface ShapeSpec {
  shape_kind: ShapeKind;
  fill: FillSpec;
  border: BorderSpec | null;
  corner_radius_emu?: number;      // for rounded_rectangle only
  line_start?: LineEndSpec;        // for line/arrow
  line_end?: LineEndSpec;
  path_data?: string;              // SVG path string for custom_polygon
  line_stroke?: LineStrokeSpec;    // stroke for line/arrow — see shapes-milestone-spec.md
  path_viewbox?: string;           // SVG viewBox for custom_polygon path scaling
  path_description?: string;       // optional AI / regeneration prompt (future)
  arrow_geometry?: ArrowHeadGeometrySpec; // optional filled-shaft arrow body
}

interface LineStrokeSpec {
  weight_pt: number;
  cap: "butt" | "round" | "square";
  style: "solid" | "dashed" | "dotted";
  color: string;                   // palette slot or hex
}

interface ArrowHeadGeometrySpec {
  head_style: "chevron" | "open" | "blunt" | "circle";
  shaft_weight_ratio: number;
  head_depth_ratio: number;
}

interface BorderSpec {
  color: string;                   // palette slot or hex
  width_pt: number;
  style: "solid" | "dashed" | "dotted" | "none";
}

interface LineEndSpec {
  marker: "none" | "arrow" | "arrow_open" | "circle" | "square";
  size: "small" | "medium" | "large";
}

interface EdgeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
```

---

## 9. Chart placements

A chart placement is a reference to a global **chart asset** (defined in the data model) placed at a specific position on a slide. The chart asset owns the data bindings and semantic logic; the placement owns position, size, and local display overrides.

This matches §4.5 / §5.6 of the [semantic series and chart authoring spec](../taxonomy-and-data-covenants/semantic-series-charting-spec.md) and §3.2 of that document’s core UX model.

**Canonical `chart_type` strings** for chart assets align with the app’s chart registry — see `ChartCreationKind` and related types in [`src/types/dataModel.ts`](../src/types/dataModel.ts); avoid ad hoc spellings that diverge from that enum.

**Placement vs chart design modal:** Chart assets may also store a **design-time** frame (`appearance` / `ChartAppearanceLayout` in pixels on the data-model design canvas). That is **separate** from slide placement: rendering/compositing should use the chart’s default appearance (bindings, styling, modal layout where relevant) **plus** the slide element’s EMU layout box **plus** `ChartPlacementSpec` overrides (title, legend, labels, etc.). Placement does not replace the chart asset’s stored appearance; it scopes how the chart is shown on a slide.

**Stable `chart_id` vs in-memory names:** Persisted rows use `chart_id` (UUID) as FK to `charts.id`. The current authoring UI may identify chart assets by **name** (e.g. drag-and-drop payloads) until persistence lands; implementations may temporarily resolve **name → id** (unique per document) and should migrate to storing `chart_id` once `ChartAssetRow` (or equivalent) gains stable ids in the database.

**`live_instance_count`:** When chart rows track usage (`live_instance_count` on the chart asset), increment/decrement when placements are added, removed, or change chart reference so the data model stays consistent with §5.6’s global chart object model.

```ts
interface ChartPlacementSpec {
  chart_id: string;                // UUID string — FK to charts table

  // Local overrides — override chart asset defaults for this placement only
  title_override?: string;         // null = use chart asset's default title
  show_legend_override?: boolean;  // null = use chart asset default
  show_data_labels_override?: boolean;
  aspect_ratio_locked: boolean;    // if true, resizing maintains aspect ratio
  overrides_json?: Record<string, unknown>;  // escape hatch for additional local tweaks
}
```

When a user double-clicks a chart placement in the slide editor, the editor should navigate to the chart asset in the data model view for editing. This reinforces the principle that chart logic lives in the data model, not embedded in the slide.

---

## 10. Images

```ts
interface ImageSpec {
  asset_id: string;                // reference to a stored image asset
  original_filename: string;
  mime_type: "image/png" | "image/jpeg" | "image/svg+xml" | "image/gif" | "image/webp";
  original_width_px: number;
  original_height_px: number;
  crop?: CropSpec;                 // null = no crop
  fit: "fill" | "contain" | "cover" | "stretch";
  alt_text?: string;               // accessibility
}

interface CropSpec {
  top: number;    // fraction of original height cropped from top (0–1)
  right: number;
  bottom: number;
  left: number;
}
```

---

## 11. Tables

Slide tables are distinct from data grid tables in the authoring canvas. They are lightweight presentation tables: static or manually edited, styled to match the theme. They do not bind to series assets in v1.

```ts
interface TableSpec {
  rows: TableRow[];
  col_widths_emu: number[];         // must sum to element width
  style: TableStyle;
  has_header_row: boolean;
  has_total_row: boolean;
  banded_rows: boolean;
  banded_cols: boolean;
}

interface TableRow {
  id: string;
  height_emu: number;
  cells: TableCell[];
  is_header?: boolean;
  is_total?: boolean;
}

interface TableCell {
  id: string;
  col_span: number;
  row_span: number;
  fill: FillSpec;
  border: BorderSpec | null;
  padding: EdgeInsets;
  vertical_align: "top" | "middle" | "bottom";
  paragraphs: TextParagraph[];      // reuses same TextParagraph model
}

interface TableStyle {
  header_fill: FillSpec;
  header_text_color: string;        // palette slot or hex
  total_fill: FillSpec;
  total_text_color: string;
  banded_even_fill: FillSpec;
  banded_odd_fill: FillSpec;
  border: BorderSpec;
  outer_border: BorderSpec;
}
```

---

## 12. SQLite persistence model

These tables extend the persistence model from §9 of the [semantic series and chart authoring spec](../taxonomy-and-data-covenants/semantic-series-charting-spec.md).

### `documents` (additions to semantic §9)

- `default_theme_id` (nullable UUID, FK to `themes.id`) — single active theme for the document; see §4.0.

Other `documents` columns remain as in the semantic spec (`id`, `name`, timestamps).

### `themes`
- `id` (UUID)
- `document_id`
- `name`
- `color_palette_json`
- `font_config_json`
- `bullet_config_json`
- `background_fill_json`
- `master_elements_json`
- timestamps

### `slide_layouts`
- `id` (UUID)
- `document_id`
- `theme_id`
- `name`
- `description`
- `thumbnail_asset_id`
- `elements_json`
- `background_fill_override_json`
- timestamps

### `slides`
- `id` (UUID)
- `document_id`
- `layout_id`
- `order_index` (integer, 1-based, unique per document)
- `name`
- `notes`
- `thumbnail_asset_id`
- `background_fill_override_json`
- `hidden` (boolean)
- timestamps

### `slide_elements`
- `id` (UUID)
- `slide_id`
- `element_type` (`text_box` | `shape` | `chart` | `image` | `table`)
- `x`, `y`, `width`, `height`, `rotation_deg` (all integers, EMU)
- `z_index`
- `locked` (boolean)
- `hidden` (boolean)
- `layout_element_id` (nullable; ties back to layout placeholder)
- `spec_json` (element-type-specific payload)
- timestamps

### `image_assets`
- `id` (UUID)
- `document_id`
- `original_filename`
- `mime_type`
- `width_px`, `height_px`
- `storage_key` (path or blob reference)
- `file_size_bytes`
- timestamps

---

## 13. Slide editor UX notes

These notes translate the schema into authoring behavior for the living document editor.

### 13.1 Slide panel (left sidebar)

Mirrors PowerPoint's left thumbnail panel:

- scrollable vertical list of slide thumbnails,
- 1-based slide numbers below each thumbnail,
- drag-to-reorder (updates `order_index` for all affected slides),
- right-click context menu: Duplicate Slide, Delete Slide, Hide/Show Slide, Add Slide After,
- `+` button at bottom: opens layout picker modal.

### 13.2 Canvas

- Slide renders at full canvas dimensions within the viewport; zooms to fit by default.
- Clicking an empty area deselects all elements.
- Click-to-select; click-and-drag to move; handle-drag to resize.
- Multi-select via Shift+click or rubber-band drag.
- Arrow keys nudge selected elements by 1px (at 100% zoom); Shift+arrow nudges by 10px.
- Double-click a text box to enter edit mode (cursor placed at click position).
- Double-click a chart placement navigates to chart asset in data model view (with breadcrumb back).

### 13.3 Layout picker

Opened when creating a new slide or changing layout. Shows:

- thumbnail grid of available layouts,
- layout name below each thumbnail,
- applies immediately on selection (existing content is preserved where slot roles match; unmatched content drops to the slide element layer).

### 13.3.1 Slide Layout (insertion toolbar)

- **Slide Layout** on the insertion toolbar (above the canvas) opens a modal with a horizontal theme strip, a **Themes** caption, a divider, and a **Layouts** grid for the selected theme. Choosing a layout applies it to the **active slide** immediately; closing the dialog keeps that change.

### 13.4 Right panel (property inspector)

Appears on element selection; mirrors PowerPoint's Format Pane behavior (see design-guidelines §3.2).

For a text box:

- font family, size, bold/italic/underline/strikethrough toggles,
- color picker (palette slots shown as swatches; hex entry allowed),
- alignment, line spacing, bullet style,
- box fill and border,
- size and position inputs (precise EMU or inch entry).

For a shape:

- fill, border, corner radius (if rounded rectangle),
- size, position, rotation.

For a chart placement:

- title override field,
- legend and data label toggles,
- "Edit chart data" button → navigates to chart asset.

### 13.5 Contextual toolbar

A floating toolbar appears above a selected element with the most common actions:

- text box: font size, bold, italic, underline, text color, fill color, alignment
- shape: fill color, border color, border weight
- chart: title override field

Font size inputs in the contextual toolbar should use `font-feature-settings: 'tnum' 1` for numeric alignment (design-guidelines §2.3).

### 13.6 Slide theme and layout override

A **Slide** tab in the right panel (visible when nothing is selected) lets the user:

- switch layout (shows layout picker),
- override background fill for this slide only,
- toggle slide hidden status,
- add/edit speaker notes.

### 13.7 Implementation conventions (project alignment)

- **Numeric size/position fields** (EMU, inches, whole pixels for nudge): use the shared debounced numeric text patterns ([`DebouncedNumericTextField`](../src/components/common/DebouncedNumericTextField.tsx) / [`useDebouncedNumericDraft`](../src/hooks/useDebouncedNumericDraft.ts) in the app codebase), not raw `type="number"` with coerced integers, so intermediate drafts like empty or `-` remain valid while editing.
- **Layout picker and combobox UIs:** While a suggestion list is open, **Tab** commits the highlighted option (Excel-style); do not move focus to the next control unless there is nothing to complete.
- **Text boxes vs drag:** Start **drag** only after the pointer moves beyond a small threshold from `pointerdown`; use **double-click** to enter text edit mode on the same surface so drag does not block selection or double-click (see project draggable-editable-text conventions).

### 13.8 Default new-slide layout and edit hierarchy (authoring v1)

- **New slides:** The theme field `default_new_slide_layout_id` selects which layout is applied when the user adds a slide from the slide list or layouts panel (not necessarily `layouts[0]`).
- **Canvas selection:** Implementation uses a single selection union: slide element (`kind: slide`), layout placeholder (`kind: layout`), or theme master element (`kind: theme`). Clicking empty space clears selection; **Escape** clears selection when focus is not in an editable control. **Delete** / **Backspace** removes the selected slide-owned element (`kind: slide`) from the slide when focus is not in an editable control; static Salary Variance overview slides follow the same edit restrictions as insert operations.
- **In-place text:** Only slide-layer `text_box` elements (including materialized placeholders) are edited on the canvas. **Double-click** a slide text box to edit; **double-click** a layout text placeholder with no slide instance yet **materializes** a slide `text_box` with `layout_element_id` pointing at the placeholder and opens edit.
- **Non-editable regions:** Layout-only and theme-only hits do not open in-place edit; the UI may show a delayed tooltip: **“Only editable from Layout”** or **“Only editable from Theme”** (see implementation `SlideAuthoringCanvas`).

### 13.9 Canvas selection tab order (keyboard)

- **Delete / Backspace:** When a slide-owned element is selected (`kind: slide`) and focus is **not** in an editable field, remove that element from the slide (`removeSlideElement`). Does not apply to layout or theme selections. Salary Variance overview slides: same guard as adding elements (no removal via this shortcut when the layout is the static overview).
- **Tab / Shift+Tab:** When a single canvas object is selected and focus is **not** in an editable field (`input`, `textarea`, `contentEditable`, etc.), **Tab** moves selection to the **next** object in the canonical order; **Shift+Tab** moves to the **previous** object (wrap at ends). This order is **not** stored on the document; it is derived at runtime (see `slideAuthoringTabOrder` in the codebase).
- **Canonical order:** (1) theme `master_elements` with `locked === false`, sorted by `z_index` ascending; (2) layout elements, same sort, **excluding** layout placeholders that are overridden by a slide element via `layout_element_id`; (3) slide elements with `hidden === false`, sorted by `z_index` ascending. Same layer stacking as §14.1 (theme → layout → slide), back-to-front within each layer.
- **When Tab does not cycle selection:** Focus inside an editable control (native Tab moves focus); when a combobox suggestion list is open, **Tab** commits the highlighted option per §13.7; with **no** selection, Tab does not auto-select (avoids surprising focus). Static/marketing slide surfaces that do not use the data-driven canvas may omit this behavior.
- **No schema change:** Ordering uses existing `z_index` and layer membership only.

---

## 14. Rendering and export

### 14.1 Render order

This section is the **implementation paint order** (back to front). It matches the stacking described in §2 (read there as front-to-back).

When compositing a slide for display or export:

1. Render theme background fill.
2. Render theme master elements in `z_index` order.
3. Render layout background fill override (if set), overwriting theme background.
4. Render layout elements in `z_index` order.
5. Render slide background fill override (if set), overwriting both.
6. Render slide elements in `z_index` order.

### 14.2 Dynamic field resolution

Before rendering, resolve all `SpecialRunKind` fields:

- `slide_number` → `slide.order_index` (counting only visible slides, or all slides — configurable per document),
- `total_slides` → count of non-hidden slides,
- `slide_number_of_total` → `"{order_index} / {total}"`,
- `date_auto` → current date formatted per document locale,
- `date_fixed` → stored at authoring time; not updated on render,
- `document_title` → `document.name`,
- `section_title` → scan backward through slides for the nearest slide using a Section Divider layout; use its title placeholder text.

### 14.3 Export targets (v1)

- **In-app viewer**: rendered to HTML/SVG/Recharts for interactive viewing. Charts remain interactive (tooltips, hover) within the chart surface. **Data-level filters** (slicing series, semantic query UI) live in the **data model** / chart preview flows unless the product adds on-slide filter chrome later; do not assume dashboard-style filter widgets on the slide canvas in v1.
- **PDF export**: slide canvas rasterized or SVG-serialized per slide; charts rendered as static SVG snapshots. Dynamic fields resolved at export time.

PowerPoint (.pptx) export is a **v2 candidate** — it requires OOXML generation and is out of scope for v1.

---

## 15. Open questions with tentative answers

1. **Q: Should speaker notes support rich text (bullets, links) or plain text only?**
   A: Plain text in v1. Rich notes are a v2 candidate.

2. **Q: Should slide reordering be tracked in an `order_index` column (integer sequence) or a linked-list model?**
   A: Integer sequence for v1. Gaps should be closed on every reorder operation. Linked-list avoids full-table rewrites but adds complexity; revisit at scale.

3. **Q: Should chart placements support a local data filter override (e.g. "show only this segment on this slide")?**
   A: Not in v1. Chart assets are global; local overrides belong in separate chart assets. This is consistent with the data-model-first philosophy.

4. **Q: Should the slide panel support named sections (groups of slides) like PowerPoint's Section feature?**
   A: No in v1; defer PowerPoint-style sections to v2 if needed.

5. **Q: Should table cells support series data binding (live values from series assets)?**
   A: No.

---

## 16. Summary

The object hierarchy is:

- **Theme** → document-wide brand: colors, fonts, bullets, master elements (v1: one theme per document via `documents.default_theme_id`; §4.0)
- **Slide Layout** → named template with typed placeholder slots
- **Slide** → concrete page with 1-based ordering, layout assignment, and owned elements
- **Slide Elements** → text boxes, shapes, chart placements, images, tables — all sharing a common layout box (x, y, width, height, z_index) with type-specific `spec` payloads

The design deliberately mirrors PowerPoint's three-tier model so that consultants building decks encounter a mental model they already know: master → layout → slide. The key difference from PowerPoint is that **charts are not embedded** in slides — they are global chart assets placed by reference, keeping data logic in the data model where it belongs.

Semantic series, formulas, and chart asset tables remain specified in the [semantic series and chart authoring spec](../taxonomy-and-data-covenants/semantic-series-charting-spec.md); this document layers the full slide deck schema and UX on top.
