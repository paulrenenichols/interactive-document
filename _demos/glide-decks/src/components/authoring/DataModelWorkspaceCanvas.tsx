import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Fade from "@mui/material/Fade";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import BarChartIcon from "@mui/icons-material/BarChart";
import CloseIcon from "@mui/icons-material/Close";
import InputIcon from "@mui/icons-material/Input";
import { ChartsTable } from "../dataModel/ChartsTable";
import { CreateChartStepSelect } from "../dataModel/CreateChartStepSelect";
import { CreateDataSeriesStepSelect } from "../dataModel/CreateDataSeriesStepSelect";
import { DataSourcesTable } from "../dataModel/DataSourcesTable";
import { DataSeriesTable } from "../dataModel/DataSeriesTable";
import { ChartSeriesBindingPanel } from "../dataModel/ChartSeriesBindingPanel";
import { ChartDesignAppearanceModal } from "../chartDesign/ChartDesignAppearanceModal";
import { SeriesGridEditor } from "../dataModel/SeriesGridEditor";
import {
  chartCreationKindToLedgerType,
  collectTakenNames,
  suggestUniqueChartName,
  suggestUniqueFxFormulaName,
  suggestUniqueIndexName,
} from "../../chart/chartDefaultName";
import { CHART_NAME_MAX_LENGTH } from "../../chart/chartLimits";
import { mergeAppearanceWithVisualDefaults } from "../../chart/chartAppearanceVisual";
import { createDefaultChartAppearanceLayout } from "../../chart/chartAppearanceLayout";
import { createEmptyBindings, inferChartCreationKindFromChartType } from "../../chart/chartSlotContracts";
import { useDocumentDataModel } from "../../data/DocumentDataModelContext";
import { pickAndReadJsonFile } from "../../state/jsonState";
import { isProjectSnapshotShape, parseProjectSnapshot } from "../../state/projectSnapshot";
import { tokens } from "../../theme/tokens";
import {
  readChartNameFromDataTransfer,
  readSeriesNameFromDataTransfer,
} from "../../types/chartBindings";
import type { ChartBindingsState } from "../../types/chartBindings";
import type {
  ChartAppearanceLayout,
  ChartAssetRow,
  ChartCreationKind,
  DataSeriesAssetRow,
  SeriesCreationKind,
} from "../../types/dataModel";

const surfaceContainerLow = "#f3f4f6";
const surfaceContainerLowest = "#ffffff";
const onSecondaryContainer = "#5b6277";
const outlineVariant = "#e4beb7";
const onSurfaceVariant = "#5b403b";

const blueprintGridFine = {
  backgroundImage: `
    linear-gradient(to right, rgba(200, 200, 200, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(200, 200, 200, 0.05) 1px, transparent 1px)
  `,
  backgroundSize: "8px 8px",
} as const;

const blueprintGrid = {
  backgroundImage: `
    linear-gradient(to right, rgba(200, 200, 200, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(200, 200, 200, 0.1) 1px, transparent 1px)
  `,
  backgroundSize: "40px 40px",
} as const;

function preventDragDefaults(e: React.DragEvent) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
}

type DroppedItem = { kind: "chart"; name: string };

type CreationMode = "none" | "series" | "chart";

const floatingActionSx = {
  textTransform: "none" as const,
  fontSize: "0.75rem",
  fontWeight: 600,
  color: `${onSecondaryContainer} !important`,
  px: 2,
  py: 1,
  minHeight: 36,
  borderRadius: 2,
  bgcolor: `${surfaceContainerLowest} !important`,
  border: `1px solid ${outlineVariant}55`,
  boxShadow: "0 2px 8px rgba(25, 28, 30, 0.08), 0 1px 2px rgba(25, 28, 30, 0.04)",
  gap: 1,
  boxSizing: "border-box" as const,
  "&:hover": {
    bgcolor: `${surfaceContainerLowest} !important`,
    borderColor: `${outlineVariant}99`,
    boxShadow: "0 4px 12px rgba(25, 28, 30, 0.1)",
  },
};

