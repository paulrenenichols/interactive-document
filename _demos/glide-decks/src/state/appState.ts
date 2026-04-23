/** Serializable app state for JSON export (no auth / no server). */

export const APP_STATE_VERSION = 1 as const;

export interface AppState {
  version: typeof APP_STATE_VERSION;
  documentTitle: string;
}

export function defaultAppState(): AppState {
  return {
    version: APP_STATE_VERSION,
    documentTitle: "Acme Technologies — HRIS slice",
  };
}

export function parseAppState(raw: unknown): AppState {
  const base = defaultAppState();
  if (raw == null || typeof raw !== "object") {
    return base;
  }
  const o = raw as Record<string, unknown>;
  const title =
    typeof o.documentTitle === "string" && o.documentTitle.trim() !== ""
      ? o.documentTitle
      : base.documentTitle;
  return {
    version: APP_STATE_VERSION,
    documentTitle: title,
  };
}
