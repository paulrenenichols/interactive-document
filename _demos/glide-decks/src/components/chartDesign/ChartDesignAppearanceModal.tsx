import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { ChartBindingPreview } from "../dataModel/ChartBindingPreview";
import { ChartDesignAppearanceSidebar } from "./ChartDesignAppearanceSidebar";
import {
  estimateTitleBandPx,
  mergeAppearanceWithVisualDefaults,
  patchChartAppearanceVisual,
  resolveChartTitleDisplayText,
} from "../../chart/chartAppearanceVisual";
import {
  CHART_DESIGN_MODAL_TOP_OFFSET_PX,
  clampDragToBounds,
  clampFrameToBounds,
  resizeFrameFromHandle,
  resizeFrameFromHandleAspectFromStart,
  type ChartResizeHandle,
} from "../../chart/chartAppearanceLayout";
import type { ChartAppearanceLayout, ChartCreationKind, ChartDesignAxisId, DataSeriesAssetRow } from "../../types/dataModel";
import type { ChartBindingsState } from "../../types/chartBindings";
import { buildChartPreviewPayload, catalogByName, previewReadiness } from "../../chart/chartBindingPreviewData";
import { createFixtureSeriesValueResolver, type SeriesValueResolver } from "../../data/seriesValueResolver";
import { tokens } from "../../theme/tokens";

const designGridSx = {
  backgroundColor: "#ffffff",
  backgroundImage: `
    linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 1px, transparent 1px)
  `,
  backgroundSize: "24px 24px",
} as const;

const SIDEBAR_EXPANDED_PX = 300;
const SIDEBAR_COLLAPSED_PX = 48;

const HANDLE_PX = 10;

/** Pixels before chart title drag applies (allows double-click without moving). */
const TITLE_DRAG_THRESHOLD_PX = 4;

const GESTURE_LOG_TAG = "[chartDesignModal:gesture]";

function cursorForHandle(h: ChartResizeHandle): string {
  switch (h) {
    case "n":
    case "s":
      return "ns-resize";
    case "e":
    case "w":
      return "ew-resize";
    case "nw":
    case "se":
      return "nwse-resize";
    case "ne":
    case "sw":
      return "nesw-resize";
    default:
      return "default";
  }
}

export interface ChartDesignAppearanceModalProps {
  open: boolean;
  onClose: () => void;
  chartKind: ChartCreationKind;
  /** Chart asset name (globally unique id). Drives default title while `titleSource` is auto. */
  chartName: string;
  bindings: ChartBindingsState;
  availableSeries: DataSeriesAssetRow[];
  seriesValueResolver?: SeriesValueResolver;
  appearance: ChartAppearanceLayout;
  onAppearanceChange: (next: ChartAppearanceLayout) => void;
  /** When set, indexed Cartesian charts can edit secondary axes from this modal. */
  onBindingsChange?: (next: ChartBindingsState) => void;
}

