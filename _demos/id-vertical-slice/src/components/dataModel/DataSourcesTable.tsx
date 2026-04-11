import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import { tokens } from "../../theme/tokens";
import type { DataSourceRow } from "../../types/dataModel";

const CSV_SENTINEL = "__csv_default__";

function formatInt(n: number): string {
  return n.toLocaleString("en-US");
}

function sourceSubtitle(row: DataSourceRow): string {
  if (row.provenance_kind === "external_sql") {
    const a = row.connection_label ?? "";
    const b = row.query_label ?? "";
    return [a, b].filter(Boolean).join(" · ");
  }
  const file = row.file_display_name ?? "";
  const sheet =
    !row.sheet_name || row.sheet_name === CSV_SENTINEL ? "—" : row.sheet_name;
  return [file, sheet].filter((x) => x !== "").join(" · ");
}

function SourceTypeCell({ row }: { row: DataSourceRow }) {
  if (row.provenance_kind === "external_sql") {
    return (
      <Tooltip title="External SQL / gateway" placement="top">
        <CloudOutlinedIcon sx={{ fontSize: 22, color: tokens.colorPrimary }} aria-hidden />
      </Tooltip>
    );
  }
  const isXlsx = row.file_format === "xlsx";
  const title = isXlsx ? "Flat file (Excel)" : "Flat file (CSV)";
  const Icon = isXlsx ? TableChartOutlinedIcon : InsertDriveFileOutlinedIcon;
  return (
    <Tooltip title={title} placement="top">
      <Icon sx={{ fontSize: 22, color: tokens.colorPrimary }} aria-hidden />
    </Tooltip>
  );
}

export interface DataSourcesTableProps {
  rows: DataSourceRow[];
}

/**
 * DATA SOURCES panel — Stitch: Data Model · Triple Asset Panel Layout (first column).
 * Matches Data Series / Global Charts ledger styling (semantic spec §4.6).
 */
export function DataSourcesTable({ rows }: DataSourcesTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [
        r.display_name,
        r.file_display_name,
        r.connection_label,
        r.query_label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        minWidth: 0,
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
          <Box
            component="span"
            className="material-symbols-outlined"
            aria-hidden
            sx={{
              fontSize: 22,
              lineHeight: 1,
              color: tokens.colorPrimary,
              fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
            }}
          >
            database
          </Box>
          <Typography variant="subtitle1" fontWeight={700} component="h2">
            Data Sources
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search sources…"
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
            Add source
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
              <TableCell width="14%">Type</TableCell>
              <TableCell width="34%">Name</TableCell>
              <TableCell width="14%" align="right">
                Rows
              </TableCell>
              <TableCell width="14%" align="right">
                Fields
              </TableCell>
              <TableCell width="24%" align="right">
                Size (KB)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row, i) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  bgcolor: i % 2 === 0 ? "#ffffff" : tokens.colorSurface,
                  "&:hover": { bgcolor: "rgba(184, 200, 232, 0.35)" },
                }}
              >
                <TableCell sx={{ py: 0.75 }}>
                  <SourceTypeCell row={row} />
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Tooltip title={row.display_name}>
                    <Typography variant="body2" noWrap sx={{ fontFeatureSettings: '"tnum" 1' }}>
                      {row.display_name}
                    </Typography>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary" display="block" noWrap>
                    {sourceSubtitle(row)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 0.75 }}>
                  <Typography variant="body2" sx={{ fontFeatureSettings: '"tnum" 1' }}>
                    {formatInt(row.row_count)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 0.75 }}>
                  <Typography variant="body2" sx={{ fontFeatureSettings: '"tnum" 1' }}>
                    {formatInt(row.field_count)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 0.75 }}>
                  <Typography variant="body2" sx={{ fontFeatureSettings: '"tnum" 1' }}>
                    {formatInt(row.estimated_memory_kb)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
