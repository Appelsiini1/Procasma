import Button from "@mui/joy/Button";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import IosShareIcon from "@mui/icons-material/IosShare";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { useState } from "react";
import {
  buttonMinWidth,
  largeButtonMinWidth,
  buttonShadow,
} from "../constantsUI";
import ModalConfirmation from "./ModalConfirmation";

const largeNormal = {
  color: "#00000",
  backgroundColor: "#F8A866",
  "&:hover": { backgroundColor: "#F68C35" },
  padding: "0.7em 1.1em",
  fontSize: "1.4em",
  minWidth: largeButtonMinWidth,
  boxShadow: buttonShadow,
} as const;

const largeAlt = {
  color: "#00000",
  backgroundColor: "#66B6F8",
  "&:hover": { backgroundColor: "#359FF6" },
  padding: "0.4em 1.1em",
  fontSize: "1.2em",
  minWidth: largeButtonMinWidth,
  boxShadow: buttonShadow,
} as const;

const smallWarning = {
  color: "#00000",
  backgroundColor: "#F97583",
  "&:hover": { backgroundColor: "#f7283d" },
  padding: "0.1em 1.2em",
  fontSize: "1em",
  minWidth: buttonMinWidth,
  boxShadow: buttonShadow,
  //height: "100%",
} as const;

const normalAlt = {
  color: "#00000",
  backgroundColor: "#66B6F8",
  "&:hover": { backgroundColor: "#359FF6" },
  padding: "0.1em 1.2em",
  fontSize: "1em",
  minWidth: buttonMinWidth,
  boxShadow: buttonShadow,
};

const normal = {
  color: "#00000",
  backgroundColor: "#F8A866",
  "&:hover": { backgroundColor: "#F68C35" },
  padding: "0.1em 1.2em",
  fontSize: "1em",
  minWidth: buttonMinWidth,
  boxShadow: buttonShadow,
};

const grey = {
  color: "#00000",
  backgroundColor: "#aaaaaa",
  "&:hover": { backgroundColor: "#F68C35" },
  padding: "0.1em 1.2em",
  fontSize: "1em",
  minWidth: buttonMinWidth,
  boxShadow: buttonShadow,
};

const decorStyle = { fontSize: "1.4em" };

type ButtonProps = {
  children: React.ReactNode;
  buttonType:
    | "largeAdd"
    | "settings"
    | "setManage"
    | "manage"
    | "openCourse"
    | "createCourse"
    | "addAssignment"
    | "normal"
    | "normalAlt"
    | "export"
    | "delete"
    | "largeAddAlt"
    | "starAlt"
    | "algorithm"
    | "grey"
    | "import";
  onClick: () => void;
  margin?: boolean;
  confirmationModal?: boolean;
  modalText?: string;
  ariaLabel: string;
  disabled?: boolean;
};

export default function ButtonComp({
  children,
  buttonType,
  onClick,
  margin = false,
  confirmationModal = false,
  modalText = "",
  ariaLabel,
  disabled = false,
}: ButtonProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  let style: object = null;
  let decor: React.JSX.Element = null;

  switch (buttonType) {
    case "largeAdd":
      style = largeNormal;
      decor = <AddIcon sx={decorStyle} />;
      break;
    case "settings":
      style = largeNormal;
      decor = <SettingsIcon sx={decorStyle} />;
      break;
    case "setManage":
      style = largeNormal;
      decor = <AutoAwesomeMotionIcon sx={decorStyle} />;
      break;
    case "manage":
      style = largeNormal;
      decor = <AppRegistrationIcon sx={decorStyle} />;
      break;
    case "openCourse":
      style = largeNormal;
      decor = <FolderOpenIcon sx={decorStyle} />;
      break;
    case "createCourse":
      style = largeNormal;
      decor = <CreateNewFolderIcon sx={decorStyle} />;
      break;
    case "addAssignment":
      style = largeAlt;
      decor = <AddIcon sx={decorStyle} />;
      break;
    case "delete":
      style = smallWarning;
      decor = <DeleteIcon sx={decorStyle} />;
      break;
    case "normal":
      style = normal;
      decor = null;
      break;
    case "normalAlt":
      style = normalAlt;
      decor = null;
      break;
    case "export":
      style = largeNormal;
      decor = <IosShareIcon sx={decorStyle} />;
      break;
    case "largeAddAlt":
      style = largeAlt;
      decor = <AddIcon sx={decorStyle} />;
      break;
    case "starAlt":
      style = normalAlt;
      decor = <StarIcon sx={decorStyle} />;
      break;
    case "algorithm":
      style = normal;
      decor = <AutoFixNormalIcon sx={decorStyle} />;
      break;
    case "grey":
      style = grey;
      decor = null;
      break;
    case "import":
      style = normal;
      decor = <SaveAltIcon sx={decorStyle} />;
      break;
    default:
      break;
  }

  if (margin) {
    style = {
      ...style,
      marginLeft: "0.8em",
    };
  }

  return (
    <>
      {!confirmationModal ? (
        <Button
          sx={style}
          startDecorator={decor}
          onClick={onClick}
          aria-label={ariaLabel}
          disabled={disabled}
        >
          {children}
        </Button>
      ) : (
        <>
          <Button
            sx={style}
            startDecorator={decor}
            onClick={() => setModalOpen(true)}
            aria-label={ariaLabel}
            disabled={disabled}
          >
            {children}
          </Button>
          <ModalConfirmation
            open={modalOpen}
            close={() => setModalOpen(false)}
            confirmFunction={onClick}
            text={modalText}
          ></ModalConfirmation>
        </>
      )}
    </>
  );
}
