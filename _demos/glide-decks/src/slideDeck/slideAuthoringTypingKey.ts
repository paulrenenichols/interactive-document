/**
 * Whether `keydown` should start inline slide text editing (Unicode letters and decimal digits).
 * Caller should still skip when `ctrlKey` / `metaKey` / `altKey` or `isComposing`.
 */
export function isSlideAuthoringTypingKey(e: Pick<KeyboardEvent, "key">): boolean {
  if (e.key.length !== 1) return false;
  return /^[\p{L}\p{N}]$/u.test(e.key);
}
