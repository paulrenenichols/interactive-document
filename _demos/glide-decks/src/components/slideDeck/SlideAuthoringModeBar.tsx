import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import type { AuthoringSurface } from "../../data/SlideAuthoringShellContext";
import { fontHeadline, precisionLedgerColors } from "../../slideDeck/precisionLedgerUi";
import { tokens } from "../../theme/tokens";

export interface SlideAuthoringModeBarProps {
  surface: AuthoringSurface;
  /** Current slide label, e.g. "Slide 2 of 5" */
  slideLabel?: string;
  layoutName?: string | null;
  themeName?: string | null;
  onCloseMasterView?: () => void;
}

/**
 * Distinguishes slide vs layout vs theme (slide master) authoring for PowerPoint-familiar scope cues.
 */
export function SlideAuthoringModeBar({
  surface,
  slideLabel,
  layoutName,
  themeName,
  onCloseMasterView,
}: SlideAuthoringModeBarProps) {
  if (surface === "slide") {
    return (
      <Box
        role="region"
        aria-label="Authoring mode"
        sx={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 1,
          bgcolor: precisionLedgerColors.surfaceContainerLowest,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Chip size="small" label="Slide" sx={{ fontWeight: 700, fontFamily: fontHeadline }} />
          {slideLabel ? (
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 600,
                color: precisionLedgerColors.secondaryText,
              }}
            >
              {slideLabel}
            </Typography>
          ) : null}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: "100%" }}>
          Edits apply to this slide only.
        </Typography>
      </Box>
    );
  }

  if (surface === "layout") {
    return (
      <Box
        role="region"
        aria-label="Layout editing mode"
        sx={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 1,
          bgcolor: precisionLedgerColors.surfaceContainerLowest,
          border: "2px solid",
          borderColor: "primary.main",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Chip size="small" color="primary" label="Layout" sx={{ fontWeight: 700, fontFamily: fontHeadline }} />
          <Typography variant="body2" fontWeight={700} color={precisionLedgerColors.onSurface} noWrap sx={{ maxWidth: 240 }}>
            {layoutName ?? "Layout"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="caption" color="text.secondary">
            Edits apply to every slide that uses this layout.
          </Typography>
          {onCloseMasterView ? (
            <Button size="small" variant="contained" color="primary" disableElevation onClick={onCloseMasterView}>
              Close layout view
            </Button>
          ) : null}
        </Box>
      </Box>
    );
  }

  // themeMaster
  return (
    <Box
      role="region"
      aria-label="Slide master editing mode"
      sx={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1,
        px: 2,
        py: 1,
        borderRadius: 1,
        bgcolor: "rgba(13, 21, 38, 0.04)",
        border: "2px solid",
        borderColor: tokens.colorChrome,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
        <Chip
          size="small"
          label="Slide master"
          sx={{
            fontWeight: 700,
            fontFamily: fontHeadline,
            bgcolor: tokens.colorChrome,
            color: "#fff",
          }}
        />
        <Typography variant="body2" fontWeight={700} color={precisionLedgerColors.onSurface} noWrap sx={{ maxWidth: 240 }}>
          {themeName ?? "Theme"}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Typography variant="caption" color="text.secondary">
          Theme-level branding and defaults apply across the deck.
        </Typography>
        {onCloseMasterView ? (
          <Button size="small" variant="contained" disableElevation onClick={onCloseMasterView} sx={{ bgcolor: tokens.colorChrome }}>
            Close master view
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
