import type { BorderSpec } from "./shape";
import type { FillSpec } from "./fill";
import type { EdgeInsets } from "./shape";

/** slide-deck-spec §4.4 */
export type BulletShape =
  | "disc"
  | "circle"
  | "square"
  | "dash"
  | "arrow"
  | "check"
  | "none"
  | "custom";

export interface BulletLevel {
  level: 1 | 2 | 3 | 4;
  shape: BulletShape;
  custom_char?: string;
  color?: string;
  size_pt: number;
  indent_emu: number;
  /**
   * Minimum width (in EMU) of the list marker column before the paragraph body.
   * Renderers expand the reserved gutter when the marker is wider (`listMarkerGutterPx` in `src/slideDeck`).
   */
  hanging_emu: number;
  space_before_pt: number;
  space_after_pt: number;
  font_size_pt: number;
  font_bold: boolean;
  font_italic: boolean;
}

/**
 * slide-deck-spec §7.3 — dynamic text runs.
 *
 * - `document_title`: Resolved from the app **document name** (same field as the app bar and `AppState.documentTitle` in saved JSON); updates live in authoring when the user renames the document.
 */
export type SpecialRunKind =
  | "slide_number"
  | "total_slides"
  | "slide_number_of_total"
  | "date_auto"
  | "date_fixed"
  | "document_title"
  | "section_title";

export interface TextRunStyle {
  font_family?: string;
  font_size_pt?: number;
  /** When set, used as CSS `font-weight` (overrides `bold` boolean for authoring). */
  font_weight?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  highlight_color?: string;
  baseline?: "normal" | "super" | "sub";
  link_url?: string;
}

export interface ParagraphStyle {
  alignment: "left" | "center" | "right" | "justify";
  indent_level: 0 | 1 | 2 | 3;
  space_before_pt: number;
  space_after_pt: number;
  line_spacing: number;
  bullet_override?: BulletLevel;
  list_style: "none" | "bullet" | "numbered";
  numbered_start?: number;
}

export interface TextRun {
  id: string;
  text: string;
  style: TextRunStyle;
  special?: SpecialRunKind;
}

export interface TextParagraph {
  id: string;
  runs: TextRun[];
  paragraph_style: ParagraphStyle;
}

/** slide-deck-spec §5 — layout placeholders share the same body as text boxes. */
export type PlaceholderRole =
  | "title"
  | "subtitle"
  | "body"
  | "footer"
  | "slide_number"
  | "date"
  | "chart"
  | "custom";

/** slide-deck-spec §7.1 */
export interface TextBoxSpec {
  paragraphs: TextParagraph[];
  fill: FillSpec;
  border: BorderSpec | null;
  padding: EdgeInsets;
  auto_fit: "none" | "shrink_text" | "resize_box";
  word_wrap: boolean;
  vertical_align: "top" | "middle" | "bottom";
  placeholder_role?: PlaceholderRole;
  placeholder_hint?: string;
  default_style: TextRunStyle;
  /** `single_line`: one paragraph; Enter may commit editing. `multi_paragraph`: Enter inserts a new paragraph (default for body). */
  paragraph_editing?: "single_line" | "multi_paragraph";
}
