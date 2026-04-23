import type { FillSpec } from "./fill";
import type { BorderSpec } from "./shape";
import type { EdgeInsets } from "./shape";
import type { TextParagraph } from "./text";

/** slide-deck-spec §11 */
export interface TableStyle {
  header_fill: FillSpec;
  header_text_color: string;
  total_fill: FillSpec;
  total_text_color: string;
  banded_even_fill: FillSpec;
  banded_odd_fill: FillSpec;
  border: BorderSpec;
  outer_border: BorderSpec;
}

export interface TableCell {
  id: string;
  col_span: number;
  row_span: number;
  fill: FillSpec;
  border: BorderSpec | null;
  padding: EdgeInsets;
  vertical_align: "top" | "middle" | "bottom";
  paragraphs: TextParagraph[];
}

export interface TableRow {
  id: string;
  height_emu: number;
  cells: TableCell[];
  is_header?: boolean;
  is_total?: boolean;
}

export interface TableSpec {
  rows: TableRow[];
  col_widths_emu: number[];
  style: TableStyle;
  has_header_row: boolean;
  has_total_row: boolean;
  banded_rows: boolean;
  banded_cols: boolean;
}
