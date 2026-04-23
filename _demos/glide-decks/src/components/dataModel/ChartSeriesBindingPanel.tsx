import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import {
  CHART_BINDING_SLOT_PULSE_ANIMATION_INFINITE,
  CHART_BINDING_SLOT_PULSE_ANIMATION_INTRO,
  CHART_BINDING_SLOT_PULSE_INTRO_MS,
  chartBindingSlotPulseKeyframes,
} from "../../theme/chartBindingSlotPulse";
import { tokens } from "../../theme/tokens";
import { getChartContract } from "../../chart/chartSlotContracts";
import { MAX_PLOT_GROUPS } from "../../chart/chartLimits";
import { layerBorderColor, layerSurfaceTint } from "../../chart/layerAccents";
import type { ChartCreationKind } from "../../types/dataModel";
import type { ChartBindingsState, IndexedLayerRow } from "../../types/chartBindings";
import {
  DATA_SERIES_DRAG_MIME,
  readSeriesNameFromDataTransfer,
} from "../../types/chartBindings";
import type { DataSeriesAssetRow } from "../../types/dataModel";
import { createFixtureSeriesValueResolver, type SeriesValueResolver } from "../../data/seriesValueResolver";
import { catalogByName, previewReadiness } from "../../chart/chartBindingPreviewData";
import {
  ChartBindingNameField,
  type ChartBindingNameFieldHandle,
} from "./ChartBindingNameField";
import { ChartBindingPreview } from "./ChartBindingPreview";
import { IndexedCartesianAxesControls } from "./IndexedCartesianAxesControls";
import { chartKindSupportsIndexedSecondaryAxes, syncIndexedLayers } from "../../chart/indexedAxesBindings";

const defaultFixtureResolver = createFixtureSeriesValueResolver();

/** Matches SeriesIndexProperties source column / grid panel rhythm — chart name field does not span full panel width. */
const CHART_NAME_FIELD_MAX_WIDTH_PX = 320;

export interface ChartSeriesBindingPanelProps {
  chartKind: ChartCreationKind;
  availableSeries: DataSeriesAssetRow[];
  /** Preview data: fixture seeds vs project CSV-backed values. */
  seriesValueResolver?: SeriesValueResolver;
  bindings: ChartBindingsState;
  onBindingsChange: (next: ChartBindingsState) => void;
  chartName: string;
  onChartNameChange: (name: string) => void;
  /** Receives the current name field draft (after implicit flush from the panel). */
  onSave: (chartName: string) => void;
  /** Shown under the identity field when save validation fails. */
  saveError?: string | null;
  /** When set (e.g. authoring canvas), empty slot "+" hints pulse the Data Series ledger on the right. */
  onHintDataSeriesLedger?: () => void;
  /** Opens the chart design appearance modal; receives current name draft (may be uncommitted to parent). */
  onOpenDesignAppearance?: (latestChartName: string) => void;
  /** Live frame metrics from the design modal / persisted layout; caption falls back to placeholders when null. */
  appearanceSummary?: { widthPx: number; heightPx: number; aspectRatio: number } | null;
  /** When set (e.g. data model canvas), close control is shown in the dark chrome bar. */
  onClose?: () => void;
}

function preventDragDefaults(e: React.DragEvent) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
}

function isDataSeriesDragEvent(e: React.DragEvent): boolean {
  return Array.from(e.dataTransfer.types).includes(DATA_SERIES_DRAG_MIME);
}

