import Box from "@mui/material/Box";
import { useCallback, useRef } from "react";
import {
  beginSlideTextBoxMoveDrag,
  clientDeltaToSlideEmu,
} from "../../../slideDeck/slideTextBoxMoveDrag";
import {
  applyResizeHandleDeltaEmu,
  applyResizeHandleDeltaEmuWithAspect,
  type ResizeHandleId,
} from "../../../slideDeck/slideTextBoxResizeEmu";

const FRAME = 4;
const HANDLE = 7;
const HALF = HANDLE / 2;
const EDGE_INSET = FRAME + HALF;

export interface SlideTextBoxSelectionOverlayProps {
  rootRef: React.RefObject<HTMLElement | null>;
  pxPerEmu: number;
  pxBounds: { x: number; y: number; width: number; height: number };
  emuRect: { x: number; y: number; width: number; height: number };
  onCommitEmu: (next: { x: number; y: number; width: number; height: number }) => void;
}

export function SlideTextBoxSelectionOverlay({
  rootRef,
  pxPerEmu,
  pxBounds,
  emuRect,
  onCommitEmu,
}: SlideTextBoxSelectionOverlayProps) {
  const dragRef = useRef<{
    kind: "move" | "resize";
    handle?: ResizeHandleId;
    startEmu: { x: number; y: number; width: number; height: number };
    startClient: { x: number; y: number };
    moveExceededThreshold?: boolean;
  } | null>(null);

  const onCommitEmuRef = useRef(onCommitEmu);
  onCommitEmuRef.current = onCommitEmu;

  const startMoveDrag = useCallback(
    (ev: React.PointerEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      beginSlideTextBoxMoveDrag({
        rootEl: rootRef.current,
        pxPerEmu,
        startEmu: emuRect,
        clientX: ev.clientX,
        clientY: ev.clientY,
        onCommit: (next) => onCommitEmuRef.current(next),
      });
    },
    [emuRect, pxPerEmu, rootRef],
  );

  const startDrag = useCallback(
    (kind: "move" | "resize", handle: ResizeHandleId | undefined, ev: React.PointerEvent) => {
      if (kind === "move") {
        startMoveDrag(ev);
        return;
      }

      ev.stopPropagation();
      ev.preventDefault();
      dragRef.current = {
        kind,
        handle,
        startEmu: { ...emuRect },
        startClient: { x: ev.clientX, y: ev.clientY },
        moveExceededThreshold: true,
      };

      const onMove = (moveEv: PointerEvent) => {
        const d = dragRef.current;
        const root = rootRef.current;
        if (!d || !root) return;

        const dxc = moveEv.clientX - d.startClient.x;
        const dyc = moveEv.clientY - d.startClient.y;

        if (d.kind === "resize" && d.handle) {
          const { dx, dy } = clientDeltaToSlideEmu(root, dxc, dyc, pxPerEmu);
          onCommitEmuRef.current(
            moveEv.shiftKey
              ? applyResizeHandleDeltaEmuWithAspect(d.handle, d.startEmu, dx, dy)
              : applyResizeHandleDeltaEmu(d.handle, d.startEmu, dx, dy),
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
    [emuRect, pxPerEmu, rootRef, startMoveDrag],
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

  const stripMove = (sx: Record<string, unknown>) => (
    <Box
      onPointerDown={(e) => startDrag("move", undefined, e)}
      sx={{ position: "absolute", zIndex: 1, pointerEvents: "auto", ...sx }}
    />
  );

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
      {stripMove({
        top: 0,
        left: EDGE_INSET,
        right: EDGE_INSET,
        height: FRAME,
        cursor: "all-scroll",
      })}
      {stripMove({
        bottom: 0,
        left: EDGE_INSET,
        right: EDGE_INSET,
        height: FRAME,
        cursor: "all-scroll",
      })}
      {stripMove({
        left: 0,
        top: EDGE_INSET,
        bottom: EDGE_INSET,
        width: FRAME,
        cursor: "all-scroll",
      })}
      {stripMove({
        right: 0,
        top: EDGE_INSET,
        bottom: EDGE_INSET,
        width: FRAME,
        cursor: "all-scroll",
      })}

      <Box
        onPointerDown={(e) => startDrag("resize", "nw", e)}
        sx={handleSx(-HALF, -HALF, "nwse-resize")}
      />
      <Box
        onPointerDown={(e) => startDrag("resize", "n", e)}
        sx={handleSx(width / 2 - HALF, -HALF, "ns-resize")}
      />
      <Box
        onPointerDown={(e) => startDrag("resize", "ne", e)}
        sx={handleSx(width - HALF, -HALF, "nesw-resize")}
      />
      <Box
        onPointerDown={(e) => startDrag("resize", "e", e)}
        sx={handleSx(width - HALF, height / 2 - HALF, "ew-resize")}
      />
      <Box
        onPointerDown={(e) => startDrag("resize", "se", e)}
        sx={handleSx(width - HALF, height - HALF, "nwse-resize")}
      />
      <Box
        onPointerDown={(e) => startDrag("resize", "s", e)}
        sx={handleSx(width / 2 - HALF, height - HALF, "ns-resize")}
      />
      <Box
        onPointerDown={(e) => startDrag("resize", "sw", e)}
        sx={handleSx(-HALF, height - HALF, "nesw-resize")}
      />
      <Box
        onPointerDown={(e) => startDrag("resize", "w", e)}
        sx={handleSx(-HALF, height / 2 - HALF, "ew-resize")}
      />
    </Box>
  );
}
