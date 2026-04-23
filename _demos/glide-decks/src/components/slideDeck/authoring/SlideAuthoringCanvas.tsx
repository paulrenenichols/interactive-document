import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useDocumentDataModel } from "../../../data/DocumentDataModelContext";
import { useSlideDeck } from "../../../data/SlideDeckContext";
import {
  type SlideAuthoringSelection,
  useSlideElementSelection,
} from "../../../data/SlideElementSelectionContext";
import { useAppDocument } from "../../../state/AppDocumentContext";
import { isLayoutPlaceholderHiddenOnSlide } from "../../../slideDeck/layoutPlaceholderVisibility";
import {
  materializeLayoutPlaceholderTextBox,
  materializeThemePlaceholderTextBox,
} from "../../../slideDeck/materializeLayoutTextBox";
import { isThemePlaceholderHiddenOnSlide } from "../../../slideDeck/themePlaceholderVisibility";
import {
  getPlaceholderDefaultStyle,
  isTextRunStyleUnset,
  textRunStyleToCss,
} from "../../../slideDeck/placeholderTypography";
import { precisionLedgerColors } from "../../../slideDeck/precisionLedgerUi";
import { resolveColorToken, resolveFillToCss } from "../../../slideDeck/resolveFillToCss";
import { resolveSpecialRunKind } from "../../../slideDeck/specialRuns";
import { isSlideAuthoringTypingKey } from "../../../slideDeck/slideAuthoringTypingKey";
import { beginSlideTextBoxMoveDrag } from "../../../slideDeck/slideTextBoxMoveDrag";
import { applyTypingWhileTextBoxSelected, textBoxSpecToPlainText } from "../../../slideDeck/textBoxSpecPlainText";
import { getParagraphEditingMode } from "../../../slideDeck/paragraphEditingMode";
import { useSlideTextEdit } from "../../../data/SlideTextEditContext";
import { emuToPx } from "../../../slideDeck/units";
import type {
  ChartPlacementSpec,
  LayoutElement,
  PlaceholderRole,
  ShapeSpec,
  SlideDeckLayout,
  SlideDeckSlide,
  SlideDeckTheme,
  SlideElement,
  TextBoxSpec,
  TextRunStyle,
  ThemeElement,
} from "../../../types/slideDeck";
import { DEFAULT_SLIDE_WIDTH_EMU } from "../../../types/slideDeck/constants";
import { pointInRotatedRectSlidePx } from "../../../slideDeck/slideShapeGeometry";
import { isChartSlideElement, isShapeSlideElement, isTextBoxSlideElement } from "../../../types/slideDeck/slide";
import { SlideShapeSvg } from "../SlideShapeSvg";
import { SlideTextBoxLexicalEditor } from "../SlideTextBoxLexicalEditor";
import { SlideTextBoxTypography } from "../SlideTextBoxTypography";
import { SelectionChrome } from "./SelectionChrome";
import { SlideChartAuthoringPreview } from "./SlideChartAuthoringPreview";
import { SlideChartSelectionOverlay } from "./SlideChartSelectionOverlay";
import { SlideShapeSelectionOverlay } from "./SlideShapeSelectionOverlay";
import { SlideTextBoxSelectionOverlay } from "./SlideTextBoxSelectionOverlay";

export interface SlideAuthoringCanvasProps {
  theme: SlideDeckTheme;
  layout: SlideDeckLayout;
  slide: SlideDeckSlide;
  /** 1-based visible slide index */
  slideIndex: number;
  slideCount: number;
  /** When inline text editing starts (placeholder materialize or text box double-click). */
  onInlineTextEditStart?: () => void;
  /** Read-only presentation: no selection, edit, or authoring chrome; charts use reader interactions. */
  presentationMode?: boolean;
}

function emuRectToPx(
  box: { x: number; y: number; width: number; height: number },
  pxPerEmu: number,
): { x: number; y: number; width: number; height: number } {
  return {
    x: emuToPx(box.x, pxPerEmu),
    y: emuToPx(box.y, pxPerEmu),
    width: emuToPx(box.width, pxPerEmu),
    height: emuToPx(box.height, pxPerEmu),
  };
}

