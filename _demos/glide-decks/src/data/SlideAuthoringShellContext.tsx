import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/** Slide = deck page; layout = template definition; themeMaster = slide master / theme chrome (global). */
export type AuthoringSurface = "slide" | "layout" | "themeMaster";

export interface SlideAuthoringShellContextValue {
  authoringSurface: AuthoringSurface;
  editingLayoutId: string | null;
  editingThemeId: string | null;
  enterLayoutEdit: (layoutId: string) => void;
  enterThemeMasterEdit: (themeId: string) => void;
  exitToSlideAuthoring: () => void;
}

const SlideAuthoringShellContext = createContext<SlideAuthoringShellContextValue | null>(null);

export function SlideAuthoringShellProvider({ children }: { children: ReactNode }) {
  const [authoringSurface, setAuthoringSurface] = useState<AuthoringSurface>("slide");
  const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);

  const enterLayoutEdit = useCallback((layoutId: string) => {
    setEditingThemeId(null);
    setEditingLayoutId(layoutId);
    setAuthoringSurface("layout");
  }, []);

  const enterThemeMasterEdit = useCallback((themeId: string) => {
    setEditingLayoutId(null);
    setEditingThemeId(themeId);
    setAuthoringSurface("themeMaster");
  }, []);

  const exitToSlideAuthoring = useCallback(() => {
    setAuthoringSurface("slide");
    setEditingLayoutId(null);
    setEditingThemeId(null);
  }, []);

  const value = useMemo(
    () => ({
      authoringSurface,
      editingLayoutId,
      editingThemeId,
      enterLayoutEdit,
      enterThemeMasterEdit,
      exitToSlideAuthoring,
    }),
    [authoringSurface, editingLayoutId, editingThemeId, enterLayoutEdit, enterThemeMasterEdit, exitToSlideAuthoring],
  );

  return <SlideAuthoringShellContext.Provider value={value}>{children}</SlideAuthoringShellContext.Provider>;
}

export function useSlideAuthoringShell(): SlideAuthoringShellContextValue {
  const ctx = useContext(SlideAuthoringShellContext);
  if (!ctx) {
    throw new Error("useSlideAuthoringShell must be used within SlideAuthoringShellProvider");
  }
  return ctx;
}
