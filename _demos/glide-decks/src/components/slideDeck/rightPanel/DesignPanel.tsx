import FormatAlignCenter from "@mui/icons-material/FormatAlignCenter";
import FormatAlignJustify from "@mui/icons-material/FormatAlignJustify";
import FormatAlignLeft from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRight from "@mui/icons-material/FormatAlignRight";
import FormatIndentDecrease from "@mui/icons-material/FormatIndentDecrease";
import FormatIndentIncrease from "@mui/icons-material/FormatIndentIncrease";
import FormatListBulleted from "@mui/icons-material/FormatListBulleted";
import FormatListNumbered from "@mui/icons-material/FormatListNumbered";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { type FormEvent, useCallback, useMemo } from "react";
import { DebouncedNumericTextField } from "../../common/DebouncedNumericTextField";
import { useSlideDeck } from "../../../data/SlideDeckContext";
import { useSlideElementSelection } from "../../../data/SlideElementSelectionContext";
import { useSlideTextEdit } from "../../../data/SlideTextEditContext";
import {
  colorPickerValueFromFill,
  colorPickerValueFromRawColor,
  normalizeHexForColorInput,
} from "../../../slideDeck/colorPickerValue";
import { PLACEHOLDER_BODY_FONT_SIZE_PT } from "../../../slideDeck/placeholderTypography";
import { precisionLedgerColors } from "../../../slideDeck/precisionLedgerUi";
import {
  applyDefaultStyleToWholeBox,
  applyRunStyleToRange,
  bumpIndentOnRange,
  isCollapsedRange,
  setAlignmentOnRange,
  setListStyleOnRange,
  summarizeParagraphFormatsForRange,
} from "../../../slideDeck/textBoxSpecEditing";
import type { BorderSpec, FillSpec, SlideElement, TextBoxSlideElement, TextBoxSpec, TextRunStyle } from "../../../types/slideDeck";
import { isShapeSlideElement, isTextBoxSlideElement } from "../../../types/slideDeck/slide";
import { ShapeDesignInspector } from "./ShapeDesignInspector";

function fontFamilyMode(
  ff: string | undefined,
  heading: string,
  body: string,
): "heading" | "body" | "custom" {
  if (ff === heading) return "heading";
  if (ff === body) return "body";
  return "custom";
}

function patchTextBoxAppearance(
  el: TextBoxSlideElement,
  slideId: string,
  patch: { fill?: FillSpec; border?: BorderSpec | null },
  updateSlideElement: (slideId: string, elementId: string, patch: Partial<SlideElement>) => void,
) {
  updateSlideElement(slideId, el.id, { spec: { ...el.spec, ...patch } });
}

function looksBold(ds: TextRunStyle): boolean {
  return ds.bold === true || (ds.font_weight != null && ds.font_weight >= 600);
}

