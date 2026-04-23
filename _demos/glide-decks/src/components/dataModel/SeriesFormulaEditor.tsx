import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useDeferredValue,
  type MutableRefObject,
} from "react";
import { flushSync } from "react-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { validationContextFromSeriesRows, validateFormula } from "../../formula";
import { outermostCallFunctionName } from "../../formula/printFormula";
import { parseFormula } from "../../formula/parseFormula";
import type { DataSeriesAssetRow } from "../../types/dataModel";
import type { DisplayNameSource } from "../../types/seriesGridEditor";
import { tokens } from "../../theme/tokens";
import {
  applyMention,
  filterAndSortSeries,
  parseMentionAtCursor,
} from "../../utils/seriesMentionAutocomplete";
import { getTextareaCaretRect } from "../../utils/textareaCaretRect";

const editorWell = "#06090f";
const editorBorder = "rgba(255,255,255,0.1)";

/** Parent `columns` updates re-render the full grid; debounce syncing formula text and series name. */
const PARENT_SYNC_DEBOUNCE_MS = 400;

/** Debounce auto-generated `fx.FN NN` display names while the formula is lint-clean. */
const AUTO_DISPLAY_NAME_DEBOUNCE_MS = 260;

export interface SeriesFormulaEditorProps {
  /** Catalog series available for @-references. */
  availableSeries: DataSeriesAssetRow[];
  /** Current catalog/display name (editable above the formula). */
  seriesName: string;
  /** User edited the name field — parent should update draft name and lock auto-naming. */
  onSeriesNameUserInput: (name: string) => void;
  /** When `auto_placeholder`, parent may apply debounced auto names from the formula. */
  displayNameSource: DisplayNameSource;
  /** Given uppercase outer function id (e.g. MEDIAN_BY), return a unique `fx.MEDIAN_BY 01` style name, or null to skip. */
  suggestAutoFormulaDisplayName?: (outerFnUpper: string) => string | null;
  onAutoSuggestedSeriesName?: (name: string) => void;
  /** Row count / series length for context. */
  valueLength: number;
  value: string;
  /** Last saved formula (for dirty detection; local draft may diverge until debounced sync). */
  savedRawFormula?: string;
  onChange: (next: string) => void;
  onSave: () => void;
  onCancel: () => void;
  /**
   * When false, Save is disabled (no changes vs last saved).
   * Ignored when `savedRawFormula` is provided — dirty state is computed locally from draft vs saved.
   */
  saveDisabled?: boolean;
  /** After the user picks a series from an @-mention (click or Enter), parent may add it as a grid column. */
  onSeriesMentionCommitted?: (seriesName: string) => void;
  /**
   * Parent sets this to flush pending debounced `onChange` (e.g. before dirty checks / save) so column state
   * matches the textarea.
   */
  flushParentRef?: MutableRefObject<(() => void) | null>;
}

/**
 * Dark formula workspace matching Stitch “Data Model — Series Editors” (formula block):
 * chrome header, JetBrains Mono body, primary Save + text Cancel.
 */
