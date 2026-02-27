# UI rules — Interactive Presentation App

Design principles and interaction guidelines for the application. Aligns with [project overview](../project-overview/overview.md), [user flow](user-flow.md), and [tech stack](tech-stack.md). Use these rules when building components and layouts.

---

## Design principles

- **Clarity over decoration** — Prioritize readable content and clear actions. Avoid visual noise that distracts from slides and charts.
- **Consistent patterns** — Reuse the same patterns for navigation, selection, and feedback across editor and viewer so users learn once.
- **Progressive disclosure** — Show only what's needed in context (e.g. properties panel shows options for the selected block; viewer shows one slide at a time).
- **Accessible by default** — Keyboard navigation where it matters (viewer, forms); sufficient contrast and focus states; semantic structure for screen readers.

---

## Layouts

### Editor (`/edit/[...deckId]`)

- **Three main areas:** Slide list (sidebar), canvas (current slide), properties panel. Relative widths are implementation-defined; ensure the canvas remains the focus.
- **Slide list:** Ordered list of slides; click to switch slide; support add/remove/reorder. Indicate current slide. Keep labels short (e.g. "Slide 1", or first block title if available).
- **Canvas:** Renders the current slide with all blocks (text and chart). Blocks are selectable; selection drives the properties panel. Support add block (e.g. toolbar or right-click). Layout can be grid or position/size per overview.
- **Properties panel:** Contextual to the selected block. For text blocks: content and formatting. For chart blocks: data source picker, column mapping, chart type. When nothing is selected, show deck/slide-level options or a short hint.

### Viewer (`/view/[deckId]`)

- **Full-screen:** One slide at a time; minimal chrome so the slide content is dominant.
- **Navigation:** Next/previous (buttons and/or keyboard: e.g. Arrow keys, Space). Optional: slide progress (e.g. dots or "3 / 10") and optional slide list drawer.
- **Charts:** Same chart components as editor, read-only. Hover tooltips show underlying data; no edit controls.

### Landing, login, register

- **Landing:** Clear entry points to Login, Register, and (if applicable) "Open view link". If the user is authenticated, redirect or show deck list/dashboard.
- **Login / Register:** Simple forms; clear labels, errors, and primary action. Link between login and register. After success, redirect per user flow (return URL or default).

---

## Component behavior

- **Buttons and links:** Primary action visually distinct; destructive actions (e.g. delete) use a separate style and, where appropriate, confirmation.
- **Forms:** Validate on submit (and optionally on blur). Show inline or summary errors; do not clear errors until the user corrects or resubmits.
- **Loading and errors:** Show loading state for async operations (e.g. spinner or skeleton). On API error (401/403/404), show a clear message and a next step (e.g. "Back to decks", "Log in").
- **Selection:** In the editor, selected block is clearly indicated (e.g. border, handle, or highlight). Single selection unless multi-select is added later.

---

## Responsiveness and device focus

- **Editor:** Optimized for desktop (mouse and keyboard). Smaller screens may use a collapsible sidebar or stacked layout; avoid assuming touch-only for authoring.
- **Viewer:** Usable on desktop and tablet; support keyboard and pointer. Mobile: ensure next/prev and tooltips work; layout may scale or simplify.
- **Landing/auth:** Responsive forms and layout so login/register work on common viewport sizes.

---

## Motion and animation

- **MVP:** Subtle transitions only (e.g. panel open/close, slide change in viewer). No requirement for heavy animation.
- **Slide change (viewer):** Optional simple transition (fade or slide); can be none for initial release.
- **Accessibility:** Respect `prefers-reduced-motion` where transitions are applied.

---

## Alignment with tech stack

- **Next.js App Router:** Use client components for editor, viewer, and any interactive form; server components for static shells where useful.
- **Charts:** Recharts as per [tech-stack](tech-stack.md); custom tooltip component for hover data. Keep chart config (axis, colors) consistent with [theme-rules](theme-rules.md).
- **No specific component library** is mandated; choose one (e.g. Radix, Headless UI, or custom) and apply these rules for consistency.

Update this document if new layouts (e.g. dashboard, settings) or interaction patterns are introduced.
