import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { CSSProperties } from "react";
import { mergeTextRunStyle, textRunStyleToCss } from "../../slideDeck/placeholderTypography";
import { listMarkerGutterPx } from "../../slideDeck/listMarkerGutterPx";
import { paragraphPaddingLeftPx } from "../../slideDeck/listParagraphLayoutPx";
import { computeParagraphMarkers, resolveBulletLevel } from "../../slideDeck/textParagraphMarkers";
import { resolveSpecialRunKind, type SpecialRunResolutionContext } from "../../slideDeck/specialRuns";
import { emuToPx } from "../../slideDeck/units";
import type { SlideDeckTheme, TextBoxSpec, TextParagraph, TextRun } from "../../types/slideDeck";

export interface SlideTextBoxTypographyProps {
  spec: TextBoxSpec;
  theme: SlideDeckTheme;
  pxPerEmu: number;
  specialCtx: SpecialRunResolutionContext;
}

/** Uses `specialCtx` for dynamic runs; merges with run.text fallback. */
function renderRunWithCtx(
  run: TextRun,
  defaultStyle: TextBoxSpec["default_style"],
  theme: SlideDeckTheme,
  ctx: SpecialRunResolutionContext,
): React.ReactNode {
  const merged = mergeTextRunStyle(defaultStyle ?? {}, run.style);
  const css = textRunStyleToCss(merged, theme) as CSSProperties;
  if (run.special) {
    const t = resolveSpecialRunKind(run.special, ctx);
    return (
      <span key={run.id} style={css}>
        {t || run.text}
      </span>
    );
  }
  return (
    <span key={run.id} style={css}>
      {run.text || null}
    </span>
  );
}

export function SlideTextBoxTypography({ spec, theme, pxPerEmu, specialCtx }: SlideTextBoxTypographyProps) {
  const defaultStyle = spec.default_style ?? {};
  const markers = computeParagraphMarkers(spec.paragraphs, theme);

  const rows = spec.paragraphs.map((para: TextParagraph, pi: number) => {
    const ps = para.paragraph_style;
    const list = ps.list_style;
    const bl = resolveBulletLevel(theme, ps.indent_level);
    const indentPx = emuToPx(bl.indent_emu, pxPerEmu);
    const marker = markers[pi]?.marker ?? null;
    const gutterPx =
      marker !== null ? listMarkerGutterPx({ hangingEmu: bl.hanging_emu, marker, bulletLevel: bl, pxPerEmu }) : 0;

    const textAlign = ps.alignment;

    const content = (
      <Box
        component="span"
        sx={{
          display: "inline",
          textAlign,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {para.runs.map((r) => renderRunWithCtx(r, defaultStyle, theme, specialCtx))}
      </Box>
    );

    if (list === "none") {
      return (
        <Box
          key={para.id}
          component="div"
          sx={{
            pl: `${paragraphPaddingLeftPx(ps, bl, pxPerEmu)}px`,
            textAlign,
            m: 0,
            lineHeight: ps.line_spacing * 1.5,
          }}
        >
          {content}
        </Box>
      );
    }

    return (
      <Box
        key={para.id}
        component="div"
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          pl: `${Math.max(0, indentPx - gutterPx)}px`,
          textAlign: "left",
          m: 0,
          lineHeight: ps.line_spacing * 1.5,
        }}
      >
        <Typography
          component="span"
          variant="body2"
          sx={{
            flex: "0 0 auto",
            width: `${gutterPx}px`,
            minWidth: `${gutterPx}px`,
            textAlign: "right",
            whiteSpace: "nowrap",
            fontSize: `${(bl.font_size_pt * 96) / 72}px`,
            userSelect: "none",
          }}
        >
          {marker}
        </Typography>
        <Box sx={{ flex: "1 1 auto", minWidth: 0, textAlign }}>{content}</Box>
      </Box>
    );
  });

  return (
    <Typography
      component="div"
      variant="body2"
      sx={{
        cursor: "text",
        width: "100%",
        minHeight: "1em",
      }}
    >
      {rows.length > 0 ? rows : "\u00a0"}
    </Typography>
  );
}
