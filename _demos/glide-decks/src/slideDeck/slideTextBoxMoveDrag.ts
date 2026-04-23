import { moveSlideElementEmu } from "./slideTextBoxResizeEmu";
import { pxToEmu } from "./units";

/** Matches selection overlay move strips — drag only commits after this many px. */
export const SLIDE_TEXT_BOX_MOVE_THRESHOLD_PX = 4;

export function clientDeltaToSlideEmu(
  root: HTMLElement,
  dClientX: number,
  dClientY: number,
  pxPerEmu: number,
): { dx: number; dy: number } {
  const rect = root.getBoundingClientRect();
  const logicalW = root.offsetWidth;
  const logicalH = root.offsetHeight;
  const dxLogical = (dClientX / rect.width) * logicalW;
  const dyLogical = (dClientY / rect.height) * logicalH;
  return { dx: pxToEmu(dxLogical, pxPerEmu), dy: pxToEmu(dyLogical, pxPerEmu) };
}

export function beginSlideTextBoxMoveDrag(args: {
  rootEl: HTMLElement | null;
  pxPerEmu: number;
  startEmu: { x: number; y: number; width: number; height: number };
  clientX: number;
  clientY: number;
  onCommit: (next: { x: number; y: number; width: number; height: number }) => void;
}): void {
  const { rootEl, pxPerEmu, startEmu, clientX, clientY, onCommit } = args;
  if (!rootEl) return;

  let moveExceededThreshold = false;
  const startClient = { x: clientX, y: clientY };
  const startEmuCopy = { ...startEmu };

  const onMove = (moveEv: PointerEvent) => {
    const dxc = moveEv.clientX - startClient.x;
    const dyc = moveEv.clientY - startClient.y;
    const dist = Math.hypot(dxc, dyc);
    if (!moveExceededThreshold) {
      if (dist < SLIDE_TEXT_BOX_MOVE_THRESHOLD_PX) return;
      moveExceededThreshold = true;
    }
    const { dx, dy } = clientDeltaToSlideEmu(rootEl, dxc, dyc, pxPerEmu);
    onCommit(moveSlideElementEmu(startEmuCopy, dx, dy));
  };

  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
}
