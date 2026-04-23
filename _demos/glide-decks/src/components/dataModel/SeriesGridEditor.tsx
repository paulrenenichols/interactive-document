import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BeenhereIcon from "@mui/icons-material/Beenhere";
import BuildIcon from "@mui/icons-material/Build";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockIcon from "@mui/icons-material/Lock";
import TableChartIcon from "@mui/icons-material/TableChart";
import { SHOW_DATASERIES_DEBUG_KEBAB } from "../../config/showDataseriesDebugKebab";
import { tokens } from "../../theme/tokens";
import type { SeriesValueResolver } from "../../data/seriesValueResolver";
import { createFixtureSeriesValueResolver } from "../../data/seriesValueResolver";
import { readSeriesNameFromDataTransfer } from "../../types/chartBindings";
import type { DataSeriesAssetRow, IndexSortOrder, OriginKind } from "../../types/dataModel";
import { materializeUniqueIndexFromSourceValues } from "../../data/materializeUniqueIndex";
import { collectTakenNames, suggestIndexNameFromParent, suggestUniqueFxFnDisplayName } from "../../chart/chartDefaultName";
import { inheritNumericFormatFromFormula } from "../../formula/inheritNumericFormatFromFormula";
import { materializeFormulaColumn } from "../../formula/materializeFormulaColumn";
import { normalizeFormulaSource } from "../../formula/printFormula";
import {
  cellValueAt,
  catalogRenameToApplyAfterSave,
  createColumnStateFromCatalog,
  displayNameSourceToPersisted,
  isDraftDirty,
  isSeriesDisplayNameValid,
  isValuesDirty,
  maxRowCount,
  showManualCellPlaceholder,
  type SeriesGridColumnState,
} from "../../types/seriesGridEditor";
import { SeriesFormulaEditor } from "./SeriesFormulaEditor";
import { SeriesIndexProperties } from "./SeriesIndexProperties";
import {
  buildSeriesMetadataDebugPayload,
  buildSeriesValuesDebugPayload,
} from "./seriesColumnDebugPayloads";

function preventDragDefaults(e: React.DragEvent) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
}

function buildTakenDisplayNames(availableSeries: DataSeriesAssetRow[], columns: SeriesGridColumnState[]): Set<string> {
  const taken = collectTakenNames({
    series: availableSeries,
    dataSources: [],
    charts: [],
  });
  for (const c of columns) {
    const t = c.draftName.trim();
    if (t) taken.add(t);
  }
  return taken;
}

function originDisplayLabel(origin: OriginKind): "Manual" | "Formula" | "Imported" | "Index" | string {
  if (origin === "manual") return "Manual";
  if (origin === "formula") return "Formula";
  if (origin === "imported") return "Imported";
  if (origin === "index") return "Index";
  return String(origin);
}

/** Series name field width cap; column is wider to fit icons + origin label. */
const SERIES_NAME_INPUT_MAX_WIDTH_PX = 175;
/** Max height for series column header cells (chrome bar + name field + actions). */
const SERIES_HEADER_MAX_HEIGHT_PX = 60;
/** Fixed width for each data series column (cells + header chrome). */
const SERIES_GRID_COLUMN_WIDTH_PX = 265;
/** Minimum width for the trailing drag-drop affordance column. */
const DROP_ZONE_COLUMN_MIN_WIDTH_PX = 152;
/** Narrow column for “add data series” (max width; matches series chrome striping). */
const ADD_DATA_SERIES_COLUMN_WIDTH_PX = 50;

const defaultFixtureResolver = createFixtureSeriesValueResolver();

export interface IndexPanelDraft {
  sourceSeriesName: string | null;
  sortOrder: IndexSortOrder;
  customOrderText: string;
  numericFormat: string;
}

function defaultIndexDraft(row: DataSeriesAssetRow | undefined): IndexPanelDraft {
  const src = row?.index_source_series_name?.trim();
  return {
    sourceSeriesName: src ? src : null,
    sortOrder: row?.index_sort_order ?? "ascending",
    customOrderText: row?.index_custom_order_text ?? "",
    numericFormat: row?.numeric_format ?? "",
  };
}

export interface SeriesGridEditorProps {
  availableSeries: DataSeriesAssetRow[];
  /** Cell source: fixture seeds vs project-imported columns. */
  seriesValueResolver?: SeriesValueResolver;
  /** Called after user saves; update snapshot when resolved. */
  onSaveColumn?: (args: {
    instanceId: string;
    catalogSeriesName: string;
    name: string;
    values: string[];
    /** Present for formula-origin series — persisted as `raw_formula` on the asset row. */
    rawFormula?: string;
    index_source_series_name?: string;
    index_sort_order?: IndexSortOrder;
    index_custom_order_text?: string;
    series_display_name_source?: "auto" | "user";
    numeric_format?: string;
  }) => void | Promise<void>;
  onCloseColumn?: (args: { instanceId: string; catalogSeriesName: string }) => void;
  /** Scroll viewport height for row-heavy series. */
  gridMaxHeight?: number;
  /**
   * When false (e.g. grid workspace hidden), any open formula panel closes and does not re-open on its own.
   * @default true
   */
  seriesGridActive?: boolean;
  /**
   * When `nonce` changes, adds that catalog series as a column if not already open.
   * Parent should clear `catalogName` after `onExternalSeriesBootstrapConsumed`.
   */
  externalSeriesBootstrap?: { catalogName: string; nonce: number } | null;
  onExternalSeriesBootstrapConsumed?: () => void;
  /** Fired when the last column is removed or the grid is cleared (e.g. header close). */
  onGridEmptied?: () => void;
  /**
   * After a formula column for this catalog name is mounted, open the formula panel once.
   * Parent should clear via `onAutoOpenFormulaConsumed` (same pattern as `externalSeriesBootstrap`).
   */
  autoOpenFormulaForCatalog?: { catalogName: string; nonce: number } | null;
  onAutoOpenFormulaConsumed?: () => void;
  /**
   * After an index column for this catalog name is mounted, open the index properties panel once.
   * Parent should clear via `onAutoOpenIndexConsumed` (same pattern as `autoOpenFormulaForCatalog`).
   */
  autoOpenIndexForCatalog?: { catalogName: string; nonce: number } | null;
  onAutoOpenIndexConsumed?: () => void;
  /**
   * When true (index created from authoring wizard), the grid chrome is hidden until the index panel closes.
   * Parent should clear via `onIndexCreationWizardSessionEnd` when the wizard session ends.
   */
  indexCreationWizardActive?: boolean;
  onIndexCreationWizardSessionEnd?: () => void;
  /** Wizard Cancel: draft catalog row should be removed by the parent. */
  onIndexCreationWizardCancelled?: (catalogName: string) => void;
  /**
   * When set, shows a narrow column after the last series column (when at least one series is open)
   * that runs the same flow as the ledger “Add Series” control (e.g. authoring: begin series creation).
   */
  onAddDataSeries?: () => void;
}

