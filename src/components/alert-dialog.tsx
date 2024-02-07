import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";

type Props = {
  openText: string;
  dialogText: string;
  agreeText: string;
  disagreeText: string;
  onAgree: () => void;
};

export default function AlertDialog({
  openText,
  dialogText,
  agreeText,
  disagreeText,
  onAgree,
}: Props) {
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleAgree = () => {
    onAgree();
    setOpen(false);
  };

  return (
    <>
      <Button data-cy="alert-dialog-open" onClick={handleClickOpen}>
        {openText}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{disagreeText}</Button>
          <Button
            data-cy="alert-dialog-agree"
            color="error"
            variant="contained"
            onClick={handleAgree}
            autoFocus
          >
            {agreeText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
