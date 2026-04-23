import { useEffect } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useSlideAuthoringShell } from "../../data/SlideAuthoringShellContext";
import { glassRightPanelSx, slideDeckRightTabSx, precisionLedgerColors } from "../../slideDeck/precisionLedgerUi";
import { DesignPanel } from "./rightPanel/DesignPanel";
import { LayoutsPanel } from "./rightPanel/LayoutsPanel";
import { SlideListPanel } from "./rightPanel/SlideListPanel";

export type RightPanelMode = "slides" | "layouts" | "design";

export interface SlideDeckRightPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelMode: RightPanelMode;
  onPanelModeChange: (mode: RightPanelMode) => void;
}

/**
 * Right slide authoring panel (Slides / Layouts / Design).
 *
 * Uses `hideBackdrop`, `pointer-events: none` on the Modal root (with `auto` on the paper), and
 * focus-related Modal flags so the drawer does **not** block hit-testing on the slide column:
 * clicking the canvas or de-focusing does not auto-close it, supporting WYSIWYG editing with the
 * Design tab staying available. Collapse only via minimize or the edge tab.
 */
export function SlideDeckRightPanel({ open, onOpenChange, panelMode, onPanelModeChange }: SlideDeckRightPanelProps) {
  const { exitToSlideAuthoring } = useSlideAuthoringShell();

  useEffect(() => {
    if (panelMode === "slides") {
      exitToSlideAuthoring();
    }
  }, [panelMode, exitToSlideAuthoring]);

  return (
    <>
      {!open ? (
        <IconButton
          aria-label="Open slide panel"
          aria-expanded={false}
          onClick={() => onOpenChange(true)}
          sx={{
            ...slideDeckRightTabSx,
            color: precisionLedgerColors.secondaryText,
            borderRadius: "8px 0 0 8px",
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      ) : null}

      <Drawer
        anchor="right"
        open={open}
        onClose={() => onOpenChange(false)}
        hideBackdrop
        ModalProps={{
          keepMounted: true,
          disableEscapeKeyDown: true,
          disableEnforceFocus: true,
          disableAutoFocus: true,
          slotProps: {
            root: {
              style: { pointerEvents: "none" },
            },
          },
        }}
        PaperProps={{
          sx: {
            ...glassRightPanelSx,
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
            boxSizing: "border-box",
            zIndex: (theme) => theme.zIndex.snackbar,
            pt: "48px",
          },
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            px: 1.5,
            pt: 1.5,
            pb: 1,
            borderBottom: `1px solid ${precisionLedgerColors.outlineVariant}33`,
            bgcolor: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
            <Tooltip title="Minimize panel" placement="left">
              <IconButton
                aria-label="Minimize slide panel"
                size="medium"
                onClick={() => onOpenChange(false)}
                sx={{
                  color: "primary.main",
                  "& .MuiSvgIcon-root": { fontSize: 22 },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <ToggleButtonGroup
            exclusive
            value={panelMode}
            onChange={(_, v: RightPanelMode | null) => v != null && onPanelModeChange(v)}
            aria-label="Slide panel mode"
            fullWidth
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.7rem",
                px: 0.5,
              },
            }}
          >
            <ToggleButton value="slides">Slides</ToggleButton>
            <ToggleButton value="layouts">Layouts</ToggleButton>
            <ToggleButton value="design">Design</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: 1.5,
            py: 1.5,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {panelMode === "slides" ? <SlideListPanel /> : null}
          {panelMode === "layouts" ? <LayoutsPanel /> : null}
          {panelMode === "design" ? <DesignPanel /> : null}
        </Box>
      </Drawer>
    </>
  );
}
