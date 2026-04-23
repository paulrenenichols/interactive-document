# Design System Guidelines
## Module 1: Visual Language, Color, Typography & UI Principles

> **Scope**: This document defines the visual design system for an interactive web-based document authoring and viewing platform. Target users are analysts and management consultants with deep Microsoft Office (Excel → PowerPoint) workflows, and likely experience in Power BI, Tableau, or SQL-based BI tooling. The platform blends semantic data modeling with in-place editing. Design philosophy: **low-friction for power users; zero learning curve for Office veterans.**

---

## 1. Color System

### 1.1 Brand Palette (Source of Truth)

| Token | Hex | Name |
|---|---|---|
| `--color-primary` | `#E8472A` | Orange-Red |
| `--color-chrome` | `#0D1526` | Dark Navy |
| `--color-selection` | `#B8C8E8` | Light Steel Blue |
| `--color-warning` | `#FFC13A` | Golden Yellow |
| `--color-success` | `#3A8A28` | Forest Green |
| `--color-secondary` | `#3F6080` | Steel Blue |
| `--color-danger` | `#BC3020` | Brick Red |

### 1.2 UI Role Assignments

These roles govern the interface shell (authoring environment). They are distinct from chart/data series assignments (see Section 1.4).

| Role | Token | Notes |
|---|---|---|
| **App Chrome / Nav** | `--color-chrome` (`#0D1526`) | Sidebar, top bar, modal overlays, panel headers |
| **Primary Action** | `--color-primary` (`#E8472A`) | Buttons (CTA), active tab underlines, selected cell/row indicators |
| **Hover / Selection** | `--color-selection` (`#B8C8E8`) | Row hover, range selection highlight, focus rings — use at 30–50% opacity |
| **Warning / Alert** | `--color-warning` (`#FFC13A`) | Unsaved changes indicator, data type mismatch, schema warning |
| **Success / Positive** | `--color-success` (`#3A8A28`) | Positive delta values, validation pass, connected data source |
| **Error / Negative** | `--color-danger` (`#BC3020`) | Negative delta values, broken data links, validation errors |
| **Muted Labels** | `--color-secondary` (`#3F6080`) | Column headers, axis labels, inactive nav items, helper text |
| **Surface / Background** | `#F4F5F7` | Canvas background (light mode); never pure white |
| **Panel Background** | `#FFFFFF` | Document content area, modals, dropdowns |
| **Border / Divider** | `#D1D9E6` | Grid lines, panel separators, input borders, chart shape preview axis lines |
| **Chart lines** | `#A5AEBD` | For charts (not chart shape preview) axes, tick marks, leader lines on labels |

### 1.3 Derived / Extended Tokens

Agents should compute these from the base palette; do not hardcode:

```
--color-primary-hover:     darken(--color-primary, 10%)       /* Button hover */
--color-primary-ghost:     rgba(--color-primary, 0.08)        /* Ghost button bg */
--color-chrome-muted:      lighten(--color-chrome, 12%)       /* Secondary nav items */
--color-selection-strong:  rgba(--color-selection, 0.55)      /* Active range selection */
--color-warning-bg:        rgba(--color-warning, 0.12)        /* Warning banner bg */
--color-success-bg:        rgba(--color-success, 0.10)        /* Success state bg */
--color-danger-bg:         rgba(--color-danger, 0.10)         /* Error state bg */
```

### 1.4 Chart / Data Series Color Order

Apply in this sequence when assigning series colors. Never skip ahead — always assign sequentially from series 1.

| Series | Token | Hex |
|---|---|---|
| 1 | `--color-primary` | `#E8472A` |
| 2 | `--color-chrome` | `#0D1526` |
| 3 | `--color-warning` | `#FFC13A` |
| 4 | `--color-success` | `#3A8A28` |
| 5 | `--color-secondary` | `#3F6080` |
| 6 | `--color-selection` | `#B8C8E8` |
| 7 | `--color-danger` | `#BC3020` |

**Chart color adjacency rules:**

- Never place `--color-selection` (`#B8C8E8`) adjacent to `--color-chrome` (`#0D1526`) — insufficient contrast.
- Never place `--color-danger` (`#BC3020`) adjacent to `--color-primary` (`#E8472A`) — near-identical hue.
- In pie/donut charts: if series 1 and 7 are both present, ensure they are non-adjacent slices (place a minimum of 2 intervening series between them).
- In stacked bar charts: anchor the base with series 1 (`--color-primary`); place `--color-selection` (`#B8C8E8`) in middle positions, not at the base or top.
- For 2-series charts (e.g. new vs. recurring, invoiced vs. not, headcount splits): always use series 1 + 2 only.

