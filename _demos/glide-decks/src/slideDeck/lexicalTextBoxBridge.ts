import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getCharacterOffsets,
  $getRoot,
  $getSelection,
  $isLineBreakNode,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  type LexicalEditor,
  type ParagraphNode,
  type TextNode,
  IS_BOLD,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_UNDERLINE,
} from "lexical";
import { mergeTextRunStyle, textRunStyleToCss } from "./placeholderTypography";
import type { SlideDeckTheme } from "../types/slideDeck";
import type { TextBoxSpec, TextParagraph, TextRun, TextRunStyle } from "../types/slideDeck";
import { newTextId } from "./textBoxSpecEditing/ids";
import { offsetToPosition, type DocRange } from "./textBoxSpecEditing/docPositions";

function defaultParagraphStyle(): TextParagraph["paragraph_style"] {
  return {
    alignment: "left",
    indent_level: 0,
    space_before_pt: 0,
    space_after_pt: 0,
    line_spacing: 1,
    list_style: "none",
  };
}

function lexicalFormatToRunStyle(format: number): Partial<TextRunStyle> {
  const s: Partial<TextRunStyle> = {};
  if (format & IS_BOLD) s.bold = true;
  if (format & IS_ITALIC) s.italic = true;
  if (format & IS_UNDERLINE) s.underline = true;
  if (format & IS_STRIKETHROUGH) s.strikethrough = true;
  return s;
}

function runStyleToFormat(style: TextRunStyle): number {
  let f = 0;
  if (style.bold === true || (style.font_weight != null && style.font_weight >= 600)) f |= IS_BOLD;
  if (style.italic === true) f |= IS_ITALIC;
  if (style.underline === true) f |= IS_UNDERLINE;
  if (style.strikethrough === true) f |= IS_STRIKETHROUGH;
  return f;
}

function runStyleToNodeStyleString(style: TextRunStyle, theme: SlideDeckTheme): string {
  const css = textRunStyleToCss(style, theme);
  const parts: string[] = [];
  if (css.color) parts.push(`color: ${css.color}`);
  if (css.fontFamily) parts.push(`font-family: ${css.fontFamily}`);
  if (css.fontSize) parts.push(`font-size: ${css.fontSize}`);
  if (css.fontWeight != null) parts.push(`font-weight: ${String(css.fontWeight)}`);
  if (css.fontStyle) parts.push(`font-style: ${css.fontStyle}`);
  if (css.textDecoration) parts.push(`text-decoration: ${css.textDecoration}`);
  return parts.join("; ");
}