export function DataModelWorkspaceCanvas() {
  const {
    dataSeriesRows,
    dataSourceRows,
    chartAssetRows,
    setChartAssetRows,
    resolveSeriesValues,
    onSeriesGridSave,
    registerDraftFormulaSeries,
    registerDraftIndexSeries,
    projectRowCount,
    importError,
    stagedSchema,
    applyAuthoringSchema,
    projectDataLoaded,
    renameSeriesInCatalog,
    deleteSeriesFromCatalog,
    hydrateDataModel,
  } = useDocumentDataModel();

  const [dropped, setDropped] = useState<DroppedItem[]>([]);
  /** Grid editor is hidden until the user drops a data series onto the canvas. */
  const [seriesGridOpen, setSeriesGridOpen] = useState(false);
  const [seriesBootstrap, setSeriesBootstrap] = useState<{ catalogName: string; nonce: number } | null>(null);
  /** Opens the formula slide-up once the new formula column exists (see SeriesGridEditor). */
  const [formulaAutoOpenBootstrap, setFormulaAutoOpenBootstrap] = useState<{
    catalogName: string;
    nonce: number;
  } | null>(null);
  /** Opens the index properties slide-up once the new index column exists (see SeriesGridEditor). */
  const [indexAutoOpenBootstrap, setIndexAutoOpenBootstrap] = useState<{
    catalogName: string;
    nonce: number;
  } | null>(null);
  /** True while the create-new-index wizard session is active; cleared when the index panel closes. */
  const [indexCreationWizardActive, setIndexCreationWizardActive] = useState(false);
  /** In-canvas chart slot binding (from chart drop on empty canvas or chart type pick in overlay). */
  const [chartBindingSession, setChartBindingSession] = useState<{
    kind: ChartCreationKind;
    bindings: ChartBindingsState;
    chartName: string;
    appearance?: ChartAppearanceLayout;
  } | null>(null);
  const [designAppearanceOpen, setDesignAppearanceOpen] = useState(false);
  const [chartSaveError, setChartSaveError] = useState<string | null>(null);
  const appearancePatchTimerRef = useRef<number | null>(null);
  const [creationMode, setCreationMode] = useState<CreationMode>("none");
  const [pulseActive, setPulseActive] = useState(false);
  /** Increment to replay the Data Series ledger pulse; 0 = idle (empty-slot hint). */
  const [dataSeriesLedgerPulseKey, setDataSeriesLedgerPulseKey] = useState(0);
  const [dragOverCanvas, setDragOverCanvas] = useState(false);
  const openDelayTimeoutRef = useRef<number | null>(null);
  const creationPanelRef = useRef<HTMLDivElement | null>(null);

  const onSeriesBootstrapConsumed = useCallback(() => setSeriesBootstrap(null), []);

  const onFormulaAutoOpenConsumed = useCallback(() => setFormulaAutoOpenBootstrap(null), []);

  const onIndexAutoOpenConsumed = useCallback(() => setIndexAutoOpenBootstrap(null), []);

  const onSeriesGridEmptied = useCallback(() => {
    setSeriesGridOpen(false);
  }, []);

  const onIndexCreationWizardSessionEnd = useCallback(() => {
    setIndexCreationWizardActive(false);
  }, []);

  const onIndexCreationWizardCancelled = useCallback(
    (catalogName: string) => {
      deleteSeriesFromCatalog(catalogName);
    },
    [deleteSeriesFromCatalog],
  );

  const isCreating = creationMode !== "none";

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverCanvas(false);
      const seriesName = readSeriesNameFromDataTransfer(e.dataTransfer);
      if (seriesName) {
        if (chartBindingSession) {
          return;
        }
        setSeriesGridOpen(true);
        setSeriesBootstrap({ catalogName: seriesName, nonce: Date.now() });
        return;
      }
      const chartNameDropped = readChartNameFromDataTransfer(e.dataTransfer);
      if (chartNameDropped) {
        if (!seriesGridOpen) {
          const row = chartAssetRows.find((r) => r.name === chartNameDropped);
          if (row) {
            const kind = inferChartCreationKindFromChartType(row.chart_type);
            const bindings = row.bindings ?? createEmptyBindings(kind);
            setChartSaveError(null);
            setChartBindingSession({
              kind,
              bindings,
              chartName: row.name.slice(0, CHART_NAME_MAX_LENGTH),
              appearance: row.appearance,
            });
            return;
          }
        }
        setDropped((prev) => {
          if (prev.some((p) => p.name === chartNameDropped)) return prev;
          return [...prev, { kind: "chart", name: chartNameDropped }];
        });
      }
    },
    [seriesGridOpen, chartAssetRows, chartBindingSession],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCanvas(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const next = e.relatedTarget as Node | null;
    if (next && (e.currentTarget as HTMLElement).contains(next)) return;
    setDragOverCanvas(false);
  }, []);

  const handleImportData = async () => {
    try {
      const raw = await pickAndReadJsonFile();
      if (isProjectSnapshotShape(raw)) {
        const snap = parseProjectSnapshot(raw);
        hydrateDataModel(snap.dataModel);
      }
    } catch {
      /* cancelled or invalid snapshot */
    }
  };

  const beginCreationAfterPulse = (mode: "series" | "chart") => {
    if (creationMode !== "none") return;
    if (openDelayTimeoutRef.current != null) return;
    setPulseActive(true);
    openDelayTimeoutRef.current = window.setTimeout(() => {
      openDelayTimeoutRef.current = null;
      setCreationMode(mode);
    }, 100);
  };

  const handlePulseEnd = () => {
    setPulseActive(false);
  };

  const handleDataSeriesLedgerPulseEnd = () => {
    setDataSeriesLedgerPulseKey(0);
  };

  /** Replays `canvas-active-pulse` on the ledger wrapper; key bump remounts only the overlay, not the table. */
  const triggerDataSeriesLedgerPulse = useCallback(() => {
    setDataSeriesLedgerPulseKey((k) => k + 1);
  }, []);

  const closeCreation = useCallback(() => {
    if (openDelayTimeoutRef.current != null) {
      clearTimeout(openDelayTimeoutRef.current);
      openDelayTimeoutRef.current = null;
    }
    setCreationMode("none");
    setPulseActive(false);
  }, []);

  const onSeriesSelect = (kind: SeriesCreationKind) => {
    if (kind === "formula") {
      const taken = collectTakenNames({
        series: dataSeriesRows,
        dataSources: dataSourceRows,
        charts: chartAssetRows,
      });
      const name = suggestUniqueFxFormulaName(taken);
      const n = Math.max(0, projectRowCount);
      const placeholderValues: string[] = Array.from({ length: n }, () => "");
      const row: DataSeriesAssetRow = {
        name,
        value_type: "numeric",
        length: n,
        origin_kind: "formula",
        role_kind: "none",
        raw_formula: "",
        series_display_name_source: "auto",
      };
      registerDraftFormulaSeries(row, placeholderValues);
      setSeriesGridOpen(true);
      const nonce = Date.now();
      setSeriesBootstrap({ catalogName: name, nonce });
      setFormulaAutoOpenBootstrap({ catalogName: name, nonce });
      closeCreation();
      return;
    }
    if (kind === "index") {
      const taken = collectTakenNames({
        series: dataSeriesRows,
        dataSources: dataSourceRows,
        charts: chartAssetRows,
      });
      const name = suggestUniqueIndexName(taken);
      const row: DataSeriesAssetRow = {
        name,
        value_type: "text",
        length: 0,
        origin_kind: "index",
        role_kind: "index",
        index_sort_order: "ascending",
        series_display_name_source: "auto",
      };
      registerDraftIndexSeries(row, []);
      setSeriesGridOpen(true);
      setIndexCreationWizardActive(true);
      const nonce = Date.now();
      setSeriesBootstrap({ catalogName: name, nonce });
      setIndexAutoOpenBootstrap({ catalogName: name, nonce });
      closeCreation();
      return;
    }
    console.info("[authoring] create data series path:", kind);
    closeCreation();
  };

  const onChartSelect = (kind: ChartCreationKind) => {
    console.info("[authoring] create chart type:", kind);
    closeCreation();
    const taken = collectTakenNames({
      series: dataSeriesRows,
      dataSources: dataSourceRows,
      charts: chartAssetRows,
    });
    const chartName = suggestUniqueChartName(kind, taken);
    setChartSaveError(null);
    setChartBindingSession({ kind, bindings: createEmptyBindings(kind), chartName });
  };

  const closeChartBindingSession = useCallback(() => {
    setChartBindingSession(null);
    setChartSaveError(null);
  }, []);

  const openDesignAppearance = useCallback((latestChartName: string) => {
    setChartBindingSession((s) => {
      if (!s) return s;
      const nextSession = { ...s, chartName: latestChartName.slice(0, CHART_NAME_MAX_LENGTH) };
      const w = Math.max(400, window.innerWidth - 280);
      const h = Math.max(300, window.innerHeight - 160);
      const name = nextSession.chartName.trim() || "Chart";
      if (!nextSession.appearance) {
        const layout = createDefaultChartAppearanceLayout(nextSession.kind, w, h);
        return {
          ...nextSession,
          appearance: mergeAppearanceWithVisualDefaults(layout, nextSession.kind, nextSession.bindings, name),
        };
      }
      if (!nextSession.appearance.visual) {
        return {
          ...nextSession,
          appearance: mergeAppearanceWithVisualDefaults(
            nextSession.appearance,
            nextSession.kind,
            nextSession.bindings,
            name,
          ),
        };
      }
      return nextSession;
    });
    setDesignAppearanceOpen(true);
  }, []);

  const handleDesignAppearanceChange = useCallback(
    (next: ChartAppearanceLayout) => {
      setChartBindingSession((s) => {
        if (!s) return s;
        const name = s.chartName.trim();
        if (name) {
          if (appearancePatchTimerRef.current != null) {
            window.clearTimeout(appearancePatchTimerRef.current);
          }
          appearancePatchTimerRef.current = window.setTimeout(() => {
            appearancePatchTimerRef.current = null;
            setChartAssetRows((prev) => {
              const exists = prev.some((r) => r.name === name);
              if (!exists) return prev;
              return prev.map((r) => (r.name === name ? { ...r, appearance: next } : r));
            });
          }, 120);
        }
        return { ...s, appearance: next };
      });
    },
    [setChartAssetRows],
  );

  const handleSaveChartFromPanel = useCallback(
    (nameFromField: string) => {
      if (!chartBindingSession) return;
      const name = nameFromField.trim();
      if (!name) {
        setChartSaveError("Enter a chart name.");
        return;
      }
      if (name.length > CHART_NAME_MAX_LENGTH) {
        setChartSaveError(`Chart name must be ${CHART_NAME_MAX_LENGTH} characters or fewer.`);
        return;
      }
      const taken = collectTakenNames({
        series: dataSeriesRows,
        dataSources: dataSourceRows,
        charts: chartAssetRows,
      });
      if (taken.has(name)) {
        setChartSaveError("That name is already used by another global asset.");
        return;
      }
      setChartSaveError(null);
      const row: ChartAssetRow = {
        id: crypto.randomUUID(),
        name,
        chart_type: chartCreationKindToLedgerType(chartBindingSession.kind),
        live_instance_count: 0,
        bindings: chartBindingSession.bindings,
        appearance: chartBindingSession.appearance,
      };
      setChartAssetRows((prev) => [...prev, row]);
      setChartBindingSession(null);
    },
    [chartBindingSession, chartAssetRows, dataSeriesRows, dataSourceRows, setChartAssetRows],
  );

  useEffect(() => {
    return () => {
      if (openDelayTimeoutRef.current != null) {
        clearTimeout(openDelayTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!chartBindingSession) {
      setDesignAppearanceOpen(false);
    }
  }, [chartBindingSession]);

  useEffect(() => {
    return () => {
      if (appearancePatchTimerRef.current != null) {
        window.clearTimeout(appearancePatchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!chartBindingSession && !pulseActive && !isCreating && !designAppearanceOpen) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") return;
      ev.preventDefault();
      if (designAppearanceOpen) {
        setDesignAppearanceOpen(false);
        return;
      }
      if (chartBindingSession) {
        closeChartBindingSession();
        return;
      }
      closeCreation();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    chartBindingSession,
    pulseActive,
    isCreating,
    designAppearanceOpen,
    closeCreation,
    closeChartBindingSession,
  ]);

  useEffect(() => {
    if (isCreating && creationPanelRef.current) {
      creationPanelRef.current.focus();
    }
  }, [isCreating, creationMode]);

  const cornerBracket = (position: Record<string, number | string>) => (
    <Box
      sx={{
        position: "absolute",
        width: 24,
        height: 24,
        borderColor: `${outlineVariant}4d`,
        pointerEvents: "none",
        ...position,
      }}
    />
  );

  const creationCtaButtons = (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.25,
        maxWidth: "100%",
      }}
    >
      <Button
        variant="contained"
        disableElevation
        size="small"
        disabled={isCreating || pulseActive}
        startIcon={<AnalyticsIcon sx={{ fontSize: 18, color: onSecondaryContainer }} />}
        onClick={() => beginCreationAfterPulse("series")}
        sx={floatingActionSx}
      >
        New Series
      </Button>
      <Button
        variant="contained"
        disableElevation
        size="small"
        disabled={isCreating || pulseActive}
        startIcon={<BarChartIcon sx={{ fontSize: 18, color: onSecondaryContainer }} />}
        onClick={() => beginCreationAfterPulse("chart")}
        sx={floatingActionSx}
      >
        New Chart
      </Button>
      <Button
        variant="contained"
        disableElevation
        size="small"
        startIcon={<InputIcon sx={{ fontSize: 18, color: onSecondaryContainer }} />}
        onClick={() => void handleImportData()}
        sx={floatingActionSx}
      >
        Import Data
      </Button>
    </Box>
  );

  return (
    <>
      <Box
      className="workspace-canvas"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 72fr) minmax(0, 28fr)" },
          gridTemplateRows: { lg: "minmax(0, 1fr)" },
          gap: 2,
          alignItems: "stretch",
          width: "100%",
          flex: 1,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
          }}
        >
          <Box
            className={pulseActive ? "canvas-active-pulse" : undefined}
            onAnimationEnd={pulseActive ? handlePulseEnd : undefined}
            sx={{
              position: "relative",
              flex: 1,
              minHeight: { xs: "min(520px, 70vh)", lg: "min(640px, calc(100vh - 200px))" },
              borderRadius: { xs: 2, lg: 0 },
              bgcolor: surfaceContainerLow,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.4,
                pointerEvents: "none",
                ...blueprintGridFine,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.6,
                pointerEvents: "none",
                ...blueprintGrid,
              }}
            />
            {cornerBracket({ top: 16, left: 16, borderTop: "1px solid", borderLeft: "1px solid" })}
            {cornerBracket({ top: 16, right: 16, borderTop: "1px solid", borderRight: "1px solid" })}
            {cornerBracket({ bottom: 16, left: 16, borderBottom: "1px solid", borderLeft: "1px solid" })}
            {cornerBracket({ bottom: 16, right: 16, borderBottom: "1px solid", borderRight: "1px solid" })}

            <Box
              onDragOver={preventDragDefaults}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={onDrop}
              className="drop-receiver"
              sx={{
                position: "relative",
                zIndex: 1,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "flex-start",
                minHeight: 0,
                px: 2,
                pt: 1,
                pb: 3,
                textAlign: "center",
                borderRadius: 1,
                transition: "box-shadow 0.2s ease",
                boxShadow: dragOverCanvas
                  ? `0 0 0 2px ${tokens.colorSelection}, 0 0 0 6px rgba(184, 200, 232, 0.25)`
                  : "none",
                "&:hover .stitch-drop-icon-wrap": {
                  transform: "scale(1.08)",
                },
              }}
            >
              {chartBindingSession ? (
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "auto",
                    width: "100%",
                    mb: 2,
                    textAlign: "left",
                  }}
                >
                  <ChartSeriesBindingPanel
                    chartKind={chartBindingSession.kind}
                    availableSeries={dataSeriesRows}
                    seriesValueResolver={resolveSeriesValues}
                    bindings={chartBindingSession.bindings}
                    onBindingsChange={(next) =>
                      setChartBindingSession((s) => (s ? { ...s, bindings: next } : null))
                    }
                    chartName={chartBindingSession.chartName}
                    onChartNameChange={(chartName) => {
                      setChartSaveError(null);
                      setChartBindingSession((s) => (s ? { ...s, chartName } : null));
                    }}
                    onSave={handleSaveChartFromPanel}
                    saveError={chartSaveError}
                    onHintDataSeriesLedger={triggerDataSeriesLedgerPulse}
                    onOpenDesignAppearance={openDesignAppearance}
                    appearanceSummary={
                      chartBindingSession.appearance
                        ? {
                            widthPx: chartBindingSession.appearance.widthPx,
                            heightPx: chartBindingSession.appearance.heightPx,
                            aspectRatio: chartBindingSession.appearance.aspectRatio,
                          }
                        : null
                    }
                    onClose={closeChartBindingSession}
                  />
                </Box>
              ) : seriesGridOpen ? (
                <>
                  <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", width: "100%", mb: 2 }}>
                    <SeriesGridEditor
                      availableSeries={dataSeriesRows}
                      seriesValueResolver={resolveSeriesValues}
                      onSaveColumn={onSeriesGridSave}
                      gridMaxHeight={440}
                      seriesGridActive={seriesGridOpen}
                      externalSeriesBootstrap={seriesBootstrap}
                      onExternalSeriesBootstrapConsumed={onSeriesBootstrapConsumed}
                      onGridEmptied={onSeriesGridEmptied}
                      autoOpenFormulaForCatalog={formulaAutoOpenBootstrap}
                      onAutoOpenFormulaConsumed={onFormulaAutoOpenConsumed}
                      autoOpenIndexForCatalog={indexAutoOpenBootstrap}
                      onAutoOpenIndexConsumed={onIndexAutoOpenConsumed}
                      indexCreationWizardActive={indexCreationWizardActive}
                      onIndexCreationWizardSessionEnd={onIndexCreationWizardSessionEnd}
                      onIndexCreationWizardCancelled={onIndexCreationWizardCancelled}
                      onAddDataSeries={() => beginCreationAfterPulse("series")}
                    />
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 280,
                    mb: 2,
                  }}
                >
                  <Box
                    className="stitch-drop-icon-wrap"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: surfaceContainerLowest,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      border: `1px solid ${outlineVariant}1a`,
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <AddIcon sx={{ fontSize: 40, color: `${tokens.colorPrimary}66` }} />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: '"Plus Jakarta Sans", "Poppins", sans-serif',
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: `${onSurfaceVariant}b3`,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Drop an asset here or click below to create
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.5,
                      mb: 0,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.6875rem",
                      color: `${onSurfaceVariant}66`,
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                    }}
                  >
                    This is your workspace
                  </Typography>
                  <Box sx={{ mt: 2, width: "100%" }}>{creationCtaButtons}</Box>
                </Box>
              )}

              {dropped.length > 0 && (
                <Box
                  sx={{
                    mt: 2.5,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    justifyContent: "center",
                    maxWidth: "100%",
                  }}
                >
                  {dropped.map((item, i) => (
                    <Chip
                      key={`${item.kind}-${item.name}-${i}`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      label={`Chart: ${item.name}`}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Fade in={isCreating} timeout={100} unmountOnExit>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(2px)",
                  }}
                />
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                    minHeight: 0,
                  }}
                >
                <Grow in={isCreating} timeout={100}>
                  <Paper
                    ref={creationPanelRef}
                    tabIndex={-1}
                    elevation={4}
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      width: "min(100%, min(960px, 92vw))",
                      maxHeight: "min(70vh, 640px)",
                      overflow: "auto",
                      outline: "none",
                      border: `1px solid ${tokens.colorBorder}`,
                    }}
                  >
                    <Box
                      sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        py: 1.5,
                        bgcolor: surfaceContainerLowest,
                        borderBottom: `1px solid ${tokens.colorBorder}`,
                      }}
                    >


                      <Typography variant="h2" component="h2" sx={{ fontSize: "1.25rem", fontWeight: 700, mb: 1 }}>
                        {creationMode === "series" ? "Create New Data Series" : "Create New Chart"}
                      </Typography>
                      <IconButton size="small" aria-label="Close" onClick={closeCreation}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      {creationMode === "series" && (
                        <CreateDataSeriesStepSelect inAuthoringCanvas onSelect={onSeriesSelect} />
                      )}
                      {creationMode === "chart" && (
                        <CreateChartStepSelect inAuthoringCanvas onSelect={onChartSelect} />
                      )}
                    </Box>
                  </Paper>
                </Grow>
                </Box>
              </Box>
            </Fade>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: 0,
            maxHeight: { lg: "calc(100vh - 200px)" },
            overflow: "auto",
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
            Drag any series or chart into the canvas
          </Typography>
          {importError != null && (
            <Typography variant="caption" color="error" sx={{ px: 0.5 }}>
              Import error: {importError}
            </Typography>
          )}
          <Box sx={{ position: "relative", borderRadius: 1 }}>
            {dataSeriesLedgerPulseKey > 0 && (
              <Box
                key={dataSeriesLedgerPulseKey}
                className="canvas-active-pulse"
                onAnimationEnd={handleDataSeriesLedgerPulseEnd}
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 1,
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
            )}
            <Box sx={{ position: "relative", zIndex: 0 }}>
              <DataSeriesTable
                rows={dataSeriesRows}
                draggableSeries
                onAddSeries={() => beginCreationAfterPulse("series")}
                onRenameSeries={renameSeriesInCatalog}
                onDeleteSeries={deleteSeriesFromCatalog}
              />
            </Box>
          </Box>
          <ChartsTable
            rows={chartAssetRows}
            draggableCharts
            onNewChart={() => beginCreationAfterPulse("chart")}
          />
          <DataSourcesTable rows={dataSourceRows} />
          <Box
            sx={{
              px: 0.5,
              py: 1,
              borderRadius: 1,
              border: `1px solid ${outlineVariant}55`,
              bgcolor: surfaceContainerLowest,
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              Bundled schema ({stagedSchema.derivedSeries.length} derived series
              {stagedSchema.charts?.length ? `, ${stagedSchema.charts.length} charts` : ""}) — not in catalog until
              applied.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              disabled={!projectDataLoaded}
              onClick={applyAuthoringSchema}
              sx={{ textTransform: "none", fontSize: "0.75rem" }}
            >
              Apply schema to catalog
            </Button>
          </Box>
        </Box>
      </Box>

      {designAppearanceOpen && chartBindingSession?.appearance && (
        <ChartDesignAppearanceModal
          open={designAppearanceOpen}
          onClose={() => setDesignAppearanceOpen(false)}
          chartKind={chartBindingSession.kind}
          chartName={chartBindingSession.chartName}
          bindings={chartBindingSession.bindings}
          availableSeries={dataSeriesRows}
          seriesValueResolver={resolveSeriesValues}
          appearance={chartBindingSession.appearance}
          onAppearanceChange={handleDesignAppearanceChange}
          onBindingsChange={(next) =>
            setChartBindingSession((s) => (s ? { ...s, bindings: next } : null))
          }
        />
      )}
    </>
  );
}
