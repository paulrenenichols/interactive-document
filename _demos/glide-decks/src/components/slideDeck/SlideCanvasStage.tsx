import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { SLIDE_CANVAS_SCALE, precisionLedgerColors, slideCardShadow } from "../../slideDeck/precisionLedgerUi";

export interface SlideCanvasStageProps {
  children: ReactNode;
}

/** 16:9 slide card — full width of parent column (max width set by SlideDeckWorkspace). */
export function SlideCanvasStage({ children }: SlideCanvasStageProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        width: "100%",
        pt: 0,
        pb: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          aspectRatio: "16 / 9",
          bgcolor: precisionLedgerColors.surfaceContainerLowest,
          borderRadius: 0.5,
          boxShadow: slideCardShadow,
          overflow: "hidden",
          transform: `scale(${SLIDE_CANVAS_SCALE})`,
          transformOrigin: "top center",
        }}
        className="slide-canvas-stage"
      >
        {children}
      </Box>
    </Box>
  );
}
