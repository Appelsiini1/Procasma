import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import DialogActions from "@mui/joy/DialogActions";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import DeleteForever from "@mui/icons-material/DeleteForever";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { useState } from "react";
import { IconButton } from "@mui/joy";
import { ui_delete, ui_confirm, ui_cancel } from "../../resource/texts.json";
import { buttonMinWidth } from "../constants";

export default function ModalAlertDelete({
  button,
  language,
}: {
  button: "icon" | "normal";
  language: keyof typeof ui_delete;
}) {
  const [open, setOpen] = useState<boolean>(false);
  let buttonComponent: JSX.Element = null;
  if (button === "normal") {
    buttonComponent = (
      <Button
        variant="outlined"
        color="danger"
        endDecorator={<DeleteForever />}
        onClick={() => setOpen(true)}
        sx={{
          padding: "0.1em 1.2em",
          fontSize: "1em",
          minWidth: buttonMinWidth,
        }}
      >
        {ui_delete[language]}
      </Button>
    );
  } else {
    buttonComponent = (
      <IconButton
        variant="outlined"
        color="danger"
        onClick={() => setOpen(true)}
      >
        <DeleteForever />
      </IconButton>
    );
  }
  return (
    <>
      {buttonComponent}
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>
            <WarningRoundedIcon />
            {ui_delete[language]}
          </DialogTitle>
          <Divider />
          <DialogContent>{ui_confirm[language]}</DialogContent>
          <DialogActions>
            <Button
              variant="solid"
              color="danger"
              onClick={() => setOpen(false)}
            >
              {ui_delete[language]}
            </Button>
            <Button
              variant="plain"
              color="neutral"
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
