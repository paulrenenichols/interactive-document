import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { tokens } from "../../theme/tokens";

/** Placeholder until slide deck authoring is designed. */
export function SlideDeckPlaceholder() {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        width: "100%",
        minHeight: "65vh",
        bgcolor: "#ffffff",
        borderColor: tokens.colorBorder,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
      }}
    >
      <Box sx={{ textAlign: "center", maxWidth: 420 }}>
        <Typography variant="h6" fontWeight={700} color="text.secondary" gutterBottom>
          Slide deck authoring
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Placeholder for the future lightweight presentation-style canvas.
        </Typography>
      </Box>
    </Paper>
  );
}
