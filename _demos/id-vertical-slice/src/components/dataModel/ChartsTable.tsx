import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SearchIcon from "@mui/icons-material/Search";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BarChartIcon from "@mui/icons-material/BarChart";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import StackedBarChartIcon from "@mui/icons-material/StackedBarChart";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { tokens } from "../../theme/tokens";
import { CHART_ASSET_DRAG_MIME } from "../../types/chartBindings";
import type { ChartAssetRow } from "../../types/dataModel";
import Button from "@mui/material/Button";

function ChartTypeIcon({ chartType }: { chartType: string }) {
  const t = chartType.toLowerCase();
  if (t.includes("bubble")) {
    return <BubbleChartIcon sx={{ fontSize: 20, color: tokens.colorPrimary }} />;
  }
  if (t.includes("stacked")) {
    return <StackedBarChartIcon sx={{ fontSize: 20, color: tokens.colorPrimary }} />;
  }
  return <BarChartIcon sx={{ fontSize: 20, color: tokens.colorPrimary }} />;
}

export interface ChartsTableProps {
  rows: ChartAssetRow[];
  /** When true, chart name rows become drag sources for workspace canvas (HTML5 DnD). */
  draggableCharts?: boolean;
}

/** Full-width ledger table for global chart assets (Stitch: “Global Charts” section). */
export function ChartsTable({ rows, draggableCharts = false }: ChartsTableProps) {
  const [query, setQuery] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.chart_type.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const openMenu = (e: React.MouseEvent<HTMLElement>, name: string) => {
    setMenuAnchor(e.currentTarget);
    setMenuRow(name);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        borderColor: tokens.colorBorder,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${tokens.colorBorder}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssessmentIcon sx={{ color: tokens.colorPrimary, fontSize: 22 }} aria-hidden />
          <Typography variant="subtitle1" fontWeight={700} component="h2">
            Charts
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search charts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: tokens.colorSecondary }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: "100%", sm: 220 } }}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddBoxOutlinedIcon />}
            sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
          >
            New chart
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ width: "100%" }}>
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: tokens.colorChrome,
                "& .MuiTableCell-root": {
                  color: "rgba(255,255,255,0.92)",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  py: 1,
                  borderBottom: "none",
                },
              }}
            >
              <TableCell width="10%" align="center">
                Type
              </TableCell>
              <TableCell width="48%">Name</TableCell>
              <TableCell width="26%">Live instances</TableCell>
              <TableCell width="16%" align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row, i) => (
              <TableRow
                key={`${row.name}-${i}`}
                hover
                draggable={draggableCharts}
                onDragStart={
                  draggableCharts
                    ? (e) => {
                        e.dataTransfer.setData(CHART_ASSET_DRAG_MIME, row.name);
                        e.dataTransfer.effectAllowed = "copy";
                      }
                    : undefined
                }
                sx={{
                  bgcolor: i % 2 === 0 ? "#ffffff" : tokens.colorSurface,
                  "&:hover": { bgcolor: "rgba(184, 200, 232, 0.35)" },
                  ...(draggableCharts ? { cursor: "grab" } : {}),
                }}
              >
                <TableCell align="center" sx={{ py: 0.75 }}>
                  <Tooltip title={row.chart_type} placement="top">
                    <Box component="span" sx={{ display: "inline-flex", verticalAlign: "middle" }}>
                      <ChartTypeIcon chartType={row.chart_type} />
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {row.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Typography variant="body2" sx={{ fontFeatureSettings: '"tnum" 1' }}>
                    {row.live_instance_count.toLocaleString("en-US")}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 0.5 }}>
                  <Tooltip title="Actions">
                    <IconButton
                      size="small"
                      aria-label={`Actions for ${row.name}`}
                      onClick={(e) => openMenu(e, row.name)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={closeMenu}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit “{menuRow}”</ListItemText>
        </MenuItem>
        <MenuItem onClick={closeMenu}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
}
