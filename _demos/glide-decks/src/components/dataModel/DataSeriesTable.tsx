import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import StorageIcon from "@mui/icons-material/Storage";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Tooltip from "@mui/material/Tooltip";
import type { SxProps, Theme } from "@mui/material/styles";
import { tokens } from "../../theme/tokens";
import { DATA_SERIES_DRAG_MIME } from "../../types/chartBindings";
import type { DataSeriesAssetRow } from "../../types/dataModel";

/** Locked via colgroup + minWidth so the column does not absorb extra table width. */
const ACTIONS_COL_WIDTH_PX = 30;
const ROLE_COL_MAX_WIDTH_PX = 50;

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

type DataSeriesSortColumn = "type" | "name" | "length" | "origin" | "role";
type SortDirection = "asc" | "desc";

function compareDataSeriesRows(a: DataSeriesAssetRow, b: DataSeriesAssetRow, column: DataSeriesSortColumn): number {
  switch (column) {
    case "type":
      return a.value_type.localeCompare(b.value_type, undefined, { sensitivity: "base" });
    case "name":
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    case "length":
      return a.length - b.length;
    case "origin":
      return String(a.origin_kind).localeCompare(String(b.origin_kind), undefined, { sensitivity: "base" });
    case "role":
      return String(a.role_kind).localeCompare(String(b.role_kind), undefined, { sensitivity: "base" });
    default:
      return 0;
  }
}

/** Source series name for index tooltip: explicit field, else legacy `idx.{name}` prefix. */
function resolveIndexSourceSeriesName(row: DataSeriesAssetRow): string | undefined {
  if (row.index_source_series_name?.trim()) return row.index_source_series_name.trim();
  if (row.name.startsWith("idx.")) return row.name.slice(4);
  return undefined;
}

const sortHeaderInteractiveSx: SxProps<Theme> = {
  cursor: "pointer",
  userSelect: "none",
  outlineOffset: 2,
  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
};

function SortHeaderLabelCell({
  label,
  column,
  width,
  sortColumn,
  sortDirection,
  onSort,
  sx: sxProp,
}: {
  label: string;
  column: DataSeriesSortColumn;
  width?: string;
  sortColumn: DataSeriesSortColumn;
  sortDirection: SortDirection;
  onSort: (column: DataSeriesSortColumn) => void;
  sx?: SxProps<Theme>;
}) {
  const active = sortColumn === column;
  const ariaSort = active ? (sortDirection === "asc" ? "ascending" : "descending") : undefined;
  return (
    <TableCell
      component="th"
      scope="col"
      width={width}
      aria-sort={ariaSort}
      aria-label={active ? `${label}, sorted ${sortDirection === "asc" ? "ascending" : "descending"}` : `${label}, sort`}
      onClick={() => onSort(column)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSort(column);
        }
      }}
      tabIndex={0}
      sx={
        [sortHeaderInteractiveSx, { verticalAlign: "bottom", pb: 0 }, ...(sxProp ? [sxProp] : [])] as SxProps<Theme>
      }
    >
      {label}
    </TableCell>
  );
}

/** Narrow second header row: sort glyph only for the active column (click still toggles sort). */
function SortHeaderIndicatorCell({
  column,
  width,
  sortColumn,
  sortDirection,
  onSort,
  sx: sxProp,
}: {
  column: DataSeriesSortColumn;
  width?: string;
  sortColumn: DataSeriesSortColumn;
  sortDirection: SortDirection;
  onSort: (column: DataSeriesSortColumn) => void;
  sx?: SxProps<Theme>;
}) {
  const active = sortColumn === column;
  return (
    <TableCell
      component="th"
      scope="col"
      width={width}
      onClick={() => onSort(column)}
      tabIndex={-1}
      aria-hidden
      sx={
        [
          sortHeaderInteractiveSx,
          {
            py: 0.2,
            pt: 0,
            verticalAlign: "top",
            textAlign: "left",
            lineHeight: 1,
            fontSize: "0.6rem",
          },
          ...(sxProp ? [sxProp] : []),
        ] as SxProps<Theme>
      }
    >
      {active ? (
        <Typography component="span" sx={{ fontSize: "0.9rem", lineHeight: 1 }} aria-hidden>
          {sortDirection === "asc" ? "▴" : "▾"}
        </Typography>
      ) : (
        <Box component="span" aria-hidden sx={{ display: "block", minHeight: "0.9rem" }} />
      )}
    </TableCell>
  );
}

