# Phase: Polish (03-post-mvp)

Scope and goals for post-MVP improvements: additional chart types, axis/labels, and optional export. Enhances the viewer and editor without changing core architecture.

---

## Scope

- **Charts:** Add chart types beyond bar (e.g. line, pie, area) using Recharts; same tooltip and data-binding pattern. Improve axis labels, legends, and styling per theme.
- **Optional export:** If in scope, add export path (e.g. PDF or static image of slides); otherwise defer.
- **UX polish:** Any agreed improvements to editor or viewer (e.g. transitions, accessibility, loading states) that were deferred from MVP.

---

## Goals

- Users can choose multiple chart types for chart blocks; charts look consistent and readable.
- Optional: export deck/slides to a shareable format. Otherwise document as future work.

---

## Out of scope

- Email verification, refresh tokens, or new auth flows (see auth future work).
- Real-time collaboration or binary Excel upload (per overview out-of-scope).
