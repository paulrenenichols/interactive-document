import { describe, expect, it } from "vitest";
import { applyCornerAspectResizeEmu } from "./slideChartResizeEmu";
import { clampSlideElementRectEmu, MIN_TEXT_BOX_EMU } from "./slideTextBoxResizeEmu";

describe("applyCornerAspectResizeEmu", () => {
  const start = { x: 500_000, y: 400_000, width: 1_600_000, height: 900_000 };
  const aspect = start.width / start.height;

  it("se: grows width and height, preserves aspect ratio", () => {
    const dx = 100_000;
    const dy = 50_000;
    const next = applyCornerAspectResizeEmu("se", start, dx, dy);
    expect(next.width).toBe(start.width + dx);
    expect(next.height).toBeCloseTo(next.width / aspect, 3);
    expect(next.x).toBe(start.x);
    expect(next.y).toBe(start.y);
  });

  it("nw: moves top-left corner and preserves aspect", () => {
    const dx = 80_000;
    const dy = -20_000;
    const next = applyCornerAspectResizeEmu("nw", start, dx, dy);
    expect(next.width).toBe(start.width - dx);
    expect(next.height).toBeCloseTo(next.width / aspect, 3);
    expect(next.x).toBe(start.x + dx);
    const bottom = start.y + start.height;
    expect(next.y + next.height).toBeCloseTo(bottom, 3);
  });

  it("ne: fixes bottom edge y while resizing from top-right", () => {
    const dx = 120_000;
    const next = applyCornerAspectResizeEmu("ne", start, dx, 0);
    const bottom = start.y + start.height;
    expect(next.y + next.height).toBeCloseTo(bottom, 3);
    expect(next.height).toBeCloseTo(next.width / aspect, 3);
  });

  it("sw: fixes top edge while resizing from bottom-left", () => {
    const dx = -60_000;
    const next = applyCornerAspectResizeEmu("sw", start, dx, 0);
    expect(next.y).toBe(start.y);
    expect(next.height).toBeCloseTo(next.width / aspect, 3);
  });

  it("returns clamped start rect when resize would violate minimum size", () => {
    const big = { x: 100_000, y: 100_000, width: 400_000, height: 225_000 };
    const shrunk = applyCornerAspectResizeEmu("se", big, -400_000, 0);
    expect(shrunk).toEqual(clampSlideElementRectEmu(big));
  });

  it("keeps dimensions at least MIN_TEXT_BOX_EMU when possible via clamp", () => {
    const roomy = { x: 0, y: 0, width: 2_000_000, height: 1_125_000 };
    const next = applyCornerAspectResizeEmu("se", roomy, 0, 0);
    expect(next.width).toBeGreaterThanOrEqual(MIN_TEXT_BOX_EMU);
    expect(next.height).toBeGreaterThanOrEqual(MIN_TEXT_BOX_EMU);
  });

  it("uses lockedAspectRatio when provided instead of the start rect ratio", () => {
    const start = { x: 500_000, y: 400_000, width: 2_000_000, height: 500_000 };
    const rectAspect = start.width / start.height;
    const locked = 16 / 9;
    expect(rectAspect).not.toBeCloseTo(locked, 3);
    const dx = 100_000;
    const fromRect = applyCornerAspectResizeEmu("se", start, dx, 0);
    const fromLocked = applyCornerAspectResizeEmu("se", start, dx, 0, locked);
    expect(fromRect.height).toBeCloseTo(fromRect.width / rectAspect, 3);
    expect(fromLocked.height).toBeCloseTo(fromLocked.width / locked, 3);
    expect(fromLocked.width / fromLocked.height).toBeCloseTo(locked, 5);
    expect(fromLocked.height).not.toBeCloseTo(fromRect.height, 3);
  });
});