function parseNodeStyleString(style: string): Partial<TextRunStyle> {
  const out: Partial<TextRunStyle> = {};
  if (!style.trim()) return out;
  const colorM = /color:\s*([^;]+)/i.exec(style);
  if (colorM) out.color = colorM[1]!.trim();
  const ffM = /font-family:\s*([^;]+)/i.exec(style);
  if (ffM) out.font_family = ffM[1]!.trim().replace(/^["']|["']$/g, "");
  const fsM = /font-size:\s*([\d.]+)px/i.exec(style);
  if (fsM) {
    const px = Number(fsM[1]);
    if (Number.isFinite(px)) out.font_size_pt = (px * 72) / 96;
  }
  const fwM = /font-weight:\s*(\d+)/i.exec(style);
  if (fwM) out.font_weight = Number(fwM[1]);
  return out;
}

function appendRunPartsToParagraph(
  para: ParagraphNode,
  text: string,
  style: TextRunStyle,
  theme: SlideDeckTheme,
): void {
  const segments = text.split("\n");
  for (let i = 0; i < segments.length; i++) {
    if (i > 0) para.append($createLineBreakNode());
    const seg = segments[i]!;
    if (seg.length === 0) continue;
    const node = $createTextNode(seg);
    node.setFormat(runStyleToFormat(style));
    const s = runStyleToNodeStyleString(style, theme);
    if (s) node.setStyle(s);
    para.append(node);
  }
}

function paragraphNodeToRuns(para: ParagraphNode): TextRun[] {
  const runs: TextRun[] = [];
  let buf = "";
  let bufMerged: TextRunStyle = {};

  function flush() {
    if (buf.length === 0) return;
    runs.push({
      id: newTextId(),
      text: buf,
      style: bufMerged,
    });
    buf = "";
  }

  const children = para.getChildren();
  for (const ch of children) {
    if ($isLineBreakNode(ch)) {
      buf += "\n";
      continue;
    }
    if ($isTextNode(ch)) {
      const tn = ch as TextNode;
      const t = tn.getTextContent();
      const fmt = tn.getFormat();
      const styleStr = tn.getStyle() ?? "";
      const parsed = parseNodeStyleString(styleStr);
      const fromLex = lexicalFormatToRunStyle(fmt);
      const merged: TextRunStyle = { ...parsed, ...fromLex };
      if (buf.length === 0) {
        buf = t;
        bufMerged = merged;
      } else if (JSON.stringify(bufMerged) === JSON.stringify(merged)) {
        buf += t;
      } else {
        flush();
        buf = t;
        bufMerged = merged;
      }
    }
  }
  flush();
  return runs.length > 0 ? runs : [{ id: newTextId(), text: "", style: {} }];
}

/** Populate root from TextBoxSpec (call inside editor.update). */
export function $initEditorFromTextBoxSpec(spec: TextBoxSpec, theme: SlideDeckTheme): void {
  const root = $getRoot();
  root.clear();
  for (const p of spec.paragraphs) {
    const para = $createParagraphNode();
    for (const r of p.runs) {
      const merged = mergeTextRunStyle(spec.default_style ?? {}, r.style);
      appendRunPartsToParagraph(para, r.text, merged, theme);
    }
    if (para.getChildrenSize() === 0) {
      para.append($createTextNode(""));
    }
    root.append(para);
  }
  if (spec.paragraphs.length === 0) {
    const para = $createParagraphNode();
    para.append($createTextNode(""));
    root.append(para);
  }
}

/**
 * Merge Lexical text/runs with the authoritative non-text fields from `spec` (paragraph styles, fill,
 * default_style, etc.). Use this on every editor change so Design panel list/indent updates stay in sync.
 */
export function mergeLexicalContentWithSpec(editor: LexicalEditor, spec: TextBoxSpec, theme: SlideDeckTheme): TextBoxSpec {
  const parsed = textBoxSpecFromLexicalEditor(editor, spec, theme);
  const fallbackPs = spec.paragraphs[spec.paragraphs.length - 1]?.paragraph_style ?? defaultParagraphStyle();
  return {
    ...spec,
    paragraphs: parsed.paragraphs.map((p, i) => ({
      id: spec.paragraphs[i]?.id ?? p.id,
      runs: p.runs,
      paragraph_style: spec.paragraphs[i]?.paragraph_style ?? fallbackPs,
    })),
  };
}

export function textBoxSpecFromLexicalEditor(editor: LexicalEditor, previous: TextBoxSpec, _theme: SlideDeckTheme): TextBoxSpec {
  let paragraphs: TextParagraph[] = [];
  editor.getEditorState().read(() => {
    const root = $getRoot();
    const children = root.getChildren();
    paragraphs = [];
    for (let i = 0; i < children.length; i++) {
      const ch = children[i];
      if (!$isParagraphNode(ch)) continue;
      const prevPara = previous.paragraphs[i];
      const runs = paragraphNodeToRuns(ch);
      paragraphs.push({
        id: prevPara?.id ?? newTextId(),
        runs,
        paragraph_style: prevPara?.paragraph_style ?? defaultParagraphStyle(),
      });
    }
  });

  if (paragraphs.length === 0) {
    paragraphs = [
      {
        id: newTextId(),
        runs: [{ id: newTextId(), text: "", style: {} }],
        paragraph_style: previous.paragraphs[0]?.paragraph_style ?? defaultParagraphStyle(),
      },
    ];
  }

  return {
    ...previous,
    paragraphs,
  };
}

export function docRangeFromLexicalOffsets(spec: TextBoxSpec, anchorOff: number, focusOff: number): DocRange | null {
  const a = offsetToPosition(spec, anchorOff);
  const f = offsetToPosition(spec, focusOff);
  if (!a || !f) return null;
  return { anchor: a, focus: f };
}

export function selectionToDocRange(editor: LexicalEditor, liveSpec: TextBoxSpec): DocRange | null {
  let anchorOff = 0;
  let focusOff = 0;
  let ok = false;
  editor.getEditorState().read(() => {
    const sel = $getSelection();
    if (!$isRangeSelection(sel)) return;
    const [a, f] = $getCharacterOffsets(sel);
    anchorOff = a;
    focusOff = f;
    ok = true;
  });
  if (!ok) return null;
  return docRangeFromLexicalOffsets(liveSpec, anchorOff, focusOff);
}
