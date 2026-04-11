import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { useHrisData } from "../data/HrisDataProvider";
import { aggregateCompSpendByJobFamily } from "../data/hris";
import { CHART_SERIES_COLORS } from "../theme/theme";

function formatUsdCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

export function CompSpendByJobFamilyChart() {
  const { rows, loading, error } = useHrisData();

  const chartData = useMemo(
    () => aggregateCompSpendByJobFamily(rows, 14),
    [rows],
  );

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Loading chart data…
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper variant="outlined" sx={{ p: 2, borderColor: "error.main" }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.paper" }}>
      <Typography variant="h6" gutterBottom>
        Target total pay by job family (top 14)
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        Sum of &quot;Target Total Pay&quot; from imported HRIS CSV — proof chart for Recharts +
        palette.
      </Typography>
      <Box sx={{ width: "100%", height: 380 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 4, bottom: 64 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#D1D9E6" vertical={false} />
            <XAxis
              dataKey="jobFamily"
              tick={{ fontSize: 11, fill: "#3F6080" }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={70}
            />
            <YAxis
              tickFormatter={(v: number) => formatUsdCompact(v)}
              tick={{ fontSize: 11, fill: "#3F6080" }}
            />
            <Tooltip
              formatter={(value: number | string) => [
                typeof value === "number" ? formatUsdCompact(value) : value,
                "Sum target total pay",
              ]}
              labelFormatter={(label) => String(label)}
              contentStyle={{
                backgroundColor: "rgba(13, 21, 38, 0.95)",
                border: "1px solid #3F6080",
                borderRadius: 4,
                color: "#fff",
                fontSize: 12,
              }}
              labelStyle={{ color: "rgba(255,255,255,0.9)" }}
            />
            <Bar
              dataKey="sumTargetTotalPay"
              name="Sum target total pay"
              fill={CHART_SERIES_COLORS[0]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