function RoleCell({
  role,
  indexSourceSeriesName,
}: {
  role: string;
  /** Set when `role === "index"` for tooltip. */
  indexSourceSeriesName?: string;
}) {
  if (role === "index") {
    const source = indexSourceSeriesName?.trim();
    const tooltipTitle = source ? `Index of ${source}` : "Index series";
    const chip = (
      <Chip
        label="i"
        size="small"
        sx={{
          height: 24,
          minWidth: 0,
          maxWidth: "fit-content",
          backgroundColor: tokens.colorPrimary,
          border: "none",
          "& .MuiChip-label": {
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            fontSize: "14px",
            lineHeight: 1,
            color: "rgba(255, 255, 255, 0.97)",
            px: "5px",
            py: "3px",
          },
        }}
      />
    );
    return (
      <Tooltip title={tooltipTitle} placement="top" enterDelay={400}>
        {chip}
      </Tooltip>
    );
  }
  if (role === "mask") {
    return (
      <Tooltip title="Mask" placement="top" enterDelay={400}>
        <Chip
          icon={<FilterAltOutlinedIcon sx={{ fontSize: 18 }} />}
          label=""
          size="small"
          aria-label="Mask"
          sx={{
            height: 24,
            minWidth: 0,
            maxWidth: "fit-content",
            backgroundColor: tokens.colorPrimary,
            border: "none",
            "& .MuiChip-icon": {
              color: "rgba(255, 255, 255, 0.97)",
              marginLeft: "6px",
              marginRight: "6px",
            },
            "& .MuiChip-label": { display: "none", width: 0, p: 0, minWidth: 0 },
          }}
        />
      </Tooltip>
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
  /** Authoring: opens the in-canvas data series creation wizard (e.g. Data Model workspace). */
  onAddSeries?: () => void;
  /**
   * When both rename and delete are provided, a row actions column (menu) is shown.
   * Rename should enforce global uniqueness (typically via DocumentDataModelContext.renameSeriesInCatalog).
   */
  onRenameSeries?: (catalogName: string, newName: string) => { success: boolean; error?: string };
  onDeleteSeries?: (catalogName: string) => void;
}

/** Full-width ledger table for global data series (Stitch: “Data Model — Data Series” section). */
export function DataSeriesTable({
  rows,
  autoSync: _autoSync = true,
  draggableSeries = false,
  onAddSeries,
  onRenameSeries,
  onDeleteSeries,
}: DataSeriesTableProps) {
  const [query, setQuery] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuForName, setMenuForName] = useState<string | null>(null);
  const [editingCatalogName, setEditingCatalogName] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<DataSeriesSortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const showActions = Boolean(onRenameSeries && onDeleteSeries);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, query]);

  const sortedFiltered = useMemo(() => {
    const list = filtered.slice();
    const mult = sortDirection === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const primary = compareDataSeriesRows(a, b, sortColumn);
      if (primary !== 0) return mult * primary;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
    return list;
  }, [filtered, sortColumn, sortDirection]);

  const toggleSort = (column: DataSeriesSortColumn) => {
    if (column === sortColumn) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    if (editingCatalogName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingCatalogName]);

  const openMenu = (e: React.MouseEvent<HTMLElement>, name: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuForName(name);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuForName(null);
  };

  const startRename = (catalogName: string) => {
    closeMenu();
    setEditingCatalogName(catalogName);
    setEditDraft(catalogName);
    setRenameError(null);
  };

  const cancelEdit = () => {
    setEditingCatalogName(null);
    setEditDraft("");
    setRenameError(null);
  };

  const commitRename = () => {
    if (!editingCatalogName || !onRenameSeries) return;
    const next = editDraft.trim();
    if (next === editingCatalogName) {
      cancelEdit();
      return;
    }
    const result = onRenameSeries(editingCatalogName, editDraft);
    if (result.success) {
      cancelEdit();
    } else {
      setRenameError(result.error ?? "Invalid name.");
    }
  };

  const requestDelete = () => {
    if (menuForName) {
      setDeleteTarget(menuForName);
      setDeleteOpen(true);
    }
    closeMenu();
  };

  const confirmDelete = () => {
    if (deleteTarget && onDeleteSeries) {
      onDeleteSeries(deleteTarget);
    }
    setDeleteOpen(false);
    setDeleteTarget(null);
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
            onClick={() => onAddSeries?.()}
          >
            Add Series
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ width: "100%" }}>
        <Table
          size="small"
          sx={{
            tableLayout: "fixed",
            /** Remove theme divider between the two thead rows (keep bottom border on 2nd row only). */
            "& thead .MuiTableRow:first-of-type .MuiTableCell-root:not([rowspan])": {
              borderBottom: "none !important",
            },
            "& thead .MuiTableRow:nth-of-type(2) .MuiTableCell-root": {
              borderTop: "none !important",
            },
          }}
        >
          {showActions && (
            <colgroup>
              <col style={{ width: ACTIONS_COL_WIDTH_PX }} />
            </colgroup>
          )}
          <TableHead>
            <TableRow
              sx={{
                bgcolor: tokens.colorChrome,
                "& .MuiTableCell-root": {
                  color: "rgba(255,255,255,0.92)",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                },
                "& .MuiTableCell-root:not([rowspan])": {
                  borderBottom: "none",
                },
              }}
            >
              {showActions && (
                <TableCell
                  component="th"
                  rowSpan={2}
                  padding="none"
                  sx={{
                    width: ACTIONS_COL_WIDTH_PX,
                    minWidth: ACTIONS_COL_WIDTH_PX,
                    maxWidth: ACTIONS_COL_WIDTH_PX,
                    boxSizing: "border-box",
                    py: 0,
                    verticalAlign: "top",
                    /** Same bottom edge as sort columns (rowspan cell skips the 2nd thead row). */
                    borderBottom: `1px solid ${tokens.colorBorder}`,
                  }}
                  aria-hidden
                />
              )}
              <SortHeaderLabelCell
                label="Type"
                column="type"
                width="9%"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={toggleSort}
              />
              <SortHeaderLabelCell
                label="Name"
                column="name"
                width="38%"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={toggleSort}
              />
              <SortHeaderLabelCell
                label="Length"
                column="length"
                width="11%"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={toggleSort}
              />
              <SortHeaderLabelCell
                label="Origin"
                column="origin"
                width="20%"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={toggleSort}
              />
              <SortHeaderLabelCell
                label="Role"
                column="role"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={toggleSort}
                sx={{ width: ROLE_COL_MAX_WIDTH_PX, maxWidth: ROLE_COL_MAX_WIDTH_PX }}
              />
            </TableRow>
            <TableRow
              sx={{
                bgcolor: tokens.colorChrome,
                "& .MuiTableCell-root": {
                  color: "rgba(255,255,255,0.92)",
                  fontWeight: 700,
                  borderBottom: `1px solid ${tokens.colorBorder}`,
                },
              }}
            >
              <SortHeaderIndicatorCell
                column="type"
                width="9%"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={toggleSort}
              />
              <SortHeaderIndicatorCell
                column="name"
                width="38%"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={toggleSort}
              />
              <SortHeaderIndicatorCell
                column="length"
                width="11%"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={toggleSort}
              />
              <SortHeaderIndicatorCell
                column="origin"
                width="20%"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={toggleSort}
              />
              <SortHeaderIndicatorCell
                column="role"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={toggleSort}
                sx={{ width: ROLE_COL_MAX_WIDTH_PX, maxWidth: ROLE_COL_MAX_WIDTH_PX }}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFiltered.map((row, i) => (
              <TableRow
                key={row.name}
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
                {showActions && (
                  <TableCell
                    padding="none"
                    sx={{
                      width: ACTIONS_COL_WIDTH_PX,
                      minWidth: ACTIONS_COL_WIDTH_PX,
                      maxWidth: ACTIONS_COL_WIDTH_PX,
                      boxSizing: "border-box",
                      verticalAlign: "middle",
                      py: 0,
                      px: 0,
                      overflow: "hidden",
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      size="small"
                      aria-label="Series actions"
                      aria-haspopup="true"
                      onClick={(e) => openMenu(e, row.name)}
                      edge="start"
                      sx={{
                        p: 0,
                        mx: "auto",
                        display: "flex",
                        minWidth: 28,
                        maxWidth: 28,
                        width: 28,
                        height: 28,
                      }}
                    >
                      <MoreVertIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                )}
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
                <TableCell sx={{ py: 0.75, minWidth: 0 }}>
                  {editingCatalogName === row.name ? (
                    <TextField
                      inputRef={nameInputRef}
                      size="small"
                      fullWidth
                      value={editDraft}
                      error={Boolean(renameError)}
                      helperText={renameError ?? undefined}
                      FormHelperTextProps={{ sx: { mt: 0.25, mx: 0 } }}
                      onChange={(e) => {
                        setEditDraft(e.target.value);
                        setRenameError(null);
                      }}
                      onBlur={() => commitRename()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitRename();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                      sx={{ "& .MuiInputBase-root": { fontSize: "0.875rem" } }}
                    />
                  ) : (
                    <Tooltip title={row.NOTE ?? row.name}>
                      <Typography variant="body2" noWrap sx={{ fontFeatureSettings: '"tnum" 1' }}>
                        {row.name}
                      </Typography>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontFeatureSettings: '"tnum" 1' }}>
                      {formatLength(row.length)}
                    </Typography>
                    {row.length === 0 && (
                      <Tooltip title="This series has no rows.">
                        <WarningAmberOutlinedIcon
                          sx={{ fontSize: 18, color: "warning.main", flexShrink: 0 }}
                          aria-label="Empty series"
                        />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatOrigin(row.origin_kind)}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    py: 0.75,
                    maxWidth: ROLE_COL_MAX_WIDTH_PX,
                    width: ROLE_COL_MAX_WIDTH_PX,
                    textAlign: "center",
                    verticalAlign: "middle",
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <RoleCell
                      role={row.role_kind}
                      indexSourceSeriesName={
                        row.role_kind === "index" ? resolveIndexSourceSeriesName(row) : undefined
                      }
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuForName) startRename(menuForName);
          }}
        >
          Rename
        </MenuItem>
        <MenuItem
          onClick={requestDelete}
          sx={{ color: "error.main" }}
        >
          Delete series
        </MenuItem>
      </Menu>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete series?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Delete series &ldquo;{deleteTarget}&rdquo;? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disableElevation>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
