import type { SpecialRunKind } from "../types/slideDeck";

export interface SpecialRunResolutionContext {
  documentTitle: string;
  /** 1-based visible slide index for numbering */
  slideOrderIndex: number;
  totalNonHiddenSlides: number;
  /** ISO or locale string for fixed dates */
  locale?: string;
}

/**
 * Stub resolver for slide-deck-spec §7.3 / §14.2 — extend for i18n and date formatting.
 */
export function resolveSpecialRunKind(
  kind: SpecialRunKind,
  ctx: SpecialRunResolutionContext,
): string {
  switch (kind) {
    case "slide_number":
      return String(ctx.slideOrderIndex);
    case "total_slides":
      return String(ctx.totalNonHiddenSlides);
    case "slide_number_of_total":
      return `${ctx.slideOrderIndex} / ${ctx.totalNonHiddenSlides}`;
    case "date_auto":
      return new Date().toLocaleDateString(ctx.locale);
    case "date_fixed":
      return "";
    case "document_title":
      return ctx.documentTitle;
    case "section_title":
      return "";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
