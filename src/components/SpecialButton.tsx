import ButtonComp from "./ButtonComp";
import { parseUICode } from "../rendererHelpers/translation";
import { useNavigate } from "react-router";

type ButtonProps = {
  sx?: object;
  buttonType: "cancel";
};

/**
 * A button with predefined actions based on the given buttonType string.
 */
export default function SpecialButton({ sx = {}, buttonType }: ButtonProps) {
  const navigate = useNavigate();
  let element: React.JSX.Element = null;

  switch (buttonType) {
    case "cancel":
      element = (
        <ButtonComp
          sx={{ ...sx }}
          buttonType="normal"
          onClick={() => navigate(-1)}
          ariaLabel={parseUICode("ui_aria_cancel")}
        >
          {parseUICode("ui_close")}
        </ButtonComp>
      );
      break;
    default:
      break;
  }

  return element;
}