---

## 2. Typography

### 2.1 Font Stack

| Role | Family | Weight | Usage |
|---|---|---|---|
| **UI / Interface** | Poppins | 400 (Regular) | Body text, labels, form inputs, nav items, tooltips |
| **Titles / Headings** | Poppins | 700 (Bold) | Document titles, section headers, panel headings, modal titles |
| **Data / Tabular** | Poppins | 400 | Cell values, axis labels — use tabular-nums feature |
| **Code / Formula** | `'JetBrains Mono', monospace` | 400 | Formula bar, SQL editor, expression fields |

```css
font-family: 'Poppins', sans-serif;
font-feature-settings: 'tnum' 1; /* tabular numerals for data cells */
```

### 2.2 Type Scale

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `--text-xs` | 11px | 400 | 1.4 | Axis tick labels, cell overflow indicators |
| `--text-sm` | 12px | 400 | 1.5 | Table cell content, tooltip text, helper text |
| `--text-base` | 14px | 400 | 1.6 | Default UI text, form labels, nav items |
| `--text-md` | 16px | 600 | 1.4 | Panel subheadings, column headers |
| `--text-lg` | 20px | 700 | 1.3 | Document section headers |
| `--text-xl` | 28px | 700 | 1.2 | Document title |

### 2.3 Typography Rules

- **Never use font sizes below 11px** — analysts frequently work on external monitors at 90–100% zoom; do not assume HiDPI.
- Numeric data in tables and chart axis labels must always use `font-feature-settings: 'tnum' 1` to ensure column alignment.
- Positive deltas: wrap in `--color-success`; negative deltas: wrap in `--color-danger`. Bold weight for delta values.
- Labels on dark chrome backgrounds (`--color-chrome`): use `#FFFFFF` at 90% opacity for primary labels, 55% opacity for secondary/muted.

---

## 3. UI & Interaction Design Principles

### 3.1 Design Philosophy

> **The interface should feel like a refined, web-native version of what Office power users already know.** Every novel pattern must earn its place by being demonstrably faster than the Excel/PowerPoint equivalent. If it isn't faster or clearer, default to the Office convention.

### 3.2 Layout & Chrome

- **Left sidebar**: Primary navigation (pages/tabs, data connections, component library). Fixed width: 220px collapsed to 48px icon rail. Background: `--color-chrome`.
- **Top bar**: Document title (editable in-place), toolbar actions, share/publish controls, user avatar. Height: 48px. Background: `--color-chrome`.
- **Canvas**: Document editing area. Background: `--color-surface` (`#F4F5F7`). Content panels render on `#FFFFFF` with 1px border `--color-border` and 4px border-radius.
- **Right panel**: Contextual property inspector (format, data binding, chart config). Width: 280px. Slides in on element selection; hidden by default. Mirrors Excel's Format Pane / PowerPoint task pane behavior.
- **Formula/Expression bar**: Persistent below top bar when a data-bound cell or expression field is selected. Monospace font. Mirrors Excel formula bar placement exactly.

### 3.3 Grid & Spacing

Use an 8px base grid throughout. Common values:

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-6:  24px
--space-8:  32px
--space-12: 48px
```

- Table cell padding: 4px 8px (matches Excel default cell feel)
- Panel section padding: 16px
- Toolbar button size: 32px × 32px (icon 16px), matching Office ribbon compact mode

### 3.4 Component Conventions

**Buttons**
- Primary: `--color-primary` fill, white Poppins Bold label, 4px radius
- Secondary: white fill, `--color-primary` border + label
- Ghost: transparent, `--color-secondary` label — for toolbar/low-emphasis actions
- Destructive: `--color-danger` fill — always requires confirmation dialog

**Inputs & Form Fields**
- 32px height (compact; matches Excel input row height expectation)
- 1px border `--color-border`; focus ring: 2px `--color-selection`
- Inline validation: error border `--color-danger`, warning border `--color-warning`
- Labels: `--text-sm`, Poppins Regular, `--color-secondary`

**Tables / Data Grids**
- Header row: `--color-chrome` background, white `--text-sm` Poppins Bold labels
- Alternating rows: `#FFFFFF` / `#F4F5F7`
- Row hover: `--color-selection` at 30% opacity
- Selected cell: 2px inset border `--color-primary`, `--color-selection-strong` fill
- Frozen header + frozen first column support required (Excel parity)
- Right-click context menu must include: Insert Row/Column, Delete, Format Cell, Add Data Connection — matching Excel right-click muscle memory

