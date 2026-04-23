import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import LockIcon from "@mui/icons-material/Lock";
import type { DataSeriesAssetRow, IndexSortOrder } from "../../types/dataModel";
import { orderedUniqueLabelsForIndex } from "../../data/materializeUniqueIndex";
import {
  CHART_BINDING_SLOT_PULSE_ANIMATION_INTRO,
  CHART_BINDING_SLOT_PULSE_INTRO_MS,
  chartBindingSlotPulseKeyframes,
} from "../../theme/chartBindingSlotPulse";
import { tokens } from "../../theme/tokens";
import { filterAndSortSeries } from "../../utils/seriesMentionAutocomplete";

/** Autocomplete width — intentionally narrower than the panel (see ChartSeriesBindingPanel body rhythm). */
const SOURCE_AUTOCOMPLETE_MAX_WIDTH_PX = 320;

/** Minimum height for the three-column index panel row (md+). */
const INDEX_PANEL_THREE_COL_MIN_HEIGHT_PX = 275;

/**
 * Max data rows rendered in the index preview column (1-based row labels).
 * Export for callers/tests that need to stay in sync with the preview.
 */
export const INDEX_PREVIEW_ROW_CAP = 6;

/**
 * Row index column width in the preview mini-table — matches {@link SeriesGridEditor} row-number column (48px; under 50px cap).
 */
const PREVIEW_ROW_INDEX_WIDTH_PX = 48;
/** Minimum width hint for the value column when laying out the fixed table. */
const PREVIEW_VALUE_COL_WIDTH_PX = 128;

export type { IndexSortOrder };

/** Match unique grain used when materializing index series from a source column. */
export function uniqueNonEmptyTrimmedCount(values: string[]): number {
  return new Set(values.map((s) => s.trim()).filter((s) => s !== "")).size;
}

/** Unique labels in the same order as materialized index values (see `materializeUniqueIndexFromSourceValues`). */
export function orderedUniqueSourceLabels(
  values: string[],
  sortOrder: IndexSortOrder,
  customOrderText?: string,
): string[] {
  return orderedUniqueLabelsForIndex(values, sortOrder, customOrderText);
}

