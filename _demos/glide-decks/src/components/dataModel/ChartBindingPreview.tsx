import { memo, useCallback, useMemo, useState, type ReactElement } from "react";
import Box from "@mui/material/Box";
import {
  Bar,
  BarChart,
  Cell,
  Label,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { ChartInteractionSurface } from "../../chart/chartInteractionSurface";
import { getChartContract } from "../../chart/chartSlotContracts";
import {
  buildRechartsAxisTickProps,
  type CartesianAxisOrientation,
  type RechartsAxisTickBundle,
} from "../../chart/chartCartesianAxisTicks";
import {
  axisExpectsNumericTicks,
  computeIndexedPlotMargin,
  deriveAxisFormatSourceSeriesName,
  effectiveAxisVisual,
  resolveAxisLabelDisplay,
} from "../../chart/chartAppearanceVisual";
import { formatAxisTickNumber } from "../../numericFormat";
import type { ChartDesignAxisId } from "../../types/dataModel";
import { CHART_SERIES_COLORS, tokens } from "../../theme/tokens";
import type {
  ChartCreationKind,
  ChartPlotMargin,
  ChartVisualAppearance,
  DataSeriesAssetRow,
} from "../../types/dataModel";
import { InteractiveAxisLabelContent } from "./InteractiveAxisLabelContent";
import type { ChartBindingsState } from "../../types/chartBindings";
import {
  buildChartPreviewPayload,
  catalogByName,
  previewReadiness,
} from "../../chart/chartBindingPreviewData";
import {
  RECHARTS_X_AXIS_PRIMARY,
  RECHARTS_X_AXIS_SECONDARY,
  RECHARTS_Y_AXIS_PRIMARY,
  RECHARTS_Y_AXIS_SECONDARY,
} from "../../chart/indexedAxesBindings";
import { createFixtureSeriesValueResolver, type SeriesValueResolver } from "../../data/seriesValueResolver";
import type { CartesianAxisLabelPosition } from "../../chart/rechartsCartesianLabelAttrs";

const PREVIEW_MAX_W = 300;
const PREVIEW_MAX_H = 200;

/** Fit contract aspect ratio inside the preview viewport (width-limited or height-limited). */
function previewViewportSize(aspectWidthOverHeight: number): { w: number; h: number } {
  const rViewport = PREVIEW_MAX_W / PREVIEW_MAX_H;
  const a = aspectWidthOverHeight;
  if (a > rViewport) {
    return { w: PREVIEW_MAX_W, h: PREVIEW_MAX_W / a };
  }
  return { w: PREVIEW_MAX_H * a, h: PREVIEW_MAX_H };
}

const AXIS_NUMERIC_WIDTH = 28;
/** Recharts X-axis band height: tick marks + tick labels (axis title uses `bottom` / `top`, outside this band). */
const AXIS_BAND_HEIGHT = 36;
/** Tighter band in binding-panel shape preview to reclaim vertical space in the small viewport. */
const AXIS_BAND_HEIGHT_PREVIEW = 30;

/** Recharts `margin` when `designVisual` is omitted (binding shape preview only): maximize plot area. */
const BINDING_SHAPE_PREVIEW_PLOT_MARGIN: ChartPlotMargin = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
};

const axisLinePreview = {
  stroke: tokens.colorBorder,
  strokeWidth: 2,
};

const defaultFixtureResolver = createFixtureSeriesValueResolver();

/** Smaller scatter points in binding shape preview so marks do not dominate the thumbnail. */
function BindingPreviewScatterDot(props: unknown) {
  const p = props as Record<string, unknown>;
  const cx = Number(p.cx ?? 0);
  const cy = Number(p.cy ?? 0);
  const fill = p.fill as string | undefined;
  const stroke = p.stroke as string | undefined;
  return <circle cx={cx} cy={cy} r={2.5} fill={fill} stroke={stroke} />;
}

