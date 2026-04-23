import { useRef, type CSSProperties } from "react";
import {
  cartesianAxisLabelAttrs,
  type CartesianAxisLabelPosition,
} from "../../chart/rechartsCartesianLabelAttrs";
import type { ChartDesignAxisId } from "../../types/dataModel";

export interface InteractiveAxisLabelContentProps {
  viewBox?: { x: number; y: number; width: number; height: number };
  value?: string | number;
  position?: string;
  angle?: number;
  style?: CSSProperties;
  offset?: number;
  axisId: ChartDesignAxisId;
  editingAxisId: ChartDesignAxisId | null;
  editDraft: string;
  onStartEdit: (axisId: ChartDesignAxisId, initial: string) => void;
  onDraftChange: (s: string) => void;
  onCommit: (axisId: ChartDesignAxisId, text: string) => void;
  onCancelEdit: () => void;
}

/**
 * Recharts `Label` `content` renderer: double-click to edit axis label text in design mode.
 */
export function InteractiveAxisLabelContent({
  viewBox,
  value,
  position,
  angle = 0,
  style,
  offset = 5,
  axisId,
  editingAxisId,
  editDraft,
  onStartEdit,
  onDraftChange,
  onCommit,
  onCancelEdit,
}: InteractiveAxisLabelContentProps) {
  const skipBlurCommitRef = useRef(false);

  if (!viewBox || position === undefined) {
    return null;
  }
  const pos = position as CartesianAxisLabelPosition;
  const allowed: CartesianAxisLabelPosition[] = [
    "insideBottom",
    "insideTop",
    "insideLeft",
    "insideRight",
    "bottom",
    "top",
  ];
  if (!allowed.includes(pos)) {
    return null;
  }

  const attrs = cartesianAxisLabelAttrs(viewBox, pos, offset);
  const display = String(value ?? "");
  const fs = style?.fontSize ?? 12;
  const ff = (style?.fontFamily as string) ?? "sans-serif";
  const fill = (style?.fill as string) ?? "#0D1526";

  const editing = editingAxisId === axisId;

  if (editing) {
    const w = 240;
    const h = Math.max(28, Number(fs) + 16);
    return (
      <foreignObject x={attrs.x - w / 2} y={attrs.y - h / 2} width={w} height={h}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            margin: 0,
            padding: 0,
          }}
        >
          <input
            type="text"
            value={editDraft}
            autoFocus
            aria-label="Axis label"
            onChange={(e) => onDraftChange(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onCommit(axisId, editDraft.trim());
              } else if (e.key === "Escape") {
                e.preventDefault();
                skipBlurCommitRef.current = true;
                onCancelEdit();
              }
            }}
            onBlur={() => {
              if (skipBlurCommitRef.current) {
                skipBlurCommitRef.current = false;
                return;
              }
              onCommit(axisId, editDraft.trim());
            }}
            style={{
              width: "100%",
              fontSize: typeof fs === "number" ? `${fs}px` : String(fs),
              fontFamily: ff,
              boxSizing: "border-box",
              padding: "4px 8px",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>
      </foreignObject>
    );
  }

  return (
    <text
      x={attrs.x}
      y={attrs.y}
      textAnchor={attrs.textAnchor}
      dominantBaseline={attrs.dominantBaseline}
      fill={fill}
      fontSize={fs}
      fontFamily={ff}
      transform={angle ? `rotate(${angle}, ${attrs.x}, ${attrs.y})` : undefined}
      style={{ pointerEvents: "all", cursor: "text" }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onStartEdit(axisId, display);
      }}
    >
      {display}
    </text>
  );
}
