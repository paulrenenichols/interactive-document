import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { AppShell } from "./components/AppShell";
import { AuthoringView } from "./components/authoring/AuthoringView";
import { CompSpendByJobFamilyChart } from "./components/CompSpendByJobFamilyChart";
import { DataSeriesTable } from "./components/dataModel/DataSeriesTable";
import { SeriesGridEditor } from "./components/dataModel/SeriesGridEditor";
import { ChartsTable } from "./components/dataModel/ChartsTable";
import { DataSourcesTable } from "./components/dataModel/DataSourcesTable";
import { ChartSeriesBindingPanel } from "./components/dataModel/ChartSeriesBindingPanel";
import { CreateChartStepSelect } from "./components/dataModel/CreateChartStepSelect";
import { CreateDataSeriesStepSelect } from "./components/dataModel/CreateDataSeriesStepSelect";
import {
  CHART_CREATION_KIND_LABEL,
  collectTakenNames,
  suggestUniqueChartName,
} from "./chart/chartDefaultName";
import { createEmptyBindings } from "./chart/chartSlotContracts";
import { HrisDataProvider, useHrisData } from "./data/HrisDataProvider";
import {
  sampleChartAssetRows,
  sampleDataSeriesRows,
  sampleDataSourceRows,
} from "./fixtures/documentAssets";
import type { ChartBindingsState } from "./types/chartBindings";
import type { AppViewMode } from "./types/appView";
import type { ChartCreationKind, SeriesCreationKind } from "./types/dataModel";

function DataLoadingBar() {
  const { loading } = useHrisData();
  if (!loading) return null;
  return (
    <Box sx={{ position: "fixed", top: 48, left: 0, right: 0, zIndex: (t) => t.zIndex.drawer + 2 }}>
      <LinearProgress color="primary" />
    </Box>
  );
}

const creationKindLabel: Record<SeriesCreationKind, string> = {
  index: "Index from series",
  formula: "Formula",
  manual: "Manual entry",
};

function AppContent() {
  const [lastSeriesKind, setLastSeriesKind] = useState<SeriesCreationKind | null>(null);
  const [lastChartKind, setLastChartKind] = useState<ChartCreationKind | null>(null);
  const [chartBindings, setChartBindings] = useState<ChartBindingsState | null>(null);
  const [chartDemoName, setChartDemoName] = useState("");

  useEffect(() => {
    if (lastChartKind != null) {
      setChartBindings(createEmptyBindings(lastChartKind));
      const taken = collectTakenNames({
        series: sampleDataSeriesRows,
        dataSources: sampleDataSourceRows,
        charts: sampleChartAssetRows,
      });
      setChartDemoName(suggestUniqueChartName(lastChartKind, taken));
    } else {
      setChartBindings(null);
      setChartDemoName("");
    }
  }, [lastChartKind]);

  return (
    <>
      <Typography variant="h2" component="h1" sx={{ mb: 2, fontSize: "1.25rem", fontWeight: 700 }}>
        Vertical slice workspace
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
        HRIS data loads automatically from{" "}
        <code style={{ fontSize: "0.85em" }}>public/input-data-files/hris-acme-technologies.csv</code>.
        Use Save state / Load state to persist document title and related JSON snapshots.
      </Typography>

      <Typography variant="overline" sx={{ display: "block", letterSpacing: 1, mb: 1, color: "text.secondary" }}>
        Schema · Data model
      </Typography>
      <Typography variant="h2" component="h2" sx={{ mb: 2, fontSize: "1.125rem", fontWeight: 700 }}>
        Global master ledger
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 4, width: "100%" }}>
        <CreateDataSeriesStepSelect
          onSelect={(kind) => {
            setLastSeriesKind(kind);
            console.info("[series wizard] selected kind:", kind);
          }}
        />
        {lastSeriesKind != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="caption" color="text.secondary">
              Last selected authoring path:
            </Typography>
            <Chip size="small" color="primary" variant="outlined" label={creationKindLabel[lastSeriesKind]} />
          </Box>
        )}
        <CreateChartStepSelect
          onSelect={(kind) => {
            setLastChartKind(kind);
            console.info("[chart wizard] selected chart type:", kind);
          }}
        />
        {lastChartKind != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="caption" color="text.secondary">
              Last selected chart type:
            </Typography>
            <Chip size="small" color="primary" variant="outlined" label={CHART_CREATION_KIND_LABEL[lastChartKind]} />
          </Box>
        )}
        {lastChartKind != null && chartBindings != null && (
          <ChartSeriesBindingPanel
            chartKind={lastChartKind}
            availableSeries={sampleDataSeriesRows}
            bindings={chartBindings}
            onBindingsChange={setChartBindings}
            chartName={chartDemoName}
            onChartNameChange={setChartDemoName}
            onSave={() => console.info("[chart demo] save (no-op)", chartDemoName, chartBindings)}
            saveError={null}
          />
        )}

        <Typography variant="overline" sx={{ display: "block", letterSpacing: 1, mt: 1, color: "text.secondary" }}>
          Workbench · Series grid
        </Typography>
        <Typography variant="h2" component="h2" sx={{ mb: 2, fontSize: "1.125rem", fontWeight: 700 }}>
          Semantic data workbench
        </Typography>
        <Box
          sx={{
            display: { xs: "flex", lg: "grid" },
            flexDirection: { xs: "column" },
            gridTemplateColumns: { lg: "2fr 1fr" },
            gap: 2,
            alignItems: "stretch",
            mb: 3,
          }}
        >
          <SeriesGridEditor
            availableSeries={sampleDataSeriesRows}
            onFormulaEditorOpen={(instanceId) => {
              console.info("[formula editor TBD]", instanceId);
            }}
          />
          <DataSeriesTable rows={sampleDataSeriesRows} draggableSeries />
        </Box>

        <Box
          sx={{
            display: { xs: "flex", lg: "grid" },
            flexDirection: { xs: "column" },
            gridTemplateColumns: { lg: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          <DataSourcesTable rows={sampleDataSourceRows} />
          <DataSeriesTable rows={sampleDataSeriesRows} draggableSeries={lastChartKind != null} />
          <ChartsTable rows={sampleChartAssetRows} />
        </Box>
      </Box>

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Proof chart (HRIS)
      </Typography>
      <CompSpendByJobFamilyChart />
    </>
  );
}

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>("authoring");

  return (
    <HrisDataProvider>
      <AppShell viewMode={viewMode} onViewModeChange={setViewMode}>
        <DataLoadingBar />
        {viewMode === "loose" ? <AppContent /> : <AuthoringView />}
      </AppShell>
    </HrisDataProvider>
  );
}
