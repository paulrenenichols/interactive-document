import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { mergeAppearanceWithVisualDefaults } from "../../../chart/chartAppearanceVisual";
import { createDefaultChartAppearanceLayout } from "../../../chart/chartAppearanceLayout";
import { catalogByName, previewReadiness } from "../../../chart/chartBindingPreviewData";
import { inferChartCreationKindFromChartType } from "../../../chart/chartSlotContracts";
import { useDocumentDataModel } from "../../../data/DocumentDataModelContext";
import type { ChartInteractionSurface } from "../../../chart/chartInteractionSurface";
import { ChartBindingPreview } from "../../dataModel/ChartBindingPreview";

/** Nominal design canvas for default appearance when a chart row has no `appearance` yet. */
const NOMINAL_CANVAS_W = 900;
const NOMINAL_CANVAS_H = 500;

export interface SlideChartAuthoringPreviewProps {
  chartId: string;
  frameWidthPx: number;
  frameHeightPx: number;
  ariaLabel: string;
  /** Slide canvas blocks chart events in authoring; preview enables reader interactions. */
  interactionSurface?: ChartInteractionSurface;
}

export function SlideChartAuthoringPreview({
  chartId,
  frameWidthPx,
  frameHeightPx,
  ariaLabel,
  interactionSurface = "slideAuthoring",
}: SlideChartAuthoringPreviewProps) {
  const { chartAssetRows, dataSeriesRows, resolveSeriesValues } = useDocumentDataModel();

  const payload = useMemo(() => {
    const chartRow = chartAssetRows.find((c) => c.id === chartId);
    if (!chartRow) {
      return { kind: "missing" as const };
    }
    const chartKind = inferChartCreationKindFromChartType(chartRow.chart_type);
    const bindings = chartRow.bindings;
    if (!bindings) {
      return { kind: "unready" as const };
    }
    const catalog = catalogByName(dataSeriesRows);
    if (!previewReadiness(chartKind, bindings, catalog, resolveSeriesValues)) {
      return { kind: "unready" as const };
    }
    const appearance =
      chartRow.appearance ?? createDefaultChartAppearanceLayout(chartKind, NOMINAL_CANVAS_W, NOMINAL_CANVAS_H);
    const merged = mergeAppearanceWithVisualDefaults(
      appearance,
      chartKind,
      bindings,
      chartRow.name.trim() || "Chart",
    );
    const designVisual = merged.visual;
    if (!designVisual) {
      return { kind: "unready" as const };
    }
    return {
      kind: "ok" as const,
      chartKind,
      bindings,
      designVisual,
    };
  }, [chartAssetRows, chartId, dataSeriesRows, resolveSeriesValues]);

  const w = Math.max(1, frameWidthPx);
  const h = Math.max(1, frameHeightPx);
  const readerPreview = interactionSurface === "readerPreview";

  const shellSx = {
    width: "100%",
    height: "100%",
    boxSizing: "border-box" as const,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    overflow: "hidden",
    pointerEvents: readerPreview ? ("auto" as const) : ("none" as const),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (payload.kind !== "ok") {
    return (
      <Box sx={shellSx} aria-label={ariaLabel}>
        <Typography variant="caption" color="text.secondary" align="center" sx={{ px: 0.5 }}>
          {payload.kind === "missing" ? "Chart not found" : "Configure chart bindings in Data Model"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={shellSx} aria-label={ariaLabel}>
      <ChartBindingPreview
        chartKind={payload.chartKind}
        bindings={payload.bindings}
        availableSeries={dataSeriesRows}
        seriesValueResolver={resolveSeriesValues}
        frameSize={{ width: w, height: h }}
        blockPointerEventsToChart={!readerPreview}
        interactionSurface={interactionSurface}
        designVisual={payload.designVisual}
      />
    </Box>
  );
}
