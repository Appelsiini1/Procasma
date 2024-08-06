import { CodeAssignmentData } from "../types";

export function isExpanding(assignment: CodeAssignmentData) {
  if (assignment.next?.length > 0 || assignment.previous?.length > 0) {
    return true;
  }
  return false;
}
