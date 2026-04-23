import type { DocumentSlideDeckMeta, SlideDeckSlide, SlideDeckTheme } from "../types/slideDeck";
import { DEFAULT_DOCUMENT_ID } from "../types/slideDeck/constants";
import { createBuiltInSlideLayouts } from "./builtInLayouts";
import { createPrecisionLedgerSlideDeckTheme } from "./precisionLedgerTheme";

export interface InitialSlideDeckState {
  documentMeta: DocumentSlideDeckMeta;
  theme: ReturnType<typeof createPrecisionLedgerSlideDeckTheme>;
  /** Document themes (v1: single Precision Ledger entry); layouts reference `theme_id` within this set. */
  themes: SlideDeckTheme[];
  layouts: ReturnType<typeof createBuiltInSlideLayouts>;
  slides: SlideDeckSlide[];
}

/**
 * Precision Ledger theme + built-in layouts + two seeded slides (first and second layouts from {@link createBuiltInSlideLayouts}).
 */
export function createInitialSlideDeckState(options?: {
  documentId?: string;
  themeId?: string;
}): InitialSlideDeckState {
  const documentId = options?.documentId ?? DEFAULT_DOCUMENT_ID;
  const themeId = options?.themeId ?? crypto.randomUUID();
  const theme = createPrecisionLedgerSlideDeckTheme(documentId, themeId);
  const layouts = createBuiltInSlideLayouts(theme, documentId);
  const layoutFirst = layouts[0];
  const layoutSecond = layouts[1];
  if (!layoutFirst || !layoutSecond) {
    throw new Error("createBuiltInSlideLayouts must return at least two layouts");
  }
  const t = new Date().toISOString();

  const makeSlide = (orderIndex: number, id: string, layoutId: string): SlideDeckSlide => ({
    id,
    document_id: documentId,
    layout_id: layoutId,
    order_index: orderIndex,
    name: null,
    notes: null,
    thumbnail_asset_id: null,
    elements: [],
    suppressed_layout_placeholder_ids: [],
    suppressed_theme_placeholder_ids: [],
    background_fill_override: null,
    hidden: false,
    created_at: t,
    updated_at: t,
  });

  const s1 = crypto.randomUUID();
  const s2 = crypto.randomUUID();
  const slides: SlideDeckSlide[] = [
    makeSlide(1, s1, layoutFirst.id),
    makeSlide(2, s2, layoutSecond.id),
  ];

  return {
    documentMeta: {
      document_id: documentId,
      default_theme_id: theme.id,
    },
    theme,
    themes: [theme],
    layouts,
    slides,
  };
}
