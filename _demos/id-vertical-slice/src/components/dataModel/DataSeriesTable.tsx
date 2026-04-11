import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
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
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import StorageIcon from "@mui/icons-material/Storage";
import Tooltip from "@mui/material/Tooltip";
import { tokens } from "../../theme/tokens";
import { DATA_SERIES_DRAG_MIME } from "../../types/chartBindings";
import type { DataSeriesAssetRow } from "../../types/dataModel";

function typeGlyph(valueType: string): string {
  const t = valueType.toLowerCase();
  if (t === "numeric") return "Σ";
  if (t === "text") return "ABC";
  if (t === "boolean") return "T/F";
  if (t === "date") return "📅";
  return "#";
}

function formatLength(n: number): string {
  return n.toLocaleString("en-US");
}

function formatOrigin(origin: string): string {
  if (origin === "imported") return "Imported";
  if (origin === "formula") return "Formula";
  if (origin === "manual") return "Manual";
  return origin;
}

function RoleCell({ role }: { role: string }) {
  if (role === "index") {
    return (
      <Chip label="index" size="small" color="primary" variant="outlined" sx={{ height: 22, fontSize: "0.65rem" }} />
    );
  }
  if (role === "mask") {
    return (
      <Chip label="mask" size="small" color="secondary" variant="outlined" sx={{ height: 22, fontSize: "0.65rem" }} />
    );
  }
  if (role === "none" || !role) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontFeatureSettings: '"tnum" 1' }}>
        —
      </Typography>
    );
  }
  return (
    <Chip label={role} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.65rem" }} />
  );
}

export interface DataSeriesTableProps {
  rows: DataSeriesAssetRow[];
  autoSync?: boolean;
  /** When true, rows become drag sources for chart slot binding (HTML5 DnD). */
  draggableSeries?: boolean;
}

/** Full-width ledger table for global data series (Stitch: “Data Model — Data Series” section). */
export function DataSeriesTable({ rows, autoSync = true, draggableSeries = false }: DataSeriesTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, query]);

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
          <StorageIcon sx={{ color: tokens.colorPrimary, fontSize: 22 }} aria-hidden />
          <Typography variant="subtitle1" fontWeight={700} component="h2">
            Data Series
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search series…"
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
            startIcon={<AddCircleOutlineIcon />}
            sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
          >
            Add Series
          </Button>
          {autoSync && (
            <Chip
              size="small"
              label="AUTO-SYNC: ON"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: "0.65rem" }}
            />
          )}
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
              <TableCell width="10%">Type</TableCell>
              <TableCell width="41%">Name</TableCell>
              <TableCell width="12%">Length</TableCell>
              <TableCell width="22%">Origin</TableCell>
              <TableCell width="15%">Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row, i) => (
              <TableRow
                key={`${row.name}-${i}`}
                hover
                draggable={draggableSeries}
                onDragStart={
                  draggableSeries
                    ? (e) => {
                        e.dataTransfer.setData(DATA_SERIES_DRAG_MIME, row.name);
                        e.dataTransfer.effectAllowed = "copy";
                      }
                    : undefined
                }
                sx={{
                  bgcolor: i % 2 === 0 ? "#ffffff" : tokens.colorSurface,
                  "&:hover": { bgcolor: "rgba(184, 200, 232, 0.35)" },
                  ...(draggableSeries
                    ? { cursor: "grab", "&:active": { cursor: "grabbing" } }
                    : {}),
                }}
              >
                <TableCell sx={{ py: 0.75 }}>
                  <Tooltip title={row.value_type} placement="top">
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: tokens.colorSecondary,
                        fontFeatureSettings: '"tnum" 1',
                      }}
                    >
                      {typeGlyph(row.value_type)}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Tooltip title={row.NOTE ?? row.name}>
                    <Typography variant="body2" noWrap sx={{ fontFeatureSettings: '"tnum" 1' }}>
                      {row.name}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Typography variant="body2" sx={{ fontFeatureSettings: '"tnum" 1' }}>
                    {formatLength(row.length)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatOrigin(row.origin_kind)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <RoleCell role={row.role_kind} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
