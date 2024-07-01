import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import DialogActions from "@mui/joy/DialogActions";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ui_ok } from "../../resource/texts.json";
import { language } from "../globalsUI";

export default function ModalPopup({
  open,
  setOpen,
  header,
  content,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  header: string;
  content: string;
}) {
  return (
    <>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>
            <InfoOutlinedIcon />
            {header}
          </DialogTitle>
          <Divider />
          <DialogContent>{content}</DialogContent>
          <DialogActions>
            <Button
              variant="solid"
              sx={{
                color: "#00000",
                backgroundColor: "#66B6F8",
                "&:hover": { backgroundColor: "#359FF6" },
              }}
              onClick={() => setOpen(false)}
            >
              {ui_ok[language.current]}
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
}