function tickPackForAxis(
  axisId: ChartDesignAxisId,
  orientation: CartesianAxisOrientation,
  isPrimary: boolean,
  designVisual: ChartVisualAppearance | undefined,
  chartKind: ChartCreationKind,
  bindings: ChartBindingsState,
  catalog: Map<string, DataSeriesAssetRow>,
  numericContext: { payloadKind: "indexed" | "category_values"; horizontalBar?: boolean },
  bindingShapePreview: boolean,
): RechartsAxisTickBundle & { stroke: string } {
  const axBase = effectiveAxisVisual(axisId, designVisual, isPrimary);
  const ax = bindingShapePreview ? { ...axBase, axisColor: tokens.colorBorder } : axBase;
  const isNum = axisExpectsNumericTicks(axisId, chartKind, {
    payloadKind: numericContext.payloadKind,
    horizontalBar: numericContext.horizontalBar,
  });
  const sourceName = deriveAxisFormatSourceSeriesName(axisId, chartKind, bindings);
  const seriesCanonical = sourceName ? catalog.get(sourceName)?.numeric_format?.trim() ?? null : null;
  const tickFormatter = isNum
    ? (v: unknown, _i: number) => {
        if (typeof v === "number" && Number.isFinite(v)) {
          return formatAxisTickNumber(v, { override: ax.numericFormatOverride, seriesCanonical });
        }
        return String(v ?? "");
      }
    : (v: unknown) => String(v ?? "");
  return {
    stroke: ax.axisColor,
    ...buildRechartsAxisTickProps({
      axisVisual: ax,
      orientation,
      tickFormatter,
    }),
  };
}

/** Recharts .d.ts mismatches tick line SVG vs our bundle; cast at the boundary. */
function rechartsTickAxisProps(b: RechartsAxisTickBundle & { stroke: string }) {
  return {
    stroke: b.stroke,
    tickLine: b.tickLine as any,
    tick: b.tick as any,
    ...(b.tickSize !== undefined ? { tickSize: b.tickSize } : {}),
    tickFormatter: b.tickFormatter,
  };
}

function axisLineFromVisual(
  designVisual: ChartVisualAppearance | undefined,
  axisId: ChartDesignAxisId,
): { stroke: string; strokeWidth: number } {
  const ax = designVisual?.axes?.[axisId];
  if (!designVisual || !ax?.showAxis) {
    return { stroke: "transparent", strokeWidth: 0 };
  }
  return { stroke: ax.axisColor, strokeWidth: ax.axisThicknessPx };
}

function labelPropsFromVisual(
  designVisual: ChartVisualAppearance | undefined,
  axisId: ChartDesignAxisId,
  chartKind: ChartCreationKind,
  bindings: ChartBindingsState,
  catalog: Map<string, DataSeriesAssetRow>,
  position: CartesianAxisLabelPosition,
):
  | {
      value: string;
      position: string;
      angle: number;
      style: { fontSize: number; fontFamily: string };
    }
  | undefined {
  if (!designVisual) return undefined;
  const ax = designVisual.axes?.[axisId];
  if (!ax?.showLabel) return undefined;
  const value = resolveAxisLabelDisplay(axisId, designVisual, chartKind, bindings, catalog);
  return {
    value,
    position,
    angle: ax.labelAngleDeg,
    style: { fontSize: ax.labelFontSizePt, fontFamily: ax.labelFontFamily },
  };
}

export interface ChartBindingPreviewProps {
  chartKind: ChartCreationKind;
  bindings: ChartBindingsState;
  availableSeries: DataSeriesAssetRow[];
  /** When omitted, uses fixture/synthetic seeds (loose view). */
  seriesValueResolver?: SeriesValueResolver;
  /**
   * When set (e.g. chart design modal), chart fills this exact pixel size instead of the
   * default contract-aspect preview box.
   */
  frameSize?: { width: number; height: number };
  /**
   * Binding panel preview ignores pointer events so parent UI receives clicks.
   * Design canvas sets false so the frame wrapper can handle drag/resize.
   */
  blockPointerEventsToChart?: boolean;
  /** Merged design visual (title/axes/plot margins). Omitted in binding panel. */
  designVisual?: ChartVisualAppearance;
  /**
   * Slide authoring vs reader preview: when `readerPreview`, Recharts tooltips and pointer events match
   * a published deck (see slide-deck-spec Preview Mode).
   */
  interactionSurface?: ChartInteractionSurface;
  /**
   * When true (e.g. Plot area accordion open in chart design), draws a theme-red outline around the
   * Recharts plot region matching the current `margin` so margin edits are visible in real time.
   */
  highlightPlotArea?: boolean;
  /** When set (chart design modal), double-click axis labels to edit; enables chart pointer events. */
  onDesignAxisLabelCommit?: (axisId: ChartDesignAxisId, text: string) => void;
}