**Tooltips (Chart mouseover)**
- Dark background: `--color-chrome` at 95% opacity, white text
- Border: 1px `--color-secondary`
- Show series color swatch (6×6px circle) before series label
- Value formatting must respect the field's format mask (%, $, decimal places)

**Tabs / Sheet Switcher**
- Bottom of canvas, mirroring Excel sheet tabs
- Active tab: white with `--color-primary` 3px top border
- Inactive tabs: `#E8ECF2` with `--color-secondary` label
- Add sheet button: `+` icon, `--color-secondary`, same row

**Dropdowns & Select Menus**
- Max height: 320px with internal scroll
- Filter/search input at top for lists > 8 items
- Checkboxes for multi-select (matches Excel filter dropdown)

### 3.5 Data Connection & Semantic Layer UI

- Data source connection status: persistent badge in sidebar using `--color-success` (connected), `--color-warning` (stale/refreshing), `--color-danger` (broken).
- **Data sources table** (full-width or panel list; see semantic spec §4.6): columns for **Source type** (distinct icons for **flat file** upload vs **external SQL / gateway** connection), **Source name** (`display_name`, optional subtitle for file or connection), **Row count**, **Field count**, **Estimated memory (KB)** (estimated CSV export size). Use list/tree icon size **14px** where applicable (§3.7).
- Schema/field browser: tree view in sidebar panel. Field type icons: Σ (numeric), ABC (text), 📅 (date), # (integer) — matches Power BI field pane conventions.
- Calculated field / measure editor: full-width modal with monospace editor, syntax highlighting using palette accent colors, and an inline preview panel. SQL and DAX-style expression syntax should both be supported in UX copy/labeling.
- Relationship diagram view: canvas with node-link diagram. Table nodes use `--color-chrome` header with field rows below. Relationship lines: `--color-secondary`. Active/selected relationship: `--color-primary`.

### 3.6 Viewer Mode (Published / Shared URL)

- All authoring chrome (sidebar, top toolbar, formula bar, right panel) is hidden.
- Document renders as a clean paginated layout — equivalent to a PDF view but with live chart interactivity.
- Recharts tooltips and filter widgets remain fully functional.
- Filter controls render as a compact filter bar above content, styled with `--color-chrome` background to visually separate from document content.
- No editing affordances visible; cells are not focusable. Right-click context menu disabled.
- Share URL should support `?filter=field:value` query params that pre-apply filters on load.

### 3.7 Iconography

- Use a single consistent icon library throughout (recommended: Lucide or Phosphor — both have Office-analog icons for common actions).
- Icon size: 16px in toolbars, 14px in lists/trees, 20px in empty states.
- Icons on dark chrome: `#FFFFFF` at 70% opacity inactive, 100% opacity active/hover.
- Do not use filled and outlined variants of the same icon interchangeably — pick one style and apply consistently.

---

## 4. Motion & Feedback

- Transitions should be fast and functional — **not decorative**. This is a productivity tool, not a marketing site.
- Standard transition: `150ms ease-out` for panel open/close, dropdown, tooltip appear.
- Selection state changes (cell selection, tab switch): instant — no transition. Matches Excel behavior.
- Loading states: skeleton shimmer on data grid and chart areas while data is fetching. Use `--color-border` to `#E8ECF2` shimmer range.
- Error states: shake animation (3-cycle, 200ms total) on form submission with validation errors.
- Avoid parallax, scroll-triggered animations, or any motion that competes with data content.

---

## 5. Accessibility & Density

- **Default density**: Compact (matches Office default). All spacing and font sizes above assume compact mode.
- Provide a **Comfortable** density toggle that increases cell padding to 8px 12px and base font to 15px.
- Minimum touch target: 32px (for tablet support; analysts may use Surface devices).
- Color must never be the sole differentiator for status or data — always pair with an icon or label.
- Keyboard navigation must be fully supported. Tab order follows document flow; arrow keys navigate grid cells (Excel parity).
- Focus indicators: 2px solid `--color-primary` outline, 2px offset.

---

## 6. Agent Implementation Notes

- All color values should be implemented as CSS custom properties on `:root`. Components reference tokens, never hardcoded hex values.
- Poppins must be loaded from Google Fonts with `display=swap`. Preload the 400 and 700 weights only.
- The chart palette order in Section 1.4 is the authoritative sequence for any charting library configuration (Recharts, Chart.js, etc.). Implement as a named constant array exported from a theme module.
- Dark mode is **out of scope for v1**. Do not architect for it yet; do not block it either — token usage makes it achievable in a future pass.
- The `--color-chrome` (`#0D1526`) navy is intentionally very dark. On this background, never use `--color-secondary` (`#3F6080`) for text — insufficient contrast. Use white or `--color-selection` only.
