import { describe, expect, it } from "vitest";
import type { ChartSlideElement } from "./slide";
import { isChartSlideElement } from "./slide";

describe("SlideElement discriminated union", () => {
  it("round-trips chart placement through JSON", () => {
    const t = "2020-01-01T00:00:00.000Z";
    const el: ChartSlideElement = {
      id: "el-1",
      slide_id: "slide-1",
      element_type: "chart",
      x: 100,
      y: 200,
      width: 400,
      height: 300,
      rotation_deg: 0,
      z_index: 1,
      locked: false,
      hidden: false,
      spec: {
        chart_id: "chart-uuid",
        aspect_ratio_locked: true,
        title_override: "Q4",
      },
      created_at: t,
      updated_at: t,
    };
    const json = JSON.stringify(el);
    const back = JSON.parse(json) as ChartSlideElement;
    expect(back.element_type).toBe("chart");
    expect(back.spec.chart_id).toBe("chart-uuid");
    expect(isChartSlideElement(back)).toBe(true);
  });
});
