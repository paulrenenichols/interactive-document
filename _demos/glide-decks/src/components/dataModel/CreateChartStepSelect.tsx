import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import BarChartIcon from "@mui/icons-material/BarChart";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import MultilineChartIcon from "@mui/icons-material/MultilineChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StackedBarChartIcon from "@mui/icons-material/StackedBarChart";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { tokens } from "../../theme/tokens";
import type { ChartCreationKind } from "../../types/dataModel";

type PathEntry = {
  kind: ChartCreationKind;
  title: string;
  description: string;
  Icon: typeof BarChartIcon;
  iconSx?: object;
};

/** Stitch screen “Data Model - New Chart 60% Width” / Chart Gallery order and copy. */
const PATHS: PathEntry[] = [
  {
    kind: "v_bar_cluster",
    title: "V Bar Cluster",
    description: "Categorical comparison — compare values across discrete categories on the vertical axis.",
    Icon: BarChartIcon,
  },
  {
    kind: "v_bar_stacked",
    title: "V Bar Stacked",
    description: "Part-to-whole vertical — show composition and totals within each category.",
    Icon: StackedBarChartIcon,
  },
  {
    kind: "h_bar_cluster",
    title: "H Bar Cluster",
    description: "Ranking layout — compare categories along a horizontal baseline, ideal for long labels.",
    Icon: BarChartIcon,
    iconSx: { transform: "rotate(-90deg)" },
  },
  {
    kind: "h_bar_stacked",
    title: "H Bar Stacked",
    description: "Relative volume — stacked segments read left-to-right for share and total.",
    Icon: StackedBarChartIcon,
    iconSx: { transform: "rotate(-90deg)" },
  },
  {
    kind: "line_1d",
    title: "1D Line",
    description: "Temporal sequence — trend a measure over an ordered dimension (often time).",
    Icon: ShowChartIcon,
  },
  {
    kind: "line_2d",
    title: "2D Line",
    description: "Multi-variable trend — multiple series over the same domain for comparison.",
    Icon: MultilineChartIcon,
  },
  {
    kind: "scatter",
    title: "Scatter",
    description: "Correlation node — plot paired numeric values to spot relationships and clusters.",
    Icon: ScatterPlotIcon,
  },
  {
    kind: "bubble",
    title: "Bubble",
    description: "3D value mapping — x, y, and size encode three numeric dimensions.",
    Icon: BubbleChartIcon,
  },
  {
    kind: "pie",
    title: "Pie",
    description: "Static distribution — show share of a whole for a single snapshot.",
    Icon: PieChartIcon,
  },
  {
    kind: "donut",
    title: "Donut",
    description: "Proportional metric — like a pie with a clear center for labels or KPI context.",
    Icon: DonutLargeIcon,
  },
];

export interface CreateChartStepSelectProps {
  onSelect: (kind: ChartCreationKind) => void;
  /** When true (authoring canvas overlay), omit outer card chrome and use a wide fluid grid. */
  inAuthoringCanvas?: boolean;
}

/** Step 1 — choose chart type (Stitch: Data Model · New Chart 60% Width, card gallery). */
export function CreateChartStepSelect({
  onSelect,
  inAuthoringCanvas = false,
}: CreateChartStepSelectProps) {
  const introMaxWidth = inAuthoringCanvas ? "100%" : 720;
  const gridColumns = inAuthoringCanvas
    ? { xs: "repeat(auto-fill, minmax(240px, 1fr))" }
    : { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" };

  const body = (
    <>
      {!inAuthoringCanvas && (
        <Typography variant="h2" component="h2" sx={{ fontSize: "1.25rem", fontWeight: 700, mb: 1 }}>
          Create New Chart
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: introMaxWidth }}>
        Charts are reusable global assets: pick a type, bind compatible data series, then name and
        refine the chart. Placements on slides reference this definition without duplicating logic.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: gridColumns,
          gap: 2,
        }}
      >
        {PATHS.map(({ kind, title, description, Icon, iconSx }) => (
          <ButtonBase
            key={kind}
            focusRipple
            onClick={() => onSelect(kind)}
            aria-label={`${title}. ${description}`}
            sx={{
              display: "block",
              width: "100%",
              textAlign: "left",
              borderRadius: 1,
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: "100%",
                minHeight: 140,
                borderColor: tokens.colorBorder,
                bgcolor: "#ffffff",
                transition: "background-color 150ms ease-out, box-shadow 150ms ease-out",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                "&:hover": {
                  bgcolor: "rgba(184, 200, 232, 0.35)",
                  boxShadow: `0 0 0 1px ${tokens.colorPrimary}33`,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: "rgba(232, 71, 42, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ color: tokens.colorPrimary, fontSize: 22, ...iconSx }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {description}
                  </Typography>
                </Box>
                <ChevronRightIcon sx={{ color: tokens.colorSecondary, flexShrink: 0, mt: 0.25 }} aria-hidden />
              </Box>
            </Paper>
          </ButtonBase>
        ))}
      </Box>
    </>
  );

  if (inAuthoringCanvas) {
    return (
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          alignSelf: "stretch",
        }}
      >
        <Box sx={{ width: "100%", minWidth: 0 }}>{body}</Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", md: "60%" },
        minWidth: 0,
        alignSelf: "flex-start",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          p: 2,
          bgcolor: "background.paper",
          borderColor: tokens.colorBorder,
        }}
      >
        {body}
      </Paper>
    </Box>
  );
}
