# Shift + resize: aspect from drag start

## Product rule

During pointer-driven resize of a box (slide EMU bounds or chart design frame in pixels):

- **Shift held** at sample time (`pointermove.shiftKey`): keep **width ÷ height** equal to the value at **`pointerdown`** (drag start) for that gesture.
- **Shift not held**: unconstrained resize where the surface already supports it (slide text boxes and shapes; chart design modal frame).

Read **Shift on each move**, not only at pointer down, so users can toggle mid-drag.

## Surfaces

| Surface | Default resize | Shift |
|--------|----------------|--------|
| Slide: text box, shape (`SlideTextBoxSelectionOverlay`, `SlideShapeSelectionOverlay`) | Free (`applyResizeHandleDeltaEmu`) | `applyResizeHandleDeltaEmuWithAspect` |
| Chart design modal (`ChartDesignAppearanceModal`) | `resizeFrameFromHandle` | `resizeFrameFromHandleAspectFromStart` |
| Slide: chart placement (`SlideChartSelectionOverlay`) | Corners already use `applyCornerAspectResizeEmu` (ratio from start or locked design aspect) | No extra behavior; Shift does not change the mode |

Shared math for aspect-locked rects lives in [`src/slideDeck/slideTextBoxResizeEmu.ts`](../src/slideDeck/slideTextBoxResizeEmu.ts) (`aspectResizeRectWithoutSlideClamp`). Chart design uses the same helper with px coordinates, then [`clampFrameToBounds`](../src/chart/chartAppearanceLayout.ts).

## Edge handles

With Shift, the active edge moves; the opposite edge stays fixed on that axis, and the box is centered on the orthogonal axis (see implementation in `aspectResizeRectWithoutSlideClamp`).
