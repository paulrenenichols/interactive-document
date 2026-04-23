import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import Alert from "@mui/material/Alert";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DebouncedNumericTextField } from "../common/DebouncedNumericTextField";
import {
  CHART_DESIGN_FONT_CHOICES,
  defaultPlotMarginForChartKind,
  deriveAutoAxisLabel,
  deriveAxisFormatSourceSeriesName,
  getDesignAxisDescriptors,
  mergeAppearanceWithVisualDefaults,
  patchChartAppearanceVisual,
  resolveChartTitleDisplayText,
} from "../../chart/chartAppearanceVisual";
import { CHART_PREVIEW_MAX_POINT_LABELS } from "../../chart/chartLimits";
import { catalogByName } from "../../chart/chartBindingPreviewData";
import { chartKindSupportsIndexedSecondaryAxes } from "../../chart/indexedAxesBindings";
import { IndexedCartesianAxesControls } from "../dataModel/IndexedCartesianAxesControls";
import type {
  AxisTickMarkDisplay,
  ChartAppearanceLayout,
  ChartCreationKind,
  DataSeriesAssetRow,
} from "../../types/dataModel";
import type { ChartBindingsState } from "../../types/chartBindings";
import { tokens } from "../../theme/tokens";

const AXIS_THICKNESS_CHOICES = [1, 2, 3, 4] as const;

const TICK_MARK_DISPLAY_CHOICES: { value: AxisTickMarkDisplay; label: string }[] = [
  { value: "none", label: "None" },
  { value: "cross", label: "Cross" },
  { value: "inside", label: "Inside" },
  { value: "outside", label: "Outside" },
];

export interface ChartDesignAppearanceSidebarProps {
  chartKind: ChartCreationKind;
  bindings: ChartBindingsState;
  availableSeries: DataSeriesAssetRow[];
  chartName: string;
  appearance: ChartAppearanceLayout;
  onAppearanceChange: (next: ChartAppearanceLayout) => void;
  /** When set, indexed charts that support secondary axes show a "Bind Secondary Axes" section. */
  onBindingsChange?: (next: ChartBindingsState) => void;
  /** Indexed preview: true when more non-empty labels existed than the configured chart-wide limit. */
  pointLabelsTruncated?: boolean;
  /** Fires when the "Plot area" accordion opens or closes (for design-canvas plot margin highlight). */
  onPlotAreaSectionOpenChange?: (open: boolean) => void;
}

