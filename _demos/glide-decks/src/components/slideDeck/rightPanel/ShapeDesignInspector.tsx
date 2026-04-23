import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { DebouncedNumericTextField } from "../../common/DebouncedNumericTextField";
import { useSlideDeck } from "../../../data/SlideDeckContext";
import { MILESTONE_SHAPE_KINDS, type MilestoneShapeKind } from "../../../slideDeck/createSlideShapeElement";
import { emuToInches, inchesToEmu, roundInches2 } from "../../../slideDeck/emuInches";
import { colorPickerValueFromFill, normalizeHexForColorInput } from "../../../slideDeck/colorPickerValue";
import { isMilestoneShapeKind, MILESTONE_SHAPE_LABELS } from "../../../slideDeck/milestoneShapeUi";
import { precisionLedgerColors } from "../../../slideDeck/precisionLedgerUi";
import {
  ARROW_LINE_END_DEFAULTS,
  LINE_STROKE_DEFAULTS,
  SHAPE_CORNER_RADIUS_DEFAULT_PT,
} from "../../../slideDeck/shapeDefaults";
import type { BorderSpec, FillSpec, ShapeSpec } from "../../../types/slideDeck";
import type { ShapeSlideElement } from "../../../types/slideDeck/slide";
import { EMU_PER_POINT } from "../../../types/slideDeck/constants";
import type { LineEndSpec } from "../../../types/slideDeck/shape";
import { transitionShapeKind } from "../../../slideDeck/transitionShapeKind";

const MARKERS: LineEndSpec["marker"][] = ["none", "arrow", "arrow_open", "circle", "square"];
const SIZES: LineEndSpec["size"][] = ["small", "medium", "large"];

