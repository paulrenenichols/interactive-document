import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import Box from "@mui/material/Box";
import {
  COMMAND_PRIORITY_LOW,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  LineBreakNode,
  ParagraphNode,
  TextNode,
  mergeRegister,
  type LexicalEditor,
} from "lexical";
import { useCallback, useEffect, useRef } from "react";
import {
  $initEditorFromTextBoxSpec,
  mergeLexicalContentWithSpec,
  selectionToDocRange,
} from "../../slideDeck/lexicalTextBoxBridge";
import type { DocRange } from "../../slideDeck/textBoxSpecEditing/docPositions";
import { textRunStyleToCss } from "../../slideDeck/placeholderTypography";
import { listMarkerGutterPx } from "../../slideDeck/listMarkerGutterPx";
import { paragraphPaddingLeftPx } from "../../slideDeck/listParagraphLayoutPx";
import { computeParagraphMarkers } from "../../slideDeck/textParagraphMarkers";
import { emuToPx } from "../../slideDeck/units";
import type { SlideDeckTheme, TextBoxSpec } from "../../types/slideDeck";
function EnterCommitPlugin({
  multiParagraph,
  onCommit,
}: {
  multiParagraph: boolean;
  onCommit: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (ev: KeyboardEvent | null) => {
          if (!multiParagraph) {
            ev?.preventDefault();
            onCommit();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, multiParagraph, onCommit]);
  return null;
}

function ChangeBridgePlugin({
  specRef,
  theme,
  onEditStateChange,
}: {
  specRef: React.MutableRefObject<TextBoxSpec>;
  theme: SlideDeckTheme;
  onEditStateChange: (spec: TextBoxSpec, range: DocRange | null) => void;
}) {
  return (
    <OnChangePlugin
      onChange={(_state, editor) => {
        const next = mergeLexicalContentWithSpec(editor, specRef.current, theme);
        const r = selectionToDocRange(editor, next);
        onEditStateChange(next, r);
      }}
    />
  );
}

export interface SlideTextBoxLexicalEditorProps {
  spec: TextBoxSpec;
  theme: SlideDeckTheme;
  pxPerEmu: number;
  multiParagraph: boolean;
  onEditStateChange: (next: TextBoxSpec, range: DocRange | null) => void;
  onCommit: () => void;
  onCancel: () => void;
  backgroundColor: string;
  editorKey: string;
}

function EscapeCancelPlugin({ onCancel }: { onCancel: () => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          onCancel();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, onCancel]);
  return null;
}

/** After mount (e.g. typing-to-start), focus was left on the slide root; move focus into Lexical (caret at root end). */
function MountFocusPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      editor.focus(undefined, { defaultSelection: "rootEnd" });
    });
    return () => cancelAnimationFrame(id);
  }, [editor]);
  return null;
}

function ParagraphStyleDecorationsPlugin({
  specRef,
  theme,
  pxPerEmu,
}: {
  specRef: React.MutableRefObject<TextBoxSpec>;
  theme: SlideDeckTheme;
  pxPerEmu: number;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    function applyDecorations() {
      const spec = specRef.current;
      const root = editor.getRootElement();
      if (!root) return;

      const paragraphs = Array.from(root.querySelectorAll("p"));
      const markers = computeParagraphMarkers(spec.paragraphs, theme);

      for (let i = 0; i < paragraphs.length; i++) {
        const pEl = paragraphs[i] as HTMLParagraphElement;
        const para = spec.paragraphs[i];
        if (!para) continue;
        const ps = para.paragraph_style;
        const markerInfo = markers[i];
        const bl = markerInfo?.bulletLevel;
        const indentPx = bl ? emuToPx(bl.indent_emu, pxPerEmu) : 0;
        const paddingLeftPx = bl ? paragraphPaddingLeftPx(ps, bl, pxPerEmu) : 0;

        pEl.style.margin = "0";
        pEl.style.marginBlock = "0";
        pEl.style.paddingLeft = `${paddingLeftPx}px`;
        pEl.style.textAlign = ps.alignment;

        const marker = markerInfo?.marker ?? null;
        if (!marker || !bl) {
          delete (pEl as any).dataset.marker;
          pEl.style.removeProperty("--gd-marker-left");
          pEl.style.removeProperty("--gd-marker-width");
          if (pEl.style.position === "relative") pEl.style.position = "";
          continue;
        }

        const gutterPx = listMarkerGutterPx({ hangingEmu: bl.hanging_emu, marker, bulletLevel: bl, pxPerEmu });
        pEl.dataset.marker = marker;
        pEl.style.position = "relative";
        pEl.style.setProperty("--gd-marker-left", `${Math.max(0, indentPx - gutterPx)}px`);
        pEl.style.setProperty("--gd-marker-width", `${gutterPx}px`);
      }
    }

    applyDecorations();
    return editor.registerUpdateListener(() => {
      applyDecorations();
    });
  }, [editor, pxPerEmu, specRef, theme]);

  return null;
}

export function SlideTextBoxLexicalEditor({
  spec,
  theme,
  pxPerEmu,
  multiParagraph,
  onEditStateChange,
  onCommit,
  onCancel,
  backgroundColor,
  editorKey,
}: SlideTextBoxLexicalEditorProps) {
  const specRef = useRef(spec);
  specRef.current = spec;

  const handleEditState = useCallback(
    (s: TextBoxSpec, range: DocRange | null) => {
      onEditStateChange(s, range);
    },
    [onEditStateChange],
  );

  const baseCss = textRunStyleToCss(spec.default_style ?? {}, theme);

  const initialConfig = {
    namespace: `SlideTextBox-${editorKey}`,
    theme: {},
    nodes: [ParagraphNode, TextNode, LineBreakNode],
    onError: console.error,
    editable: true,
    editorState: (editor: LexicalEditor) => {
      editor.update(() => {
        $initEditorFromTextBoxSpec(spec, theme);
      });
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig} key={editorKey}>
      <Box
        sx={{
          width: "100%",
          minHeight: 24,
          position: "relative",
          '& [data-lexical-editor="true"] p': {
            margin: 0,
            marginBlock: 0,
          },
          '& [data-lexical-editor="true"] p[data-marker]::before': {
            content: "attr(data-marker)",
            position: "absolute",
            left: "var(--gd-marker-left, 0px)",
            width: "var(--gd-marker-width, 0px)",
            textAlign: "right",
            whiteSpace: "nowrap",
            userSelect: "none",
            pointerEvents: "none",
          },
        }}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              style={{
                ...baseCss,
                width: "100%",
                minHeight: "100%",
                resize: "none",
                border: "none",
                outline: "none",
                background: backgroundColor,
                padding: 4,
                boxSizing: "border-box",
                cursor: "text",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "stretch",
              }}
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <MountFocusPlugin />
        <EnterCommitPlugin multiParagraph={multiParagraph} onCommit={onCommit} />
        <EscapeCancelPlugin onCancel={onCancel} />
        <ParagraphStyleDecorationsPlugin specRef={specRef} theme={theme} pxPerEmu={pxPerEmu} />
        <ChangeBridgePlugin specRef={specRef} theme={theme} onEditStateChange={handleEditState} />
      </Box>
    </LexicalComposer>
  );
}