function pointInRect(px: number, py: number, x: number, y: number, w: number, h: number): boolean {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

function layoutPlaceholderLabel(el: LayoutElement): string {
  if (el.element_type !== "placeholder") return "";
  const spec = el.spec as TextBoxSpec;
  return spec.placeholder_hint ?? textBoxSpecToPlainText(spec) ?? "";
}

function themePlaceholderLabel(el: ThemeElement): string {
  if (el.element_type !== "placeholder") return "";
  const spec = el.spec as TextBoxSpec;
  return spec.placeholder_hint ?? textBoxSpecToPlainText(spec) ?? "";
}

function themeTextLabel(el: ThemeElement): string {
  if (el.element_type !== "text_box") return "";
  return textBoxSpecToPlainText(el.spec as TextBoxSpec);
}

function resolveLayoutPlaceholderPreviewStyle(
  spec: TextBoxSpec,
  theme: SlideDeckTheme,
  role: PlaceholderRole | undefined,
): TextRunStyle {
  if (!isTextRunStyleUnset(spec.default_style)) {
    return spec.default_style;
  }
  if (role != null) {
    return getPlaceholderDefaultStyle(theme, role);
  }
  return {};
}

/**
 * Data-driven slide surface for authoring: composites theme → layout → slide per §14.1, maps EMU to px from
 * container width, and hosts pointer hit-testing, selection chrome, delayed tooltips, and slide text edit.
 */
export function SlideAuthoringCanvas({
  theme,
  layout,
  slide,
  slideIndex,
  slideCount,
  onInlineTextEditStart,
  presentationMode = false,
}: SlideAuthoringCanvasProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [widthPx, setWidthPx] = useState(0);
  const { addSlideElement, updateSlideElement } = useSlideDeck();
  const { chartAssetRows } = useDocumentDataModel();
  const chartNameById = useMemo(
    () => new Map(chartAssetRows.map((r) => [r.id, r.name] as const)),
    [chartAssetRows],
  );
  const chartRowById = useMemo(
    () => new Map(chartAssetRows.map((r) => [r.id, r] as const)),
    [chartAssetRows],
  );
  const { selection, setSelection, clearSelection } = useSlideElementSelection();
  const { documentTitle } = useAppDocument();
  const { setSlideTextEdit, clearSlideTextEdit } = useSlideTextEdit();
  const [editingSlideElementId, setEditingSlideElementId] = useState<string | null>(null);
  const [editDraftSpec, setEditDraftSpec] = useState<TextBoxSpec | null>(null);
  const editDraftSpecRef = useRef<TextBoxSpec | null>(null);
  editDraftSpecRef.current = editDraftSpec;
  const [lexicalResetKey, setLexicalResetKey] = useState(0);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidthPx(el.offsetWidth));
    ro.observe(el);
    setWidthPx(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    clearSelection();
    setEditingSlideElementId(null);
    setEditDraftSpec(null);
    clearSlideTextEdit();
  }, [slide.id, clearSelection, clearSlideTextEdit]);

  useEffect(() => {
    if (editingSlideElementId != null) {
      onInlineTextEditStart?.();
    }
  }, [editingSlideElementId, onInlineTextEditStart]);

  const editingSpecFromStoreKey = useMemo(() => {
    if (!editingSlideElementId) return null;
    const el = slide.elements.find((e) => e.id === editingSlideElementId);
    if (!el || !isTextBoxSlideElement(el)) return null;
    return JSON.stringify(el.spec);
  }, [editingSlideElementId, slide.elements]);

  /** When the store copy of the editing text box changes (e.g. Design panel), resync draft + Lexical. */
  useEffect(() => {
    if (editingSpecFromStoreKey == null || !editingSlideElementId) return;
    const el = slide.elements.find((e) => e.id === editingSlideElementId);
    if (!el || !isTextBoxSlideElement(el)) return;
    const draft = editDraftSpecRef.current;
    if (draft != null && JSON.stringify(el.spec) === JSON.stringify(draft)) return;
    setEditDraftSpec(structuredClone(el.spec));
    setLexicalResetKey((k) => k + 1);
  }, [editingSlideElementId, editingSpecFromStoreKey, slide.elements]);

  const pxPerEmu = widthPx > 0 ? widthPx / DEFAULT_SLIDE_WIDTH_EMU : 0;

  const overriddenLayoutIds = useMemo(
    () => new Set(slide.elements.map((e) => e.layout_element_id).filter((x): x is string => Boolean(x))),
    [slide.elements],
  );

  const overriddenThemeIds = useMemo(
    () => new Set(slide.elements.map((e) => e.theme_element_id).filter((x): x is string => Boolean(x))),
    [slide.elements],
  );

  const footerTitle = resolveSpecialRunKind("document_title", {
    documentTitle,
    slideOrderIndex: slideIndex,
    totalNonHiddenSlides: slideCount,
  });

  const hitTest = useCallback(
    (clientX: number, clientY: number): SlideAuthoringSelection | null => {
      const root = rootRef.current;
      if (!root || pxPerEmu <= 0) return null;
      const rect = root.getBoundingClientRect();
      const logicalW = root.offsetWidth;
      const logicalH = root.offsetHeight;
      const x = ((clientX - rect.left) / rect.width) * logicalW;
      const y = ((clientY - rect.top) / rect.height) * logicalH;

      const slideSorted = [...slide.elements].filter((e) => !e.hidden).sort((a, b) => b.z_index - a.z_index);
      for (const el of slideSorted) {
        const b = emuRectToPx(el, pxPerEmu);
        const inside = isShapeSlideElement(el)
          ? pointInRotatedRectSlidePx(x, y, b, el.rotation_deg ?? 0)
          : pointInRect(x, y, b.x, b.y, b.width, b.height);
        if (inside) {
          return { kind: "slide", slideId: slide.id, elementId: el.id };
        }
      }

      const layoutSorted = [...layout.elements].sort((a, b) => b.z_index - a.z_index);
      for (const el of layoutSorted) {
        if (el.element_type === "placeholder" && isLayoutPlaceholderHiddenOnSlide(el.id, overriddenLayoutIds, slide))
          continue;
        const b = emuRectToPx(el, pxPerEmu);
        if (pointInRect(x, y, b.x, b.y, b.width, b.height)) {
          return { kind: "layout", slideId: slide.id, layoutElementId: el.id };
        }
      }

      const themeSorted = [...theme.master_elements].filter((e) => !e.locked).sort((a, b) => b.z_index - a.z_index);
      for (const el of themeSorted) {
        if (el.element_type === "placeholder" && isThemePlaceholderHiddenOnSlide(el.id, overriddenThemeIds, slide))
          continue;
        const b = emuRectToPx(el, pxPerEmu);
        if (pointInRect(x, y, b.x, b.y, b.width, b.height)) {
          return { kind: "theme", slideId: slide.id, themeElementId: el.id };
        }
      }

      return null;
    },
    [layout.elements, overriddenLayoutIds, overriddenThemeIds, pxPerEmu, slide, theme.master_elements],
  );

  const beginEditSlideTextBox = useCallback(
    (elementId: string) => {
      const el = slide.elements.find((e) => e.id === elementId);
      if (!el || !isTextBoxSlideElement(el)) return;
      const next = structuredClone(el.spec);
      setEditDraftSpec(next);
      setEditingSlideElementId(elementId);
      setSlideTextEdit({ slideId: slide.id, elementId, liveSpec: next, textSelection: null });
    },
    [setSlideTextEdit, slide.elements, slide.id],
  );

  const commitEdit = useCallback(() => {
    if (!editingSlideElementId || !editDraftSpec) return;
    const el = slide.elements.find((e) => e.id === editingSlideElementId);
    if (el && isTextBoxSlideElement(el)) {
      updateSlideElement(slide.id, editingSlideElementId, { spec: editDraftSpec });
    }
    setEditingSlideElementId(null);
    setEditDraftSpec(null);
    clearSlideTextEdit();
  }, [clearSlideTextEdit, editDraftSpec, editingSlideElementId, slide.elements, slide.id, updateSlideElement]);

  const cancelEdit = useCallback(() => {
    setEditingSlideElementId(null);
    setEditDraftSpec(null);
    clearSlideTextEdit();
  }, [clearSlideTextEdit]);

  const handleDoubleClickLayoutPlaceholder = useCallback(
    (layoutEl: LayoutElement) => {
      if (layoutEl.element_type !== "placeholder") return;
      const materialized = materializeLayoutPlaceholderTextBox(slide.id, layoutEl, theme);
      addSlideElement(slide.id, materialized);
      setSelection({ kind: "slide", slideId: slide.id, elementId: materialized.id });
      const draft = structuredClone(materialized.spec);
      setEditDraftSpec(draft);
      setSlideTextEdit({ slideId: slide.id, elementId: materialized.id, liveSpec: draft, textSelection: null });
      setEditingSlideElementId(materialized.id);
    },
    [addSlideElement, setSelection, setSlideTextEdit, slide.id, theme],
  );

  const handleDoubleClickThemePlaceholder = useCallback(
    (themeEl: ThemeElement) => {
      if (themeEl.element_type !== "placeholder") return;
      const materialized = materializeThemePlaceholderTextBox(slide.id, themeEl, theme);
      addSlideElement(slide.id, materialized);
      setSelection({ kind: "slide", slideId: slide.id, elementId: materialized.id });
      const draft = structuredClone(materialized.spec);
      setEditDraftSpec(draft);
      setSlideTextEdit({ slideId: slide.id, elementId: materialized.id, liveSpec: draft, textSelection: null });
      setEditingSlideElementId(materialized.id);
    },
    [addSlideElement, setSelection, setSlideTextEdit, slide.id, theme],
  );

  const handleRootPointerDownCapture = useCallback(
    (e: React.PointerEvent) => {
      if (presentationMode) return;
      if (e.button !== 0) return;
      /** Handles sit outside the element box; hitTest would miss and clear selection before resize/move runs. */
      const target = e.target;
      if (target instanceof HTMLElement && target.closest("[data-slide-selection-overlay]")) {
        return;
      }
      if (editingSlideElementId) {
        const t = e.target;
        if (t instanceof HTMLTextAreaElement) return;
        if (t instanceof HTMLElement) {
          if (t.isContentEditable || t.closest('[contenteditable="true"]')) return;
          if (t.hasAttribute("data-slide-text-box-root")) return;
        }
        commitEdit();
      }
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit) clearSelection();
      else setSelection(hit);
    },
    [clearSelection, commitEdit, editingSlideElementId, hitTest, presentationMode, setSelection],
  );

  const handleRootKeyDownCapture = useCallback(
    (e: React.KeyboardEvent) => {
      if (presentationMode) return;
      if (editingSlideElementId) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.nativeEvent.isComposing) return;
      if (!isSlideAuthoringTypingKey(e)) return;
      if (!selection || selection.slideId !== slide.id) return;

      if (selection.kind === "slide") {
        const el = slide.elements.find((x) => x.id === selection.elementId);
        if (!el || !isTextBoxSlideElement(el)) return;
        e.preventDefault();
        e.stopPropagation();
        const next = applyTypingWhileTextBoxSelected(el.spec, e.key);
        setEditDraftSpec(next);
        setSlideTextEdit({ slideId: slide.id, elementId: el.id, liveSpec: next, textSelection: null });
        setEditingSlideElementId(el.id);
        return;
      }

      if (selection.kind === "layout") {
        const layoutEl = layout.elements.find((x) => x.id === selection.layoutElementId);
        if (!layoutEl || layoutEl.element_type !== "placeholder") return;
        if (isLayoutPlaceholderHiddenOnSlide(layoutEl.id, overriddenLayoutIds, slide)) return;
        e.preventDefault();
        e.stopPropagation();
        const materialized = materializeLayoutPlaceholderTextBox(slide.id, layoutEl, theme);
        const specToUse = applyTypingWhileTextBoxSelected(materialized.spec, e.key);
        addSlideElement(slide.id, { ...materialized, spec: specToUse });
        setSelection({ kind: "slide", slideId: slide.id, elementId: materialized.id });
        setEditDraftSpec(specToUse);
        setSlideTextEdit({
          slideId: slide.id,
          elementId: materialized.id,
          liveSpec: specToUse,
          textSelection: null,
        });
        setEditingSlideElementId(materialized.id);
        return;
      }

      if (selection.kind === "theme") {
        const themeEl = theme.master_elements.find((x) => x.id === selection.themeElementId);
        if (!themeEl || themeEl.element_type !== "placeholder") return;
        if (isThemePlaceholderHiddenOnSlide(themeEl.id, overriddenThemeIds, slide)) return;
        e.preventDefault();
        e.stopPropagation();
        const materialized = materializeThemePlaceholderTextBox(slide.id, themeEl, theme);
        const specToUse = applyTypingWhileTextBoxSelected(materialized.spec, e.key);
        addSlideElement(slide.id, { ...materialized, spec: specToUse });
        setSelection({ kind: "slide", slideId: slide.id, elementId: materialized.id });
        setEditDraftSpec(specToUse);
        setSlideTextEdit({
          slideId: slide.id,
          elementId: materialized.id,
          liveSpec: specToUse,
          textSelection: null,
        });
        setEditingSlideElementId(materialized.id);
      }
    },
    [
      addSlideElement,
      editingSlideElementId,
      layout.elements,
      overriddenLayoutIds,
      overriddenThemeIds,
      selection,
      setEditDraftSpec,
      setEditingSlideElementId,
      setSelection,
      setSlideTextEdit,
      slide,
      theme,
      presentationMode,
    ],
  );

  const selectionBounds = useMemo(() => {
    if (presentationMode) return null;
    if (!selection || pxPerEmu <= 0) return null;
    if (selection.kind === "slide") {
      const el = slide.elements.find((e) => e.id === selection.elementId);
      if (!el) return null;
      return emuRectToPx(el, pxPerEmu);
    }
    if (selection.kind === "layout") {
      const el = layout.elements.find((e) => e.id === selection.layoutElementId);
      if (!el) return null;
      return emuRectToPx(el, pxPerEmu);
    }
    const el = theme.master_elements.find((e) => e.id === selection.themeElementId);
    if (!el) return null;
    return emuRectToPx(el, pxPerEmu);
  }, [layout.elements, presentationMode, pxPerEmu, selection, slide.elements, theme.master_elements]);

  const selectedSlideTextBox = useMemo(() => {
    if (!selection || selection.kind !== "slide") return null;
    const el = slide.elements.find((e) => e.id === selection.elementId);
    if (!el || !isTextBoxSlideElement(el)) return null;
    return el;
  }, [selection, slide.elements]);

  const selectedSlideChart = useMemo(() => {
    if (!selection || selection.kind !== "slide") return null;
    const el = slide.elements.find((e) => e.id === selection.elementId);
    if (!el || !isChartSlideElement(el)) return null;
    return el;
  }, [selection, slide.elements]);

  const selectedSlideShape = useMemo(() => {
    if (!selection || selection.kind !== "slide") return null;
    const el = slide.elements.find((e) => e.id === selection.elementId);
    if (!el || !isShapeSlideElement(el)) return null;
    return el;
  }, [selection, slide.elements]);

  const selectedChartLockedAspectRatio = useMemo(() => {
    if (!selectedSlideChart) return undefined;
    const spec = selectedSlideChart.spec as ChartPlacementSpec;
    if (!spec.aspect_ratio_locked) return undefined;
    const ar = chartRowById.get(spec.chart_id)?.appearance?.aspectRatio;
    return ar != null && ar > 0 ? ar : undefined;
  }, [chartRowById, selectedSlideChart]);

  const hasTypeableSelection = useMemo(() => {
    if (!selection || selection.slideId !== slide.id) return false;
    if (selection.kind === "slide") {
      const el = slide.elements.find((x) => x.id === selection.elementId);
      return el != null && isTextBoxSlideElement(el);
    }
    if (selection.kind === "layout") {
      const el = layout.elements.find((x) => x.id === selection.layoutElementId);
      return el != null && el.element_type === "placeholder" && !overriddenLayoutIds.has(el.id);
    }
    if (selection.kind === "theme") {
      const el = theme.master_elements.find((x) => x.id === selection.themeElementId);
      return el != null && el.element_type === "placeholder" && !overriddenThemeIds.has(el.id);
    }
    return false;
  }, [layout.elements, overriddenLayoutIds, overriddenThemeIds, selection, slide.elements, slide.id, theme.master_elements]);

  useLayoutEffect(() => {
    if (presentationMode) return;
    if (editingSlideElementId != null) return;
    if (!hasTypeableSelection) return;
    rootRef.current?.focus({ preventScroll: true });
  }, [editingSlideElementId, hasTypeableSelection, presentationMode]);

  const themeBg = resolveFillToCss(theme.background_fill, theme.color_palette);
  const layoutBg = layout.background_fill_override
    ? resolveFillToCss(layout.background_fill_override, theme.color_palette)
    : null;
  const slideBg =
    slide.background_fill_override != null
      ? resolveFillToCss(slide.background_fill_override, theme.color_palette)
      : null;

  const slideSortedForPaint = useMemo(
    () => [...slide.elements].filter((e) => !e.hidden).sort((a, b) => a.z_index - b.z_index),
    [slide.elements],
  );
  const layoutSortedForPaint = useMemo(
    () => [...layout.elements].sort((a, b) => a.z_index - b.z_index),
    [layout.elements],
  );
  const themeSortedForPaint = useMemo(
    () => [...theme.master_elements].sort((a, b) => a.z_index - b.z_index),
    [theme.master_elements],
  );

  const boxStyle = (b: { x: number; y: number; width: number; height: number }): CSSProperties => {
    const r = emuRectToPx(b, pxPerEmu);
    return {
      position: "absolute",
      left: r.x,
      top: r.y,
      width: r.width,
      height: r.height,
      boxSizing: "border-box",
    };
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        minHeight: 0,
        bgcolor: precisionLedgerColors.surfaceContainerLowest,
        overflow: "hidden",
      }}
    >
      <Box
        ref={rootRef}
        tabIndex={-1}
        onPointerDownCapture={handleRootPointerDownCapture}
        onKeyDownCapture={handleRootKeyDownCapture}
        sx={{
          position: "relative",
          flex: 1,
          width: "100%",
          minHeight: 0,
          overflow: "hidden",
          outline: "none",
        }}
      >
      <Box sx={{ position: "absolute", inset: 0, bgcolor: themeBg, pointerEvents: "none" }} />

      {themeSortedForPaint.map((el) => {
        if (el.element_type === "placeholder" && isThemePlaceholderHiddenOnSlide(el.id, overriddenThemeIds, slide))
          return null;
        return (
          <ThemeElementView
            key={el.id}
            element={el}
            theme={theme}
            boxStyle={boxStyle(el)}
            pxPerEmu={pxPerEmu}
            presentationMode={presentationMode}
            onPlaceholderDoubleClick={
              el.element_type === "placeholder" && !presentationMode
                ? () => handleDoubleClickThemePlaceholder(el)
                : undefined
            }
          />
        );
      })}

      {layoutBg != null ? (
        <Box sx={{ position: "absolute", inset: 0, bgcolor: layoutBg, pointerEvents: "none" }} />
      ) : null}

      {slideBg != null ? (
        <Box sx={{ position: "absolute", inset: 0, bgcolor: slideBg, pointerEvents: "none" }} />
      ) : null}

      {layoutSortedForPaint.map((el) => {
        if (el.element_type === "placeholder" && isLayoutPlaceholderHiddenOnSlide(el.id, overriddenLayoutIds, slide))
          return null;
        return (
          <LayoutElementView
            key={el.id}
            element={el}
            theme={theme}
            boxStyle={boxStyle(el)}
            pxPerEmu={pxPerEmu}
            tooltip="Element editable from Layout view"
            showTooltip={!presentationMode}
            presentationMode={presentationMode}
            onPlaceholderDoubleClick={
              el.element_type === "placeholder" && !presentationMode
                ? () => handleDoubleClickLayoutPlaceholder(el)
                : undefined
            }
          />
        );
      })}

      {slideSortedForPaint.map((el) => {
        let chartDisplayLabel: string | undefined;
        if (el.element_type === "chart") {
          const spec = el.spec as ChartPlacementSpec;
          chartDisplayLabel = spec.title_override ?? chartNameById.get(spec.chart_id) ?? "Chart";
        }
        const moveFromChrome =
          !presentationMode &&
          isTextBoxSlideElement(el) &&
          selectedSlideTextBox?.id === el.id &&
          pxPerEmu > 0
            ? (ev: React.PointerEvent) => {
                if (ev.button !== 0 || ev.target !== ev.currentTarget) return;
                ev.preventDefault();
                beginSlideTextBoxMoveDrag({
                  rootEl: rootRef.current,
                  pxPerEmu,
                  startEmu: { x: el.x, y: el.y, width: el.width, height: el.height },
                  clientX: ev.clientX,
                  clientY: ev.clientY,
                  onCommit: (next) => updateSlideElement(slide.id, el.id, next),
                });
              }
            : undefined;
        return (
          <SlideElementView
            key={el.id}
            element={el}
            theme={theme}
            boxStyle={boxStyle(el)}
            pxPerEmu={pxPerEmu}
            editing={!presentationMode && editingSlideElementId === el.id}
            editDraftSpec={editingSlideElementId === el.id ? editDraftSpec : null}
            setEditDraftSpec={setEditDraftSpec}
            lexicalResetKey={editingSlideElementId === el.id ? lexicalResetKey : 0}
            slideId={slide.id}
            slideIndex={slideIndex}
            slideCount={slideCount}
            documentTitle={documentTitle}
            onCommitEdit={commitEdit}
            onCancelEdit={cancelEdit}
            onBeginEdit={() => beginEditSlideTextBox(el.id)}
            chartDisplayLabel={chartDisplayLabel}
            onMoveFromChromePointerDown={moveFromChrome}
            presentationMode={presentationMode}
          />
        );
      })}

      {selectionBounds != null &&
        (selectedSlideTextBox ? (
          <SlideTextBoxSelectionOverlay
            rootRef={rootRef}
            pxPerEmu={pxPerEmu}
            pxBounds={selectionBounds}
            emuRect={{
              x: selectedSlideTextBox.x,
              y: selectedSlideTextBox.y,
              width: selectedSlideTextBox.width,
              height: selectedSlideTextBox.height,
            }}
            onCommitEmu={(next) => updateSlideElement(slide.id, selectedSlideTextBox.id, next)}
          />
        ) : editingSlideElementId ? null : selectedSlideChart ? (
          <SlideChartSelectionOverlay
            rootRef={rootRef}
            pxPerEmu={pxPerEmu}
            pxBounds={selectionBounds}
            emuRect={{
              x: selectedSlideChart.x,
              y: selectedSlideChart.y,
              width: selectedSlideChart.width,
              height: selectedSlideChart.height,
            }}
            onCommitEmu={(next) => updateSlideElement(slide.id, selectedSlideChart.id, next)}
            lockedAspectRatio={selectedChartLockedAspectRatio}
          />
        ) : selectedSlideShape ? (
          <SlideShapeSelectionOverlay
            rootRef={rootRef}
            pxPerEmu={pxPerEmu}
            pxBounds={selectionBounds}
            emuRect={{
              x: selectedSlideShape.x,
              y: selectedSlideShape.y,
              width: selectedSlideShape.width,
              height: selectedSlideShape.height,
            }}
            rotationDeg={selectedSlideShape.rotation_deg ?? 0}
            onCommit={(patch) => updateSlideElement(slide.id, selectedSlideShape.id, patch)}
          />
        ) : (
          <SelectionChrome
            x={selectionBounds.x}
            y={selectionBounds.y}
            width={selectionBounds.width}
            height={selectionBounds.height}
          />
        ))}

      </Box>

      <Box
        component="footer"
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${precisionLedgerColors.surfaceContainerHigh}`,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "10px",
          color: precisionLedgerColors.secondaryText,
          pointerEvents: "none",
        }}
      >
        <Typography sx={{ fontFamily: "inherit", fontSize: "inherit" }}>{footerTitle}</Typography>
        <Typography sx={{ fontFamily: "inherit", fontSize: "inherit" }}>
          {slideIndex} / {slideCount}
        </Typography>
      </Box>
    </Box>
  );
}

function ThemeElementView({
  element,
  theme,
  boxStyle,
  pxPerEmu,
  presentationMode = false,
  onPlaceholderDoubleClick,
}: {
  element: ThemeElement;
  theme: SlideDeckTheme;
  boxStyle: CSSProperties;
  pxPerEmu: number;
  presentationMode?: boolean;
  onPlaceholderDoubleClick?: () => void;
}) {
  if (element.element_type === "placeholder") {
    const spec = element.spec as TextBoxSpec;
    const role = spec.placeholder_role ?? element.placeholder_role;
    const label = themePlaceholderLabel(element);
    const previewStyle = resolveLayoutPlaceholderPreviewStyle(spec, theme, role);
    const typoCss = textRunStyleToCss(previewStyle, theme);
    const inner = (
      <Box
        onDoubleClick={(e) => {
          e.stopPropagation();
          onPlaceholderDoubleClick?.();
        }}
        sx={{
          ...boxStyle,
          display: "flex",
          alignItems: "flex-start",
          p: 0.5,
          overflow: "hidden",
          border: "1px dashed",
          borderColor: "divider",
          cursor: presentationMode ? "default" : "all-scroll",
          pointerEvents: presentationMode ? "none" : undefined,
        }}
      >
        <Typography component="div" variant="body2" sx={{ ...typoCss, cursor: presentationMode ? "default" : "text" }}>
          {label || " "}
        </Typography>
      </Box>
    );
    return presentationMode ? (
      inner
    ) : (
      <Tooltip title="Element editable from Theme view" enterDelay={400} disableInteractive>
        {inner}
      </Tooltip>
    );
  }
  if (element.element_type === "text_box") {
    const label = themeTextLabel(element);
    const tb = (
        <Box
          sx={{
            ...boxStyle,
            display: "flex",
            alignItems: "flex-start",
            p: 0.5,
            overflow: "hidden",
            cursor: "default",
            pointerEvents: presentationMode ? "none" : undefined,
          }}
        >
          <Typography variant="body2" sx={{ color: precisionLedgerColors.onSurface, fontFamily: theme.font_config.body_family }}>
            {label || " "}
          </Typography>
        </Box>
    );
    return presentationMode ? (
      tb
    ) : (
      <Tooltip title="Element editable from Theme view" enterDelay={400} disableInteractive>
        {tb}
      </Tooltip>
    );
  }
  if (element.element_type === "shape") {
    const spec = element.spec as ShapeSpec;
    const r = emuRectToPx(
      { x: element.x, y: element.y, width: element.width, height: element.height },
      pxPerEmu,
    );
    const sh = (
        <Box sx={{ ...boxStyle, cursor: "default", overflow: "hidden", pointerEvents: presentationMode ? "none" : undefined }}>
          <SlideShapeSvg spec={spec} theme={theme} widthPx={r.width} heightPx={r.height} pxPerEmu={pxPerEmu} />
        </Box>
    );
    return presentationMode ? (
      sh
    ) : (
      <Tooltip title="Element editable from Theme view" enterDelay={400} disableInteractive>
        {sh}
      </Tooltip>
    );
  }
  const fallback = <Box sx={{ ...boxStyle, bgcolor: "action.hover", cursor: "default", pointerEvents: presentationMode ? "none" : undefined }} />;
  return presentationMode ? (
    fallback
  ) : (
    <Tooltip title="Element editable from Theme view" enterDelay={400} disableInteractive>
      {fallback}
    </Tooltip>
  );
}

function LayoutElementView({
  element,
  theme,
  boxStyle,
  pxPerEmu,
  tooltip,
  showTooltip,
  presentationMode = false,
  onPlaceholderDoubleClick,
}: {
  element: LayoutElement;
  theme: SlideDeckTheme;
  boxStyle: CSSProperties;
  pxPerEmu: number;
  tooltip: string;
  showTooltip: boolean;
  presentationMode?: boolean;
  onPlaceholderDoubleClick?: () => void;
}) {
  if (element.element_type === "placeholder") {
    const spec = element.spec as TextBoxSpec;
    const role = spec.placeholder_role ?? element.placeholder_role;
    const label = layoutPlaceholderLabel(element);
    const previewStyle = resolveLayoutPlaceholderPreviewStyle(spec, theme, role);
    const typoCss = textRunStyleToCss(previewStyle, theme);
    const inner = (
      <Box
        onDoubleClick={(e) => {
          e.stopPropagation();
          onPlaceholderDoubleClick?.();
        }}
        sx={{
          ...boxStyle,
          display: "flex",
          alignItems: "flex-start",
          p: 0.5,
          overflow: "hidden",
          border: "1px dashed",
          borderColor: "divider",
          cursor: presentationMode ? "default" : "all-scroll",
          pointerEvents: presentationMode ? "none" : undefined,
        }}
      >
        <Typography component="div" variant="body2" sx={{ ...typoCss, cursor: presentationMode ? "default" : "text" }}>
          {label || " "}
        </Typography>
      </Box>
    );
    return showTooltip ? (
      <Tooltip title={tooltip} enterDelay={400} disableInteractive>
        {inner}
      </Tooltip>
    ) : (
      inner
    );
  }
  if (element.element_type === "shape") {
    const spec = element.spec as ShapeSpec;
    const r = emuRectToPx(
      { x: element.x, y: element.y, width: element.width, height: element.height },
      pxPerEmu,
    );
    const inner = (
      <Box sx={{ ...boxStyle, cursor: "default", overflow: "hidden", pointerEvents: presentationMode ? "none" : undefined }}>
        <SlideShapeSvg spec={spec} theme={theme} widthPx={r.width} heightPx={r.height} pxPerEmu={pxPerEmu} />
      </Box>
    );
    return showTooltip ? (
      <Tooltip title={tooltip} enterDelay={400} disableInteractive>
        {inner}
      </Tooltip>
    ) : (
      inner
    );
  }
  const inner = (
    <Box sx={{ ...boxStyle, bgcolor: "action.hover", cursor: "default", pointerEvents: presentationMode ? "none" : undefined }} />
  );
  return showTooltip ? (
    <Tooltip title={tooltip} enterDelay={400} disableInteractive>
      {inner}
    </Tooltip>
  ) : (
    inner
  );
}

function SlideElementView({
  element,
  theme,
  boxStyle,
  pxPerEmu,
  editing,
  editDraftSpec,
  setEditDraftSpec,
  lexicalResetKey,
  slideId,
  slideIndex,
  slideCount,
  documentTitle,
  onCommitEdit,
  onCancelEdit,
  onBeginEdit,
  chartDisplayLabel,
  onMoveFromChromePointerDown,
  presentationMode = false,
}: {
  element: SlideElement;
  theme: SlideDeckTheme;
  boxStyle: CSSProperties;
  pxPerEmu: number;
  editing: boolean;
  editDraftSpec: TextBoxSpec | null;
  setEditDraftSpec: (v: TextBoxSpec) => void;
  lexicalResetKey: number;
  slideId: string;
  slideIndex: number;
  slideCount: number;
  documentTitle: string;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onBeginEdit: () => void;
  /** Resolved label for chart elements (name from data model or title override). */
  chartDisplayLabel?: string;
  /** Move drag from padding / non-text chrome when the text box is selected. */
  onMoveFromChromePointerDown?: (e: React.PointerEvent) => void;
  presentationMode?: boolean;
}) {
  const { setSlideTextEdit } = useSlideTextEdit();

  if (isTextBoxSlideElement(element)) {
    const bgCss = resolveFillToCss(element.spec.fill, theme.color_palette);
    const br = element.spec.border;
    const borderCss =
      br && br.style !== "none"
        ? `${br.width_pt}pt ${br.style} ${resolveColorToken(br.color, theme.color_palette)}`
        : "none";
    const bgForEditor = bgCss === "transparent" ? "rgba(255,255,255,0.96)" : bgCss;
    const draft = editing && editDraftSpec ? editDraftSpec : element.spec;
    const multi = getParagraphEditingMode(draft) === "multi_paragraph";

    return (
      <Box
        data-slide-text-box-root=""
        sx={{
          ...boxStyle,
          display: "flex",
          alignItems: "flex-start",
          p: 0.5,
          overflow: "hidden",
          cursor: presentationMode ? "default" : "all-scroll",
          zIndex: 2,
          backgroundColor: bgCss,
          border: borderCss,
          boxSizing: "border-box",
          pointerEvents: presentationMode ? "none" : undefined,
          userSelect: presentationMode ? "none" : undefined,
        }}
        onPointerDown={(e) => {
          if (presentationMode) return;
          e.stopPropagation();
          if (onMoveFromChromePointerDown && e.target === e.currentTarget) {
            onMoveFromChromePointerDown(e);
          }
        }}
        onClick={(e) => {
          if (presentationMode) return;
          e.stopPropagation();
          if (e.detail === 2) onBeginEdit();
        }}
      >
        {editing && editDraftSpec ? (
          <SlideTextBoxLexicalEditor
            editorKey={`${slideId}-${element.id}-${lexicalResetKey}`}
            spec={editDraftSpec}
            theme={theme}
            pxPerEmu={pxPerEmu}
            multiParagraph={multi}
            backgroundColor={bgForEditor}
            onCommit={onCommitEdit}
            onCancel={onCancelEdit}
            onEditStateChange={(next, range) => {
              setEditDraftSpec(next);
              setSlideTextEdit({
                slideId,
                elementId: element.id,
                liveSpec: next,
                textSelection: range,
              });
            }}
          />
        ) : (
          <SlideTextBoxTypography
            spec={element.spec}
            theme={theme}
            pxPerEmu={pxPerEmu}
            specialCtx={{
              documentTitle,
              slideOrderIndex: slideIndex,
              totalNonHiddenSlides: slideCount,
            }}
          />
        )}
      </Box>
    );
  }

  if (element.element_type === "shape") {
    const r = emuRectToPx(
      { x: element.x, y: element.y, width: element.width, height: element.height },
      pxPerEmu,
    );
    const rot = element.rotation_deg ?? 0;
    return (
      <Box
        sx={{
          ...boxStyle,
          zIndex: 2,
          cursor: "default",
          overflow: "hidden",
          pointerEvents: presentationMode ? "none" : undefined,
          ...(rot !== 0
            ? {
                transform: `rotate(${rot}deg)`,
                transformOrigin: "center center",
              }
            : {}),
        }}
        onPointerDown={presentationMode ? undefined : (e) => e.stopPropagation()}
      >
        <SlideShapeSvg
          spec={element.spec}
          theme={theme}
          widthPx={r.width}
          heightPx={r.height}
          pxPerEmu={pxPerEmu}
        />
      </Box>
    );
  }

  if (element.element_type === "chart") {
    const spec = element.spec as ChartPlacementSpec;
    const frameWidthPx = emuToPx(element.width, pxPerEmu);
    const frameHeightPx = emuToPx(element.height, pxPerEmu);
    return (
      <Box
        sx={{
          ...boxStyle,
          zIndex: 2,
          overflow: "hidden",
        }}
        onPointerDown={presentationMode ? undefined : (e) => e.stopPropagation()}
      >
        <SlideChartAuthoringPreview
          chartId={spec.chart_id}
          frameWidthPx={frameWidthPx}
          frameHeightPx={frameHeightPx}
          ariaLabel={chartDisplayLabel ?? "Chart"}
          interactionSurface={presentationMode ? "readerPreview" : "slideAuthoring"}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{ ...boxStyle, zIndex: 2, bgcolor: "action.hover", pointerEvents: presentationMode ? "none" : undefined }}
      onPointerDown={presentationMode ? undefined : (e) => e.stopPropagation()}
    />
  );
}
