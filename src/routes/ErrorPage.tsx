import {
  isRouteErrorResponse,
  useLocation,
  useNavigate,
  useRouteError,
} from "react-router";
import {
  error_occured_header,
  error_occured,
  ui_main,
} from "../../resource/texts.json";
import { Button } from "@mui/joy";
import HomeIcon from "@mui/icons-material/Home";
import { language } from "../globalsUI";
import LogoText from "../../resource/LogoText.png";
import log from "electron-log/renderer";

//https://github.com/remix-run/react-router/discussions/9628#discussioncomment-5555901
interface RouterError extends Error {}
function isRouterError(object: any): object is RouterError {
  return "message" in object;
}

export default function ErrorPage() {
  const error = useRouteError();
  let errorMessage;
  //https://stackoverflow.com/questions/75944820/whats-the-correct-type-for-error-in-userouteerror-from-react-router-dom
  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}`;
  } else if (error != undefined && isRouterError(error)) {
    errorMessage = error.message;
    log.error(error.message);
  } else if (typeof error === "string") {
    errorMessage = error;
    log.error(error);
  } else {
    console.error(error);
    log.error(error);
    errorMessage = "Unknown error";
  }
  const navigate = useNavigate();
  const location = useLocation();
  log.error(location.pathname);
  log.error(location.state);
  return (
    <div id="error-page" className="menuContent">
      <img src={LogoText} className="textLogo" />
      <Button
        size="lg"
        sx={{
          color: "#00000",
          backgroundColor: "#F8A866",
          "&:hover": { backgroundColor: "#F68C35" },
          marginTop: "2rem",
        }}
        startDecorator={<HomeIcon fontSize="large" />}
        onClick={() => {
          navigate("/");
        }}
      >
        {ui_main[language.current]}
      </Button>
      <h1>{error_occured_header[language.current]}</h1>
      <p>{error_occured[language.current]}</p>
      <p>
        <i>{errorMessage}</i>
      </p>
    </div>
  );
}
