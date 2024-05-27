import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import DialogActions from "@mui/joy/DialogActions";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";
import { useState } from "react";
import {
  ui_ok,
  ui_confirm,
  ui_cancel,
  ui_confirm_header,
} from "../../resource/texts.json";
import { buttonMinWidth } from "../constantsUI";

export default function ModalConfirm({
  language,
}: {
  language: keyof typeof ui_ok;
}) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <Button
        variant="solid"
        sx={{
          color: "#00000",
          backgroundColor: "#F8A866",
          "&:hover": { backgroundColor: "#F68C35" },
          padding: "0.1em 1.2em",
          fontSize: "1em",
          minWidth: buttonMinWidth,
        }}
        onClick={() => setOpen(true)}
      >
        {ui_ok[language]}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>
            <ThumbsUpDownIcon />
            {ui_confirm_header[language]}
          </DialogTitle>
          <Divider />
          <DialogContent>{ui_confirm[language]}</DialogContent>
          <DialogActions>
            <Button
              variant="solid"
              color="success"
              sx={{ minWidth: buttonMinWidth }}
              onClick={() => setOpen(false)}
            >
              {ui_ok[language]}
            </Button>
            <Button
              variant="plain"
              color="neutral"
              sx={{ minWidth: buttonMinWidth }}
              onClick={() => setOpen(false)}
            >
              {ui_cancel[language]}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
}
