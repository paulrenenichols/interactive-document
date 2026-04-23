/**
 * When true, series column headers show a debug kebab (metadata / values JSON modals).
 * Set `VITE_SHOW_DATASERIES_DEBUG_KEBAB=true` in `.env.local` to enable without editing this file.
 */
export const SHOW_DATASERIES_DEBUG_KEBAB =
  import.meta.env.VITE_SHOW_DATASERIES_DEBUG_KEBAB === "true";
