import { Modal, ModalClose, ModalDialog, Typography } from "@mui/joy";
import ButtonComp from "./ButtonComp";
import { parseUICode } from "../rendererHelpers/translation";

type ModalConfirmationProps = {
  open: boolean;
  close: () => void;
  confirmFunction: () => void;
  text: string;
};

export default function ModalConfirmation({
  open,
  close,
  confirmFunction,
  text,
}: ModalConfirmationProps) {
  return (
    <>
      <Modal open={open} onClose={() => close()} aria-labelledby="modal-title">
        <ModalDialog>
          <ModalClose />
          <Typography id="modal-title">{parseUICode("ui_confirm")}</Typography>
          <ButtonComp
            buttonType="delete"
            onClick={() => {
              confirmFunction();
              close();
            }}
            ariaLabel={parseUICode("ui_confirm")}
          >
            {text}
          </ButtonComp>
        </ModalDialog>
      </Modal>
    </>
  );
}
