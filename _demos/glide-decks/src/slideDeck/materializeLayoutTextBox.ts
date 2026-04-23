import type {
  LayoutElement,
  SlideDeckTheme,
  TextBoxSlideElement,
  TextBoxSpec,
  ThemeElement,
} from "../types/slideDeck";

import { createEmptyTextBoxSpec } from "./defaultTextBoxSpec";

import { getPlaceholderDefaultStyle, isTextRunStyleUnset } from "./placeholderTypography";

import { applyPlainTextToTextBoxSpec } from "./textBoxSpecPlainText";



function nowIso(): string {

  return new Date().toISOString();

}



/**

 * Builds a {@link TextBoxSpec} from a layout placeholder and theme, with the given plain text.

 * Shared by materialize and revert-to-layout so styling stays consistent.

 */

export function buildTextBoxSpecForLayoutPlaceholder(

  layoutEl: LayoutElement,

  theme: SlideDeckTheme,

  plainText: string,

): TextBoxSpec {

  let base: TextBoxSpec =

    layoutEl.element_type === "placeholder"

      ? (layoutEl.spec as TextBoxSpec)

      : createEmptyTextBoxSpec();

  const role = layoutEl.placeholder_role ?? base.placeholder_role;

  if (layoutEl.element_type === "placeholder" && role != null && isTextRunStyleUnset(base.default_style)) {

    base = { ...base, default_style: getPlaceholderDefaultStyle(theme, role) };

  }

  return applyPlainTextToTextBoxSpec(

    {

      ...base,

      placeholder_role: base.placeholder_role,

      placeholder_hint: base.placeholder_hint,

    },

    plainText,

  );

}



/**

 * Creates a slide-level text box from a layout placeholder, linked via `layout_element_id`.

 */

export function materializeLayoutPlaceholderTextBox(

  slideId: string,

  layoutEl: LayoutElement,

  theme: SlideDeckTheme,

): TextBoxSlideElement {

  const t = nowIso();

  const base: TextBoxSpec =

    layoutEl.element_type === "placeholder"

      ? (layoutEl.spec as TextBoxSpec)

      : createEmptyTextBoxSpec();

  const hint = base.placeholder_hint ?? "";

  const spec = buildTextBoxSpecForLayoutPlaceholder(layoutEl, theme, hint);

  return {

    id: crypto.randomUUID(),

    slide_id: slideId,

    element_type: "text_box",

    x: layoutEl.x,

    y: layoutEl.y,

    width: layoutEl.width,

    height: layoutEl.height,

    rotation_deg: 0,

    z_index: layoutEl.z_index,

    locked: false,

    hidden: false,

    layout_element_id: layoutEl.id,

    spec,

    created_at: t,

    updated_at: t,

  };

}

/**
 * Builds a {@link TextBoxSpec} from a theme master placeholder and theme, with the given plain text.
 * Shared by materialize and revert so styling stays consistent.
 */
export function buildTextBoxSpecForThemePlaceholder(
  themeEl: ThemeElement,
  theme: SlideDeckTheme,
  plainText: string,
): TextBoxSpec {
  let base: TextBoxSpec =
    themeEl.element_type === "placeholder" ? (themeEl.spec as TextBoxSpec) : createEmptyTextBoxSpec();
  const role = themeEl.placeholder_role ?? base.placeholder_role;
  if (themeEl.element_type === "placeholder" && role != null && isTextRunStyleUnset(base.default_style)) {
    base = { ...base, default_style: getPlaceholderDefaultStyle(theme, role) };
  }
  return applyPlainTextToTextBoxSpec(
    {
      ...base,
      placeholder_role: base.placeholder_role,
      placeholder_hint: base.placeholder_hint,
    },
    plainText,
  );
}

/**
 * Creates a slide-level text box from a theme master placeholder, linked via `theme_element_id`.
 */
export function materializeThemePlaceholderTextBox(
  slideId: string,
  themeEl: ThemeElement,
  theme: SlideDeckTheme,
): TextBoxSlideElement {
  const t = nowIso();
  const base: TextBoxSpec =
    themeEl.element_type === "placeholder" ? (themeEl.spec as TextBoxSpec) : createEmptyTextBoxSpec();
  const hint = base.placeholder_hint ?? "";
  const spec = buildTextBoxSpecForThemePlaceholder(themeEl, theme, hint);
  return {
    id: crypto.randomUUID(),
    slide_id: slideId,
    element_type: "text_box",
    x: themeEl.x,
    y: themeEl.y,
    width: themeEl.width,
    height: themeEl.height,
    rotation_deg: 0,
    z_index: themeEl.z_index,
    locked: false,
    hidden: false,
    theme_element_id: themeEl.id,
    spec,
    created_at: t,
    updated_at: t,
  };
}


