import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import BeenhereIcon from "@mui/icons-material/Beenhere";
import BuildIcon from "@mui/icons-material/Build";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import TableChartIcon from "@mui/icons-material/TableChart";
import { tokens } from "../../theme/tokens";
import { buildSeedValuesForSeries } from "../../fixtures/seriesGridSeedValues";
import { readSeriesNameFromDataTransfer } from "../../types/chartBindings";
import type { DataSeriesAssetRow, OriginKind } from "../../types/dataModel";
import {
  cellValueAt,
  createColumnStateFromCatalog,
  isDraftDirty,
  isSeriesDisplayNameValid,
  isValuesDirty,
  maxRowCount,
  showManualCellPlaceholder,
  type SeriesGridColumnState,
} from "../../types/seriesGridEditor";

function preventDragDefaults(e: React.DragEvent) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
}

function originDisplayLabel(origin: OriginKind): "Manual" | "Formula" | "Imported" | string {
  if (origin === "manual") return "Manual";
  if (origin === "formula") return "Formula";
  if (origin === "imported") return "Imported";
  return String(origin);
}

/** Series name field width cap; column is wider to fit icons + origin label. */
const SERIES_NAME_INPUT_MAX_WIDTH_PX = 175;
/** Fixed width for each data series column (cells + header chrome). */
const SERIES_GRID_COLUMN_WIDTH_PX = 255;
/** Minimum width for the trailing drag-drop affordance column. */
const DROP_ZONE_COLUMN_MIN_WIDTH_PX = 152;

export interface SeriesGridEditorProps {
  availableSeries: DataSeriesAssetRow[];
  /** Called after user saves; update snapshot when resolved. */
  onSaveColumn?: (args: {
    instanceId: string;
    catalogSeriesName: string;
    name: string;
    values: string[];
  }) => void | Promise<void>;
  onCloseColumn?: (args: { instanceId: string; catalogSeriesName: string }) => void;
  /** Formula series only — semantic editor TBD. */
  onFormulaEditorOpen?: (instanceId: string) => void;
  /** Scroll viewport height for row-heavy series. */
  gridMaxHeight?: number;
  /**
   * When `nonce` changes, adds that catalog series as a column if not already open.
   * Parent should clear `catalogName` after `onExternalSeriesBootstrapConsumed`.
   */
  externalSeriesBootstrap?: { catalogName: string; nonce: number } | null;
  onExternalSeriesBootstrapConsumed?: () => void;
  /** Fired when the last column is removed or the grid is cleared (e.g. header close). */
  onGridEmptied?: () => void;
}