export interface SeriesIndexPropertiesProps {
  /** Shown in the header (current series display name). */
  seriesDisplayName: string;
  /** User edited the series name field — parent should update draft name and lock auto-naming. */
  onUserSeriesDisplayNameChange: (name: string) => void;
  /**
   * Fired after the user picks a source series (non-null). Parent may auto-fill `idx.*` when name is still a placeholder.
   */
  onIndexSourceSeriesPicked?: (parentCatalogName: string) => void;
  /** Row count for the index series column. */
  valueLength: number;
  availableSeries: DataSeriesAssetRow[];
  /** Catalog name of the index series being edited (excluded from source picks). */
  currentCatalogName: string;
  /** Resolved cell values for stats; must match catalog + project data. */
  getValuesForSeries: (catalogName: string) => string[];
  sourceSeriesName: string | null;
  onSourceSeriesNameChange: (name: string | null) => void;
  sortOrder: IndexSortOrder;
  onSortOrderChange: (order: IndexSortOrder) => void;
  customOrderText: string;
  onCustomOrderTextChange: (text: string) => void;
  numericFormat: string;
  onNumericFormatChange: (format: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Slide-up panel for authoring index series: source series, sort order, numeric format.
 * Dark chrome header and light body align with {@link ChartSeriesBindingPanel}.
 */
export function SeriesIndexProperties({
  seriesDisplayName,
  onUserSeriesDisplayNameChange,
  onIndexSourceSeriesPicked,
  valueLength,
  availableSeries,
  currentCatalogName,
  getValuesForSeries,
  sourceSeriesName,
  onSourceSeriesNameChange,
  sortOrder,
  onSortOrderChange,
  customOrderText,
  onCustomOrderTextChange,
  numericFormat,
  onNumericFormatChange,
  onSave,
  onCancel,
}: SeriesIndexPropertiesProps) {
  const [inputValue, setInputValue] = useState("");
  const sourceSeriesInputRef = useRef<HTMLInputElement | null>(null);
  const [sourceSeriesIntroPulse, setSourceSeriesIntroPulse] = useState(true);
  const [sourceAutocompleteOpen, setSourceAutocompleteOpen] = useState(false);
  const [highlightedSourceOption, setHighlightedSourceOption] = useState<DataSeriesAssetRow | null>(null);

  const eligibleSeries = useMemo(
    () =>
      availableSeries.filter(
        (r) => r.name !== currentCatalogName && r.role_kind !== "index",
      ),
    [availableSeries, currentCatalogName],
  );

  const selectedRow = useMemo(
    () => (sourceSeriesName ? eligibleSeries.find((r) => r.name === sourceSeriesName) ?? null : null),
    [eligibleSeries, sourceSeriesName],
  );

  const filteredSourceSeries = useMemo(
    () => filterAndSortSeries(eligibleSeries, inputValue),
    [eligibleSeries, inputValue],
  );

  const commitSourceSeriesOption = useCallback(
    (option: DataSeriesAssetRow) => {
      onSourceSeriesNameChange(option.name);
      onIndexSourceSeriesPicked?.(option.name);
      setInputValue(option.name);
      setSourceAutocompleteOpen(false);
      setHighlightedSourceOption(null);
    },
    [onIndexSourceSeriesPicked, onSourceSeriesNameChange],
  );

  useEffect(() => {
    setInputValue(selectedRow?.name ?? "");
  }, [selectedRow?.name]);

  useEffect(() => {
    const focusId = window.requestAnimationFrame(() => {
      sourceSeriesInputRef.current?.focus();
    });
    const pulseId = window.setTimeout(() => {
      setSourceSeriesIntroPulse(false);
    }, CHART_BINDING_SLOT_PULSE_INTRO_MS);
    return () => {
      cancelAnimationFrame(focusId);
      clearTimeout(pulseId);
    };
  }, []);

  const sourceValues = useMemo(() => {
    if (!sourceSeriesName) return [];
    return getValuesForSeries(sourceSeriesName);
  }, [getValuesForSeries, sourceSeriesName]);

  const lengthStat = sourceValues.length;
  const uniqueStat = useMemo(() => uniqueNonEmptyTrimmedCount(sourceValues), [sourceValues]);

  const previewRows = useMemo(
    () =>
      orderedUniqueSourceLabels(sourceValues, sortOrder, customOrderText).slice(0, INDEX_PREVIEW_ROW_CAP),
    [sourceValues, sortOrder, customOrderText],
  );

  return (
    <Paper
      variant="outlined"
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: 0,
        borderTop: "none",
        overflow: "hidden",
        borderColor: tokens.colorBorder,
        bgcolor: tokens.colorSurface,
        boxShadow: "0 -8px 28px rgba(13, 21, 38, 0.12)",
      }}
    >
      <Box
        sx={{
          bgcolor: tokens.colorChrome,
          color: "rgba(255,255,255,0.95)",
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${tokens.colorBorder}`,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={700}
          letterSpacing={0.06}
          sx={{ fontSize: "0.7rem", textTransform: "uppercase", opacity: 0.92 }}
        >
          Index series properties
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            opacity: 0.78,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.7rem",
          }}
        >
          Length={valueLength}
        </Typography>
      </Box>

      <Box
        sx={{
          p: 2,
          bgcolor: tokens.colorPanel,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
          alignItems: "start",
          minHeight: { md: INDEX_PANEL_THREE_COL_MIN_HEIGHT_PX },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            minWidth: 0,
            width: "100%",
          }}
        >
          <Box sx={{ maxWidth: SOURCE_AUTOCOMPLETE_MAX_WIDTH_PX, width: "100%" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.75, fontWeight: 600, letterSpacing: 0.04 }}
            >
              Series name
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={seriesDisplayName}
              onChange={(e) => onUserSeriesDisplayNameChange(e.target.value)}
              placeholder="Name shown in the grid"
              sx={{ "& .MuiInputBase-root": { fontSize: "0.85rem" } }}
            />
          </Box>

          <Box sx={{ maxWidth: SOURCE_AUTOCOMPLETE_MAX_WIDTH_PX, width: "100%" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.75, fontWeight: 600, letterSpacing: 0.04 }}
            >
              Source series
            </Typography>
            <Box
              sx={{
                maxWidth: SOURCE_AUTOCOMPLETE_MAX_WIDTH_PX,
                width: "100%",
                borderRadius: 1,
                position: "relative",
                ...(sourceSeriesIntroPulse
                  ? {
                      ...chartBindingSlotPulseKeyframes,
                      outline: `2px solid ${tokens.colorPrimary}`,
                      outlineOffset: 0,
                      animation: CHART_BINDING_SLOT_PULSE_ANIMATION_INTRO,
                    }
                  : {}),
              }}
            >
              <Autocomplete
                open={sourceAutocompleteOpen}
                onOpen={() => setSourceAutocompleteOpen(true)}
                onClose={() => {
                  setSourceAutocompleteOpen(false);
                  setHighlightedSourceOption(null);
                }}
                onHighlightChange={(_, option) => setHighlightedSourceOption(option)}
                options={eligibleSeries}
                value={selectedRow}
                onChange={(_, v) => {
                  const next = v?.name ?? null;
                  onSourceSeriesNameChange(next);
                  if (next) onIndexSourceSeriesPicked?.(next);
                }}
                inputValue={inputValue}
                onInputChange={(_, v, reason) => {
                  if (reason === "reset" && selectedRow) {
                    setInputValue(selectedRow.name);
                    return;
                  }
                  setInputValue(v);
                }}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(a, b) => a.name === b.name}
                filterOptions={(options, state) => filterAndSortSeries(options, state.inputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputRef={sourceSeriesInputRef}
                    placeholder="Select a series…"
                    size="small"
                    inputProps={{
                      ...params.inputProps,
                      onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
                        params.inputProps.onKeyDown?.(e);
                        if (e.defaultPrevented) return;
                        if (e.key !== "Tab" || e.shiftKey || !sourceAutocompleteOpen) return;
                        const target = highlightedSourceOption ?? filteredSourceSeries[0] ?? null;
                        if (!target) return;
                        e.preventDefault();
                        commitSourceSeriesOption(target);
                      },
                    }}
                    sx={{ "& .MuiInputBase-root": { fontSize: "0.85rem" } }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.name}>
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {option.name}{" "}
                      <Typography component="span" variant="caption" color="text.secondary"
                      sx={{ maxWidth: SOURCE_AUTOCOMPLETE_MAX_WIDTH_PX, width: "100%" }}
                      >

                        


                        (Len: {option.length})
                      </Typography>
                    </Typography>
                  </li>
                )}
              />
            </Box>
            {selectedRow && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 0.75,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.68rem",
                }}
              >
                Length: {lengthStat} | Unique Values: {uniqueStat}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            minWidth: 0,
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: SOURCE_AUTOCOMPLETE_MAX_WIDTH_PX }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.75, fontWeight: 600, letterSpacing: 0.04 }}
            >
              Sort order
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={sortOrder}
              onChange={(_, v: IndexSortOrder | null) => v != null && onSortOrderChange(v)}
              sx={{
                display: "flex",
                "& .MuiToggleButtonGroup-grouped": {
                  flex: 1,
                  borderRadius: "8px !important",
                  border: `1px solid ${tokens.colorBorder} !important`,
                  py: 0.75,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "text.primary",
                  bgcolor: tokens.colorPanel,
                },
                "& .MuiToggleButton-root:hover": {
                  bgcolor: tokens.colorSurface,
                },
                "& .MuiToggleButton-root.Mui-selected": {
                  color: "#fff !important",
                  bgcolor: `${tokens.colorPrimary} !important`,
                  borderColor: `${tokens.colorPrimary} !important`,
                  boxShadow: "0 2px 8px rgba(232, 71, 42, 0.25)",
                  "&:hover": {
                    bgcolor: `${tokens.colorPrimary} !important`,
                  },
                },
              }}
            >
              <ToggleButton value="ascending" aria-label="Ascending">
                Ascending
              </ToggleButton>
              <ToggleButton value="descending" aria-label="Descending">
                Descending
              </ToggleButton>
              <ToggleButton value="custom" aria-label="Custom">
                Custom
              </ToggleButton>
            </ToggleButtonGroup>
            {sortOrder === "custom" && (
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={2}
                placeholder="One label per line or comma-separated (order matches materialized index)"
                value={customOrderText}
                onChange={(e) => onCustomOrderTextChange(e.target.value)}
                sx={{ mt: 1, "& .MuiInputBase-root": { fontSize: "0.8rem" } }}
              />
            )}
          </Box>

          <Box sx={{ width: "100%", maxWidth: SOURCE_AUTOCOMPLETE_MAX_WIDTH_PX }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.75, fontWeight: 600, letterSpacing: 0.04 }}
            >
              Numeric format
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Excel-style (e.g. #,##0.00) or Python format (e.g. ,.2f)"
              value={numericFormat}
              onChange={(e) => onNumericFormatChange(e.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: "0.8rem",
                  fontFamily: '"JetBrains Mono", monospace',
                },
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            minWidth: 0,
          }}
        >
          <Box sx={{ width: "100%", maxWidth: SOURCE_AUTOCOMPLETE_MAX_WIDTH_PX }}>
            <IndexPreviewColumn
              hasSource={Boolean(selectedRow)}
              previewRows={previewRows}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "flex-end",
          gap: 1,
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${tokens.colorBorder}`,
          bgcolor: tokens.colorSurface,
        }}
      >
        <Button
          variant="text"
          onClick={onCancel}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            color: "text.secondary",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={onSave}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.8rem",
            px: 2,
            bgcolor: tokens.colorPrimary,
            "&:hover": { bgcolor: tokens.colorPrimary, filter: "brightness(0.95)" },
          }}
        >
          Save
        </Button>
      </Box>
    </Paper>
  );
}

