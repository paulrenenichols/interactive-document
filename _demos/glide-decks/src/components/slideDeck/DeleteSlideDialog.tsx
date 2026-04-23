import { useState } from "react";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import { readSkipDeleteSlideConfirm, writeSkipDeleteSlideConfirm } from "../../utils/slideDeckDeleteSlidePreference";

export interface DeleteSlideDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteSlideDialog({ open, onClose, onConfirm }: DeleteSlideDialogProps) {
  const [dontAsk, setDontAsk] = useState(() => readSkipDeleteSlideConfirm());

  const handleConfirm = () => {
    if (dontAsk) writeSkipDeleteSlideConfirm(true);
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Delete slide?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          This will remove the slide from the deck. This action cannot be undone.
        </Typography>
        <FormControlLabel
          sx={{ mt: 2, alignItems: "flex-start" }}
          control={
            <Checkbox
              checked={dontAsk}
              onChange={(_, c) => setDontAsk(c)}
              size="small"
            />
          }
          label={"Don't ask me again"}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} color="error" variant="contained" disableElevation>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
