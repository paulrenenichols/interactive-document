import type { SlideDeckLayout } from "../types/slideDeck";

export type ValidateLayoutNameResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Layout display names must be unique per theme (case-insensitive, trimmed).
 */
export function validateLayoutName(
  layouts: SlideDeckLayout[],
  themeId: string,
  excludeLayoutId: string,
  rawName: string,
): ValidateLayoutNameResult {
  const name = rawName.trim();
  if (name.length === 0) {
    return { ok: false, error: "Layout name cannot be empty." };
  }
  const lower = name.toLowerCase();
  const conflict = layouts.some(
    (l) =>
      l.theme_id === themeId &&
      l.id !== excludeLayoutId &&
      l.name.trim().toLowerCase() === lower,
  );
  if (conflict) {
    return { ok: false, error: "A layout with this name already exists in this theme." };
  }
  return { ok: true };
}
