import { createContext, useState } from "react";
import SnackbarComp, {
  functionResultToSnackBar,
  SnackBarAttributes,
} from "./SnackBarComp";
import { CodeAssignmentData, CourseData, ModuleData, SetData } from "../types";

export const SnackbarContext = createContext(null);
export const ActiveObjectContext = createContext(null);

/**
 * Provides access to a global snackbar to all children
 * through useContext(SnackbarProvider).
 */
export const SnackbarProvider = ({ children }: { children: any }) => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarAttributes, setSnackBarAttributes] =
    useState<SnackBarAttributes>({ color: "info", text: "" });

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

/**
 * Provides access to active course, assignment and
 * other similar global states for all children
 * through useContext(ActiveObjectContext).
 */
export const ActiveObjectProvider = ({ children }: { children: any }) => {
  const [activeCourse, setActiveCourse] = useState<CourseData>(null);
  const [activePath, setActivePath] = useState<string>(null);
  const [activeAssignment, setActiveAssignment] =
    useState<CodeAssignmentData>(null);
  const [activeModule, setActiveModule] = useState<ModuleData>(null);
  const [activeSet, setActiveSet] = useState<SetData>(null);

  function handleActiveCourse(value: CourseData) {
    setActiveCourse(value);
  }

  function handleActivePath(value: string) {
    setActivePath(value);
  }

  function handleActiveAssignment(value: CodeAssignmentData) {
    setActiveAssignment(value);
  }

  function handleActiveModule(value: ModuleData) {
    setActiveModule(value);
  }

  function handleActiveSet(value: SetData) {
    setActiveSet(value);
  }

  return (
    <>
      <ActiveObjectContext.Provider
        value={{
          activeCourse,
          handleActiveCourse,
          activePath,
          handleActivePath,
          activeAssignment,
          handleActiveAssignment,
          activeModule,
          handleActiveModule,
          activeSet,
          handleActiveSet,
        }}
      >
        {children}
      </ActiveObjectContext.Provider>
    </>
  );
};
