import Box from "@mui/material/Box";
import { useCallback, useRef } from "react";
import {
  angleDeltaRad,
  clientToSlideLogicalPx,
  normalizeRotationDeg,
  projectSlideDeltaToLocalEmu,
  radiansToDegrees,
} from "../../../slideDeck/slideShapeGeometry";
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
/** Distance from top edge midpoint to rotation handle (slide px). */
const ROTATION_HANDLE_OFFSET_PX = 24;

export interface SlideShapeSelectionOverlayProps {
  rootRef: React.RefObject<HTMLElement | null>;
  pxPerEmu: number;
  pxBounds: { x: number; y: number; width: number; height: number };
  emuRect: { x: number; y: number; width: number; height: number };
  rotationDeg: number;
  onCommit: (patch: Partial<{ x: number; y: number; width: number; height: number; rotation_deg: number }>) => void;
}

export function SlideShapeSelectionOverlay({
  rootRef,
  pxPerEmu,
  pxBounds,
  emuRect,
  rotationDeg,
  onCommit,
}: SlideShapeSelectionOverlayProps) {
  const dragRef = useRef<{
    kind: "resize";
    handle: ResizeHandleId;
    startEmu: { x: number; y: number; width: number; height: number };
    startClient: { x: number; y: number };
  } | null>(null);

  const rotationDragRef = useRef<{
    centerSlidePx: { x: number; y: number };
    startPointerAngle: number;
    startRotationDeg: number;
  } | null>(null);

  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

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
        onCommit: (next) => onCommitRef.current(next),
      });
    },
    [emuRect, pxPerEmu, rootRef],
  );

  const startResizeDrag = useCallback(
    (handle: ResizeHandleId, ev: React.PointerEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      dragRef.current = {
        kind: "resize",
        handle,
        startEmu: { ...emuRect },
        startClient: { x: ev.clientX, y: ev.clientY },
      };

      const onMove = (moveEv: PointerEvent) => {
        const d = dragRef.current;
        const root = rootRef.current;
        if (!d || !root) return;

        const dxc = moveEv.clientX - d.startClient.x;
        const dyc = moveEv.clientY - d.startClient.y;
        const { dx, dy } = clientDeltaToSlideEmu(root, dxc, dyc, pxPerEmu);
        const { dxLocal, dyLocal } = projectSlideDeltaToLocalEmu(dx, dy, rotationDeg);
        onCommitRef.current(
          moveEv.shiftKey
            ? applyResizeHandleDeltaEmuWithAspect(d.handle, d.startEmu, dxLocal, dyLocal)
            : applyResizeHandleDeltaEmu(d.handle, d.startEmu, dxLocal, dyLocal),
        );
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
    [emuRect, pxPerEmu, rootRef, rotationDeg],
  );

  const startRotationDrag = useCallback(
    (ev: React.PointerEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      const root = rootRef.current;
      if (!root) return;

      const cx = pxBounds.x + pxBounds.width / 2;
      const cy = pxBounds.y + pxBounds.height / 2;
      const p0 = clientToSlideLogicalPx(root, ev.clientX, ev.clientY);
      const startPointerAngle = Math.atan2(p0.y - cy, p0.x - cx);
      const startRotationDeg = rotationDeg;

      rotationDragRef.current = {
        centerSlidePx: { x: cx, y: cy },
        startPointerAngle,
        startRotationDeg,
      };

      const onMove = (moveEv: PointerEvent) => {
        const r = rotationDragRef.current;
        if (!r) return;
        const p = clientToSlideLogicalPx(root, moveEv.clientX, moveEv.clientY);
        const angle = Math.atan2(p.y - r.centerSlidePx.y, p.x - r.centerSlidePx.x);
        const deltaRad = angleDeltaRad(angle, r.startPointerAngle);
        const nextDeg = normalizeRotationDeg(r.startRotationDeg + radiansToDegrees(deltaRad));
        onCommitRef.current({ rotation_deg: nextDeg });
      };

      const onUp = () => {
        rotationDragRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [pxBounds.x, pxBounds.y, pxBounds.width, pxBounds.height, rotationDeg],
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
      onPointerDown={(e) => startMoveDrag(e)}
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
          transform: `rotate(${rotationDeg}deg)`,
          transformOrigin: "center center",
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
          onPointerDown={(e) => startMoveDrag(e)}
          sx={{
            position: "absolute",
            left: FRAME,
            top: FRAME,
            right: FRAME,
            bottom: FRAME,
            zIndex: 0,
            cursor: "all-scroll",
            pointerEvents: "auto",
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
          onPointerDown={(e) => startResizeDrag("nw", e)}
          sx={handleSx(-HALF, -HALF, "nwse-resize")}
        />
        <Box
          onPointerDown={(e) => startResizeDrag("n", e)}
          sx={handleSx(width / 2 - HALF, -HALF, "ns-resize")}
        />
        <Box
          onPointerDown={(e) => startResizeDrag("ne", e)}
          sx={handleSx(width - HALF, -HALF, "nesw-resize")}
        />
        <Box
          onPointerDown={(e) => startResizeDrag("e", e)}
          sx={handleSx(width - HALF, height / 2 - HALF, "ew-resize")}
        />
        <Box
          onPointerDown={(e) => startResizeDrag("se", e)}
          sx={handleSx(width - HALF, height - HALF, "nwse-resize")}
        />
        <Box
          onPointerDown={(e) => startResizeDrag("s", e)}
          sx={handleSx(width / 2 - HALF, height - HALF, "ns-resize")}
        />
        <Box
          onPointerDown={(e) => startResizeDrag("sw", e)}
          sx={handleSx(-HALF, height - HALF, "nesw-resize")}
        />
        <Box
          onPointerDown={(e) => startResizeDrag("w", e)}
          sx={handleSx(-HALF, height / 2 - HALF, "ew-resize")}
        />

        <Box
          sx={{
            position: "absolute",
            left: width / 2 - 0.5,
            top: -ROTATION_HANDLE_OFFSET_PX,
            width: "1px",
            height: ROTATION_HANDLE_OFFSET_PX,
            bgcolor: "primary.main",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <Box
          onPointerDown={(e) => startRotationDrag(e)}
          sx={{
            position: "absolute",
            left: width / 2 - HALF,
            top: -ROTATION_HANDLE_OFFSET_PX - HALF,
            width: HANDLE,
            height: HANDLE,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "primary.main",
            borderRadius: "50%",
            boxSizing: "border-box",
            cursor: "grab",
            zIndex: 3,
            pointerEvents: "auto",
          }}
        />
      </Box>
    </Box>
  );
}
