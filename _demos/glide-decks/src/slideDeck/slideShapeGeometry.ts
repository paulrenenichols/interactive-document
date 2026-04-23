/**
 * Geometry for slide shapes: rotated OBB hit-test and mapping slide-space EMU deltas
 * to the element’s unrotated local axes (same basis as EMU x/y).
 */

/** CSS `rotate(θ)` with positive θ clockwise (y-down): slide = R * local */
function rotationRad(rotationDeg: number): number {
  return (rotationDeg * Math.PI) / 180;
}

/**
 * Inverse rotate a slide-space vector into local unrotated box space (inverse of CSS rotate).
 */
export function projectSlideDeltaToLocalEmu(
  dxSlideEmu: number,
  dySlideEmu: number,
  rotationDeg: number,
): { dxLocal: number; dyLocal: number } {
  if (Math.abs(rotationDeg) < 1e-9) {
    return { dxLocal: dxSlideEmu, dyLocal: dySlideEmu };
  }
  const θ = rotationRad(rotationDeg);
  const c = Math.cos(θ);
  const s = Math.sin(θ);
  return {
    dxLocal: dxSlideEmu * c + dySlideEmu * s,
    dyLocal: -dxSlideEmu * s + dySlideEmu * c,
  };
}

export function pointInRect(
  px: number,
  py: number,
  x: number,
  y: number,
  w: number,
  h: number,
): boolean {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

/**
 * Hit-test pointer (slide logical px) against the oriented box: unrotated rect centered in slide px, rotated by `rotationDeg`.
 */
export function pointInRotatedRectSlidePx(
  px: number,
  py: number,
  rect: { x: number; y: number; width: number; height: number },
  rotationDeg: number,
): boolean {
  if (Math.abs(rotationDeg) < 1e-6) {
    return pointInRect(px, py, rect.x, rect.y, rect.width, rect.height);
  }
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const vx = px - cx;
  const vy = py - cy;
  const { dxLocal: lx, dyLocal: ly } = projectSlideDeltaToLocalEmu(vx, vy, rotationDeg);
  return Math.abs(lx) <= rect.width / 2 && Math.abs(ly) <= rect.height / 2;
}

export function clientToSlideLogicalPx(
  root: HTMLElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const r = root.getBoundingClientRect();
  const logicalW = root.offsetWidth;
  const logicalH = root.offsetHeight;
  return {
    x: ((clientX - r.left) / r.width) * logicalW,
    y: ((clientY - r.top) / r.height) * logicalH,
  };
}

/** Difference a1 - a0 wrapped to (-π, π]. */
export function angleDeltaRad(a1: number, a0: number): number {
  return Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0));
}

export function normalizeRotationDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function radiansToDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}
