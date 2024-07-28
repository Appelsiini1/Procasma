import { createContext, useState } from "react";
import SnackbarComp, {
  functionResultToSnackBar,
  SnackBarAttributes,
} from "./SnackBarComp";

export const SnackbarContext = createContext(null);

// Create a provider component
export const SnackbarProvider = ({ children }: { children: any }) => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarAttributes, setSnackBarAttributes] =
    useState<SnackBarAttributes>({ color: "success", text: "default" });

  function handleSnackbar(options: { [key: string]: string }) {
    functionResultToSnackBar(options, setShowSnackbar, setSnackBarAttributes);
  }

  return (
    <>
      <SnackbarContext.Provider value={{ handleSnackbar }}>
        {children}
      </SnackbarContext.Provider>
      {showSnackbar ? (
        <SnackbarComp
          text={snackBarAttributes.text}
          color={snackBarAttributes.color}
          setShowSnackbar={setShowSnackbar}
        ></SnackbarComp>
      ) : null}
    </>
  );
};