function ChartBindingPreviewComponent({
  chartKind,
  bindings,
  availableSeries,
  seriesValueResolver = defaultFixtureResolver,
  frameSize,
  blockPointerEventsToChart = true,
  designVisual,
  highlightPlotArea = false,
  onDesignAxisLabelCommit,
  interactionSurface = "slideAuthoring",
}: ChartBindingPreviewProps) {
  const [editingAxisId, setEditingAxisId] = useState<ChartDesignAxisId | null>(null);
  const [axisEditDraft, setAxisEditDraft] = useState("");

  const catalog = useMemo(() => catalogByName(availableSeries), [availableSeries]);
  const ready = previewReadiness(chartKind, bindings, catalog, seriesValueResolver);
  const payload = useMemo(() => {
    if (!ready) return null;
    return buildChartPreviewPayload(chartKind, bindings, catalog, seriesValueResolver);
  }, [chartKind, bindings, catalog, ready, seriesValueResolver]);

  const renderAxisLabel = useCallback(
    (axisId: ChartDesignAxisId, position: CartesianAxisLabelPosition) => {
      const base = labelPropsFromVisual(designVisual, axisId, chartKind, bindings, catalog, position);
      if (!base) return undefined;
      const labelOffset = position === "bottom" || position === "top" ? 10 : 5;
      if (!onDesignAxisLabelCommit || !designVisual) {
        return { ...base, offset: labelOffset };
      }
      return (
        <Label
          value={base.value}
          position={base.position as CartesianAxisLabelPosition}
          angle={base.angle}
          offset={labelOffset}
          style={{
            fontSize: base.style.fontSize,
            fontFamily: base.style.fontFamily,
            fill: tokens.colorChrome,
          }}
          content={(props: unknown) => (
            <InteractiveAxisLabelContent
              {...(props as object)}
              offset={labelOffset}
              axisId={axisId}
              editingAxisId={editingAxisId}
              editDraft={axisEditDraft}
              onStartEdit={(id, initial) => {
                setEditingAxisId(id);
                setAxisEditDraft(initial);
              }}
              onDraftChange={setAxisEditDraft}
              onCommit={(id, text) => {
                onDesignAxisLabelCommit(id, text);
                setEditingAxisId(null);
              }}
              onCancelEdit={() => setEditingAxisId(null)}
            />
          )}
        />
      );
    },
    [
      axisEditDraft,
      bindings,
      catalog,
      chartKind,
      designVisual,
      editingAxisId,
      onDesignAxisLabelCommit,
    ],
  );

  if (!payload) {
    return null;
  }

  const isDesignAuthoring = designVisual != null;
  const bindingShapePreview = !isDesignAuthoring;
  const readerPreview = interactionSurface === "readerPreview";
  const axisBandHeight = isDesignAuthoring ? AXIS_BAND_HEIGHT : AXIS_BAND_HEIGHT_PREVIEW;
  const cartesianLineStrokeWidth = isDesignAuthoring ? 2 : 1.25;
  const bubbleZRange = isDesignAuthoring ? ([24, 96] as const) : ([18, 72] as const);

  const aspect = frameSize
    ? frameSize.width / Math.max(1, frameSize.height)
    : getChartContract(chartKind).defaultAspectRatio;

  let chart: ReactElement;
  if (payload.type === "indexed") {
    const idx = payload.data;
    const marginIndexed = isDesignAuthoring
      ? computeIndexedPlotMargin(idx.secondaryX, idx.secondaryY, designVisual.plotMargin)
      : computeIndexedPlotMargin(idx.secondaryX, idx.secondaryY, BINDING_SHAPE_PREVIEW_PLOT_MARGIN);

    const xPrimaryLine = axisLineFromVisual(designVisual, "xPrimary");
    const xSecondaryLine = axisLineFromVisual(designVisual, "xSecondary");
    const yPrimaryLine = axisLineFromVisual(designVisual, "yPrimary");
    const ySecondaryLine = axisLineFromVisual(designVisual, "ySecondary");
    const hideXPrimary = designVisual ? !(designVisual.axes?.xPrimary?.showAxis ?? true) : false;
    const hideXSecondary =
      designVisual && idx.secondaryX ? !(designVisual.axes?.xSecondary?.showAxis ?? true) : false;
    const hideYPrimary = designVisual ? !(designVisual.axes?.yPrimary?.showAxis ?? true) : false;
    const hideYSecondary =
      designVisual && idx.secondaryY ? !(designVisual.axes?.ySecondary?.showAxis ?? true) : false;

    const tpX0 = tickPackForAxis(
      "xPrimary",
      "bottom",
      true,
      designVisual,
      chartKind,
      bindings,
      catalog,
      { payloadKind: "indexed" },
      bindingShapePreview,
    );
    const tpY0 = tickPackForAxis(
      "yPrimary",
      "left",
      true,
      designVisual,
      chartKind,
      bindings,
      catalog,
      { payloadKind: "indexed" },
      bindingShapePreview,
    );
    const tpX1 = tickPackForAxis(
      "xSecondary",
      "top",
      false,
      designVisual,
      chartKind,
      bindings,
      catalog,
      { payloadKind: "indexed" },
      bindingShapePreview,
    );
    const tpY1 = tickPackForAxis(
      "ySecondary",
      "right",
      false,
      designVisual,
      chartKind,
      bindings,
      catalog,
      { payloadKind: "indexed" },
      bindingShapePreview,
    );

    chart = (
      <ScatterChart margin={marginIndexed}>
        {readerPreview ? <Tooltip /> : null}
        <XAxis
          xAxisId={RECHARTS_X_AXIS_PRIMARY}
          type="number"
          dataKey="x"
          height={axisBandHeight}
          hide={hideXPrimary}
          {...rechartsTickAxisProps(tpX0)}
          axisLine={designVisual?.axes?.xPrimary?.showAxis ? xPrimaryLine : axisLinePreview}
          label={renderAxisLabel("xPrimary", "bottom")}
        />
        {idx.secondaryX && (
          <XAxis
            xAxisId={RECHARTS_X_AXIS_SECONDARY}
            type="number"
            dataKey="x"
            orientation="top"
            height={axisBandHeight}
            hide={hideXSecondary}
            {...rechartsTickAxisProps(tpX1)}
            axisLine={designVisual?.axes?.xSecondary?.showAxis ? xSecondaryLine : axisLinePreview}
            label={renderAxisLabel("xSecondary", "top")}
          />
        )}
        <YAxis
          yAxisId={RECHARTS_Y_AXIS_PRIMARY}
          type="number"
          dataKey="y"
          width={AXIS_NUMERIC_WIDTH}
          hide={hideYPrimary}
          {...rechartsTickAxisProps(tpY0)}
          axisLine={designVisual?.axes?.yPrimary?.showAxis ? yPrimaryLine : axisLinePreview}
          label={renderAxisLabel("yPrimary", "insideLeft")}
        />
        {idx.secondaryY && (
          <YAxis
            yAxisId={RECHARTS_Y_AXIS_SECONDARY}
            orientation="right"
            type="number"
            dataKey="y"
            width={AXIS_NUMERIC_WIDTH}
            hide={hideYSecondary}
            {...rechartsTickAxisProps(tpY1)}
            axisLine={designVisual?.axes?.ySecondary?.showAxis ? ySecondaryLine : axisLinePreview}
            label={renderAxisLabel("ySecondary", "insideRight")}
          />
        )}
        {idx.chartKind === "bubble" && (
          <ZAxis type="number" dataKey="z" range={[...bubbleZRange]} name="" />
        )}
        {idx.layers.map((layer, li) => {
          const stroke = CHART_SERIES_COLORS[li % CHART_SERIES_COLORS.length];
          const showLine = idx.chartKind === "line_2d";
          const scatterPointFillOpacity = idx.chartKind === "scatter" ? 0.8 : 1;
          const dpl = designVisual?.dataPointLabels;
          const showPointLabels = !!(dpl?.show && dpl.fontSizePt >= 6);
          return (
            <Scatter
              key={li}
              name={`l${li}`}
              data={layer.points}
              xAxisId={layer.xAxisId}
              yAxisId={layer.yAxisId}
              fill={stroke}
              fillOpacity={scatterPointFillOpacity}
              stroke={stroke}
              isAnimationActive={false}
              shape={bindingShapePreview ? BindingPreviewScatterDot : undefined}
              line={showLine ? { strokeWidth: cartesianLineStrokeWidth } : false}
            >
              {showPointLabels && (
                <LabelList
                  dataKey="label"
                  position="top"
                  fill={tokens.colorChrome}
                  fontSize={dpl!.fontSizePt}
                  fontFamily={dpl!.fontFamily}
                />
              )}
            </Scatter>
          );
        })}
      </ScatterChart>
    );
  } else if (payload.type === "category_values") {
    const catMargin = isDesignAuthoring ? designVisual.plotMargin : BINDING_SHAPE_PREVIEW_PLOT_MARGIN;
    const xLine = axisLineFromVisual(designVisual, "xPrimary");
    const yLine = axisLineFromVisual(designVisual, "yPrimary");
    const hideX = designVisual ? !(designVisual.axes?.xPrimary?.showAxis ?? true) : false;
    const hideY = designVisual ? !(designVisual.axes?.yPrimary?.showAxis ?? true) : false;
    const horizontal = payload.data.horizontal;
    const catCtx = { payloadKind: "category_values" as const, horizontalBar: horizontal };
    const tpLineX = tickPackForAxis(
      "xPrimary",
      "bottom",
      true,
      designVisual,
      chartKind,
      bindings,
      catalog,
      { payloadKind: "category_values", horizontalBar: false },
      bindingShapePreview,
    );
    const tpLineY = tickPackForAxis(
      "yPrimary",
      "left",
      true,
      designVisual,
      chartKind,
      bindings,
      catalog,
      { payloadKind: "category_values", horizontalBar: false },
      bindingShapePreview,
    );
    const tpBarVX = tickPackForAxis(
      "xPrimary",
      "bottom",
      true,
      designVisual,
      chartKind,
      bindings,
      catalog,
      catCtx,
      bindingShapePreview,
    );
    const tpBarVY = tickPackForAxis(
      "yPrimary",
      "left",
      true,
      designVisual,
      chartKind,
      bindings,
      catalog,
      catCtx,
      bindingShapePreview,
    );

    chart =
      payload.data.chartKind === "line_1d" ? (
        <LineChart data={payload.data.rows} margin={catMargin}>
          {readerPreview ? <Tooltip /> : null}
          <XAxis
            dataKey="cat"
            type="category"
            height={axisBandHeight}
            hide={hideX}
            {...rechartsTickAxisProps(tpLineX)}
            axisLine={designVisual?.axes?.xPrimary?.showAxis ? xLine : axisLinePreview}
            label={renderAxisLabel("xPrimary", "bottom")}
          />
          <YAxis
            type="number"
            width={AXIS_NUMERIC_WIDTH}
            hide={hideY}
            {...rechartsTickAxisProps(tpLineY)}
            axisLine={designVisual?.axes?.yPrimary?.showAxis ? yLine : axisLinePreview}
            label={renderAxisLabel("yPrimary", "insideLeft")}
          />
          {payload.data.valueKeys.map((vk, i) => (
            <Line
              key={vk}
              type="monotone"
              dataKey={vk}
              stroke={CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]}
              strokeWidth={cartesianLineStrokeWidth}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      ) : (
        <BarChart
          data={payload.data.rows}
          layout={payload.data.horizontal ? "vertical" : "horizontal"}
          margin={catMargin}
        >
          {readerPreview ? <Tooltip /> : null}
          {payload.data.horizontal ? (
            <>
              <XAxis
                type="number"
                height={axisBandHeight}
                hide={hideX}
                {...rechartsTickAxisProps(tpBarVX)}
                axisLine={designVisual?.axes?.xPrimary?.showAxis ? xLine : axisLinePreview}
                label={renderAxisLabel("xPrimary", "bottom")}
              />
              <YAxis
                dataKey="cat"
                type="category"
                width={36}
                hide={hideY}
                {...rechartsTickAxisProps(tpBarVY)}
                axisLine={designVisual?.axes?.yPrimary?.showAxis ? yLine : axisLinePreview}
                label={renderAxisLabel("yPrimary", "insideLeft")}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="cat"
                type="category"
                height={axisBandHeight}
                hide={hideX}
                {...rechartsTickAxisProps(tpBarVX)}
                axisLine={designVisual?.axes?.xPrimary?.showAxis ? xLine : axisLinePreview}
                label={renderAxisLabel("xPrimary", "bottom")}
              />
              <YAxis
                type="number"
                width={AXIS_NUMERIC_WIDTH}
                hide={hideY}
                {...rechartsTickAxisProps(tpBarVY)}
                axisLine={designVisual?.axes?.yPrimary?.showAxis ? yLine : axisLinePreview}
                label={renderAxisLabel("yPrimary", "insideLeft")}
              />
            </>
          )}
          {payload.data.valueKeys.map((vk, i) => (
            <Bar
              key={vk}
              dataKey={vk}
              fill={CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]}
              isAnimationActive={false}
              stackId={payload.data.stacked ? "stack" : undefined}
            />
          ))}
        </BarChart>
      );
  } else {
    const pieMargin = isDesignAuthoring ? designVisual.plotMargin : BINDING_SHAPE_PREVIEW_PLOT_MARGIN;
    chart = (
      <PieChart margin={pieMargin}>
        {readerPreview ? <Tooltip /> : null}
        <Pie
          data={payload.data.slices}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={payload.data.donut ? "48%" : "0%"}
          outerRadius="70%"
          paddingAngle={0}
          label={false}
          labelLine={false}
          isAnimationActive={false}
        >
          {payload.data.slices.map((_, i) => (
            <Cell key={i} fill={CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  }

  const plotMarginHighlight =
    highlightPlotArea && designVisual
      ? payload.type === "indexed"
        ? computeIndexedPlotMargin(payload.data.secondaryX, payload.data.secondaryY, designVisual.plotMargin)
        : designVisual.plotMargin
      : null;

  const chartPointerEventsBlocked = blockPointerEventsToChart && !onDesignAxisLabelCommit;

  const { w, h } = frameSize
    ? { w: frameSize.width, h: frameSize.height }
    : previewViewportSize(aspect);

  return (
    <Box
      {...(onDesignAxisLabelCommit ? { "data-chart-design-interactive": true } : {})}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: chartPointerEventsBlocked ? "none" : "auto",
      }}
    >
      <Box sx={{ width: w, height: h, flexShrink: 0, minWidth: 0, minHeight: 0, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
        {plotMarginHighlight && (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              pointerEvents: "none",
              zIndex: 2,
              boxSizing: "border-box",
              border: `2px solid ${tokens.colorDanger}`,
              borderRadius: 1,
              boxShadow: `0 0 16px rgba(188, 48, 32, 0.55), inset 0 0 12px rgba(188, 48, 32, 0.12)`,
              top: plotMarginHighlight.top,
              left: plotMarginHighlight.left,
              right: plotMarginHighlight.right,
              bottom: plotMarginHighlight.bottom,
            }}
          />
        )}
      </Box>
    </Box>
  );
}

ChartBindingPreviewComponent.displayName = "ChartBindingPreview";

/** Shape / design preview; memoized so parent re-renders (e.g. unrelated form state) do not reconcile Recharts. */
export const ChartBindingPreview = memo(ChartBindingPreviewComponent);
