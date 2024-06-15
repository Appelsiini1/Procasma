import { useCallback, useRef, useState } from "react";
import { CodeAssignmentData } from "src/types";
import { debounceCheckKey } from "./debounce";

// For using the handleAssignment function
export interface HandleAssignmentFn {
  (key: string, value: any): void;
}

/**
 * Handles the state of an assignment object, and provides
 * a handleAssignment function for modifying it.
 */
export const useAssignment = (
  initialState: CodeAssignmentData
): [CodeAssignmentData, HandleAssignmentFn] => {
  const [assignment, setAssignment] =
    useState<CodeAssignmentData>(initialState);

  /**
   * A 'debounced' setAssignment hook, so that quickly
   * repeated calls to update the state of assignment will
   * continually restart a timeout, until the set delay
   * has passed.
   */
  const debouncedSetAssignment = useRef(
    debounceCheckKey(setAssignment, 300)
  ).current;

  /**
   *  Reference a nested attribute in the current assignment
   *  and modify it. Reference by a string delimited by "."
   *  characters.
   */
  const handleAssignment: HandleAssignmentFn = useCallback(
    (key, value) => {
      debouncedSetAssignment(key, (prevAssignment: CodeAssignmentData) => {
        const updatedAssignment: CodeAssignmentData = { ...prevAssignment };
        // split the key with delimiter "."
        const keys = key.split(".");
        let nestedObj: any = updatedAssignment;

        // traverse into the nested assignment state using the split key
        for (let i = 0; i < keys.length - 1; i++) {
          nestedObj = nestedObj[keys[i]] as any;
        }

        // Update the nested property with the new value
        nestedObj[keys[keys.length - 1]] = value;
        console.log("updated value");
        return updatedAssignment;
      });
    },
    [debouncedSetAssignment]
  );

  return [assignment, handleAssignment];
};