/** Mini grid preview: base-1 row labels + locked-style value cells (no series header chrome). */
function IndexPreviewColumn({
  hasSource,
  previewRows,
}: {
  hasSource: boolean;
  previewRows: string[];
}) {
  const emptyHint = !hasSource
    ? "Select a source series to preview index values."
    : previewRows.length === 0
      ? "No unique values in the source."
      : null;

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        border: `1px solid ${tokens.colorBorder}`,
        borderRadius: 1,
        overflow: "hidden",
        bgcolor: tokens.colorPanel,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: "block",
          px: 1,
          py: 0.75,
          fontWeight: 700,
          letterSpacing: 0.06,
          fontSize: "0.7rem",
          textTransform: "uppercase",
          bgcolor: tokens.colorSurface,
          borderBottom: `1px solid ${tokens.colorBorder}`,
          color: "text.secondary",
        }}
      >
        Preview
      </Typography>

      {emptyHint != null ? (
        <Typography variant="caption" color="text.secondary" sx={{ p: 1.25, display: "block", lineHeight: 1.45 }}>
          {emptyHint}
        </Typography>
      ) : (
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "fixed",
            minWidth: PREVIEW_ROW_INDEX_WIDTH_PX + PREVIEW_VALUE_COL_WIDTH_PX,
          }}
        >
          <colgroup>
            <col
              style={{
                width: PREVIEW_ROW_INDEX_WIDTH_PX,
                minWidth: PREVIEW_ROW_INDEX_WIDTH_PX,
                maxWidth: PREVIEW_ROW_INDEX_WIDTH_PX,
              }}
            />
            <col />
          </colgroup>
          <Box component="tbody">
            {previewRows.map((cell, i) => (
              <Box component="tr" key={i}>
                <Box
                  component="td"
                  sx={{
                    width: PREVIEW_ROW_INDEX_WIDTH_PX,
                    minWidth: PREVIEW_ROW_INDEX_WIDTH_PX,
                    maxWidth: PREVIEW_ROW_INDEX_WIDTH_PX,
                    boxSizing: "border-box",
                    borderBottom: `1px solid ${tokens.colorBorder}`,
                    borderRight: `1px solid ${tokens.colorBorder}`,
                    py: 0.35,
                    px: 0.5,
                    textAlign: "right",
                    verticalAlign: "middle",
                    fontSize: "0.7rem",
                    color: "text.secondary",
                    fontFeatureSettings: '"tnum" 1',
                    bgcolor: tokens.colorSurface,
                  }}
                >
                  {i + 1}
                </Box>
                <Box
                  component="td"
                  sx={{
                    borderBottom: `1px solid ${tokens.colorBorder}`,
                    py: 0.35,
                    px: 0.5,
                    verticalAlign: "middle",
                    width: "100%",
                    minWidth: 0,
                    bgcolor: i % 2 === 0 ? "#ffffff" : tokens.colorSurface,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minHeight: 26 }}>
                    <LockIcon sx={{ fontSize: 14, color: "text.disabled", flexShrink: 0 }} aria-hidden />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: "0.75rem",
                        fontFeatureSettings: '"tnum" 1',
                        wordBreak: "break-word",
                        lineHeight: 1.35,
                      }}
                    >
                      {cell}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
