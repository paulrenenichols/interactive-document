import type { BulletLevel, BulletShape, SlideDeckTheme, TextParagraph } from "../types/slideDeck";

export function bulletCharForShape(shape: BulletShape, customChar?: string): string {
  switch (shape) {
    case "disc":
      return "\u2022";
    case "circle":
      return "\u25cb";
    case "square":
      return "\u25a1";
    case "dash":
      return "\u2014";
    case "arrow":
      return "\u2192";
    case "check":
      return "\u2713";
    case "none":
      return "";
    case "custom":
      return customChar ?? "\u2022";
    default: {
      const _x: never = shape;
      return _x;
    }
  }
}

export function resolveBulletLevel(theme: SlideDeckTheme, indentLevel: 0 | 1 | 2 | 3): BulletLevel {
  if (theme.bullet_config.length === 0) {
    return {
      level: 1,
      shape: "disc",
      size_pt: 12,
      indent_emu: 0,
      hanging_emu: 0,
      space_before_pt: 0,
      space_after_pt: 0,
      font_size_pt: 12,
      font_bold: false,
      font_italic: false,
    };
  }
  const idx = Math.min(indentLevel, theme.bullet_config.length - 1);
  return theme.bullet_config[idx] ?? theme.bullet_config[0]!;
}

export interface ParagraphMarkerInfo {
  /** null means no marker (list_style: none) */
  marker: string | null;
  /** for styling/indent geometry */
  bulletLevel: BulletLevel;
}

/**
 * Compute paragraph list markers consistent with `SlideTextBoxTypography`:
 * - consecutive numbered paragraphs increment
 * - numbering resets when `list_style` becomes `none`
 */
export function computeParagraphMarkers(paragraphs: TextParagraph[], theme: SlideDeckTheme): ParagraphMarkerInfo[] {
  let listNum = 1;
  return paragraphs.map((para) => {
    const ps = para.paragraph_style;
    const bl = resolveBulletLevel(theme, ps.indent_level);

    if (ps.list_style === "bullet") {
      const shape = ps.bullet_override?.shape ?? bl.shape;
      const custom = ps.bullet_override?.custom_char ?? bl.custom_char;
      return { marker: bulletCharForShape(shape, custom), bulletLevel: bl };
    }

    if (ps.list_style === "numbered") {
      const n = ps.numbered_start ?? listNum;
      listNum = n + 1;
      return { marker: `${n}.`, bulletLevel: bl };
    }

    listNum = 1;
    return { marker: null, bulletLevel: bl };
  });
}

