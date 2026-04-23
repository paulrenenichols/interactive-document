import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import { CHART_CREATION_KIND_LABEL } from "../../chart/chartDefaultName";
import { CHART_NAME_MAX_LENGTH } from "../../chart/chartLimits";
import type { ChartCreationKind } from "../../types/dataModel";

export type ChartBindingNameFieldHandle = {
  /** Latest draft text (not necessarily committed to parent). */
  getDraft: () => string;
};

export type ChartBindingNameFieldProps = {
  chartName: string;
  onChartNameChange: (name: string) => void;
  chartKind: ChartCreationKind;
  saveError?: string | null;
};

/**
 * Local draft for chart name so keystrokes do not lift to workspace state.
 * Commits to parent on blur; parent can read {@link ChartBindingNameFieldHandle.getDraft} before Save / Design.
 */
export const ChartBindingNameField = forwardRef<ChartBindingNameFieldHandle, ChartBindingNameFieldProps>(
  function ChartBindingNameField({ chartName, onChartNameChange, chartKind, saveError }, ref) {
    const [draft, setDraft] = useState(chartName);
    const draftRef = useRef(draft);
    draftRef.current = draft;

    useEffect(() => {
      setDraft(chartName);
    }, [chartName]);

    useImperativeHandle(ref, () => ({
      getDraft: () => draftRef.current,
    }));

    const commit = (value: string) => {
      onChartNameChange(value.slice(0, CHART_NAME_MAX_LENGTH));
    };

    return (
      <TextField
        label="Chart Name"
        value={draft}
        onChange={(e) => setDraft(e.target.value.slice(0, CHART_NAME_MAX_LENGTH))}
        onBlur={() => commit(draftRef.current)}
        inputProps={{ maxLength: CHART_NAME_MAX_LENGTH }}
        fullWidth
        size="small"
        variant="outlined"
        error={Boolean(saveError)}
        helperText={saveError ?? CHART_CREATION_KIND_LABEL[chartKind]}
        FormHelperTextProps={{ sx: { color: saveError ? undefined : "rgba(255,255,255,0.65)" } }}
        sx={{
          mt: 0.5,
          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.75)" },
          "& .MuiOutlinedInput-root": {
            color: "rgba(255,255,255,0.95)",
            bgcolor: "rgba(0,0,0,0.12)",
          },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.35)" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
          "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.75)" },
        }}
      />
    );
  },
);
