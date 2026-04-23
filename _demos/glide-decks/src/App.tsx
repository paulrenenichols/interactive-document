import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
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
import { ChartDesignAppearanceModal } from "./components/chartDesign/ChartDesignAppearanceModal";
import { CreateChartStepSelect } from "./components/dataModel/CreateChartStepSelect";
import { CreateDataSeriesStepSelect } from "./components/dataModel/CreateDataSeriesStepSelect";
import {
  CHART_CREATION_KIND_LABEL,
  collectTakenNames,
  suggestUniqueChartName,
} from "./chart/chartDefaultName";
import { mergeAppearanceWithVisualDefaults } from "./chart/chartAppearanceVisual";
import { createDefaultChartAppearanceLayout } from "./chart/chartAppearanceLayout";
import { createEmptyBindings } from "./chart/chartSlotContracts";
import { CHART_NAME_MAX_LENGTH } from "./chart/chartLimits";
import { DocumentDataModelProvider } from "./data/DocumentDataModelContext";
import { SlideDeckProvider } from "./data/SlideDeckContext";
import {
  sampleChartAssetRows,
  sampleDataSeriesRows,
  sampleDataSourceRows,
} from "./fixtures/documentAssets";
import type { ChartBindingsState } from "./types/chartBindings";
import type { AppViewMode } from "./types/appView";
import type { ChartAppearanceLayout, ChartCreationKind, SeriesCreationKind } from "./types/dataModel";

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
  const [chartDesignAppearance, setChartDesignAppearance] = useState<ChartAppearanceLayout | null>(null);
  const [designAppearanceModalOpen, setDesignAppearanceModalOpen] = useState(false);

  useEffect(() => {
    if (lastChartKind != null) {
      setChartBindings(createEmptyBindings(lastChartKind));
      const taken = collectTakenNames({
        series: sampleDataSeriesRows,
        dataSources: sampleDataSourceRows,
        charts: sampleChartAssetRows,
      });
      setChartDemoName(suggestUniqueChartName(lastChartKind, taken));
      setChartDesignAppearance(null);
      setDesignAppearanceModalOpen(false);
    } else {
      setChartBindings(null);
      setChartDemoName("");
      setChartDesignAppearance(null);
      setDesignAppearanceModalOpen(false);
    }
  }, [lastChartKind]);

  const openDesignAppearance = (latestChartName: string) => {
    if (lastChartKind == null || chartBindings == null) return;
    const trimmed = latestChartName.slice(0, CHART_NAME_MAX_LENGTH);
    setChartDemoName(trimmed);
    const name = trimmed.trim() || "Chart";
    setChartDesignAppearance((prev) => {
      if (prev) {
        if (!prev.visual) {
          return mergeAppearanceWithVisualDefaults(prev, lastChartKind, chartBindings, name);
        }
        return prev;
      }
      const layout = createDefaultChartAppearanceLayout(
        lastChartKind,
        Math.max(400, window.innerWidth - 280),
        Math.max(300, window.innerHeight - 160),
      );
      return mergeAppearanceWithVisualDefaults(layout, lastChartKind, chartBindings, name);
    });
    setDesignAppearanceModalOpen(true);
  };

  return (
    <>
      <Typography variant="h2" component="h1" sx={{ mb: 2, fontSize: "1.25rem", fontWeight: 700 }}>
        Vertical slice workspace
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
        This workspace uses fixture JSON for the global ledger and synthetic cell seeds. The proof chart below uses a
        static aggregate snapshot. Authoring view imports the HRIS CSV into the project data model.
        In Authoring view, use Save state / Load state in the app bar to export or import a full project snapshot (catalog
        series, chart assets, and slide deck). The loose workspace below does not use that pipeline; it relies on bundled
        fixtures.
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
            onSave={(name) => console.info("[chart demo] save (no-op)", name, chartBindings)}
            saveError={null}
            onOpenDesignAppearance={openDesignAppearance}
            appearanceSummary={
              chartDesignAppearance
                ? {
                    widthPx: chartDesignAppearance.widthPx,
                    heightPx: chartDesignAppearance.heightPx,
                    aspectRatio: chartDesignAppearance.aspectRatio,
                  }
                : null
            }
          />
        )}

        {lastChartKind != null && chartBindings != null && chartDesignAppearance != null && (
          <ChartDesignAppearanceModal
            open={designAppearanceModalOpen}
            onClose={() => setDesignAppearanceModalOpen(false)}
            chartKind={lastChartKind}
            chartName={chartDemoName}
            bindings={chartBindings}
            availableSeries={sampleDataSeriesRows}
            appearance={chartDesignAppearance}
            onAppearanceChange={setChartDesignAppearance}
            onBindingsChange={setChartBindings}
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
          <SeriesGridEditor availableSeries={sampleDataSeriesRows} />
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
  const [slideDeckPreviewActive, setSlideDeckPreviewActive] = useState(false);

  const handleViewModeChange = (mode: AppViewMode) => {
    setSlideDeckPreviewActive(false);
    setViewMode(mode);
  };

  return (
    <DocumentDataModelProvider viewMode={viewMode}>
      <SlideDeckProvider>
        <AppShell
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          slideDeckPreviewActive={slideDeckPreviewActive}
          onExitSlideDeckPreview={() => setSlideDeckPreviewActive(false)}
        >
          {viewMode === "loose" ? (
            <AppContent />
          ) : (
            <AuthoringView
              slideDeckPreviewActive={slideDeckPreviewActive}
              onSlideDeckPreviewActiveChange={setSlideDeckPreviewActive}
            />
          )}
        </AppShell>
      </SlideDeckProvider>
    </DocumentDataModelProvider>
  );
}
