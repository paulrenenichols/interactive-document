# Theming and color system

## Summary

Dark mode and light mode with Material Design 3 color tokens, plus dedicated chart color palettes optimized for each mode. Theme preference persisted via zustand `persist` middleware to localStorage.

## Current state

- Light mode only. CSS custom properties defined in `apps/frontend/app/globals.css`:
  - Background: `--bg-primary`, `--bg-secondary`, `--bg-slide`
  - Text: `--text-primary`, `--text-secondary`, `--text-muted`
  - Borders: `--border-default`, `--border-focus`
  - Accents: `--accent-primary`, `--accent-primary-hover`, `--accent-primary-active`, `--accent-destructive`
  - Chart series: `--chart-series-1` through `--chart-series-6`
  - Status: `--success`, `--warning`, `--error`
- No dark mode toggle. No system preference detection.
- Chart components reference these variables via `var(--token-name)` in inline style objects.

## Scope

### M3 color system

Map the full M3 color role system to Tailwind `@theme` tokens. Each role has a light and dark value.

| Role | Light value | Dark value | Usage |
|------|------------|------------|-------|
| primary | TBD | TBD | Primary actions, key components |
| on-primary | TBD | TBD | Text/icons on primary surfaces |
| primary-container | TBD | TBD | Filled containers using primary |
| on-primary-container | TBD | TBD | Text/icons on primary containers |
| secondary | TBD | TBD | Secondary actions, less prominent |
| on-secondary | TBD | TBD | Text/icons on secondary surfaces |
| secondary-container | TBD | TBD | Filled containers using secondary |
| on-secondary-container | TBD | TBD | Text/icons on secondary containers |
| tertiary | TBD | TBD | Accent, complementary elements |
| on-tertiary | TBD | TBD | Text/icons on tertiary surfaces |
| error | TBD | TBD | Error states |
| on-error | TBD | TBD | Text/icons on error surfaces |
| surface | TBD | TBD | Default background |
| on-surface | TBD | TBD | Default text |
| surface-variant | TBD | TBD | Alternate background |
| on-surface-variant | TBD | TBD | Secondary text, icons |
| outline | TBD | TBD | Borders, dividers |
| outline-variant | TBD | TBD | Subtle borders |
| inverse-surface | TBD | TBD | Snackbars, tooltips |
| inverse-on-surface | TBD | TBD | Text on inverse surfaces |

Specific color values will be chosen during implementation, potentially using the M3 Material Theme Builder tool to generate a harmonious palette from a seed color.

### Dark mode implementation

- **Strategy:** Tailwind `class` strategy -- add/remove the `dark` class on `<html>`.
- **System preference detection:** On first visit (no stored preference), detect `prefers-color-scheme: dark` via `window.matchMedia` and apply accordingly.
- **Persistence:** Store preference in zustand `useThemeStore` with `persist` middleware (localStorage). On subsequent visits, the stored preference takes precedence over system preference.
- **Toggle component:** A theme toggle button/switch in the app bar or settings area. Cycles between light, dark, and system (auto).
- **CSS structure:** Light mode values are the default. Dark mode values are applied via `@theme` overrides or CSS custom properties that change when `dark` class is present.

### Chart color palettes

Two 8-color palettes optimized for their respective backgrounds. Colors must be perceptually distinct, colorblind-accessible (checked against deuteranopia, protanopia, tritanopia simulations), and visually harmonious.

#### Light mode chart colors

Optimized for white/light gray backgrounds. Lower saturation, sufficient contrast against `#FFFFFF`.

| Token | Intended hue | Notes |
|-------|-------------|-------|
| `--chart-1` | Blue | Primary series |
| `--chart-2` | Teal | Distinct from blue |
| `--chart-3` | Amber/orange | Warm contrast |
| `--chart-4` | Red/coral | Alert-adjacent but distinct from error |
| `--chart-5` | Purple | Cool accent |
| `--chart-6` | Green | Natural/positive connotation |
| `--chart-7` | Pink | Warm complement to purple |
| `--chart-8` | Indigo | Deep cool tone |

#### Dark mode chart colors

Optimized for dark gray/black backgrounds. Higher saturation and luminance for visibility.

| Token | Intended hue | Notes |
|-------|-------------|-------|
| `--chart-1` | Light blue | Bright primary series |
| `--chart-2` | Cyan/teal | Vivid, distinct from blue |
| `--chart-3` | Yellow/amber | Warm, high contrast on dark |
| `--chart-4` | Salmon/coral | Warm, visible on dark |
| `--chart-5` | Lavender | Bright cool accent |
| `--chart-6` | Lime/green | Vivid positive |
| `--chart-7` | Pink/magenta | Bright warm complement |
| `--chart-8` | Sky blue | Lighter complement to primary |

Chart color tokens are defined as CSS custom properties that automatically swap with the theme. Chart components reference them via `var(--chart-1)` etc., so no code changes are needed in chart components when the theme changes.

### Semantic status colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| success | Green | Bright green | Positive states, confirmations |
| warning | Amber | Bright amber | Caution states |
| error | Red | Bright red | Error states, destructive actions |
| info | Blue | Bright blue | Informational states |

## Migration from current tokens

The existing CSS custom properties (`--bg-primary`, `--text-primary`, etc.) will be replaced by M3 role-based tokens. The mapping is roughly:

| Current | M3 equivalent |
|---------|---------------|
| `--bg-primary` | `surface` |
| `--bg-secondary` | `surface-variant` |
| `--text-primary` | `on-surface` |
| `--text-secondary` | `on-surface-variant` |
| `--text-muted` | `outline` |
| `--accent-primary` | `primary` |
| `--border-default` | `outline-variant` |
| `--border-focus` | `primary` |
| `--chart-series-*` | `--chart-*` |

## Dependencies

- [Tailwind 4 integration](tailwind-4-integration.md) -- theme tokens defined via `@theme` directives.
- [Zustand state management](zustand-state-management.md) -- `useThemeStore` persists dark/light preference.

## Out of scope

- Dynamic theme generation (user picks a seed color and generates a full palette). This is a possible future enhancement using the M3 theme builder algorithm.
- High-contrast mode or other accessibility-specific themes.
