/** slide-deck-spec §4.5 */
export type FillKind = "solid" | "gradient" | "image" | "none";

export interface GradientSpec {
  angle_deg: number;
  stops: { offset: number; color: string }[];
}

export interface FillSpec {
  kind: FillKind;
  /** Palette slot name or hex — solid */
  color?: string;
  gradient?: GradientSpec;
  image_asset_id?: string;
  opacity?: number;
}
