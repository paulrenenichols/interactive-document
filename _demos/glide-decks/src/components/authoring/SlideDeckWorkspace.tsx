import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useDocumentDataModel } from "../../data/DocumentDataModelContext";
import { useSlideDeck } from "../../data/SlideDeckContext";
import { SlideAuthoringShellProvider, useSlideAuthoringShell } from "../../data/SlideAuthoringShellContext";
import { SlideElementSelectionProvider, useSlideElementSelection } from "../../data/SlideElementSelectionContext";
import { SlideTextEditProvider } from "../../data/SlideTextEditContext";
import { BUILTIN_LAYOUT_IDS } from "../../slideDeck/builtInLayouts";
import { getFirstLayoutIdForTheme } from "../../slideDeck/getDefaultNewSlideLayoutId";
import {
  advanceSlideAuthoringSelection,
  buildSlideAuthoringTabOrder,
} from "../../slideDeck/slideAuthoringTabOrder";
import { createSlideChartPlacementBoxEmu } from "../../slideDeck/createSlideChartPlacementBoxEmu";
import { createSlideShapeElement, type MilestoneShapeKind } from "../../slideDeck/createSlideShapeElement";
import { createSlideTextBoxElement } from "../../slideDeck/createSlideTextBoxElement";
import { precisionLedgerColors, SLIDE_STAGE_MAX_WIDTH_PX } from "../../slideDeck/precisionLedgerUi";
import { LayoutEditorShell } from "../slideDeck/LayoutEditorShell";
import { SlideAuthoringCanvas } from "../slideDeck/authoring/SlideAuthoringCanvas";
import { SampleSalaryVarianceSlideContent } from "../slideDeck/SampleSalaryVarianceSlideContent";
import { SlideAuthoringModeBar } from "../slideDeck/SlideAuthoringModeBar";
import { SlideCanvasStage } from "../slideDeck/SlideCanvasStage";
import { SlideDeckBottomNav } from "../slideDeck/SlideDeckBottomNav";
import { SlideDeckRightPanel, type RightPanelMode } from "../slideDeck/SlideDeckRightPanel";
import { SlideInsertionToolbar } from "../slideDeck/SlideInsertionToolbar";
import { ThemeEditorShell } from "../slideDeck/ThemeEditorShell";

function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

export interface SlideDeckWorkspaceProps {
  /** When false, global slide keyboard shortcuts do not run (both authoring panels stay mounted). */
  slideDeckTabActive?: boolean;
  /** Presentation-style preview: minimal chrome, read-only slide surface, reader chart interactions. */
  previewActive?: boolean;
  onPreviewChange?: (active: boolean) => void;
}

/**
 * Precision Ledger slide editor shell (design/sample-slide-deck-design).
 * Phase A: static Salary Variance canvas + navigation + format drawer.
 */
export function SlideDeckWorkspace({
  slideDeckTabActive = true,
  previewActive = false,
  onPreviewChange,
}: SlideDeckWorkspaceProps) {
  return (
    <SlideAuthoringShellProvider>
      <SlideElementSelectionProvider>
        <SlideTextEditProvider>
          <SlideDeckWorkspaceInner
            slideDeckTabActive={slideDeckTabActive}
            previewActive={previewActive}
            onPreviewChange={onPreviewChange}
          />
        </SlideTextEditProvider>
      </SlideElementSelectionProvider>
    </SlideAuthoringShellProvider>
  );
}

