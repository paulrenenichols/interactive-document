import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppViewMode } from "../types/appView";
import type { AuthoringSchemaFile } from "../types/authoringSchema";
import type { ChartAssetRow, DataSeriesAssetRow, DataSourceRow, IndexSortOrder } from "../types/dataModel";
import { materializeUniqueIndexFromMap, materializeUniqueIndexFromSourceValues } from "./materializeUniqueIndex";
import bundledAuthoringSchema from "../config/hris-acme-authoring-schema.json";
import { collectTakenNames } from "../chart/chartDefaultName";
import { importCsvColumnsAsSeries, type CsvColumnImportResult } from "./csvColumnImport";
import { createFixtureSeriesValueResolver, createProjectSeriesValueResolver, type SeriesValueResolver } from "./seriesValueResolver";
import type { ProjectSnapshotDataModel } from "../state/projectSnapshot";
import { dataModelValuesRecordToMap } from "../state/projectSnapshot";

const SESSION_IMPORT_KEY = "glide.authoring.csvImport.v1";

export type SeedDataMode = "fixture" | "project";

export interface DocumentDataModelContextValue {
  seedDataMode: SeedDataMode;
  /** Authoring catalog + cell values (empty until CSV import completes). */
  dataSeriesRows: DataSeriesAssetRow[];
  valuesBySeriesName: Map<string, string[]>;
  dataSourceRows: DataSourceRow[];
  chartAssetRows: ChartAssetRow[];
  setChartAssetRows: React.Dispatch<React.SetStateAction<ChartAssetRow[]>>;
  resolveSeriesValues: SeriesValueResolver;
  /** True while authoring CSV import is in flight (including silent refresh). */
  importLoading: boolean;
  importError: string | null;
  /** Blocking overlay: first import this session before sessionStorage is set. */
  importOverlayVisible: boolean;
  /** Basename for overlay copy, e.g. hris-acme-technologies.csv */
  importFileLabel: string | null;
  projectRowCount: number;
  projectDataLoaded: boolean;
  /** Bundled schema (derived series + optional charts) — not in catalog until applied. */
  stagedSchema: AuthoringSchemaFile;
  applyAuthoringSchema: () => void;
  onSeriesGridSave: (args: {
    instanceId?: string;
    catalogSeriesName: string;
    name: string;
    values: string[];
    rawFormula?: string;
    /** For `role_kind === "index"` — catalog name of the source series. */
    index_source_series_name?: string;
    index_sort_order?: IndexSortOrder;
    index_custom_order_text?: string;
    /** Persisted for formula/index flows; LLM rename targets rows with `auto` only. */
    series_display_name_source?: "auto" | "user";
    /** Canonical numeric format string; omit to leave unchanged. */
    numeric_format?: string;
  }) => void;
  /** Append a new catalog row + values (e.g. new formula series from authoring wizard). */
  registerDraftFormulaSeries: (row: DataSeriesAssetRow, values: string[]) => void;
  /** Append a new index series row + placeholder values (e.g. from authoring wizard). */
  registerDraftIndexSeries: (row: DataSeriesAssetRow, values: string[]) => void;
  /** Rename a catalog series and move values map key; updates `index_source_series_name` references. */
  renameSeriesInCatalog: (oldName: string, newName: string) => { success: boolean; error?: string };
  /** Remove a series from the catalog and its values; clears `index_source_series_name` refs to the deleted name. */
  deleteSeriesFromCatalog: (name: string) => void;
  /** Adjust `live_instance_count` when slide deck placements reference charts (slide-deck-spec §9). */
  adjustChartLiveInstanceCount: (chartId: string, delta: number) => void;
  /** Replace catalog + values from a project snapshot (dev Load / future persistence). */
  hydrateDataModel: (data: ProjectSnapshotDataModel) => void;
}

const DocumentDataModelContext = createContext<DocumentDataModelContextValue | null>(null);

function createAcmeSourceRow(result: CsvColumnImportResult): DataSourceRow {
  let totalChars = 0;
  for (const arr of result.valuesBySeriesName.values()) {
    for (const s of arr) {
      totalChars += s.length;
    }
  }
  return {
    id: "acme-hris-csv-authoring",
    display_name: "HRIS — Acme Technologies (imported)",
    provenance_kind: "flat_file",
    file_format: "csv",
    file_display_name: result.fileDisplayName,
    sheet_name: "__csv_default__",
    row_count: result.rowCount,
    field_count: result.fieldCount,
    estimated_memory_kb: Math.max(1, Math.round(totalChars / 1024)),
  };
}

