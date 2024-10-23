import {
  Snackbar,
  SnackbarCloseReason as SnackbarCloseReasonType,
} from "@mui/joy";
import { useEffect, useState } from "react";
import texts from "../../resource/texts.json";
import { language } from "../globalsUI";

export interface SnackBarAttributes {
  color: string;
  text: string;
}

/**
 * Takes an object with a severity key and text value
 * and activates a snackbar.
 */
export function functionResultToSnackBar(
  result: {
    error?: string;
    success?: string;
    info?: string;
    action?: string;
  },
  setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>,
  setSnackBarAttributes: React.Dispatch<
    React.SetStateAction<SnackBarAttributes>
  >
) {
  // results.success|error contains the key to the message
  if (result?.error) {
    const saveErrorMsg = (texts as any)?.[result.error]?.[language.current];
    setShowSnackbar(true);
    setSnackBarAttributes({
      color: "danger",
      text: saveErrorMsg ? saveErrorMsg : result.error,
    });
  }

  if (result?.success) {
    const saveSuccessMsg = (texts as any)?.[result.success]?.[language.current];
    setShowSnackbar(true);
    setSnackBarAttributes({
      color: "success",
      text: saveSuccessMsg ? saveSuccessMsg : result.success,
    });
  }

  if (result?.info) {
    const saveSuccessMsg = (texts as any)?.[result.info]?.[language.current];
    setShowSnackbar(true);
    setSnackBarAttributes({
      color: "neutral",
      text: saveSuccessMsg ? saveSuccessMsg : result.info,
    });
  }

  if (result?.action) {
    const saveSuccessMsg = (texts as any)?.[result.action]?.[language.current];
    setShowSnackbar(true);
    setSnackBarAttributes({
      color: "primary",
      text: saveSuccessMsg ? saveSuccessMsg : result.action,
    });
  }
}

export default function SnackbarComp({
  text,
  color,
  setShowSnackbar,
}: {
  text: string;
  color?: string;
  setShowSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [open, setOpen] = useState(true);
  const [reasons, setReasons] = useState<SnackbarCloseReasonType[]>([]);

  useEffect(() => {
    if (
      (["timeout", "clickaway"] as const).every((item) =>
        reasons.includes(item)
      )
    ) {
      setOpen(false);
    }
  }, [reasons]);

  const vertical = "bottom";
  const horizontal = "center";

  return (
    <Snackbar
      autoHideDuration={color === "primary" ? null : 3000}
      anchorOrigin={{ vertical, horizontal }}
      open={open}
      onClose={(event, reason) => {
        if (color === "primary") return;
        setReasons((prev) => [...new Set([...prev, reason])]);
      }}
      onUnmount={() => {
        setShowSnackbar(false);
        setReasons([]);
      }}
      key={text}
      color={color as any}
      variant="soft"
      size="lg"
    >
      {text}
    </Snackbar>
  );
}
