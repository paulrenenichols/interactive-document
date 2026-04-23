import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import {
  chartKindSupportsIndexedSecondaryAxes,
  normalizeIndexedAxesConfig,
  setIndexedSecondaryAxes,
  setLayerAxisAssignmentAt,
} from "../../chart/indexedAxesBindings";
import { layerBorderColor } from "../../chart/layerAccents";
import { tokens } from "../../theme/tokens";
import type { ChartBindingsState, LayerAxisScale } from "../../types/chartBindings";
import type { ChartCreationKind } from "../../types/dataModel";

export interface IndexedCartesianAxesControlsProps {
  chartKind: ChartCreationKind;
  bindings: Extract<ChartBindingsState, { mode: "indexed_layers" }>;
  onBindingsChange: (next: ChartBindingsState) => void;
  /** Smaller padding for the design modal sidebar. */
  compact?: boolean;
  /**
   * When true, omits the "Cartesian axes" heading (e.g. drawer provides its own header)
   * and uses a flatter surface so the parent supplies chrome.
   */
  suppressTitle?: boolean;
}

export function IndexedCartesianAxesControls({
  chartKind,
  bindings,
  onBindingsChange,
  compact = false,
  suppressTitle = false,
}: IndexedCartesianAxesControlsProps) {
  if (!chartKindSupportsIndexedSecondaryAxes(chartKind)) {
    return null;
  }

  const axes = normalizeIndexedAxesConfig(bindings.layers.length, bindings.indexedAxes);

  const onScaleChange =
    (layerIndex: number, key: "x" | "y") => (e: SelectChangeEvent<LayerAxisScale>) => {
      const v = e.target.value as LayerAxisScale;
      onBindingsChange(setLayerAxisAssignmentAt(bindings, layerIndex, { [key]: v }));
    };

  return (
    <Box
      sx={{
        mb: suppressTitle ? 0 : compact ? 1 : 2,
        p: suppressTitle ? 0 : compact ? 1 : 1.5,
        border: suppressTitle ? "none" : `1px solid ${tokens.colorBorder}`,
        borderRadius: suppressTitle ? 0 : 1,
        bgcolor: suppressTitle ? "transparent" : compact ? "rgba(255,255,255,0.95)" : "rgba(250,250,252,0.95)",
      }}
    >
      {!suppressTitle && (
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Cartesian axes
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.25, lineHeight: 1.45 }}>
        Optional secondary X/Y scales (scatter, bubble, line 2D). Assign each plot group to primary or secondary
        axes when enabled.
      </Typography>
      <FormGroup row sx={{ gap: 2, flexWrap: "wrap", mb: 1.5 }}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={axes.secondaryX}
              onChange={(_, c) => onBindingsChange(setIndexedSecondaryAxes(bindings, { secondaryX: c }))}
            />
          }
          label="Secondary X"
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={axes.secondaryY}
              onChange={(_, c) => onBindingsChange(setIndexedSecondaryAxes(bindings, { secondaryY: c }))}
            />
          }
          label="Secondary Y"
        />
      </FormGroup>

      {bindings.layers.map((_, layerIndex) => {
        const a = axes.layerAssignments[layerIndex];
        return (
          <Box
            key={layerIndex}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              alignItems: "center",
              mb: 1,
              pl: 0.5,
              borderLeft: `3px solid ${layerBorderColor(layerIndex)}`,
            }}
          >
            <Typography variant="caption" fontWeight={700} sx={{ minWidth: 72 }}>
              Group {layerIndex + 1}
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id={`axis-x-${layerIndex}`}>X scale</InputLabel>
              <Select<LayerAxisScale>
                labelId={`axis-x-${layerIndex}`}
                label="X scale"
                value={a.x}
                disabled={!axes.secondaryX}
                onChange={onScaleChange(layerIndex, "x")}
              >
                <MenuItem value="primary">Primary</MenuItem>
                <MenuItem value="secondary">Secondary</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id={`axis-y-${layerIndex}`}>Y scale</InputLabel>
              <Select<LayerAxisScale>
                labelId={`axis-y-${layerIndex}`}
                label="Y scale"
                value={a.y}
                disabled={!axes.secondaryY}
                onChange={onScaleChange(layerIndex, "y")}
              >
                <MenuItem value="primary">Primary</MenuItem>
                <MenuItem value="secondary">Secondary</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      })}
    </Box>
  );
}
