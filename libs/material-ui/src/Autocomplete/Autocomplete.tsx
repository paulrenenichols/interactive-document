import * as React from 'react';
import { TextField } from '../TextField';
import { Popover } from '../Popover';

export interface AutocompleteOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

export interface AutocompleteProps<T extends AutocompleteOption = AutocompleteOption> {
  /** Current value (controlled). Option object or string (freeSolo). */
  value?: T | string | null;
  /** Default value (uncontrolled) */
  defaultValue?: T | string | null;
  /** Options to suggest */
  options: T[];
  /** Callback when value changes */
  onChange?: (value: T | string | null) => void;
  /** Allow arbitrary input (free text) */
  freeSolo?: boolean;
  /** Label for the input */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Filter options (default: case-insensitive label includes input) */
  filterOptions?: (options: T[], inputValue: string) => T[];
  /** Get display string for option (default: option.label) */
  getOptionLabel?: (option: T | string) => string;
  /** Render option in list */
  renderOption?: (option: T) => React.ReactNode;
  className?: string;
  id?: string;
}

const defaultFilter = <T extends AutocompleteOption>(
  options: T[],
  inputValue: string
): T[] => {
  const q = inputValue.trim().toLowerCase();
  if (!q) return options;
  return options.filter((o) => String(o.label).toLowerCase().includes(q));
};

export function Autocomplete<T extends AutocompleteOption = AutocompleteOption>({
  value: valueProp,
  defaultValue,
  options,
  onChange,
  freeSolo = false,
  label,
  placeholder = 'Type to search…',
  disabled = false,
  fullWidth = false,
  filterOptions = defaultFilter,
  getOptionLabel = (o) => (typeof o === 'string' ? o : (o as T).label),
  renderOption = (o) => (o as T).label,
  className = '',
  id: idProp,
}: AutocompleteProps<T>) {
  const id = React.useId();
  const inputId = idProp ?? id;
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [internalValue, setInternalValue] = React.useState<T | string | null>(
    () => valueProp ?? defaultValue ?? null
  );
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;

  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open && anchorRef.current) setAnchorEl(anchorRef.current);
    else if (!open) setAnchorEl(null);
  }, [open]);

  const filtered = React.useMemo(
    () => filterOptions(options, inputValue),
    [options, inputValue, filterOptions]
  );

  React.useEffect(() => {
    if (value != null) setInputValue(getOptionLabel(value));
  }, [value, getOptionLabel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    setOpen(true);
    if (freeSolo) {
      if (!isControlled) setInternalValue(v);
      onChange?.(v);
    }
  };

  const handleSelect = (option: T) => {
    if (!isControlled) setInternalValue(option);
    onChange?.(option);
    setInputValue(getOptionLabel(option));
    setOpen(false);
  };

  const handleBlur = () => {
    setOpen(false);
    if (value != null) setInputValue(getOptionLabel(value));
    else setInputValue('');
  };

  return (
    <div ref={anchorRef} className={fullWidth ? 'w-full' : ''}>
      <TextField
        id={inputId}
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        disabled={disabled}
        fullWidth={fullWidth}
        className={className}
        autoComplete="off"
      />
      <Popover
        open={open && filtered.length > 0}
        onClose={() => setOpen(false)}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin="top left"
      >
        <ul
          role="listbox"
          className="min-w-[var(--anchor-width, 12rem)] max-h-60 overflow-auto rounded-radius-medium border border-border-default bg-bg-primary py-1 shadow-lg dark:border-border-default dark:bg-bg-primary"
          style={
            anchorEl
              ? { minWidth: anchorEl.getBoundingClientRect().width }
              : undefined
          }
        >
          {filtered.map((option, idx) => (
            <li
              key={String((option as T).value ?? idx)}
              role="option"
              aria-selected={value === option}
              onClick={() => handleSelect(option)}
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-text-primary transition-colors hover:bg-bg-secondary dark:text-text-primary dark:hover:bg-bg-secondary"
            >
              {renderOption(option)}
            </li>
          ))}
        </ul>
      </Popover>
    </div>
  );
}

Autocomplete.displayName = 'Autocomplete';