export function SeriesGridEditor({
  availableSeries,
  onSaveColumn,
  onCloseColumn,
  onFormulaEditorOpen,
  gridMaxHeight = 440,
  externalSeriesBootstrap,
  onExternalSeriesBootstrapConsumed,
  onGridEmptied,
}: SeriesGridEditorProps) {
  const [columns, setColumns] = useState<SeriesGridColumnState[]>([]);
  const [pendingCloseId, setPendingCloseId] = useState<string | null>(null);
  const [pendingCloseAllOpen, setPendingCloseAllOpen] = useState(false);
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const catalogByName = useMemo(() => {
    const m = new Map<string, DataSeriesAssetRow>();
    for (const r of availableSeries) {
      m.set(r.name, r);
    }
    return m;
  }, [availableSeries]);

  const rowCount = useMemo(() => Math.max(maxRowCount(columns), 1), [columns]);

  const pendingCloseCol = useMemo(
    () => (pendingCloseId ? columns.find((c) => c.instanceId === pendingCloseId) : undefined),
    [columns, pendingCloseId],
  );

  const addColumnFromCatalogName = useCallback(
    (name: string) => {
      const row = catalogByName.get(name);
      if (!row) return;
      setColumns((prev) => {
        if (prev.some((c) => c.catalogSeriesName === name)) return prev;
        const seed = buildSeedValuesForSeries(row);
        return [...prev, createColumnStateFromCatalog(row, seed)];
      });
    },
    [catalogByName],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const name = readSeriesNameFromDataTransfer(e.dataTransfer);
      if (!name) return;
      addColumnFromCatalogName(name);
    },
    [addColumnFromCatalogName],
  );

  useEffect(() => {
    if (!externalSeriesBootstrap) return;
    const { catalogName, nonce } = externalSeriesBootstrap;
    if (!catalogName || nonce === undefined) return;
    addColumnFromCatalogName(catalogName);
    onExternalSeriesBootstrapConsumed?.();
  }, [externalSeriesBootstrap, addColumnFromCatalogName, onExternalSeriesBootstrapConsumed]);

  const updateDraftName = useCallback((instanceId: string, draftName: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.instanceId === instanceId ? { ...c, draftName } : c)),
    );
  }, []);

  const updateCell = useCallback((instanceId: string, rowIndex: number, value: string) => {
    setColumns((prev) =>
      prev.map((c) => {
        if (c.instanceId !== instanceId) return c;
        if (c.origin_kind !== "manual") return c;
        const next = c.draftValues.slice();
        while (next.length <= rowIndex) next.push("");
        next[rowIndex] = value;
        return { ...c, draftValues: next };
      }),
    );
  }, []);

  const commitSaveSnapshot = useCallback((instanceId: string) => {
    setColumns((prev) =>
      prev.map((c) => {
        if (c.instanceId !== instanceId) return c;
        return {
          ...c,
          savedSnapshot: { name: c.draftName, values: c.draftValues.slice() },
        };
      }),
    );
  }, []);

  const saveColumn = useCallback(
    async (instanceId: string, committedDraftName?: string) => {
      let snapshot: { col: SeriesGridColumnState; all: SeriesGridColumnState[] } | undefined;
      flushSync(() => {
        setColumns((prev) => {
          const next =
            committedDraftName !== undefined
              ? prev.map((c) =>
                  c.instanceId === instanceId ? { ...c, draftName: committedDraftName } : c,
                )
              : prev;
          const col = next.find((c) => c.instanceId === instanceId);
          if (col) {
            snapshot = { col, all: next };
          }
          return next;
        });
      });
      if (!snapshot) return;
      const name = snapshot.col.draftName.trim();
      if (!name) {
        window.alert("Enter a name for this data series before saving.");
        return;
      }
      if (
        !isSeriesDisplayNameValid(
          name,
          snapshot.col.catalogSeriesName,
          availableSeries,
          snapshot.all,
          instanceId,
        )
      ) {
        window.alert(
          "That name is already used by another data series. Enter a unique name before saving.",
        );
        return;
      }
      await onSaveColumn?.({
        instanceId,
        catalogSeriesName: snapshot.col.catalogSeriesName,
        name,
        values: snapshot.col.draftValues.slice(),
      });
      commitSaveSnapshot(instanceId);
    },
    [availableSeries, commitSaveSnapshot, onSaveColumn],
  );

  const removeColumn = useCallback(
    (instanceId: string) => {
      let removed: SeriesGridColumnState | undefined;
      let becameEmpty = false;
      setColumns((prev) => {
        removed = prev.find((c) => c.instanceId === instanceId);
        const next = prev.filter((c) => c.instanceId !== instanceId);
        becameEmpty = next.length === 0 && prev.length > 0;
        return next;
      });
      if (removed) {
        onCloseColumn?.({ instanceId, catalogSeriesName: removed.catalogSeriesName });
        if (becameEmpty) {
          onGridEmptied?.();
        }
      }
    },
    [onCloseColumn, onGridEmptied],
  );

  const clearAllColumns = useCallback(() => {
    const toRemove = columnsRef.current.slice();
    if (toRemove.length === 0) return;
    setColumns([]);
    for (const c of toRemove) {
      onCloseColumn?.({ instanceId: c.instanceId, catalogSeriesName: c.catalogSeriesName });
    }
    onGridEmptied?.();
  }, [onCloseColumn, onGridEmptied]);

  const requestClose = useCallback((instanceId: string) => {
    const col = columnsRef.current.find((c) => c.instanceId === instanceId);
    if (!col) return;
    if (isDraftDirty(col)) {
      setPendingCloseId(instanceId);
    } else {
      removeColumn(instanceId);
    }
  }, [removeColumn]);

  const closeDialog = useCallback(() => setPendingCloseId(null), []);

  const dialogSaveAndClose = useCallback(async () => {
    if (!pendingCloseId) return;
    await saveColumn(pendingCloseId);
    removeColumn(pendingCloseId);
    setPendingCloseId(null);
  }, [pendingCloseId, removeColumn, saveColumn]);

  const dialogDiscardAndClose = useCallback(() => {
    if (!pendingCloseId) return;
    removeColumn(pendingCloseId);
    setPendingCloseId(null);
  }, [pendingCloseId, removeColumn]);

  const closeCloseAllDialog = useCallback(() => setPendingCloseAllOpen(false), []);

  const requestCloseAll = useCallback(() => {
    const cols = columnsRef.current;
    if (cols.length === 0) return;
    const dirty = cols.filter(isDraftDirty);
    if (dirty.length === 0) {
      clearAllColumns();
    } else {
      setPendingCloseAllOpen(true);
    }
  }, [clearAllColumns]);

  const dialogSaveAllAndUnload = useCallback(async () => {
    const dirty = columnsRef.current.filter(isDraftDirty);
    for (const col of dirty) {
      await saveColumn(col.instanceId);
    }
    if (columnsRef.current.some(isDraftDirty)) return;
    clearAllColumns();
    setPendingCloseAllOpen(false);
  }, [clearAllColumns, saveColumn]);

  const dirtyColumnsForCloseAll = useMemo(() => {
    if (!pendingCloseAllOpen) return [];
    return columns.filter(isDraftDirty);
  }, [columns, pendingCloseAllOpen]);

  const isDraggingOver = useCallback((e: React.DragEvent) => {
    preventDragDefaults(e);
  }, []);

  return (
    <>
      <Paper
        variant="outlined"
        onDragOver={isDraggingOver}
        onDrop={handleDrop}
        sx={{
          width: "100%",
          minHeight: 280,
          borderColor: tokens.colorBorder,
          bgcolor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            bgcolor: tokens.colorChrome,
            color: "rgba(255,255,255,0.95)",
            px: 2,
            py: 1.5,
            position: "relative",
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
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={700} component="h2">
                GRID EDITOR
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85, display: "block", mt: 0.5 }}>
                Drag series from the ledger into this pane to compare and edit index-aligned values side by side.
              </Typography>
            </Box>
            {columns.length > 0 && (
              <Tooltip title="Close editor and unload all series">
                <IconButton
                  size="small"
                  aria-label="Close editor and unload all series"
                  onClick={requestCloseAll}
                  sx={{
                    color: "rgba(255,255,255,0.92)",
                    mt: -0.5,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ flex: 1, p: 2, bgcolor: tokens.colorSurface, minHeight: 200 }}>
          {columns.length === 0 ? (
            <Box
              sx={{
                border: `1px dashed ${tokens.colorBorder}`,
                borderRadius: 1,
                py: 6,
                px: 2,
                textAlign: "center",
                bgcolor: "rgba(255,255,255,0.7)",
              }}
            >
              <TableChartIcon sx={{ fontSize: 40, color: tokens.colorSecondary, opacity: 0.5, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Drop one or more data series here to open columns in the grid.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                maxHeight: gridMaxHeight,
                overflow: "auto",
                border: `1px solid ${tokens.colorBorder}`,
                borderRadius: 1,
                bgcolor: "#ffffff",
              }}
            >
              <Box
                component="table"
                sx={{
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  width: "100%",
                  minWidth: 48 + columns.length * SERIES_GRID_COLUMN_WIDTH_PX + DROP_ZONE_COLUMN_MIN_WIDTH_PX,
                  tableLayout: "fixed",
                }}
              >
                <colgroup>
                  <col style={{ width: 48 }} />
                  {columns.map((col) => (
                    <col key={col.instanceId} style={{ width: SERIES_GRID_COLUMN_WIDTH_PX }} />
                  ))}
                  <col style={{ minWidth: DROP_ZONE_COLUMN_MIN_WIDTH_PX, width: "auto" }} />
                </colgroup>
                <Box component="thead">
                  <Box component="tr">
                    <Box
                      component="th"
                      sx={{
                        position: "sticky",
                        top: 0,
                        left: 0,
                        zIndex: 5,
                        width: 48,
                        minWidth: 48,
                        bgcolor: tokens.colorSurface,
                        borderRight: `1px solid ${tokens.colorBorder}`,
                        borderBottom: `1px solid ${tokens.colorBorder}`,
                        py: 1,
                        px: 0.5,
                        textAlign: "right",
                        verticalAlign: "bottom",
                      }}
                    />
                    {columns.map((col) => (
                      <SeriesColumnHeader
                        key={col.instanceId}
                        col={col}
                        onNameCommit={updateDraftName}
                        onRequestClose={() => requestClose(col.instanceId)}
                        onCommitSave={(id, draftName) => void saveColumn(id, draftName)}
                        onFormula={() => onFormulaEditorOpen?.(col.instanceId)}
                      />
                    ))}
                    <DropZoneColumnHeader />
                  </Box>
                </Box>
                <Box component="tbody">
                  {Array.from({ length: rowCount }, (_, rowIndex) => (
                    <Box component="tr" key={rowIndex}>
                      <Box
                        component="td"
                        sx={{
                          position: "sticky",
                          left: 0,
                          zIndex: 2,
                          bgcolor: tokens.colorSurface,
                          borderRight: `1px solid ${tokens.colorBorder}`,
                          borderBottom: `1px solid ${tokens.colorBorder}`,
                          py: 0.5,
                          px: 0.75,
                          textAlign: "right",
                          verticalAlign: "middle",
                          fontSize: "0.75rem",
                          color: "text.secondary",
                          fontFeatureSettings: '"tnum" 1',
                        }}
                      >
                        {rowIndex + 1}
                      </Box>
                      {columns.map((col) => (
                        <SeriesCell
                          key={`${col.instanceId}-${rowIndex}`}
                          instanceId={col.instanceId}
                          rowIndex={rowIndex}
                          value={cellValueAt(col, rowIndex)}
                          isManual={col.origin_kind === "manual"}
                          updateCell={updateCell}
                        />
                      ))}
                      <DropZoneBodyCell rowIndex={rowIndex} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog open={pendingCloseId != null} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>Unsaved changes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {pendingCloseCol
              ? `Save changes to “${pendingCloseCol.draftName}” before closing?`
              : "Save changes before closing?"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button color="inherit" onClick={dialogDiscardAndClose}>
            Don&apos;t save
          </Button>
          <Button variant="contained" onClick={() => void dialogSaveAndClose()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={pendingCloseAllOpen} onClose={closeCloseAllDialog} fullWidth maxWidth="sm">
        <DialogTitle>Unsaved changes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            You are about to close the editor with unsaved changes to data series. Do you wish to save them all or
            cancel?
          </Typography>
          {dirtyColumnsForCloseAll.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Unsaved series
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {dirtyColumnsForCloseAll.map((c) => (
                  <Typography key={c.instanceId} component="li" variant="body2" sx={{ mb: 0.5 }}>
                    {c.draftName.trim() || c.catalogSeriesName}
                  </Typography>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeCloseAllDialog}>Cancel</Button>
          <Button variant="contained" onClick={() => void dialogSaveAllAndUnload()}>
            Save all
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function DropZoneColumnHeader() {
  return (
    <Box
      component="th"
      scope="col"
      aria-label="Drop data series here"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 2,
        bgcolor: tokens.colorSurface,
        borderBottom: `1px solid ${tokens.colorBorder}`,
        borderLeft: `1px dashed ${tokens.colorBorder}`,
        py: 1,
        px: 1,
        verticalAlign: "middle",
        minWidth: DROP_ZONE_COLUMN_MIN_WIDTH_PX,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.75,
          textAlign: "center",
          maxWidth: 200,
          mx: "auto",
        }}
      >
        <TableChartIcon
          sx={{ fontSize: 30, color: tokens.colorSecondary, opacity: 0.65 }}
          aria-hidden
        />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", lineHeight: 1.35 }}>
          Drag a series from the ledger and drop here to add a column
        </Typography>
      </Box>
    </Box>
  );
}

function DropZoneBodyCell({ rowIndex }: { rowIndex: number }) {
  return (
    <Box
      component="td"
      aria-hidden
      sx={{
        borderBottom: `1px solid ${tokens.colorBorder}`,
        borderLeft: `1px dashed ${tokens.colorBorder}`,
        verticalAlign: "middle",
        minWidth: DROP_ZONE_COLUMN_MIN_WIDTH_PX,
        width: "100%",
        bgcolor:
          rowIndex % 2 === 0 ? "rgba(244, 245, 247, 0.95)" : "rgba(236, 239, 245, 0.85)",
        backgroundImage: `repeating-linear-gradient(
          -12deg,
          transparent,
          transparent 6px,
          rgba(63, 96, 128, 0.04) 6px,
          rgba(63, 96, 128, 0.04) 7px
        )`,
      }}
    />
  );
}

function SeriesColumnHeader({
  col,
  onNameCommit,
  onRequestClose,
  onCommitSave,
  onFormula,
}: {
  col: SeriesGridColumnState;
  onNameCommit: (id: string, name: string) => void;
  onRequestClose: () => void;
  onCommitSave: (instanceId: string, draftName: string) => void;
  onFormula: () => void;
}) {
  const [localName, setLocalName] = useState(col.draftName);

  useEffect(() => {
    setLocalName(col.draftName);
  }, [col.instanceId, col.savedSnapshot.name]);

  const nameDirty = localName.trim() !== col.savedSnapshot.name;
  const dirty = nameDirty || isValuesDirty(col);
  const showFormula = col.origin_kind === "formula";

  const handleSave = () => {
    void onCommitSave(col.instanceId, localName);
  };

  const handleClose = () => {
    if (localName !== col.draftName) {
      flushSync(() => {
        onNameCommit(col.instanceId, localName);
      });
    }
    onRequestClose();
  };

  const iconBtnSx = {
    color: "rgba(255,255,255,0.9)",
    mt: -0.25,
    p: 0.5,
    minWidth: 30,
  } as const;

  return (
    <Box
      component="th"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 3,
        bgcolor: tokens.colorChrome,
        borderBottom: `1px solid ${tokens.colorBorder}`,
        borderLeft: `1px solid rgba(255,255,255,0.12)`,
        py: 1,
        pl: 1,
        pr: 0.5,
        verticalAlign: "top",
        width: SERIES_GRID_COLUMN_WIDTH_PX,
        minWidth: SERIES_GRID_COLUMN_WIDTH_PX,
        maxWidth: SERIES_GRID_COLUMN_WIDTH_PX,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "flex-start",
            gap: 0.25,
            width: "100%",
            minWidth: 0,
          }}
        >
          <TextField
            size="small"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="Series name"
            sx={{
              flex: "0 0 auto",
              maxWidth: SERIES_NAME_INPUT_MAX_WIDTH_PX,
              width: SERIES_NAME_INPUT_MAX_WIDTH_PX,
              "& .MuiInputBase-root": {
                bgcolor: "rgba(255,255,255,0.96)",
                fontSize: "0.8rem",
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              alignItems: "center",
              gap: 0.125,
              flexShrink: 0,
              ml: "auto",
            }}
          >
            <Tooltip title="Save this data series">
              <span>
                <IconButton
                  size="small"
                  aria-label="Save this data series"
                  disabled={!dirty}
                  onClick={handleSave}
                  sx={{
                    ...iconBtnSx,
                    "&.Mui-disabled": { color: "rgba(255,255,255,0.35)" },
                  }}
                >
                  <BeenhereIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Discard edits">
              <IconButton size="small" aria-label="Discard edits" onClick={handleClose} sx={iconBtnSx}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 0.375,
            mt: 0.75,
            width: "100%",
            minWidth: 0,
          }}
        >
          <Typography
            variant="caption"
            component="div"
            sx={{
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: 0.02,
              color: tokens.colorPrimary,
              textAlign: "left",
              flexShrink: 0,
            }}
          >
            {originDisplayLabel(col.origin_kind)}
          </Typography>
          {showFormula && (
            <Tooltip title="Open formula editor">
              <IconButton
                size="small"
                aria-label="Open formula editor"
                onClick={onFormula}
                sx={{
                  p: 0.125,
                  minWidth: 0,
                  mt: 0,
                  flexShrink: 0,
                  color: tokens.colorPrimary,
                  "&:hover": {
                    bgcolor: "rgba(232, 71, 42, 0.14)",
                  },
                }}
              >
                <BuildIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const SeriesCell = memo(function SeriesCell({
  instanceId,
  rowIndex,
  value,
  isManual,
  updateCell,
}: {
  instanceId: string;
  rowIndex: number;
  value: string;
  isManual: boolean;
  updateCell: (instanceId: string, rowIndex: number, value: string) => void;
}) {
  if (isManual) {
    const showPh = showManualCellPlaceholder(value);
    return (
      <Box
        component="td"
        sx={{
          borderBottom: `1px solid ${tokens.colorBorder}`,
          borderLeft: `1px solid ${tokens.colorBorder}`,
          py: 0.25,
          px: 0.5,
          verticalAlign: "middle",
          width: SERIES_GRID_COLUMN_WIDTH_PX,
          minWidth: SERIES_GRID_COLUMN_WIDTH_PX,
          maxWidth: SERIES_GRID_COLUMN_WIDTH_PX,
          bgcolor: rowIndex % 2 === 0 ? "#ffffff" : tokens.colorSurface,
        }}
      >
        <InputBase
          fullWidth
          value={value}
          onChange={(e) => updateCell(instanceId, rowIndex, e.target.value)}
          placeholder={showPh ? "Enter value..." : undefined}
          sx={{
            fontSize: "0.8rem",
            fontFeatureSettings: '"tnum" 1',
            "& .MuiInputBase-input": { py: 0.5 },
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      component="td"
      sx={{
        borderBottom: `1px solid ${tokens.colorBorder}`,
        borderLeft: `1px solid ${tokens.colorBorder}`,
        py: 0.5,
        px: 0.75,
        verticalAlign: "middle",
        width: SERIES_GRID_COLUMN_WIDTH_PX,
        minWidth: SERIES_GRID_COLUMN_WIDTH_PX,
        maxWidth: SERIES_GRID_COLUMN_WIDTH_PX,
        bgcolor: rowIndex % 2 === 0 ? "#ffffff" : tokens.colorSurface,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minHeight: 32 }}>
        <LockIcon sx={{ fontSize: 16, color: "text.disabled", flexShrink: 0 }} aria-hidden />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.8rem", fontFeatureSettings: '"tnum" 1', wordBreak: "break-word" }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
});
