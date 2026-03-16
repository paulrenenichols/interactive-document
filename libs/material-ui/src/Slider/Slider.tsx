import * as React from 'react';

export interface SliderProps {
  /** Current value (controlled). Single number or [min, max] for range. */
  value?: number | number[];
  /** Default value (uncontrolled) */
  defaultValue?: number | number[];
  /** Min value */
  min?: number;
  /** Max value */
  max?: number;
  /** Step (e.g. 1 for integers, 0.1 for decimals) */
  step?: number;
  /** Show value label near thumb */
  valueLabelDisplay?: 'auto' | 'on' | 'off';
  /** Callback when value changes */
  onChange?: (value: number | number[]) => void;
  /** Range mode: two thumbs */
  range?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value: valueProp,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      valueLabelDisplay = 'auto',
      onChange,
      range = false,
      disabled = false,
      className = '',
      id,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const defaultVal = defaultValue ?? (range ? [min, max] : min);
    const [internalValue, setInternalValue] = React.useState<number | number[]>(() =>
      valueProp !== undefined ? valueProp : defaultVal
    );
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : internalValue;

    const single = Array.isArray(value) ? value[0] : value;
    const low = Array.isArray(value) ? value[0] : value;
    const high = Array.isArray(value) ? value[1] : max;

    const update = React.useCallback(
      (next: number | number[]) => {
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [isControlled, onChange]
    );

    const pct = (v: number) => ((v - min) / (max - min)) * 100;
    const showLabel = valueLabelDisplay === 'on' || valueLabelDisplay === 'auto';

    const trackClass =
      'absolute top-1/2 -translate-y-1/2 h-1.5 w-full rounded-radius-full bg-bg-secondary dark:bg-bg-secondary';
    const fillClass =
      'absolute top-1/2 -translate-y-1/2 h-1.5 rounded-radius-full bg-accent-primary dark:bg-accent-primary pointer-events-none';
    const thumbClass =
      'absolute top-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-radius-full border-2 border-accent-primary dark:border-accent-primary bg-white dark:bg-bg-primary shadow-sm ' +
      'focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 cursor-grab active:cursor-grabbing ' +
      (disabled ? 'opacity-50 pointer-events-none' : '');

    if (range) {
      const handleLow = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = clamp(Number(e.target.value), min, high);
        update([v, high]);
      };
      const handleHigh = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = clamp(Number(e.target.value), low, max);
        update([low, v]);
      };
      return (
        <div
          ref={ref}
          id={id}
          role="group"
          aria-label={ariaLabel}
          className={`relative w-full select-none pt-6 ${className}`.trim()}
        >
          <div className="relative h-5 w-full">
            <div className={trackClass} />
            <div
              className={fillClass}
              style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
            />
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={low}
              disabled={disabled}
              onChange={handleLow}
              className="absolute w-full h-5 opacity-0 cursor-pointer top-1/2 -translate-y-1/2"
              aria-valuemin={min}
              aria-valuemax={high}
              aria-valuenow={low}
            />
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={high}
              disabled={disabled}
              onChange={handleHigh}
              className="absolute w-full h-5 opacity-0 cursor-pointer top-1/2 -translate-y-1/2"
              aria-valuemin={low}
              aria-valuemax={max}
              aria-valuenow={high}
            />
            <span
              className={`absolute left-0 w-5 h-5 -translate-y-1/2 pointer-events-none ${thumbClass}`}
              style={{ left: `calc(${pct(low)}% - 10px)` }}
            />
            <span
              className={`absolute left-0 w-5 h-5 -translate-y-1/2 pointer-events-none ${thumbClass}`}
              style={{ left: `calc(${pct(high)}% - 10px)` }}
            />
          </div>
          {showLabel && (
            <div className="flex justify-between mt-1 text-xs text-text-muted dark:text-text-muted">
              <span>{low}</span>
              <span>{high}</span>
            </div>
          )}
        </div>
      );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = clamp(Number(e.target.value), min, max);
      update(v);
    };

    return (
      <div
        ref={ref}
        id={id}
        role="group"
        aria-label={ariaLabel}
        className={`relative w-full select-none pt-6 ${className}`.trim()}
      >
        <div className="relative h-5 w-full">
          <div className={trackClass} />
          <div
            className={fillClass}
            style={{ left: 0, right: `${100 - pct(single)}%` }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={single}
            disabled={disabled}
            onChange={handleChange}
            className="absolute w-full h-5 opacity-0 cursor-pointer top-1/2 -translate-y-1/2"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={single}
          />
          <span
            className={`absolute left-0 w-5 h-5 -translate-y-1/2 pointer-events-none ${thumbClass}`}
            style={{ left: `calc(${pct(single)}% - 10px)` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-xs text-text-muted dark:text-text-muted text-center">
            {single}
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';
