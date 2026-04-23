import { describe, expect, it } from "vitest";
import type { ChartInteractionSurface } from "./chartInteractionSurface";

describe("ChartInteractionSurface", () => {
  it("labels slide authoring vs reader preview for chart preview wiring", () => {
    const authoring: ChartInteractionSurface = "slideAuthoring";
    const reader: ChartInteractionSurface = "readerPreview";
    expect(authoring).toBe("slideAuthoring");
    expect(reader).toBe("readerPreview");
  });
});
