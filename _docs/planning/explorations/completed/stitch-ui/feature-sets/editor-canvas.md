# Editor shell & canvas

## User goal

Edit deck content: slide list, canvas, toolbars, contextual inspectors.

## Canonical reference

- **Light:** `html/editor-canvas-6f568556.html`, `screenshots/editor-canvas-6f568556.jpg`.
- **Dark:** `editor-canvas-dark-ccfc48b5.*` — inspect panel density and sidebar treatment; do not fork layout without explicit product approval.

## MUI mapping (draft)

- **Shell:** `AppBar`, `Drawer` (slide list / thumbnails), main `Box` workspace.
- **Canvas:** “slide” surface as `Paper` or neutral `Box` with token border using `outline` / subtle `surface_dim` treatment from light spec.
- **Toolbars / menus:** `IconButton`, `Menu`, `Divider` (sparingly — Stitch discourages heavy dividers).
- **Dialogs / popovers:** `Dialog`, `Popover` with glass-style backdrop if milestone requires visual parity.

## Tailwind / tokens (draft)

- Apply **surface hierarchy** from Structure & Logic (`surface`, `surface-container-low`, `surface-container-lowest` for canvas).
- Map Stitch **Action Blue** gradients to product accent strategy (see `tailwind-mui-alignment.md`).

## Open questions

- Docked vs floating inspector — confirm against current app architecture before milestone.
