import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SlideDeckTheme } from "../../types/slideDeck";
import { fontHeadline, precisionLedgerColors } from "../../slideDeck/precisionLedgerUi";

export interface ThemeEditorShellProps {
  theme: SlideDeckTheme;
}

/** v1 scaffold for slide master / theme authoring until a full canvas exists. */
export function ThemeEditorShell({ theme }: ThemeEditorShellProps) {
  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
        bgcolor: precisionLedgerColors.surfaceContainerLowest,
      }}
    >
      <Typography
        sx={{
          fontFamily: fontHeadline,
          fontSize: "1.5rem",
          fontWeight: 700,
          color: precisionLedgerColors.onSurface,
          mb: 1,
        }}
      >
        {theme.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Slide master defines theme-wide background, fonts, and optional master shapes. Layouts inherit from this theme.
      </Typography>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Master elements ({theme.master_elements.length})
      </Typography>
      {theme.master_elements.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No master elements yet.
        </Typography>
      ) : (
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          {theme.master_elements.map((el) => (
            <Typography key={el.id} component="li" variant="body2" color="text.secondary">
              {el.element_type}
              {el.locked ? " · locked" : ""}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
