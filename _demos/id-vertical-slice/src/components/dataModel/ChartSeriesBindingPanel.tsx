import { Fragment, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { tokens } from "../../theme/tokens";
import { CHART_CREATION_KIND_LABEL } from "../../chart/chartDefaultName";
import { getChartContract } from "../../chart/chartSlotContracts";
import { CHART_NAME_MAX_LENGTH, MAX_PLOT_GROUPS } from "../../chart/chartLimits";
import { layerBorderColor, layerSurfaceTint } from "../../chart/layerAccents";
import type { ChartCreationKind } from "../../types/dataModel";
import type { ChartBindingsState, IndexedLayerRow } from "../../types/chartBindings";
import { readSeriesNameFromDataTransfer } from "../../types/chartBindings";
import type { DataSeriesAssetRow } from "../../types/dataModel";

export interface ChartSeriesBindingPanelProps {
  chartKind: ChartCreationKind;
  availableSeries: DataSeriesAssetRow[];
  bindings: ChartBindingsState;
  onBindingsChange: (next: ChartBindingsState) => void;
  chartName: string;
  onChartNameChange: (name: string) => void;
  onSave: () => void;
  /** Shown under the identity field when save validation fails. */
  saveError?: string | null;
}

function preventDragDefaults(e: React.DragEvent) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
}

/** Attach global data series to chart slots (Stitch: Bubble Chart — Blueprint Theme). */
export function ChartSeriesBindingPanel({
  chartKind,
  availableSeries: _availableSeries,
  bindings,
  onBindingsChange,
  chartName,
  onChartNameChange,
  onSave,
  saveError,
}: ChartSeriesBindingPanelProps) {
  void _availableSeries;
  const contract = useMemo(() => getChartContract(chartKind), [chartKind]);

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
        <TextField
          label="Chart Name"
          value={chartName}
          onChange={(e) => onChartNameChange(e.target.value.slice(0, CHART_NAME_MAX_LENGTH))}
          inputProps={{ maxLength: CHART_NAME_MAX_LENGTH }}
          fullWidth
          size="small"
          variant="outlined"
          error={Boolean(saveError)}
          helperText={saveError ?? CHART_CREATION_KIND_LABEL[chartKind]}
          FormHelperTextProps={{ sx: { color: saveError ? undefined : "rgba(255,255,255,0.65)" } }}
          sx={{
            mt: 0.5,
            "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.75)" },
            "& .MuiOutlinedInput-root": {
              color: "rgba(255,255,255,0.95)",
              bgcolor: "rgba(0,0,0,0.12)",
            },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.35)" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.75)" },
          }}
        />
      </Box>

      <Box sx={{ p: 2, bgcolor: "#ffffff" }}>
        {bindings.mode === "indexed_layers" && contract.mode === "indexed_layers" && (
          <IndexedLayersPanel contract={contract} bindings={bindings} onBindingsChange={onBindingsChange} />
        )}
        {bindings.mode === "category_values" && contract.mode === "category_values" && (
          <CategoryValuesPanel contract={contract} bindings={bindings} onBindingsChange={onBindingsChange} />
        )}
        {bindings.mode === "paired" && contract.mode === "paired" && (
          <PairedPanel contract={contract} bindings={bindings} onBindingsChange={onBindingsChange} />
        )}

        {/* Recharts preview will mount here; abort early when bindings lack enough series for a meaningful chart. */}
        <Box
          sx={{
            mt: 2,
            width: 300,
            height: 200,
            mx: "auto",
            borderRadius: 1,
            border: `1px dashed ${tokens.colorBorder}`,
            bgcolor: tokens.colorSurface,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary" align="center">
            Chart preview (coming soon)
          </Typography>
        </Box>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Button variant="contained" size="medium" startIcon={<SaveIcon />} onClick={onSave} sx={{ fontWeight: 600 }}>
            Save chart
          </Button>
        </Box>

        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${tokens.colorBorder}`,
            bgcolor: tokens.colorSurface,
            borderRadius: 1,
            px: 1.5,
            py: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 600 }}>
            Active logic summary
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            Binding mode:{" "}
            <Box component="span" sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem" }}>
              {bindings.mode === "indexed_layers"
                ? "INDEX_ALIGNED_LAYERS"
                : bindings.mode === "category_values"
                  ? "CATEGORY_PLUS_SERIES"
                  : "CATEGORY_VALUE_PAIRED"}
            </Box>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function IndexedLayersPanel({
  contract,
  bindings,
  onBindingsChange,
}: {
  contract: ReturnType<typeof getChartContract>;
  bindings: Extract<ChartBindingsState, { mode: "indexed_layers" }>;
  onBindingsChange: (next: ChartBindingsState) => void;
}) {
  const slots = contract.slots;
  const n = slots.length;
  const gridColsMd = `88px repeat(${n}, minmax(0, 1fr)) minmax(40px, auto)`;

  const setLayerCell = (layerIndex: number, slotId: string, name: string | null) => {
    const next = bindings.layers.map((row, i) =>
      i === layerIndex ? { ...row, [slotId]: name } : row,
    );
    onBindingsChange({ mode: "indexed_layers", layers: next });
  };

  const addLayer = () => {
    if (bindings.layers.length >= MAX_PLOT_GROUPS) return;
    const empty: IndexedLayerRow = {};
    for (const s of slots) empty[s.id] = null;
    onBindingsChange({ mode: "indexed_layers", layers: [...bindings.layers, empty] });
  };

  const removeLayer = (layerIndex: number) => {
    if (bindings.layers.length <= 1) return;
    onBindingsChange({
      mode: "indexed_layers",
      layers: bindings.layers.filter((_, i) => i !== layerIndex),
    });
  };

  const atCap = bindings.layers.length >= MAX_PLOT_GROUPS;

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
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Tooltip title={atCap ? `At most ${MAX_PLOT_GROUPS} plot groups` : "Add another plot group"}>
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            sx={{ mt: 1, fontWeight: 600 }}
            onClick={addLayer}
            disabled={atCap}
          >
            Add Plot Group
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
}

function CategoryValuesPanel({
  contract,
  bindings,
  onBindingsChange,
}: {
  contract: ReturnType<typeof getChartContract>;
  bindings: Extract<ChartBindingsState, { mode: "category_values" }>;
  onBindingsChange: (next: ChartBindingsState) => void;
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
}: {
  contract: ReturnType<typeof getChartContract>;
  bindings: Extract<ChartBindingsState, { mode: "paired" }>;
  onBindingsChange: (next: ChartBindingsState) => void;
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
}) {
  const border = layerBorderColor(layerIndex);
  const tint = layerSurfaceTint(layerIndex);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const name = readSeriesNameFromDataTransfer(e.dataTransfer);
    if (name) onDropName(name);
  };

  return (
    <Box
      onDragOver={preventDragDefaults}
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