/** Attach global data series to chart slots (Stitch: Bubble Chart — Blueprint Theme). */
export function ChartSeriesBindingPanel({
  chartKind,
  availableSeries,
  seriesValueResolver,
  bindings,
  onBindingsChange,
  chartName,
  onChartNameChange,
  onSave,
  saveError,
  onHintDataSeriesLedger,
  onOpenDesignAppearance,
  appearanceSummary,
  onClose,
}: ChartSeriesBindingPanelProps) {
  const chartNameFieldRef = useRef<ChartBindingNameFieldHandle>(null);
  const contract = useMemo(() => getChartContract(chartKind), [chartKind]);
  const catalog = useMemo(() => catalogByName(availableSeries), [availableSeries]);
  const resolver = seriesValueResolver ?? defaultFixtureResolver;
  const previewReady = useMemo(
    () => previewReadiness(chartKind, bindings, catalog, resolver),
    [chartKind, bindings, catalog, resolver],
  );

  /** One-shot pulse for "Design Appearance" — only after user-driven transition to preview-ready (not if already ready on mount). */
  const designAppearancePulseConsumedRef = useRef(false);
  const previewReadyPrevRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const [designAppearancePulsePlay, setDesignAppearancePulsePlay] = useState(false);

  useEffect(() => {
    const wasReady = previewReadyPrevRef.current;
    const first = isFirstRenderRef.current;
    isFirstRenderRef.current = false;
    previewReadyPrevRef.current = previewReady;

    if (!previewReady) return;
    if (designAppearancePulseConsumedRef.current) return;

    if (first && previewReady) {
      designAppearancePulseConsumedRef.current = true;
      return;
    }

    if (!wasReady) {
      designAppearancePulseConsumedRef.current = true;
      setDesignAppearancePulsePlay(true);
      const t = window.setTimeout(() => setDesignAppearancePulsePlay(false), CHART_BINDING_SLOT_PULSE_INTRO_MS);
      return () => window.clearTimeout(t);
    }
  }, [previewReady]);

  if (bindings.mode !== contract.mode) {
    return (
      <Typography color="error" variant="body2">
        Binding state does not match chart contract — reset by re-selecting chart type.
      </Typography>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        overflow: "hidden",
        borderColor: tokens.colorBorder,
        bgcolor: tokens.colorSurface,
      }}
    >
      <Box
        sx={{
          bgcolor: tokens.colorChrome,
          color: "rgba(255,255,255,0.95)",
          px: 2,
          py: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1, maxWidth: CHART_NAME_FIELD_MAX_WIDTH_PX, width: "100%" }}>
            <ChartBindingNameField
              ref={chartNameFieldRef}
              chartName={chartName}
              onChartNameChange={onChartNameChange}
              chartKind={chartKind}
              saveError={saveError}
            />
          </Box>
          {onClose != null ? (
            <Tooltip title="Close chart binding">
              <IconButton
                size="small"
                aria-label="Close chart binding"
                onClick={onClose}
                sx={{
                  color: "rgba(255,255,255,0.92)",
                  mt: -0.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ p: 2, bgcolor: "#ffffff" }}>
        {bindings.mode === "indexed_layers" && contract.mode === "indexed_layers" && (
          <IndexedLayersPanel
            chartKind={chartKind}
            contract={contract}
            bindings={bindings}
            onBindingsChange={onBindingsChange}
            onHintDataSeriesLedger={onHintDataSeriesLedger}
          />
        )}
        {bindings.mode === "category_values" && contract.mode === "category_values" && (
          <CategoryValuesPanel
            contract={contract}
            bindings={bindings}
            onBindingsChange={onBindingsChange}
            onHintDataSeriesLedger={onHintDataSeriesLedger}
          />
        )}
        {bindings.mode === "paired" && contract.mode === "paired" && (
          <PairedPanel
            contract={contract}
            bindings={bindings}
            onBindingsChange={onBindingsChange}
            onHintDataSeriesLedger={onHintDataSeriesLedger}
          />
        )}

        <Divider
          sx={{
            mt: 3,
            borderColor: tokens.colorBorder,
          }}
        />

        <Box
          sx={{
            mt: 2,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          {/* Section 1 — Shape Preview */}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              component="h3"
              sx={{ fontWeight: 700, color: "text.primary", letterSpacing: 0.02, mb: 1.5 }}
            >
              Shape Preview
            </Typography>
            <Box
              sx={{
                width: "100%",
                maxWidth: 430,
                height: 200,
                mx: { xs: 0, md: "auto" },
                borderRadius: 1,
                border: `1px dashed ${tokens.colorBorder}`,
                bgcolor: tokens.colorSurface,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <ChartBindingPreview
                chartKind={chartKind}
                bindings={bindings}
                availableSeries={availableSeries}
                seriesValueResolver={seriesValueResolver}
              />
            </Box>
            
          </Box>

          {/* Section 2 — Design Appearance */}
          <Box
            sx={{
              minWidth: 0,
              pt: { xs: 2, md: 0 },
              borderTop: { xs: `1px solid ${tokens.colorBorder}`, md: "none" },
              borderLeft: { md: `1px solid ${tokens.colorBorder}` },
              pl: { md: 2 },
            }}
          >
            <Button
              variant="outlined"
              size="medium"
              fullWidth
              disabled={!onOpenDesignAppearance}
              onClick={() => {
                const latest = chartNameFieldRef.current?.getDraft() ?? chartName;
                onOpenDesignAppearance?.(latest);
              }}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                ...chartBindingSlotPulseKeyframes,
                ...(designAppearancePulsePlay
                  ? { animation: CHART_BINDING_SLOT_PULSE_ANIMATION_INTRO }
                  : {}),
              }}
            >
              Design Appearance
            </Button>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 1,
                whiteSpace: "pre-line",
                opacity: 0.85,
                lineHeight: 1.5,
              }}
            >
              {appearanceSummary
                ? `•width:${appearanceSummary.widthPx}px\n•height:${appearanceSummary.heightPx}px\n•aspect:${appearanceSummary.aspectRatio.toFixed(2)}\n•colors:theme`
                : `•width:—\n•height:—\n•aspect:—\n•colors:theme`}
            </Typography>
          </Box>

          {/* Section 3 — Design Interactivity */}
          <Box
            sx={{
              minWidth: 0,
              pt: { xs: 2, md: 0 },
              borderTop: { xs: `1px solid ${tokens.colorBorder}`, md: "none" },
              borderLeft: { md: `1px solid ${tokens.colorBorder}` },
              pl: { md: 2 },
            }}
          >
            <Button
              variant="outlined"
              size="medium"
              fullWidth
              onClick={() => {
                // TODO: open design interactivity modal
              }}
              sx={{ fontWeight: 600, textTransform: "none" }}
            >
              Design Interactivity
            </Button>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 1,
                whiteSpace: "pre-line",
                opacity: 0.85,
                lineHeight: 1.5,
              }}
            >
              {`•no interactivity`}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            size="medium"
            startIcon={<SaveIcon />}
            onClick={() => {
              const latest = chartNameFieldRef.current?.getDraft() ?? chartName;
              onChartNameChange(latest);
              onSave(latest);
            }}
            sx={{ fontWeight: 600 }}
          >
            Save chart
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

function IndexedLayersPanel({
  chartKind,
  contract,
  bindings,
  onBindingsChange,
  onHintDataSeriesLedger,
}: {
  chartKind: ChartCreationKind;
  contract: ReturnType<typeof getChartContract>;
  bindings: Extract<ChartBindingsState, { mode: "indexed_layers" }>;
  onBindingsChange: (next: ChartBindingsState) => void;
  onHintDataSeriesLedger?: () => void;
}) {
  const slots = contract.slots;
  const n = slots.length;
  const gridColsMd = `88px repeat(${n}, minmax(0, 1fr)) minmax(40px, auto)`;

  const setLayerCell = (layerIndex: number, slotId: string, name: string | null) => {
    const next = bindings.layers.map((row, i) =>
      i === layerIndex ? { ...row, [slotId]: name } : row,
    );
    onBindingsChange(syncIndexedLayers(bindings, next));
  };

  const addLayer = () => {
    if (bindings.layers.length >= MAX_PLOT_GROUPS) return;
    const empty: IndexedLayerRow = {};
    for (const s of slots) empty[s.id] = null;
    onBindingsChange(syncIndexedLayers(bindings, [...bindings.layers, empty]));
  };

  const removeLayer = (layerIndex: number) => {
    if (bindings.layers.length <= 1) return;
    onBindingsChange(syncIndexedLayers(bindings, bindings.layers.filter((_, i) => i !== layerIndex)));
  };

  const atCap = bindings.layers.length >= MAX_PLOT_GROUPS;
  const [secondaryAxesDrawerOpen, setSecondaryAxesDrawerOpen] = useState(false);
  const secondaryAxesDrawerId = useId();

  return (
    <Box>
      {/* md+: single grid — slot headers align with drop cells */}
      <Box
        sx={{
          display: { xs: "none", md: "grid" },
          gridTemplateColumns: gridColsMd,
          gap: 1,
          alignItems: "stretch",
          mb: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }} />
        {slots.map((slot) => (
          <Box key={`h-${slot.id}`} sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.6, display: "block" }}
            >
              {slot.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", lineHeight: 1.3 }}>
              {slot.description}
            </Typography>
          </Box>
        ))}
        <Box />

        {bindings.layers.map((row, layerIndex) => (
          <Fragment key={layerIndex}>
            <Box
              sx={{
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
                borderLeft: `4px solid ${layerBorderColor(layerIndex)}`,
                bgcolor: layerSurfaceTint(layerIndex),
                py: 0.5,
                px: 1,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ fontFamily: "'JetBrains Mono', monospace", color: layerBorderColor(layerIndex), textAlign: "center" }}
              >
                {layerIndex + 1}
              </Typography>
            </Box>
            {slots.map((slot) => (
              <DropChip
                key={slot.id}
                label={slot.label}
                value={row[slot.id] ?? null}
                layerIndex={layerIndex}
                onClear={() => setLayerCell(layerIndex, slot.id, null)}
                onDropName={(name) => setLayerCell(layerIndex, slot.id, name)}
                onRemoveLayer={() => removeLayer(layerIndex)}
                canRemoveLayer={false}
                hideLayerBadge
                compact
                onHintDataSeriesLedger={onHintDataSeriesLedger}
              />
            ))}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {bindings.layers.length > 1 && (
                <IconButton
                  size="small"
                  aria-label={`Remove plot group ${layerIndex + 1}`}
                  onClick={() => removeLayer(layerIndex)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Fragment>
        ))}
      </Box>

      {/* xs: stacked plot groups */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            gap: 1,
            mb: 1.5,
          }}
        >
          {slots.map((slot) => (
            <Box key={slot.id}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}
              >
                {slot.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", lineHeight: 1.3 }}>
                {slot.description}
              </Typography>
            </Box>
          ))}
        </Box>

        {bindings.layers.map((row, layerIndex) => (
          <Box
            key={layerIndex}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mb: 1.5,
              p: 1,
              borderRadius: 1,
              border: `1px solid ${tokens.colorBorder}`,
              bgcolor: "rgba(255,255,255,0.9)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Box
                sx={{
                  borderRadius: 1,
                  borderLeft: `4px solid ${layerBorderColor(layerIndex)}`,
                  bgcolor: layerSurfaceTint(layerIndex),
                  py: 0.5,
                  px: 1,
                }}
              >
                <Typography variant="caption" fontWeight={700} sx={{ fontFamily: "'JetBrains Mono', monospace", color: layerBorderColor(layerIndex) }}>
                  Plot group {layerIndex + 1}
                </Typography>
              </Box>
              {bindings.layers.length > 1 && (
                <IconButton size="small" aria-label={`Remove plot group ${layerIndex + 1}`} onClick={() => removeLayer(layerIndex)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 1,
              }}
            >
              {slots.map((slot) => (
                <DropChip
                  key={slot.id}
                  label={slot.label}
                  value={row[slot.id] ?? null}
                  layerIndex={layerIndex}
                  onClear={() => setLayerCell(layerIndex, slot.id, null)}
                  onDropName={(name) => setLayerCell(layerIndex, slot.id, name)}
                  onRemoveLayer={() => removeLayer(layerIndex)}
                  canRemoveLayer={false}
                  hideLayerBadge
                  compact
                  onHintDataSeriesLedger={onHintDataSeriesLedger}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mt: 1 }}>
        <Tooltip title={atCap ? `At most ${MAX_PLOT_GROUPS} plot groups` : "Add another plot group"}>
          <span>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              sx={{ fontWeight: 600 }}
              onClick={addLayer}
              disabled={atCap}
            >
              Add Plot Group
            </Button>
          </span>
        </Tooltip>
        {chartKindSupportsIndexedSecondaryAxes(chartKind) && (
          <Button
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600 }}
            aria-expanded={secondaryAxesDrawerOpen}
            aria-controls={secondaryAxesDrawerId}
            onClick={() => setSecondaryAxesDrawerOpen(true)}
          >
            Edit Secondary Axes
          </Button>
        )}
      </Box>

      {chartKindSupportsIndexedSecondaryAxes(chartKind) && (
        <Drawer
          anchor="right"
          open={secondaryAxesDrawerOpen}
          onClose={() => setSecondaryAxesDrawerOpen(false)}
          slotProps={{
            paper: {
              id: secondaryAxesDrawerId,
              sx: {
                width: { xs: "100%", sm: 380 },
                maxWidth: "100%",
                p: 2,
                boxSizing: "border-box",
              },
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, gap: 1 }}>
            <Typography component="h3" variant="subtitle1" fontWeight={700}>
              Secondary axes
            </Typography>
            <IconButton
              size="small"
              aria-label="Close secondary axes"
              onClick={() => setSecondaryAxesDrawerOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <IndexedCartesianAxesControls
            chartKind={chartKind}
            bindings={bindings}
            onBindingsChange={onBindingsChange}
            compact
            suppressTitle
          />
        </Drawer>
      )}
    </Box>
  );
}

function CategoryValuesPanel({
  contract,
  bindings,
  onBindingsChange,
  onHintDataSeriesLedger,
}: {
  contract: ReturnType<typeof getChartContract>;
  bindings: Extract<ChartBindingsState, { mode: "category_values" }>;
  onBindingsChange: (next: ChartBindingsState) => void;
  onHintDataSeriesLedger?: () => void;
}) {
  const catSlot = contract.slots[0];
  const valSlot = contract.slots[1];
  const vCount = bindings.values.length;
  const gridColsMd = `88px minmax(0,1fr) repeat(${vCount}, minmax(0,1fr))`;

  const setCategory = (name: string | null) => {
    onBindingsChange({ ...bindings, category: name });
  };
  const setValueAt = (i: number, name: string | null) => {
    const values = bindings.values.map((v, j) => (j === i ? name : v));
    onBindingsChange({ ...bindings, values });
  };
  const addValueRow = () => {
    if (bindings.values.length >= MAX_PLOT_GROUPS) return;
    onBindingsChange({ ...bindings, values: [...bindings.values, null] });
  };
  const removeValueRow = (i: number) => {
    if (bindings.values.length <= 1) return;
    onBindingsChange({ ...bindings, values: bindings.values.filter((_, j) => j !== i) });
  };

  const valueAtCap = bindings.values.length >= MAX_PLOT_GROUPS;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
        {contract.valuesGroupLabel ?? "Value series"} — each column is one numeric series sharing the category index (spec §7).
      </Typography>

      {/* md+: same grid rhythm as bubble chart — headers align with drop targets */}
      <Box
        sx={{
          display: { xs: "none", md: "grid" },
          gridTemplateColumns: gridColsMd,
          gap: 1,
          alignItems: "stretch",
          mb: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: 0.6, display: "block" }}
          >
            {catSlot.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", lineHeight: 1.3 }}>
            {catSlot.description}
          </Typography>
        </Box>
        {bindings.values.map((_, i) => (
          <Box key={`h-val-${i}`} sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.6, display: "block" }}
            >
              Series {i + 1}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", lineHeight: 1.3 }}>
              {valSlot.description}
            </Typography>
          </Box>
        ))}

        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            borderLeft: `4px solid ${layerBorderColor(0)}`,
            bgcolor: layerSurfaceTint(0),
            py: 0.5,
            px: 1,
          }}
        >
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ fontFamily: "'JetBrains Mono', monospace", color: layerBorderColor(0), textAlign: "center" }}
          >
            1
          </Typography>
        </Box>
        <DropChip
          label="Category"
          value={bindings.category}
          layerIndex={0}
          onClear={() => setCategory(null)}
          onDropName={(name) => setCategory(name)}
          onRemoveLayer={() => {}}
          canRemoveLayer={false}
          hideLayerBadge
          compact
          onHintDataSeriesLedger={onHintDataSeriesLedger}
        />
        {bindings.values.map((v, i) => (
          <DropChip
            key={`v-${i}`}
            label={`Series ${i + 1}`}
            value={v}
            layerIndex={i + 1}
            onClear={() => setValueAt(i, null)}
            onDropName={(name) => setValueAt(i, name)}
            onRemoveLayer={() => removeValueRow(i)}
            canRemoveLayer={bindings.values.length > 1}
            hideLayerBadge
            compact
            onHintDataSeriesLedger={onHintDataSeriesLedger}
          />
        ))}
      </Box>

      {/* xs: stacked */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${1 + vCount}, minmax(0, 1fr))`,
            gap: 1,
            mb: 1.5,
          }}
        >
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
              {catSlot.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", lineHeight: 1.3 }}>
              {catSlot.description}
            </Typography>
          </Box>
          {bindings.values.map((_, i) => (
            <Box key={`xh-${i}`}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
                Series {i + 1}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", lineHeight: 1.3 }}>
                {valSlot.description}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            p: 1,
            borderRadius: 1,
            border: `1px solid ${tokens.colorBorder}`,
            bgcolor: "rgba(255,255,255,0.9)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Box
              sx={{
                borderRadius: 1,
                borderLeft: `4px solid ${layerBorderColor(0)}`,
                bgcolor: layerSurfaceTint(0),
                py: 0.5,
                px: 1,
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ fontFamily: "'JetBrains Mono', monospace", color: layerBorderColor(0) }}>
                1
              </Typography>
            </Box>
          </Box>
          <DropChip
            label="Category"
            value={bindings.category}
            layerIndex={0}
            onClear={() => setCategory(null)}
            onDropName={(name) => setCategory(name)}
            onRemoveLayer={() => {}}
            canRemoveLayer={false}
            hideLayerBadge
            compact
            onHintDataSeriesLedger={onHintDataSeriesLedger}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            {bindings.values.map((v, i) => (
              <DropChip
                key={`xs-v-${i}`}
                label={`Series ${i + 1}`}
                value={v}
                layerIndex={i + 1}
                onClear={() => setValueAt(i, null)}
                onDropName={(name) => setValueAt(i, name)}
                onRemoveLayer={() => removeValueRow(i)}
                canRemoveLayer={bindings.values.length > 1}
                hideLayerBadge
                compact
                onHintDataSeriesLedger={onHintDataSeriesLedger}
              />
            ))}
          </Box>
        </Box>
      </Box>

      <Tooltip title={valueAtCap ? `At most ${MAX_PLOT_GROUPS} value series` : "Add another value series"}>
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            sx={{ mt: 1, fontWeight: 600 }}
            onClick={addValueRow}
            disabled={valueAtCap}
          >
            Add value series
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
}

function PairedPanel({
  contract,
  bindings,
  onBindingsChange,
  onHintDataSeriesLedger,
}: {
  contract: ReturnType<typeof getChartContract>;
  bindings: Extract<ChartBindingsState, { mode: "paired" }>;
  onBindingsChange: (next: ChartBindingsState) => void;
  onHintDataSeriesLedger?: () => void;
}) {
  const [cSlot, vSlot] = contract.slots;
  const gridColsMd = `88px repeat(2, minmax(0, 1fr))`;

  return (
    <Box>
      <Box
        sx={{
          display: { xs: "none", md: "grid" },
          gridTemplateColumns: gridColsMd,
          gap: 1,
          alignItems: "stretch",
          mb: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: 0.6, display: "block" }}
          >
            {cSlot.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", lineHeight: 1.3 }}>
            {cSlot.description}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: 0.6, display: "block" }}
          >
            {vSlot.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", lineHeight: 1.3 }}>
            {vSlot.description}
          </Typography>
        </Box>

        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            borderLeft: `4px solid ${layerBorderColor(0)}`,
            bgcolor: layerSurfaceTint(0),
            py: 0.5,
            px: 1,
          }}
        >
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ fontFamily: "'JetBrains Mono', monospace", color: layerBorderColor(0), textAlign: "center" }}
          >
            1
          </Typography>
        </Box>
        <DropChip
          label={cSlot.label}
          value={bindings.category}
          layerIndex={0}
          onClear={() => onBindingsChange({ ...bindings, category: null })}
          onDropName={(name) => onBindingsChange({ ...bindings, category: name })}
          onRemoveLayer={() => {}}
          canRemoveLayer={false}
          hideLayerBadge
          compact
          onHintDataSeriesLedger={onHintDataSeriesLedger}
        />
        <DropChip
          label={vSlot.label}
          value={bindings.value}
          layerIndex={1}
          onClear={() => onBindingsChange({ ...bindings, value: null })}
          onDropName={(name) => onBindingsChange({ ...bindings, value: name })}
          onRemoveLayer={() => {}}
          canRemoveLayer={false}
          hideLayerBadge
          compact
          onHintDataSeriesLedger={onHintDataSeriesLedger}
        />
      </Box>

      <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 1.5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1,
            mb: 0.5,
          }}
        >
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
              {cSlot.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", lineHeight: 1.3 }}>
              {cSlot.description}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
              {vSlot.label}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem", lineHeight: 1.3 }}>
              {vSlot.description}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            p: 1,
            borderRadius: 1,
            border: `1px solid ${tokens.colorBorder}`,
            bgcolor: "rgba(255,255,255,0.9)",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                borderRadius: 1,
                borderLeft: `4px solid ${layerBorderColor(0)}`,
                bgcolor: layerSurfaceTint(0),
                py: 0.5,
                px: 1,
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ fontFamily: "'JetBrains Mono', monospace", color: layerBorderColor(0) }}>
                1
              </Typography>
            </Box>
          </Box>
          <DropChip
            label={cSlot.label}
            value={bindings.category}
            layerIndex={0}
            onClear={() => onBindingsChange({ ...bindings, category: null })}
            onDropName={(name) => onBindingsChange({ ...bindings, category: name })}
            onRemoveLayer={() => {}}
            canRemoveLayer={false}
            hideLayerBadge
            compact
            onHintDataSeriesLedger={onHintDataSeriesLedger}
          />
          <DropChip
            label={vSlot.label}
            value={bindings.value}
            layerIndex={1}
            onClear={() => onBindingsChange({ ...bindings, value: null })}
            onDropName={(name) => onBindingsChange({ ...bindings, value: name })}
            onRemoveLayer={() => {}}
            canRemoveLayer={false}
            hideLayerBadge
            compact
            onHintDataSeriesLedger={onHintDataSeriesLedger}
          />
        </Box>
      </Box>
    </Box>
  );
}

function DropChip({
  label,
  value,
  layerIndex,
  onClear,
  onDropName,
  onRemoveLayer,
  canRemoveLayer,
  hideLayerBadge,
  compact,
  onHintDataSeriesLedger,
}: {
  label: string;
  value: string | null;
  layerIndex: number;
  onClear: () => void;
  onDropName: (name: string) => void;
  onRemoveLayer: () => void;
  canRemoveLayer: boolean;
  hideLayerBadge?: boolean;
  /** Tighter cell when plot group row already shows layer chrome. */
  compact?: boolean;
  onHintDataSeriesLedger?: () => void;
}) {
  const border = layerBorderColor(layerIndex);
  const tint = layerSurfaceTint(layerIndex);

  const [seriesDragOver, setSeriesDragOver] = useState(false);

  useEffect(() => {
    const end = () => setSeriesDragOver(false);
    window.addEventListener("dragend", end);
    return () => window.removeEventListener("dragend", end);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setSeriesDragOver(false);
    const name = readSeriesNameFromDataTransfer(e.dataTransfer);
    if (name) onDropName(name);
  };

  const onDragEnter = (e: React.DragEvent) => {
    if (!isDataSeriesDragEvent(e)) return;
    e.preventDefault();
    setSeriesDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    if (!isDataSeriesDragEvent(e)) return;
    const related = e.relatedTarget as Node | null;
    if (related && (e.currentTarget as HTMLElement).contains(related)) return;
    setSeriesDragOver(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    preventDragDefaults(e);
    if (isDataSeriesDragEvent(e)) setSeriesDragOver(true);
  };

  const emptyHint = value == null && onHintDataSeriesLedger != null;

  const dragActiveSx = seriesDragOver
    ? ({
        ...chartBindingSlotPulseKeyframes,
        outline: `2px solid ${tokens.colorPrimary}`,
        outlineOffset: 0,
        animation: CHART_BINDING_SLOT_PULSE_ANIMATION_INFINITE,
        zIndex: 1,
      } as const)
    : {};

  return (
    <Box
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      sx={{
        borderLeft: compact ? `3px solid ${border}` : `4px solid ${border}`,
        bgcolor: compact ? "rgba(255,255,255,0.85)" : tint,
        borderRadius: 1,
        px: compact ? 0.75 : 1,
        py: compact ? 0.5 : 0.75,
        minHeight: compact ? 40 : 44,
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
        border: compact ? `1px solid ${tokens.colorBorder}` : undefined,
        position: "relative",
        ...dragActiveSx,
      }}
    >
      {!hideLayerBadge && (
        <Typography
          variant="caption"
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: border,
            minWidth: 52,
          }}
        >
          #{layerIndex + 1}
        </Typography>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {value ? (
          <Chip
            size="small"
            label={value}
            onDelete={onClear}
            sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", maxWidth: "100%" }}
          />
        ) : emptyHint ? (
          <Box
            role="button"
            tabIndex={0}
            aria-label="Highlight the Data Series list: drag a series from there into this slot"
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              onHintDataSeriesLedger();
            }}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onHintDataSeriesLedger();
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "text.secondary",
              cursor: "pointer",
              borderRadius: 0.5,
              outline: "none",
              "&:hover .chart-binding-empty-slot-icon": { opacity: 1 },
              "&:focus-visible": {
                boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
              },
            }}
          >
            <AddCircleOutlineIcon className="chart-binding-empty-slot-icon" sx={{ fontSize: 18, opacity: 0.7 }} />
            <Typography variant="caption">{label} — drop series here</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
            <AddCircleOutlineIcon sx={{ fontSize: 18, opacity: 0.7 }} />
            <Typography variant="caption">{label} — drop series here</Typography>
          </Box>
        )}
      </Box>
      {canRemoveLayer && (
        <IconButton size="small" aria-label="Remove layer" onClick={onRemoveLayer}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