export function SeriesGridEditor({
  availableSeries,
  seriesValueResolver = defaultFixtureResolver,
  onSaveColumn,
  onCloseColumn,
  gridMaxHeight = 440,
  seriesGridActive = true,
  externalSeriesBootstrap,
  onExternalSeriesBootstrapConsumed,
  onGridEmptied,
  autoOpenFormulaForCatalog,
  onAutoOpenFormulaConsumed,
  autoOpenIndexForCatalog,
  onAutoOpenIndexConsumed,
  indexCreationWizardActive = false,
  onIndexCreationWizardSessionEnd,
  onIndexCreationWizardCancelled,
  onAddDataSeries,
}: SeriesGridEditorProps) {
  const [columns, setColumns] = useState<SeriesGridColumnState[]>([]);
  const [pendingCloseId, setPendingCloseId] = useState<string | null>(null);
  const [pendingCloseAllOpen, setPendingCloseAllOpen] = useState(false);
  const [formulaPanelInstanceId, setFormulaPanelInstanceId] = useState<string | null>(null);
  const [indexPanelInstanceId, setIndexPanelInstanceId] = useState<string | null>(null);
  const [indexDraftById, setIndexDraftById] = useState<Record<string, IndexPanelDraft>>({});
  const formulaDraftFlushRef = useRef<(() => void) | null>(null);
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  useEffect(() => {
    if (!seriesGridActive) setFormulaPanelInstanceId(null);
  }, [seriesGridActive]);

  useEffect(() => {
    if (!seriesGridActive) setIndexPanelInstanceId(null);
  }, [seriesGridActive]);

  useEffect(() => {
    if (formulaPanelInstanceId && !columns.some((c) => c.instanceId === formulaPanelInstanceId)) {
      setFormulaPanelInstanceId(null);
    }
  }, [columns, formulaPanelInstanceId]);

  useEffect(() => {
    if (indexPanelInstanceId && !columns.some((c) => c.instanceId === indexPanelInstanceId)) {
      setIndexPanelInstanceId(null);
    }
  }, [columns, indexPanelInstanceId]);

  useEffect(() => {
    if (!indexPanelInstanceId) return;
    setIndexDraftById((prev) => {
      if (prev[indexPanelInstanceId]) return prev;
      const col = columns.find((c) => c.instanceId === indexPanelInstanceId);
      const row = col ? availableSeries.find((r) => r.name === col.catalogSeriesName) : undefined;
      return { ...prev, [indexPanelInstanceId]: defaultIndexDraft(row) };
    });
  }, [indexPanelInstanceId, columns, availableSeries]);

  const catalogByName = useMemo(() => {
    const m = new Map<string, DataSeriesAssetRow>();
    for (const r of availableSeries) {
      m.set(r.name, r);
    }
    return m;
  }, [availableSeries]);

  const getValuesForSeries = useCallback(
    (name: string) => {
      const row = catalogByName.get(name);
      if (!row) return [];
      return seriesValueResolver(row);
    },
    [catalogByName, seriesValueResolver],
  );

  const rowCount = useMemo(() => Math.max(maxRowCount(columns), 1), [columns]);

  const showAddDataSeriesColumn = columns.length > 0 && onAddDataSeries != null;

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
        const seed = seriesValueResolver(row);
        return [...prev, createColumnStateFromCatalog(row, seed)];
      });
    },
    [catalogByName, seriesValueResolver],
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

  useEffect(() => {
    if (!autoOpenFormulaForCatalog) return;
    const col = columns.find(
      (c) =>
        c.catalogSeriesName === autoOpenFormulaForCatalog.catalogName &&
        c.origin_kind === "formula" &&
        c.role_kind !== "index",
    );
    if (col) {
      setFormulaPanelInstanceId(col.instanceId);
      onAutoOpenFormulaConsumed?.();
    }
  }, [columns, autoOpenFormulaForCatalog, onAutoOpenFormulaConsumed]);

  useEffect(() => {
    if (!autoOpenIndexForCatalog) return;
    const col = columns.find(
      (c) =>
        c.catalogSeriesName === autoOpenIndexForCatalog.catalogName && c.role_kind === "index",
    );
    if (col) {
      setIndexPanelInstanceId(col.instanceId);
      onAutoOpenIndexConsumed?.();
    }
  }, [columns, autoOpenIndexForCatalog, onAutoOpenIndexConsumed]);

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

  /**
   * Must apply synchronously: {@link SeriesFormulaEditor} calls `flushParentSync` / `formulaDraftFlushRef`
   * immediately before `saveColumn` reads a `flushSync` snapshot — deferred updates would leave stale `draftRawFormula`
   * or `draftName` from the debounced name field.
   */
  const updateDraftRawFormula = useCallback((instanceId: string, raw: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.instanceId === instanceId ? { ...c, draftRawFormula: raw } : c)),
    );
  }, []);

  /** When `catalogRenameTo` is set, updates `catalogSeriesName` to match persisted `DataSeriesAssetRow.name` after rename. */
  const commitSaveSnapshot = useCallback((instanceId: string, catalogRenameTo?: string) => {
    setColumns((prev) =>
      prev.map((c) => {
        if (c.instanceId !== instanceId) return c;
        return {
          ...c,
          ...(catalogRenameTo !== undefined ? { catalogSeriesName: catalogRenameTo } : {}),
          savedSnapshot: {
            name: c.draftName,
            values: c.draftValues.slice(),
            displayNameSource: c.displayNameSource,
            ...(c.origin_kind === "formula" ? { rawFormula: c.draftRawFormula } : {}),
          },
        };
      }),
    );
  }, []);

  const lockDisplayName = useCallback((instanceId: string) => {
    setColumns((prev) =>
      prev.map((c) =>
        c.instanceId === instanceId && c.displayNameSource === "auto_placeholder"
          ? { ...c, displayNameSource: "user_locked" as const }
          : c,
      ),
    );
  }, []);

  const saveColumn = useCallback(
    async (
      instanceId: string,
      committedDraftName?: string,
      extras?: {
        index_source_series_name?: string;
        index_sort_order?: IndexSortOrder;
        index_custom_order_text?: string;
        numeric_format?: string;
      },
    ): Promise<boolean> => {
      if (formulaPanelInstanceId === instanceId) {
        formulaDraftFlushRef.current?.();
      }
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
      if (!snapshot) return false;
      const snap = snapshot;
      const name = snap.col.draftName.trim();
      if (!name) {
        window.alert("Enter a name for this data series before saving.");
        return false;
      }
      if (
        !isSeriesDisplayNameValid(
          name,
          snap.col.catalogSeriesName,
          availableSeries,
          snap.all,
          instanceId,
        )
      ) {
        window.alert(
          "That name is already used by another data series. Enter a unique name before saving.",
        );
        return false;
      }

      let valuesToSave = snap.col.draftValues.slice();
      if (extras?.index_source_series_name !== undefined) {
        const trimmed = extras.index_source_series_name.trim();
        if (!trimmed) {
          valuesToSave = [];
        } else {
          const sourceVals = getValuesForSeries(trimmed);
          const sort = extras.index_sort_order ?? "ascending";
          const customText =
            sort === "custom" ? (extras.index_custom_order_text ?? "") : undefined;
          valuesToSave = materializeUniqueIndexFromSourceValues(sourceVals, sort, customText).values;
        }
        flushSync(() => {
          setColumns((prev) =>
            prev.map((c) =>
              c.instanceId === instanceId ? { ...c, draftValues: valuesToSave } : c,
            ),
          );
        });
      }

      if (snap.col.origin_kind === "formula") {
        const trimmedFormula = snap.col.draftRawFormula.trim();
        if (!trimmedFormula) {
          window.alert("Enter a formula before saving.");
          return false;
        }
        const mat = materializeFormulaColumn({
          rows: availableSeries,
          getValuesForSeries: (n) => getValuesForSeries(n),
          rawFormula: trimmedFormula,
          excludeSeriesName: snap.col.catalogSeriesName,
        });
        if (!mat.ok) {
          window.alert(mat.error);
          return false;
        }
        valuesToSave = mat.values;
        const normalizedFormula =
          normalizeFormulaSource(trimmedFormula) ?? snap.col.draftRawFormula.trim();
        flushSync(() => {
          setColumns((prev) =>
            prev.map((c) =>
              c.instanceId === instanceId
                ? { ...c, draftValues: valuesToSave, draftRawFormula: normalizedFormula }
                : c,
            ),
          );
        });
      }

      let rawFormulaPayload: string | undefined;
      if (snap.col.origin_kind === "formula") {
        const colAfter = columnsRef.current.find((c) => c.instanceId === instanceId);
        rawFormulaPayload = colAfter?.draftRawFormula ?? snap.col.draftRawFormula;
      }

      let numericFormatPayload: string | undefined;
      if (extras?.numeric_format !== undefined) {
        numericFormatPayload = extras.numeric_format;
      } else if (snap.col.origin_kind === "formula" && rawFormulaPayload) {
        const catalogRow = availableSeries.find((r) => r.name === snap.col.catalogSeriesName);
        if (!catalogRow?.numeric_format?.trim()) {
          const inherited = inheritNumericFormatFromFormula(rawFormulaPayload, availableSeries);
          if (inherited) numericFormatPayload = inherited;
        }
      }

      await onSaveColumn?.({
        instanceId,
        catalogSeriesName: snap.col.catalogSeriesName,
        name,
        values: valuesToSave,
        ...(snap.col.origin_kind === "formula" && rawFormulaPayload !== undefined
          ? { rawFormula: rawFormulaPayload }
          : {}),
        ...(extras?.index_source_series_name !== undefined
          ? {
              index_source_series_name: extras.index_source_series_name,
              ...(extras.index_sort_order !== undefined ? { index_sort_order: extras.index_sort_order } : {}),
              ...(extras.index_custom_order_text !== undefined
                ? { index_custom_order_text: extras.index_custom_order_text }
                : {}),
            }
          : {}),
        ...(numericFormatPayload !== undefined ? { numeric_format: numericFormatPayload } : {}),
        series_display_name_source: displayNameSourceToPersisted(snap.col.displayNameSource),
      });
      commitSaveSnapshot(instanceId, catalogRenameToApplyAfterSave(snap.col.catalogSeriesName, name));
      return true;
    },
    [availableSeries, commitSaveSnapshot, formulaPanelInstanceId, getValuesForSeries, onSaveColumn],
  );

  const indexPanelColumn = useMemo(
    () =>
      indexPanelInstanceId ? columns.find((c) => c.instanceId === indexPanelInstanceId) : undefined,
    [columns, indexPanelInstanceId],
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
        setIndexDraftById((prev) => {
          const next = { ...prev };
          delete next[instanceId];
          return next;
        });
        onCloseColumn?.({ instanceId, catalogSeriesName: removed.catalogSeriesName });
        if (becameEmpty) {
          onGridEmptied?.();
        }
      }
    },
    [onCloseColumn, onGridEmptied],
  );

  const handleIndexCancel = useCallback(() => {
    if (!indexPanelInstanceId) return;
    if (indexCreationWizardActive) {
      const id = indexPanelInstanceId;
      const col = columns.find((c) => c.instanceId === id);
      const catalogName = col?.catalogSeriesName;
      removeColumn(id);
      if (catalogName) onIndexCreationWizardCancelled?.(catalogName);
      onIndexCreationWizardSessionEnd?.();
      return;
    }
    const col = columns.find((c) => c.instanceId === indexPanelInstanceId);
    const row = col ? availableSeries.find((r) => r.name === col.catalogSeriesName) : undefined;
    setIndexDraftById((prev) => ({
      ...prev,
      [indexPanelInstanceId]: defaultIndexDraft(row),
    }));
    setIndexPanelInstanceId(null);
  }, [
    indexPanelInstanceId,
    indexCreationWizardActive,
    columns,
    availableSeries,
    removeColumn,
    onIndexCreationWizardCancelled,
    onIndexCreationWizardSessionEnd,
  ]);

  const handleIndexSave = useCallback(async () => {
    if (!indexPanelInstanceId) return;
    const draft = indexDraftById[indexPanelInstanceId];
    const raw = draft?.sourceSeriesName?.trim() ?? "";
    const ok = await saveColumn(indexPanelInstanceId, undefined, {
      index_source_series_name: raw,
      index_sort_order: draft?.sortOrder ?? "ascending",
      index_custom_order_text: draft?.customOrderText ?? "",
      numeric_format: draft?.numericFormat ?? "",
    });
    if (ok) {
      setIndexPanelInstanceId(null);
      if (indexCreationWizardActive) onIndexCreationWizardSessionEnd?.();
    }
  }, [indexPanelInstanceId, indexDraftById, saveColumn, indexCreationWizardActive, onIndexCreationWizardSessionEnd]);

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
    if (formulaPanelInstanceId === instanceId) {
      formulaDraftFlushRef.current?.();
    }
    if (indexPanelInstanceId === instanceId) {
      setIndexPanelInstanceId(null);
    }
    const col = columnsRef.current.find((c) => c.instanceId === instanceId);
    if (!col) return;
    if (isDraftDirty(col)) {
      setPendingCloseId(instanceId);
    } else {
      removeColumn(instanceId);
    }
  }, [formulaPanelInstanceId, indexPanelInstanceId, removeColumn]);

  const closeDialog = useCallback(() => setPendingCloseId(null), []);

  const dialogSaveAndClose = useCallback(async () => {
    if (!pendingCloseId) return;
    const ok = await saveColumn(pendingCloseId);
    if (!ok) return;
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
    if (formulaPanelInstanceId != null) {
      formulaDraftFlushRef.current?.();
    }
    if (indexPanelInstanceId != null) {
      setIndexPanelInstanceId(null);
    }
    const cols = columnsRef.current;
    if (cols.length === 0) return;
    const dirty = cols.filter(isDraftDirty);
    if (dirty.length === 0) {
      clearAllColumns();
    } else {
      setPendingCloseAllOpen(true);
    }
  }, [clearAllColumns, formulaPanelInstanceId, indexPanelInstanceId]);

  const dialogSaveAllAndUnload = useCallback(async () => {
    const dirty = columnsRef.current.filter(isDraftDirty);
    for (const col of dirty) {
      const ok = await saveColumn(col.instanceId);
      if (!ok) return;
    }
    if (columnsRef.current.some(isDraftDirty)) return;
    clearAllColumns();
    setPendingCloseAllOpen(false);
  }, [clearAllColumns, saveColumn]);

  const dirtyColumnsForCloseAll = useMemo(() => {
    if (!pendingCloseAllOpen) return [];
    return columns.filter(isDraftDirty);
  }, [columns, pendingCloseAllOpen]);

  const formulaPanelColumn = useMemo(
    () =>
      formulaPanelInstanceId ? columns.find((c) => c.instanceId === formulaPanelInstanceId) : undefined,
    [columns, formulaPanelInstanceId],
  );

  const handleFormulaCancel = useCallback(() => {
    if (!formulaPanelInstanceId) return;
    setColumns((prev) =>
      prev.map((c) =>
        c.instanceId === formulaPanelInstanceId && c.origin_kind === "formula"
          ? { ...c, draftRawFormula: c.savedSnapshot.rawFormula ?? "" }
          : c,
      ),
    );
    setFormulaPanelInstanceId(null);
  }, [formulaPanelInstanceId]);

  const handleFormulaSave = useCallback(async () => {
    if (!formulaPanelInstanceId) return;
    const ok = await saveColumn(formulaPanelInstanceId);
    if (ok) setFormulaPanelInstanceId(null);
  }, [formulaPanelInstanceId, saveColumn]);

  const isDraggingOver = useCallback((e: React.DragEvent) => {
    preventDragDefaults(e);
  }, []);

  const onSeriesMentionCommitted = useCallback(
    (seriesName: string) => {
      addColumnFromCatalogName(seriesName);
    },
    [addColumnFromCatalogName],
  );

  const suggestAutoFormulaDisplayName = useCallback(
    (outerFnUpper: string) => {
      const id = formulaPanelInstanceId;
      if (!id) return null;
      const col = columns.find((c) => c.instanceId === id);
      if (!col || col.displayNameSource !== "auto_placeholder") return null;
      const taken = buildTakenDisplayNames(availableSeries, columns);
      taken.delete(col.draftName.trim());
      return suggestUniqueFxFnDisplayName(outerFnUpper, taken);
    },
    [availableSeries, columns, formulaPanelInstanceId],
  );

  /** Single `setColumns` pass: avoids two full-grid renders per debounced name flush from {@link SeriesFormulaEditor}. */
  const onFormulaSeriesNameUserInput = useCallback(
    (name: string) => {
      if (!formulaPanelInstanceId) return;
      setColumns((prev) =>
        prev.map((c) => {
          if (c.instanceId !== formulaPanelInstanceId) return c;
          return {
            ...c,
            draftName: name,
            ...(c.displayNameSource === "auto_placeholder"
              ? { displayNameSource: "user_locked" as const }
              : {}),
          };
        }),
      );
    },
    [formulaPanelInstanceId],
  );

  const onFormulaAutoSuggestedSeriesName = useCallback(
    (name: string) => {
      if (!formulaPanelInstanceId) return;
      updateDraftName(formulaPanelInstanceId, name);
    },
    [formulaPanelInstanceId, updateDraftName],
  );

  const formulaSlideIn = Boolean(
    formulaPanelColumn &&
      formulaPanelColumn.origin_kind === "formula" &&
      formulaPanelColumn.role_kind !== "index",
  );

  const indexSlideIn = Boolean(indexPanelColumn && indexPanelColumn.role_kind === "index");
  const hideGridPaper = indexCreationWizardActive && indexSlideIn;
  const shouldBlurGrid = indexSlideIn && !indexCreationWizardActive;

  const indexDraftForPanel =
    indexPanelInstanceId != null ? indexDraftById[indexPanelInstanceId] : undefined;

  let indexPropertiesPanel: ReactNode = null;
  if (indexSlideIn && indexPanelColumn && indexPanelInstanceId && indexPanelColumn.role_kind === "index") {
    const rowForIndex = availableSeries.find((r) => r.name === indexPanelColumn.catalogSeriesName);
    const d = indexDraftForPanel ?? defaultIndexDraft(rowForIndex);
    const id = indexPanelInstanceId;
    indexPropertiesPanel = (
      <SeriesIndexProperties
        key={id}
        seriesDisplayName={indexPanelColumn.draftName}
        valueLength={indexPanelColumn.draftValues.length}
        availableSeries={availableSeries}
        currentCatalogName={indexPanelColumn.catalogSeriesName}
        getValuesForSeries={getValuesForSeries}
        sourceSeriesName={d.sourceSeriesName}
        onSourceSeriesNameChange={(name) =>
          setIndexDraftById((prev) => ({
            ...prev,
            [id]: { ...(prev[id] ?? defaultIndexDraft(rowForIndex)), sourceSeriesName: name },
          }))
        }
        sortOrder={d.sortOrder}
        onSortOrderChange={(order) =>
          setIndexDraftById((prev) => ({
            ...prev,
            [id]: { ...(prev[id] ?? defaultIndexDraft(rowForIndex)), sortOrder: order },
          }))
        }
        customOrderText={d.customOrderText}
        onCustomOrderTextChange={(text) =>
          setIndexDraftById((prev) => ({
            ...prev,
            [id]: { ...(prev[id] ?? defaultIndexDraft(rowForIndex)), customOrderText: text },
          }))
        }
        numericFormat={d.numericFormat}
        onNumericFormatChange={(format) =>
          setIndexDraftById((prev) => ({
            ...prev,
            [id]: { ...(prev[id] ?? defaultIndexDraft(rowForIndex)), numericFormat: format },
          }))
        }
        onUserSeriesDisplayNameChange={(name) => {
          updateDraftName(id, name);
          lockDisplayName(id);
        }}
        onIndexSourceSeriesPicked={(parentName) => {
          setColumns((prev) => {
            const col = prev.find((c) => c.instanceId === id);
            if (!col || col.displayNameSource !== "auto_placeholder") return prev;
            const taken = buildTakenDisplayNames(availableSeries, prev);
            const next = suggestIndexNameFromParent(parentName, taken);
            return prev.map((c) => (c.instanceId === id ? { ...c, draftName: next } : c));
          });
        }}
        onSave={() => void handleIndexSave()}
        onCancel={handleIndexCancel}
      />
    );
  }

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
      {!hideGridPaper && (
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
              <Tooltip title="Drag series from the ledger into this pane to compare and edit index-aligned values side by side.">
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  component="h2"
                  sx={{ display: "inline-block", cursor: "default", width: "fit-content" }}
                >
                  GRID EDITOR
                </Typography>
              </Tooltip>
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

        <Box
          sx={{
            flex: 1,
            p: 2,
            bgcolor: tokens.colorSurface,
            minHeight: 200,
            ...(shouldBlurGrid
              ? {
                  filter: "blur(4px)",
                  opacity: 0.85,
                  pointerEvents: "none",
                  userSelect: "none",
                }
              : {}),
          }}
        >
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
                  minWidth:
                    48 +
                    columns.length * SERIES_GRID_COLUMN_WIDTH_PX +
                    (showAddDataSeriesColumn ? ADD_DATA_SERIES_COLUMN_WIDTH_PX : 0) +
                    DROP_ZONE_COLUMN_MIN_WIDTH_PX,
                  tableLayout: "fixed",
                }}
              >
                <colgroup>
                  <col style={{ width: 48 }} />
                  {columns.map((col) => (
                    <col key={col.instanceId} style={{ width: SERIES_GRID_COLUMN_WIDTH_PX }} />
                  ))}
                  {showAddDataSeriesColumn && (
                    <col style={{ width: ADD_DATA_SERIES_COLUMN_WIDTH_PX, maxWidth: ADD_DATA_SERIES_COLUMN_WIDTH_PX }} />
                  )}
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
                        boxSizing: "border-box",
                        height: SERIES_HEADER_MAX_HEIGHT_PX,
                        maxHeight: SERIES_HEADER_MAX_HEIGHT_PX,
                        py: 0.5,
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
                        onDisplayNameUserEdit={lockDisplayName}
                        onRequestClose={() => requestClose(col.instanceId)}
                        onCommitSave={(id, draftName) => void saveColumn(id, draftName)}
                        onFormula={() => setFormulaPanelInstanceId(col.instanceId)}
                        onIndexProperties={() => setIndexPanelInstanceId(col.instanceId)}
                      />
                    ))}
                    {showAddDataSeriesColumn && onAddDataSeries && (
                      <AddSeriesColumnHeader onAdd={onAddDataSeries} />
                    )}
                    <DropZoneColumnHeader />
                  </Box>
                </Box>
                <Box component="tbody">
                  {Array.from({ length: rowCount }, (_, rowIndex) => {
                    const beyond = columns.map(
                      (c) => c.origin_kind !== "manual" && rowIndex >= c.draftValues.length,
                    );
                    const firstCol = columns[0];
                    const nextRowFirstBeyond =
                      firstCol != null &&
                      rowIndex + 1 < rowCount &&
                      firstCol.origin_kind !== "manual" &&
                      rowIndex + 1 >= firstCol.draftValues.length;
                    const suppressStickyRowBottomBorder = Boolean(beyond[0]) && nextRowFirstBeyond;

                    return (
                    <Box component="tr" key={rowIndex}>
                      <Box
                        component="td"
                        sx={{
                          position: "sticky",
                          left: 0,
                          zIndex: 2,
                          bgcolor: tokens.colorSurface,
                          borderRight: `1px solid ${tokens.colorBorder}`,
                          borderBottom: suppressStickyRowBottomBorder
                            ? "none"
                            : `1px solid ${tokens.colorBorder}`,
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
                      {columns.map((col, colIndex) => {
                        const seriesRowCount = col.draftValues.length;
                        const isBeyondSeriesLength =
                          col.origin_kind !== "manual" && rowIndex >= seriesRowCount;
                        const nextRowBeyond =
                          col.origin_kind !== "manual" &&
                          rowIndex + 1 < rowCount &&
                          rowIndex + 1 >= col.draftValues.length;
                        const placeholderShowBorderLeft =
                          !isBeyondSeriesLength || colIndex === 0 || !beyond[colIndex - 1];
                        const placeholderShowBorderBottom =
                          !isBeyondSeriesLength ||
                          rowIndex === rowCount - 1 ||
                          !nextRowBeyond;
                        return (
                          <SeriesCell
                            key={`${col.instanceId}-${rowIndex}`}
                            instanceId={col.instanceId}
                            rowIndex={rowIndex}
                            value={cellValueAt(col, rowIndex)}
                            isManual={col.origin_kind === "manual"}
                            isBeyondSeriesLength={isBeyondSeriesLength}
                            placeholderShowBorderLeft={placeholderShowBorderLeft}
                            placeholderShowBorderBottom={placeholderShowBorderBottom}
                            updateCell={updateCell}
                          />
                        );
                      })}
                      {showAddDataSeriesColumn && <AddSeriesBodyCell rowIndex={rowIndex} />}
                      <DropZoneBodyCell rowIndex={rowIndex} />
                    </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
      )}

      <Slide direction="up" in={formulaSlideIn} mountOnEnter unmountOnExit timeout={280}>
        <Box sx={{ width: "100%" }}>
          {formulaPanelColumn &&
            formulaPanelColumn.origin_kind === "formula" &&
            formulaPanelColumn.role_kind !== "index" && (
            <SeriesFormulaEditor
              key={formulaPanelInstanceId}
              availableSeries={availableSeries}
              seriesName={formulaPanelColumn.draftName}
              onSeriesNameUserInput={onFormulaSeriesNameUserInput}
              displayNameSource={formulaPanelColumn.displayNameSource}
              suggestAutoFormulaDisplayName={suggestAutoFormulaDisplayName}
              onAutoSuggestedSeriesName={onFormulaAutoSuggestedSeriesName}
              valueLength={formulaPanelColumn.draftValues.length}
              value={formulaPanelColumn.draftRawFormula}
              savedRawFormula={formulaPanelColumn.savedSnapshot.rawFormula ?? ""}
              onChange={(next) => updateDraftRawFormula(formulaPanelColumn.instanceId, next)}
              onSave={handleFormulaSave}
              onCancel={handleFormulaCancel}
              flushParentRef={formulaDraftFlushRef}
              onSeriesMentionCommitted={onSeriesMentionCommitted}
            />
          )}
        </Box>
      </Slide>

      <Slide direction="up" in={indexSlideIn} mountOnEnter unmountOnExit timeout={280}>
        <Box sx={{ width: "100%" }}>{indexPropertiesPanel}</Box>
      </Slide>

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
    </Box>
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
        boxSizing: "border-box",
        // Same row as series headers: table row height = tallest cell; keep this cell ≤ series chrome height.
        height: SERIES_HEADER_MAX_HEIGHT_PX,
        maxHeight: SERIES_HEADER_MAX_HEIGHT_PX,
        py: 0.5,
        px: 0.75,
        verticalAlign: "middle",
        minWidth: DROP_ZONE_COLUMN_MIN_WIDTH_PX,
        width: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 0.75,
          textAlign: "left",
          height: "100%",
          minWidth: 0,
        }}
      >
        <TableChartIcon
          sx={{
            fontSize: 22,
            color: tokens.colorSecondary,
            opacity: 0.65,
            flexShrink: 0,
          }}
          aria-hidden
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: "0.8rem",
            lineHeight: 1.3,
            minWidth: 0,
          }}
        >
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

function AddSeriesColumnHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <Box
      component="th"
      scope="col"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 3,
        bgcolor: tokens.colorChrome,
        borderBottom: `1px solid ${tokens.colorBorder}`,
        borderLeft: `1px solid rgba(255,255,255,0.12)`,
        boxSizing: "border-box",
        height: SERIES_HEADER_MAX_HEIGHT_PX,
        maxHeight: SERIES_HEADER_MAX_HEIGHT_PX,
        py: 0.5,
        px: 0,
        verticalAlign: "middle",
        width: ADD_DATA_SERIES_COLUMN_WIDTH_PX,
        minWidth: ADD_DATA_SERIES_COLUMN_WIDTH_PX,
        maxWidth: ADD_DATA_SERIES_COLUMN_WIDTH_PX,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <Tooltip title="Add new data series">
          <IconButton
            size="small"
            aria-label="Add new data series"
            onClick={onAdd}
            sx={{
              color: "primary.main",
              p: 0.25,
              "& .MuiSvgIcon-root": { fontSize: 22 },
            }}
          >
            <AddCircleOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function AddSeriesBodyCell({ rowIndex }: { rowIndex: number }) {
  const stripeBg = rowIndex % 2 === 0 ? "#ffffff" : tokens.colorSurface;
  return (
    <Box
      component="td"
      aria-hidden
      sx={{
        borderBottom: `1px solid ${tokens.colorBorder}`,
        borderLeft: `1px solid ${tokens.colorBorder}`,
        verticalAlign: "middle",
        width: ADD_DATA_SERIES_COLUMN_WIDTH_PX,
        minWidth: ADD_DATA_SERIES_COLUMN_WIDTH_PX,
        maxWidth: ADD_DATA_SERIES_COLUMN_WIDTH_PX,
        bgcolor: stripeBg,
        boxSizing: "border-box",
        minHeight: 32,
      }}
    />
  );
}

