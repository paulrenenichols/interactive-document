# Authentication

## User goal

Sign in (and related flows if mirrored in Stitch).

## Canonical reference

- **Light:** `html/authentication-e75e0dc0.html`, `screenshots/authentication-e75e0dc0.jpg`.
- **Dark:** `authentication-dark-322e3192.*` — token / mood reference; validate fields and copy deltas against light.

## MUI mapping (draft)

- Centered **card** pattern: `Card`, `CardContent`, `TextField`, `Button`, `Typography`, `Link`.
- Optional `Fade` / motion consistent with app auth routes (see completed auth exploration patterns).

## Tailwind / tokens (draft)

- Page backdrop: `--color-bg-primary` / `--color-bg-secondary` (light); `.dark` equivalent from Enterprise Midnight neutrals in `theme-49c7f87088fb4385a90ab547b9d465e7.json`.
- Inputs: follow Stitch **underline / ghost** spec where product agrees; otherwise M3-filled `TextField` with token colors.

## Open questions

- SSO / OAuth blocks not shown in Stitch — out of scope for pixel parity until milestone adds them.
