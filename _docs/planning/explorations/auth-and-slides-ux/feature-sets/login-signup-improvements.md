# Login and sign-up improvements

## Summary

Improve the login and sign-up experience so users can onboard smoothly and return without friction. Scope covers flows, validation, errors, optional social/OAuth, session handling, and first-time vs returning user experience.

## Current state

(To be filled from codebase: existing auth routes, components, and backend hooks. Document what exists today so gaps are clear.)

## Proposed scope

- **Sign-up flow:** Email/password sign up with validation (strength, confirm, email format). Clear error messages and optional “terms accepted” / consent. Consider progressive disclosure (e.g. minimal fields first, then profile).
- **Login flow:** Email/password login with “forgot password” and optional “remember me.” Error states for wrong password, unverified email, account locked, etc.
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

- Existing auth-related routes and components (to be linked after audit).
- Any existing _docs on user flows or auth (to be linked if present).