export function ChartDesignAppearanceSidebar({
  chartKind,
  bindings,
  availableSeries,
  chartName,
  appearance,
  onAppearanceChange,
  onBindingsChange,
  pointLabelsTruncated = false,
  onPlotAreaSectionOpenChange,
}: ChartDesignAppearanceSidebarProps) {
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false);
  const onAccordionChange = (panelId: string) => (_: SyntheticEvent, expanded: boolean) => {
    setExpandedPanel(expanded ? panelId : false);
  };

  useEffect(() => {
    onPlotAreaSectionOpenChange?.(expandedPanel === "plot");
  }, [expandedPanel, onPlotAreaSectionOpenChange]);

  const catalog = useMemo(() => catalogByName(availableSeries), [availableSeries]);
  const merged = useMemo(
    () => mergeAppearanceWithVisualDefaults(appearance, chartKind, bindings, chartName.trim() || "Chart"),
    [appearance, chartKind, bindings, chartName],
  );
  const visual = merged.visual!;
  const plotMarginDefaults = useMemo(() => defaultPlotMarginForChartKind(chartKind), [chartKind]);
  const axisDescriptors = useMemo(() => getDesignAxisDescriptors(chartKind, bindings), [chartKind, bindings]);

  const displayTitle = resolveChartTitleDisplayText(visual, chartName);

  const patch = (fn: Parameters<typeof patchChartAppearanceVisual>[4]) => {
    onAppearanceChange(patchChartAppearanceVisual(appearance, chartKind, bindings, chartName, fn));
  };

  const showBindSecondaryAxes =
    onBindingsChange != null &&
    bindings.mode === "indexed_layers" &&
    chartKindSupportsIndexedSecondaryAxes(chartKind);

  const accordionSx = { border: `1px solid ${tokens.colorBorder}`, borderRadius: 1, "&:before": { display: "none" } } as const;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Accordion
        disableGutters
        elevation={0}
        expanded={expandedPanel === "title"}
        onChange={onAccordionChange("title")}
        sx={accordionSx}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={600}>
            Title
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={visual.title.showTitle}
                onChange={(_, c) => patch((v) => ({ ...v, title: { ...v.title, showTitle: c } }))}
              />
            }
            label="Show title"
          />
          <TextField
            size="small"
            label="Title text"
            fullWidth
            value={visual.title.titleSource === "auto" ? displayTitle : visual.title.titleText}
            onChange={(e) => {
              const t = e.target.value;
              patch((v) => ({ ...v, title: { ...v.title, titleText: t, titleSource: "user" } }));
            }}
            helperText={visual.title.titleSource === "auto" ? "Follows chart name until you edit." : "Custom title"}
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="chart-title-pos-label">Set position</InputLabel>
            <Select
              labelId="chart-title-pos-label"
              label="Set position"
              value={visual.title.titlePosition}
              onChange={(e) =>
                patch((v) => ({
                  ...v,
                  title: { ...v.title, titlePosition: e.target.value as "above_plot" | "below_plot" },
                }))
              }
            >
              <MenuItem value="above_plot">Centered above plot area</MenuItem>
              <MenuItem value="below_plot">Centered below plot area</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel id="chart-title-font-label">Font</InputLabel>
            <Select
              labelId="chart-title-font-label"
              label="Font"
              value={visual.title.titleFontFamily}
              onChange={(e) => patch((v) => ({ ...v, title: { ...v.title, titleFontFamily: e.target.value } }))}
            >
              {CHART_DESIGN_FONT_CHOICES.map((f) => (
                <MenuItem key={f} value={f}>
                  {f.replace(/"/g, "")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <DebouncedNumericTextField
            size="small"
            label="Font size (pt)"
            fullWidth
            committed={visual.title.titleFontSizePt}
            min={6}
            max={128}
            defaultValue={20}
            onCommit={(n) => patch((v) => ({ ...v, title: { ...v.title, titleFontSizePt: n } }))}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion
        disableGutters
        elevation={0}
        expanded={expandedPanel === "plot"}
        onChange={onAccordionChange("plot")}
        sx={accordionSx}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" fontWeight={600}>
            Plot area
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 0 }}>
          <Typography variant="caption" color="text.secondary">
            Padding between the chart object edge and the Recharts plot (Excel-style). Inner resize handles are a future
            enhancement.
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <DebouncedNumericTextField
                key={side}
                size="small"
                label={`${side} (px)`}
                committed={visual.plotMargin[side]}
                min={0}
                max={400}
                defaultValue={plotMarginDefaults[side]}
                onCommit={(n) =>
                  patch((prev) => ({
                    ...prev,
                    plotMargin: { ...prev.plotMargin, [side]: n },
                  }))
                }
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {bindings.mode === "indexed_layers" && (
        <Accordion
          disableGutters
          elevation={0}
          expanded={expandedPanel === "labels"}
          onChange={onAccordionChange("labels")}
          sx={accordionSx}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight={600}>
              Labels
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={visual.dataPointLabels.show}
                  onChange={(_, c) => patch((v) => ({ ...v, dataPointLabels: { ...v.dataPointLabels, show: c } }))}
                />
              }
              label="Show labels"
            />
            <Typography variant="caption" color="text.secondary">
              Renders labels from each layer&apos;s label series at data points. Empty or whitespace-only values are
              skipped. At most {CHART_PREVIEW_MAX_POINT_LABELS} labels are drawn chart-wide.
            </Typography>
            {pointLabelsTruncated && (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                Only the first {CHART_PREVIEW_MAX_POINT_LABELS} point labels are shown; additional non-empty labels were
                omitted.
              </Alert>
            )}
            <FormControl size="small" fullWidth>
              <InputLabel id="data-point-label-font">Label font</InputLabel>
              <Select
                labelId="data-point-label-font"
                label="Label font"
                value={visual.dataPointLabels.fontFamily}
                onChange={(e) =>
                  patch((v) => ({
                    ...v,
                    dataPointLabels: { ...v.dataPointLabels, fontFamily: e.target.value },
                  }))
                }
              >
                {CHART_DESIGN_FONT_CHOICES.map((f) => (
                  <MenuItem key={f} value={f}>
                    {f.replace(/"/g, "")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DebouncedNumericTextField
              size="small"
              label="Label text size (pt)"
              fullWidth
              committed={visual.dataPointLabels.fontSizePt}
              min={6}
              max={128}
              defaultValue={12}
              onCommit={(n) =>
                patch((v) => ({
                  ...v,
                  dataPointLabels: {
                    ...v.dataPointLabels,
                    fontSizePt: n,
                  },
                }))
              }
            />
          </AccordionDetails>
        </Accordion>
      )}

      {axisDescriptors.map((ad) => {
        const ax = visual.axes[ad.id]!;
        const autoLabel = deriveAutoAxisLabel(ad.id, chartKind, bindings, catalog);
        const labelDisplay = ax.labelSource === "auto" ? autoLabel : ax.labelText || autoLabel;
        const axisFormatSeriesName = deriveAxisFormatSourceSeriesName(ad.id, chartKind, bindings);
        const showNumericFormatOverride = axisFormatSeriesName !== null;
        return (
          <Accordion
            key={ad.id}
            disableGutters
            elevation={0}
            expanded={expandedPanel === ad.id}
            onChange={onAccordionChange(ad.id)}
            sx={accordionSx}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2" fontWeight={600}>
                {ad.label}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={ax.showAxis}
                    onChange={(_, c) =>
                      patch((v) => ({
                        ...v,
                        axes: { ...v.axes, [ad.id]: { ...v.axes[ad.id]!, showAxis: c } },
                      }))
                    }
                  />
                }
                label="Show axis"
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" sx={{ minWidth: 72 }}>
                  Axis color
                </Typography>
                <input
                  type="color"
                  value={ax.axisColor}
                  onChange={(e) =>
                    patch((v) => ({
                      ...v,
                      axes: { ...v.axes, [ad.id]: { ...v.axes[ad.id]!, axisColor: e.target.value } },
                    }))
                  }
                  aria-label={`${ad.label} color`}
                  style={{ width: 40, height: 28, border: "none", padding: 0, cursor: "pointer" }}
                />
              </Box>
              <FormControl size="small" fullWidth>
                <InputLabel id={`axis-thick-${ad.id}`}>Line thickness</InputLabel>
                <Select
                  labelId={`axis-thick-${ad.id}`}
                  label="Line thickness"
                  value={ax.axisThicknessPx}
                  onChange={(e) =>
                    patch((v) => ({
                      ...v,
                      axes: {
                        ...v.axes,
                        [ad.id]: { ...v.axes[ad.id]!, axisThicknessPx: Number(e.target.value) },
                      },
                    }))
                  }
                >
                  {AXIS_THICKNESS_CHOICES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}px
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel id={`axis-tickmark-${ad.id}`}>Tick marks</InputLabel>
                <Select
                  labelId={`axis-tickmark-${ad.id}`}
                  label="Tick marks"
                  value={ax.tickMarkDisplay}
                  onChange={(e) =>
                    patch((v) => ({
                      ...v,
                      axes: {
                        ...v.axes,
                        [ad.id]: { ...v.axes[ad.id]!, tickMarkDisplay: e.target.value as AxisTickMarkDisplay },
                      },
                    }))
                  }
                >
                  {TICK_MARK_DISPLAY_CHOICES.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={ax.showTickLabels}
                    onChange={(_, c) =>
                      patch((v) => ({
                        ...v,
                        axes: { ...v.axes, [ad.id]: { ...v.axes[ad.id]!, showTickLabels: c } },
                      }))
                    }
                  />
                }
                label="Show tick mark labels"
              />
              {showNumericFormatOverride && (
                <TextField
                  size="small"
                  label="Numeric format override"
                  fullWidth
                  value={ax.numericFormatOverride ?? ""}
                  placeholder="e.g. excel:#,##0.00"
                  onChange={(e) => {
                    const t = e.target.value.trim();
                    patch((v) => ({
                      ...v,
                      axes: {
                        ...v.axes,
                        [ad.id]: { ...v.axes[ad.id]!, numericFormatOverride: t ? t : null },
                      },
                    }));
                  }}
                  helperText="Leave empty to use the bound series format."
                />
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={ax.showLabel}
                    onChange={(_, c) =>
                      patch((v) => ({
                        ...v,
                        axes: { ...v.axes, [ad.id]: { ...v.axes[ad.id]!, showLabel: c } },
                      }))
                    }
                  />
                }
                label="Show label"
              />
              <TextField
                size="small"
                label="Label text"
                fullWidth
                value={ax.labelSource === "auto" ? autoLabel : ax.labelText}
                onChange={(e) =>
                  patch((v) => ({
                    ...v,
                    axes: {
                      ...v.axes,
                      [ad.id]: { ...v.axes[ad.id]!, labelText: e.target.value, labelSource: "user" },
                    },
                  }))
                }
                helperText={ax.labelSource === "auto" ? `Default: bound series (${autoLabel})` : "Custom label"}
              />
              <DebouncedNumericTextField
                size="small"
                label="Label angle (°)"
                fullWidth
                committed={ax.labelAngleDeg}
                min={-90}
                max={90}
                defaultValue={0}
                allowNegative
                onCommit={(n) =>
                  patch((v) => ({
                    ...v,
                    axes: {
                      ...v.axes,
                      [ad.id]: { ...v.axes[ad.id]!, labelAngleDeg: n },
                    },
                  }))
                }
              />
              <FormControl size="small" fullWidth>
                <InputLabel id={`lab-font-${ad.id}`}>Label font</InputLabel>
                <Select
                  labelId={`lab-font-${ad.id}`}
                  label="Label font"
                  value={ax.labelFontFamily}
                  onChange={(e) =>
                    patch((v) => ({
                      ...v,
                      axes: { ...v.axes, [ad.id]: { ...v.axes[ad.id]!, labelFontFamily: e.target.value } },
                    }))
                  }
                >
                  {CHART_DESIGN_FONT_CHOICES.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f.replace(/"/g, "")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DebouncedNumericTextField
                size="small"
                label="Label font size (pt)"
                fullWidth
                committed={ax.labelFontSizePt}
                min={6}
                max={128}
                defaultValue={12}
                onCommit={(n) =>
                  patch((v) => ({
                    ...v,
                    axes: {
                      ...v.axes,
                      [ad.id]: { ...v.axes[ad.id]!, labelFontSizePt: n },
                    },
                  }))
                }
              />
              <Typography variant="caption" color="text.secondary">
                Preview: {labelDisplay}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {showBindSecondaryAxes && (
        <Accordion
          disableGutters
          elevation={0}
          expanded={expandedPanel === "bindSecondaryAxes"}
          onChange={onAccordionChange("bindSecondaryAxes")}
          sx={accordionSx}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight={600}>
              Bind Secondary Axes
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 0 }}>
            <IndexedCartesianAxesControls
              chartKind={chartKind}
              bindings={bindings}
              onBindingsChange={onBindingsChange}
              compact
              suppressTitle
            />
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}
