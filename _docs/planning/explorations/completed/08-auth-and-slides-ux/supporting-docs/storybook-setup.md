## Storybook setup for auth and Slides screens

This project already uses Storybook in `apps/frontend` with the `@storybook/nextjs` framework.

### 1. Framework and versions (compatibility)

- **Next.js (app):** `next@16.1.6`
- **React:** `react@19.2.4`, `react-dom@19.2.4`
- **Storybook core:** `storybook@10.2.17`, `@storybook/react@10.2.17`
- **Next.js integration:** `@storybook/nextjs@10.2.17`

According to the `@storybook/nextjs` release notes and compatibility updates, the 10.x line added support for **Next.js 14 and 15**, and subsequent work has focused on handling Next 16 internals as they stabilized. Our setup is on a **10.2.x** release with the official `@storybook/nextjs` framework already configured in `.storybook/main.ts`, and it runs successfully against `next@16.1.6` in this repo. No additional plugin changes are required for this exploration.

### 2. Where Storybook is configured

- **Config files:** `apps/frontend/.storybook/main.ts`, `apps/frontend/.storybook/preview.tsx`
- **Stories glob:** `../**/*.@(mdx|stories.@(js|jsx|ts|tsx))` (all stories under `apps/frontend/**`)
- **Framework:** `@storybook/nextjs` with `nextjs.appDirectory: true` enabled in `preview.tsx`

`preview.tsx`:

- Imports `app/globals.css` so Tailwind and global styles are applied.
- Provides a `ThemeDecorator` that syncs the Storybook toolbar theme with the app’s `.dark` class.
- Ensures the semantic CSS variables defined in `libs/material-ui/src/theme.css` (see `theme.md`) are honored in stories.

### 3. Where to add screen stories for this exploration

For this exploration, screen-level stories should live close to the components they represent:

- **Auth screens**
  - Components: `LoginScreen`, `RegisterScreen` (and optional shared `AuthLayout`).
  - Suggested location: `apps/frontend/components/auth/LoginScreen.tsx`, `RegisterScreen.tsx`
  - Stories: `apps/frontend/components/auth/LoginScreen.stories.tsx`, `RegisterScreen.stories.tsx`

- **Slides editor screens**
  - Components: `SlidesEditorScreen`, optional `PresenterViewScreen`.
  - Suggested location: `apps/frontend/components/editor/SlidesEditorScreen.tsx`, `PresenterViewScreen.tsx`
  - Stories: `apps/frontend/components/editor/SlidesEditorScreen.stories.tsx`, `PresenterViewScreen.stories.tsx`

### 4. Mocking and data strategy

To keep stories fast and independent from the backend:

- Use simple in-memory mocks or **MSW** (Mock Service Worker) in Storybook to emulate:
  - Auth endpoints used by `LoginScreen` / `RegisterScreen` (success, error, loading).
  - Deck fetch/update endpoints used by `SlidesEditorScreen`.
- Model story states explicitly:
  - “Default”, “Loading”, “Error”, “With Google OAuth button” for auth.
  - “Empty deck”, “Typical deck”, “Many slides”, “Presenter view” for the editor.

This setup lets you refine the full-screen auth and Slides UIs interactively in Storybook, using the same Next.js app-directory environment and theme system as production, before wiring them to real routes and APIs.

