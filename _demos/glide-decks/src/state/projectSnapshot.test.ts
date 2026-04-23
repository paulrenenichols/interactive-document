import { describe, expect, it } from "vitest";
import { createInitialSlideDeckState } from "../slideDeck/initialState";
import type { ChartAssetRow, DataSeriesAssetRow, DataSourceRow } from "../types/dataModel";
import {
  isProjectSnapshotShape,
  parseProjectSnapshot,
  PROJECT_SNAPSHOT_VERSION,
  serializeProjectSnapshot,
} from "./projectSnapshot";

describe("projectSnapshot", () => {
  it("round-trips through JSON with stable ids and normalized document name", () => {
    const deck = createInitialSlideDeckState({ documentId: "doc-rt", themeId: "theme-rt" });
    const chartId = "11111111-1111-4111-8111-111111111111";
    const chartRow: ChartAssetRow = {
      id: chartId,
      name: "Test chart",
      chart_type: "v_bar_cluster",
      live_instance_count: 0,
    };
    const seriesRow: DataSeriesAssetRow = {
      name: "s.a",
      value_type: "numeric",
      length: 2,
      origin_kind: "imported",
      role_kind: "none",
    };
    const sourceRow: DataSourceRow = {
      id: "src-1",
      display_name: "Test source",
      provenance_kind: "flat_file",
      row_count: 2,
      field_count: 1,
      estimated_memory_kb: 1,
    };
    const values = new Map<string, string[]>([
      ["s.a", ["1", "2"]],
    ]);

    const snapshot = serializeProjectSnapshot({
      documentTitle: "Round-trip Doc",
      dataSeriesRows: [seriesRow],
      dataSourceRows: [sourceRow],
      chartAssetRows: [chartRow],
      valuesBySeriesName: values,
      documentMeta: deck.documentMeta,
      theme: deck.theme,
      layouts: deck.layouts,
      slides: deck.slides,
      activeSlideId: deck.slides[0]?.id ?? null,
    });

    const raw = JSON.parse(JSON.stringify(snapshot)) as unknown;
    expect(isProjectSnapshotShape(raw)).toBe(true);

    const parsed = parseProjectSnapshot(raw);
    expect(parsed.version).toBe(PROJECT_SNAPSHOT_VERSION);
    expect(parsed.app.documentTitle).toBe("Round-trip Doc");
    expect(parsed.dataModel.dataSeriesRows).toEqual([seriesRow]);
    expect(parsed.dataModel.dataSourceRows).toEqual([sourceRow]);
    expect(parsed.dataModel.chartAssetRows).toEqual([chartRow]);
    expect(parsed.dataModel.valuesBySeriesName).toEqual({ "s.a": ["1", "2"] });
    expect(parsed.slideDeck.documentMeta.document_id).toBe("doc-rt");
    expect(parsed.slideDeck.documentMeta.document_name).toBe("Round-trip Doc");
    expect(parsed.slideDeck.theme.id).toBe("theme-rt");
    expect(parsed.slideDeck.slides).toHaveLength(2);
    expect(parsed.slideDeck.activeSlideId).toBe(deck.slides[0]?.id ?? null);
  });

  it("rejects unsupported version", () => {
    expect(() =>
      parseProjectSnapshot({
        version: 999,
        app: { documentTitle: "x" },
        dataModel: {
          dataSeriesRows: [],
          dataSourceRows: [],
          chartAssetRows: [],
          valuesBySeriesName: {},
        },
        slideDeck: {
          documentMeta: { document_id: "d", default_theme_id: "t" },
          theme: {} as never,
          layouts: [],
          slides: [],
          activeSlideId: null,
        },
      }),
    ).toThrow(/unsupported version/);
  });
});
