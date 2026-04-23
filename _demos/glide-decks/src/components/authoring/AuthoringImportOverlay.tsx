import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

export interface AuthoringImportOverlayProps {
  open: boolean;
  fileLabel: string | null;
}

/**
 * Full-screen gray scrim while the authoring CSV import runs (first session visit).
 */
export function AuthoringImportOverlay({ open, fileLabel }: AuthoringImportOverlayProps) {
  if (!open) return null;
  const name = fileLabel ?? "CSV";
  return (
    <Backdrop
      open
      sx={{
        zIndex: (t) => t.zIndex.modal + 2,
        flexDirection: "column",
        gap: 2,
        bgcolor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(2px)",
      }}
    >
      <CircularProgress color="inherit" size={48} />
      <Box sx={{ textAlign: "center", px: 2, maxWidth: 480 }}>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.95)", fontWeight: 600 }}>
          Importing Data from {name}…
        </Typography>
      </Box>
    </Backdrop>
  );
}
