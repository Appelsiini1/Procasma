import { Modal, ModalClose, ModalDialog, Typography } from "@mui/joy";
import ButtonComp from "./ButtonComp";
import texts from "../../resource/texts.json";
import { language } from "../globalsUI";

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
          <Typography id="modal-title">
            {texts.ui_confirm[language.current]}
          </Typography>
          <ButtonComp
            buttonType="delete"
            onClick={() => {
              confirmFunction();
              close();
            }}
            ariaLabel={texts.ui_confirm[language.current]}
          >
            {text}
          </ButtonComp>
        </ModalDialog>
      </Modal>
    </>
  );
}
