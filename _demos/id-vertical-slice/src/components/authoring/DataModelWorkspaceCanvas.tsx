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
import { SeriesGridEditor } from "../dataModel/SeriesGridEditor";
import {
  chartCreationKindToLedgerType,
  collectTakenNames,
  suggestUniqueChartName,
} from "../../chart/chartDefaultName";
import { CHART_NAME_MAX_LENGTH } from "../../chart/chartLimits";
import { createEmptyBindings, inferChartCreationKindFromChartType } from "../../chart/chartSlotContracts";
import { pickAndReadJsonFile } from "../../state/jsonState";
import { tokens } from "../../theme/tokens";
import {
  readChartNameFromDataTransfer,
  readSeriesNameFromDataTransfer,
} from "../../types/chartBindings";
import {
  sampleChartAssetRows,
  sampleDataSeriesRows,
  sampleDataSourceRows,
} from "../../fixtures/documentAssets";
import type { ChartBindingsState } from "../../types/chartBindings";
import type { ChartAssetRow, ChartCreationKind, SeriesCreationKind } from "../../types/dataModel";

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
  const [dropped, setDropped] = useState<DroppedItem[]>([]);
  /** Global chart ledger (fixture seed + charts saved from the binding panel). */
  const [chartAssetRows, setChartAssetRows] = useState<ChartAssetRow[]>(() => [...sampleChartAssetRows]);
  /** Grid editor is hidden until the user drops a data series onto the canvas. */
  const [seriesGridOpen, setSeriesGridOpen] = useState(false);
  const [seriesBootstrap, setSeriesBootstrap] = useState<{ catalogName: string; nonce: number } | null>(null);
  /** In-canvas chart slot binding (from chart drop on empty canvas or chart type pick in overlay). */
  const [chartBindingSession, setChartBindingSession] = useState<{
    kind: ChartCreationKind;
    bindings: ChartBindingsState;
    chartName: string;
  } | null>(null);
  const [chartSaveError, setChartSaveError] = useState<string | null>(null);
  const [creationMode, setCreationMode] = useState<CreationMode>("none");
  const [pulseActive, setPulseActive] = useState(false);
  const [dragOverCanvas, setDragOverCanvas] = useState(false);
  const openDelayTimeoutRef = useRef<number | null>(null);
  const creationPanelRef = useRef<HTMLDivElement | null>(null);

  const onSeriesBootstrapConsumed = useCallback(() => setSeriesBootstrap(null), []);

  const onSeriesGridEmptied = useCallback(() => {
    setSeriesGridOpen(false);
  }, []);

  const isCreating = creationMode !== "none";

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverCanvas(false);
      const seriesName = readSeriesNameFromDataTransfer(e.dataTransfer);
      if (seriesName) {
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
    [seriesGridOpen, chartAssetRows],
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
      console.info("[import data] loaded JSON snapshot", typeof raw, raw != null ? Object.keys(raw as object) : null);
    } catch {
      /* cancelled */
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

  const closeCreation = useCallback(() => {
    if (openDelayTimeoutRef.current != null) {
      clearTimeout(openDelayTimeoutRef.current);
      openDelayTimeoutRef.current = null;
    }
    setCreationMode("none");
    setPulseActive(false);
  }, []);

  const onSeriesSelect = (kind: SeriesCreationKind) => {
    console.info("[authoring] create data series path:", kind);
    closeCreation();
  };

  const onChartSelect = (kind: ChartCreationKind) => {
    console.info("[authoring] create chart type:", kind);
    closeCreation();
    const taken = collectTakenNames({
      series: sampleDataSeriesRows,
      dataSources: sampleDataSourceRows,
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

  const handleSaveChartFromPanel = useCallback(() => {
    if (!chartBindingSession) return;
    const name = chartBindingSession.chartName.trim();
    if (!name) {
      setChartSaveError("Enter a chart name.");
      return;
    }
    if (name.length > CHART_NAME_MAX_LENGTH) {
      setChartSaveError(`Chart name must be ${CHART_NAME_MAX_LENGTH} characters or fewer.`);
      return;
    }
    const taken = collectTakenNames({
      series: sampleDataSeriesRows,
      dataSources: sampleDataSourceRows,
      charts: chartAssetRows,
    });
    if (taken.has(name)) {
      setChartSaveError("That name is already used by another global asset.");
      return;
    }
    setChartSaveError(null);
    const row: ChartAssetRow = {
      name,
      chart_type: chartCreationKindToLedgerType(chartBindingSession.kind),
      live_instance_count: 0,
      bindings: chartBindingSession.bindings,
    };
    setChartAssetRows((prev) => [...prev, row]);
    setChartBindingSession(null);
  }, [chartBindingSession, chartAssetRows]);

  useEffect(() => {
    return () => {
      if (openDelayTimeoutRef.current != null) {
        clearTimeout(openDelayTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!chartBindingSession && !pulseActive && !isCreating) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") return;
      ev.preventDefault();
      if (chartBindingSession) {
        closeChartBindingSession();
        return;
      }
      closeCreation();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chartBindingSession, pulseActive, isCreating, closeCreation, closeChartBindingSession]);

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
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(0, 1fr)" },
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
              {seriesGridOpen ? (
                <>
                  <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", width: "100%", mb: 2 }}>
                    <SeriesGridEditor
                      availableSeries={sampleDataSeriesRows}
                      gridMaxHeight={440}
                      externalSeriesBootstrap={seriesBootstrap}
                      onExternalSeriesBootstrapConsumed={onSeriesBootstrapConsumed}
                      onGridEmptied={onSeriesGridEmptied}
                      onFormulaEditorOpen={(instanceId) => {
                        console.info("[formula editor TBD]", instanceId);
                      }}
                    />
                  </Box>
                  
                </>
              ) : chartBindingSession ? (
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
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                    <IconButton
                      size="small"
                      aria-label="Close chart binding"
                      onClick={closeChartBindingSession}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <ChartSeriesBindingPanel
                    chartKind={chartBindingSession.kind}
                    availableSeries={sampleDataSeriesRows}
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
                  />
                </Box>
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
          <DataSeriesTable rows={sampleDataSeriesRows} draggableSeries />
          <ChartsTable rows={chartAssetRows} draggableCharts />
          <DataSourcesTable rows={sampleDataSourceRows} />
        </Box>
      </Box>
    </>
  );
}