function InchesField({
  label,
  emu,
  onCommitEmu,
}: {
  label: string;
  emu: number;
  onCommitEmu: (nextEmu: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const display = roundInches2(emuToInches(emu));

  useEffect(() => {
    if (!focused) setDraft(String(display));
  }, [display, focused]);

  return (
    <TextField
      size="small"
      label={label}
      fullWidth
      value={focused ? draft : String(display)}
      onFocus={() => {
        setFocused(true);
        setDraft(String(display));
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setFocused(false);
        const n = parseFloat(draft.replace(/,/g, ""));
        if (Number.isFinite(n)) {
          onCommitEmu(inchesToEmu(roundInches2(n)));
        }
      }}
      inputProps={{ inputMode: "decimal" }}
    />
  );
}

export interface ShapeDesignInspectorProps {
  slideId: string;
  element: ShapeSlideElement;
}

/**
 * Format Shape–style controls for slide-owned shapes (shapes-milestone-spec §7).
 */
export function ShapeDesignInspector({ slideId, element }: ShapeDesignInspectorProps) {
  const { theme, updateSlideElement } = useSlideDeck();
  const spec = element.spec;
  const kind = spec.shape_kind;
  const isLine = kind === "line";
  const isArrow = kind === "arrow";
  const showFillBorder = !isLine;

  const patchSpec = useCallback(
    (partial: Partial<ShapeSpec>) => {
      updateSlideElement(slideId, element.id, {
        spec: { ...element.spec, ...partial },
      });
    },
    [slideId, element.id, element.spec, updateSlideElement],
  );

  const patchLayout = useCallback(
    (layout: Partial<Pick<ShapeSlideElement, "x" | "y" | "width" | "height" | "rotation_deg">>) => {
      updateSlideElement(slideId, element.id, layout);
    },
    [slideId, element.id, updateSlideElement],
  );

  useEffect(() => {
    if (kind !== "line" || spec.line_stroke) return;
    patchSpec({ line_stroke: { ...LINE_STROKE_DEFAULTS } });
  }, [kind, spec.line_stroke, patchSpec]);

  useEffect(() => {
    if (kind !== "arrow") return;
    if (spec.line_start && spec.line_end) return;
    patchSpec({
      line_start: spec.line_start ?? ARROW_LINE_END_DEFAULTS.line_start,
      line_end: spec.line_end ?? ARROW_LINE_END_DEFAULTS.line_end,
    });
  }, [kind, spec.line_start, spec.line_end, patchSpec]);

  const fill = spec.fill;
  const fillKind = fill.kind === "none" ? "none" : "solid";
  const fillColorPickerValue = colorPickerValueFromFill(fill, theme.color_palette);

  const opacity = fill.opacity ?? 1;
  const border = spec.border;
  const borderStyle: BorderSpec["style"] | "off" =
    border == null || border.style === "none" ? "off" : border.style;

  const cornerPtRounded =
    spec.corner_radius_emu != null
      ? spec.corner_radius_emu / EMU_PER_POINT
      : SHAPE_CORNER_RADIUS_DEFAULT_PT;

  const lineStroke = spec.line_stroke ?? LINE_STROKE_DEFAULTS;

  const onPatchFill = useCallback(
    (next: FillSpec) => {
      patchSpec({ fill: next });
    },
    [patchSpec],
  );

  const commitFillColorFromPicker = (e: FormEvent<HTMLInputElement>) => {
    const hex = normalizeHexForColorInput(e.currentTarget.value.trim());
    if (!hex) return;
    onPatchFill({ kind: "solid", color: hex, opacity: fill.opacity });
  };

  const replaceShapeKind = useCallback(
    (next: MilestoneShapeKind) => {
      updateSlideElement(slideId, element.id, {
        spec: transitionShapeKind(element.spec, next),
      });
    },
    [slideId, element.id, element.spec, updateSlideElement],
  );

  const shapeKindSelectValue = isMilestoneShapeKind(kind) ? kind : MILESTONE_SHAPE_KINDS[0];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
      <Typography variant="subtitle2" fontWeight={700} color={precisionLedgerColors.onSurface}>
        Shape
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "JetBrains Mono, monospace" }}>
        {kind} · {element.id.slice(0, 8)}…
      </Typography>

      <FormControl size="small" fullWidth>
        <InputLabel id="shape-design-kind-label">Shape kind</InputLabel>
        <Select
          labelId="shape-design-kind-label"
          label="Shape kind"
          value={shapeKindSelectValue}
          renderValue={(selected) =>
            isMilestoneShapeKind(kind)
              ? MILESTONE_SHAPE_LABELS[selected as MilestoneShapeKind]
              : `${kind} (not in menu — pick to replace)`
          }
          onChange={(e) => replaceShapeKind(e.target.value as MilestoneShapeKind)}
        >
          {MILESTONE_SHAPE_KINDS.map((k) => (
            <MenuItem key={k} value={k}>
              {MILESTONE_SHAPE_LABELS[k]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {!isMilestoneShapeKind(kind) ? (
        <Typography variant="caption" color="warning.main">
          Stored kind is not a milestone primitive; choosing a shape kind above replaces it.
        </Typography>
      ) : null}

      {showFillBorder ? (
        <>
          <Typography variant="subtitle2" fontWeight={700} color={precisionLedgerColors.onSurface} sx={{ mt: 0.5 }}>
            Fill
          </Typography>
          <FormControl size="small" fullWidth>
            <InputLabel id="shape-fill-kind-label">Fill</InputLabel>
            <Select
              labelId="shape-fill-kind-label"
              label="Fill"
              value={fillKind === "none" ? "none" : "solid"}
              onChange={(e) => {
                const v = e.target.value as "none" | "solid";
                if (v === "none") onPatchFill({ kind: "none", opacity: fill.opacity });
                else onPatchFill({ kind: "solid", color: fill.color ?? "accent_2", opacity: fill.opacity });
              }}
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="solid">Solid</MenuItem>
            </Select>
          </FormControl>

          {fillKind !== "none" ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                size="small"
                label="Color (slot or hex)"
                fullWidth
                value={fill.kind === "solid" && fill.color ? fill.color : ""}
                onChange={(e) =>
                  onPatchFill({
                    kind: "solid",
                    color: e.target.value,
                    opacity: fill.opacity,
                  })
                }
              />
              <Box
                component="input"
                type="color"
                value={fillColorPickerValue}
                onChange={commitFillColorFromPicker}
                onInput={commitFillColorFromPicker}
                onBlur={commitFillColorFromPicker}
                sx={{ width: 40, height: 36, p: 0, border: "none", cursor: "pointer" }}
                aria-label="Pick fill color"
              />
            </Box>
          ) : null}

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Opacity ({Math.round(opacity * 100)}%)
            </Typography>
            <Slider
              size="small"
              min={0}
              max={100}
              value={Math.round(opacity * 100)}
              onChange={(_, v) => {
                const pct = Array.isArray(v) ? v[0] : v;
                onPatchFill({
                  ...fill,
                  opacity: Math.max(0, Math.min(1, pct / 100)),
                });
              }}
            />
          </Box>

          <Typography variant="subtitle2" fontWeight={700} color={precisionLedgerColors.onSurface}>
            Border
          </Typography>
          <FormControl size="small" fullWidth>
            <InputLabel id="shape-border-style-label">Border style</InputLabel>
            <Select
              labelId="shape-border-style-label"
              label="Border style"
              value={borderStyle === "off" ? "off" : borderStyle}
              onChange={(e) => {
                const v = e.target.value as BorderSpec["style"] | "off";
                if (v === "off") patchSpec({ border: null });
                else {
                  const prev = border && border.style !== "none" ? border : null;
                  patchSpec({
                    border: {
                      style: v,
                      color: prev?.color ?? "#191c1e",
                      width_pt: prev?.width_pt ?? 1,
                    },
                  });
                }
              }}
            >
              <MenuItem value="off">None</MenuItem>
              <MenuItem value="solid">Solid</MenuItem>
              <MenuItem value="dashed">Dashed</MenuItem>
              <MenuItem value="dotted">Dotted</MenuItem>
            </Select>
          </FormControl>

          {borderStyle !== "off" && border != null && border.style !== "none" ? (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  size="small"
                  label="Border color"
                  fullWidth
                  value={border.color}
                  onChange={(e) =>
                    patchSpec({
                      border: { ...border, color: e.target.value },
                    })
                  }
                />
              </Box>
              <DebouncedNumericTextField
                size="small"
                label="Border weight (pt)"
                fullWidth
                committed={Math.round(border.width_pt)}
                min={0}
                max={12}
                defaultValue={1}
                onCommit={(n) =>
                  patchSpec({
                    border: border ? { ...border, width_pt: n } : { style: "solid", color: "#191c1e", width_pt: n },
                  })
                }
              />
            </>
          ) : null}
        </>
      ) : null}

      {kind === "rounded_rectangle" ? (
        <>
          <Typography variant="subtitle2" fontWeight={700} color={precisionLedgerColors.onSurface}>
            Corners
          </Typography>
          <DebouncedNumericTextField
            size="small"
            label="Corner radius (pt)"
            fullWidth
            committed={Math.round(cornerPtRounded)}
            min={0}
            max={100}
            defaultValue={8}
            onCommit={(n) => patchSpec({ corner_radius_emu: n * EMU_PER_POINT })}
          />
        </>
      ) : null}

      {isLine ? (
        <>
          <Typography variant="subtitle2" fontWeight={700} color={precisionLedgerColors.onSurface}>
            Line
          </Typography>
          <TextField
            size="small"
            label="Stroke color"
            fullWidth
            value={lineStroke.color}
            onChange={(e) =>
              patchSpec({
                line_stroke: { ...lineStroke, color: e.target.value },
              })
            }
          />
          <DebouncedNumericTextField
            size="small"
            label="Weight (pt)"
            fullWidth
            committed={Math.round(lineStroke.weight_pt)}
            min={1}
            max={24}
            defaultValue={2}
            onCommit={(n) =>
              patchSpec({
                line_stroke: { ...lineStroke, weight_pt: n },
              })
            }
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="shape-line-style-label">Dash style</InputLabel>
            <Select
              labelId="shape-line-style-label"
              label="Dash style"
              value={lineStroke.style}
              onChange={(e) =>
                patchSpec({
                  line_stroke: {
                    ...lineStroke,
                    style: e.target.value as (typeof lineStroke)["style"],
                  },
                })
              }
            >
              <MenuItem value="solid">Solid</MenuItem>
              <MenuItem value="dashed">Dashed</MenuItem>
              <MenuItem value="dotted">Dotted</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel id="shape-line-cap-label">Cap</InputLabel>
            <Select
              labelId="shape-line-cap-label"
              label="Cap"
              value={lineStroke.cap}
              onChange={(e) =>
                patchSpec({
                  line_stroke: {
                    ...lineStroke,
                    cap: e.target.value as (typeof lineStroke)["cap"],
                  },
                })
              }
            >
              <MenuItem value="butt">Butt</MenuItem>
              <MenuItem value="round">Round</MenuItem>
              <MenuItem value="square">Square</MenuItem>
            </Select>
          </FormControl>
        </>
      ) : null}

      {isArrow ? (
        <>
          <Typography variant="subtitle2" fontWeight={700} color={precisionLedgerColors.onSurface}>
            Arrow ends
          </Typography>
          <Stack direction="row" spacing={1}>
            <FormControl size="small" fullWidth>
              <InputLabel id="shape-line-start-label">Start</InputLabel>
              <Select
                labelId="shape-line-start-label"
                label="Start"
                value={spec.line_start?.marker ?? "none"}
                onChange={(e) =>
                  patchSpec({
                    line_start: {
                      marker: e.target.value as LineEndSpec["marker"],
                      size: spec.line_start?.size ?? "medium",
                    },
                  })
                }
              >
                {MARKERS.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel id="shape-line-start-size-label">Size</InputLabel>
              <Select
                labelId="shape-line-start-size-label"
                label="Size"
                value={spec.line_start?.size ?? "medium"}
                onChange={(e) =>
                  patchSpec({
                    line_start: {
                      marker: spec.line_start?.marker ?? "none",
                      size: e.target.value as LineEndSpec["size"],
                    },
                  })
                }
              >
                {SIZES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1}>
            <FormControl size="small" fullWidth>
              <InputLabel id="shape-line-end-label">End</InputLabel>
              <Select
                labelId="shape-line-end-label"
                label="End"
                value={spec.line_end?.marker ?? "arrow"}
                onChange={(e) =>
                  patchSpec({
                    line_end: {
                      marker: e.target.value as LineEndSpec["marker"],
                      size: spec.line_end?.size ?? "medium",
                    },
                  })
                }
              >
                {MARKERS.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel id="shape-line-end-size-label">Size</InputLabel>
              <Select
                labelId="shape-line-end-size-label"
                label="Size"
                value={spec.line_end?.size ?? "medium"}
                onChange={(e) =>
                  patchSpec({
                    line_end: {
                      marker: spec.line_end?.marker ?? "arrow",
                      size: e.target.value as LineEndSpec["size"],
                    },
                  })
                }
              >
                {SIZES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </>
      ) : null}

      <Typography variant="subtitle2" fontWeight={700} color={precisionLedgerColors.onSurface}>
        Position and size
      </Typography>
      <Stack spacing={1}>
        <InchesField label="X (in)" emu={element.x} onCommitEmu={(x) => patchLayout({ x })} />
        <InchesField label="Y (in)" emu={element.y} onCommitEmu={(y) => patchLayout({ y })} />
        <InchesField label="Width (in)" emu={element.width} onCommitEmu={(width) => patchLayout({ width })} />
        <InchesField label="Height (in)" emu={element.height} onCommitEmu={(height) => patchLayout({ height })} />
        <DebouncedNumericTextField
          size="small"
          label="Rotation (deg)"
          fullWidth
          committed={Math.round(((element.rotation_deg % 360) + 360) % 360)}
          min={0}
          max={359}
          defaultValue={0}
          onCommit={(n) => patchLayout({ rotation_deg: n })}
        />
      </Stack>
    </Box>
  );
}
