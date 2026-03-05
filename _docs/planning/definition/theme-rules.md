# Theme rules — Interactive Presentation App

Theming foundation: colors, typography, spacing, and tokens so the UI is consistent across editor, viewer, and auth. Aligns with [project overview](../project-overview/overview.md), [user flow](user-flow.md), [tech stack](tech-stack.md), and [UI rules](ui-rules.md).

---

## Design direction

- **Style:** Minimalist and content-first. Slides and charts are the focus; chrome (nav, panels) stays unobtrusive. Suited for presentations and data-heavy slides.
- **Theme mode:** Support **light** and **dark**. Default can be system (`prefers-color-scheme`) or user preference; apply via a class on the root (e.g. `data-theme="light"` or `dark`) and CSS variables so components stay consistent.

---

## Color palette

Define semantic tokens; map them to concrete values per theme (light/dark).

- **Background**
  - `--bg-primary`: Main app background (e.g. editor, viewer chrome).
  - `--bg-secondary`: Panels, sidebars, cards.
  - `--bg-slide`: Canvas/slide background in editor and viewer (often white or near-white in light; dark gray in dark).
- **Text**
  - `--text-primary`: Primary content.
  - `--text-secondary`: Labels, hints, metadata.
  - `--text-muted`: Placeholders, disabled.
- **Borders**
  - `--border-default`: Dividers, panel edges.
  - `--border-focus`: Focus ring (keyboard/screen reader).
- **Interactive**
  - `--accent-primary`: Primary buttons, links, selection highlight.
  - `--accent-primary-hover` / `--accent-primary-active`: Hover and active states.
  - `--accent-destructive`: Delete, danger actions.
- **Charts**
  - `--chart-series-1` … `--chart-series-n`: Reusable series colors so charts match the theme. Use a small set (e.g. 4–6) and cycle if needed.
- **Semantic**
  - `--success`, `--warning`, `--error`: Inline messages, validation, alerts.

All values should meet contrast requirements (e.g. WCAG AA) for text on background.

---

## Typography

- **Font stack:** One primary stack for UI and slide content (e.g. system UI or a single web font). Optional separate stack for slide titles if desired. Prefer readable, neutral typefaces.
- **Scale:** Use a consistent scale (e.g. 0.75rem, 0.875rem, 1rem, 1.125rem, 1.25rem, 1.5rem) for UI and slide text. Map to tokens (e.g. `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`).
- **Weights:** Regular for body; medium or semibold for labels and buttons; bold for headings and emphasis. Avoid too many weights.
- **Line height:** Slightly relaxed for body (e.g. 1.5); tighter for headings and compact UI.

---

## Spacing and sizing

- **Spacing scale:** Use a consistent scale (e.g. 4px base: 4, 8, 12, 16, 24, 32, 48). Map to tokens (e.g. `--space-1` … `--space-6`) or use a spacing scale from your CSS approach (e.g. Tailwind).
- **Component spacing:** Apply the scale for padding and gaps (e.g. panel padding, gap between slide list items, form field spacing).
- **Slide canvas:** Define a default slide aspect ratio (e.g. 16:9) and max dimensions so the viewer and editor canvas behave predictably.

---

## Implementation

- **CSS variables:** Define all theme tokens as custom properties on `:root` (or a theme wrapper). Switch light/dark by changing the root class/attribute and variable values.
- **Tailwind (if used):** Extend theme in `tailwind.config` with the same tokens so utilities (e.g. `bg-primary`, `text-secondary`) stay aligned. Use dark mode class or media strategy consistently.
- **Recharts:** Pass theme colors into chart config (e.g. stroke/fill from `--chart-series-*`); ensure tooltips and axes use `--text-primary` / `--text-secondary` and `--border-default`.

---

## Summary

- **Light/dark:** Supported via root class and CSS variables.
- **Tokens:** Background, text, border, accent, chart series, semantic.
- **Typography:** One scale and font stack; clear weights.
- **Spacing:** Single scale for padding and gaps.

When adding new components or screens, use these tokens instead of hard-coded colors or spacing so the app stays consistent and theme changes stay manageable.