/** Contextual design controls; re-renders when slide element selection or slide data changes. */
export function DesignPanel() {
  const { slides, theme, updateSlideElement } = useSlideDeck();
  const { selection } = useSlideElementSelection();
  const { liveSpec, textSelection, slideId: editSlideId, elementId: editElementId } = useSlideTextEdit();

  const resolved = useMemo(() => {
    if (!selection || selection.kind !== "slide") return null;
    const slide = slides.find((s) => s.id === selection.slideId);
    if (!slide) return null;
    const el = slide.elements.find((e) => e.id === selection.elementId);
    if (!el) return null;
    if (isTextBoxSlideElement(el)) return { type: "text_box" as const, slideId: slide.id, element: el };
    if (isShapeSlideElement(el)) return { type: "shape" as const, slideId: slide.id, element: el };
    return { type: "other" as const, elementType: el.element_type };
  }, [selection, slides]);

  const specForTextOps = useMemo((): TextBoxSpec | null => {
    if (!resolved || resolved.type !== "text_box") return null;
    const { slideId, element } = resolved;
    if (editSlideId === slideId && editElementId === element.id && liveSpec) {
      return liveSpec;
    }
    return element.spec;
  }, [resolved, liveSpec, editSlideId, editElementId]);

  const heading = theme.font_config.heading_family;
  const body = theme.font_config.body_family;

  const applyStylePatch = useCallback(
    (patch: Partial<TextRunStyle>) => {
      if (!resolved || resolved.type !== "text_box" || !specForTextOps) return;
      const base = specForTextOps;
      const range = textSelection;
      const whole =
        !range || isCollapsedRange(range);
      const next = whole ? applyDefaultStyleToWholeBox(base, patch) : applyRunStyleToRange(base, range, patch);
      updateSlideElement(resolved.slideId, resolved.element.id, { spec: next });
    },
    [resolved, specForTextOps, textSelection, updateSlideElement],
  );

  const onPatch = applyStylePatch;

  const onPatchAppearance = useCallback(
    (patch: { fill?: FillSpec; border?: BorderSpec | null }) => {
      if (!resolved || resolved.type !== "text_box") return;
      patchTextBoxAppearance(resolved.element, resolved.slideId, patch, updateSlideElement);
    },
    [resolved, updateSlideElement],
  );

  const onListStyle = useCallback(
    (listStyle: "none" | "bullet" | "numbered") => {
      if (!resolved || resolved.type !== "text_box" || !specForTextOps) return;
      const next = setListStyleOnRange(specForTextOps, textSelection, listStyle);
      updateSlideElement(resolved.slideId, resolved.element.id, { spec: next });
    },
    [resolved, specForTextOps, textSelection, updateSlideElement],
  );

  const onAlignment = useCallback(
    (alignment: "left" | "center" | "right" | "justify") => {
      if (!resolved || resolved.type !== "text_box" || !specForTextOps) return;
      const next = setAlignmentOnRange(specForTextOps, textSelection, alignment);
      updateSlideElement(resolved.slideId, resolved.element.id, { spec: next });
    },
    [resolved, specForTextOps, textSelection, updateSlideElement],
  );

  const onIndent = useCallback(
    (delta: 1 | -1) => {
      if (!resolved || resolved.type !== "text_box" || !specForTextOps) return;
      const next = bumpIndentOnRange(specForTextOps, textSelection, delta);
      updateSlideElement(resolved.slideId, resolved.element.id, { spec: next });
    },
    [resolved, specForTextOps, textSelection, updateSlideElement],
  );

  const paraFormats = useMemo(() => {
    return specForTextOps ? summarizeParagraphFormatsForRange(specForTextOps, textSelection) : null;
  }, [specForTextOps, textSelection]);

  if (!resolved) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Select a text box or shape on the slide to edit design properties.
        </Typography>
      </Box>
    );
  }

  if (resolved.type === "other") {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          This element type ({resolved.elementType}) has no Design controls yet.
        </Typography>
      </Box>
    );
  }

  if (resolved.type === "shape") {
    return <ShapeDesignInspector slideId={resolved.slideId} element={resolved.element} />;
  }

  const { element } = resolved;
  const ds = element.spec.default_style ?? {};
  const mode = fontFamilyMode(ds.font_family, heading, body);
  const sizePt = ds.font_size_pt ?? PLACEHOLDER_BODY_FONT_SIZE_PT;
  const color = ds.color ?? precisionLedgerColors.onSurface;
  const textColorSwatchValue = colorPickerValueFromRawColor(
    typeof ds.color === "string" ? ds.color : undefined,
    theme.color_palette,
    "#565e72",
  );

  const fill = element.spec.fill;
  const fillKind = fill.kind === "solid" && fill.color ? "solid" : "none";
  const fillColorPickerValue = colorPickerValueFromFill(fill, theme.color_palette);

  const border = element.spec.border;
  const borderOn = Boolean(border && border.style !== "none");
  const borderColorPickerValue = colorPickerValueFromRawColor(
    border && border.style !== "none" ? border.color : undefined,
    theme.color_palette,
    "#191c1e",
  );

  const commitFillColorFromPicker = (e: FormEvent<HTMLInputElement>) => {
    const hex = normalizeHexForColorInput(e.currentTarget.value.trim());
    if (hex) onPatchAppearance({ fill: { kind: "solid", color: hex } });
  };

  const commitBorderColorFromPicker = (e: FormEvent<HTMLInputElement>) => {
    const hex = normalizeHexForColorInput(e.currentTarget.value.trim());
    if (!hex || !border || border.style === "none") return;
    onPatchAppearance({
      border: { color: hex, width_pt: border.width_pt, style: border.style },
    });
  };

  const commitTextColorFromPicker = (e: FormEvent<HTMLInputElement>) => {
    const hex = normalizeHexForColorInput(e.currentTarget.value.trim());
    if (hex) onPatch({ color: hex });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
      <Typography variant="subtitle2" fontWeight={700} color={precisionLedgerColors.onSurface}>
        Text
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "JetBrains Mono, monospace" }}>
        text_box · {element.id.slice(0, 8)}…
      </Typography>

      <FormControl size="small" fullWidth>
        <InputLabel id="design-font-family-label">Font stack</InputLabel>
        <Select
          labelId="design-font-family-label"
          label="Font stack"
          value={mode}
          onChange={(e) => {
            const v = e.target.value as "heading" | "body" | "custom";
            if (v === "heading") onPatch({ font_family: heading });
            else if (v === "body") onPatch({ font_family: body });
            else onPatch({ font_family: ds.font_family ?? body });
          }}
        >
          <MenuItem value="heading">Heading (theme)</MenuItem>
          <MenuItem value="body">Body (theme)</MenuItem>
          <MenuItem value="custom">Custom</MenuItem>
        </Select>
      </FormControl>

      {mode === "custom" ? (
        <TextField
          size="small"
          label="Custom font CSS"
          fullWidth
          value={ds.font_family ?? ""}
          onChange={(e) => onPatch({ font_family: e.target.value || undefined })}
        />
      ) : null}

      <DebouncedNumericTextField
        size="small"
        label="Font size (pt)"
        fullWidth
        committed={Math.round(sizePt)}
        min={6}
        max={120}
        defaultValue={12}
        onCommit={(n) => onPatch({ font_size_pt: n })}
      />

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          Decoration
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <ToggleButton
            size="small"
            value="bold"
            selected={looksBold(ds)}
            onClick={() => {
              if (looksBold(ds)) {
                onPatch({ bold: false, font_weight: undefined });
              } else {
                onPatch({ bold: true, font_weight: undefined });
              }
            }}
            aria-label="Bold"
          >
            B
          </ToggleButton>
          <ToggleButton
            size="small"
            value="italic"
            selected={ds.italic === true}
            onClick={() => onPatch({ italic: ds.italic === true ? false : true })}
            aria-label="Italic"
          >
            I
          </ToggleButton>
          <ToggleButton
            size="small"
            value="underline"
            selected={ds.underline === true}
            onClick={() => onPatch({ underline: ds.underline === true ? false : true })}
            aria-label="Underline"
          >
            U
          </ToggleButton>
        </Stack>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          Paragraph
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <Tooltip title="Bulleted list" arrow>
            <ToggleButton
              size="small"
              value="bullet"
              selected={paraFormats?.listStyle === "bullet"}
              onClick={() => {
                const active = paraFormats?.listStyle === "bullet";
                onListStyle(active ? "none" : "bullet");
              }}
              aria-label="Bulleted list"
              sx={{
                ...(paraFormats?.listStyle === "bullet"
                  ? { outline: `2px solid ${precisionLedgerColors.primary}`, outlineOffset: 1 }
                  : null),
              }}
            >
              <FormatListBulleted fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Numbered list" arrow>
            <ToggleButton
              size="small"
              value="numbered"
              selected={paraFormats?.listStyle === "numbered"}
              onClick={() => {
                const active = paraFormats?.listStyle === "numbered";
                onListStyle(active ? "none" : "numbered");
              }}
              aria-label="Numbered list"
              sx={{
                ...(paraFormats?.listStyle === "numbered"
                  ? { outline: `2px solid ${precisionLedgerColors.primary}`, outlineOffset: 1 }
                  : null),
              }}
            >
              <FormatListNumbered fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Align left" arrow>
            <ToggleButton
              size="small"
              value="align-left"
              selected={paraFormats?.alignment === "left"}
              onClick={() => {
                if (paraFormats?.alignment !== "left") onAlignment("left");
              }}
              aria-label="Align left"
              sx={{
                ...(paraFormats?.alignment === "left"
                  ? { outline: `2px solid ${precisionLedgerColors.primary}`, outlineOffset: 1 }
                  : null),
              }}
            >
              <FormatAlignLeft fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Align center" arrow>
            <ToggleButton
              size="small"
              value="align-center"
              selected={paraFormats?.alignment === "center"}
              onClick={() => {
                if (paraFormats?.alignment !== "center") onAlignment("center");
              }}
              aria-label="Align center"
              sx={{
                ...(paraFormats?.alignment === "center"
                  ? { outline: `2px solid ${precisionLedgerColors.primary}`, outlineOffset: 1 }
                  : null),
              }}
            >
              <FormatAlignCenter fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Align right" arrow>
            <ToggleButton
              size="small"
              value="align-right"
              selected={paraFormats?.alignment === "right"}
              onClick={() => {
                if (paraFormats?.alignment !== "right") onAlignment("right");
              }}
              aria-label="Align right"
              sx={{
                ...(paraFormats?.alignment === "right"
                  ? { outline: `2px solid ${precisionLedgerColors.primary}`, outlineOffset: 1 }
                  : null),
              }}
            >
              <FormatAlignRight fontSize="small" />
            </ToggleButton>
          </Tooltip>

          <Tooltip title="Justify" arrow>
            <ToggleButton
              size="small"
              value="align-justify"
              selected={paraFormats?.alignment === "justify"}
              onClick={() => {
                if (paraFormats?.alignment !== "justify") onAlignment("justify");
              }}
              aria-label="Justify"
              sx={{
                ...(paraFormats?.alignment === "justify"
                  ? { outline: `2px solid ${precisionLedgerColors.primary}`, outlineOffset: 1 }
                  : null),
              }}
            >
              <FormatAlignJustify fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="small"
          variant="outlined"
          startIcon={<FormatIndentDecrease />}
          onClick={() => onIndent(-1)}
          aria-label="Decrease indent"
        >
          Outdent
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FormatIndentIncrease />}
          onClick={() => onIndent(1)}
          aria-label="Increase indent"
        >
          Indent
        </Button>
      </Stack>

      <Typography variant="subtitle2" fontWeight={700} color={precisionLedgerColors.onSurface} sx={{ mt: 1 }}>
        Appearance
      </Typography>

      <FormControl size="small" fullWidth>
        <InputLabel id="design-fill-kind-label">Background</InputLabel>
        <Select
          labelId="design-fill-kind-label"
          label="Background"
          value={fillKind}
          onChange={(e) => {
            const v = e.target.value as "none" | "solid";
            if (v === "none") onPatchAppearance({ fill: { kind: "none" } });
            else onPatchAppearance({ fill: { kind: "solid", color: fillColorPickerValue } });
          }}
        >
          <MenuItem value="none">None (transparent)</MenuItem>
          <MenuItem value="solid">Solid</MenuItem>
        </Select>
      </FormControl>

      {fillKind === "solid" ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            size="small"
            label="Background hex"
            fullWidth
            value={fill.kind === "solid" && fill.color ? fill.color : "#ffffff"}
            onChange={(e) => onPatchAppearance({ fill: { kind: "solid", color: e.target.value } })}
          />
          <Box
            component="input"
            type="color"
            value={fillColorPickerValue}
            onChange={commitFillColorFromPicker}
            onInput={commitFillColorFromPicker}
            onBlur={commitFillColorFromPicker}
            sx={{ width: 40, height: 36, p: 0, border: "none", cursor: "pointer" }}
            aria-label="Pick background color"
          />
        </Box>
      ) : null}

      <FormControl size="small" fullWidth>
        <InputLabel id="design-border-label">Border</InputLabel>
        <Select
          labelId="design-border-label"
          label="Border"
          value={borderOn ? "on" : "off"}
          onChange={(e) => {
            const v = e.target.value as "on" | "off";
            if (v === "off") onPatchAppearance({ border: null });
            else onPatchAppearance({ border: { color: borderColorPickerValue, width_pt: 1, style: "solid" } });
          }}
        >
          <MenuItem value="off">None</MenuItem>
          <MenuItem value="on">Solid</MenuItem>
        </Select>
      </FormControl>

      {borderOn ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            size="small"
            label="Border hex"
            fullWidth
            value={border && border.style !== "none" ? border.color : "#191c1e"}
            onChange={(e) =>
              onPatchAppearance({
                border: { color: e.target.value, width_pt: border?.width_pt ?? 1, style: "solid" },
              })
            }
          />
          <Box
            component="input"
            type="color"
            value={borderColorPickerValue}
            onChange={commitBorderColorFromPicker}
            onInput={commitBorderColorFromPicker}
            onBlur={commitBorderColorFromPicker}
            sx={{ width: 40, height: 36, p: 0, border: "none", cursor: "pointer" }}
            aria-label="Pick border color"
          />
        </Box>
      ) : null}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Text color
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            size="small"
            label="Hex"
            value={color}
            onChange={(e) => onPatch({ color: e.target.value })}
            sx={{ flex: 1 }}
          />
          <Box
            component="input"
            type="color"
            value={textColorSwatchValue}
            onChange={commitTextColorFromPicker}
            onInput={commitTextColorFromPicker}
            onBlur={commitTextColorFromPicker}
            sx={{ width: 40, height: 36, p: 0, border: "none", cursor: "pointer" }}
            aria-label="Pick color"
          />
        </Box>
      </Box>
    </Box>
  );
}
