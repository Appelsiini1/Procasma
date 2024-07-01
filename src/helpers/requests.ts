import { CodeAssignmentData } from "../types";

export const getAssignments = async (activePath: string) => {
  try {
    const assignments: CodeAssignmentData[] = await window.api.getAssignments(
      activePath
    );

    if (!assignments) {
      throw new Error("no assignments");
    }

    return assignments;
  } catch (error) {
    console.error(error);
  }
  return null;
};
