import json
from pathlib import Path

DARK_MD = r'''# Design System Specification: The Architectural Dark Mode

## 1. Overview & Creative North Star: "The Obsidian Architect"

The Creative North Star for this design system is **The Obsidian Architect**. In a world of generic, flat dark modes, this system rejects the "floating box" template in favor of a structured, monolithic experience. It treats the UI not as a screen, but as a physical space carved from deep slate and charcoal.

We move beyond "Enterprise Clean" by embracing **Tonal Depth** and **Intentional Asymmetry**. Instead of centering everything, we use the `manrope` display type to anchor layouts to a strong left-axis, utilizing wide-open gutters and varying surface elevations to guide the eye. The goal is an interface that feels like a high-end command center: authoritative, whisper-quiet, and immaculately organized.

---

## 2. Colors & Surface Philosophy

The palette is rooted in the deep "void" of `#101417`, using cold slate tones to define structure.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. To separate a sidebar from a main content area, or a header from a body, you must use a background shift.
*   **Example:** Place a `surface-container-low` (#181c1f) sidebar against a `surface` (#101417) main body. The "line" is created by the eye at the point where the two tones meet.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested obsidian slabs.
*   **Base Layer:** `surface` (#101417)
*   **In-Page Sections:** `surface-container-low` (#181c1f)
*   **Interactive Cards:** `surface-container` (#1c2023)
*   **Raised Modals/Popovers:** `surface-container-highest` (#313539)

### The "Glass & Gradient" Rule
To prevent the UI from feeling "dead," use **Glassmorphism** for floating elements (like navigation bars or hovering tooltips). Use `surface-container-high` at 70% opacity with a `20px` backdrop-blur.
For the signature `#0F62FE` blue, avoid flat fills on large areas. Use a subtle linear gradient from `primary-container` (#0F62FE) to `on_secondary` (#0e2b6f) at a 135-degree angle to add a "lithium glow" effect.

---

## 3. Typography: Editorial Authority

We use a dual-typeface system to balance technical precision with premium editorial flair.

*   **Display & Headlines (Manrope):** This is your "voice." Use `display-lg` and `headline-lg` with tight letter-spacing (-0.02em) to create a sense of compressed power. Headlines should be `on_surface` (#e0e3e7) to ensure they pierce the dark background.
*   **Body & Labels (Inter):** This is your "utility." Inter is used for high-density data and long-form reading. Use `body-md` (0.875rem) for standard text.
*   **The Hierarchy Rule:** Never use two font sizes that are only 1px apart. Jump from `label-md` (0.75rem) straight to `body-md` (0.875rem) to ensure the hierarchy is undeniable.

---

## 4. Elevation & Depth

In "The Obsidian Architect," depth is felt, not seen.

*   **Tonal Layering:** Avoid shadows for static elements. If a card needs to stand out, move it from `surface-container` to `surface-container-high`.
*   **Ambient Shadows:** For floating modals, use a "Tinted Shadow." Instead of black, use a shadow color derived from `surface-container-lowest` (#0b0f12) with a 64px blur and 40% opacity. This creates a soft "weight" rather than a harsh outline.
*   **The "Ghost Border" Fallback:** In high-density data tables where boundaries are essential for accessibility, use the "Ghost Border." Apply `outline-variant` (#424656) at **15% opacity**. It should be barely visible—a suggestion of a boundary, not a cage.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (Primary-Container to Secondary-Container). `rounded-md` (0.375rem). Text is `on_primary_container` (#f3f3ff).
*   **Secondary:** No fill. "Ghost Border" (#424656 at 20%) with `on_surface` text.
*   **Tertiary:** Text-only. Use `primary` (#b4c5ff) color to signify interactivity without visual bulk.

### Input Fields
*   **State:** Background should be `surface-container-lowest` (#0b0f12).
*   **Focus:** Do not just change the border. Change the background to `surface-container-high` and add a 1px `primary_container` (#0F62FE) bottom-border only. This mimics a "docked" architectural element.

### Cards & Lists
*   **The "No-Divider" Rule:** Forbid the use of horizontal rules (`<hr>`). Separate list items using `spacing-4` (0.9rem) of vertical whitespace. If separation is visually impossible, use a subtle background toggle between `surface-container-low` and `surface-container`.

### Data Visualization (Signature Component)
*   **The "Glow Trace":** For line charts, use the `#0F62FE` primary color with a 4px outer glow (drop-shadow) of the same color at 30% opacity. This makes the data appear as if it is being projected onto the obsidian surface.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical padding. Give the left side of a container more "breath" (e.g., `spacing-10`) than the right to create an editorial feel.
*   **Do** use `primary-fixed-dim` (#b4c5ff) for icons within containers to prevent them from "vibrating" against the dark background.
*   **Do** embrace the void. Large areas of empty `surface` (#101417) are a sign of luxury, not a lack of content.

### Don't:
*   **Don't** use pure white (#FFFFFF) for body text. Always use `on_surface` (#e0e3e7) to reduce eye strain and maintain the "slate" aesthetic.
*   **Don't** use standard Material Design elevation shadows. If it looks like it's "pasted on" the background, increase the blur and lower the opacity until it feels "integrated."
*   **Don't** use 100% opaque borders. They break the illusion of the monolithic obsidian surface.
'''

