/** slide-deck-spec §10 */
export interface CropSpec {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type SlideImageMimeType =
  | "image/png"
  | "image/jpeg"
  | "image/svg+xml"
  | "image/gif"
  | "image/webp";

export interface ImageSpec {
  asset_id: string;
  original_filename: string;
  mime_type: SlideImageMimeType;
  original_width_px: number;
  original_height_px: number;
  crop?: CropSpec;
  fit: "fill" | "contain" | "cover" | "stretch";
  alt_text?: string;
}
