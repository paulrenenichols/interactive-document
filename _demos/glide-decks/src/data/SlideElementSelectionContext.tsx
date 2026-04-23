import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/** What the user selected on the slide canvas (slide-owned element, layout placeholder, or theme master). */
export type SlideAuthoringSelection =
  | { kind: "slide"; slideId: string; elementId: string }
  | { kind: "layout"; slideId: string; layoutElementId: string }
  | { kind: "theme"; slideId: string; themeElementId: string };

export interface SlideElementSelectionContextValue {
  selection: SlideAuthoringSelection | null;
  setSelection: (next: SlideAuthoringSelection | null) => void;
  clearSelection: () => void;
}

const SlideElementSelectionContext = createContext<SlideElementSelectionContextValue | null>(null);

export function SlideElementSelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] = useState<SlideAuthoringSelection | null>(null);

  const setSelection = useCallback((next: SlideAuthoringSelection | null) => {
    setSelectionState(next);
  }, []);

  const clearSelection = useCallback(() => setSelectionState(null), []);

  const value = useMemo(
    () => ({ selection, setSelection, clearSelection }),
    [selection, setSelection, clearSelection],
  );

  return (
    <SlideElementSelectionContext.Provider value={value}>{children}</SlideElementSelectionContext.Provider>
  );
}

export function useSlideElementSelection(): SlideElementSelectionContextValue {
  const ctx = useContext(SlideElementSelectionContext);
  if (!ctx) {
    throw new Error("useSlideElementSelection must be used within SlideElementSelectionProvider");
  }
  return ctx;
}
