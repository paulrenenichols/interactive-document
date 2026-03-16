# Login and sign-up improvements

## Summary

Improve the login and sign-up experience so users can onboard smoothly and return without friction. Scope covers flows, validation, errors, optional social/OAuth, session handling, and first-time vs returning user experience.

## Current state

(To be filled from codebase: existing auth routes, components, and backend hooks. Document what exists today so gaps are clear.)

## Supporting design specs

The exploration includes concrete design specs and reference implementations in supporting-docs:

- **[auth-screens-design-1.tsx](../../supporting-docs/auth-screens-design-1.tsx)** — Login screen: full-screen centered layout, MUI Card with shadow/rounded corners, TextField (email, password), primary "Sign in" button, links for "Forgot password?" and "Create account." Uses react-hook-form, TanStack Query mutation, Fade entry. Optional Google OAuth called out.
- **[auth-screens-design-2.md](../../supporting-docs/auth-screens-design-2.md)** — Sign-up screen: same card/layout system; fields email, password, confirm password; "Create account" CTA; "Already have an account? Sign in" link. Same stack (react-hook-form, TanStack Query, Fade).
- **[theme.md](../../supporting-docs/theme.md)** — Semantic theme tokens (light/dark) for consistent auth screen styling; use `--color-background`, `--color-surface`, `--color-primary`, etc. so login/register match the rest of the app.

Implementations should align with these specs (centered card, clear hierarchy, loading/error states, dark mode) and use the shared theme tokens.

**From the supporting designs (committed for implementation):**

- **Login:** Full-screen centered layout; MUI Card (shadow, rounded-xl, max-w-sm); fields Email, Password; primary "Sign in" button (full width, large); secondary links "Forgot password?" and "Create account." Fade-in entry (400ms). react-hook-form + TanStack Query mutation; loading state on submit; inline errors via helperText.
- **Sign up:** Same card/layout; fields Email, Password, Confirm password (with match validation); "Create account" CTA; "Already have an account? Sign in" link. Same stack and behavior.
- **Shared:** Optional Google OAuth (outlined button) to reduce signup friction. Dark mode and theme tokens per theme.md.

## Proposed scope

- **Sign-up flow:** Email/password sign up with validation (strength, confirm, email format) per the design above. Clear error messages and optional “terms accepted” / consent. Consider progressive disclosure (e.g. minimal fields first, then profile).
- **Login flow:** Email/password login with “forgot password” and optional “remember me.” Error states for wrong password, unverified email, account locked, etc. (Design details above.)
- **Social / OAuth (optional):** If desired, “Sign in with Google” (or other providers) and account linking. Document UX and edge cases (e.g. same email, different providers).
- **Session and “remember me”:** How long sessions last, refresh behavior, and what “remember me” changes. Impact on UX (e.g. redirect after login, deep links).
- **First-time vs returning:** Post-sign-up onboarding vs direct entry to app; returning user landing (e.g. last deck, dashboard). Any welcome or empty-state copy.
- **Security and UX:** Rate limiting, CAPTCHA, or other abuse prevention only insofar as they affect flow and copy.

## Out of scope (for this feature set)

- Backend auth implementation (tokens, hashing, DB schema) except where it directly affects flow design and error handling.
- Full identity-provider integration details; document UX and product decisions here; implementation can be a separate phase.

## Open questions

- Which auth providers (if any) are in scope for v1?
- Is email verification required before first use?
- Should “remember me” be default on or off?
- Where does the user land after sign-up vs after login (same or different)?

## References

- Supporting-docs auth designs and theme (see [Supporting design specs](#supporting-design-specs) above).
- Existing auth-related routes and components (to be linked after audit).
- Any existing _docs on user flows or auth (to be linked if present).