export function SeriesFormulaEditor({
  availableSeries,
  seriesName,
  onSeriesNameUserInput,
  displayNameSource,
  suggestAutoFormulaDisplayName,
  onAutoSuggestedSeriesName,
  valueLength,
  value,
  savedRawFormula,
  onChange,
  onSave,
  onCancel,
  saveDisabled = false,
  onSeriesMentionCommitted,
  flushParentRef,
}: SeriesFormulaEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  /** Local text — updates every keystroke without lifting to parent immediately. */
  const [draft, setDraft] = useState(value);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  /** Local series name — parent `columns` sync is debounced like formula body. */
  const [draftSeriesName, setDraftSeriesName] = useState(seriesName);
  const draftSeriesNameRef = useRef(draftSeriesName);
  draftSeriesNameRef.current = draftSeriesName;
  const nameFieldFocusedRef = useRef(false);

  const [sel, setSel] = useState({ start: 0, end: 0 });
  const [closedByEscape, setClosedByEscape] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const parentSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seriesNameParentSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingSeriesNameSync = useCallback(() => {
    if (seriesNameParentSyncTimerRef.current != null) {
      clearTimeout(seriesNameParentSyncTimerRef.current);
      seriesNameParentSyncTimerRef.current = null;
    }
  }, []);

  const clearPendingParentSync = useCallback(() => {
    if (parentSyncTimerRef.current != null) {
      clearTimeout(parentSyncTimerRef.current);
      parentSyncTimerRef.current = null;
    }
  }, []);

  const flushSeriesNameParentSync = useCallback(() => {
    clearPendingSeriesNameSync();
    onSeriesNameUserInput(draftSeriesNameRef.current);
  }, [clearPendingSeriesNameSync, onSeriesNameUserInput]);

  const scheduleSeriesNameParentSync = useCallback(
    (next: string) => {
      if (seriesNameParentSyncTimerRef.current != null) clearTimeout(seriesNameParentSyncTimerRef.current);
      seriesNameParentSyncTimerRef.current = setTimeout(() => {
        seriesNameParentSyncTimerRef.current = null;
        onSeriesNameUserInput(next);
      }, PARENT_SYNC_DEBOUNCE_MS);
    },
    [onSeriesNameUserInput],
  );

  const flushParentSync = useCallback(
    (next: string) => {
      clearPendingParentSync();
      onChange(next);
    },
    [clearPendingParentSync, onChange],
  );

  const scheduleParentSync = useCallback(
    (next: string) => {
      if (parentSyncTimerRef.current != null) clearTimeout(parentSyncTimerRef.current);
      parentSyncTimerRef.current = setTimeout(() => {
        parentSyncTimerRef.current = null;
        onChange(next);
      }, PARENT_SYNC_DEBOUNCE_MS);
    },
    [onChange],
  );

  useEffect(
    () => () => {
      clearPendingParentSync();
      clearPendingSeriesNameSync();
    },
    [clearPendingParentSync, clearPendingSeriesNameSync],
  );

  /** When parent renames programmatically (e.g. auto `fx.*`) and the name field is not focused, stay in sync. */
  useEffect(() => {
    if (nameFieldFocusedRef.current) return;
    setDraftSeriesName(seriesName);
  }, [seriesName]);

  useEffect(() => {
    if (!flushParentRef) return;
    flushParentRef.current = () => {
      flushParentSync(draftRef.current);
      flushSeriesNameParentSync();
    };
    return () => {
      flushParentRef.current = null;
    };
  }, [flushParentRef, flushParentSync, flushSeriesNameParentSync]);

  const caretPos = useMemo(() => Math.max(sel.start, sel.end), [sel.start, sel.end]);

  const activeMention = useMemo(
    () => parseMentionAtCursor(draft, caretPos),
    [draft, caretPos],
  );

  const filtered = useMemo(
    () =>
      activeMention ? filterAndSortSeries(availableSeries, activeMention.query) : [],
    [availableSeries, activeMention],
  );

  const mentionOpen =
    Boolean(activeMention) && filtered.length > 0 && !closedByEscape;

  useEffect(() => {
    setHighlightIndex(0);
  }, [activeMention?.mentionStart, activeMention?.query]);

  useEffect(() => {
    setHighlightIndex((i) => Math.min(i, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  useEffect(() => {
    setClosedByEscape(false);
  }, [draft]);

  const syncSelectionFromEl = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    setSel({
      start: el.selectionStart ?? 0,
      end: el.selectionEnd ?? 0,
    });
  }, []);

  const virtualAnchor = useMemo(() => {
    if (!mentionOpen || !textareaRef.current || !activeMention) return null;
    const el = textareaRef.current;
    return {
      getBoundingClientRect: () => getTextareaCaretRect(el, caretPos),
    };
  }, [mentionOpen, activeMention, caretPos, draft, sel.start, sel.end]);

  const validationCtx = useMemo(
    () => validationContextFromSeriesRows(availableSeries),
    [availableSeries],
  );

  const deferredDraftForValidation = useDeferredValue(draft);

  const formulaDiagnostics = useMemo(() => {
    const trimmed = deferredDraftForValidation.trim();
    if (!trimmed) return [];
    return validateFormula(trimmed, validationCtx).diagnostics.filter((d) => d.severity === "error");
  }, [deferredDraftForValidation, validationCtx]);

  useEffect(() => {
    if (displayNameSource !== "auto_placeholder") return;
    if (!suggestAutoFormulaDisplayName || !onAutoSuggestedSeriesName) return;
    const trimmed = deferredDraftForValidation.trim();
    if (!trimmed) return;
    if (formulaDiagnostics.length > 0) return;
    const p = parseFormula(trimmed);
    if (!p.ok) return;
    const fn = outermostCallFunctionName(p.ast);
    if (!fn) return;
    const t = window.setTimeout(() => {
      const suggested = suggestAutoFormulaDisplayName(fn);
      const local = draftSeriesNameRef.current.trim();
      if (suggested && suggested !== local) {
        onAutoSuggestedSeriesName(suggested);
      }
    }, AUTO_DISPLAY_NAME_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [
    deferredDraftForValidation,
    displayNameSource,
    formulaDiagnostics.length,
    onAutoSuggestedSeriesName,
    suggestAutoFormulaDisplayName,
  ]);

  const applySeriesPick = useCallback(
    (row: DataSeriesAssetRow) => {
      if (!activeMention) return;
      const next = applyMention(draft, activeMention.mentionStart, activeMention.cursorPos, row.name);
      setDraft(next);
      flushParentSync(next);
      onSeriesMentionCommitted?.(row.name);
      const newCaret = activeMention.mentionStart + row.name.length + 2;
      setClosedByEscape(false);
      requestAnimationFrame(() => {
        const ta = textareaRef.current;
        if (ta) {
          ta.focus();
          ta.setSelectionRange(newCaret, newCaret);
          setSel({ start: newCaret, end: newCaret });
        }
      });
    },
    [activeMention, draft, flushParentSync, onSeriesMentionCommitted],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setDraft(next);
      scheduleParentSync(next);
      queueMicrotask(() => syncSelectionFromEl(textareaRef.current));
    },
    [scheduleParentSync, syncSelectionFromEl],
  );

  const handleBlur = useCallback(() => {
    flushParentSync(draftRef.current);
  }, [flushParentSync]);

  const handleCancelClick = useCallback(() => {
    clearPendingParentSync();
    clearPendingSeriesNameSync();
    onCancel();
  }, [clearPendingParentSync, clearPendingSeriesNameSync, onCancel]);

  const handleSaveClick = useCallback(() => {
    flushSync(() => {
      flushParentSync(draftRef.current);
      flushSeriesNameParentSync();
    });
    onSave();
  }, [flushParentSync, flushSeriesNameParentSync, onSave]);

  const saveButtonDisabled =
    savedRawFormula !== undefined ? draft === (savedRawFormula ?? "") : saveDisabled;

  const commitHighlightedMention = useCallback(() => {
    const row = filtered[highlightIndex];
    if (row) applySeriesPick(row);
  }, [filtered, highlightIndex, applySeriesPick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!mentionOpen || !activeMention) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        commitHighlightedMention();
        return;
      }
      if (e.key === "Tab" && !e.shiftKey) {
        if (filtered.length === 0) return;
        e.preventDefault();
        commitHighlightedMention();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setClosedByEscape(true);
      }
    },
    [mentionOpen, activeMention, filtered, commitHighlightedMention],
  );

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: 0,
        border: `1px solid ${tokens.colorBorder}`,
        borderTop: "none",
        overflow: "hidden",
        bgcolor: tokens.colorChrome,
        color: "rgba(255,255,255,0.95)",
        boxShadow: "0 -8px 28px rgba(13, 21, 38, 0.18)",
      }}
    >
      <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${editorBorder}` }}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          letterSpacing={0.06}
          sx={{ fontSize: "0.7rem", textTransform: "uppercase", opacity: 0.92 }}
        >
          Formula Editor
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            opacity: 0.78,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.7rem",
          }}
        >
          Length={valueLength}
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 1.5, bgcolor: editorWell, position: "relative" }}>
        <TextField
          fullWidth
          size="small"
          label="Series name"
          value={draftSeriesName}
          onChange={(e) => {
            const next = e.target.value;
            setDraftSeriesName(next);
            scheduleSeriesNameParentSync(next);
          }}
          onFocus={() => {
            nameFieldFocusedRef.current = true;
          }}
          onBlur={() => {
            nameFieldFocusedRef.current = false;
            flushSeriesNameParentSync();
          }}
          placeholder="Catalog / grid column name"
          sx={{
            mb: 1.25,
            "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.55)" },
            "& .MuiOutlinedInput-root": {
              fontSize: "0.85rem",
              bgcolor: "rgba(0,0,0,0.35)",
              color: "rgba(255,255,255,0.92)",
            },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: editorBorder },
          }}
        />
        <TextField
          multiline
          minRows={5}
          maxRows={14}
          fullWidth
          value={draft}
          onChange={handleChange}
          onBlur={handleBlur}
          inputRef={textareaRef}
          inputProps={{
            onKeyDown: handleKeyDown,
            onSelect: (e: React.SyntheticEvent<HTMLTextAreaElement>) =>
              syncSelectionFromEl(e.currentTarget),
            onClick: (e: React.MouseEvent<HTMLTextAreaElement>) => syncSelectionFromEl(e.currentTarget),
            onKeyUp: (e: React.KeyboardEvent<HTMLTextAreaElement>) => syncSelectionFromEl(e.currentTarget),
            spellCheck: false,
          }}
          placeholder={'=MEDIAN_BY([Base Salary], [idx.Job Family])'}
          spellCheck={false}
          sx={{
            "& .MuiOutlinedInput-root": {
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.8rem",
              lineHeight: 1.5,
              bgcolor: "rgba(0,0,0,0.35)",
              color: "rgba(255,255,255,0.92)",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: editorBorder,
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.18)",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: tokens.colorPrimary,
            },
            "& .MuiInputBase-input::placeholder": {
              color: "rgba(255,255,255,0.28)",
              opacity: 1,
            },
          }}
        />
        {formulaDiagnostics.length > 0 && (
          <Typography
            component="div"
            variant="caption"
            role="alert"
            sx={{
              mt: 1,
              color: "rgba(255,180,160,0.95)",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.72rem",
              lineHeight: 1.45,
            }}
          >
            {formulaDiagnostics.map((d) => (
              <div key={`${d.code}:${d.message}`}>{d.message}</div>
            ))}
          </Typography>
        )}

        <Popper
          open={mentionOpen && virtualAnchor != null}
          anchorEl={virtualAnchor ?? undefined}
          placement="bottom-start"
          style={{ zIndex: 1400 }}
          modifiers={[
            { name: "offset", options: { offset: [0, 4] } },
            { name: "flip", enabled: true },
            { name: "preventOverflow", enabled: true },
          ]}
        >
          <Paper
            elevation={8}
            sx={{
              maxHeight: 280,
              overflow: "auto",
              minWidth: 280,
              maxWidth: 420,
              bgcolor: "#0f1624",
              border: `1px solid ${editorBorder}`,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            <List dense disablePadding>
              {filtered.map((row, i) => (
                <ListItemButton
                  key={row.name}
                  selected={i === highlightIndex}
                  onMouseDown={(ev) => {
                    ev.preventDefault();
                    applySeriesPick(row);
                  }}
                  onMouseEnter={() => setHighlightIndex(i)}
                  sx={{
                    py: 0.75,
                    "&.Mui-selected": {
                      bgcolor: "rgba(232, 71, 42, 0.22)",
                    },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                  }}
                >
                  <ListItemText
                    primary={`[${row.name}] (Len: ${row.length})`}
                    primaryTypographyProps={{
                      variant: "body2",
                      sx: { fontFamily: '"JetBrains Mono", monospace', fontSize: "0.75rem" },
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "flex-end",
          gap: 1,
          px: 2,
          py: 1.25,
          borderTop: `1px solid ${editorBorder}`,
          bgcolor: tokens.colorChrome,
        }}
      >
        <Button
          variant="text"
          color="inherit"
          onClick={handleCancelClick}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.75)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveClick}
          disabled={saveButtonDisabled}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.8rem",
            px: 2,
            boxShadow: "none",
            background: `linear-gradient(135deg, ${tokens.colorPrimary} 0%, #c73a22 100%)`,
            "&:hover": { boxShadow: "0 4px 14px rgba(232, 71, 42, 0.35)" },
          }}
        >
          Save formula
        </Button>
      </Box>
    </Paper>
  );
}