LIGHT_MD = r'''# Design System Specification: The Architectural Intelligence

## 1. Overview & Creative North Star
**The Creative North Star: "The Precision Architect"**

This design system moves beyond the generic "SaaS Dashboard" to create a high-end, editorial environment for data storytelling. It is designed for users who require the authority of an enterprise tool with the sophisticated clarity of a luxury publication.

We break the "template" look by rejecting rigid, boxy grids in favor of **Intentional Asymmetry and Tonal Depth**. Instead of containing data within heavy borders, we allow information to breathe on layered surfaces. The system relies on "The Precision Architect" philosophy: every pixel serves a functional purpose, but the overall aesthetic feels like a high-end physical workspace—clean, organized, and quietly powerful.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a high-contrast relationship between **Primary Action Blue (#004CCD)** and a tiered architectural grayscale.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment.
Boundaries must be defined solely through:
*   **Background Color Shifts:** Use `surface-container-low` (#f1f4f6) sections against a `background` (#f7fafc) to define zones.
*   **Tonal Transitions:** A clean break from a `surface-container-lowest` (#ffffff) card to a `surface-container` (#ebeef0) sidebar is all the definition required.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create "nested" depth:
*   **Level 0 (Base):** `surface` (#f7fafc) - The infinite canvas.
*   **Level 1 (Sub-section):** `surface-container-low` (#f1f4f6) - Used for grouping minor controls or secondary navigation.
*   **Level 2 (The Work):** `surface-container-lowest` (#ffffff) - Reserved for the "Slide Canvas" or primary data entry points. This provides maximum contrast for data visualization.
*   **Level 3 (Focus):** `surface-container-high` (#e5e9eb) - Used for active side-panels or inspector tools.

### The "Glass & Signature" Rule
To elevate the "Action Blue," use subtle linear gradients rather than flat fills for primary CTAs. Transition from `primary` (#004ccd) to `primary_container` (#0f62fe) at a 135° angle. This adds a "lithographic" quality to the action points. For floating modals, apply a **Backdrop Blur (12px)** to semi-transparent surface colors to keep the user grounded in their data context.

---

## 3. Typography: Editorial Authority
We pair the geometric confidence of **Plus Jakarta Sans** with the industrial precision of **IBM Plex Sans**.

*   **Display & Headlines (Plus Jakarta Sans Bold):** These are your "Anchors." Use `display-md` and `headline-lg` with tight letter-spacing (-0.02em) to create an authoritative, editorial feel. These should feel like titles in a high-end financial report.
*   **Body & UI (IBM Plex Sans):** The "Workhorse." Used for data tables, labels, and input fields. Its monospaced-influenced terminals ensure that numerical data remains perfectly legible and aligned.
*   **Functional Labels:** Use `label-sm` (0.6875rem) in `on_surface_variant` (#424656) for metadata. This small, sharp type provides a professional "technical drawing" aesthetic.

---

## 4. Elevation & Depth: The Layering Principle
We reject the heavy, muddy shadows of the early 2010s. Depth is achieved through **Tonal Layering** and **Ambient Light**.

*   **Ambient Shadows:** For floating elements (menus, tooltips), use a highly diffused shadow: `0 8px 32px rgba(18, 22, 25, 0.06)`. Note the use of `on_surface` (Deep Charcoal) as the shadow tint—never use pure black.
*   **The "Ghost Border" Fallback:** If accessibility requirements demand a container edge, use a Ghost Border: `outline-variant` (#c3c6d8) at **15% opacity**. It should be felt, not seen.
*   **Interactive Lift:** On hover, a card should not grow larger; it should transition from `surface-container-lowest` to `surface-container-low`, signaling a physical press into the surface.

---

## 5. Components: Precision Primitives

### Buttons & Chips
*   **Primary Button:** 4px radius. Background: Gradient (`primary` to `primary_container`). Text: `on_primary` (#ffffff). Padding: `2.5` (0.5rem) x `5` (1.1rem).
*   **Selection Chips:** Forbid the use of outlines. Use a `secondary_container` (#d9e3f1) background with `on_secondary_container` (#5b6571) text. When selected, switch to `primary` with white text.

### Input Fields
*   **The "Underline" Approach:** For a premium presentation builder, use "Ghost Inputs." No bounding box; only a 1px `outline_variant` at the bottom of the field. Upon focus, this expands to a 2px `primary` underline.
*   **Error States:** Use `error` (#ba1a1a) text with a `error_container` (#ffdad6) soft background wash behind the entire input row.

### Lists & Cards (The "No-Divider" Rule)
*   Forbid 1px horizontal dividers between list items. Instead, use a vertical spacing of `spacing.3` (0.6rem).
*   Separate content blocks using a background shift to `surface_container_low` or by utilizing `headline-sm` typography to create a clear visual break.

### The "Data-Canvas" Component
*   The primary presentation area must be `surface-container-lowest` (#ffffff).
*   Surround the canvas with a `surface-dim` (#d7dadc) 1px "safe zone" to simulate the edge of a physical page.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a structural element. If an interface feels cluttered, increase spacing to `spacing.8` (1.75rem) before adding a line.
*   **DO** use `tertiary` (#006526) for positive data trends. It should be used sparingly, like a highlighter on a technical spec.
*   **DO** ensure all interactive elements have a 4px `DEFAULT` roundedness for a crisp, modern "precision tool" feel.

### Don't
*   **DON'T** use 100% black (#000000). Use `on_surface` (#181c1e) for all text to maintain a sophisticated tonal range.
*   **DON'T** use shadows on nested elements. Only "floating" UI (modals/popovers) receives a shadow. Nested elements use background color shifts.
*   **DON'T** use "Action Blue" for non-interactive elements. Blue is a sacred "Action" color in this system.

---

## 7. Spacing Logic
The system uses a strictly enforced **0.2rem (approx. 4px) base scale**.
*   **Component Padding:** Use `2.5` (0.5rem) for tight UI, `4` (0.9rem) for standard containers.
*   **Section Gaps:** Always use `10` (2.25rem) or `12` (2.75rem) to provide the "Editorial" breathing room that defines the brand.
'''

snap = {
    "designSystems": [
        {
            "name": "assets/49c7f87088fb4385a90ab547b9d465e7",
            "version": "1",
            "designSystem": {
                "displayName": "Enterprise Midnight",
                "theme": {"colorMode": "DARK", "designMd": DARK_MD},
            },
        },
        {
            "name": "assets/5f390537afc848a5bfbb4d1b9e2db319",
            "version": "1",
            "designSystem": {
                "displayName": "Structure & Logic",
                "theme": {"colorMode": "LIGHT", "designMd": LIGHT_MD},
            },
        },
    ]
}

root = Path(__file__).resolve().parent
(root / "list-design-systems.snapshot.json").write_text(json.dumps(snap, indent=2), encoding="utf-8")

for entry in snap["designSystems"]:
    aid = entry["name"].replace("assets/", "")
    mode = entry["designSystem"]["theme"]["colorMode"]
    md = entry["designSystem"]["theme"]["designMd"]
    (root / f"design-md-{aid}-{mode.lower()}.md").write_text(md, encoding="utf-8")

print("wrote list-design-systems.snapshot.json and design-md-*.md")
