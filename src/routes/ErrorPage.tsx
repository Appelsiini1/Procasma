import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { error_occured_header, error_occured } from "../../resource/texts.json";

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
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = "Unknown error";
  }
  return (
    <div id="error-page">
      <h1>{error_occured_header["ENG"]}</h1>
      <p>{error_occured["ENG"]}</p>
      <p>
        <i>{errorMessage}</i>
      </p>
    </div>
  );
}
