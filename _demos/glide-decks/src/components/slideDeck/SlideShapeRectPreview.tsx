import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { ShapeSpec } from "../../types/slideDeck/shape";
import type { SlideDeckTheme } from "../../types/slideDeck";
import { EMU_PER_INCH } from "../../types/slideDeck/constants";
import { resolveFillToCss } from "../../slideDeck/resolveFillToCss";

export interface SlideShapeRectPreviewProps {
  spec: ShapeSpec;
  theme: SlideDeckTheme;
  /** Rendered width/height in CSS px (Phase A sample uses fixed px; layout EMU maps elsewhere). */
  widthPx: number;
  heightPx: number;
}

/**
 * Renders a rectangle / rounded-rectangle shape from slide-deck `ShapeSpec` using theme palette fills.
 */
export function SlideShapeRectPreview({ spec, theme, widthPx, heightPx }: SlideShapeRectPreviewProps) {
  const muiTheme = useTheme();
  const bg = resolveFillToCss(spec.fill, theme.color_palette);

  const borderRadius =
    spec.shape_kind === "rounded_rectangle" && spec.corner_radius_emu != null
      ? `${(spec.corner_radius_emu / EMU_PER_INCH) * 96}px`
      : muiTheme.spacing(0.5);

  return (
    <Box
      sx={{
        width: widthPx,
        height: heightPx,
        bgcolor: bg,
        borderRadius,
        flexShrink: 0,
      }}
    />
  );
}
