/**
 * Precision Ledger UI tokens from design/sample-slide-deck-design/code.html and DESIGN.md.
 * Product CTAs stay on tokens.colorPrimary (#E8472A); mock chart accents use darker primary (#b32006).
 */
import type { SxProps, Theme } from "@mui/material/styles";
import { tokens } from "../theme/tokens";

/** Slide preview column width — matches design/sample-slide-deck-design stage `max-w-[1280px]`. */
export const SLIDE_STAGE_MAX_WIDTH_PX = 1280;

/** Mock / Tailwind `primary` — chart strokes, bar fills in sample slide */
export const precisionPrimaryAccent = "#b32006";

export const precisionLedgerColors = {
  /** `bg-surface` */
  surface: "#f8f9fb",
  /** `bg-surface-container-low` — main stage */
  surfaceContainerLow: "#f3f4f6",
  /** `bg-surface-container-lowest` — slide card */
  surfaceContainerLowest: "#ffffff",
  surfaceContainerHigh: "#e7e8ea",
  surfaceContainer: "#edeef0",
  /** `text-on-surface` */
  onSurface: "#191c1e",
  /** `text-on-surface-variant` */
  onSurfaceVariant: "#5b403b",
  /** `text-secondary` — labels */
  secondaryText: "#565e72",
  outlineVariant: "#e4beb7",
  /** App primary for UI chrome alignment */
  primary: tokens.colorPrimary,
  chartAccent: precisionPrimaryAccent,
  anchorChrome: tokens.colorChrome,
} as const;

/** Large blur, low-opacity — DESIGN.md §4 floating UI */
export const slideCardShadow =
  "0 25px 50px -12px rgba(25, 28, 30, 0.12), 0 12px 24px -8px rgba(25, 28, 30, 0.08)";

export const glassBottomBarSx: SxProps<Theme> = {
  position: "fixed",
  left: "50%",
  bottom: 48,
  transform: "translateX(-50%)",
  zIndex: (theme) => theme.zIndex.modal + 1,
  display: "flex",
  alignItems: "center",
  gap: 3,
  px: 3,
  py: 1.5,
  borderRadius: 999,
  border: "1px solid rgba(255, 255, 255, 0.4)",
  boxShadow: "0 20px 40px -12px rgba(25, 28, 30, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(12px)",
};

export const glassRightPanelSx: SxProps<Theme> = {
  width: 280,
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(12px)",
  borderLeft: `1px solid ${precisionLedgerColors.outlineVariant}33`,
  boxSizing: "border-box",
};

/** Right-edge tab trigger (closed state) */
export const slideDeckRightTabSx: SxProps<Theme> = {
  position: "fixed",
  right: 0,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: (theme) => theme.zIndex.modal,
  py: 6,
  px: 0.5,
  borderRadius: "8px 0 0 8px",
  border: `1px solid ${precisionLedgerColors.outlineVariant}33`,
  borderRight: "none",
  backgroundColor: precisionLedgerColors.surfaceContainerHigh,
  "&:hover": {
    backgroundColor: precisionLedgerColors.surfaceContainer,
  },
};

/** Optional scale for slide card (match mock `scale-[0.85]`) */
export const SLIDE_CANVAS_SCALE = 0.85;

/**
 * Horizontal inset of the scaled slide’s painted rect vs its layout box (`transform-origin: center`).
 * Use on siblings (e.g. toolbar) so their content lines up with the inner `#ffffff` slide card edge.
 */
export const SLIDE_CANVAS_VISUAL_INSET_X_CSS = `calc((100% * (1 - ${SLIDE_CANVAS_SCALE})) / 2)`;

export const fontHeadline = '"Plus Jakarta Sans", "Poppins", sans-serif';
export const fontBody = '"Inter", "Poppins", sans-serif';
export const fontMono = '"JetBrains Mono", monospace';
