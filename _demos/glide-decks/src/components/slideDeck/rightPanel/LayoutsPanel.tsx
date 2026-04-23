import { useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import { useSlideDeck } from "../../../data/SlideDeckContext";
import { useSlideAuthoringShell } from "../../../data/SlideAuthoringShellContext";
import { getDefaultNewSlideLayoutId } from "../../../slideDeck/getDefaultNewSlideLayoutId";
import { precisionLedgerColors } from "../../../slideDeck/precisionLedgerUi";

export function LayoutsPanel() {
  const { layouts, theme, addSlide } = useSlideDeck();
  const { enterLayoutEdit, editingLayoutId } = useSlideAuthoringShell();

  const sorted = useMemo(() => [...layouts].sort((a, b) => a.name.localeCompare(b.name)), [layouts]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <List dense disablePadding sx={{ flex: 1, overflow: "auto", py: 0 }}>
        {sorted.map((layout) => {
          const selected = layout.id === editingLayoutId;
          return (
            <ListItemButton
              key={layout.id}
              selected={selected}
              onClick={() => enterLayoutEdit(layout.id)}
              sx={{
                alignItems: "stretch",
                mb: 1,
                borderRadius: 1,
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  bgcolor: precisionLedgerColors.surfaceContainerLowest,
                  borderRadius: 0.5,
                  border: "1px solid",
                  borderColor: selected ? "primary.main" : "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} textAlign="center" noWrap>
                  {layout.name}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: "100%" }}>
                {layout.description ?? " "}
              </Typography>
            </ListItemButton>
          );
        })}
      </List>

      <Button
        variant="outlined"
        color="primary"
        size="small"
        fullWidth
        startIcon={<AddIcon />}
        onClick={() => addSlide(getDefaultNewSlideLayoutId(theme, layouts))}
        sx={{ flexShrink: 0, mt: 1, fontWeight: 700, textTransform: "none" }}
      >
        Add slide
      </Button>
    </Box>
  );
}
