# Design System Specification: The Precision Ledger

## 1. Overview & Creative North Star
**Creative North Star: The Precision Ledger**
This design system is built for the high-performance architect—users who balance massive data sets with the need for editorial clarity. We are moving away from the "clunky spreadsheet" aesthetic toward a "Sophisticated Command Center." By marrying the dense, utilitarian nature of 'Office-native' tools with the airy, high-contrast world of premium editorial design, we create an environment that feels both authoritative and effortless.

The system breaks the "template" look through **intentional tonal depth** and **asymmetric focus**. We do not rely on borders to define space; we rely on the weight of the surfaces themselves. The interaction of the deep App Chrome Dark Navy against the vibrant Primary Orange-Red creates a visual pulse that guides the user through complex document authoring workflows.

---

## 2. Colors
Our palette is a study in high-contrast utility. It uses dark anchors to recede and vibrant "signals" to draw the eye to critical data points.

*   **Primary (#b32006 / #E8472A):** The "Signal." Use this for primary actions and critical status. To add "soul," primary CTAs should utilize a subtle linear gradient from `primary` to `primary_container`.
*   **App Chrome (#0D1526):** The "Anchor." This provides the structural weight. It is used for the fixed 48px top bar and 220px sidebar to create a "frame" for the user's work.
*   **Surface Neutrals:** A sophisticated range from `surface_container_lowest` (#ffffff) to `surface_dim` (#d9dadc).

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. Structural boundaries must be defined solely through background color shifts. For example, a document authoring area (`surface_container_lowest`) should be distinguished from the surrounding workspace (`surface_container_low`) by its tonal shift, not a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
1.  **Level 0 (Base):** `surface` (#f8f9fb)
2.  **Level 1 (Panels):** `surface_container_low` (#f3f4f6)
3.  **Level 2 (Active Workspaces/Cards):** `surface_container_lowest` (#ffffff)
4.  **Level 3 (Popovers/Contextual):** Glassmorphism (see Elevation).

---

## 3. Typography
We use a dual-typeface system to separate UI management from logic execution.

*   **UI & Titles (Poppins / Plus Jakarta Sans):** Used for all interface elements. The geometric nature of these fonts provides a modern, "web-native" feel that softens the high-density layout.
    *   *Display/Headline:* Use for dashboard headers to provide editorial "breathing room."
    *   *Title/Label:* Used for the 32px inputs and buttons to ensure legibility at small scales.
*   **Logic & Formulas (JetBrains Mono):** This is our "Power User" typeface. Any time a user is writing a formula, reviewing data strings, or looking at raw metrics, we shift to JetBrains Mono. This visual "mode switch" alerts the user that they are in an "Authoring" state rather than a "Navigation" state.

---

## 4. Elevation & Depth
In this design system, depth is a function of light and layering, not structural lines.

*   **The Layering Principle:** Stacking surface-container tiers. To lift a card, do not add a shadow immediately; place a `surface_container_lowest` object on a `surface_container_low` background. The contrast creates a soft, natural lift.
*   **Ambient Shadows:** When an element must "float" (e.g., a contextual 280px right panel during a transition), use a shadow with a large blur (24px+) at 4%–8% opacity. The shadow color must be a tinted version of `on_surface` (#191c1e) to mimic natural light.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility in high-density tables, use `outline_variant` at 15% opacity. Never use 100% opaque borders.
*   **Glassmorphism:** The 280px contextual right panel should utilize a backdrop-blur (12px) with a semi-transparent `surface_container_highest`. This allows the underlying data to "bleed through," preventing the UI from feeling claustrophobic.

---

## 5. Components

### Buttons & Inputs (The 32px Standard)
To achieve high density without losing touch-target integrity, we adhere to a 32px height standard for all primary UI controls.
*   **Primary Button:** `primary` gradient fill, 4px (`DEFAULT`) border radius, `label-md` typography.
*   **Input Fields:** `surface_container_lowest` fill with a `Ghost Border` (outline-variant @ 20%). On focus, the border transitions to `primary` at 100% opacity.
*   **Compact Density:** Maintain 8px (`spacing-4`) between related input groups, but use 4px (`spacing-2`) for label-to-input relationships.

### Selection & Highlighting
*   **Selection State:** Use Selection Light Steel Blue (#B8C8E8 / `secondary_container`) for row highlighting and multi-select backgrounds. It provides a soft contrast against the navy chrome and orange-red accents.

### Cards & Lists
*   **No Dividers:** Forbid the use of 1px lines between list items. Use vertical white space (either `spacing-2` or `spacing-3`) or alternating subtle shifts in surface color to separate content.

### Slide deck samples
Precision Ledger slide deck previews (e.g. Salary Variance) render footer document labels via the `document_title` special run so the line matches the app document name, not a hardcoded placeholder string.

### Slide authoring keyboard (canvas)
When the slide deck tab is active and focus is **not** in an editable field (`input`, `textarea`, `contentEditable`, etc.):
- **Delete** / **Backspace:** removes the selected **slide-owned** element (text box, shape, or chart) from the current slide. Layout placeholders and theme master hits are selected for inspection only; removing those instances is done in Layout or Theme editing, not via this shortcut.
- **Escape:** clears canvas selection.
- **Arrow keys:** previous / next slide; **Home** / **End:** first / last slide.
- **Tab** / **Shift+Tab:** cycles selection among canvas objects where the tab-order behavior is enabled (see implementation).

### Slide text (paragraph mode)
- **Enter** starts a new paragraph; **Shift+Enter** inserts a line break inside the current paragraph (see `slide-deck-spec` §7.2).
- **Design** panel: list style (none / bullets / numbers), increase/decrease indent, and font styling align with the Precision Ledger bullet ladder (rem-based indents and four hierarchy levels max).
- **Commit** multi-paragraph text on **blur** or **Escape** (cancel); **Enter** does not commit—use it for paragraphs unless the text box is in single-line mode (e.g. title).

### Charts & Data Viz
Use the sequential palette to maintain "The Precision Ledger" look:
1.  Primary: #E8472A (The Signal)
2.  Secondary: #0D1526 (The Anchor)
3.  Tertiary: #FFC13A (Warning/Caution)
4.  Quaternary: #3A8A28 (Success/Growth)

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetric layouts. If the left sidebar is dark navy (#0D1526), ensure the main stage is bright (#ffffff) to create a clear mental model of "Navigation vs. Creation."
*   **Do** use JetBrains Mono for any numerical data that requires precise alignment (tabular figures).
*   **Do** rely on the 8px grid for layout, but the 4px grid for internal component padding to maintain the "compact" feel.

### Don't
*   **Don't** use 1px solid borders to separate the sidebar from the main stage. Use the color shift between Dark Navy and Surface Gray.
*   **Don't** use "Drop Shadows" on standard cards. Reserve elevation for floating modals or temporary contextual panels.
*   **Don't** use standard 48px or 56px heights for buttons. This is a power-user platform; stick to the 32px compact standard.
*   **Don't** use pure black for text. Use `on_surface` (#191c1e) to maintain the premium editorial feel.