import type { ShapeSpec } from "../../types/slideDeck/shape";
import type { SlideDeckTheme } from "../../types/slideDeck/theme";
import { LINE_STROKE_DEFAULTS } from "../../slideDeck/shapeDefaults";
import { svgBorderDashArray, svgLineStrokeDashArray } from "../../slideDeck/shapeSvgStroke";
import { resolveColorToken, resolveFillToCss } from "../../slideDeck/resolveFillToCss";

/** CSS px per typographic point (96 CSS px per inch, 72 pt per inch). */
const PX_PER_PT = 96 / 72;

function borderStrokeAttrs(
  border: ShapeSpec["border"],
  palette: SlideDeckTheme["color_palette"],
): { stroke?: string; strokeWidth?: number; strokeDasharray?: string } {
  if (!border || border.style === "none") return {};
  const stroke = resolveColorToken(border.color, palette);
  const strokeWidth = (border.width_pt * PX_PER_PT) as number;
  const dash = svgBorderDashArray(border.style, Math.max(1, strokeWidth));
  return {
    stroke,
    strokeWidth,
    ...(dash ? { strokeDasharray: dash } : {}),
  };
}

function lineStrokeAttrs(
  ls: NonNullable<ShapeSpec["line_stroke"]>,
  palette: SlideDeckTheme["color_palette"],
): { stroke: string; strokeWidth: number; strokeLinecap: "butt" | "round" | "square"; strokeDasharray?: string } {
  const stroke = resolveColorToken(ls.color, palette);
  const strokeWidth = (ls.weight_pt * PX_PER_PT) as number;
  const dash = svgLineStrokeDashArray(ls.style, Math.max(1, strokeWidth));
  return {
    stroke,
    strokeWidth,
    strokeLinecap: ls.cap,
    ...(dash ? { strokeDasharray: dash } : {}),
  };
}

/** Filled chevron / double-chevron in local box coordinates. */
function arrowPolygonPoints(
  W: number,
  H: number,
  lineStart: ShapeSpec["line_start"],
  lineEnd: ShapeSpec["line_end"],
): string {
  const hd = W * 0.28;
  const sw = H * 0.38;
  const sy = (H - sw) / 2;
  const mid = H / 2;
  const startOn = lineStart?.marker === "arrow" || lineStart?.marker === "arrow_open";
  const endOn = lineEnd?.marker === "arrow" || lineEnd?.marker === "arrow_open";

  if (startOn && endOn) {
    return `${0},${mid} ${hd},${sy} ${W - hd},${sy} ${W},${mid} ${W - hd},${sy + sw} ${hd},${sy + sw}`;
  }
  if (endOn && !startOn) {
    return `0,${sy} ${W - hd},${sy} ${W},${mid} ${W - hd},${sy + sw} 0,${sy + sw}`;
  }
  if (startOn && !endOn) {
    return `${W},${sy} ${hd},${sy} 0,${mid} ${hd},${sy + sw} ${W},${sy + sw}`;
  }
  return `0,0 ${W},0 ${W},${H} 0,${H}`;
}

export function SlideShapeSvg({
  spec,
  theme,
  widthPx,
  heightPx,
  pxPerEmu,
}: {
  spec: ShapeSpec;
  theme: SlideDeckTheme;
  widthPx: number;
  heightPx: number;
  pxPerEmu: number;
}) {
  const W = Math.max(0, widthPx);
  const H = Math.max(0, heightPx);
  const palette = theme.color_palette;
  const fillColor = resolveFillToCss(spec.fill, palette);
  const fillOpacity = spec.fill.opacity ?? 1;
  const borderAttrs = borderStrokeAttrs(spec.border, palette);

  const commonFill = {
    fill: spec.fill.kind === "none" ? "none" : fillColor,
    fillOpacity: spec.fill.kind === "none" ? undefined : fillOpacity,
  };

  const strokeJoin = { strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

  const rx =
    spec.shape_kind === "rounded_rectangle" && spec.corner_radius_emu != null
      ? Math.min(spec.corner_radius_emu * pxPerEmu, W / 2, H / 2)
      : 0;

  const svgProps = {
    width: "100%" as const,
    height: "100%" as const,
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "none" as const,
    style: { display: "block" as const },
  };

  switch (spec.shape_kind) {
    case "rectangle":
    case "rounded_rectangle":
      return (
        <svg {...svgProps}>
          <rect
            x={0}
            y={0}
            width={W}
            height={H}
            rx={rx}
            ry={rx}
            {...commonFill}
            {...borderAttrs}
            {...strokeJoin}
          />
        </svg>
      );
    case "circle": {
      const r = Math.min(W, H) / 2;
      return (
        <svg {...svgProps}>
          <circle cx={W / 2} cy={H / 2} r={r} {...commonFill} {...borderAttrs} {...strokeJoin} />
        </svg>
      );
    }
    case "ellipse":
      return (
        <svg {...svgProps}>
          <ellipse cx={W / 2} cy={H / 2} rx={W / 2} ry={H / 2} {...commonFill} {...borderAttrs} {...strokeJoin} />
        </svg>
      );
    case "triangle":
      return (
        <svg {...svgProps}>
          <polygon points={`${W / 2},0 ${W},${H} 0,${H}`} {...commonFill} {...borderAttrs} {...strokeJoin} />
        </svg>
      );
    case "line": {
      const ls = spec.line_stroke ?? LINE_STROKE_DEFAULTS;
      const la = lineStrokeAttrs(ls, palette);
      return (
        <svg {...svgProps}>
          <line x1={0} y1={H / 2} x2={W} y2={H / 2} fill="none" {...la} />
        </svg>
      );
    }
    case "arrow": {
      const pts = arrowPolygonPoints(W, H, spec.line_start, spec.line_end);
      return (
        <svg {...svgProps}>
          <polygon points={pts} {...commonFill} {...borderAttrs} {...strokeJoin} />
        </svg>
      );
    }
    case "parallelogram":
    case "diamond":
    case "custom_polygon": {
      if (spec.shape_kind === "custom_polygon" && spec.path_data) {
        const vb = spec.path_viewbox ?? `0 0 ${W} ${H}`;
        return (
          <svg width="100%" height="100%" viewBox={vb} preserveAspectRatio="none" style={{ display: "block" }}>
            <path d={spec.path_data} {...commonFill} {...borderAttrs} {...strokeJoin} />
          </svg>
        );
      }
      return (
        <svg {...svgProps}>
          <rect x={0} y={0} width={W} height={H} {...commonFill} {...borderAttrs} {...strokeJoin} />
        </svg>
      );
    }
  }
}
