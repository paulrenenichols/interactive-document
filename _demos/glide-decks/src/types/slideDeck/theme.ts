import type { FillSpec } from "./fill";
import type { ShapeSpec } from "./shape";
import type { PlaceholderRole, TextBoxSpec } from "./text";
import type { ImageSpec } from "./image";
import type { BulletLevel } from "./text";

/** slide-deck-spec §4.2 */
export interface ThemeColorPalette {
  accent_1: string;
  accent_2: string;
  accent_3: string;
  accent_4: string;
  accent_5: string;
  accent_6: string;
  dark_1: string;
  dark_2: string;
  light_1: string;
  light_2: string;
}

/** slide-deck-spec §4.3 */
export interface ThemeFontConfig {
  heading_family: string;
  heading_weight: number;
  body_family: string;
  body_weight: number;
  monospace_family: string;
}

/** slide-deck-spec §4.6 */
export interface ThemeElement {
  id: string;
  element_type: "shape" | "text_box" | "image" | "placeholder";
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  locked: boolean;
  placeholder_role?: PlaceholderRole;
  spec: ShapeSpec | TextBoxSpec | ImageSpec;
}

/** slide-deck-spec §4.1 / SQLite `themes` row */
export interface SlideDeckTheme {
  id: string;
  document_id: string;
  name: string;
  color_palette: ThemeColorPalette;
  font_config: ThemeFontConfig;
  bullet_config: BulletLevel[];
  background_fill: FillSpec;
  master_elements: ThemeElement[];
  /**
   * Layout id used when the user adds a slide in slide authoring (`+ Add slide`).
   * Must exist in the document’s `layouts` list; if missing at runtime, the app falls back to the first layout.
   */
  default_new_slide_layout_id: string | null;
  created_at: string;
  updated_at: string;
}
