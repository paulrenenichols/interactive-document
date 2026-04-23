import TextField, { type TextFieldProps } from "@mui/material/TextField";
import { useDebouncedNumericDraft } from "../../hooks/useDebouncedNumericDraft";

export interface DebouncedNumericTextFieldProps
  extends Omit<TextFieldProps, "value" | "onChange" | "type" | "onFocus" | "onBlur"> {
  committed: number;
  min: number;
  max: number;
  defaultValue: number;
  allowNegative?: boolean;
  debounceMs?: number;
  onCommit: (n: number) => void;
}

/**
 * Text field for integer model values: supports empty / "-" while typing, debounced preview updates,
 * clamp + default on blur. Prefer over raw `type="number"` + `Number(e.target.value)`.
 */
export function DebouncedNumericTextField({
  committed,
  min,
  max,
  defaultValue,
  allowNegative,
  debounceMs,
  onCommit,
  inputProps,
  ...rest
}: DebouncedNumericTextFieldProps) {
  const { value, onChange, onFocus, onBlur, inputMode } = useDebouncedNumericDraft({
    committed,
    min,
    max,
    defaultValue,
    allowNegative,
    onCommit,
    debounceMs,
  });

  return (
    <TextField
      {...rest}
      type="text"
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      inputProps={{
        ...inputProps,
        inputMode,
        "aria-valuemin": min,
        "aria-valuemax": max,
        "aria-valuenow": committed,
      }}
    />
  );
}
