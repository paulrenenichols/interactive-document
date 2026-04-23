import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ChartPlacementSpec } from "../types/slideDeck";
import type { SlideDeckLayout, SlideDeckSlide, SlideDeckTheme, SlideElement } from "../types/slideDeck";
import { createInitialSlideDeckState } from "../slideDeck/initialState";
import {
  buildTextBoxSpecForLayoutPlaceholder,
  buildTextBoxSpecForThemePlaceholder,
} from "../slideDeck/materializeLayoutTextBox";
import { reorderSlidesByOrderIndex } from "../slideDeck/reorderSlides";
import { textBoxSpecToPlainText } from "../slideDeck/textBoxSpecPlainText";
import { validateLayoutName } from "../slideDeck/validateLayoutName";
import { isChartSlideElement, isTextBoxSlideElement } from "../types/slideDeck";
import type { DocumentSlideDeckMeta } from "../types/slideDeck";
import { useDocumentDataModel } from "./DocumentDataModelContext";
import type { ProjectSnapshotSlideDeck } from "../state/projectSnapshot";

export interface SlideDeckBoxEmu {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SlideDeckContextValue {
  documentMeta: DocumentSlideDeckMeta;
  theme: SlideDeckTheme;
  /** Registered themes for the document (v1: one theme; same as `[theme]`). */
  themes: SlideDeckTheme[];
  layouts: SlideDeckLayout[];
  slides: SlideDeckSlide[];
  activeSlideId: string | null;
  setActiveSlideId: (id: string | null) => void;
  duplicateSlide: (slideId: string) => void;
  deleteSlide: (slideId: string) => void;
  reorderSlide: (fromIndex: number, toIndex: number) => void;
  setSlideHidden: (slideId: string, hidden: boolean) => void;
  updateSlideNotes: (slideId: string, notes: string | null) => void;
  applyLayoutToSlide: (slideId: string, layoutId: string) => void;
  /** Append slide, or insert after `afterSlideId` when set. Focuses the new slide. */
  addSlide: (layoutId: string, options?: { afterSlideId?: string | null }) => void;
  addSlideElement: (slideId: string, element: SlideElement) => void;
  updateSlideElement: (slideId: string, elementId: string, patch: Partial<SlideElement>) => void;
  removeSlideElement: (slideId: string, elementId: string) => void;
  /** Marks a layout placeholder as removed on this slide (PowerPoint-style delete). */
  suppressLayoutPlaceholder: (slideId: string, layoutElementId: string) => void;
  /** Reset layout-linked text boxes to layout geometry/typography; keep plain text; restore suppressed placeholders. */
  revertSlideToLayout: (slideId: string) => void;
  /** Returns new slide element id, or null if slide not found. */
  addChartPlacement: (slideId: string, box: SlideDeckBoxEmu, chartId: string) => string | null;
  updateTheme: (partial: Partial<SlideDeckTheme>) => void;
  /**
   * Updates layout metadata. When `name` is in the patch, enforces theme-wide unique layout names.
   * Returns `false` if validation failed (no state change).
   */
  updateLayout: (
    layoutId: string,
    patch: Partial<Pick<SlideDeckLayout, "name" | "description" | "background_fill_override">>,
  ) => boolean;
  /** Replace theme, layouts, slides, and metadata from a project snapshot (after data model hydrate). */
  hydrateSlideDeck: (snapshot: ProjectSnapshotSlideDeck) => void;
}

const SlideDeckContext = createContext<SlideDeckContextValue | null>(null);

function nowIso(): string {
  return new Date().toISOString();
}

function validateElementSpec(el: SlideElement): boolean {
  return (
    el.element_type === "text_box" ||
    el.element_type === "shape" ||
    el.element_type === "chart" ||
    el.element_type === "image" ||
    el.element_type === "table"
  );
}

export function SlideDeckProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => createInitialSlideDeckState(), []);
  const { adjustChartLiveInstanceCount } = useDocumentDataModel();

  const [documentMeta, setDocumentMeta] = useState<DocumentSlideDeckMeta>(initial.documentMeta);
  const [theme, setTheme] = useState<SlideDeckTheme>(initial.theme);
  const themes = useMemo(() => [theme], [theme]);
  const [layouts, setLayouts] = useState<SlideDeckLayout[]>(initial.layouts);
  const [slides, setSlides] = useState<SlideDeckSlide[]>(initial.slides);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(() => initial.slides[0]?.id ?? null);

  const updateTheme = useCallback((partial: Partial<SlideDeckTheme>) => {
    const t = nowIso();
    setTheme((prev) => ({ ...prev, ...partial, updated_at: t }));
  }, []);

  const addSlide = useCallback(
    (layoutId: string, options?: { afterSlideId?: string | null }) => {
      const t = nowIso();
      const newId = crypto.randomUUID();

      const makeSlide = (id: string, orderIndex: number): SlideDeckSlide => ({
        id,
        document_id: documentMeta.document_id,
        layout_id: layoutId,
        order_index: orderIndex,
        name: null,
        notes: null,
        thumbnail_asset_id: null,
        elements: [],
        suppressed_layout_placeholder_ids: [],
        suppressed_theme_placeholder_ids: [],
        background_fill_override: null,
        hidden: false,
        created_at: t,
        updated_at: t,
      });

      setSlides((prev) => {
        const afterId = options?.afterSlideId;
        if (afterId == null || afterId === "") {
          const nextIndex = prev.length === 0 ? 1 : Math.max(...prev.map((s) => s.order_index)) + 1;
          return [...prev, makeSlide(newId, nextIndex)];
        }

        const sorted = [...prev].sort((a, b) => a.order_index - b.order_index);
        const afterIdx = sorted.findIndex((s) => s.id === afterId);
        if (afterIdx < 0) {
          const nextIndex = prev.length === 0 ? 1 : Math.max(...prev.map((s) => s.order_index)) + 1;
          return [...prev, makeSlide(newId, nextIndex)];
        }

        const inserted = [...sorted.slice(0, afterIdx + 1), makeSlide(newId, 0), ...sorted.slice(afterIdx + 1)];
        return inserted.map((s, i) => ({
          ...s,
          order_index: i + 1,
          updated_at: t,
        }));
      });

      setActiveSlideId(newId);
    },
    [documentMeta.document_id],
  );

  const duplicateSlide = useCallback((slideId: string) => {
    const t = nowIso();
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === slideId);
      if (idx < 0) return prev;
      const source = prev[idx];
      const nextIndex = Math.max(...prev.map((s) => s.order_index)) + 1;
      const newId = crypto.randomUUID();
      const cloneElements: SlideElement[] = source.elements.map((el) => ({
        ...el,
        id: crypto.randomUUID(),
        slide_id: newId,
        created_at: t,
        updated_at: t,
      }));
      for (const el of cloneElements) {
        if (isChartSlideElement(el)) {
          adjustChartLiveInstanceCount(el.spec.chart_id, 1);
        }
      }
      const copy: SlideDeckSlide = {
        ...source,
        id: newId,
        order_index: nextIndex,
        elements: cloneElements,
        suppressed_layout_placeholder_ids: [...(source.suppressed_layout_placeholder_ids ?? [])],
        suppressed_theme_placeholder_ids: [...(source.suppressed_theme_placeholder_ids ?? [])],
        created_at: t,
        updated_at: t,
      };
      const withDup = [...prev, copy].sort((a, b) => a.order_index - b.order_index);
      return withDup.map((s, i) => ({ ...s, order_index: i + 1, updated_at: t }));
    });
  }, [adjustChartLiveInstanceCount]);

  const deleteSlide = useCallback(
    (slideId: string) => {
      setSlides((prev) => {
        const target = prev.find((s) => s.id === slideId);
        if (!target) return prev;
        for (const el of target.elements) {
          if (el.element_type === "chart") {
            adjustChartLiveInstanceCount(el.spec.chart_id, -1);
          }
        }
        const filtered = prev.filter((s) => s.id !== slideId);
        const t = nowIso();
        const reindexed = filtered
          .sort((a, b) => a.order_index - b.order_index)
          .map((s, i) => ({ ...s, order_index: i + 1, updated_at: t }));
        return reindexed;
      });
      setActiveSlideId((cur) => (cur === slideId ? null : cur));
    },
    [adjustChartLiveInstanceCount],
  );

  const reorderSlide = useCallback((fromIndex: number, toIndex: number) => {
    setSlides((prev) => reorderSlidesByOrderIndex(prev, fromIndex, toIndex));
  }, []);

  const setSlideHidden = useCallback((slideId: string, hidden: boolean) => {
    const t = nowIso();
    setSlides((prev) => prev.map((s) => (s.id === slideId ? { ...s, hidden, updated_at: t } : s)));
  }, []);

  const updateSlideNotes = useCallback((slideId: string, notes: string | null) => {
    const t = nowIso();
    setSlides((prev) => prev.map((s) => (s.id === slideId ? { ...s, notes, updated_at: t } : s)));
  }, []);

  const applyLayoutToSlide = useCallback((slideId: string, layoutId: string) => {
    const t = nowIso();
    setSlides((prev) =>
      prev.map((s) =>
        s.id === slideId
          ? {
              ...s,
              layout_id: layoutId,
              suppressed_layout_placeholder_ids: [],
              suppressed_theme_placeholder_ids: [],
              updated_at: t,
            }
          : s,
      ),
    );
  }, []);

  const updateLayout = useCallback(
    (
      layoutId: string,
      patch: Partial<Pick<SlideDeckLayout, "name" | "description" | "background_fill_override">>,
    ): boolean => {
      const t = nowIso();
      let accepted = false;
      setLayouts((prev) => {
        const current = prev.find((l) => l.id === layoutId);
        if (!current) return prev;
        if (patch.name !== undefined) {
          const v = validateLayoutName(prev, current.theme_id, layoutId, patch.name);
          if (!v.ok) return prev;
        }
        accepted = true;
        return prev.map((l) =>
          l.id === layoutId
            ? {
                ...l,
                ...patch,
                name: patch.name !== undefined ? patch.name.trim() : l.name,
                updated_at: t,
              }
            : l,
        );
      });
      return accepted;
    },
    [],
  );

  const addSlideElement = useCallback((slideId: string, element: SlideElement) => {
    if (!validateElementSpec(element)) return;
    const t = nowIso();
    setSlides((prev) =>
      prev.map((s) => {
        if (s.id !== slideId) return s;
        return { ...s, elements: [...s.elements, { ...element, updated_at: t }], updated_at: t };
      }),
    );
  }, []);

  const updateSlideElement = useCallback((slideId: string, elementId: string, patch: Partial<SlideElement>) => {
    const t = nowIso();
    setSlides((prev) =>
      prev.map((s) => {
        if (s.id !== slideId) return s;
        return {
          ...s,
          elements: s.elements.map((el) => {
            if (el.id !== elementId) return el;
            return { ...(el as SlideElement), ...patch, id: el.id, updated_at: t } as SlideElement;
          }),
          updated_at: t,
        };
      }),
    );
  }, []);

  const suppressLayoutPlaceholder = useCallback((slideId: string, layoutElementId: string) => {
    const t = nowIso();
    setSlides((prev) =>
      prev.map((s) => {
        if (s.id !== slideId) return s;
        const cur = s.suppressed_layout_placeholder_ids ?? [];
        if (cur.includes(layoutElementId)) return { ...s, updated_at: t };
        return {
          ...s,
          suppressed_layout_placeholder_ids: [...cur, layoutElementId],
          updated_at: t,
        };
      }),
    );
  }, []);

  const removeSlideElement = useCallback(
    (slideId: string, elementId: string) => {
      setSlides((prev) =>
        prev.map((s) => {
          if (s.id !== slideId) return s;
          const el = s.elements.find((e) => e.id === elementId);
          if (el?.element_type === "chart") {
            adjustChartLiveInstanceCount(el.spec.chart_id, -1);
          }
          const t = nowIso();
          const layoutId = el?.layout_element_id;
          const themePhId = el?.theme_element_id;
          let nextSuppressedLayout = s.suppressed_layout_placeholder_ids ?? [];
          if (layoutId != null && !nextSuppressedLayout.includes(layoutId)) {
            nextSuppressedLayout = [...nextSuppressedLayout, layoutId];
          }
          let nextSuppressedTheme = s.suppressed_theme_placeholder_ids ?? [];
          if (themePhId != null && !nextSuppressedTheme.includes(themePhId)) {
            nextSuppressedTheme = [...nextSuppressedTheme, themePhId];
          }
          return {
            ...s,
            elements: s.elements.filter((e) => e.id !== elementId),
            suppressed_layout_placeholder_ids: nextSuppressedLayout,
            suppressed_theme_placeholder_ids: nextSuppressedTheme,
            updated_at: t,
          };
        }),
      );
    },
    [adjustChartLiveInstanceCount],
  );

  const revertSlideToLayout = useCallback(
    (slideId: string) => {
      const t = nowIso();
      setSlides((prev) =>
        prev.map((s) => {
          if (s.id !== slideId) return s;
          const layout = layouts.find((l) => l.id === s.layout_id);
          if (!layout) {
            return {
              ...s,
              suppressed_layout_placeholder_ids: [],
              suppressed_theme_placeholder_ids: [],
              updated_at: t,
            };
          }
          const nextElements = s.elements.map((el) => {
            if (!isTextBoxSlideElement(el)) return el;
            if (el.layout_element_id) {
              const layoutEl = layout.elements.find((e) => e.id === el.layout_element_id);
              if (!layoutEl || layoutEl.element_type !== "placeholder") return el;
              const plain = textBoxSpecToPlainText(el.spec);
              const spec = buildTextBoxSpecForLayoutPlaceholder(layoutEl, theme, plain);
              return {
                ...el,
                x: layoutEl.x,
                y: layoutEl.y,
                width: layoutEl.width,
                height: layoutEl.height,
                z_index: layoutEl.z_index,
                rotation_deg: 0,
                spec,
                updated_at: t,
              };
            }
            if (el.theme_element_id) {
              const themeEl = theme.master_elements.find((e) => e.id === el.theme_element_id);
              if (!themeEl || themeEl.element_type !== "placeholder") return el;
              const plain = textBoxSpecToPlainText(el.spec);
              const spec = buildTextBoxSpecForThemePlaceholder(themeEl, theme, plain);
              return {
                ...el,
                x: themeEl.x,
                y: themeEl.y,
                width: themeEl.width,
                height: themeEl.height,
                z_index: themeEl.z_index,
                rotation_deg: 0,
                spec,
                updated_at: t,
              };
            }
            return el;
          });
          return {
            ...s,
            elements: nextElements,
            suppressed_layout_placeholder_ids: [],
            suppressed_theme_placeholder_ids: [],
            updated_at: t,
          };
        }),
      );
    },
    [layouts, theme],
  );

  const hydrateSlideDeck = useCallback((snapshot: ProjectSnapshotSlideDeck) => {
    setDocumentMeta(snapshot.documentMeta);
    setTheme(snapshot.theme);
    setLayouts(snapshot.layouts);
    setSlides(snapshot.slides);
    setActiveSlideId(snapshot.activeSlideId);
  }, []);

  const addChartPlacement = useCallback(
    (slideId: string, box: SlideDeckBoxEmu, chartId: string): string | null => {
      const slide = slides.find((s) => s.id === slideId);
      if (!slide) return null;
      const maxZ = slide.elements.length === 0 ? 0 : Math.max(...slide.elements.map((e) => e.z_index));
      const t = nowIso();
      const newId = crypto.randomUUID();
      const spec: ChartPlacementSpec = {
        chart_id: chartId,
        aspect_ratio_locked: true,
      };
      const el: SlideElement = {
        id: newId,
        slide_id: slideId,
        element_type: "chart",
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        rotation_deg: 0,
        z_index: maxZ + 1,
        locked: false,
        hidden: false,
        spec,
        created_at: t,
        updated_at: t,
      };
      adjustChartLiveInstanceCount(chartId, 1);
      addSlideElement(slideId, el);
      return newId;
    },
    [addSlideElement, adjustChartLiveInstanceCount, slides],
  );

  const value = useMemo<SlideDeckContextValue>(
    () => ({
      documentMeta,
      theme,
      themes,
      layouts,
      slides,
      activeSlideId,
      setActiveSlideId,
      addSlide,
      duplicateSlide,
      deleteSlide,
      reorderSlide,
      setSlideHidden,
      updateSlideNotes,
      applyLayoutToSlide,
      addSlideElement,
      updateSlideElement,
      removeSlideElement,
      suppressLayoutPlaceholder,
      revertSlideToLayout,
      addChartPlacement,
      updateTheme,
      updateLayout,
      hydrateSlideDeck,
    }),
    [
      documentMeta,
      theme,
      themes,
      layouts,
      slides,
      activeSlideId,
      addSlide,
      duplicateSlide,
      deleteSlide,
      reorderSlide,
      setSlideHidden,
      updateSlideNotes,
      applyLayoutToSlide,
      addSlideElement,
      updateSlideElement,
      removeSlideElement,
      suppressLayoutPlaceholder,
      revertSlideToLayout,
      addChartPlacement,
      updateTheme,
      updateLayout,
      hydrateSlideDeck,
    ],
  );

  return <SlideDeckContext.Provider value={value}>{children}</SlideDeckContext.Provider>;
}

export function useSlideDeck(): SlideDeckContextValue {
  const ctx = useContext(SlideDeckContext);
  if (!ctx) {
    throw new Error("useSlideDeck must be used within SlideDeckProvider");
  }
  return ctx;
}

/** Optional: use when slide deck is only mounted in authoring subtree. */
export function useSlideDeckOptional(): SlideDeckContextValue | null {
  return useContext(SlideDeckContext);
}
