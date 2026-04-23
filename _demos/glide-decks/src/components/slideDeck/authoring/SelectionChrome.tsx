import Box from "@mui/material/Box";

const HANDLE = 7;

export interface SelectionChromeProps {
  /** Top-left in slide px coordinates (same box as the selected element). */
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * PowerPoint-style selection: dotted frame and eight resize handles (handles are visual-only in v1).
 */
export function SelectionChrome({ x, y, width, height }: SelectionChromeProps) {
  const half = HANDLE / 2;
  const handles: Array<{ left: number; top: number }> = [
    { left: -half, top: -half },
    { left: width / 2 - half, top: -half },
    { left: width - half, top: -half },
    { left: width - half, top: height / 2 - half },
    { left: width - half, top: height - half },
    { left: width / 2 - half, top: height - half },
    { left: -half, top: height - half },
    { left: -half, top: height / 2 - half },
  ];

  return (
    <Box
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        pointerEvents: "none",
        boxSizing: "border-box",
        zIndex: 1000,
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
      {handles.map((h, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: HANDLE,
            height: HANDLE,
            left: h.left,
            top: h.top,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "primary.main",
            boxSizing: "border-box",
            pointerEvents: "none",
          }}
        />
      ))}
    </Box>
  );
}
