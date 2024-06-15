import { useState } from "react";
import { CodeAssignmentData } from "src/types";

// For using the handleAssignment function
export interface HandleAssignmentFn {
  (key: string, value: any): void;
}

export const useAssignment = (
  initialState: CodeAssignmentData
): [CodeAssignmentData, HandleAssignmentFn] => {
  const [assignment, setAssignment] =
    useState<CodeAssignmentData>(initialState);

  /**
   *  Reference a nested attribute in the current assignment
   *  and modify it. Reference by a string delimited by "."
   *  characters.
   */
  const handleAssignment: HandleAssignmentFn = (key, value) => {
    setAssignment((prevAssignment: CodeAssignmentData) => {
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
      return updatedAssignment;
    });
  };

  return [assignment, handleAssignment];
};
