import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  commitIntegerDraft,
  filterIntegerDraftInput,
  parseCompleteIntegerInRange,
} from "../utils/parseNumericDraft";

export interface UseDebouncedNumericDraftParams {
  committed: number;
  min: number;
  max: number;
  defaultValue: number;
  allowNegative?: boolean;
  /** Called when debounced preview applies and on blur (final clamped value). */
  onCommit: (n: number) => void;
  debounceMs?: number;
}

/**
 * String draft while focused; debounced commits when the draft is a complete integer in range;
 * full commit + clamp on blur. Use with `type="text"` and {@link filterIntegerDraftInput}.
 */
export function useDebouncedNumericDraft({
  committed,
  min,
  max,
  defaultValue,
  allowNegative = false,
  onCommit,
  debounceMs = 200,
}: UseDebouncedNumericDraftParams) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const displayValue = focused ? draft : String(committed);

  const schedulePreview = useCallback(
    (nextDraft: string) => {
      clearTimer();
      const parsed = parseCompleteIntegerInRange(nextDraft, min, max, allowNegative);
      if (parsed == null) return;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onCommitRef.current(parsed);
      }, debounceMs);
    },
    [allowNegative, clearTimer, debounceMs, max, min],
  );

  const onFocus = useCallback(() => {
    setFocused(true);
    setDraft(String(committed));
  }, [committed]);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const filtered = filterIntegerDraftInput(e.target.value, allowNegative);
      setDraft(filtered);
      schedulePreview(filtered);
    },
    [allowNegative, schedulePreview],
  );

  const onBlur = useCallback(() => {
    clearTimer();
    setFocused(false);
    const final = commitIntegerDraft(draft, min, max, defaultValue, allowNegative);
    onCommitRef.current(final);
  }, [allowNegative, clearTimer, defaultValue, draft, max, min]);

  const inputMode = allowNegative ? "text" : "numeric";

  return {
    value: displayValue,
    onChange,
    onFocus,
    onBlur,
    inputMode,
  } as const;
}
