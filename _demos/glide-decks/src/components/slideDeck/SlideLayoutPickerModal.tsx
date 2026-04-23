import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { useSlideDeck } from "../../data/SlideDeckContext";
import { precisionLedgerColors } from "../../slideDeck/precisionLedgerUi";
import { resolveFillToCss } from "../../slideDeck/resolveFillToCss";

export interface SlideLayoutPickerModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal to pick a document theme (strip) and a slide layout (grid). Applying a layout updates the
 * active slide immediately; closing the dialog does not revert.
 */
export function SlideLayoutPickerModal({ open, onClose }: SlideLayoutPickerModalProps) {
  const {
    documentMeta,
    themes,
    layouts,
    slides,
    activeSlideId,
    applyLayoutToSlide,
  } = useSlideDeck();

  const activeSlide = useMemo(
    () => (activeSlideId ? slides.find((s) => s.id === activeSlideId) ?? null : null),
    [activeSlideId, slides],
  );

  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => themes[0]?.id ?? "");

  useEffect(() => {
    if (!open) return;
    const fromSlideLayout = activeSlide
      ? layouts.find((l) => l.id === activeSlide.layout_id)?.theme_id
      : undefined;
    const next =
      fromSlideLayout ??
      documentMeta.default_theme_id ??
      themes[0]?.id ??
      "";
    setSelectedThemeId(next);
  }, [open, activeSlide, layouts, documentMeta.default_theme_id, themes]);

  const layoutsForTheme = useMemo(
    () => layouts.filter((l) => l.theme_id === selectedThemeId).sort((a, b) => a.name.localeCompare(b.name)),
    [layouts, selectedThemeId],
  );

  const handlePickLayout = (layoutId: string) => {
    if (!activeSlideId) return;
    applyLayoutToSlide(activeSlideId, layoutId);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="slide-layout-dialog-title">
      <DialogTitle id="slide-layout-dialog-title">Slide layout</DialogTitle>
      <DialogContent
        sx={{
          pt: 0,
          overflow: "visible",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1.5,
            overflowX: "auto",
            overflowY: "hidden",
            pt: 0.5,
            pb: 1,
            /* Keeps 2px selection border inside the scrollport (outlines were clipped here). */
            px: 1,
          }}
        >
          {themes.map((th) => {
            const bg = resolveFillToCss(th.background_fill, th.color_palette);
            const selected = th.id === selectedThemeId;
            return (
              <Box
                key={th.id}
                component="button"
                type="button"
                onClick={() => setSelectedThemeId(th.id)}
                sx={{
                  flex: "0 0 auto",
                  width: 112,
                  boxSizing: "border-box",
                  border: "2px solid",
                  borderColor: selected ? "primary.main" : "divider",
                  p: 0,
                  cursor: "pointer",
                  bgcolor: "transparent",
                  borderRadius: 1,
                  "&:focus-visible": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    aspectRatio: "16 / 9",
                    width: "100%",
                    borderRadius: 0.5,
                    bgcolor: bg,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    p: 0.5,
                    boxSizing: "border-box",
                  }}
                >
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      color: precisionLedgerColors.onSurface,
                      fontWeight: selected ? 700 : 500,
                      fontSize: "0.65rem",
                      maxWidth: "100%",
                    }}
                  >
                    {th.name}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, fontWeight: 600 }}>
          Themes
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
          Layouts
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 1.5,
            pl: 0.25,
            pr: 0.25,
            pb: 0.5,
          }}
        >
          {layoutsForTheme.map((layout) => {
            const selectedLayout = activeSlide?.layout_id === layout.id;
            return (
              <Box
                key={layout.id}
                component="button"
                type="button"
                disabled={!activeSlideId}
                onClick={() => handlePickLayout(layout.id)}
                sx={{
                  boxSizing: "border-box",
                  border: "2px solid",
                  borderColor: selectedLayout ? "primary.main" : "divider",
                  p: 0,
                  cursor: activeSlideId ? "pointer" : "not-allowed",
                  opacity: activeSlideId ? 1 : 0.5,
                  bgcolor: "transparent",
                  borderRadius: 1,
                  textAlign: "left",
                  "&:focus-visible": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    aspectRatio: "16 / 9",
                    width: "100%",
                    bgcolor: precisionLedgerColors.surfaceContainerLowest,
                    borderRadius: 0.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 1,
                    boxSizing: "border-box",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap sx={{ maxWidth: "100%" }}>
                    {layout.name}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