function SlideDeckWorkspaceInner({
  slideDeckTabActive,
  previewActive,
  onPreviewChange,
}: {
  slideDeckTabActive: boolean;
  previewActive: boolean;
  onPreviewChange?: (active: boolean) => void;
}) {
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("slides");
  const {
    slides,
    layouts,
    theme,
    themes,
    activeSlideId,
    setActiveSlideId,
    addSlide,
    addSlideElement,
    addChartPlacement,
    removeSlideElement,
    suppressLayoutPlaceholder,
    revertSlideToLayout,
  } = useSlideDeck();
  const { chartAssetRows } = useDocumentDataModel();
  const { selection, setSelection, clearSelection } = useSlideElementSelection();
  const { authoringSurface, editingLayoutId, editingThemeId, exitToSlideAuthoring } = useSlideAuthoringShell();

  const visibleSlides = useMemo(
    () => [...slides].filter((s) => !s.hidden).sort((a, b) => a.order_index - b.order_index),
    [slides],
  );

  const activeIndex = visibleSlides.findIndex((s) => s.id === activeSlideId);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeSlide = visibleSlides[safeIndex] ?? visibleSlides[0];

  const editingLayout = useMemo(
    () => (editingLayoutId ? layouts.find((l) => l.id === editingLayoutId) ?? null : null),
    [layouts, editingLayoutId],
  );

  const editingTheme = useMemo(
    () => (editingThemeId ? themes.find((t) => t.id === editingThemeId) ?? null : null),
    [themes, editingThemeId],
  );

  const activeLayout = useMemo(
    () => (activeSlide ? layouts.find((l) => l.id === activeSlide.layout_id) ?? null : null),
    [activeSlide, layouts],
  );

  /** Collapse the slide right panel when switching to Data Model (top-level authoring nav). */
  useEffect(() => {
    if (!slideDeckTabActive) {
      setRightPanelOpen(false);
    }
  }, [slideDeckTabActive]);

  useEffect(() => {
    if (authoringSurface === "layout" && editingLayoutId != null && editingLayout == null) {
      exitToSlideAuthoring();
    }
  }, [authoringSurface, editingLayoutId, editingLayout, exitToSlideAuthoring]);

  useEffect(() => {
    if (authoringSurface === "themeMaster" && editingThemeId != null && editingTheme == null) {
      exitToSlideAuthoring();
    }
  }, [authoringSurface, editingThemeId, editingTheme, exitToSlideAuthoring]);

  useEffect(() => {
    if (visibleSlides.length === 0) return;
    if (!activeSlideId || !visibleSlides.some((s) => s.id === activeSlideId)) {
      setActiveSlideId(visibleSlides[0].id);
    }
  }, [activeSlideId, setActiveSlideId, visibleSlides]);

  useEffect(() => {
    if (previewActive) {
      clearSelection();
      setRightPanelOpen(false);
    }
  }, [previewActive, clearSelection]);

  const goPrevious = useCallback(() => {
    if (safeIndex <= 0) return;
    setActiveSlideId(visibleSlides[safeIndex - 1].id);
  }, [safeIndex, setActiveSlideId, visibleSlides]);

  const goNext = useCallback(() => {
    if (safeIndex >= visibleSlides.length - 1) return;
    setActiveSlideId(visibleSlides[safeIndex + 1].id);
  }, [safeIndex, setActiveSlideId, visibleSlides]);

  const goFirst = useCallback(() => {
    if (visibleSlides.length === 0) return;
    setActiveSlideId(visibleSlides[0].id);
  }, [setActiveSlideId, visibleSlides]);

  const goLast = useCallback(() => {
    if (visibleSlides.length === 0) return;
    setActiveSlideId(visibleSlides[visibleSlides.length - 1].id);
  }, [setActiveSlideId, visibleSlides]);

  const handleInlineTextEditStart = useCallback(() => {
    setRightPanelOpen(true);
    setRightPanelMode("design");
  }, []);

  const handleAddSlideAfterCurrent = useCallback(() => {
    const layoutId = getFirstLayoutIdForTheme(layouts, theme.id);
    if (!layoutId) return;
    if (activeSlide) {
      addSlide(layoutId, { afterSlideId: activeSlide.id });
    } else {
      addSlide(layoutId);
    }
  }, [addSlide, activeSlide, layouts, theme.id]);

  const handleInsertTextBox = useCallback(() => {
    if (!activeSlide || !activeLayout) return;
    if (activeSlide.layout_id === BUILTIN_LAYOUT_IDS.salaryVarianceOverview) return;
    const el = createSlideTextBoxElement(activeSlide.id, activeSlide.elements);
    addSlideElement(activeSlide.id, el);
    setSelection({ kind: "slide", slideId: activeSlide.id, elementId: el.id });
  }, [activeSlide, activeLayout, addSlideElement, setSelection]);

  const handleInsertShape = useCallback(
    (kind: MilestoneShapeKind) => {
      if (!activeSlide || !activeLayout) return;
      if (activeSlide.layout_id === BUILTIN_LAYOUT_IDS.salaryVarianceOverview) return;
      const el = createSlideShapeElement(activeSlide.id, activeSlide.elements, kind);
      addSlideElement(activeSlide.id, el);
      setSelection({ kind: "slide", slideId: activeSlide.id, elementId: el.id });
      setRightPanelOpen(true);
      setRightPanelMode("design");
    },
    [activeSlide, activeLayout, addSlideElement, setSelection, setRightPanelOpen, setRightPanelMode],
  );

  const handleChartPicked = useCallback(
    (chartId: string) => {
      if (!activeSlide || !activeLayout) return;
      if (activeSlide.layout_id === BUILTIN_LAYOUT_IDS.salaryVarianceOverview) return;
      const chartRow = chartAssetRows.find((c) => c.id === chartId);
      const box = createSlideChartPlacementBoxEmu(chartRow?.appearance);
      const elementId = addChartPlacement(activeSlide.id, box, chartId);
      if (elementId) {
        setSelection({ kind: "slide", slideId: activeSlide.id, elementId });
      }
    },
    [activeSlide, activeLayout, addChartPlacement, chartAssetRows, setSelection],
  );

  const handleRevertSlide = useCallback(() => {
    if (!activeSlide) return;
    if (activeSlide.layout_id === BUILTIN_LAYOUT_IDS.salaryVarianceOverview) return;
    revertSlideToLayout(activeSlide.id);
  }, [activeSlide, revertSlideToLayout]);

  useEffect(() => {
    if (!slideDeckTabActive || authoringSurface !== "slide") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableKeyboardTarget(event.target)) return;

      if (previewActive) {
        const { key } = event;
        if (key === "Escape") {
          event.preventDefault();
          onPreviewChange?.(false);
          return;
        }
        if (key === "ArrowLeft" || key === "ArrowUp") {
          if (safeIndex <= 0) return;
          event.preventDefault();
          goPrevious();
          return;
        }
        if (key === "ArrowRight" || key === "ArrowDown") {
          if (safeIndex >= visibleSlides.length - 1) return;
          event.preventDefault();
          goNext();
          return;
        }
        if (key === "Home") {
          if (visibleSlides.length === 0 || safeIndex === 0) return;
          event.preventDefault();
          goFirst();
          return;
        }
        if (key === "End") {
          if (visibleSlides.length === 0 || safeIndex === visibleSlides.length - 1) return;
          event.preventDefault();
          goLast();
        }
        return;
      }

      const { key } = event;
      if (key === "Tab") {
        if (
          selection != null &&
          activeSlide &&
          activeLayout &&
          activeSlide.layout_id !== BUILTIN_LAYOUT_IDS.salaryVarianceOverview
        ) {
          const order = buildSlideAuthoringTabOrder(theme, activeLayout, activeSlide);
          const delta = event.shiftKey ? (-1 as const) : (1 as const);
          const next = advanceSlideAuthoringSelection(order, selection, delta);
          if (next != null) {
            event.preventDefault();
            setSelection(next);
          }
        }
        return;
      }
      if (key === "Delete" || key === "Backspace") {
        if (
          activeSlide &&
          selection != null &&
          selection.slideId === activeSlide.id &&
          activeSlide.layout_id !== BUILTIN_LAYOUT_IDS.salaryVarianceOverview
        ) {
          if (selection.kind === "slide") {
            event.preventDefault();
            removeSlideElement(activeSlide.id, selection.elementId);
            clearSelection();
            return;
          }
          if (selection.kind === "layout" && activeLayout) {
            const le = activeLayout.elements.find((e) => e.id === selection.layoutElementId);
            if (le?.element_type === "placeholder") {
              event.preventDefault();
              suppressLayoutPlaceholder(activeSlide.id, selection.layoutElementId);
              clearSelection();
            }
          }
        }
        return;
      }
      if (key === "Escape") {
        clearSelection();
        return;
      }
      if (key === "ArrowLeft" || key === "ArrowUp") {
        if (safeIndex <= 0) return;
        event.preventDefault();
        goPrevious();
        return;
      }
      if (key === "ArrowRight" || key === "ArrowDown") {
        if (safeIndex >= visibleSlides.length - 1) return;
        event.preventDefault();
        goNext();
        return;
      }
      if (key === "Home") {
        if (visibleSlides.length === 0 || safeIndex === 0) return;
        event.preventDefault();
        goFirst();
        return;
      }
      if (key === "End") {
        if (visibleSlides.length === 0 || safeIndex === visibleSlides.length - 1) return;
        event.preventDefault();
        goLast();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    slideDeckTabActive,
    authoringSurface,
    previewActive,
    onPreviewChange,
    activeLayout,
    activeSlide,
    selection,
    setSelection,
    theme,
    clearSelection,
    goPrevious,
    goNext,
    goFirst,
    goLast,
    removeSlideElement,
    suppressLayoutPlaceholder,
    safeIndex,
    visibleSlides.length,
  ]);

  useEffect(() => {
    if (!slideDeckTabActive) return;
    if (authoringSurface !== "layout" && authoringSurface !== "themeMaster") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableKeyboardTarget(event.target)) return;
      if (event.key === "Escape") {
        event.preventDefault();
        exitToSlideAuthoring();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [slideDeckTabActive, authoringSurface, exitToSlideAuthoring]);

  const layoutMode = authoringSurface === "layout" && editingLayout != null;
  const themeMasterMode = authoringSurface === "themeMaster" && editingTheme != null;
  const masterMode = layoutMode || themeMasterMode;
  const modeBarSurface = themeMasterMode ? "themeMaster" : layoutMode ? "layout" : "slide";
  const showSlidePreviewChrome = previewActive && !masterMode && authoringSurface === "slide";

  return (
    <Box
      sx={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: precisionLedgerColors.surfaceContainerLow,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: showSlidePreviewChrome ? "none" : SLIDE_STAGE_MAX_WIDTH_PX,
            alignSelf: showSlidePreviewChrome ? "stretch" : "center",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: showSlidePreviewChrome ? 0 : "20px",
            boxSizing: "border-box",
          }}
        >
          {!showSlidePreviewChrome ? (
            <SlideAuthoringModeBar
              surface={modeBarSurface}
              slideLabel={
                visibleSlides.length > 0 ? `Slide ${safeIndex + 1} of ${visibleSlides.length}` : undefined
              }
              layoutName={editingLayout?.name}
              themeName={editingTheme?.name}
              onCloseMasterView={masterMode ? exitToSlideAuthoring : undefined}
            />
          ) : null}
          {!masterMode && !showSlidePreviewChrome ? (
            <SlideInsertionToolbar
              onInsertTextBox={handleInsertTextBox}
              onInsertShape={handleInsertShape}
              onChartPicked={handleChartPicked}
              onRevertSlide={handleRevertSlide}
              onPreview={() => onPreviewChange?.(true)}
            />
          ) : null}
          <SlideCanvasStage>
            {themeMasterMode && editingTheme ? (
              <ThemeEditorShell key={editingTheme.id} theme={editingTheme} />
            ) : layoutMode && editingLayout ? (
              <LayoutEditorShell key={editingLayout.id} layout={editingLayout} />
            ) : activeSlide && activeSlide.layout_id === BUILTIN_LAYOUT_IDS.salaryVarianceOverview ? (
              <SampleSalaryVarianceSlideContent
                key={activeSlide.id}
                slideIndex={safeIndex + 1}
                slideCount={visibleSlides.length}
              />
            ) : activeSlide && activeLayout ? (
              <SlideAuthoringCanvas
                key={activeSlide.id}
                theme={theme}
                layout={activeLayout}
                slide={activeSlide}
                slideIndex={safeIndex + 1}
                slideCount={visibleSlides.length}
                onInlineTextEditStart={handleInlineTextEditStart}
                presentationMode={showSlidePreviewChrome}
              />
            ) : null}
          </SlideCanvasStage>
        </Box>
      </Box>

      <SlideDeckBottomNav
        variant={themeMasterMode ? "themeMaster" : layoutMode ? "layout" : "slide"}
        layoutName={editingLayout?.name}
        themeName={editingTheme?.name}
        slideCount={visibleSlides.length}
        activeIndex={safeIndex}
        onPrevious={goPrevious}
        onNext={goNext}
        canGoPrevious={safeIndex > 0}
        canGoNext={safeIndex < visibleSlides.length - 1}
        onAddSlideAfterCurrent={
          masterMode || showSlidePreviewChrome ? undefined : handleAddSlideAfterCurrent
        }
      />
      {!showSlidePreviewChrome ? (
        <SlideDeckRightPanel
          open={rightPanelOpen}
          onOpenChange={setRightPanelOpen}
          panelMode={rightPanelMode}
          onPanelModeChange={setRightPanelMode}
        />
      ) : null}
    </Box>
  );
}
