import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { TextBoxSpec } from "../types/slideDeck";
import type { DocRange } from "../slideDeck/textBoxSpecEditing/docPositions";

export interface SlideTextEditContextValue {
  /** Active inline text edit target; selection is only meaningful when both are set. */
  slideId: string | null;
  elementId: string | null;
  /** Latest spec used for offset mapping (matches the Lexical document). */
  liveSpec: TextBoxSpec | null;
  textSelection: DocRange | null;
  setSlideTextEdit: (v: {
    slideId: string | null;
    elementId: string | null;
    liveSpec: TextBoxSpec | null;
    textSelection: DocRange | null;
  }) => void;
  clearSlideTextEdit: () => void;
}

const SlideTextEditContext = createContext<SlideTextEditContextValue | null>(null);

export function SlideTextEditProvider({ children }: { children: ReactNode }) {
  const [slideId, setSlideId] = useState<string | null>(null);
  const [elementId, setElementId] = useState<string | null>(null);
  const [liveSpec, setLiveSpec] = useState<TextBoxSpec | null>(null);
  const [textSelection, setTextSelection] = useState<DocRange | null>(null);

  const setSlideTextEdit = useCallback(
    (v: {
      slideId: string | null;
      elementId: string | null;
      liveSpec: TextBoxSpec | null;
      textSelection: DocRange | null;
    }) => {
      setSlideId(v.slideId);
      setElementId(v.elementId);
      setLiveSpec(v.liveSpec);
      setTextSelection(v.textSelection);
    },
    [],
  );

  const clearSlideTextEdit = useCallback(() => {
    setSlideId(null);
    setElementId(null);
    setLiveSpec(null);
    setTextSelection(null);
  }, []);

  const value = useMemo(
    () => ({
      slideId,
      elementId,
      liveSpec,
      textSelection,
      setSlideTextEdit,
      clearSlideTextEdit,
    }),
    [slideId, elementId, liveSpec, textSelection, setSlideTextEdit, clearSlideTextEdit],
  );

  return <SlideTextEditContext.Provider value={value}>{children}</SlideTextEditContext.Provider>;
}

export function useSlideTextEdit(): SlideTextEditContextValue {
  const ctx = useContext(SlideTextEditContext);
  if (!ctx) {
    throw new Error("useSlideTextEdit must be used within SlideTextEditProvider");
  }
  return ctx;
}
