import { describe, expect, it } from "vitest";
import { applyResizeHandleDeltaEmuWithAspect } from "./slideTextBoxResizeEmu";

describe("applyResizeHandleDeltaEmuWithAspect", () => {
  const start = { x: 500_000, y: 400_000, width: 1_600_000, height: 900_000 };
  const aspect = start.width / start.height;

  it("se: preserves start aspect ratio", () => {
    const dx = 100_000;
    const next = applyResizeHandleDeltaEmuWithAspect("se", start, dx, 0);
    expect(next.width).toBe(start.width + dx);
    expect(next.height).toBeCloseTo(next.width / aspect, 3);
    expect(next.x).toBe(start.x);
    expect(next.y).toBe(start.y);
  });

  it("e: grows width and recenters vertically", () => {
    const dx = 200_000;
    const next = applyResizeHandleDeltaEmuWithAspect("e", start, dx, 0);
    expect(next.width).toBe(start.width + dx);
    expect(next.height).toBeCloseTo(next.width / aspect, 3);
    expect(next.x).toBe(start.x);
    const midStart = start.y + start.height / 2;
    const midNext = next.y + next.height / 2;
    expect(midNext).toBeCloseTo(midStart, 3);
  });

  it("n: changes height from top and centers horizontally", () => {
    const dy = -100_000;
    const next = applyResizeHandleDeltaEmuWithAspect("n", start, 0, dy);
    expect(next.y).toBe(start.y + dy);
    expect(next.height).toBe(start.height - dy);
    expect(next.width).toBeCloseTo(next.height * aspect, 3);
    const midStart = start.x + start.width / 2;
    const midNext = next.x + next.width / 2;
    expect(midNext).toBeCloseTo(midStart, 3);
  });
});
