import Button from "@mui/joy/Button";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import IosShareIcon from "@mui/icons-material/IosShare";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

const largeNormal = {
  color: "#00000",
  backgroundColor: "#F8A866",
  "&:hover": { backgroundColor: "#F68C35" },
  padding: "0.7em 1.1em",
  fontSize: "1.4em",
} as const;

const largeAlt = {
  color: "#00000",
  backgroundColor: "#66B6F8",
  "&:hover": { backgroundColor: "#359FF6" },
  padding: "0.4em 1.1em",
  fontSize: "1.2em",
} as const;

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
    | "export";
  onClick: () => void;
  margin?: boolean;
};

export default function ButtonComp({
  children,
  buttonType,
  onClick,
  margin = false,
}: ButtonProps) {
  let style: object = null;
  let decor: JSX.Element = null;

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
    case "normal":
      style = {
        color: "#00000",
        backgroundColor: "#F8A866",
        "&:hover": { backgroundColor: "#F68C35" },
        padding: "0.1em 1.2em",
        fontSize: "1em",
      };
      decor = null;
      break;
    case "normalAlt":
      style = {
        color: "#00000",
        backgroundColor: "#66B6F8",
        "&:hover": { backgroundColor: "#359FF6" },
        padding: "0.1em 1.2em",
        fontSize: "1em",
      };
      decor = null;
      break;
    case "export":
      style = largeNormal;
      decor = <IosShareIcon sx={decorStyle} />;
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
    <Button sx={style} startDecorator={decor} onClick={onClick}>
      {children}
    </Button>
  );
}
