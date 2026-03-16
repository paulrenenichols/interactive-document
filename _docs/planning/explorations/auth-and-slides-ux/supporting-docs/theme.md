Your current theming setup (based on the repo structure and recent changes) is a **Tailwind CSS v4 CSS-first approach** combined with:

- **Zustand** for persisting user preference (`light` / `dark` / `system`)
- `.dark` class toggled on `<html>` (via `useLayoutEffect` or similar to avoid FOUC)
- A `src/theme.css` file in `libs/material-ui` that defines:
  - `@theme` directive for design tokens
  - Custom CSS variables (e.g. motion durations like `--duration-standard`)
  - Dark mode overrides via `.dark` selector
- MUI components styled via Tailwind classes + these CSS vars (no heavy `createTheme` / `ThemeProvider` usage for mode switching)

This is a lightweight, performant system — great for consistency across the monorepo.

To create **new light and dark themes**, the cleanest way is to:

1. Define semantic CSS variables in `theme.css` (or a new dedicated `app-theme.css` if you want to separate app-specific theming from the MUI lib)
2. Use light values as default (no selector)
3. Override them inside `.dark { ... }`
4. Use those vars in your Tailwind utilities and component classes

### Step 1 – Choose a new theme direction

Here are two complete, modern, cohesive palettes you can pick (or mix):

**Option A: Clean Professional (recommended starting point – modern SaaS feel, good contrast, accessible)**

- Light: Neutral grays + vibrant blue primary, soft off-white backgrounds
- Dark: Deep slate/near-black, brighter accents for readability

**Option B: Warm Modern**

- Light: Warm neutrals (cream/beige), soft teal primary
- Dark: Dark charcoal, warmer glow accents

I'll give code for **Option A** below (clean/professional) — it's versatile for a data/presentation app like yours. If you prefer Option B or something else (e.g. purple/mint, high-contrast, material-you inspired), just say so.

### Step 2 – Updated `theme.css` (or new file)

Put this in `libs/material-ui/src/theme.css` (or create `apps/frontend/src/styles/app-theme.css` and import it globally in `app/layout.tsx` after the MUI one).

```css
@theme inline {
  /* --------------------- Semantic tokens --------------------- */
  --color-background: #ffffff;
  --color-surface: #f8fafc; /* cards, panels */
  --color-surface-elevated: #f1f5f9;
  --color-divider: #e2e8f0;

  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #64748b;
  --color-text-on-primary: #ffffff;

  --color-primary: #3b82f6; /* blue-500 */
  --color-primary-hover: #2563eb; /* blue-600 */
  --color-primary-active: #1d4ed8; /* blue-700 */
  --color-primary-muted: #60a5fa; /* blue-400 – for dark mode accents */

  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  --color-border: #cbd5e1;

  /* Motion & shadows (keep your existing ones or extend) */
  --duration-standard: 200ms;
  --duration-long: 300ms;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

  /* Dark mode overrides */
  &.dark {
    --color-background: #0f172a; /* slate-900 */
    --color-surface: #1e293b; /* slate-800 */
    --color-surface-elevated: #334155; /* slate-700 */
    --color-divider: #475569; /* slate-600 */

    --color-text-primary: #f1f5f9; /* slate-100 */
    --color-text-secondary: #cbd5e1; /* slate-300 */
    --color-text-muted: #94a3b8; /* slate-400 */
    --color-text-on-primary: #ffffff;

    --color-primary: #60a5fa; /* blue-400 – brighter for dark */
    --color-primary-hover: #3b82f6; /* blue-500 */
    --color-primary-active: #2563eb; /* blue-600 */

    --color-border: #334155; /* slate-700 */

    --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3);
    --shadow-md:
      0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3);
  }
}
```

### Step 3 – Use the new tokens in your app

Update components to reference these variables via Tailwind arbitrary values or custom utilities.

Examples:

```tsx
// Card / Panel
<div className="bg-surface shadow-md rounded-xl border border-divider p-6">
  <h2 className="text-text-primary font-medium">Title</h2>
  <p className="text-text-secondary">Description...</p>
</div>

// Primary button
<Button
  className="bg-primary text-text-on-primary hover:bg-primary-hover active:bg-primary-active"
  // ...
/>

// Text
<p className="text-text-primary">Main content</p>
<p className="text-text-muted text-sm">Secondary info</p>
```

### Step 4 – Global import & minor tweaks

In `apps/frontend/app/layout.tsx` (or root layout):

```tsx
import '@/styles/theme.css'; // or wherever you put the new theme
// ... other imports
```

If you see FOUC (flash of unstyled content), make sure the `.dark` class toggle happens in a `useLayoutEffect` (sync) rather than `useEffect`.

### Optional next steps / improvements

- Add more tokens: `--radius-md: 0.75rem;`, `--font-brand: 'Inter', system-ui;`, etc.
- Accessibility check: Use tools like WAVE or Lighthouse — your new palette has good contrast (blue-500/#3b82f6 on white ≈ 5.1:1; blue-400/#60a5fa on dark ≈ 4.8:1)
- Theme switcher UI: Make the toggle show a preview (sun/moon icons + maybe a tiny color swatch)
- Export as design tokens: If you want to sync with Figma later, these vars are easy to map

Pick Option A above, or tell me a vibe/color family you prefer (e.g. "warmer tones", "purple accents", "high-contrast hacker green", "material you dynamic"), and I'll adjust the variables accordingly. Want me to generate a second option or focus on specific components (e.g. charts, editor panels)?
