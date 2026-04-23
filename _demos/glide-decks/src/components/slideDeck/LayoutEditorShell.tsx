import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useSlideDeck } from "../../data/SlideDeckContext";
import type { SlideDeckLayout } from "../../types/slideDeck";
import { fontHeadline, precisionLedgerColors } from "../../slideDeck/precisionLedgerUi";
import { validateLayoutName } from "../../slideDeck/validateLayoutName";

export interface LayoutEditorShellProps {
  layout: SlideDeckLayout;
}

/** Layout metadata + element summary; editable layout name (unique per theme). */
export function LayoutEditorShell({ layout }: LayoutEditorShellProps) {
  const { layouts, updateLayout } = useSlideDeck();
  const [draft, setDraft] = useState(layout.name);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(layout.name);
    setError(null);
  }, [layout.id, layout.name]);

  const commitName = () => {
    const v = validateLayoutName(layouts, layout.theme_id, layout.id, draft);
    if (!v.ok) {
      setError(v.error);
      return;
    }
    const ok = updateLayout(layout.id, { name: draft });
    if (!ok) {
      setError("Could not save layout name.");
      return;
    }
    setError(null);
  };

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
        bgcolor: precisionLedgerColors.surfaceContainerLowest,
      }}
    >
      <TextField
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setError(null);
        }}
        onBlur={commitName}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          } else if (e.key === "Escape") {
            e.preventDefault();
            setDraft(layout.name);
            setError(null);
            (e.target as HTMLInputElement).blur();
          }
        }}
        error={Boolean(error)}
        helperText={error ?? " "}
        fullWidth
        size="small"
        label="Layout name"
        sx={{
          mb: 1,
          "& .MuiInputBase-input": {
            fontFamily: fontHeadline,
            fontSize: "1.5rem",
            fontWeight: 700,
            color: precisionLedgerColors.onSurface,
          },
        }}
      />
      {layout.description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {layout.description}
        </Typography>
      ) : null}
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Layout elements ({layout.elements.length})
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        {layout.elements.map((el) => (
          <Typography key={el.id} component="li" variant="body2" color="text.secondary">
            {el.element_type}
            {el.placeholder_role ? ` · ${el.placeholder_role}` : ""}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
