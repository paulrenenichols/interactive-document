import Box from "@mui/material/Box";
import { useCallback, useRef } from "react";
import { pxToEmu } from "../../../slideDeck/units";
import {
  applyCornerAspectResizeEmu,
  type ChartCornerHandleId,
} from "../../../slideDeck/slideChartResizeEmu";
import { moveSlideElementEmu } from "../../../slideDeck/slideTextBoxResizeEmu";

const FRAME = 4;
const HANDLE = 7;
const HALF = HANDLE / 2;
const MOVE_THRESHOLD_PX = 4;
const EDGE_INSET = FRAME + HALF;

function clientDeltaToSlideEmu(
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

export interface SlideChartSelectionOverlayProps {
  rootRef: React.RefObject<HTMLElement | null>;
  pxPerEmu: number;
  pxBounds: { x: number; y: number; width: number; height: number };
  emuRect: { x: number; y: number; width: number; height: number };
  onCommitEmu: (next: { x: number; y: number; width: number; height: number }) => void;
  /** When set (e.g. chart design aspect lock), corner resize uses this width/height ratio instead of the current rect. */
  lockedAspectRatio?: number;
}

export function SlideChartSelectionOverlay({
  rootRef,
  pxPerEmu,
  pxBounds,
  emuRect,
  onCommitEmu,
  lockedAspectRatio,
}: SlideChartSelectionOverlayProps) {
  const dragRef = useRef<{
    kind: "move" | "resize";
    handle?: ChartCornerHandleId;
    startEmu: { x: number; y: number; width: number; height: number };
    startClient: { x: number; y: number };
    moveExceededThreshold?: boolean;
  } | null>(null);

  const onCommitEmuRef = useRef(onCommitEmu);
  onCommitEmuRef.current = onCommitEmu;

  const lockedAspectRef = useRef(lockedAspectRatio);
  lockedAspectRef.current = lockedAspectRatio;

  const startDrag = useCallback(
    (kind: "move" | "resize", handle: ChartCornerHandleId | undefined, ev: React.PointerEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      dragRef.current = {
        kind,
        handle,
        startEmu: { ...emuRect },
        startClient: { x: ev.clientX, y: ev.clientY },
        moveExceededThreshold: kind === "resize",
      };

      const onMove = (moveEv: PointerEvent) => {
        const d = dragRef.current;
        const root = rootRef.current;
        if (!d || !root) return;

        const dxc = moveEv.clientX - d.startClient.x;
        const dyc = moveEv.clientY - d.startClient.y;

        if (d.kind === "move") {
          const dist = Math.hypot(dxc, dyc);
          if (!d.moveExceededThreshold) {
            if (dist < MOVE_THRESHOLD_PX) return;
            d.moveExceededThreshold = true;
          }
          const { dx, dy } = clientDeltaToSlideEmu(root, dxc, dyc, pxPerEmu);
          onCommitEmuRef.current(moveSlideElementEmu(d.startEmu, dx, dy));
          return;
        }

        if (d.kind === "resize" && d.handle) {
          const { dx, dy } = clientDeltaToSlideEmu(root, dxc, dyc, pxPerEmu);
          const lock = lockedAspectRef.current;
          onCommitEmuRef.current(
            applyCornerAspectResizeEmu(d.handle, d.startEmu, dx, dy, lock != null && lock > 0 ? lock : undefined),
          );
        }
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [emuRect, pxPerEmu, rootRef],
  );

  const { x, y, width, height } = pxBounds;

  const handleSx = (left: number, top: number, cursor: string) => ({
    position: "absolute" as const,
    width: HANDLE,
    height: HANDLE,
    left,
    top,
    bgcolor: "background.paper",
    border: "1px solid",
    borderColor: "primary.main",
    boxSizing: "border-box" as const,
    cursor,
    zIndex: 2,
    pointerEvents: "auto" as const,
  });

  return (
    <Box
      data-slide-selection-overlay=""
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          border: "2px dotted",
          borderColor: "primary.main",
          borderRadius: 0.5,
          pointerEvents: "none",
        }}
      />
      <Box
        onPointerDown={(e) => startDrag("move", undefined, e)}
        sx={{
          position: "absolute",
          top: EDGE_INSET,
          left: EDGE_INSET,
          right: EDGE_INSET,
          bottom: EDGE_INSET,
          zIndex: 1,
          pointerEvents: "auto",
          cursor: "all-scroll",
        }}
      />

      <Box
        onPointerDown={(e) => startDrag("resize", "nw", e)}
        sx={handleSx(-HALF, -HALF, "nwse-resize")}
      />
      <Box
        onPointerDown={(e) => startDrag("resize", "ne", e)}
        sx={handleSx(width - HALF, -HALF, "nesw-resize")}
      />
      <Box
        onPointerDown={(e) => startDrag("resize", "sw", e)}
        sx={handleSx(-HALF, height - HALF, "nesw-resize")}
      />
      <Box
        onPointerDown={(e) => startDrag("resize", "se", e)}
        sx={handleSx(width - HALF, height - HALF, "nwse-resize")}
      />
    </Box>
  );
}