function SeriesDebugJsonDialog({
  open,
  onClose,
  title,
  bodyText,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  bodyText: string;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bodyText);
    } catch {
      window.alert("Could not copy to clipboard.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box
          component="pre"
          sx={{
            m: 0,
            maxHeight: "70vh",
            overflowY: "auto",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            whiteSpace: "pre",
          }}
        >
          {bodyText}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: "wrap" }}>
        <Button
          startIcon={<ContentCopyIcon />}
          onClick={handleCopy}
          variant="outlined"
          size="small"
        >
          Copy all text shown
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function SeriesColumnHeader({
  col,
  onNameCommit,
  onDisplayNameUserEdit,
  onRequestClose,
  onCommitSave,
  onFormula,
  onIndexProperties,
}: {
  col: SeriesGridColumnState;
  onNameCommit: (id: string, name: string) => void;
  /** First keystroke in the name field locks auto-generated names (see `displayNameSource`). */
  onDisplayNameUserEdit: (instanceId: string) => void;
  onRequestClose: () => void;
  onCommitSave: (instanceId: string, draftName: string) => void;
  onFormula: () => void;
  onIndexProperties: () => void;
}) {
  const [localName, setLocalName] = useState(col.draftName);
  const [debugMenuAnchor, setDebugMenuAnchor] = useState<null | HTMLElement>(null);
  const [debugMetadataOpen, setDebugMetadataOpen] = useState(false);
  const [debugValuesOpen, setDebugValuesOpen] = useState(false);

  const debugMetadataText = useMemo(
    () => JSON.stringify(buildSeriesMetadataDebugPayload(col), null, 2),
    [col],
  );
  const debugValuesText = useMemo(
    () => JSON.stringify(buildSeriesValuesDebugPayload(col), null, 2),
    [col],
  );

  useEffect(() => {
    setLocalName(col.draftName);
  }, [col.instanceId, col.savedSnapshot.name]);

  const nameDirty = localName.trim() !== col.savedSnapshot.name;
  const formulaTextDirty =
    col.origin_kind === "formula" &&
    (col.savedSnapshot.rawFormula ?? "") !== col.draftRawFormula;
  const dirty = nameDirty || isValuesDirty(col) || formulaTextDirty;
  const showIndexWrench = col.role_kind === "index";
  const showFormulaWrench = col.origin_kind === "formula" && col.role_kind !== "index";

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

  /** Compact chrome actions (~24px) so a two-row right stack fits the header height budget. */
  const iconBtnSx = {
    color: "rgba(255,255,255,0.9)",
    p: 0,
    minWidth: 24,
    width: 24,
    height: 24,
    borderRadius: 1,
    "& .MuiSvgIcon-root": { fontSize: 18 },
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
        boxSizing: "border-box",
        // Table layout ignores max-height for cells; pin height so the row cannot grow past budget.
        height: SERIES_HEADER_MAX_HEIGHT_PX,
        maxHeight: SERIES_HEADER_MAX_HEIGHT_PX,
        py: 0.5,
        pl: 0.75,
        pr: 0.375,
        verticalAlign: "middle",
        width: SERIES_GRID_COLUMN_WIDTH_PX,
        minWidth: SERIES_GRID_COLUMN_WIDTH_PX,
        maxWidth: SERIES_GRID_COLUMN_WIDTH_PX,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "center",
          gap: 0.375,
          width: "100%",
          minWidth: 0,
          minHeight: 0,
          height: "100%",
          maxHeight: "100%",
        }}
      >
        <TextField
          variant="standard"
          hiddenLabel
          size="small"
          value={localName}
          onChange={(e) => {
            const v = e.target.value;
            setLocalName(v);
            if (col.displayNameSource === "auto_placeholder") {
              onDisplayNameUserEdit(col.instanceId);
            }
          }}
          placeholder="Series name"
          inputProps={{ "aria-label": "Series name" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ ml: 0, maxHeight: 22, alignItems: "center" }}>
                <EditOutlinedIcon
                  sx={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.42)",
                    pointerEvents: "none",
                  }}
                  aria-hidden
                />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: "0 0 auto",
            maxWidth: SERIES_NAME_INPUT_MAX_WIDTH_PX,
            width: SERIES_NAME_INPUT_MAX_WIDTH_PX,
            alignSelf: "center",
            mt: 0,
            mb: 0,
            "& .MuiFormControl-root": { marginTop: 0, marginBottom: 0 },
            "& .MuiInputBase-root": {
              fontSize: "0.75rem",
              minHeight: 26,
              maxHeight: 28,
              paddingTop: 0,
              paddingBottom: 0,
              color: "rgba(255,255,255,0.96)",
              backgroundColor: "rgba(0,0,0,0.14)",
              borderRadius: "4px 4px 0 0",
              px: 0.5,
              transition: "background-color 0.15s ease",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.22)",
              },
              "&.Mui-focused": {
                backgroundColor: "rgba(0,0,0,0.28)",
                boxShadow: `inset 0 -2px 0 0 ${tokens.colorPrimary}`,
              },
            },
            "& .MuiInputBase-input": {
              py: "3px",
              height: 20,
              boxSizing: "border-box",
              lineHeight: 1.2,
              "&::placeholder": {
                color: "rgba(255,255,255,0.42)",
                opacity: 1,
              },
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "rgba(255,255,255,0.38)",
            },
            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
              borderBottomColor: "rgba(255,255,255,0.58)",
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: tokens.colorPrimary,
              borderBottomWidth: 2,
            },
          }}
        />
        {SHOW_DATASERIES_DEBUG_KEBAB && (
          <>
            <Tooltip title="Debug this series">
              <IconButton
                size="small"
                aria-label="Series debug menu"
                onClick={(e) => setDebugMenuAnchor(e.currentTarget)}
                sx={{ ...iconBtnSx, flexShrink: 0 }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={debugMenuAnchor}
              open={Boolean(debugMenuAnchor)}
              onClose={() => setDebugMenuAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
              <MenuItem
                onClick={() => {
                  setDebugMenuAnchor(null);
                  setDebugMetadataOpen(true);
                }}
              >
                Show metadata
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setDebugMenuAnchor(null);
                  setDebugValuesOpen(true);
                }}
              >
                Show values
              </MenuItem>
            </Menu>
            <SeriesDebugJsonDialog
              open={debugMetadataOpen}
              onClose={() => setDebugMetadataOpen(false)}
              title="Series metadata"
              bodyText={debugMetadataText}
            />
            <SeriesDebugJsonDialog
              open={debugValuesOpen}
              onClose={() => setDebugValuesOpen(false)}
              title="Series values"
              bodyText={debugValuesText}
            />
          </>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 0,
            flexShrink: 0,
            ml: "auto",
            maxHeight: "100%",
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              alignItems: "center",
              pr:1,
              gap: 0,
              minHeight: 24,
              maxHeight: 24,
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              pr:1,
              gap: 0.25,
              minWidth: 0,
              minHeight: 18,
              maxHeight: 18,
            }}
          >
            <Typography
              variant="caption"
              component="div"
              sx={{
                fontSize: "0.55rem",
                fontWeight: 600,
                letterSpacing: 0.02,
                color: tokens.colorPrimary,
                textAlign: "right",
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              {originDisplayLabel(col.origin_kind)}
            </Typography>
            {showIndexWrench && (
              <Tooltip title="Index series properties">
                <IconButton
                  size="small"
                  aria-label="Index series properties"
                  onClick={onIndexProperties}
                  sx={{
                    p: 0,
                    minWidth: 22,
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    color: tokens.colorPrimary,
                    "&:hover": {
                      bgcolor: "rgba(232, 71, 42, 0.14)",
                    },
                    "& .MuiSvgIcon-root": { fontSize: 15 },
                  }}
                >
                  <BuildIcon />
                </IconButton>
              </Tooltip>
            )}
            {showFormulaWrench && (
              <Tooltip title="Open formula editor">
                <IconButton
                  size="small"
                  aria-label="Open formula editor"
                  onClick={onFormula}
                  sx={{
                    p: 0,
                    minWidth: 22,
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    color: tokens.colorPrimary,
                    "&:hover": {
                      bgcolor: "rgba(232, 71, 42, 0.14)",
                    },
                    "& .MuiSvgIcon-root": { fontSize: 15 },
                  }}
                >
                  <BuildIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
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
  isBeyondSeriesLength,
  placeholderShowBorderLeft,
  placeholderShowBorderBottom,
  updateCell,
}: {
  instanceId: string;
  rowIndex: number;
  value: string;
  isManual: boolean;
  /** True when the grid has more physical rows than this series has values (e.g. index vs full import). */
  isBeyondSeriesLength: boolean;
  /** When beyond length: show left border (merged runs omit it). Ignored for non-placeholder cells. */
  placeholderShowBorderLeft: boolean;
  /** When beyond length: show bottom border (merged vertical runs omit it). Ignored for non-placeholder cells. */
  placeholderShowBorderBottom: boolean;
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
          py: "1px",
          px: "4px",
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

  const stripeBg = rowIndex % 2 === 0 ? "#ffffff" : tokens.colorSurface;

  if (isBeyondSeriesLength) {
    const placeholderBg = tokens.colorSurface;
    return (
      <Box
        component="td"
        sx={{
          borderBottom: placeholderShowBorderBottom
            ? `1px solid ${tokens.colorBorder}`
            : "none",
          borderLeft: placeholderShowBorderLeft ? `1px solid ${tokens.colorBorder}` : "none",
          py: 0,
          px: 0,
          verticalAlign: "middle",
          width: SERIES_GRID_COLUMN_WIDTH_PX,
          minWidth: SERIES_GRID_COLUMN_WIDTH_PX,
          maxWidth: SERIES_GRID_COLUMN_WIDTH_PX,
          minHeight: 32,
          bgcolor: placeholderBg,
        }}
      />
    );
  }

  return (
    <Box
      component="td"
      sx={{
        borderBottom: `1px solid ${tokens.colorBorder}`,
        borderLeft: `1px solid ${tokens.colorBorder}`,
        py: "1px",
        px: "4px",
        verticalAlign: "middle",
        width: SERIES_GRID_COLUMN_WIDTH_PX,
        minWidth: SERIES_GRID_COLUMN_WIDTH_PX,
        maxWidth: SERIES_GRID_COLUMN_WIDTH_PX,
        bgcolor: stripeBg,
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
