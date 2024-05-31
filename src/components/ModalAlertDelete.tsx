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
import { buttonMinWidth, language } from "../constantsUI";

export default function ModalAlertDelete({
  button,
  deleteFunction,
}: {
  button: "icon" | "normal";
  deleteFunction: () => void;
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
        {ui_delete[language.current]}
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

  function handleDelete() {
    setOpen(false);
    deleteFunction();
  }
  return (
    <>
      {buttonComponent}
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>
            <WarningRoundedIcon />
            {ui_delete[language.current]}
          </DialogTitle>
          <Divider />
          <DialogContent>{ui_confirm[language.current]}</DialogContent>
          <DialogActions>
            <Button variant="solid" color="danger" onClick={handleDelete}>
              {ui_delete[language.current]}
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => setOpen(false)}
            >
              {ui_cancel[language.current]}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
}