export function DocumentDataModelProvider({
  children,
  viewMode,
}: {
  children: ReactNode;
  viewMode: AppViewMode;
}) {
  const [dataSeriesRows, setDataSeriesRows] = useState<DataSeriesAssetRow[]>([]);
  const [valuesBySeriesName, setValuesBySeriesName] = useState<Map<string, string[]>>(() => new Map());
  const [dataSourceRows, setDataSourceRows] = useState<DataSourceRow[]>([]);
  const [chartAssetRows, setChartAssetRows] = useState<ChartAssetRow[]>([]);
  const [projectDataLoaded, setProjectDataLoaded] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importOverlayVisible, setImportOverlayVisible] = useState(false);
  const [importFileLabel, setImportFileLabel] = useState<string | null>(null);
  const stagedSchema = bundledAuthoringSchema as AuthoringSchemaFile;

  const modelRef = useRef({ rows: dataSeriesRows, values: valuesBySeriesName });
  modelRef.current = { rows: dataSeriesRows, values: valuesBySeriesName };

  /** When true, an in-flight CSV import must not overwrite snapshot-hydrated data. */
  const hydratedFromSnapshotRef = useRef(false);

  const seedDataMode: SeedDataMode = viewMode === "loose" ? "fixture" : "project";

  const resolveSeriesValues = useMemo((): SeriesValueResolver => {
    if (seedDataMode === "fixture") {
      return createFixtureSeriesValueResolver();
    }
    return createProjectSeriesValueResolver(valuesBySeriesName);
  }, [seedDataMode, valuesBySeriesName]);

  useEffect(() => {
    if (viewMode !== "authoring") return;
    if (projectDataLoaded) return;

    let cancelled = false;
    const run = async () => {
      const skipOverlay = typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_IMPORT_KEY) === "1";
      if (!skipOverlay) {
        setImportOverlayVisible(true);
      }
      setImportLoading(true);
      setImportError(null);
      try {
        const result = await importCsvColumnsAsSeries();
        if (cancelled) return;
        if (hydratedFromSnapshotRef.current) {
          setImportLoading(false);
          setImportOverlayVisible(false);
          return;
        }
        setImportFileLabel(result.fileDisplayName);
        setDataSeriesRows(result.series);
        setValuesBySeriesName(new Map(result.valuesBySeriesName));
        setDataSourceRows([createAcmeSourceRow(result)]);
        setProjectDataLoaded(true);
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(SESSION_IMPORT_KEY, "1");
        }
      } catch (e: unknown) {
        if (!cancelled && !hydratedFromSnapshotRef.current) {
          setImportError(e instanceof Error ? e.message : String(e));
          setDataSeriesRows([]);
          setValuesBySeriesName(new Map());
          setDataSourceRows([]);
        }
      } finally {
        if (!cancelled) {
          setImportLoading(false);
          setImportOverlayVisible(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [viewMode, projectDataLoaded]);

  const registerDraftFormulaSeries = useCallback((row: DataSeriesAssetRow, values: string[]) => {
    const len = values.length;
    setDataSeriesRows((prev) => [...prev, { ...row, length: len }]);
    setValuesBySeriesName((prev) => {
      const next = new Map(prev);
      next.set(row.name, values);
      return next;
    });
  }, []);

  const registerDraftIndexSeries = useCallback((row: DataSeriesAssetRow, values: string[]) => {
    const len = values.length;
    setDataSeriesRows((prev) => [...prev, { ...row, length: len }]);
    setValuesBySeriesName((prev) => {
      const next = new Map(prev);
      next.set(row.name, values);
      return next;
    });
  }, []);

  const onSeriesGridSave = useCallback(
    (args: {
      instanceId?: string;
      catalogSeriesName: string;
      name: string;
      values: string[];
      rawFormula?: string;
      index_source_series_name?: string;
      index_sort_order?: IndexSortOrder;
      index_custom_order_text?: string;
      series_display_name_source?: "auto" | "user";
      numeric_format?: string;
    }) => {
      const { rows, values: valuesMap } = modelRef.current;
      const catalogRow = rows.find((r) => r.name === args.catalogSeriesName);

      let resolvedValues = args.values;
      let resolvedLength = args.values.length;

      if (args.index_source_series_name !== undefined) {
        const trimmed = args.index_source_series_name.trim();
        if (trimmed === "") {
          resolvedValues = [];
          resolvedLength = 0;
        } else {
          const sourceValues = valuesMap.get(trimmed) ?? [];
          const sort: IndexSortOrder = args.index_sort_order ?? catalogRow?.index_sort_order ?? "ascending";
          const customText =
            sort === "custom"
              ? (args.index_custom_order_text !== undefined
                  ? args.index_custom_order_text
                  : catalogRow?.index_custom_order_text ?? "")
              : undefined;
          const m = materializeUniqueIndexFromSourceValues(sourceValues, sort, customText);
          resolvedValues = m.values;
          resolvedLength = m.length;
        }
      }

      setDataSeriesRows((prev) =>
        prev.map((r) => {
          if (r.name !== args.catalogSeriesName) return r;
          const next: DataSeriesAssetRow = {
            ...r,
            name: args.name,
            length: resolvedLength,
            ...(args.rawFormula !== undefined ? { raw_formula: args.rawFormula } : {}),
            ...(args.series_display_name_source !== undefined
              ? { series_display_name_source: args.series_display_name_source }
              : {}),
            ...(args.numeric_format !== undefined
              ? { numeric_format: args.numeric_format.trim() || undefined }
              : {}),
          };

          if (args.index_source_series_name !== undefined) {
            const trimmed = args.index_source_series_name.trim();
            if (trimmed === "") {
              return {
                ...next,
                index_source_series_name: undefined,
                index_sort_order: undefined,
                index_custom_order_text: undefined,
                numeric_format: undefined,
              };
            }
            const sort: IndexSortOrder = args.index_sort_order ?? r.index_sort_order ?? "ascending";
            return {
              ...next,
              index_source_series_name: trimmed,
              index_sort_order: sort,
              index_custom_order_text:
                sort === "custom" ? (args.index_custom_order_text ?? r.index_custom_order_text ?? "") : undefined,
            };
          }

          return next;
        }),
      );
      setValuesBySeriesName((prev) => {
        const next = new Map(prev);
        if (args.catalogSeriesName !== args.name) {
          const v = next.get(args.catalogSeriesName);
          next.delete(args.catalogSeriesName);
          if (v) next.set(args.name, resolvedValues);
        } else {
          next.set(args.name, resolvedValues);
        }
        return next;
      });
    },
    [],
  );

  const renameSeriesInCatalog = useCallback(
    (oldName: string, newName: string): { success: boolean; error?: string } => {
      const trimmed = newName.trim();
      if (!trimmed) {
        return { success: false, error: "Enter a name." };
      }
      if (!dataSeriesRows.some((r) => r.name === oldName)) {
        return { success: false, error: "Series not found." };
      }
      const taken = collectTakenNames({
        series: dataSeriesRows,
        dataSources: dataSourceRows,
        charts: chartAssetRows,
      });
      if (trimmed !== oldName && taken.has(trimmed)) {
        return { success: false, error: "That name is already used by another global asset." };
      }
      setDataSeriesRows((prev) =>
        prev.map((r) => {
          if (r.name === oldName) return { ...r, name: trimmed };
          if (r.index_source_series_name === oldName) return { ...r, index_source_series_name: trimmed };
          return r;
        }),
      );
      setValuesBySeriesName((prev) => {
        const next = new Map(prev);
        const v = next.get(oldName);
        next.delete(oldName);
        if (v) next.set(trimmed, v);
        return next;
      });
      return { success: true };
    },
    [chartAssetRows, dataSeriesRows, dataSourceRows],
  );

  const adjustChartLiveInstanceCount = useCallback((chartId: string, delta: number) => {
    if (delta === 0) return;
    setChartAssetRows((prev) =>
      prev.map((row) =>
        row.id === chartId
          ? { ...row, live_instance_count: Math.max(0, row.live_instance_count + delta) }
          : row,
      ),
    );
  }, []);

  const deleteSeriesFromCatalog = useCallback((name: string) => {
    setDataSeriesRows((prev) =>
      prev
        .filter((r) => r.name !== name)
        .map((r) =>
          r.index_source_series_name === name
            ? {
                ...r,
                index_source_series_name: undefined,
                index_sort_order: undefined,
                index_custom_order_text: undefined,
              }
            : r,
        ),
    );
    setValuesBySeriesName((prev) => {
      const next = new Map(prev);
      next.delete(name);
      return next;
    });
  }, []);

  const hydrateDataModel = useCallback((data: ProjectSnapshotDataModel) => {
    hydratedFromSnapshotRef.current = true;
    setDataSeriesRows(data.dataSeriesRows);
    setValuesBySeriesName(dataModelValuesRecordToMap(data.valuesBySeriesName));
    setDataSourceRows(data.dataSourceRows);
    setChartAssetRows(data.chartAssetRows);
    setProjectDataLoaded(true);
    setImportLoading(false);
    setImportOverlayVisible(false);
    setImportError(null);
  }, []);

  const applyAuthoringSchema = useCallback(() => {
    const prevRows = modelRef.current.rows;
    const pendingValues = new Map(modelRef.current.values);
    const nameSet = new Set(prevRows.map((r) => r.name));
    const nextRows = [...prevRows];

    for (const def of stagedSchema.derivedSeries) {
      if (nameSet.has(def.name)) continue;

      if (def.recipeKind === "unique_index" && def.sourceColumns[0]) {
        const { length, values } = materializeUniqueIndexFromMap(
          def.sourceColumns[0],
          pendingValues,
          "ascending",
        );
        nextRows.push({
          name: def.name,
          value_type: def.value_type,
          length,
          origin_kind: def.origin_kind,
          role_kind: def.role_kind,
          index_source_series_name: def.sourceColumns[0],
          index_sort_order: "ascending",
        });
        pendingValues.set(def.name, values);
        nameSet.add(def.name);
        continue;
      }

      nextRows.push({
        name: def.name,
        value_type: def.value_type,
        length: 0,
        origin_kind: def.origin_kind,
        role_kind: def.role_kind,
      });
      pendingValues.set(def.name, []);
      nameSet.add(def.name);
    }

    setDataSeriesRows(nextRows);
    setValuesBySeriesName(pendingValues);

    setChartAssetRows((prevCharts) => {
      const taken = new Set(prevCharts.map((c) => c.name));
      const extra: ChartAssetRow[] = [];
      for (const c of stagedSchema.charts ?? []) {
        if (!taken.has(c.name)) {
          extra.push({
            id: crypto.randomUUID(),
            name: c.name,
            chart_type: c.chart_type,
            live_instance_count: c.live_instance_count ?? 0,
          });
          taken.add(c.name);
        }
      }
      return extra.length > 0 ? [...prevCharts, ...extra] : prevCharts;
    });

  }, [stagedSchema]);

  const projectRowCount = useMemo(() => {
    let max = 0;
    for (const r of dataSeriesRows) {
      if (r.length > max) max = r.length;
    }
    return max;
  }, [dataSeriesRows]);

  const value = useMemo<DocumentDataModelContextValue>(
    () => ({
      seedDataMode,
      dataSeriesRows,
      valuesBySeriesName,
      dataSourceRows,
      chartAssetRows,
      setChartAssetRows,
      resolveSeriesValues,
      importLoading,
      importError,
      importOverlayVisible,
      importFileLabel,
      projectRowCount,
      projectDataLoaded,
      stagedSchema,
      applyAuthoringSchema,
      onSeriesGridSave,
      registerDraftFormulaSeries,
      registerDraftIndexSeries,
      renameSeriesInCatalog,
      deleteSeriesFromCatalog,
      adjustChartLiveInstanceCount,
      hydrateDataModel,
    }),
    [
      seedDataMode,
      dataSeriesRows,
      valuesBySeriesName,
      dataSourceRows,
      chartAssetRows,
      resolveSeriesValues,
      importLoading,
      importError,
      importOverlayVisible,
      importFileLabel,
      projectRowCount,
      projectDataLoaded,
      stagedSchema,
      applyAuthoringSchema,
      onSeriesGridSave,
      registerDraftFormulaSeries,
      registerDraftIndexSeries,
      renameSeriesInCatalog,
      deleteSeriesFromCatalog,
      adjustChartLiveInstanceCount,
      hydrateDataModel,
    ],
  );

  return <DocumentDataModelContext.Provider value={value}>{children}</DocumentDataModelContext.Provider>;
}

export function useDocumentDataModel(): DocumentDataModelContextValue {
  const ctx = useContext(DocumentDataModelContext);
  if (!ctx) {
    throw new Error("useDocumentDataModel must be used within DocumentDataModelProvider");
  }
  return ctx;
}
