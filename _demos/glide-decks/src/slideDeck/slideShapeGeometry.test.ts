import { describe, expect, it } from "vitest";
import {
  angleDeltaRad,
  normalizeRotationDeg,
  pointInRect,
  pointInRotatedRectSlidePx,
  projectSlideDeltaToLocalEmu,
  radiansToDegrees,
} from "./slideShapeGeometry";

describe("projectSlideDeltaToLocalEmu", () => {
  it("is identity at 0°", () => {
    expect(projectSlideDeltaToLocalEmu(100, 200, 0)).toEqual({ dxLocal: 100, dyLocal: 200 });
  });

  it("maps slide +x to local when rotated 90° CW", () => {
    const { dxLocal, dyLocal } = projectSlideDeltaToLocalEmu(100, 0, 90);
    expect(dxLocal).toBeCloseTo(0, 5);
    expect(dyLocal).toBeCloseTo(-100, 5);
  });
});

describe("pointInRotatedRectSlidePx", () => {
  const rect = { x: 100, y: 50, width: 200, height: 100 };

  it("matches axis-aligned rect at 0°", () => {
    expect(pointInRotatedRectSlidePx(150, 80, rect, 0)).toBe(true);
    expect(pointInRotatedRectSlidePx(50, 80, rect, 0)).toBe(false);
  });

  it("excludes corners of AABB when rotated (center hit only)", () => {
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    expect(pointInRotatedRectSlidePx(cx, cy, rect, 45)).toBe(true);
    const farCorner = rect.x + rect.width;
    expect(pointInRotatedRectSlidePx(farCorner, rect.y, rect, 45)).toBe(false);
  });
});

describe("pointInRect", () => {
  it("includes boundary", () => {
    expect(pointInRect(0, 0, 0, 0, 10, 10)).toBe(true);
    expect(pointInRect(10, 10, 0, 0, 10, 10)).toBe(true);
  });
});

describe("angleDeltaRad", () => {
  it("wraps large deltas", () => {
    expect(angleDeltaRad(Math.PI / 2, 0)).toBeCloseTo(Math.PI / 2, 5);
    expect(angleDeltaRad(0, Math.PI / 2)).toBeCloseTo(-Math.PI / 2, 5);
  });
});

describe("normalizeRotationDeg", () => {
  it("normalizes negatives", () => {
    expect(normalizeRotationDeg(-90)).toBe(270);
    expect(normalizeRotationDeg(450)).toBe(90);
  });
});

describe("radiansToDegrees", () => {
  it("converts π", () => {
    expect(radiansToDegrees(Math.PI)).toBe(180);
  });
});
