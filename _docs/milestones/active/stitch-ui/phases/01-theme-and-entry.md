# Phase 1: Theme and entry (stitch-ui)

Reconcile **Structure & Logic** (light) and **Enterprise Midnight** (dark) tokens with `libs/material-ui/src/theme.css` and app theming; ship **marketing landing** and **authentication** to the canonical light layouts with `.dark` driven by variables (not alternate IAs).

## Scope

- Token gaps: surfaces, text hierarchy, accent strategy vs Stitch JSON / design-md narratives; document decisions in progress doc.
- **Landing:** single scroll story; avoid duplicating dark-only marketing IA (see exploration `marketing-landing.md`).
- **Auth:** card-centered sign-in; field styling consistent with product (underline vs filled per exploration).

## References

- Exploration: [marketing-landing.md](../../../../planning/explorations/completed/stitch-ui/feature-sets/marketing-landing.md), [authentication.md](../../../../planning/explorations/completed/stitch-ui/feature-sets/authentication.md), [stitch-baseline.md](../../../../planning/explorations/completed/stitch-ui/supporting-docs/stitch-baseline.md), [tailwind-mui-alignment.md](../../../../planning/explorations/completed/stitch-ui/supporting-docs/tailwind-mui-alignment.md).
