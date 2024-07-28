import { useCallback, useRef, useState } from "react";
import { CodeAssignmentData, CourseData, ModuleData, SetData } from "../types";
import { debounceCheckKey } from "./debounce";

export interface HandleAssignmentFn {
  (key: string, value: any, debounce?: boolean): void;
}

type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

const createHandleAssignment = <T,>(
  setState: StateSetter<T>
): HandleAssignmentFn => {
  /**
   * A 'debounced' setAssignment function, so that quickly
   * repeated calls to update the state of assignment will
   * continually restart a timeout, until the set delay
   * has passed.
   */
  const debouncedSetAssignment = useRef(
    debounceCheckKey(setState, 1000)
  ).current;

  const updateNestedProperty = (
    prevAssignment: T,
    key: string,
    value: any
  ): T => {
    const updatedAssignment: T = { ...prevAssignment };
    // split the key with delimiter "."
    const keys = key.split(".");
    let nestedObj: any = updatedAssignment;

    // traverse into the nested assignment state using the split key
    for (let i = 0; i < keys.length - 1; i++) {
      nestedObj = nestedObj[keys[i]] as any;
    }

    // Update the nested property with the new value
    nestedObj[keys[keys.length - 1]] = value;
    return updatedAssignment;
  };

  /**
   *  Reference a nested attribute in the current assignment
   *  and modify it. Reference by a string delimited by "."
   *  characters. Set 'debounce' to true if handling text input
   *  to avoid input lag.
   */
  const handleAssignment: HandleAssignmentFn = useCallback(
    (key, value, debounce) => {
      if (!debounce) {
        // Use regular 'immediate' state update
        setState((prevAssignment) =>
          updateNestedProperty(prevAssignment, key, value)
        );
      } else {
        // Use debounce (should be used on text input to avoid lag)
        debouncedSetAssignment(key, (prevAssignment: T) =>
          updateNestedProperty(prevAssignment, key, value)
        );
      }
    },
    [debouncedSetAssignment]
  );

  return handleAssignment;
};

/**
 * Handles the state of an assignment object, and provides
 * a handleAssignment function for modifying it.
 */
export const useAssignment = (
  initialState: CodeAssignmentData
): [CodeAssignmentData, HandleAssignmentFn] => {
  const [assignment, setAssignment] =
    useState<CodeAssignmentData>(initialState);

  const handleAssignment = createHandleAssignment(setAssignment);

  return [assignment, handleAssignment];
};

/**
 * Handles the state of a course object, and provides
 * a handleCourse function for modifying it.
 */
export const useCourse = (
  initialState: CourseData
): [CourseData, HandleAssignmentFn] => {
  const [course, setCourse] = useState<CourseData>(initialState);

  const handleCourse = createHandleAssignment(setCourse);

  return [course, handleCourse];
};

/**
 * Handles the state of a module object, and provides
 * a handleModule function for modifying it.
 */
export const useModule = (
  initialState: ModuleData
): [ModuleData, HandleAssignmentFn] => {
  const [module, setModule] = useState<ModuleData>(initialState);

  const handleModule = createHandleAssignment(setModule);

  return [module, handleModule];
};

/**
 * Handles the state of an assignment set object, and provides
 * a handleSet function for modifying it.
 */
export const useSet = (
  initialState: SetData
): [SetData, HandleAssignmentFn] => {
  const [set, setSet] = useState<SetData>(initialState);

  const handleSet = createHandleAssignment(setSet);

  return [set, handleSet];
};
