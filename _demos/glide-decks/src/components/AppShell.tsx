import { useState, type ReactNode } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";
import MenuIcon from "@mui/icons-material/Menu";
import CheckIcon from "@mui/icons-material/Check";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { pickAndReadJsonFile, saveProjectSnapshotToFile } from "../state/jsonState";
import { AppDocumentProvider } from "../state/AppDocumentContext";
import { defaultAppState, parseAppState, type AppState } from "../state/appState";
import { useDocumentDataModel } from "../data/DocumentDataModelContext";
import { useSlideDeck } from "../data/SlideDeckContext";
import {
  isProjectSnapshotShape,
  parseProjectSnapshot,
  serializeProjectSnapshot,
} from "../state/projectSnapshot";
import type { AppViewMode } from "../types/appView";
import { tokens } from "../theme/tokens";

export interface AppShellProps {
  children: ReactNode;
  viewMode: AppViewMode;
  onViewModeChange: (mode: AppViewMode) => void;
  /** When true (authoring + slide deck preview), main content is full-bleed and an exit control is shown. */
  slideDeckPreviewActive?: boolean;
  onExitSlideDeckPreview?: () => void;
}

export function AppShell({
  children,
  viewMode,
  onViewModeChange,
  slideDeckPreviewActive = false,
  onExitSlideDeckPreview,
}: AppShellProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [appState, setAppState] = useState<AppState>(defaultAppState);

  const {
    dataSeriesRows,
    valuesBySeriesName,
    dataSourceRows,
    chartAssetRows,
    hydrateDataModel,
  } = useDocumentDataModel();
  const { documentMeta, theme, layouts, slides, activeSlideId, hydrateSlideDeck } = useSlideDeck();

  const handleSaveState = () => {
    const snapshot = serializeProjectSnapshot({
      documentTitle: appState.documentTitle,
      dataSeriesRows,
      dataSourceRows,
      chartAssetRows,
      valuesBySeriesName,
      documentMeta,
      theme,
      layouts,
      slides,
      activeSlideId,
    });
    saveProjectSnapshotToFile(snapshot);
  };

  const handleLoadState = async () => {
    try {
      const raw = await pickAndReadJsonFile();
      if (isProjectSnapshotShape(raw)) {
        const snap = parseProjectSnapshot(raw);
        hydrateDataModel(snap.dataModel);
        hydrateSlideDeck(snap.slideDeck);
        setAppState((s) => ({ ...s, documentTitle: snap.app.documentTitle }));
      } else {
        setAppState(parseAppState(raw));
      }
    } catch {
      /* user cancelled, invalid JSON, or invalid snapshot — ignore */
    }
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(e.currentTarget);
  };

  const closeMenu = () => setMenuAnchor(null);

  const selectView = (mode: AppViewMode) => {
    onViewModeChange(mode);
    closeMenu();
  };

  const showExitPreview =
    viewMode === "authoring" && slideDeckPreviewActive && onExitSlideDeckPreview != null;
  const disableMainPadding = showExitPreview;

  return (
    <AppDocumentProvider documentTitle={appState.documentTitle}>
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar disableGutters variant="dense" sx={{ minHeight: 48, px: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={openMenu}
            sx={{ mr: 1 }}
            aria-label="Open view menu"
            aria-controls={menuAnchor ? "app-view-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuAnchor ? "true" : undefined}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="app-view-menu"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <MenuItem
              onClick={() => selectView("loose")}
              selected={viewMode === "loose"}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {viewMode === "loose" ? <CheckIcon fontSize="small" /> : <Box sx={{ width: 24 }} />}
              </ListItemIcon>
              <ListItemText primary="Loose Components View" />
            </MenuItem>
            <MenuItem
              onClick={() => selectView("authoring")}
              selected={viewMode === "authoring"}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {viewMode === "authoring" ? <CheckIcon fontSize="small" /> : <Box sx={{ width: 24 }} />}
              </ListItemIcon>
              <ListItemText primary="Authoring View" />
            </MenuItem>
          </Menu>
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.7, display: { xs: "none", sm: "block" } }}>
            Glide Decks
          </Typography>
          <TextField
            value={appState.documentTitle}
            onChange={(e) =>
              setAppState((s) => ({ ...s, documentTitle: e.target.value }))
            }
            variant="standard"
            InputProps={{
              disableUnderline: false,
              sx: {
                color: "inherit",
                fontWeight: 700,
                fontSize: "1rem",
                "&:before": { borderBottomColor: "rgba(255,255,255,0.25)" },
                "&:hover:before": { borderBottomColor: "rgba(255,255,255,0.5)" },
              },
            }}
            sx={{ flex: 1, minWidth: 120, maxWidth: 480 }}
            aria-label="Document title"
          />
          
          <Box sx={{ flexGrow: 1 }} />
          {showExitPreview ? (
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              onClick={onExitSlideDeckPreview}
              sx={{
                mr: 1,
                flexShrink: 0,
                color: tokens.colorPrimary,
                borderColor: tokens.colorPrimary,
                borderWidth: 1,
                bgcolor: "transparent",
                "&:hover": {
                  color: tokens.colorPrimary,
                  borderColor: tokens.colorPrimary,
                  bgcolor: "rgba(232, 71, 42, 0.12)",
                },
              }}
              aria-label="Exit slide preview"
            >
              Exit preview
            </Button>
          ) : null}
          <Tooltip title="Save project snapshot (data model + slide deck) as JSON">
            <Button
              color="inherit"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSaveState}
              sx={{ mr: 1 }}
            >
              Save state
            </Button>
          </Tooltip>
          <Tooltip title="Load project snapshot from JSON (legacy title-only files still update the title)">
            <Button
              color="inherit"
              size="small"
              startIcon={<UploadFileIcon />}
              onClick={() => void handleLoadState()}
            >
              Load state
            </Button>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="main"

        sx={{
          flex: 1,
          mt: "48px",
          minHeight: "calc(100% - 48px)",
          width: "100%",
          minWidth: 0,
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: disableMainPadding ? 0 : 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            minWidth: 0,
          }}
          className="app-body"
        >
          {children}
        </Box>
      </Box>
    </Box>
    </AppDocumentProvider>
  );
}
