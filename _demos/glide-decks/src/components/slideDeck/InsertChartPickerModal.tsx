import BarChartIcon from "@mui/icons-material/BarChart";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import SearchIcon from "@mui/icons-material/Search";
import StackedBarChartIcon from "@mui/icons-material/StackedBarChart";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { tokens } from "../../theme/tokens";
import { useDocumentDataModel } from "../../data/DocumentDataModelContext";
import { precisionLedgerColors } from "../../slideDeck/precisionLedgerUi";

function ChartTypeIcon({ chartType }: { chartType: string }) {
  const t = chartType.toLowerCase();
  if (t.includes("bubble")) {
    return <BubbleChartIcon sx={{ fontSize: 22, color: tokens.colorPrimary }} />;
  }
  if (t.includes("stacked")) {
    return <StackedBarChartIcon sx={{ fontSize: 22, color: tokens.colorPrimary }} />;
  }
  return <BarChartIcon sx={{ fontSize: 22, color: tokens.colorPrimary }} />;
}

export interface InsertChartPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called when user confirms a chart row. */
  onSelectChart: (chartId: string) => void;
}

/**
 * Pick a global chart asset to place on the slide (data model catalog).
 */
export function InsertChartPickerModal({ open, onClose, onSelectChart }: InsertChartPickerModalProps) {
  const { chartAssetRows } = useDocumentDataModel();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chartAssetRows;
    return chartAssetRows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.chart_type.toLowerCase().includes(q),
    );
  }, [chartAssetRows, query]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="insert-chart-dialog-title">
      <DialogTitle id="insert-chart-dialog-title">Insert chart</DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search charts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 1.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
        {chartAssetRows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No charts yet. Create and design charts in the <strong>Data Model</strong> tab, then return here to
            place them on slides.
          </Typography>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 360, overflow: "auto" }}>
            {filtered.map((row) => (
              <ListItemButton
                key={row.id}
                onClick={() => onSelectChart(row.id)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ChartTypeIcon chartType={row.chart_type} />
                </ListItemIcon>
                <ListItemText
                  primary={row.name}
                  secondary={row.chart_type}
                  primaryTypographyProps={{ fontWeight: 600, color: precisionLedgerColors.onSurface }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
        {chartAssetRows.length > 0 && filtered.length === 0 ? (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No charts match your search.
            </Typography>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
