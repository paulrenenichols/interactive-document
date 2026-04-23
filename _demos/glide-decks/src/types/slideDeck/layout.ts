import type { FillSpec } from "./fill";
import type { ShapeSpec } from "./shape";
import type { ImageSpec } from "./image";
import type { TextBoxSpec, PlaceholderRole } from "./text";

/** slide-deck-spec §5.2 — placeholder body matches TextBoxSpec in practice. */
export type PlaceholderSpec = TextBoxSpec;

/** slide-deck-spec §5.2 */
export type LayoutElementKind = "shape" | "placeholder" | "image";

export interface LayoutElement {
  id: string;
  element_type: LayoutElementKind;
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  placeholder_role?: PlaceholderRole;
  spec: ShapeSpec | PlaceholderSpec | ImageSpec;
}

/** slide-deck-spec §5.1 */
export interface SlideDeckLayout {
  id: string;
  document_id: string;
  theme_id: string;
  name: string;
  description: string | null;
  thumbnail_asset_id: string | null;
  elements: LayoutElement[];
  background_fill_override: FillSpec | null;
  created_at: string;
  updated_at: string;
}
