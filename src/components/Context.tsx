import { createContext, useState } from "react";
import { functionResultToSnackBar, SnackBarAttributes } from "./SnackBarComp";
import {
  CodeAssignmentData,
  CodeAssignmentDatabase,
  CourseData,
  ModuleData,
  SetData,
} from "../types";

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
  const [activeAssignments, setActiveAssignments] =
    useState<Array<CodeAssignmentDatabase>>(undefined);
  const [activeModule, setActiveModule] = useState<ModuleData>(null);
  const [activeSet, setActiveSet] = useState<SetData>(null);
  const [setFromBrowse, setSetFromBrowse] = useState<boolean>(null);

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

  function handleActiveAssignments(value: CodeAssignmentDatabase[]) {
    setActiveAssignments(value);
  }
  function handleSetFromBrowse(value: boolean) {
    setSetFromBrowse(value);
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
          activeAssignments,
          handleActiveAssignments,
          activeModule,
          handleActiveModule,
          activeSet,
          handleActiveSet,
          setFromBrowse,
          handleSetFromBrowse,
        }}
      >
        {children}
      </ActiveObjectContext.Provider>
    </>
  );
};
