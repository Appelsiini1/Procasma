import { createContext, useState } from "react";
import { functionResultToSnackBar, SnackBarAttributes } from "./SnackBarComp";
import { CodeAssignmentData, CourseData, ModuleData, SetData } from "../types";

export const UIContext = createContext(null);
export const ActiveObjectContext = createContext(null);

/**
 * Provides access to a global snackbar to all children
 * through useContext(UIProvider).
 */
export const UIProvider = ({ children }: { children: any }) => {
  const [pageName, setPageName] = useState(null);
  const [courseID, setCourseID] = useState(null);
  const [courseTitle, setCourseTitle] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarAttributes, setSnackBarAttributes] =
    useState<SnackBarAttributes>({ color: "info", text: "" });
  const [IPCOperationLoading, setIPCOperationLoading] = useState(true);

  function handleSnackbar(options: { [key: string]: string }) {
    functionResultToSnackBar(options, setShowSnackbar, setSnackBarAttributes);
  }

  function handleHeaderPageName(value: string) {
    setPageName(value);
  }

  function handleHeaderCourseID(value: string) {
    setCourseID(value);
  }

  function handleHeaderCourseTitle(value: string) {
    setCourseTitle(value);
  }

  function handleIPCOperationLoading(value: boolean) {
    setIPCOperationLoading(value);
  }

  return (
    <>
      <UIContext.Provider
        value={{
          pageName,
          handleHeaderPageName,
          courseID,
          handleHeaderCourseID,
          courseTitle,
          handleHeaderCourseTitle,
          snackBarAttributes,
          showSnackbar,
          setShowSnackbar,
          handleSnackbar,
          IPCOperationLoading,
          handleIPCOperationLoading,
        }}
      >
        {children}
      </UIContext.Provider>
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