export function ChartDesignAppearanceModal({
  open,
  onClose,
  chartKind,
  chartName,
  bindings,
  availableSeries,
  seriesValueResolver,
  appearance,
  onAppearanceChange,
  onBindingsChange,
}: ChartDesignAppearanceModalProps) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [plotAreaSectionOpen, setPlotAreaSectionOpen] = useState(false);
  const [titleInlineEditing, setTitleInlineEditing] = useState(false);
  const [titleEditDraft, setTitleEditDraft] = useState("");
  const titleBlurSkipRef = useRef(false);

  useEffect(() => {
    if (sidebarCollapsed) {
      setPlotAreaSectionOpen(false);
    }
  }, [sidebarCollapsed]);

  const dragRef = useRef<{
    kind: "move" | "resize";
    startFrame: ChartAppearanceLayout;
    startClientX: number;
    startClientY: number;
    handle?: ChartResizeHandle;
  } | null>(null);

  const [resizeTooltip, setResizeTooltip] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  /** True while pointer move/resize gesture is active — skips canvas clamp effect to avoid fighting drag. */
  const pointerGestureActiveRef = useRef(false);
  /** Last layout produced during drag or synced from props when idle. */
  const latestAppearanceRef = useRef(appearance);
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  /** Dev-only: log first early-return in a gesture once (stale canvas closure diagnosis). */
  const gestureEarlyReturnLoggedRef = useRef(false);
  const titleGestureRef = useRef<{
    startClientX: number;
    startClientY: number;
    startOx: number;
    startOy: number;
    dragging: boolean;
  } | null>(null);

  const mergedAppearance = useMemo(
    () => mergeAppearanceWithVisualDefaults(appearance, chartKind, bindings, chartName.trim() || "Chart"),
    [appearance, chartKind, bindings, chartName],
  );
  const designVisual = mergedAppearance.visual!;

  const defaultSeriesResolver = useMemo(() => createFixtureSeriesValueResolver(), []);
  const pointLabelsTruncated = useMemo(() => {
    const cat = catalogByName(availableSeries);
    const resolver = seriesValueResolver ?? defaultSeriesResolver;
    if (!previewReadiness(chartKind, bindings, cat, resolver)) return false;
    const p = buildChartPreviewPayload(chartKind, bindings, cat, resolver);
    return p?.type === "indexed" ? p.data.pointLabelsTruncated : false;
  }, [availableSeries, bindings, chartKind, defaultSeriesResolver, seriesValueResolver]);

  /** Persist merged `visual` once when opening with legacy frame-only rows. */
  useEffect(() => {
    if (!open || appearance.visual) return;
    onAppearanceChange(mergedAppearance);
  }, [open, appearance.visual, mergedAppearance, onAppearanceChange]);

  /** While title is auto, keep stored title text aligned with chart name for saved JSON. */
  useEffect(() => {
    if (!open) return;
    const vis = appearance.visual;
    if (!vis || vis.title.titleSource !== "auto") return;
    const next = chartName.trim() || "Chart";
    if (vis.title.titleText === next) return;
    onAppearanceChange({ ...appearance, visual: { ...vis, title: { ...vis.title, titleText: next } } });
  }, [chartName, open, appearance, onAppearanceChange]);

  useEffect(() => {
    canvasSizeRef.current = canvasSize;
  }, [canvasSize]);

  const appearanceRef = useRef(appearance);
  useEffect(() => {
    appearanceRef.current = appearance;
  }, [appearance]);

  useEffect(() => {
    if (!pointerGestureActiveRef.current) {
      latestAppearanceRef.current = appearance;
    }
  }, [appearance]);

  useEffect(() => {
    if (!open) return;
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setCanvasSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setCanvasSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    return () => ro.disconnect();
  }, [open]);

  /** Keep frame inside canvas when the viewport is resized (not during an active drag/resize gesture). */
  useEffect(() => {
    if (!open || canvasSize.w <= 0 || canvasSize.h <= 0) return;
    if (pointerGestureActiveRef.current) return;
    const clamped = clampFrameToBounds(appearance, canvasSize.w, canvasSize.h);
    if (
      clamped.offsetX !== appearance.offsetX ||
      clamped.offsetY !== appearance.offsetY ||
      clamped.widthPx !== appearance.widthPx ||
      clamped.heightPx !== appearance.heightPx
    ) {
      latestAppearanceRef.current = clamped;
      onAppearanceChange(clamped);
    }
  }, [open, canvasSize.w, canvasSize.h, appearance, onAppearanceChange]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  /** Sync canvas dimensions from DOM when ref/state are still zero (ResizeObserver can lag first frame). */
  const refreshCanvasSizeFromDom = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return { w: 0, h: 0 };
    const r = el.getBoundingClientRect();
    const w = Math.floor(r.width);
    const h = Math.floor(r.height);
    canvasSizeRef.current = { w, h };
    if (w > 0 && h > 0) {
      setCanvasSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    }
    return { w, h };
  }, []);

  const onPointerMove = useCallback(
    (ev: PointerEvent) => {
      const drag = dragRef.current;
      let cw = canvasSizeRef.current.w;
      let ch = canvasSizeRef.current.h;
      if (cw <= 0 || ch <= 0) {
        ({ w: cw, h: ch } = refreshCanvasSizeFromDom());
      }
      if (import.meta.env.DEV && drag && (cw <= 0 || ch <= 0) && !gestureEarlyReturnLoggedRef.current) {
        gestureEarlyReturnLoggedRef.current = true;
        const rect = canvasRef.current?.getBoundingClientRect();
        console.info(GESTURE_LOG_TAG, "onPointerMove early (no canvas dims)", {
          canvasSizeRef: { ...canvasSizeRef.current },
          rect: rect ? { w: rect.width, h: rect.height } : null,
        });
      }
      if (!drag || cw <= 0 || ch <= 0) return;
      const dx = ev.clientX - drag.startClientX;
      const dy = ev.clientY - drag.startClientY;

      if (drag.kind === "move") {
        const next = clampDragToBounds(
          {
            ...drag.startFrame,
            offsetX: drag.startFrame.offsetX + dx,
            offsetY: drag.startFrame.offsetY + dy,
          },
          cw,
          ch,
        );
        latestAppearanceRef.current = next;
        onAppearanceChange(next);
        return;
      }

      if (drag.kind === "resize" && drag.handle) {
        const next = ev.shiftKey
          ? resizeFrameFromHandleAspectFromStart(drag.startFrame, drag.handle, dx, dy, cw, ch)
          : resizeFrameFromHandle(drag.startFrame, drag.handle, dx, dy, cw, ch);
        latestAppearanceRef.current = next;
        onAppearanceChange(next);
        setResizeTooltip({ x: ev.clientX, y: ev.clientY, w: next.widthPx, h: next.heightPx });
      }
    },
    [onAppearanceChange, refreshCanvasSizeFromDom],
  );

  const endDrag = useCallback(() => {
    gestureEarlyReturnLoggedRef.current = false;
    dragRef.current = null;
    setResizeTooltip(null);
    setDragActive(false);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);

    pointerGestureActiveRef.current = false;
    const { w: cw, h: ch } = canvasSizeRef.current;
    if (cw > 0 && ch > 0) {
      const final = clampFrameToBounds(latestAppearanceRef.current, cw, ch);
      latestAppearanceRef.current = final;
      onAppearanceChange(final);
    }
  }, [onPointerMove, onAppearanceChange]);

  const onTitlePointerMove = useCallback(
    (ev: PointerEvent) => {
      const d = titleGestureRef.current;
      if (!d) return;
      const dx = ev.clientX - d.startClientX;
      const dy = ev.clientY - d.startClientY;
      if (!d.dragging) {
        if (dx * dx + dy * dy < TITLE_DRAG_THRESHOLD_PX * TITLE_DRAG_THRESHOLD_PX) return;
        d.dragging = true;
      }
      const a = appearanceRef.current;
      onAppearanceChange(
        patchChartAppearanceVisual(a, chartKind, bindings, chartName, (v) => ({
          ...v,
          title: {
            ...v.title,
            titleOffsetXPx: d.startOx + dx,
            titleOffsetYPx: d.startOy + dy,
          },
        })),
      );
    },
    [bindings, chartKind, chartName, onAppearanceChange],
  );

  const endTitleGesture = useCallback(() => {
    titleGestureRef.current = null;
    window.removeEventListener("pointermove", onTitlePointerMove);
    window.removeEventListener("pointerup", endTitleGesture);
    window.removeEventListener("pointercancel", endTitleGesture);
  }, [onTitlePointerMove]);

  const onTitlePointerDown = useCallback(
    (ev: React.PointerEvent) => {
      if (titleInlineEditing) return;
      ev.preventDefault();
      ev.stopPropagation();
      const vis = mergeAppearanceWithVisualDefaults(appearance, chartKind, bindings, chartName.trim() || "Chart").visual!;
      titleGestureRef.current = {
        startClientX: ev.clientX,
        startClientY: ev.clientY,
        startOx: vis.title.titleOffsetXPx,
        startOy: vis.title.titleOffsetYPx,
        dragging: false,
      };
      window.addEventListener("pointermove", onTitlePointerMove);
      window.addEventListener("pointerup", endTitleGesture);
      window.addEventListener("pointercancel", endTitleGesture);
    },
    [appearance, bindings, chartKind, chartName, endTitleGesture, onTitlePointerMove, titleInlineEditing],
  );

  const commitTitleEdit = useCallback(() => {
    const t = titleEditDraft.trim();
    onAppearanceChange(
      patchChartAppearanceVisual(appearanceRef.current, chartKind, bindings, chartName, (v) => ({
        ...v,
        title: { ...v.title, titleText: t, titleSource: "user" },
      })),
    );
    setTitleInlineEditing(false);
  }, [bindings, chartKind, chartName, onAppearanceChange, titleEditDraft]);

  const handleDesignAxisLabelCommit = useCallback(
    (axisId: ChartDesignAxisId, text: string) => {
      onAppearanceChange(
        patchChartAppearanceVisual(appearanceRef.current, chartKind, bindings, chartName, (v) => ({
          ...v,
          axes: {
            ...v.axes,
            [axisId]: { ...v.axes[axisId]!, labelText: text, labelSource: "user" },
          },
        })),
      );
    },
    [bindings, chartKind, chartName, onAppearanceChange],
  );

  const startMove = useCallback(
    (ev: React.PointerEvent) => {
      if ((ev.target as HTMLElement).closest("[data-chart-title-bar]")) return;
      if ((ev.target as HTMLElement).closest("[data-chart-design-interactive]")) return;
      if ((ev.target as HTMLElement).closest("[data-resize-handle]")) return;
      ev.preventDefault();
      ev.stopPropagation();
      gestureEarlyReturnLoggedRef.current = false;
      if (canvasSizeRef.current.w <= 0 || canvasSizeRef.current.h <= 0) {
        refreshCanvasSizeFromDom();
      }
      if (import.meta.env.DEV) {
        const rect = canvasRef.current?.getBoundingClientRect();
        console.info(GESTURE_LOG_TAG, "pointerdown move", {
          canvasSizeRef: { ...canvasSizeRef.current },
          rect: rect ? { w: rect.width, h: rect.height } : null,
        });
      }
      pointerGestureActiveRef.current = true;
      latestAppearanceRef.current = appearance;
      setDragActive(true);
      dragRef.current = {
        kind: "move",
        startFrame: appearance,
        startClientX: ev.clientX,
        startClientY: ev.clientY,
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointercancel", endDrag);
    },
    [appearance, onPointerMove, endDrag, refreshCanvasSizeFromDom],
  );

  const startResize = useCallback(
    (handle: ChartResizeHandle) => (ev: React.PointerEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      gestureEarlyReturnLoggedRef.current = false;
      if (canvasSizeRef.current.w <= 0 || canvasSizeRef.current.h <= 0) {
        refreshCanvasSizeFromDom();
      }
      if (import.meta.env.DEV) {
        const rect = canvasRef.current?.getBoundingClientRect();
        console.info(GESTURE_LOG_TAG, "pointerdown resize", {
          canvasSizeRef: { ...canvasSizeRef.current },
          rect: rect ? { w: rect.width, h: rect.height } : null,
        });
      }
      pointerGestureActiveRef.current = true;
      latestAppearanceRef.current = appearance;
      setDragActive(true);
      dragRef.current = {
        kind: "resize",
        startFrame: appearance,
        startClientX: ev.clientX,
        startClientY: ev.clientY,
        handle,
      };
      setResizeTooltip({ x: ev.clientX, y: ev.clientY, w: appearance.widthPx, h: appearance.heightPx });
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointercancel", endDrag);
    },
    [appearance, onPointerMove, endDrag, refreshCanvasSizeFromDom],
  );

  const sidebarW = sidebarCollapsed ? SIDEBAR_COLLAPSED_PX : SIDEBAR_EXPANDED_PX;

  const titleDisplay = resolveChartTitleDisplayText(designVisual, chartName);
  const titleAbove = designVisual.title.showTitle && designVisual.title.titlePosition === "above_plot";
  const titleBelow = designVisual.title.showTitle && designVisual.title.titlePosition === "below_plot";
  const bandAbove = titleAbove ? estimateTitleBandPx(designVisual) : 0;
  const bandBelow = titleBelow ? estimateTitleBandPx(designVisual) : 0;
  const innerPad = 4;
  const chartAreaH = Math.max(1, appearance.heightPx - innerPad * 2 - bandAbove - bandBelow);
  const chartAreaW = Math.max(1, appearance.widthPx - innerPad * 2);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableScrollLock
      hideBackdrop
      aria-labelledby={titleId}
      aria-modal
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          position: "fixed",
          top: CHART_DESIGN_MODAL_TOP_OFFSET_PX,
          left: 0,
          right: 0,
          bottom: 0,
          m: 0,
          maxWidth: "none",
          width: "100%",
          height: `calc(100% - ${CHART_DESIGN_MODAL_TOP_OFFSET_PX}px)`,
          maxHeight: "none",
          borderRadius: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fff",
          boxShadow: "none",
        },
      }}
      sx={{
        zIndex: (t) => t.zIndex.modal,
        "& .MuiDialog-container": {
          alignItems: "stretch",
        },
      }}
    >
      <Box
        component="section"
        aria-labelledby={titleId}
        sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, minWidth: 0, position: "relative" }}
      >
        <Typography
          id={titleId}
          component="h2"
          sx={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          Chart design appearance
        </Typography>
        <IconButton
          ref={closeBtnRef}
          aria-label="Close chart design"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            color: "text.secondary",
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: "flex", flex: 1, minHeight: 0, minWidth: 0, pt: 5 }}>
          <Box
            ref={canvasRef}
            sx={{
              flex: 1,
              minWidth: 0,
              position: "relative",
              overflow: "hidden",
              ...designGridSx,
            }}
          >
            <Box
              data-chart-design-frame
              onPointerDown={startMove}
              sx={{
                position: "absolute",
                left: appearance.offsetX,
                top: appearance.offsetY,
                width: appearance.widthPx,
                height: appearance.heightPx,
                boxSizing: "border-box",
                border: `2px dashed ${tokens.colorBorder}`,
                borderRadius: 0.5,
                cursor: dragActive ? "grabbing" : "grab",
                touchAction: "none",
                userSelect: "none",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minHeight: 0,
                  minWidth: 0,
                  boxSizing: "border-box",
                  p: `${innerPad}px`,
                }}
              >
                {titleAbove && (
                  <Box
                    data-chart-title-bar
                    onPointerDown={onTitlePointerDown}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (!designVisual.title.showTitle) return;
                      setTitleEditDraft(titleDisplay);
                      setTitleInlineEditing(true);
                    }}
                    sx={{
                      cursor: titleInlineEditing ? "text" : "move",
                      flexShrink: 0,
                      py: 0.5,
                      textAlign: "center",
                      pointerEvents: "auto",
                      touchAction: "none",
                    }}
                  >
                    {titleInlineEditing ? (
                      <TextField
                        value={titleEditDraft}
                        onChange={(e) => setTitleEditDraft(e.target.value)}
                        autoFocus
                        size="small"
                        fullWidth
                        variant="outlined"
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitTitleEdit();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            titleBlurSkipRef.current = true;
                            setTitleInlineEditing(false);
                          }
                        }}
                        onBlur={() => {
                          if (titleBlurSkipRef.current) {
                            titleBlurSkipRef.current = false;
                            return;
                          }
                          commitTitleEdit();
                        }}
                        sx={{
                          "& .MuiInputBase-input": {
                            fontFamily: designVisual.title.titleFontFamily,
                            fontSize: `${designVisual.title.titleFontSizePt}px`,
                            fontWeight: 600,
                            textAlign: "center",
                          },
                          transform: `translate(${designVisual.title.titleOffsetXPx}px, ${designVisual.title.titleOffsetYPx}px)`,
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontFamily: designVisual.title.titleFontFamily,
                          fontSize: `${designVisual.title.titleFontSizePt}px`,
                          fontWeight: 600,
                          lineHeight: 1.2,
                          transform: `translate(${designVisual.title.titleOffsetXPx}px, ${designVisual.title.titleOffsetYPx}px)`,
                          userSelect: "none",
                        }}
                      >
                        {titleDisplay}
                      </Typography>
                    )}
                  </Box>
                )}
                <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, position: "relative" }}>
                  <ChartBindingPreview
                    key={`design-preview-${appearance.widthPx}-${appearance.heightPx}-${appearance.offsetX}-${appearance.offsetY}-${designVisual.title.titleFontSizePt}`}
                    chartKind={chartKind}
                    bindings={bindings}
                    availableSeries={availableSeries}
                    seriesValueResolver={seriesValueResolver}
                    frameSize={{
                      width: chartAreaW,
                      height: chartAreaH,
                    }}
                    designVisual={designVisual}
                    blockPointerEventsToChart={false}
                    highlightPlotArea={plotAreaSectionOpen}
                    onDesignAxisLabelCommit={handleDesignAxisLabelCommit}
                  />
                </Box>
                {titleBelow && (
                  <Box
                    data-chart-title-bar
                    onPointerDown={onTitlePointerDown}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (!designVisual.title.showTitle) return;
                      setTitleEditDraft(titleDisplay);
                      setTitleInlineEditing(true);
                    }}
                    sx={{
                      cursor: titleInlineEditing ? "text" : "move",
                      flexShrink: 0,
                      py: 0.5,
                      textAlign: "center",
                      pointerEvents: "auto",
                      touchAction: "none",
                    }}
                  >
                    {titleInlineEditing ? (
                      <TextField
                        value={titleEditDraft}
                        onChange={(e) => setTitleEditDraft(e.target.value)}
                        autoFocus
                        size="small"
                        fullWidth
                        variant="outlined"
                        onPointerDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitTitleEdit();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            titleBlurSkipRef.current = true;
                            setTitleInlineEditing(false);
                          }
                        }}
                        onBlur={() => {
                          if (titleBlurSkipRef.current) {
                            titleBlurSkipRef.current = false;
                            return;
                          }
                          commitTitleEdit();
                        }}
                        sx={{
                          "& .MuiInputBase-input": {
                            fontFamily: designVisual.title.titleFontFamily,
                            fontSize: `${designVisual.title.titleFontSizePt}px`,
                            fontWeight: 600,
                            textAlign: "center",
                          },
                          transform: `translate(${designVisual.title.titleOffsetXPx}px, ${designVisual.title.titleOffsetYPx}px)`,
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontFamily: designVisual.title.titleFontFamily,
                          fontSize: `${designVisual.title.titleFontSizePt}px`,
                          fontWeight: 600,
                          lineHeight: 1.2,
                          transform: `translate(${designVisual.title.titleOffsetXPx}px, ${designVisual.title.titleOffsetYPx}px)`,
                          userSelect: "none",
                        }}
                      >
                        {titleDisplay}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {( ["nw", "n", "ne", "w", "e", "sw", "s", "se"] as ChartResizeHandle[]).map((h) => (
                <Box
                  key={h}
                  data-resize-handle
                  onPointerDown={startResize(h)}
                  sx={{
                    position: "absolute",
                    width: HANDLE_PX,
                    height: HANDLE_PX,
                    bgcolor: tokens.colorChrome,
                    border: `1px solid ${tokens.colorBorder}`,
                    borderRadius: 0.5,
                    zIndex: 2,
                    cursor: cursorForHandle(h),
                    ...handlePosition(h),
                  }}
                />
              ))}
            </Box>

            {resizeTooltip && (
              <Box
                sx={{
                  position: "fixed",
                  left: resizeTooltip.x + 12,
                  top: resizeTooltip.y + 12,
                  zIndex: (t) => t.zIndex.tooltip,
                  bgcolor: "rgba(33,33,33,0.92)",
                  color: "#fff",
                  px: 1,
                  py: 0.75,
                  borderRadius: 1,
                  pointerEvents: "none",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.7rem",
                  whiteSpace: "pre",
                }}
              >
                {`width: ${resizeTooltip.w}px; height: ${resizeTooltip.h}px;\naspect:${(resizeTooltip.w / Math.max(1, resizeTooltip.h)).toFixed(2)}`}
              </Box>
            )}
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              width: sidebarW,
              boxSizing: "border-box",
              borderLeft: `1px solid ${tokens.colorBorder}`,
              bgcolor: "#fafafa",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              minHeight: 0,
              overflow: "hidden",
              transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", p: 0.5 }}>
              <IconButton
                size="small"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setSidebarCollapsed((c) => !c)}
              >
                {sidebarCollapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </Box>
            {!sidebarCollapsed && (
              <Box sx={{ flex: 1, overflow: "auto", px: 1, pb: 1 }}>
                <ChartDesignAppearanceSidebar
                  chartKind={chartKind}
                  bindings={bindings}
                  availableSeries={availableSeries}
                  chartName={chartName}
                  appearance={appearance}
                  onAppearanceChange={onAppearanceChange}
                  onBindingsChange={onBindingsChange}
                  pointLabelsTruncated={pointLabelsTruncated}
                  onPlotAreaSectionOpenChange={setPlotAreaSectionOpen}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}

function handlePosition(h: ChartResizeHandle): Record<string, string | number> {
  const o = -HANDLE_PX / 2;
  switch (h) {
    case "nw":
      return { left: o, top: o };
    case "n":
      return { left: "50%", top: o, transform: "translateX(-50%)" };
    case "ne":
      return { right: o, top: o };
    case "w":
      return { left: o, top: "50%", transform: "translateY(-50%)" };
    case "e":
      return { right: o, top: "50%", transform: "translateY(-50%)" };
    case "sw":
      return { left: o, bottom: o };
    case "s":
      return { left: "50%", bottom: o, transform: "translateX(-50%)" };
    case "se":
      return { right: o, bottom: o };
    default:
      return {};
  }
}
