import type { TextBoxSpec } from "./text";
import type { ShapeSpec } from "./shape";
import type { ChartPlacementSpec } from "./chartPlacement";
import type { ImageSpec } from "./image";
import type { TableSpec } from "./table";
import type { FillSpec } from "./fill";

/** slide-deck-spec §6.2 */
export type SlideElementKind = "text_box" | "shape" | "chart" | "image" | "table";

export interface SlideElementBase {
  id: string;
  slide_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation_deg: number;
  z_index: number;
  locked: boolean;
  hidden: boolean;
  layout_element_id?: string;
  /** Ties this element to a theme master placeholder slot (when created from one). */
  theme_element_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TextBoxSlideElement extends SlideElementBase {
  element_type: "text_box";
  spec: TextBoxSpec;
}

export interface ShapeSlideElement extends SlideElementBase {
  element_type: "shape";
  spec: ShapeSpec;
}

export interface ChartSlideElement extends SlideElementBase {
  element_type: "chart";
  spec: ChartPlacementSpec;
}

export interface ImageSlideElement extends SlideElementBase {
  element_type: "image";
  spec: ImageSpec;
}

export interface TableSlideElement extends SlideElementBase {
  element_type: "table";
  spec: TableSpec;
}

export type SlideElement =
  | TextBoxSlideElement
  | ShapeSlideElement
  | ChartSlideElement
  | ImageSlideElement
  | TableSlideElement;

/** slide-deck-spec §6.1 */
export interface SlideDeckSlide {
  id: string;
  document_id: string;
  layout_id: string;
  order_index: number;
  name: string | null;
  notes: string | null;
  thumbnail_asset_id: string | null;
  elements: SlideElement[];
  /** Layout placeholder ids hidden on this slide (deleted); layout definition unchanged. */
  suppressed_layout_placeholder_ids: string[];
  /** Theme master placeholder ids hidden on this slide (deleted); theme definition unchanged. */
  suppressed_theme_placeholder_ids: string[];
  background_fill_override: FillSpec | null;
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

export function isChartSlideElement(el: SlideElement): el is ChartSlideElement {
  return el.element_type === "chart";
}

export function isTextBoxSlideElement(el: SlideElement): el is TextBoxSlideElement {
  return el.element_type === "text_box";
}

export function isShapeSlideElement(el: SlideElement): el is ShapeSlideElement {
  return el.element_type === "shape";
}
