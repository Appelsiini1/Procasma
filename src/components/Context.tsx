import { createContext, useEffect, useState } from "react";
import { functionResultToSnackBar, SnackBarAttributes } from "./SnackBarComp";
import { CodeAssignmentData, CourseData, ModuleData, SetData } from "../types";

export const UIContext = createContext(null);
export const ActiveObjectContext = createContext(null);

/**
 * Provides access to a global snackbar and the header bar
 * attributes to all children through useContext(UIProvider).
 */
export const UIProvider = ({ children }: { children: any }) => {
  const [pageName, setPageName] = useState(null);
  const [courseID, setCourseID] = useState(null);
  const [courseTitle, setCourseTitle] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackBarAttributes, setSnackBarAttributes] =
    useState<SnackBarAttributes>({ color: "info", text: "" });
  const [IPCOperationLoading, setIPCOperationLoading] = useState(false);
  const [IPCStack, setIPCStack] = useState<Array<string>>([]);

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

  /**
   * Push or pop an IPC function name from the loading stack
   * (for monitoring currently active processes.)
   */
  function setIPCLoading(process: string, pushing: boolean) {
    if (pushing) {
      // push the process onto the stack
      setIPCStack([...IPCStack, process]);
    } else {
      // pop one matching process name
      let newStack = [...IPCStack];
      const index = newStack.indexOf(process);
      if (index !== -1) {
        newStack.splice(index, 1); // Removes one element at the found index
      }
      setIPCStack(newStack);
    }
  }

  // update the loading IPC loading indicator when the stack changes
  /*useEffect(() => {
    setIPCOperationLoading(IPCStack?.length > 0 ? true : false);
  }, [IPCStack]);*/
  useEffect(() => {
    //let timeout: NodeJS.Timeout;
    if (IPCStack.length > 0) {
      //  timeout = setTimeout(() => {
      setIPCOperationLoading(true);
      //  }, 1);
    } else {
      setIPCOperationLoading(false);
    }

    // Cleanup function to clear the timeout if IPCStack changes or component unmounts
    /*return () => {
      clearTimeout(timeout);
    };*/
  }, [IPCStack]);

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
          setIPCLoading,
          IPCStack,
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
