# Presentation / slide mode

## User goal

Minimal chrome fullscreen (or near-fullscreen) experience for presenting slides.

## Canonical reference

- **Light:** `html/presentation-mode-54f081aa.html`, `screenshots/presentation-mode-54f081aa.jpg`.
- **Dark:** `presentation-mode-dark-8b471b8a.*`.

## MUI mapping (draft)

- `Box` / `Stack` for slide viewport; optional bottom `Toolbar` or auto-hide controls.
- **Controls:** `IconButton`, `Typography` for slide index / title.

## Tailwind / tokens (draft)

- Prefer near-black or deep slate background in dark (Enterprise Midnight `surface`); high contrast slide surface `#fff` or tokenized `bg-slide` equivalent.

## Open questions

- Transitions, laser pointer, speaker notes — not in static Stitch export; milestone scoping required.
