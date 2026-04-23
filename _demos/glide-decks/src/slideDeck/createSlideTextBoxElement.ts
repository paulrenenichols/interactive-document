import type { SlideElement, TextBoxSlideElement } from "../types/slideDeck";
import { DEFAULT_SLIDE_HEIGHT_EMU, DEFAULT_SLIDE_WIDTH_EMU } from "../types/slideDeck/constants";
import { createEmptyTextBoxSpec } from "./defaultTextBoxSpec";

/** Default inserted text box: centered, ~half slide width × ~1.5 in tall. */
const DEFAULT_INSERT_WIDTH_EMU = Math.floor(DEFAULT_SLIDE_WIDTH_EMU / 2);
const DEFAULT_INSERT_HEIGHT_EMU = Math.floor(1.5 * 914_400);

function nowIso(): string {
  return new Date().toISOString();
}

export function createSlideTextBoxElement(slideId: string, existingElements: SlideElement[]): TextBoxSlideElement {
  const t = nowIso();
  const maxZ = existingElements.length === 0 ? 0 : Math.max(...existingElements.map((e) => e.z_index));
  const w = DEFAULT_INSERT_WIDTH_EMU;
  const h = DEFAULT_INSERT_HEIGHT_EMU;
  const x = Math.floor((DEFAULT_SLIDE_WIDTH_EMU - w) / 2);
  const y = Math.floor((DEFAULT_SLIDE_HEIGHT_EMU - h) / 2);
  return {
    id: crypto.randomUUID(),
    slide_id: slideId,
    element_type: "text_box",
    x,
    y,
    width: w,
    height: h,
    rotation_deg: 0,
    z_index: maxZ + 1,
    locked: false,
    hidden: false,
    spec: createEmptyTextBoxSpec(),
    created_at: t,
    updated_at: t,
  };
}
